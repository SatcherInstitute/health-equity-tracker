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

# constants
HIV_DIR = 'cdc_hiv'
DIAGNOSES = 'diagnoses'
DEATHS = 'deaths'
PREP = 'prep'
DTYPE = {'FIPS': str, 'Year': str}

# a nested dictionary that contains values swaps per column name
HIV_TERMS_STANDARD_BY_COL = {
    std_col.AGE_COL: {'Ages 13 years and older': std_col.ALL_VALUE},
    std_col.RACE_CATEGORY_ID_COL: {
        'All races/ethnicities': std_col.Race.ALL.value,
        'American Indian/Alaska Native': std_col.Race.AIAN_NH.value,
        'Asian': std_col.Race.ASIAN_NH.value,
        'Black/African American': std_col.Race.BLACK_NH.value,
        'Hispanic/Latino': std_col.Race.HISP.value,
        'Multiracial': std_col.Race.MULTI_NH.value,
        'Native Hawaiian/Other Pacific Islander': std_col.Race.NHPI_NH.value,
        'Other': std_col.Race.MULTI_NH.value,
        'White': std_col.Race.WHITE_NH.value},
    std_col.SEX_COL: {'Both sexes': std_col.ALL_VALUE}
}

VALUES_TO_STANDARD = {'Data suppressed': np.nan, 'Data not available': np.nan}

DIAGNOSES_TO_STANDARD = {
    'Cases': std_col.HIV_DIAGNOSES,
    'Rate per 100000': std_col.HIV_DIAGNOSES_PER_100K}
DEATHS_TO_STANDARD = {
    'Cases': std_col.HIV_DEATHS,
    'Rate per 100000': std_col.HIV_DEATHS_PER_100K}
PREP_TO_STANDARD = {
    'Cases': std_col.HIV_PREP,
    'Percent': std_col.HIV_PREP_COVERAGE,
    'Population': std_col.HIV_PREP_POPULATION}


PCT_SHARE_DICT = {
    std_col.HIV_DIAGNOSES: std_col.HIV_DIAGNOSES_PCT_SHARE,
    std_col.POPULATION_COL: std_col.HIV_POPULATION_PCT,
    std_col.HIV_DEATHS: std_col.HIV_DEATHS_PCT_SHARE,
    std_col.HIV_PREP_POPULATION: std_col.HIV_PREP_PCT_SHARE}


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
            alls_df = load_df_from_data_dir(geo_level, 'all')

            for breakdown in [std_col.AGE_COL, std_col.RACE_OR_HISPANIC_COL, std_col.SEX_COL]:
                table_name = f'{breakdown}_{geo_level}_time_series'
                df = self.generate_breakdown_df(breakdown, geo_level, alls_df)

                float_cols = [std_col.HIV_DIAGNOSES,
                              std_col.HIV_DIAGNOSES_PCT_INEQUITY,
                              std_col.HIV_DIAGNOSES_PCT_SHARE,
                              std_col.HIV_DIAGNOSES_PER_100K,
                              std_col.HIV_DEATHS,
                              std_col.HIV_DEATHS_PCT_INEQUITY,
                              std_col.HIV_DEATHS_PCT_SHARE,
                              std_col.HIV_DEATHS_PER_100K,
                              std_col.HIV_PREP,
                              std_col.HIV_PREP_COVERAGE,
                              std_col.HIV_PREP_PCT_SHARE,
                              std_col.HIV_POPULATION_PCT]
                column_types = gcs_to_bq_util.get_bq_column_types(df,
                                                                  float_cols=float_cols)
                gcs_to_bq_util.add_df_to_bq(df,
                                            dataset,
                                            table_name,
                                            column_types=column_types)

    def generate_breakdown_df(self, breakdown: str, geo_level: str, alls_df: pd.DataFrame):
        """generate_breakdown_df generates a HIV data frame by breakdown and geo_level

        breakdown: string equal to `age`, `race_and_ethnicity`, or `sex`
        geo_level: string equal to `county`, `national`, or `state`
        alls_df: the data frame containing the all values for each demographic breakdown.
        return: a data frame of time-based HIV data by breakdown and geo_level"""

        GEO_COL = std_col.COUNTY_NAME_COL if geo_level == COUNTY_LEVEL else std_col.STATE_NAME_COL
        FIPS = std_col.COUNTY_FIPS_COL if geo_level == COUNTY_LEVEL else std_col.STATE_FIPS_COL

        columns_to_standard = {
            'Age Group': std_col.AGE_COL,
            'FIPS': FIPS,
            'Geography': GEO_COL,
            'Population': std_col.POPULATION_COL,
            'Race/Ethnicity': std_col.RACE_CATEGORY_ID_COL,
            'Sex': std_col.SEX_COL,
            'Year': std_col.TIME_PERIOD_COL}

        columns_to_keep = [
            std_col.TIME_PERIOD_COL,
            GEO_COL,
            FIPS,
            breakdown,
            std_col.HIV_DIAGNOSES,
            std_col.HIV_DEATHS,
            std_col.HIV_PREP,
            std_col.HIV_DIAGNOSES_PER_100K,
            std_col.HIV_DEATHS_PER_100K,
            std_col.HIV_PREP_COVERAGE,
            std_col.HIV_DIAGNOSES_PCT_SHARE,
            std_col.HIV_DEATHS_PCT_SHARE,
            std_col.HIV_PREP_PCT_SHARE,
            std_col.HIV_POPULATION_PCT,
            std_col.HIV_DIAGNOSES_PCT_INEQUITY,
            std_col.HIV_DEATHS_PCT_INEQUITY, ]

        breakdown_group_df = load_df_from_data_dir(geo_level, breakdown)

        combined_group_df = pd.concat([breakdown_group_df, alls_df], axis=0)

        df = combined_group_df.rename(columns=columns_to_standard)

        df = df.replace(to_replace=HIV_TERMS_STANDARD_BY_COL)
        df = df.replace(to_replace=VALUES_TO_STANDARD)

        if geo_level == COUNTY_LEVEL:
            df = merge_county_names(df)
            df[std_col.STATE_FIPS_COL] = df[std_col.COUNTY_FIPS_COL].str.slice(0,
                                                                               2)

        if geo_level == NATIONAL_LEVEL:
            df[std_col.STATE_FIPS_COL] = US_FIPS

        if breakdown == std_col.RACE_OR_HISPANIC_COL:
            std_col.add_race_columns_from_category_id(df)

        if std_col.HIV_DEATHS not in df.columns:
            df[[std_col.HIV_DEATHS, std_col.HIV_DEATHS_PER_100K]] = np.nan

        if std_col.HIV_PREP not in df.columns:
            df[[std_col.HIV_PREP, std_col.HIV_PREP_COVERAGE]] = np.nan

        # replace string number with whole number
        df = df.replace(',', '', regex=True)

        df = generate_pct_share_col_without_unknowns(df,
                                                     PCT_SHARE_DICT,
                                                     breakdown,
                                                     std_col.ALL_VALUE)

        df = generate_pct_rel_inequity_col(df,
                                           std_col.HIV_DIAGNOSES_PCT_SHARE,
                                           std_col.HIV_POPULATION_PCT,
                                           std_col.HIV_DIAGNOSES_PCT_INEQUITY)
        df = generate_pct_rel_inequity_col(df,
                                           std_col.HIV_DEATHS_PCT_SHARE,
                                           std_col.HIV_POPULATION_PCT,
                                           std_col.HIV_DEATHS_PCT_INEQUITY)

        df = df[columns_to_keep]
        df = df.sort_values([FIPS, breakdown]).reset_index(drop=True)

        return df


