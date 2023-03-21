import numpy as np
import pandas as pd
from typing import cast
from datasources.data_source import DataSource
from ingestion.constants import (COUNTY_LEVEL,
                                 STATE_LEVEL,
                                 NATIONAL_LEVEL,
                                 US_FIPS)
from ingestion.dataset_utils import (generate_pct_share_col_without_unknowns,
                                     generate_pct_rel_inequity_col)
from ingestion import gcs_to_bq_util, standardized_columns as std_col
from ingestion.merge_utils import merge_county_names
from ingestion.types import SEX_RACE_ETH_AGE_TYPE

# constants
HIV_DIR = 'cdc_hiv'
DTYPE = {'FIPS': str, 'Year': str}

NA_VALUES = ['Data suppressed', 'Data not available']
CDC_ATLAS_COLS = ['Year', 'Geography', 'FIPS']
CDC_DEM_COLS = ['Age Group', 'Race/Ethnicity', 'Sex']

DEM_COLS_STANDARD = {
    std_col.AGE_COL: 'Age Group',
    std_col.RACE_OR_HISPANIC_COL: 'Race/Ethnicity',
    std_col.SEX_COL: 'Sex'}

HIV_DETERMINANTS = {
    'diagnoses': std_col.HIV_DIAGNOSES_PREFIX,
    'deaths': std_col.HIV_DEATHS_PREFIX,
    'prep': std_col.PREP_PREFIX}

PCT_SHARE_MAP = {}
for prefix in HIV_DETERMINANTS.values():
    PCT_SHARE_MAP[prefix] = std_col.generate_column_name(
        prefix, std_col.PCT_SHARE_SUFFIX)
PCT_SHARE_MAP[std_col.HIV_PREP_POPULATION] = std_col.HIV_PREP_POPULATION_PCT
PCT_SHARE_MAP[std_col.POPULATION_COL] = std_col.HIV_POPULATION_PCT

PER_100K_MAP = {std_col.PREP_PREFIX: std_col.HIV_PREP_COVERAGE}
for prefix in HIV_DETERMINANTS.values():
    if prefix != std_col.PREP_PREFIX:
        PER_100K_MAP[prefix] = std_col.generate_column_name(
            prefix, std_col.PER_100K_SUFFIX)

PCT_RELATIVE_INEQUITY_MAP = {}
for prefix in HIV_DETERMINANTS.values():
    PCT_RELATIVE_INEQUITY_MAP[prefix] = std_col.generate_column_name(
        prefix, std_col.PCT_REL_INEQUITY_SUFFIX)

