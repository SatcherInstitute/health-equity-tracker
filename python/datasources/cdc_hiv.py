from datasources.data_source import DataSource
from ingestion import gcs_to_bq_util, merge_utils, standardized_columns as std_col
from ingestion.constants import NATIONAL_LEVEL, STATE_LEVEL, COUNTY_LEVEL, Sex
from ingestion.dataset_utils import generate_pct_share_col_without_unknowns
import pandas as pd
import numpy as np

AGE_GROUPS = {
    '13-24': '13_24',
    '25-34': '25_34',
    '35-44': '35_44',
    '45-54': '45_54',
    '55+': '55+',
}

RACE_GROUPS_TO_STANDARD = {
    'White': std_col.Race.WHITE_NH.value,
    'Black/African American': std_col.Race.BLACK_NH.value,
    'Hispanic/Latino': std_col.Race.HISP.value,
    'American Indian/Alaska Native': std_col.Race.AIAN_NH.value,
    'Asian': std_col.Race.ASIAN_NH.value,
    'Native Hawaiian/Other Pacific Islander': std_col.Race.NHPI_NH.value,
    'Multiracial': std_col.Race.MULTI_NH.value,
}

SEX_GROUPS = {
    "male": Sex.MALE,
    "female": Sex.FEMALE
}

GROUP_DICT = {
    std_col.AGE_COL: AGE_GROUPS,
    std_col.RACE_OR_HISPANIC_COL: RACE_GROUPS_TO_STANDARD,
    std_col.SEX_COL: SEX_GROUPS,
}

demo_dict = {
    'American Indian/Alaska Native': 'aian',
    'Asian': 'asian',
    'Black/African American': 'black',
    'Hispanic/Latino': 'hisp',
    'Multiracial': 'multi',
    'Native Hawaiian/Other Pacific Islander': 'nhpi',
    'White': 'white',
}

pct_share_dict = {
    std_col.HIV_CASES: std_col.HIV_PCT_SHARE,
    std_col.POPULATION_COL: std_col.HIV_POPULATION_PCT
}

SOURCE_YEAR = '2019'


def generate_alls_df(geo_level: str):
    """
    Fetches the combined dataframe of each demographic for county & state levels

    geo_level: string of `state` or `county`

    returns a formatted dataframe with total values for specified geo_level
    """
    alls_df = gcs_to_bq_util.load_csv_as_df_from_data_dir(
        f'cdc_hiv/{geo_level}', f'totals_{geo_level}_2019.csv', dtype={'FIPS': str}, skiprows=9, thousands=',')
    alls_df[['Sex', 'Age Group', 'Race/Ethnicity']] = 'All'

    if geo_level == NATIONAL_LEVEL:
        alls_df['FIPS'] = '00'
        alls_df['Geography'] = 'United States'
        return alls_df

    return alls_df


def generate_nat_from_state_df(breakdown):
    nat_from_state_df = gcs_to_bq_util.load_csv_as_df_from_data_dir(
        f'cdc_hiv/{NATIONAL_LEVEL}', f'{breakdown}_{NATIONAL_LEVEL}_{SOURCE_YEAR}.csv', skiprows=9, thousands=",")
    nat_from_state_df['FIPS'] = '00'
    nat_from_state_df['Geography'] = 'United States'

    return nat_from_state_df


