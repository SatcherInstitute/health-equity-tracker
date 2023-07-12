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
from ingestion.types import HIV_BREAKDOWN_TYPE
from typing import cast


# constants
DTYPE = {'FIPS': str, 'Year': str}
ATLAS_COLS = ['Indicator', 'Transmission Category', 'Rate LCI', 'Rate UCI']
NA_VALUES = ['Data suppressed', 'Data not available']
CDC_ATLAS_COLS = ['Year', 'Geography', 'FIPS']
CDC_DEM_COLS = ['Age Group', 'Race/Ethnicity', 'Sex']

DEM_COLS_STANDARD = {
    std_col.AGE_COL: 'Age Group',
    std_col.RACE_OR_HISPANIC_COL: 'Race/Ethnicity',
    std_col.SEX_COL: 'Sex'}

HIV_DETERMINANTS = {
    'care': std_col.HIV_CARE_PREFIX,
    'deaths': std_col.HIV_DEATHS_PREFIX,
    'diagnoses': std_col.HIV_DIAGNOSES_PREFIX,
    'prep': std_col.HIV_PREP_PREFIX,
    'prevalence': std_col.HIV_PREVALENCE_PREFIX,
    'stigma': std_col.HIV_STIGMA_INDEX}

NON_PER_100K_LIST = [std_col.HIV_CARE_PREFIX,
                     std_col.HIV_PREP_PREFIX, std_col.HIV_STIGMA_INDEX]

PER_100K_MAP = {prefix: std_col.generate_column_name(prefix, std_col.PER_100K_SUFFIX)
                for prefix in HIV_DETERMINANTS.values() if prefix not in NON_PER_100K_LIST}


PCT_SHARE_MAP = {prefix: std_col.generate_column_name(prefix, std_col.PCT_SHARE_SUFFIX)
                 for prefix in HIV_DETERMINANTS.values() if prefix != std_col.HIV_STIGMA_INDEX}
PCT_SHARE_MAP[std_col.HIV_PREP_POPULATION] = std_col.HIV_PREP_POPULATION_PCT
PCT_SHARE_MAP[std_col.POPULATION_COL] = std_col.HIV_POPULATION_PCT
PCT_SHARE_MAP[std_col.HIV_CARE_POPULATION] = std_col.HIV_CARE_POPULATION_PCT

TEST_PCT_SHARE_MAP = {
    std_col.HIV_DIAGNOSES_PREFIX: 'hiv_diagnoses_pct_share',
    std_col.HIV_DEATHS_PREFIX: 'hiv_deaths_pct_share',
    std_col.HIV_PREVALENCE_PREFIX: 'hiv_prevalence_pct_share',
    std_col.POPULATION_COL: std_col.HIV_POPULATION_PCT
}

PCT_RELATIVE_INEQUITY_MAP = {
    prefix: std_col.generate_column_name(
        prefix, std_col.PCT_REL_INEQUITY_SUFFIX)
    for prefix in HIV_DETERMINANTS.values() if prefix != std_col.HIV_STIGMA_INDEX}

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
    std_col.SEX_COL: {'Both sexes': std_col.ALL_VALUE}}

CARE_PREP_MAP = {
    std_col.HIV_CARE_PREFIX: std_col.HIV_CARE_LINKAGE,
    std_col.HIV_PREP_PREFIX: std_col.HIV_PREP_COVERAGE}

POP_MAP = {
    std_col.HIV_CARE_PREFIX: std_col.HIV_CARE_POPULATION,
    std_col.HIV_PREP_PREFIX: std_col.HIV_PREP_POPULATION,
    std_col.HIV_DEATHS_PREFIX: std_col.POPULATION_COL,
    std_col.HIV_DIAGNOSES_PREFIX: std_col.POPULATION_COL,
    std_col.HIV_PREVALENCE_PREFIX: std_col.POPULATION_COL,
    std_col.HIV_STIGMA_INDEX: std_col.POPULATION_COL}