# a nested dictionary that contains values swaps per column name
BREAKDOWN_TO_STANDARD_BY_COL = {
    std_col.AGE_COL: {'Ages 13 years and older': std_col.ALL_VALUE},
    std_col.RACE_CATEGORY_ID_COL: {
        'All races/ethnicities': std_col.Race.ALL.value,
        'American Indian/Alaska Native': std_col.Race.AIAN_NH.value,
        'Asian': std_col.Race.ASIAN_NH.value,
        'Black/African American': std_col.Race.BLACK_NH.value,
        'Hispanic/Latino': std_col.Race.HISP.value,
        'Multiracial': std_col.Race.MULTI_NH.value,
        'Other': std_col.Race.OTHER_NONSTANDARD_NH.value,
        'Native Hawaiian/Other Pacific Islander': std_col.Race.NHPI_NH.value,
        'White': std_col.Race.WHITE_NH.value},
    std_col.SEX_COL: {'Both sexes': std_col.ALL_VALUE}
}


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
            alls_df = load_atlas_df_from_data_dir(geo_level, 'all')

            for breakdown in [std_col.AGE_COL, std_col.RACE_OR_HISPANIC_COL, std_col.SEX_COL]:
                table_name = f'{breakdown}_{geo_level}_time_series'
                df = self.generate_breakdown_df(breakdown, geo_level, alls_df)

                float_cols = [std_col.HIV_PREP_COVERAGE,
                              std_col.HIV_POPULATION_PCT]
                for col in HIV_DETERMINANTS.values():
                    float_cols.append(col)
                    float_cols.append(std_col.generate_column_name(
                        col, std_col.PCT_REL_INEQUITY_SUFFIX))
                    float_cols.append(std_col.generate_column_name(
                        col, std_col.PCT_SHARE_SUFFIX))
                    if col != std_col.PREP_PREFIX:
                        float_cols.append(std_col.generate_column_name(
                            col, std_col.PER_100K_SUFFIX))

                col_types = gcs_to_bq_util.get_bq_column_types(df, float_cols)

                gcs_to_bq_util.add_df_to_bq(df,
                                            dataset,
                                            table_name,
                                            column_types=col_types)

    def generate_breakdown_df(self, breakdown: str, geo_level: str, alls_df: pd.DataFrame):
        """generate_breakdown_df generates a HIV data frame by breakdown and geo_level

        breakdown: string equal to `age`, `race_and_ethnicity`, or `sex`
        geo_level: string equal to `county`, `national`, or `state`
        alls_df: the data frame containing the all values for each demographic breakdown.
        return: a data frame of time-based HIV data by breakdown and geo_level"""

        geo_to_use = std_col.COUNTY_NAME_COL if geo_level == COUNTY_LEVEL else std_col.STATE_NAME_COL
        fips_to_use = std_col.COUNTY_FIPS_COL if geo_level == COUNTY_LEVEL else std_col.STATE_FIPS_COL

        cols_to_standard = {
            'Age Group': std_col.AGE_COL,
            'FIPS': fips_to_use,
            'Geography': geo_to_use,
            'Population': std_col.POPULATION_COL,
            'Race/Ethnicity': std_col.RACE_CATEGORY_ID_COL,
            'Sex': std_col.SEX_COL,
            'Year': std_col.TIME_PERIOD_COL}

        cols_to_keep = [
            std_col.TIME_PERIOD_COL,
            geo_to_use,
            fips_to_use,
            breakdown,
            std_col.HIV_POPULATION_PCT]

        breakdown_group_df = load_atlas_df_from_data_dir(geo_level, breakdown)

        combined_group_df = pd.concat([breakdown_group_df, alls_df], axis=0)

        df = combined_group_df.rename(columns=cols_to_standard)

        df = df.replace(to_replace=BREAKDOWN_TO_STANDARD_BY_COL)

        if geo_level == COUNTY_LEVEL:
            df = merge_county_names(df)
            df[std_col.STATE_FIPS_COL] = df[std_col.COUNTY_FIPS_COL].str.slice(0,
                                                                               2)

        if geo_level == NATIONAL_LEVEL:
            df[std_col.STATE_FIPS_COL] = US_FIPS

        if breakdown == std_col.RACE_OR_HISPANIC_COL:
            std_col.add_race_columns_from_category_id(df)
            cols_to_keep.append(std_col.RACE_CATEGORY_ID_COL)

        if std_col.HIV_DEATHS_PREFIX not in df.columns:
            df[[std_col.HIV_DEATHS_PREFIX,
                PER_100K_MAP[std_col.HIV_DEATHS_PREFIX]]] = np.nan

        if std_col.PREP_PREFIX not in df.columns:
            df[[std_col.PREP_PREFIX, std_col.HIV_PREP_COVERAGE]] = np.nan

        df = generate_pct_share_col_without_unknowns(df,
                                                     PCT_SHARE_MAP,
                                                     cast(SEX_RACE_ETH_AGE_TYPE,
                                                          breakdown),
                                                     std_col.ALL_VALUE)

        for col in HIV_DETERMINANTS.values():
            pop_col = std_col.HIV_POPULATION_PCT
            if col == std_col.PREP_PREFIX:
                pop_col = std_col.HIV_PREP_POPULATION_PCT
                cols_to_keep.append(pop_col)

            df = generate_pct_rel_inequity_col(df,
                                               PCT_SHARE_MAP[col],
                                               pop_col,
                                               PCT_RELATIVE_INEQUITY_MAP[col])
            cols_to_keep.append(col)
            cols_to_keep.append(PER_100K_MAP[col])
            cols_to_keep.append(PCT_SHARE_MAP[col])
            cols_to_keep.append(PCT_RELATIVE_INEQUITY_MAP[col])

        df = df[cols_to_keep]
        df = df.sort_values(
            [std_col.TIME_PERIOD_COL, breakdown]).reset_index(drop=True)

        return df


def load_atlas_df_from_data_dir(geo_level: str, breakdown: str):
    """load_atlas_from_data_dir generates HIV data (diagnoes, deaths & prep)
    by breakdown and geo_level

    breakdown: string equal to `age`, `race_and_ethnicity`, or `sex`
    geo_level: string equal to `county`, `national`, or `state`
    return: a data frame of time-based HIV data by breakdown and
    geo_level with AtlasPlus columns"""
    cols_to_exclude = generate_cols_to_exclude(breakdown)
    output_df = pd.DataFrame(columns=CDC_ATLAS_COLS)

    for determinant in HIV_DETERMINANTS.values():
        if (determinant == std_col.HIV_DEATHS_PREFIX and geo_level == COUNTY_LEVEL) or \
           (determinant == std_col.PREP_PREFIX and breakdown == std_col.RACE_OR_HISPANIC_COL
                and geo_level != NATIONAL_LEVEL):
            continue

        else:
            df = gcs_to_bq_util.load_csv_as_df_from_data_dir(HIV_DIR,
                                                             f'{determinant}-{geo_level}-{breakdown}.csv',
                                                             subdirectory=determinant,
                                                             skiprows=8,
                                                             na_values=NA_VALUES,
                                                             usecols=lambda x: x not in cols_to_exclude,
                                                             thousands=',',
                                                             dtype=DTYPE)
            cols_to_standard = {
                'Cases': determinant,
                'Rate per 100000': PER_100K_MAP[determinant],
                'Percent': std_col.HIV_PREP_COVERAGE}

            if determinant == std_col.PREP_PREFIX:
                cols_to_standard['Population'] = std_col.HIV_PREP_POPULATION
                df = df.replace({'13-24': '16-24'})

            df = df.rename(columns=cols_to_standard)

            output_df = output_df.merge(df, how='outer')

    return output_df


def generate_cols_to_exclude(breakdown: str):
    """
    breakdown: string equal to `age`, `race_and_ethnicity`, or `sex`
    return: a list of columns to exclude when reading csv file
    """
    cols = ['Indicator', 'Transmission Category']

    if breakdown != 'all':
        cols.extend(
            filter(lambda x: x != DEM_COLS_STANDARD[breakdown], CDC_DEM_COLS))

    return cols
