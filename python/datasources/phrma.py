import numpy as np
import pandas as pd
from typing import List, Dict
from datasources.data_source import DataSource
from ingestion.constants import (COUNTY_LEVEL,
                                 STATE_LEVEL,
                                 NATIONAL_LEVEL,
                                 US_FIPS, US_NAME)
from ingestion.dataset_utils import (generate_pct_share_col_without_unknowns,
                                     generate_pct_rel_inequity_col)
from ingestion import gcs_to_bq_util, standardized_columns as std_col
from ingestion.merge_utils import merge_county_names
from ingestion.types import SEX_RACE_ETH_AGE_TYPE

# constants
PHRMA_DIR = 'phrma'
DTYPE = {'FIPS': str, 'Year': str}

PHRMA_FILE_MAP = {
    "sample_topic": "PQA_STA Results_2023-02-09_draft.xlsx"
}

# CDC_ATLAS_COLS = ['Year', 'Geography', 'FIPS']
# CDC_DEM_COLS = ['Age Group', 'Race/Ethnicity', 'Sex']

# DEM_COLS_STANDARD = {
#     std_col.AGE_COL: 'Age Group',
#     std_col.RACE_OR_HISPANIC_COL: 'Race/Ethnicity',
#     std_col.SEX_COL: 'Sex'}


# PCT_SHARE_MAP = {}
# for prefix in HIV_DETERMINANTS.values():
#     PCT_SHARE_MAP[prefix] = std_col.generate_column_name(
#         prefix, std_col.PCT_SHARE_SUFFIX)
# PCT_SHARE_MAP[std_col.HIV_PREP_POPULATION] = std_col.HIV_PREP_POPULATION_PCT
# PCT_SHARE_MAP[std_col.POPULATION_COL] = std_col.HIV_POPULATION_PCT

# PER_100K_MAP = {std_col.PREP_PREFIX: std_col.HIV_PREP_COVERAGE}
# for prefix in HIV_DETERMINANTS.values():
#     if prefix != std_col.PREP_PREFIX:
#         PER_100K_MAP[prefix] = std_col.generate_column_name(
#             prefix, std_col.PER_100K_SUFFIX)

# PCT_RELATIVE_INEQUITY_MAP = {}
# for prefix in HIV_DETERMINANTS.values():
#     PCT_RELATIVE_INEQUITY_MAP[prefix] = std_col.generate_column_name(
#         prefix, std_col.PCT_REL_INEQUITY_SUFFIX)

# a nested dictionary that contains values swaps per column name
# BREAKDOWN_TO_STANDARD_BY_COL = {
#     std_col.AGE_COL: {'Ages 13 years and older': std_col.ALL_VALUE},
#     std_col.RACE_CATEGORY_ID_COL: {
#         'All races/ethnicities': std_col.Race.ALL.value,
#         'American Indian/Alaska Native': std_col.Race.AIAN_NH.value,
#         'Asian': std_col.Race.ASIAN_NH.value,
#         'Black/African American': std_col.Race.BLACK_NH.value,
#         'Hispanic/Latino': std_col.Race.HISP.value,
#         'Multiracial': std_col.Race.MULTI_NH.value,
#         'Other': std_col.Race.OTHER_NONSTANDARD_NH.value,
#         'Native Hawaiian/Other Pacific Islander': std_col.Race.NHPI_NH.value,
#         'White': std_col.Race.WHITE_NH.value},
#     std_col.SEX_COL: {'Both sexes': std_col.ALL_VALUE}
# }