# HIV dictionaries
DICTS = [HIV_DETERMINANTS, CARE_PREP_MAP, PER_100K_MAP,
         PCT_SHARE_MAP, PCT_RELATIVE_INEQUITY_MAP]

# Define base categories
BASE_COLS = [std_col.HIV_CARE_PREFIX, std_col.HIV_DEATHS_PREFIX,
             std_col.HIV_DIAGNOSES_PREFIX, std_col.HIV_PREP_PREFIX, std_col.HIV_PREVALENCE_PREFIX]
BASE_COLS_NO_PREP = [
    col for col in BASE_COLS if col != std_col.HIV_PREP_PREFIX]

# Split into categories for which 'per_100k' applies
BASE_COLS_PER_100K = [std_col.HIV_DEATHS_PREFIX,
                      std_col.HIV_DIAGNOSES_PREFIX, std_col.HIV_PREVALENCE_PREFIX]

# Generate 'per_100k', 'pct_share' and 'pct_relative_inequity' versions
PER_100K_COLS = [
    f'{col}_{std_col.PER_100K_SUFFIX}' for col in BASE_COLS_PER_100K]
PCT_SHARE_COLS = [f'{col}_{std_col.PCT_SHARE_SUFFIX}' for col in BASE_COLS]
BW_PCT_SHARE_COLS = [
    f'{col}_{std_col.PCT_SHARE_SUFFIX}' for col in BASE_COLS_PER_100K]
PCT_REL_INEQUITY_COLS = [
    f'{col}_{std_col.PCT_REL_INEQUITY_SUFFIX}' for col in BASE_COLS]
BW_PCT_REL_INEQUITY_COLS = [
    f'{col}_{std_col.PCT_REL_INEQUITY_SUFFIX}' for col in BASE_COLS_PER_100K]

# Define other common and unique columns
COMMON_COLS = [std_col.HIV_STIGMA_INDEX, std_col.HIV_CARE_PREFIX, std_col.HIV_PREP_COVERAGE,
               std_col.HIV_PREP_POPULATION_PCT, std_col.HIV_POPULATION_PCT, std_col.HIV_CARE_POPULATION_PCT]
GENDER_COLS = [f'{col}_{gender}' for col in BASE_COLS_NO_PREP for gender in [
    std_col.TOTAL_ADDITIONAL_GENDER, std_col.TOTAL_TRANS_MEN, std_col.TOTAL_TRANS_WOMEN]]
