from ingestion.het_types import GEO_TYPE, CANCER_TYPE_OR_ALL, SEX_RACE_ETH_AGE_TYPE
from ingestion import gcs_to_bq_util, dataset_utils
import ingestion.standardized_columns as std_col
from ingestion.constants import STATE_LEVEL, NATIONAL_LEVEL, US_FIPS
import pandas as pd
import numpy as np
from typing import Dict, cast, List
from ingestion.merge_utils import merge_dfs_list

# Column Constants
YEAR_COL = "Year"
RACE_NAME = "Race"
AGE_GROUP = "Age Groups"
SEX_COL = "Sex"
COUNT_COL = "Count"
POP_COL = "Population"
CRUDE_RATE_COL = "Crude Rate"

# State column names for different breakdowns
STATE_CODE_RACE = "States Code"  # For race breakdown
STATE_CODE_DEFAULT = 'States and Puerto Rico Code'  # For age, sex, and all breakdowns

TMP_ALL: CANCER_TYPE_OR_ALL = 'all'
CDC_DIR = 'cdc_wonder'


# Cancer conditions based on sex breakdown requirements
CDC_CANCER_PCT_CONDITIONS_WITH_SEX_BREAKDOWN = ["Colorectal", "Lung"]
CDC_CANCER_PCT_CONDITIONS = ["Breast", "Cervical", "Prostate"] + CDC_CANCER_PCT_CONDITIONS_WITH_SEX_BREAKDOWN

# Mapping for demographic breakdowns
breakdown_het_to_source_type = {
    "age": AGE_GROUP,
    "race_and_ethnicity": RACE_NAME,
    "sex": SEX_COL,
}


# Standard mapping for breakdowns
BREAKDOWN_TO_STANDARD_BY_COL = {
    # AGE source groups already match needed HET groups
    std_col.RACE_CATEGORY_ID_COL: {
        'American Indian or Alaska Native': std_col.Race.AIAN_NH.value,
        'Asian or Pacific Islander': std_col.Race.API_NH.value,
        'Hispanic': std_col.Race.HISP.value,
        'White': std_col.Race.WHITE_NH.value,
        'Black or African American': std_col.Race.BLACK_NH.value,
        'Other Races and Unknown combined': std_col.Race.OTHER_NONSTANDARD_NH.value,
    },
    # SEX source groups already match needed HET groups
}

DTYPE = {STATE_CODE_RACE: str, STATE_CODE_DEFAULT: str}


def get_state_code_col(breakdown: CANCER_TYPE_OR_ALL) -> str:
    """Returns appropriate state code column based on breakdown type and geo level"""
    if breakdown == std_col.RACE_OR_HISPANIC_COL:
        return STATE_CODE_RACE  # Returns "States Code" for race breakdowns at any level
    return STATE_CODE_DEFAULT  # Returns "States and PR Code" for all other breakdowns


def get_sheet_name(geo_level: GEO_TYPE, breakdown: CANCER_TYPE_OR_ALL) -> str:
    """geo_level: string equal to `national`, or `state`
    breakdown: string demographic breakdown type
    return: a string sheet name based on the provided args"""

    sheet_map = {
        (TMP_ALL, NATIONAL_LEVEL): "US",
        (TMP_ALL, STATE_LEVEL): "State",
        (std_col.RACE_OR_HISPANIC_COL, NATIONAL_LEVEL): "Race_US",
        (std_col.RACE_OR_HISPANIC_COL, STATE_LEVEL): "Race_State",
        (std_col.SEX_COL, NATIONAL_LEVEL): "Sex_US",
        (std_col.SEX_COL, STATE_LEVEL): "Sex_State",
        (std_col.AGE_COL, NATIONAL_LEVEL): "Age_US",
        (std_col.AGE_COL, STATE_LEVEL): "Age_State",
    }

    return sheet_map[(breakdown, geo_level)]


