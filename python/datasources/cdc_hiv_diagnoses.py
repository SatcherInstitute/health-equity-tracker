from datasources.data_source import DataSource
from ingestion import constants, gcs_to_bq_util, merge_utils, standardized_columns as std_col
import pandas as pd

cols_to_std = {
    'Geography': std_col.STATE_NAME_COL,
    'FIPS': std_col.STATE_FIPS_COL,
    'Year': std_col.TIME_PERIOD_COL,
    'Age Group': std_col.AGE_COL,
    'Cases': std_col.HIV_CASES,
    'Rate per 100000': std_col.HIV_PER_100K,
    'Population': std_col.POPULATION_COL
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

AGE_GROUPS = {
    '13-24': '13_24',
    '25-34': '25_34',
    '35-44': '35_44',
    '45-54': '45_54',
    '55+': '55+',
}

state_cols_std = {
    'Geography': std_col.STATE_NAME_COL,
    'FIPS': std_col.STATE_FIPS_COL,
    'Age Group': std_col.AGE_COL,
    'Sex': std_col.SEX_COL,
    'Race/Ethnicity': std_col.RACE_OR_HISPANIC_COL,
    'Year': std_col.TIME_PERIOD_COL,
    'Cases': std_col.HIV_CASES,
    'Rate per 100000': std_col.HIV_PER_100K,
    'Population': std_col.POPULATION_COL
}

county_cols_std = {
    'Geography': std_col.COUNTY_NAME_COL,
    'FIPS': std_col.COUNTY_FIPS_COL,
    'Age Group': std_col.AGE_COL,
    'Sex': std_col.SEX_COL,
    'Race/Ethnicity': std_col.RACE_OR_HISPANIC_COL,
    'Year': std_col.TIME_PERIOD_COL,
    'Cases': std_col.HIV_CASES,
    'Rate per 100000': std_col.HIV_PER_100K,
    'Population': std_col.POPULATION_COL
}


SOURCE_YEAR = '2019'


SEX_GROUPS = {"male": constants.Sex.MALE, "female": constants.Sex.FEMALE}


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
        for geo_level in [constants.STATE_LEVEL, constants.COUNTY_LEVEL]:
            for demo in [std_col.AGE_COL, std_col.RACE_OR_HISPANIC_COL, std_col.SEX_COL]:
                table_name = f'{demo}_{geo_level}'
                df = self.generate_breakdown_df(demo, geo_level)
                df = self.format_df(df, demo, geo_level)

                df.to_csv(f'{demo}_{geo_level}_output.csv', index=False)

                # float_cols = [std_col.POPULATION_PCT_COL,
                #               std_col.POPULATION_COL,
                #               std_col.HIV_CASES,
                #               std_col.HIV_PER_100K,
                #               std_col.HIV_PCT_SHARE
                #               ]

                # column_types = gcs_to_bq_util.get_bq_column_types(
                #     df, float_cols=float_cols)

                # gcs_to_bq_util.add_df_to_bq(
                #     df, dataset, table_name, column_types=column_types)

    def generate_breakdown_df(self, breakdown, geo_level):

        group_dict = {
            std_col.AGE_COL: AGE_GROUPS,
            std_col.SEX_COL: SEX_GROUPS,
            std_col.RACE_OR_HISPANIC_COL: RACE_GROUPS_TO_STANDARD,
        }

        source_dfs = []

        demo_dict = {
            'American Indian/Alaska Native': 'aian',
            'Asian': 'asian',
            'Black/African American': 'black',
            'Hispanic/Latino': 'hisp',
            'Multiracial': 'multi',
            'Native Hawaiian/Other Pacific Islander': 'nhpi',
            'White': 'white',
        }

        for group in group_dict[breakdown].keys():
            directory = f'cdc_hiv_diagnoses/{geo_level}'

            if group in AGE_GROUPS:
                filename = f'{breakdown}_{group}_{geo_level}_{SOURCE_YEAR}.csv'
                source_df = gcs_to_bq_util.load_csv_as_df_from_data_dir(
                    directory, filename, dtype={'FIPS': str}, skiprows=9)
                source_dfs.append(source_df)

            if group in SEX_GROUPS:
                filename = f'{breakdown}_{group}_{geo_level}_{SOURCE_YEAR}.csv'
                source_df = gcs_to_bq_util.load_csv_as_df_from_data_dir(
                    directory, filename, dtype={'FIPS': str}, skiprows=9)
                source_dfs.append(source_df)

            if group in RACE_GROUPS_TO_STANDARD:
                filename = f'{breakdown}_{demo_dict[group]}_{geo_level}_{SOURCE_YEAR}.csv'
                source_df = gcs_to_bq_util.load_csv_as_df_from_data_dir(
                    directory, filename, dtype={'FIPS': str}, skiprows=9)
                source_dfs.append(source_df)

        source_dfs = pd.concat(source_dfs, axis=0)
        return source_dfs

    def format_df(self, df, demo, geo_level):

        if geo_level == 'state':
            if demo == 'age':
                df = df.rename(columns=state_cols_std)
                needed_cols = [std_col.STATE_FIPS_COL, std_col.STATE_NAME_COL, std_col.TIME_PERIOD_COL,
                               std_col.AGE_COL, std_col.HIV_CASES, std_col.HIV_PER_100K, std_col.POPULATION_COL]
                df = df[needed_cols].sort_values(
                    [std_col.STATE_FIPS_COL, std_col.AGE_COL]).reset_index(drop=True)
                return df
            if demo == 'sex':
                df = df.rename(columns=state_cols_std)
                needed_cols = [std_col.STATE_FIPS_COL, std_col.STATE_NAME_COL, std_col.TIME_PERIOD_COL,
                               std_col.SEX_COL, std_col.HIV_CASES, std_col.HIV_PER_100K, std_col.POPULATION_COL]
                df = df[needed_cols].sort_values(
                    [std_col.STATE_FIPS_COL, std_col.SEX_COL]).reset_index(drop=True)
                return df
            if demo == 'race_and_ethnicity':
                df = df.rename(columns=state_cols_std)
                needed_cols = [std_col.STATE_FIPS_COL, std_col.STATE_NAME_COL, std_col.TIME_PERIOD_COL,
                               std_col.RACE_OR_HISPANIC_COL, std_col.HIV_CASES, std_col.HIV_PER_100K, std_col.POPULATION_COL]
                df = df[needed_cols].sort_values(
                    [std_col.STATE_NAME_COL, std_col.RACE_OR_HISPANIC_COL]).reset_index(drop=True)
                return df

        if geo_level == 'county':
            if demo == 'age':
                df = df.rename(columns=county_cols_std)
                needed_cols = [std_col.COUNTY_FIPS_COL, std_col.COUNTY_NAME_COL, std_col.TIME_PERIOD_COL,
                               std_col.AGE_COL, std_col.HIV_CASES, std_col.HIV_PER_100K, std_col.POPULATION_COL]
                df[std_col.COUNTY_FIPS_COL] = df[std_col.COUNTY_FIPS_COL].apply(
                    lambda x: x.zfill(5))
                df = merge_utils.merge_county_names(df)
                df = df[needed_cols].sort_values(
                    [std_col.COUNTY_FIPS_COL, std_col.AGE_COL]).reset_index(drop=True)
                return df
            if demo == 'sex':
                df = df.rename(columns=county_cols_std)
                needed_cols = [std_col.COUNTY_FIPS_COL, std_col.COUNTY_NAME_COL, std_col.TIME_PERIOD_COL,
                               std_col.SEX_COL, std_col.HIV_CASES, std_col.HIV_PER_100K, std_col.POPULATION_COL]
                df[std_col.COUNTY_FIPS_COL] = df[std_col.COUNTY_FIPS_COL].apply(
                    lambda x: x.zfill(5))
                df = df[needed_cols].sort_values(
                    [std_col.COUNTY_FIPS_COL, std_col.SEX_COL]).reset_index(drop=True)
                return df
            if demo == 'race_and_ethnicity':
                df = df.rename(columns=county_cols_std)
                needed_cols = [std_col.COUNTY_FIPS_COL, std_col.COUNTY_NAME_COL, std_col.TIME_PERIOD_COL,
                               std_col.RACE_OR_HISPANIC_COL, std_col.HIV_CASES, std_col.HIV_PER_100K, std_col.POPULATION_COL]
                df[std_col.COUNTY_FIPS_COL] = df[std_col.COUNTY_FIPS_COL].apply(
                    lambda x: x.zfill(5))
                df = df[needed_cols].sort_values(
                    [std_col.COUNTY_FIPS_COL, std_col.RACE_OR_HISPANIC_COL]).reset_index(drop=True)
            return df
