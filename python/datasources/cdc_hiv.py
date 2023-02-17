import numpy as np
import pandas as pd
from datasources.data_source import DataSource
from ingestion import gcs_to_bq_util, standardized_columns as std_col
from ingestion.merge_utils import merge_county_names
from ingestion.dataset_utils import (generate_pct_share_col_without_unknowns,
                                     generate_pct_rel_inequity_col)
from ingestion.constants import (COUNTY_LEVEL,
                                 STATE_LEVEL,
                                 NATIONAL_LEVEL,
                                 US_FIPS)

HIV_DIR = 'hiv_time'

# nested dict that contains values swaps, per column name
HIV_TERMS_STANDARD_BY_COL = {
    std_col.RACE_OR_HISPANIC_COL: {
        'All races/ethnicities': std_col.Race.ALL,
        'American Indian/Alaska Native': std_col.Race.AIAN_NH.value,
        'Asian': std_col.Race.ASIAN_NH.value,
        'Black/African American': std_col.Race.BLACK_NH.value,
        'Hispanic/Latino': std_col.Race.HISP.value,
        'Multiracial': std_col.Race.MULTI_NH.value,
        'Native Hawaiian/Other Pacific Islander': std_col.Race.NHPI_NH.value,
        'White': std_col.Race.WHITE_NH.value},
    std_col.AGE_COL: {'Ages 13 years and older': std_col.ALL_VALUE},
    std_col.SEX_COL: {'Both sexes': std_col.ALL_VALUE},
    std_col.HIV_DIAGNOSES: {'Data suppressed': np.nan, 'Data not available': np.nan},
    std_col.HIV_DIAGNOSES_PER_100K: {'Data suppressed': np.nan, 'Data not available': np.nan},
    std_col.TIME_PERIOD_COL: {'2020 (COVID-19 Pandemic)': '2020'}
}

RACE_GROUPS_TO_STANDARD = {
    std_col.RACE_OR_HISPANIC_COL: {
        'All races/ethnicities': std_col.Race.ALL,
        'American Indian/Alaska Native': std_col.Race.AIAN_NH.value,
        'Asian': std_col.Race.ASIAN_NH.value,
        'Black/African American': std_col.Race.BLACK_NH.value,
        'Hispanic/Latino': std_col.Race.HISP.value,
        'Multiracial': std_col.Race.MULTI_NH.value,
        'Native Hawaiian/Other Pacific Islander': std_col.Race.NHPI_NH.value,
        'White': std_col.Race.WHITE_NH.value}}

ALL_GROUPS_TO_STANDARD = {
    std_col.AGE_COL: {'Ages 13 years and older': std_col.ALL_VALUE},
    std_col.SEX_COL: {'Both sexes': std_col.ALL_VALUE}}

MISSING_DATA_TO_STANDARD = {
    std_col.HIV_DIAGNOSES: {'Data suppressed': np.nan, 'Data not available': np.nan},
    std_col.HIV_DIAGNOSES_PER_100K: {'Data suppressed': np.nan, 'Data not available': np.nan}}

TIME_PERIOD_TO_STANDARD = {
    std_col.TIME_PERIOD_COL: {'2020 (COVID-19 Pandemic)': '2020'}}

PCT_SHARE_DICT = {
    std_col.HIV_DIAGNOSES: std_col.HIV_DIAGNOSES_PCT_SHARE,
    std_col.POPULATION_COL: std_col.HIV_POPULATION_PCT}


def generate_alls_df(geo_level: str):
    """
    Fetches the combined dataframe of each demographic for county & state levels
    geo_level: string of `state` or `county`
    returns a formatted dataframe with total values for specified geo_level
    """
    alls_df = gcs_to_bq_util.load_csv_as_df_from_data_dir(HIV_DIR,
                                                          f'hiv-{geo_level}-all.csv',
                                                          skiprows=8,
                                                          thousands=',',
                                                          dtype={'FIPS': str, 'Year': str})

    return alls_df


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

        for geo_level in [COUNTY_LEVEL, STATE_LEVEL, NATIONAL_LEVEL]:
            alls_df = generate_alls_df(geo_level)
            for breakdown in [std_col.AGE_COL, std_col.RACE_OR_HISPANIC_COL, std_col.SEX_COL]:
                table_name = f'{breakdown}_{geo_level}'
                df = self.generate_breakdown_df(breakdown, geo_level, alls_df)
                df.to_csv(f'{table_name}_output.csv', index=False)