TOTAL_DEATHS = f'{std_col.HIV_DEATHS_PREFIX}_{std_col.RAW_SUFFIX}'


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
        demographic = self.get_attr(attrs, 'demographic')
        if demographic == std_col.RACE_COL:
            demographic = std_col.RACE_OR_HISPANIC_COL

            # MAKE RACE-AGE BREAKDOWN WITH ONLY COUNTS (NOT RATES) FOR AGE-ADJUSTMENT
            for geo_level in [NATIONAL_LEVEL, STATE_LEVEL]:
                print("make race-age", geo_level)
                table_name = f'by_race_age_{geo_level}'
                race_age_df = self.generate_race_age_deaths_df(geo_level)
                float_cols = [TOTAL_DEATHS, std_col.POPULATION_COL]
                col_types = gcs_to_bq_util.get_bq_column_types(
                    race_age_df, float_cols)
                gcs_to_bq_util.add_df_to_bq(race_age_df,
                                            dataset,
                                            table_name,
                                            column_types=col_types)

        # MAKE SINGLE BREAKDOWN AND BLACK WOMEN TABLES
        for geo_level in [NATIONAL_LEVEL, STATE_LEVEL, COUNTY_LEVEL]:
            if geo_level == COUNTY_LEVEL and demographic == std_col.BLACK_WOMEN:
                pass
            else:
                all = 'black_women_all' if demographic == std_col.BLACK_WOMEN else 'all'

                table_name = f'{demographic}_{geo_level}_time_series'
                alls_df = load_atlas_df_from_data_dir(geo_level, all)
                df = self.generate_breakdown_df(
                    demographic, geo_level, alls_df)

                if demographic == std_col.BLACK_WOMEN:
                    float_cols = BASE_COLS_PER_100K + PER_100K_COLS + BW_PCT_SHARE_COLS + \
                        [std_col.HIV_POPULATION_PCT] + BW_PCT_REL_INEQUITY_COLS
                else:
                    float_cols = BASE_COLS + COMMON_COLS + PER_100K_COLS + PCT_SHARE_COLS + \
                        PCT_REL_INEQUITY_COLS
                    if geo_level == NATIONAL_LEVEL and demographic == std_col.SEX_COL:
                        float_cols += GENDER_COLS

                col_types = gcs_to_bq_util.get_bq_column_types(
                    df, float_cols)

                gcs_to_bq_util.add_df_to_bq(df,
                                            dataset,
                                            table_name,
                                            column_types=col_types)

    def generate_breakdown_df(self, breakdown: str, geo_level: str, alls_df: pd.DataFrame):
        """generate_breakdown_df generates a HIV data frame by breakdown and geo_level

        breakdown: string equal to `age`, `black_women`, `race_and_ethnicity`, or `sex`
        geo_level: string equal to `county`, `national`, or `state`
        alls_df: the data frame containing the all values for each demographic breakdown
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

        if breakdown in [std_col.RACE_OR_HISPANIC_COL, std_col.BLACK_WOMEN]:
            std_col.add_race_columns_from_category_id(df)

        if breakdown != std_col.BLACK_WOMEN:
            if std_col.HIV_DEATHS_PREFIX not in df.columns:
                df[[std_col.HIV_DEATHS_PREFIX,
                    PER_100K_MAP[std_col.HIV_DEATHS_PREFIX]]] = np.nan

            if std_col.HIV_PREP_PREFIX not in df.columns:
                df[[std_col.HIV_PREP_PREFIX, std_col.HIV_PREP_COVERAGE]] = np.nan

            if std_col.HIV_STIGMA_INDEX not in df.columns:
                df[[std_col.HIV_STIGMA_INDEX]] = np.nan

        if breakdown == std_col.BLACK_WOMEN:
            df = generate_pct_share_col_without_unknowns(df,
                                                         TEST_PCT_SHARE_MAP,
                                                         cast(HIV_BREAKDOWN_TYPE, std_col.AGE_COL),
                                                         std_col.ALL_VALUE)

        else:
            df = generate_pct_share_col_without_unknowns(df,
                                                         PCT_SHARE_MAP,
                                                         cast(HIV_BREAKDOWN_TYPE, breakdown),
                                                         std_col.ALL_VALUE)

        additional_cols_to_keep = []
        for dict in DICTS:
            additional_cols_to_keep += list(dict.values())

            for col in HIV_DETERMINANTS.values():
                pop_col = std_col.HIV_POPULATION_PCT
                if col == std_col.HIV_PREP_PREFIX:
                    pop_col = std_col.HIV_PREP_POPULATION_PCT
                if col == std_col.HIV_CARE_PREFIX:
                    pop_col = std_col.HIV_CARE_POPULATION_PCT

                if (breakdown == std_col.BLACK_WOMEN) and (col in BASE_COLS_PER_100K):
                    df = generate_pct_rel_inequity_col(df,
                                                       PCT_SHARE_MAP[col],
                                                       pop_col,
                                                       PCT_RELATIVE_INEQUITY_MAP[col])

                elif breakdown != std_col.BLACK_WOMEN:
                    if col != std_col.HIV_STIGMA_INDEX:
                        df = generate_pct_rel_inequity_col(df,
                                                           PCT_SHARE_MAP[col],
                                                           pop_col,
                                                           PCT_RELATIVE_INEQUITY_MAP[col])

        if breakdown == std_col.SEX_COL and geo_level == NATIONAL_LEVEL:
            additional_cols_to_keep.extend(GENDER_COLS)

        cols_to_keep = [
            std_col.TIME_PERIOD_COL,
            geo_to_use,
            fips_to_use,
        ]

        if breakdown == std_col.BLACK_WOMEN:
            cols_to_keep.extend(
                [
                    std_col.AGE_COL,
                    std_col.RACE_OR_HISPANIC_COL,
                    std_col.RACE_CATEGORY_ID_COL,
                    std_col.SEX_COL
                ])
            cols_to_keep.extend(BASE_COLS_PER_100K)
            cols_to_keep.extend(PER_100K_COLS)
            cols_to_keep.extend(BW_PCT_SHARE_COLS)
            cols_to_keep.append(std_col.HIV_POPULATION_PCT)
            cols_to_keep.extend(BW_PCT_REL_INEQUITY_COLS)
        elif breakdown == std_col.RACE_OR_HISPANIC_COL:
            cols_to_keep.extend([breakdown, std_col.RACE_CATEGORY_ID_COL])
            cols_to_keep.extend(additional_cols_to_keep)

        else:
            cols_to_keep.append(breakdown)
            cols_to_keep.extend(additional_cols_to_keep)

        df = df[cols_to_keep]

        return df

    def generate_race_age_deaths_df(self, geo_level):
        """ load in CDC Atlas table from /data for by race by age by geo_level,
        and keep the counts needed for age-adjustment """

        df = gcs_to_bq_util.load_csv_as_df_from_data_dir(
            'cdc_hiv',
            f'hiv-deaths-{geo_level}-race_and_ethnicity-age.csv',
            subdirectory="hiv_deaths",
            skiprows=8,
            na_values=NA_VALUES,
            usecols=['Geography', 'FIPS', 'Age Group', 'Race/Ethnicity', 'Cases', 'Population'],
            thousands=',',
            dtype=DTYPE
        )

        # fix poorly formatted state names
        df['Geography'] = df['Geography'].str.replace('^', '', regex=False)

        # rename columns
        df = df.rename(columns={
            'Geography': std_col.STATE_NAME_COL,
            'FIPS': std_col.STATE_FIPS_COL,
            'Age Group': std_col.AGE_COL,
            'Race/Ethnicity': std_col.RACE_CATEGORY_ID_COL,
            'Cases': TOTAL_DEATHS,
            'Population': std_col.POPULATION_COL
        })

        # rename data items
        df = df.replace(to_replace=BREAKDOWN_TO_STANDARD_BY_COL)
        if geo_level == NATIONAL_LEVEL:
            df[std_col.STATE_FIPS_COL] = US_FIPS

        std_col.add_race_columns_from_category_id(df)

        return df


def load_atlas_df_from_data_dir(geo_level: str, breakdown: str):
    """load_atlas_from_data_dir generates HIV data by breakdown and geo_level

    breakdown: string equal to `age`, `race_and_ethnicity`, `sex`, or `black_women`
    geo_level: string equal to `county`, `national`, or `state`
    return: a data frame of time-based HIV data by breakdown and
    geo_level with AtlasPlus columns"""
    output_df = pd.DataFrame(columns=CDC_ATLAS_COLS)
    hiv_directory = 'cdc_hiv_black_women' if std_col.BLACK_WOMEN in breakdown else 'cdc_hiv'

    for determinant in HIV_DETERMINANTS.values():
        atlas_cols_to_exclude = generate_atlas_cols_to_exclude(breakdown)

        no_black_women_data = (std_col.BLACK_WOMEN in breakdown) and (
            (determinant not in BASE_COLS_PER_100K))
        no_deaths_data = (determinant == std_col.HIV_DEATHS_PREFIX) and (
            geo_level == COUNTY_LEVEL)
        no_prep_data = (determinant == std_col.HIV_PREP_PREFIX) and (
            breakdown == std_col.RACE_OR_HISPANIC_COL and geo_level != NATIONAL_LEVEL)
        no_stigma_data = (determinant == std_col.HIV_STIGMA_INDEX) and (
            (geo_level == COUNTY_LEVEL) or (geo_level == STATE_LEVEL and breakdown != 'all'))

        if no_black_women_data or no_deaths_data or no_prep_data or no_stigma_data:
            continue

        else:

            if breakdown == std_col.BLACK_WOMEN:
                filename = f'{determinant}-{geo_level}-{breakdown}-age.csv'
            else:
                filename = f'{determinant}-{geo_level}-{breakdown}.csv'
            df = gcs_to_bq_util.load_csv_as_df_from_data_dir(hiv_directory,
                                                             filename,
                                                             subdirectory=determinant,
                                                             skiprows=8,
                                                             na_values=NA_VALUES,
                                                             usecols=lambda x: x not in atlas_cols_to_exclude,
                                                             thousands=',',
                                                             dtype=DTYPE)

            if (determinant in BASE_COLS_NO_PREP) and (breakdown == 'all') and (geo_level == NATIONAL_LEVEL):
                filename = f'{determinant}-{geo_level}-gender.csv'
                all_national_gender_df = gcs_to_bq_util.load_csv_as_df_from_data_dir(
                    hiv_directory,
                    filename,
                    subdirectory=determinant,
                    skiprows=8,
                    na_values=NA_VALUES,
                    usecols=lambda x: x not in atlas_cols_to_exclude,
                    thousands=',',
                    dtype=DTYPE
                )

                national_gender_cases_pivot = all_national_gender_df.pivot_table(
                    index='Year', columns='Sex', values='Cases', aggfunc='sum').reset_index()

                national_gender_cases_pivot.columns = [
                    'Year',
                    f'{determinant}_{std_col.TOTAL_ADDITIONAL_GENDER}',
                    f'{determinant}_{std_col.TOTAL_TRANS_MEN}',
                    f'{determinant}_{std_col.TOTAL_TRANS_WOMEN}'
                ]

                df = pd.merge(df, national_gender_cases_pivot, on='Year')

            if determinant in [std_col.HIV_CARE_PREFIX, std_col.HIV_PREP_PREFIX]:
                cols_to_standard = {
                    'Cases': determinant,
                    'Percent': CARE_PREP_MAP[determinant],
                    'Population': POP_MAP[determinant]}
            elif determinant == std_col.HIV_STIGMA_INDEX:
                cols_to_standard = {
                    'Rate per 100000': std_col.HIV_STIGMA_INDEX,
                    'Population': POP_MAP[determinant]
                }
            else:
                cols_to_standard = {
                    'Cases': determinant,
                    'Rate per 100000': PER_100K_MAP[determinant],
                    'Population': POP_MAP[determinant]}

            if determinant == std_col.HIV_PREP_PREFIX:
                df = df.replace({'13-24': '16-24'})
            elif determinant == std_col.HIV_STIGMA_INDEX:
                df = df.replace({'13-24': '18-24'})

            df['Geography'] = df['Geography'].str.replace('^', '', regex=False)

            df = df.rename(columns=cols_to_standard)

            if determinant == std_col.HIV_STIGMA_INDEX:
                df = df.drop(columns=['Cases', 'population'])

            output_df = output_df.merge(df, how='outer')

    return output_df


def generate_atlas_cols_to_exclude(breakdown: str):
    """
    Generates a list of columns exclude based on the breakdown.
    breakdown: string equal to `age`, `race_and_ethnicity`, or `sex`
    return: a list of columns to exclude when reading csv file
    """
    atlas_cols = ['Indicator', 'Transmission Category', 'Rate LCI', 'Rate UCI']

    if breakdown == 'race_and_ethnicity-age':
        atlas_cols.append('Sex')
    elif breakdown not in ['all', std_col.BLACK_WOMEN, 'black_women_all']:
        atlas_cols.extend(
            filter(lambda x: x != DEM_COLS_STANDARD[breakdown], CDC_DEM_COLS))

    return atlas_cols
