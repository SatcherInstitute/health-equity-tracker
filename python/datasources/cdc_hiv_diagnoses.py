from datasources.data_source import DataSource
from ingestion import gcs_to_bq_util, merge_utils, standardized_columns as std_col
from ingestion.constants import NATIONAL_LEVEL, STATE_LEVEL, COUNTY_LEVEL, Sex
from ingestion.dataset_utils import generate_pct_share_col_without_unknowns, generate_pct_rel_inequity_col
import pandas as pd
import numpy as np

RACE_GROUPS_TO_STANDARD = {
    'White': std_col.Race.WHITE_NH.value,
    'Black/African American': std_col.Race.BLACK_NH.value,
    'Hispanic/Latino': std_col.Race.HISP.value,
    'American Indian/Alaska Native': std_col.Race.AIAN_NH.value,
    'Asian': std_col.Race.ASIAN_NH.value,
    'Native Hawaiian/Other Pacific Islander': std_col.Race.NHPI_NH.value,
    'Multiracial': std_col.Race.MULTI_NH.value,
}

AGE_GROUPS = {
    '13-24': '13_24',
    '25-34': '25_34',
    '35-44': '35_44',
    '45-54': '45_54',
    '55+': '55+',
}

SOURCE_YEAR = '2019'

SEX_GROUPS = {"male": Sex.MALE, "female": Sex.FEMALE}