class CDCHIVData(DataSource):

    @ staticmethod
    def get_id():
        return 'CDC_HIV_DATA'

    @ staticmethod
    def get_table_name():
        return 'cdc_hiv_data'

    def upload_to_gcs(self, gcs_bucket, **attrs):
        raise NotImplementedError(
            'upload_to_gcs should not be called for CDCHIVData'
        )

    def write_to_bq(self, dataset, gcs_bucket, **attrs):
        for geo_level in [COUNTY_LEVEL, STATE_LEVEL, NATIONAL_LEVEL]:
            for breakdown in [std_col.AGE_COL, std_col.RACE_OR_HISPANIC_COL, std_col.SEX_COL]:
                table_name = f'{breakdown}_{geo_level}'

                df = self.generate_breakdown_df(breakdown, geo_level)

                df.to_csv(f'{breakdown}_{geo_level}_output.csv', index=False)

                float_cols = [std_col.HIV_POPULATION_PCT,
                              std_col.HIV_CASES,
                              std_col.HIV_PER_100K,
                              std_col.HIV_PCT_SHARE
                              ]

                column_types = gcs_to_bq_util.get_bq_column_types(
                    df, float_cols=float_cols)

                gcs_to_bq_util.add_df_to_bq(
                    df, dataset, table_name, column_types=column_types)

    def generate_breakdown_df(self, breakdown, geo_level):
        COL_NAME = std_col.COUNTY_NAME_COL if geo_level == COUNTY_LEVEL else std_col.STATE_NAME_COL
        FIPS = std_col.COUNTY_FIPS_COL if geo_level == COUNTY_LEVEL else std_col.STATE_FIPS_COL

        cols_std = {
            'Geography': COL_NAME,
            'FIPS': FIPS,
            'Age Group': std_col.AGE_COL,
            'Sex': std_col.SEX_COL,
            'Race/Ethnicity': std_col.RACE_OR_HISPANIC_COL,
            'Year': std_col.TIME_PERIOD_COL,
            'Cases': std_col.HIV_CASES,
            'Rate per 100000': std_col.HIV_PER_100K,
            'Population': std_col.POPULATION_COL,
        }

        cols = [
            COL_NAME,
            FIPS,
            std_col.TIME_PERIOD_COL,
            breakdown,
            std_col.HIV_CASES,
            std_col.HIV_PER_100K,
            std_col.HIV_PCT_SHARE,
            std_col.HIV_POPULATION_PCT]

        source_dfs = []
        missing_data = ['Data suppressed', 'Data not available']

        # county fips needs 5 digits, state digits use 2
        format_num = 5 if geo_level == COUNTY_LEVEL else 2
        geo = COUNTY_LEVEL if geo_level == COUNTY_LEVEL else STATE_LEVEL

        for group in GROUP_DICT[breakdown].keys():
            source_group_df = gcs_to_bq_util.load_csv_as_df_from_data_dir(
                f'cdc_hiv/{geo}', f'{breakdown}_{demo_dict.get(group, group)}_{geo}_{SOURCE_YEAR}.csv',
                skiprows=9, thousands=',', dtype={'FIPS': str})
            # adds leading zeros to fips
            source_group_df['FIPS'] = source_group_df['FIPS'].str.zfill(
                format_num)
            source_dfs.append(source_group_df)

        if geo_level != NATIONAL_LEVEL:
            alls_df = generate_alls_df(geo_level)
            source_dfs.append(alls_df)

        merged_df = pd.concat(source_dfs, axis=0)
        df = merged_df.rename(columns=cols_std)
        df = df.sort_values([FIPS, breakdown]).reset_index(drop=True)

        if geo_level == COUNTY_LEVEL:
            df = merge_utils.merge_county_names(df)
            df[std_col.STATE_FIPS_COL] = df[std_col.COUNTY_FIPS_COL].str.slice(
                0, 2)

        if geo_level == NATIONAL_LEVEL:
            alls_df = generate_alls_df(NATIONAL_LEVEL)
            nat_breakdown_df = generate_nat_from_state_df(breakdown)

            merged_nat_df = pd.concat([nat_breakdown_df, alls_df])
            merged_nat_df = merged_nat_df.rename(columns=cols_std)

            # remove territories (not included in national numbers)
            TERR_FIPS = ['60', '66', '69', '72', '78']
            df = df[-df[std_col.STATE_FIPS_COL].isin(TERR_FIPS)]

            df[std_col.STATE_FIPS_COL] = '00'
            df[std_col.STATE_NAME_COL] = 'United States'

            # combine population numbers
            df.loc[df[breakdown] == 'All',
                   std_col.POPULATION_COL] = df[std_col.POPULATION_COL].sum()

            # combine HIV cases
            group_by_cols = [std_col.STATE_NAME_COL, std_col.STATE_FIPS_COL,
                             std_col.TIME_PERIOD_COL, breakdown]
            df = df.groupby(group_by_cols).sum().reset_index()
            df = df[group_by_cols + [std_col.POPULATION_COL]]

            # merge dataframes
            df = merged_nat_df.merge(df, on=group_by_cols, how='left')
            df.loc[df[breakdown] == 'All',
                   std_col.POPULATION_COL] = df[std_col.POPULATION_COL].sum()

        df.loc[df[std_col.HIV_PER_100K].isin(
            missing_data), std_col.HIV_PER_100K] = np.nan

        df[std_col.HIV_CASES] = df[std_col.HIV_CASES].replace(
            ',', '', regex=True)
        df.loc[df[std_col.HIV_CASES].isin(
            missing_data), std_col.HIV_CASES] = np.nan
        df[std_col.HIV_CASES] = df[std_col.HIV_CASES].astype(float)
        df[std_col.HIV_PER_100K] = df[std_col.HIV_PER_100K].astype(float)

        df[std_col.HIV_PER_100K] = (df[std_col.HIV_PER_100K]) * 1000

        df = generate_pct_share_col_without_unknowns(
            df, pct_share_dict, breakdown, 'All')

        if breakdown == std_col.RACE_OR_HISPANIC_COL:
            df = df.replace(
                {std_col.RACE_OR_HISPANIC_COL: RACE_GROUPS_TO_STANDARD})
            df = df.replace(['All'], 'ALL')
            df = df.rename(
                columns={std_col.RACE_OR_HISPANIC_COL: std_col.RACE_CATEGORY_ID_COL})
            std_col.add_race_columns_from_category_id(df)
            cols.append(std_col.RACE_CATEGORY_ID_COL)

        df = df[cols]

        return df