def load_cdc_df_from_data_dir(
    geo_level: GEO_TYPE,
    breakdown: CANCER_TYPE_OR_ALL,
    conditions: List[str],
) -> pd.DataFrame:
    """Generates CDC data by breakdown and geo_level
    geo_level: string equal to `national` or `state`
    breakdown: string equal to `age`, `race_and_ethnicity`, `sex`, or `all`
    conditions: list of cancer conditions to process
    return: a single data frame of data by demographic breakdown and
        geo_level with data columns loaded from multiple CDC source tables"""

    sheet_name = get_sheet_name(geo_level, breakdown)
    merge_cols = []
    merge_cols.append(std_col.STATE_FIPS_COL)

    if breakdown != TMP_ALL:
        breakdown_col = std_col.RACE_CATEGORY_ID_COL if breakdown == std_col.RACE_OR_HISPANIC_COL else breakdown
        merge_cols.append(breakdown_col)

    breakdown_het_to_source_type = {
        "age": AGE_GROUP,
        "race_and_ethnicity": RACE_NAME,
        "sex": SEX_COL,
    }

    # only read certain columns from source data
    keep_cols = []
    fips_length = 2

    if breakdown != TMP_ALL:
        keep_cols.append(breakdown_het_to_source_type[breakdown])

    state_code_col = get_state_code_col(breakdown)
    if geo_level == STATE_LEVEL:
        keep_cols.append(state_code_col)

    # Add base columns to keep
    keep_cols.extend(
        [
            YEAR_COL,
            COUNT_COL,
            POP_COL,
            CRUDE_RATE_COL,
        ]
    )

    topic_dfs = []

    for condition in conditions:
        folder_name = f'CDC_Wonder_{condition}_Cancer'
        file_name = f'{folder_name}-{sheet_name}.csv'

        topic_df = gcs_to_bq_util.load_csv_as_df_from_data_dir(
            CDC_DIR,
            file_name,
            subdirectory=folder_name,
            dtype=DTYPE,
            na_values=['Not Applicable'],
            usecols=keep_cols,
        )

        # Filter for most recent year (2021)
        topic_df = topic_df[topic_df[YEAR_COL] == 2021]
        topic_df = topic_df.drop(columns=[YEAR_COL])

        if geo_level == NATIONAL_LEVEL:
            topic_df[state_code_col] = US_FIPS

        topic_df = rename_cols(
            topic_df,
            cast(GEO_TYPE, geo_level),
            cast(SEX_RACE_ETH_AGE_TYPE, breakdown),
            condition,
            state_code_col,
        )

        topic_dfs.append(topic_df)

    df_merged = merge_dfs_list(topic_dfs, merge_cols)

    # drop rows that dont include FIPS and DEMO values
    df_merged = df_merged[df_merged[std_col.STATE_FIPS_COL].notna()]
    df_merged = dataset_utils.ensure_leading_zeros(df_merged, std_col.STATE_FIPS_COL, fips_length)

    return df_merged


def rename_cols(
    df: pd.DataFrame,
    geo_level: GEO_TYPE,
    breakdown: CANCER_TYPE_OR_ALL,
    condition: str,
    state_code_col: str,
) -> pd.DataFrame:
    """Renames columns based on the demo/geo breakdown"""

    # Create consistent column names for cancer data
    rename_cols_map: Dict[str, str] = {
        COUNT_COL: f'{condition.lower()}_count_{std_col.RAW_SUFFIX}',
        POP_COL: f'{condition.lower()}_population_{std_col.RAW_SUFFIX}',
        CRUDE_RATE_COL: f'{condition.lower()}_{std_col.PER_100K_SUFFIX}',
    }

    if geo_level in [STATE_LEVEL, NATIONAL_LEVEL]:
        rename_cols_map[state_code_col] = std_col.STATE_FIPS_COL

    if breakdown == std_col.RACE_OR_HISPANIC_COL:
        rename_cols_map[RACE_NAME] = std_col.RACE_CATEGORY_ID_COL

    if breakdown == std_col.AGE_COL:
        rename_cols_map[AGE_GROUP] = std_col.AGE_COL

    if breakdown == std_col.SEX_COL:
        rename_cols_map[SEX_COL] = std_col.SEX_COL

    df = df.rename(columns=rename_cols_map)
    return df


def get_age_adjusted_ratios(df: pd.DataFrame, conditions: List[str]) -> pd.DataFrame:
    """Adds columns for crude rate ratios (comparing each race's
    rate to the rate for White NH) for each type of cancer."""

    _tmp_white_rates_col = 'WHITE_NH_RATE'

    for condition in conditions:
        cancer_type = condition.lower()
        source_rate_col = f'{cancer_type}_{std_col.PER_100K_SUFFIX}'
        het_ratio_col = f'{cancer_type}_{std_col.RATIO_AGE_ADJUSTED_SUFFIX}'

        white_nh_rates = df[df[std_col.RACE_CATEGORY_ID_COL] == std_col.Race.WHITE_NH.value].set_index(
            std_col.STATE_FIPS_COL
        )[source_rate_col]

        df[_tmp_white_rates_col] = df[std_col.STATE_FIPS_COL].map(white_nh_rates)
        df[het_ratio_col] = df[source_rate_col] / df[_tmp_white_rates_col]
        df[het_ratio_col] = df[het_ratio_col].round(2)

        df = df.drop(columns=[_tmp_white_rates_col])
        df.loc[df[std_col.RACE_CATEGORY_ID_COL] == std_col.Race.ALL.value, het_ratio_col] = np.nan

    return df