<<<<<<< HEAD
                float_cols = [std_col.HIV_DIAGNOSES,
                              std_col.HIV_DIAGNOSES_PCT_INEQUITY,
                              std_col.HIV_DIAGNOSES_PCT_SHARE,
=======
                df = self.generate_breakdown_df(breakdown, geo_level)

                float_cols = [std_col.HIV_POPULATION_PCT,
                              std_col.HIV_DIAGNOSES,
>>>>>>> 5688d4aa (hiv_population_pct rename)
                              std_col.HIV_DIAGNOSES_PER_100K,
                              std_col.HIV_POPULATION_PCT]
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
            'Race/Ethnicity': std_col.RACE_OR_HISPANIC_COL,
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
<<<<<<< HEAD
            std_col.HIV_POPULATION_PCT,
            std_col.HIV_DIAGNOSES_PCT_INEQUITY]
=======
            std_col.HIV_POPULATION_PCT]
>>>>>>> 5688d4aa (hiv_population_pct rename)

        breakdown_group_df = gcs_to_bq_util.load_csv_as_df_from_data_dir('hiv_time',
                                                                         f'hiv-{geo_level}-{breakdown}.csv',
                                                                         skiprows=8,
                                                                         thousands=',',
                                                                         dtype={'FIPS': str, 'Year': str})
        # append the alls DF
        combined_group_df = pd.concat([breakdown_group_df, alls_df], axis=0)

        combined_group_df = combined_group_df.rename(
            columns=columns_to_standard)
        combined_group_df = combined_group_df.sort_values(
            [FIPS, breakdown]).reset_index(drop=True)

        # replace unformatted HIV data with standardized df
        combined_group_df = combined_group_df.replace(
            HIV_TERMS_STANDARD_BY_COL)

        # replace string number with whole number
        combined_group_df[std_col.HIV_DIAGNOSES] = combined_group_df[std_col.HIV_DIAGNOSES].replace(',',
                                                                                                    '',
                                                                                                    regex=True)

        if geo_level == COUNTY_LEVEL:
            combined_group_df = merge_county_names(combined_group_df)
            combined_group_df[std_col.STATE_FIPS_COL] = combined_group_df[std_col.COUNTY_FIPS_COL].str.slice(
                0, 2)

        if geo_level == NATIONAL_LEVEL:
            combined_group_df[std_col.STATE_FIPS_COL] = US_FIPS

        if breakdown == std_col.RACE_OR_HISPANIC_COL:
            combined_group_df = combined_group_df.replace(
                RACE_GROUPS_TO_STANDARD)
            combined_group_df = combined_group_df.rename(
                columns={std_col.RACE_OR_HISPANIC_COL: std_col.RACE_CATEGORY_ID_COL})
            std_col.add_race_columns_from_category_id(combined_group_df)
            columns_to_keep.append(std_col.RACE_CATEGORY_ID_COL)

        combined_group_df = generate_pct_share_col_without_unknowns(combined_group_df,
                                                                    PCT_SHARE_DICT,
                                                                    breakdown,
                                                                    std_col.ALL_VALUE)

        combined_group_df = generate_pct_rel_inequity_col(combined_group_df,
                                                          std_col.HIV_DIAGNOSES_PCT_SHARE,
                                                          std_col.HIV_POPULATION_PCT,
                                                          std_col.HIV_DIAGNOSES_PCT_INEQUITY)

        df = combined_group_df[columns_to_keep]

        return df


# RACE_GROUPS_TO_STANDARD = {
#     std_col.RACE_OR_HISPANIC_COL: {
#         'All races/ethnicities': std_col.Race.ALL,
#         'American Indian/Alaska Native': std_col.Race.AIAN_NH.value,
#         'Asian': std_col.Race.ASIAN_NH.value,
#         'Black/African American': std_col.Race.BLACK_NH.value,
#         'Hispanic/Latino': std_col.Race.HISP.value,
#         'Multiracial': std_col.Race.MULTI_NH.value,
#         'Native Hawaiian/Other Pacific Islander': std_col.Race.NHPI_NH.value,
#         'White': std_col.Race.WHITE_NH.value}}

# ALL_GROUPS_TO_STANDARD = {
#     std_col.AGE_COL: {'Ages 13 years and older': std_col.ALL_VALUE},
#     std_col.SEX_COL: {'Both sexes': std_col.ALL_VALUE}}

# MISSING_DATA_TO_STANDARD = {
#     std_col.HIV_DIAGNOSES: {'Data suppressed': np.nan, 'Data not available': np.nan},
#     std_col.HIV_DIAGNOSES_PER_100K: {'Data suppressed': np.nan, 'Data not available': np.nan}}

# TIME_PERIOD_TO_STANDARD = {
#     std_col.TIME_PERIOD_COL: {'2020 (COVID-19 Pandemic)': '2020'}}

        # combined_group_df = combined_group_df.replace(MISSING_DATA_TO_STANDARD)
        # combined_group_df = combined_group_df.replace(ALL_GROUPS_TO_STANDARD)
        # combined_group_df = combined_group_df.replace(TIME_PERIOD_TO_STANDARD)