group_dict = {
    std_col.AGE_COL: AGE_GROUPS,
    std_col.SEX_COL: SEX_GROUPS,
    std_col.RACE_OR_HISPANIC_COL: RACE_GROUPS_TO_STANDARD,
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


class CDCHIVDiagnosesData(DataSource):

    @ staticmethod
    def get_id():
        return 'CDC_HIV_DIAGNOSES_DATA'

    @ staticmethod
    def get_table_name():
        return 'cdc_hiv_diagnoses_data'

    def upload_to_gcs(self, gcs_bucket, **attrs):
        raise NotImplementedError(
            'upload_to_gcs should not be called for CDCHIVDiagnosesData'
        )

    def write_to_bq(self, dataset, gcs_bucket, **attrs):
        for geo_level in [COUNTY_LEVEL, STATE_LEVEL, NATIONAL_LEVEL]:
            alls_df = generate_alls_df(geo_level)
            fips_col = std_col.COUNTY_FIPS_COL if geo_level == COUNTY_LEVEL else std_col.STATE_FIPS_COL

            for breakdown in [std_col.AGE_COL, std_col.RACE_OR_HISPANIC_COL, std_col.SEX_COL]:
                table_name = f'{breakdown}_{geo_level}'

                df = self.generate_breakdown_df(
                    breakdown, geo_level, alls_df, fips_col)
                df.to_csv(f'{breakdown}_{geo_level}_output.csv', index=False)

                float_cols = [std_col.HIV_POPULATION_PCT,
                              std_col.POPULATION_COL,
                              std_col.HIV_CASES,
                              std_col.HIV_PER_100K,
                              std_col.HIV_PCT_SHARE
                              ]

                column_types = gcs_to_bq_util.get_bq_column_types(
                    df, float_cols=float_cols)

                gcs_to_bq_util.add_df_to_bq(
                    df, dataset, table_name, column_types=column_types)

    def generate_breakdown_df(self, breakdown, geo_level, alls_df, fips_col):
        source_dfs = []
        format_num = 5 if geo_level == COUNTY_LEVEL else 2
        missing_data = ['Data suppressed', 'Data not available']
        needed_cols = generate_needed_cols(breakdown, geo_level)

        cols_std = {
            'Geography': std_col.STATE_NAME_COL,
            'FIPS': fips_col,
            'Age Group': std_col.AGE_COL,
            'Sex': std_col.SEX_COL,
            'Race/Ethnicity': std_col.RACE_OR_HISPANIC_COL,
            'Year': std_col.TIME_PERIOD_COL,
            'Cases': std_col.HIV_CASES,
            'Rate per 100000': std_col.HIV_PER_100K,
            'Population': std_col.POPULATION_COL,
        }

        for group in group_dict[breakdown].keys():
            geo = 'county' if geo_level == COUNTY_LEVEL else 'state'
            directory = f'cdc_hiv_diagnoses/{geo}'
            filename = f'{breakdown}_{demo_dict.get(group, group)}_{geo}_{SOURCE_YEAR}.csv'

            source_df = gcs_to_bq_util.load_csv_as_df_from_data_dir(
                directory, filename, dtype={'FIPS': str}, skiprows=9)
            source_df['FIPS'] = source_df['FIPS'].str.zfill(format_num)
            source_dfs.append(source_df)

        source_dfs.append(alls_df)
        merged_df = pd.concat(source_dfs, axis=0)
        df = merged_df.rename(columns=cols_std)
        df = df.sort_values([fips_col, breakdown]).reset_index(drop=True)

        df[std_col.HIV_CASES] = df[std_col.HIV_CASES].replace(
            ',', '', regex=True)
        df.loc[df[std_col.HIV_CASES].isin(
            missing_data), std_col.HIV_CASES] = np.nan
        df.loc[df[std_col.HIV_PER_100K].isin(
            missing_data), std_col.HIV_PER_100K] = np.nan
        df[std_col.HIV_CASES] = df[std_col.HIV_CASES].astype(float)
        df[std_col.HIV_PER_100K] = df[std_col.HIV_PER_100K].astype(float)

        if geo_level == COUNTY_LEVEL:
            new = df[std_col.STATE_NAME_COL].str.split(
                ", ", n=1, expand=True)
            df[std_col.STATE_NAME_COL] = new[1]
            df[std_col.COUNTY_NAME_COL] = new[0]
            df = merge_utils.merge_state_ids(df)

        if geo_level == NATIONAL_LEVEL:
            territories = ['60', '66', '69', '72', '78']
            df = df[-df[std_col.STATE_FIPS_COL].isin(territories)]
            df[std_col.STATE_FIPS_COL] = '00'
            df[std_col.STATE_NAME_COL] = 'United States'
            df = df.groupby([std_col.STATE_NAME_COL, std_col.STATE_FIPS_COL,
                            std_col.TIME_PERIOD_COL, breakdown]).sum().reset_index()
            df.loc[df[breakdown] ==
                   'All', [std_col.POPULATION_COL]] = df[std_col.POPULATION_COL].sum()

        df = df[needed_cols]
        df = generate_pct_share_col_without_unknowns(
            df, pct_share_dict, breakdown, 'All')

        return df


def generate_needed_cols(breakdown, geo_level):
    cols = [std_col.STATE_FIPS_COL, std_col.STATE_NAME_COL]
    cols_county = [std_col.COUNTY_FIPS_COL, std_col.COUNTY_NAME_COL]
    std_cols = [std_col.TIME_PERIOD_COL, breakdown,
                std_col.HIV_CASES, std_col.HIV_PER_100K, std_col.POPULATION_COL]

    if geo_level == COUNTY_LEVEL:
        return cols + cols_county + std_cols

    else:
        return cols + std_cols


def generate_alls_df(geo_level):
    cols = ['Sex', 'Age Group', 'Race/Ethnicity']
    dtype = {'FIPS': str}

    alls_county_df = gcs_to_bq_util.load_csv_as_df_from_data_dir(
        'cdc_hiv_diagnoses/county', 'totals_county_2019.csv', dtype=dtype, skiprows=9)
    alls_state_df = gcs_to_bq_util.load_csv_as_df_from_data_dir(
        'cdc_hiv_diagnoses/state', 'totals_state_2019.csv', dtype=dtype, skiprows=9)
    alls_national_df = gcs_to_bq_util.load_csv_as_df_from_data_dir(
        'cdc_hiv_diagnoses/national', 'totals_national_2019.csv', skiprows=9)

    alls_county_df[cols] = alls_state_df[cols] = alls_national_df[cols] = 'All'
    alls_national_df['FIPS'] = '00'
    alls_national_df['Geography'] = 'United States'

    if geo_level == NATIONAL_LEVEL:
        return alls_national_df
    if geo_level == STATE_LEVEL:
        return alls_state_df
    if geo_level == COUNTY_LEVEL:
        return alls_county_df