def load_df_from_data_dir(geo_level: str, breakdown: str):
    """
    load_df_from_data_dir fetches the csv file from the data dir

    filename: the name of the file to load the csv file from
    return: a dataframe for specified geo_level and breakdown
    """
    # data for HIV diagnoses is available at every geo level and breakdown
    diagnoses_df = gcs_to_bq_util.load_csv_as_df_from_data_dir(HIV_DIR,
                                                               f'{DIAGNOSES}-{geo_level}-{breakdown}.csv',
                                                               subdirectory=DIAGNOSES,
                                                               skiprows=8,
                                                               thousands=',',
                                                               dtype=DTYPE)
    df = diagnoses_df.rename(columns=DIAGNOSES_TO_STANDARD)
    df = df.drop(columns='Indicator')

    # data for HIV deaths is available at the state and national-level, with every breakdown
    if geo_level != COUNTY_LEVEL:
        deaths_df = gcs_to_bq_util.load_csv_as_df_from_data_dir(HIV_DIR,
                                                                f'{DEATHS}-{geo_level}-{breakdown}.csv',
                                                                subdirectory=DEATHS,
                                                                skiprows=8,
                                                                thousands=',',
                                                                dtype=DTYPE)
        deaths_df = deaths_df.rename(columns=DEATHS_TO_STANDARD)
        deaths_df = deaths_df.drop(columns='Indicator')
        df = pd.merge(df, deaths_df, how='outer', validate='one_to_one')

    # data for PREP is available at every geo level, but only available for race when on national
    is_national_and_race = geo_level == NATIONAL_LEVEL and breakdown == std_col.RACE_OR_HISPANIC_COL
    is_not_race = breakdown != std_col.RACE_OR_HISPANIC_COL
    if (is_national_and_race) or (is_not_race):
        prep_df = gcs_to_bq_util.load_csv_as_df_from_data_dir(HIV_DIR,
                                                              f'{PREP}-{geo_level}-{breakdown}.csv',
                                                              subdirectory=PREP,
                                                              skiprows=8,
                                                              thousands=',',
                                                              dtype=DTYPE)
        prep_df = prep_df[prep_df['Race/Ethnicity'] != 'Multiracial']
        prep_df = prep_df.replace(to_replace={'Other': 'Multiracial'})
        prep_df = prep_df.rename(columns=PREP_TO_STANDARD)
        prep_df = prep_df.drop(columns='Indicator')
        df = pd.merge(df, prep_df, how='outer', validate='one_to_one')

    if geo_level == COUNTY_LEVEL:
        df = df.drop(columns=['State', 'County'])

    return df
