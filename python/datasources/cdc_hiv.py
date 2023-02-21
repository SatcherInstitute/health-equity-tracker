import numpy as np
import pandas as pd
from datasources.data_source import DataSource
from ingestion.constants import (COUNTY_LEVEL,
                                 STATE_LEVEL,
                                 NATIONAL_LEVEL,
                                 US_FIPS)
from ingestion.dataset_utils import (generate_pct_share_col_without_unknowns,
                                     generate_pct_rel_inequity_col)
from ingestion import gcs_to_bq_util, standardized_columns as std_col
from ingestion.merge_utils import merge_county_names


HIV_DIR = 'cdc_hiv'

# a nested dictionary that contains values swaps per column name
HIV_TERMS_STANDARD_BY_COL = {
    std_col.AGE_COL: {'Ages 13 years and older': std_col.ALL_VALUE},
    std_col.HIV_DIAGNOSES: {'Data suppressed': np.nan, 'Data not available': np.nan},
    std_col.HIV_DIAGNOSES_PER_100K: {'Data suppressed': np.nan, 'Data not available': np.nan},
    std_col.RACE_CATEGORY_ID_COL: {
        'All races/ethnicities': std_col.Race.ALL,
        'American Indian/Alaska Native': std_col.Race.AIAN_NH.value,
        'Asian': std_col.Race.ASIAN_NH.value,
        'Black/African American': std_col.Race.BLACK_NH.value,
        'Hispanic/Latino': std_col.Race.HISP.value,
        'Multiracial': std_col.Race.MULTI_NH.value,
        'Native Hawaiian/Other Pacific Islander': std_col.Race.NHPI_NH.value,
        'White': std_col.Race.WHITE_NH.value},
    std_col.SEX_COL: {'Both sexes': std_col.ALL_VALUE},
    std_col.TIME_PERIOD_COL: {'2020 (COVID-19 Pandemic)': '2020'}
}

PCT_SHARE_DICT = {
    std_col.HIV_DIAGNOSES: std_col.HIV_DIAGNOSES_PCT_SHARE,
    std_col.POPULATION_COL: std_col.HIV_POPULATION_PCT}


class CDCHIVData(DataSource):

    @ staticmethod
    def get_id():
        return 'CDC_HIV_DATA'

    @ staticmethod
    def get_table_name():
        return 'cdc_hiv_data'

    def upload_to_gcs(self, gcs_bucket, **attrs):
        raise NotImplementedError(
            'upload_to_gcs should not be called for CDCHIVData')

    def write_to_bq(self, dataset, gcs_bucket, **attrs):

        for geo_level in [COUNTY_LEVEL, NATIONAL_LEVEL, STATE_LEVEL]:
            alls_df = generate_df_from_data_dir(f'hiv-{geo_level}-all.csv')

            for breakdown in [std_col.AGE_COL, std_col.RACE_OR_HISPANIC_COL, std_col.SEX_COL]:
                table_name = f'{breakdown}_{geo_level}'
                df = self.generate_breakdown_df(breakdown, geo_level, alls_df)

                float_cols = [std_col.HIV_DIAGNOSES,
                              std_col.HIV_DIAGNOSES_PCT_INEQUITY,
                              std_col.HIV_DIAGNOSES_PCT_SHARE,
                              std_col.HIV_DIAGNOSES_PER_100K,
                              std_col.HIV_POPULATION_PCT,
                              std_col.HIV_DIAGNOSES_PCT_INEQUITY]
                column_types = gcs_to_bq_util.get_bq_column_types(df,
                                                                  float_cols=float_cols)
                gcs_to_bq_util.add_df_to_bq(df,
                                            dataset,
                                            table_name,
                                            column_types=column_types)

    def generate_breakdown_df(self, breakdown: str, geo_level: str, alls_df: pd.DataFrame):
        GEO_COL = std_col.COUNTY_NAME_COL if geo_level == COUNTY_LEVEL else std_col.STATE_NAME_COL
        FIPS = std_col.COUNTY_FIPS_COL if geo_level == COUNTY_LEVEL else std_col.STATE_FIPS_COL

        columns_to_standard = {
            'Age Group': std_col.AGE_COL,
            'Cases': std_col.HIV_DIAGNOSES,
            'FIPS': FIPS,
            'Geography': GEO_COL,
            'Population': std_col.POPULATION_COL,
            'Race/Ethnicity': std_col.RACE_CATEGORY_ID_COL,
            'Rate per 100000': std_col.HIV_DIAGNOSES_PER_100K,
            'Sex': std_col.SEX_COL,
            'Year': std_col.TIME_PERIOD_COL}

        columns_to_keep = [
            GEO_COL,
            FIPS,
            std_col.TIME_PERIOD_COL,
            breakdown,
            std_col.HIV_DIAGNOSES,
            std_col.HIV_DIAGNOSES_PER_100K,
            std_col.HIV_DIAGNOSES_PCT_SHARE,
            std_col.HIV_POPULATION_PCT,
            std_col.HIV_DIAGNOSES_PCT_INEQUITY]

        breakdown_group_df = generate_df_from_data_dir(
            f'hiv-{geo_level}-{breakdown}.csv')

        combined_group_df = pd.concat([breakdown_group_df, alls_df], axis=0)

        df = combined_group_df.rename(columns=columns_to_standard)

        df = df.replace(to_replace=HIV_TERMS_STANDARD_BY_COL)

        if geo_level == COUNTY_LEVEL:
            df = merge_county_names(df)
            df[std_col.STATE_FIPS_COL] = df[std_col.COUNTY_FIPS_COL].str.slice(0,
                                                                               2)

        if geo_level == NATIONAL_LEVEL:
            df[std_col.STATE_FIPS_COL] = US_FIPS

        if breakdown == std_col.RACE_OR_HISPANIC_COL:
            std_col.add_race_columns_from_category_id(df)
            columns_to_keep.append(std_col.RACE_CATEGORY_ID_COL)

        # replace string number with whole number
        df[std_col.HIV_DIAGNOSES] = df[std_col.HIV_DIAGNOSES].replace(',',
                                                                      '',
                                                                      regex=True)

        df = generate_pct_share_col_without_unknowns(df,
                                                     PCT_SHARE_DICT,
                                                     breakdown,
                                                     std_col.ALL_VALUE)

        df = generate_pct_rel_inequity_col(df,
                                           std_col.HIV_DIAGNOSES_PCT_SHARE,
                                           std_col.HIV_POPULATION_PCT,
                                           std_col.HIV_DIAGNOSES_PCT_INEQUITY)

        df = df[columns_to_keep]
        df = df.sort_values([FIPS, breakdown]).reset_index(drop=True)

        return df


def generate_df_from_data_dir(filename: str):
    """
    generate_alls_df fetches the csv file from the data dir

    filename: the name of the file to load the csv file from
    return: a dataframe for specified geo_level and breakdown
    """

    df = gcs_to_bq_util.load_csv_as_df_from_data_dir(HIV_DIR,
                                                     filename,
                                                     skiprows=8,
                                                     thousands=',',
                                                     dtype={'FIPS': str, 'Year': str})

    return df