class PhrmaData(DataSource):

    @ staticmethod
    def get_id():
        return 'PHRMA_DATA'

    @ staticmethod
    def get_table_name():
        return 'phrma_data'

    def upload_to_gcs(self, gcs_bucket, **attrs):
        raise NotImplementedError(
            'upload_to_gcs should not be called for PhrmaData')

    def write_to_bq(self, dataset, gcs_bucket, **attrs):

        for geo_level in [COUNTY_LEVEL, NATIONAL_LEVEL, STATE_LEVEL]:
            print("geo_level:", geo_level)
            alls_df = load_phrma_df_from_data_dir(geo_level, 'all')

            for breakdown in [std_col.AGE_COL, std_col.RACE_OR_HISPANIC_COL, std_col.SEX_COL]:
                table_name = f'{breakdown}_{geo_level}_time_series'
                df = self.generate_breakdown_df(breakdown, geo_level, alls_df)

                float_cols = [std_col.HIV_PREP_COVERAGE,
                              std_col.HIV_POPULATION_PCT]

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
        return: a breakdown df by demographic and geo_level"""

        geo_to_use = std_col.COUNTY_NAME_COL if geo_level == COUNTY_LEVEL else std_col.STATE_NAME_COL
        fips_to_use = std_col.COUNTY_FIPS_COL if geo_level == COUNTY_LEVEL else std_col.STATE_FIPS_COL

        cols_to_standard = {
            'Age Group': std_col.AGE_COL,
            'FIPS': fips_to_use,
            'Geography': geo_to_use,
            'Population': std_col.POPULATION_COL,
            'Race/Ethnicity': std_col.RACE_CATEGORY_ID_COL,
            'Sex': std_col.SEX_COL,
            'Year': std_col.TIME_PERIOD_COL
        }

        cols_to_keep = [
            geo_to_use,
            fips_to_use,
            breakdown,
        ]

        breakdown_group_df = load_phrma_df_from_data_dir(geo_level, breakdown)

        combined_group_df = pd.concat([breakdown_group_df, alls_df], axis=0)

        df = combined_group_df.rename(columns=cols_to_standard)

        if geo_level == COUNTY_LEVEL:
            df = merge_county_names(df)
            df[std_col.STATE_FIPS_COL] = df[std_col.COUNTY_FIPS_COL].str.slice(0,
                                                                               2)

        if geo_level == NATIONAL_LEVEL:
            df[std_col.STATE_FIPS_COL] = US_FIPS

        if breakdown == std_col.RACE_OR_HISPANIC_COL:
            std_col.add_race_columns_from_category_id(df)
            cols_to_keep.append(std_col.RACE_CATEGORY_ID_COL)

        df = df[cols_to_keep]
        df = df.sort_values(
            [breakdown]).reset_index(drop=True)

        return df


def load_phrma_df_from_data_dir(geo_level: str, breakdown: str) -> pd.DataFrame:
    """ Generates Phrma data by breakdown and geo_level
    geo_level: string equal to `county`, `national`, or `state`
    breakdown: string equal to `age`, `race_and_ethnicity`, `sex`, or `all`
    return: a single data frame of data by demographic breakdown and
        geo_level with data columns loaded from multiple Phrma source tables """

    sheet_name = get_sheet_name(geo_level, breakdown)
    scaffold_cols = get_scaffold_cols(geo_level)

    # Starter cols to merge each loaded table on to
    output_df = pd.DataFrame(columns=scaffold_cols)

    for determinant, filename in PHRMA_FILE_MAP.items():

        print(determinant, filename, sheet_name)

        topic_df = gcs_to_bq_util.load_xlsx_as_df_from_data_dir(
            PHRMA_DIR,
            filename,
            sheet_name,
            dtype=DTYPE,
        )

        print(topic_df)

        output_df = output_df.merge(topic_df, how='outer')

    rename_col_map = get_rename_col_map(geo_level, breakdown)

    return output_df


def get_sheet_name(geo_level: str, breakdown: str) -> str:
    """ geo_level: string equal to `county`, `national`, or `state`
   breakdown: string equal to `age`, `race_and_ethnicity`, `sex`, or `all`
   return: a string sheet name based on the provided args  """

    sheet_map = {
        ("all", "national"): "All US",
        ("all", "state"): "All by State",
        ("all", "county"): "All by County",
        ("race", "national"): "Race_US",
        ("race", "state"): "Race_State",
        ("race", "county"): "Race_County",
        ("sex", "national"): "Sex_US",
        ("sex", "state"): "Sex_State",
        ("sex", "county"): "Sex_County",
        ("age", "national"): "Age_US",
        ("age", "state"): "Age_State",
        ("age", "county"): "Age_County",
    }

    return sheet_map[(breakdown, geo_level)]


def get_scaffold_cols(geo_level: str) -> List[str]:
    """ Get list of string column names that are consistent across all
    needed sheets to merge """

    scaffold_cols_map = {
        "national": ["STATE_FIPS", "STATE"],
        "state": ["STATE_CODE", "STATE_CODE"],
        "county": ["COUNTY_FIPS", "STATE_FIPS", "STATE", "COUNTY"]
    }

    return scaffold_cols_map[geo_level]


def get_rename_col_map(geo_level: str, breakdown: str) -> Dict[str, str]:
    """ Get map of col rename mappings to apply once sheets have been merged """

    rename_cols_map: Dict[str, str] = {}

    # if breakdown == std_col.RACE_OR_HISPANIC_COL:
    #     rename_cols_map[]

    return rename_cols_map
