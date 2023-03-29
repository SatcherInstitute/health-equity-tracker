import pandas as pd  # type: ignore

from ingestion.standardized_columns import Race
import ingestion.standardized_columns as std_col

from datasources.data_source import DataSource
from ingestion import gcs_to_bq_util
from ingestion.merge_utils import (
    merge_pop_numbers)

from ingestion.constants import (
    Sex,
    NATIONAL_LEVEL,
    US_FIPS,
    US_NAME,
    RACE,
    AGE,
    SEX,
    UNKNOWN)


CDC_SEX_GROUPS_TO_STANDARD = {
    'Sex_Female': Sex.FEMALE,
    'Sex_Male': Sex.MALE,
    'Sex_unknown': 'Unknown',
    'US': std_col.ALL_VALUE,
}

CDC_RACE_GROUPS_TO_STANDARD = {
    'Race_eth_Hispanic': Race.HISP.value,
    'Race_eth_NHAIAN': Race.AIAN_NH.value,
    'Race_eth_NHAsian': Race.ASIAN_NH.value,
    'Race_eth_NHBlack': Race.BLACK_NH.value,
    'Race_eth_NHMult_Oth': Race.MULTI_OR_OTHER_STANDARD_NH.value,
    'Race_eth_NHNHOPI': Race.NHPI_NH.value,
    'Race_eth_NHWhite': Race.WHITE_NH.value,
    'Race_eth_unknown': Race.UNKNOWN.value,
    'US': Race.ALL.value,
}

CDC_AGE_GROUPS_TO_STANDARD = {
    'Ages_<2yrs': '0-1',
    'Ages_2-4_yrs': '2-4',
    'Ages_5-11_yrs': '5-11',
    'Ages_12-17_yrs': '12-17',
    'Ages_18-24_yrs': '18-24',
    'Ages_25-49_yrs': '25-49',
    'Ages_50-64_yrs': '50-64',
    'Ages_65+_yrs': '65+',
    'Age_unknown': 'Unknown',
    'US': std_col.ALL_VALUE,
}


# The CDC uses age ranges that we can not calculate with the given acs data,
# and they don't publish these population numbers directly anywhere, so I am
# taking the population percentages directly off of the chart here:
# https://covid.cdc.gov/covid-data-tracker/#vaccination-demographic
AGE_GROUPS_TO_POP_PCT = {
    '0-1': '2.3',
    '2-4': '3.6',
    '5-11': '8.7',
    '12-17': '7.6',
    '18-24': '9.2',
    '25-49': '32.9',
    '50-64': '19.2',
    '65+': '16.5',
    std_col.ALL_VALUE: '100',
}

BREAKDOWN_MAP = {
    RACE: CDC_RACE_GROUPS_TO_STANDARD,
    SEX: CDC_SEX_GROUPS_TO_STANDARD,
    AGE: CDC_AGE_GROUPS_TO_STANDARD,
}

ALLS = {std_col.ALL_VALUE, Race.ALL.value}

BASE_CDC_URL = "https://data.cdc.gov/resource/km4m-vcsb.json"


class CDCVaccinationNational(DataSource):

    @staticmethod
    def get_id():
        return 'CDC_VACCINATION_NATIONAL'

    @staticmethod
    def get_table_name():
        return 'cdc_vaccination_national'

    def upload_to_gcs(self, _, **attrs):
        raise NotImplementedError(
            'upload_to_gcs should not be called for CDCVaccinationNational')

    def write_to_bq(self, dataset, gcs_bucket, **attrs):
        df = gcs_to_bq_util.load_json_as_df_from_web(
            BASE_CDC_URL,
            dtype={'administered_dose1_pct': float, 'population_pct': str}
        )

        latest_date = df['date'].max()
        df = df.loc[df['date'] == latest_date]

        for breakdown in [RACE, SEX, AGE]:
            breakdown_df = self.generate_breakdown(breakdown, df)

            float_cols = [std_col.VACCINATED_PER_100K,
                          std_col.VACCINATED_PCT_SHARE,
                          std_col.VACCINATED_POP_PCT]

            col_types = gcs_to_bq_util.get_bq_column_types(breakdown_df, float_cols)

            gcs_to_bq_util.add_df_to_bq(
                breakdown_df, dataset, f'{breakdown}_processed', column_types=col_types)

    def generate_breakdown(self, breakdown, df):
        demo_col = std_col.RACE_CATEGORY_ID_COL if breakdown == RACE else breakdown
        unknown = Race.UNKNOWN.value if breakdown == RACE else UNKNOWN

        df = df.rename(columns={'demographic_category': demo_col})

        demo_rows = set(BREAKDOWN_MAP[breakdown].keys())
        df = df.loc[df[demo_col].isin(demo_rows)].reset_index(drop=True)
        df = df.replace(BREAKDOWN_MAP[breakdown])

        known_df = df.loc[df[demo_col] != unknown].reset_index(drop=True)
        unknown_df = df.loc[df[demo_col] == unknown].reset_index(drop=True)

        known_df = known_df.rename(columns={'administered_dose1_pct_known': std_col.VACCINATED_PCT_SHARE})
        unknown_df = unknown_df.rename(columns={'administered_dose1_pct_us': std_col.VACCINATED_PCT_SHARE})
        df = pd.concat([known_df, unknown_df])

        df[std_col.VACCINATED_PER_100K] = df['administered_dose1_pct'].apply(calc_per_100k)

        df.loc[df[demo_col].isin(ALLS), std_col.VACCINATED_PCT_SHARE] = 100.0

        if breakdown == AGE:
            df[std_col.VACCINATED_POP_PCT] = df[demo_col].map(AGE_GROUPS_TO_POP_PCT)
        else:
            df = merge_pop_numbers(df, breakdown, NATIONAL_LEVEL)
            df = df.rename(columns={std_col.POPULATION_PCT_COL: std_col.VACCINATED_POP_PCT})

        df[std_col.STATE_FIPS_COL] = US_FIPS
        df[std_col.STATE_NAME_COL] = US_NAME

        df = df[[std_col.STATE_NAME_COL, std_col.STATE_FIPS_COL, demo_col,
                 std_col.VACCINATED_PCT_SHARE, std_col.VACCINATED_POP_PCT,
                 std_col.VACCINATED_PER_100K]]

        if breakdown == RACE:
            std_col.add_race_columns_from_category_id(df)

        return df


def calc_per_100k(pct_value):
    return pct_value * 1000 if not pd.isnull(pct_value) else None
