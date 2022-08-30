import pandas as pd  # type: ignore

from ingestion.standardized_columns import Race
import ingestion.standardized_columns as std_col

from datasources.data_source import DataSource
from ingestion import gcs_to_bq_util
from ingestion.constants import Sex


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
CDC_AGE_GROUPS_TO_POP_PCT = {
    'Ages_<2yrs': '2.3',
    'Ages_2-4_yrs': '3.6',
    'Ages_5-11_yrs': '8.7',
    'Ages_12-17_yrs': '7.6',
    'Ages_18-24_yrs': '9.2',
    'Ages_25-49_yrs': '32.9',
    'Ages_50-64_yrs': '19.2',
    'Ages_65+_yrs': '16.5',
    'US': '100',
}

BREAKDOWN_MAP = {
    'race_and_ethnicity': CDC_RACE_GROUPS_TO_STANDARD,
    'sex': CDC_SEX_GROUPS_TO_STANDARD,
    'age': CDC_AGE_GROUPS_TO_STANDARD,
}

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

        for breakdown in [std_col.RACE_OR_HISPANIC_COL, std_col.SEX_COL, std_col.AGE_COL]:
            breakdown_df = self.generate_breakdown(breakdown, df)

            column_types = {c: 'STRING' for c in breakdown_df.columns}
            column_types[std_col.VACCINATED_FIRST_DOSE] = 'INT64'
            column_types[std_col.VACCINATED_PER_100K] = 'FLOAT'
            column_types[std_col.VACCINATED_SHARE_OF_KNOWN] = 'FLOAT'

            if std_col.RACE_INCLUDES_HISPANIC_COL in breakdown_df.columns:
                column_types[std_col.RACE_INCLUDES_HISPANIC_COL] = 'BOOL'

            gcs_to_bq_util.add_df_to_bq(
                breakdown_df, dataset, breakdown, column_types=column_types)

    def generate_breakdown(self, breakdown, df):
        output = []

        columns = [
            std_col.STATE_NAME_COL,
            std_col.STATE_FIPS_COL,
            std_col.VACCINATED_FIRST_DOSE,
            std_col.VACCINATED_SHARE_OF_KNOWN,
            std_col.VACCINATED_PER_100K,
        ]

        if breakdown == std_col.RACE_OR_HISPANIC_COL:
            columns.append(std_col.RACE_CATEGORY_ID_COL)
        else:
            columns.append(breakdown)

        if breakdown == std_col.AGE_COL:
            columns.append(std_col.POPULATION_PCT_COL)

        for cdc_group, standard_group in BREAKDOWN_MAP[breakdown].items():
            output_row = {}
            output_row[std_col.STATE_NAME_COL] = 'United States'
            output_row[std_col.STATE_FIPS_COL] = '00'

            if breakdown == std_col.RACE_OR_HISPANIC_COL:
                output_row[std_col.RACE_CATEGORY_ID_COL] = standard_group
            else:
                output_row[breakdown] = standard_group

            row = df.loc[df['demographic_category'] == cdc_group]
            output_row[std_col.VACCINATED_FIRST_DOSE] = int(
                row['administered_dose1'].values[0])
            output_row[std_col.VACCINATED_PER_100K] = calc_per_100k(
                row['administered_dose1_pct'].values[0])

            # We want the Total number of unknowns, not the unknowns of what is known
            if standard_group == "Unknown" or standard_group == Race.UNKNOWN.value:
                output_row[std_col.VACCINATED_SHARE_OF_KNOWN] = row['administered_dose1_pct_us'].values[0]
            else:
                output_row[std_col.VACCINATED_SHARE_OF_KNOWN] = row['administered_dose1_pct_known'].values[0]

            # Manually set this to 100%
            if standard_group == std_col.ALL_VALUE or standard_group == Race.ALL.value:
                output_row[std_col.VACCINATED_SHARE_OF_KNOWN] = 100.0

            if breakdown == std_col.AGE_COL and standard_group != "Unknown":
                output_row[std_col.POPULATION_PCT_COL] = CDC_AGE_GROUPS_TO_POP_PCT[cdc_group]

            output.append(output_row)

        output_df = pd.DataFrame(output, columns=columns)

        if breakdown == std_col.RACE_OR_HISPANIC_COL:
            std_col.add_race_columns_from_category_id(output_df)

        return output_df


def calc_per_100k(pct_value):
    return pct_value * 1000 if not pd.isnull(pct_value) else None
