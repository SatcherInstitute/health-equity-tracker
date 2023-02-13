from datasources.data_source import DataSource
from ingestion import gcs_to_bq_util, merge_utils, standardized_columns as std_col, constants
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
    "male": constants.Sex.MALE,
    "female": constants.Sex.FEMALE
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
    std_col.HIV_DIAGNOSES: std_col.HIV_DIAGNOSES_PCT_SHARE,
    std_col.POPULATION_COL: std_col.HIV_POPULATION_PCT
}


def generate_alls_df(geo_level: str):
    """
    Fetches the combined dataframe of each demographic for county & state levels

    geo_level: string of `state` or `county`

    returns a formatted dataframe with total values for specified geo_level
    """
    alls_df = gcs_to_bq_util.load_csv_as_df_from_data_dir(
        'cdc_hiv', f'totals_{geo_level}_2019.csv',
        subdirectory=geo_level, dtype={'FIPS': str}, skiprows=9, thousands=',')

    alls_df[['Sex', 'Age Group', 'Race/Ethnicity']] = 'All'

    if geo_level == constants.NATIONAL_LEVEL:
        alls_df['FIPS'] = constants.US_FIPS
        alls_df['Geography'] = constants.US_NAME
        return alls_df

    return alls_df


def generate_nat_breakdown_df(breakdown: str):
    nat_from_state_df = gcs_to_bq_util.load_csv_as_df_from_data_dir(
        'cdc_hiv', f'{breakdown}_national_2019.csv',
        subdirectory='national', skiprows=9, thousands=",")

    nat_from_state_df['FIPS'] = constants.US_FIPS
    nat_from_state_df['Geography'] = constants.US_NAME

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
        for geo_level in [constants.COUNTY_LEVEL, constants.STATE_LEVEL, constants.NATIONAL_LEVEL]:
            for breakdown in [std_col.AGE_COL, std_col.RACE_OR_HISPANIC_COL, std_col.SEX_COL]:
                table_name = f'{breakdown}_{geo_level}'

                df = self.generate_breakdown_df(breakdown, geo_level)

                float_cols = [std_col.HIV_POPULATION_PCT,
                              std_col.HIV_DIAGNOSES,
                              std_col.HIV_DIAGNOSES_PER_100K,
                              std_col.HIV_DIAGNOSES_PCT_SHARE
                              ]

                column_types = gcs_to_bq_util.get_bq_column_types(
                    df, float_cols=float_cols)

                gcs_to_bq_util.add_df_to_bq(
                    df, dataset, table_name, column_types=column_types)

    def generate_breakdown_df(self, breakdown, geo_level):
        COL_NAME = std_col.COUNTY_NAME_COL if geo_level == constants.COUNTY_LEVEL else std_col.STATE_NAME_COL
        FIPS = std_col.COUNTY_FIPS_COL if geo_level == constants.COUNTY_LEVEL else std_col.STATE_FIPS_COL

        cols_std = {
            'Geography': COL_NAME,
            'FIPS': FIPS,
            'Age Group': std_col.AGE_COL,
            'Sex': std_col.SEX_COL,
            'Race/Ethnicity': std_col.RACE_OR_HISPANIC_COL,
            'Year': std_col.TIME_PERIOD_COL,
            'Cases': std_col.HIV_DIAGNOSES,
            'Rate per 100000': std_col.HIV_DIAGNOSES_PER_100K,
            'Population': std_col.POPULATION_COL,
        }

        cols = [
            COL_NAME,
            FIPS,
            std_col.TIME_PERIOD_COL,
            breakdown,
            std_col.HIV_DIAGNOSES,
            std_col.HIV_DIAGNOSES_PER_100K,
            std_col.HIV_DIAGNOSES_PCT_SHARE,
            std_col.HIV_POPULATION_PCT]

        source_dfs = []
        missing_data = ['Data suppressed', 'Data not available']

        # county fips needs 5 digits, state digits use 2
        format_num = 5 if geo_level == constants.COUNTY_LEVEL else 2
        # flag for creating only county & state level dataframes
        geo = constants.COUNTY_LEVEL if geo_level == constants.COUNTY_LEVEL else constants.STATE_LEVEL

        for group in GROUP_DICT[breakdown].keys():
            # skiprows skips unreadable rows on df/ thousands convert popuplation numbers to floats
            filename = f'{breakdown}_{demo_dict.get(group, group)}_{geo}_2019.csv'
            source_group_df = gcs_to_bq_util.load_csv_as_df_from_data_dir(
                'cdc_hiv', filename, subdirectory=geo,
                skiprows=9, thousands=',', dtype={'FIPS': str})

            # adds leading zeros to fips
            source_group_df['FIPS'] = source_group_df['FIPS'].str.zfill(
                format_num)
            source_dfs.append(source_group_df)

        if geo_level != constants.NATIONAL_LEVEL:
            alls_df = generate_alls_df(geo_level)
            source_dfs.append(alls_df)

        combined_group_df = pd.concat(source_dfs, axis=0)
        combined_group_df = combined_group_df.rename(columns=cols_std)
        combined_group_df = combined_group_df.sort_values(
            [FIPS, breakdown]).reset_index(drop=True)

        if geo_level == constants.COUNTY_LEVEL:
            combined_group_df = merge_utils.merge_county_names(
                combined_group_df)
            combined_group_df[std_col.STATE_FIPS_COL] = combined_group_df[std_col.COUNTY_FIPS_COL].str.slice(
                0, 2)

        if geo_level == constants.NATIONAL_LEVEL:
            alls_df = generate_alls_df(constants.NATIONAL_LEVEL)
            nat_breakdown_df = generate_nat_breakdown_df(breakdown)

            nat_df = pd.concat([nat_breakdown_df, alls_df])
            nat_df = nat_df.rename(columns=cols_std)

            # remove territories (not included in national numbers)
            combined_group_df = combined_group_df[-combined_group_df[std_col.STATE_FIPS_COL].isin(
                set(constants.TERRITORY_FIPS_LIST))]

            combined_group_df[std_col.STATE_FIPS_COL] = constants.US_FIPS
            combined_group_df[std_col.STATE_NAME_COL] = constants.US_NAME

            # combine population numbers
            combined_group_df.loc[combined_group_df[breakdown] == 'All',
                                  std_col.POPULATION_COL] = combined_group_df[std_col.POPULATION_COL].sum()

            # combine HIV cases
            group_by_cols = [std_col.STATE_NAME_COL, std_col.STATE_FIPS_COL,
                             std_col.TIME_PERIOD_COL, breakdown]
            combined_group_df = combined_group_df.groupby(
                group_by_cols).sum().reset_index()
            combined_group_df = combined_group_df[group_by_cols + [
                std_col.POPULATION_COL]]

            # merge nat & state population dataframes
            combined_group_df = nat_df.merge(
                combined_group_df, on=group_by_cols, how='left')
            combined_group_df.loc[combined_group_df[breakdown] == 'All',
                                  std_col.POPULATION_COL] = combined_group_df[std_col.POPULATION_COL].sum()

        combined_group_df.loc[combined_group_df[std_col.HIV_DIAGNOSES_PER_100K].isin(
            missing_data), std_col.HIV_DIAGNOSES_PER_100K] = np.nan
        combined_group_df[std_col.HIV_DIAGNOSES] = combined_group_df[std_col.HIV_DIAGNOSES].replace(
            ',', '', regex=True)
        combined_group_df.loc[combined_group_df[std_col.HIV_DIAGNOSES].isin(
            missing_data), std_col.HIV_DIAGNOSES] = np.nan
        combined_group_df[std_col.HIV_DIAGNOSES] = combined_group_df[std_col.HIV_DIAGNOSES].astype(
            float)
        combined_group_df[std_col.HIV_DIAGNOSES_PER_100K] = combined_group_df[std_col.HIV_DIAGNOSES_PER_100K].astype(
            float)

        combined_group_df = generate_pct_share_col_without_unknowns(
            combined_group_df, pct_share_dict, breakdown, 'All')

        if breakdown == std_col.RACE_OR_HISPANIC_COL:
            combined_group_df = combined_group_df.replace(
                {std_col.RACE_OR_HISPANIC_COL: RACE_GROUPS_TO_STANDARD})
            combined_group_df = combined_group_df.replace(['All'], 'ALL')
            combined_group_df = combined_group_df.rename(
                columns={std_col.RACE_OR_HISPANIC_COL: std_col.RACE_CATEGORY_ID_COL})
            std_col.add_race_columns_from_category_id(combined_group_df)
            cols.append(std_col.RACE_CATEGORY_ID_COL)

        df = combined_group_df[cols]

        return df
