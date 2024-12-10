from ingestion.het_types import GEO_TYPE, CANCER_TYPE_OR_ALL, SEX_RACE_ETH_AGE_TYPE
from ingestion import gcs_to_bq_util, dataset_utils
import ingestion.standardized_columns as std_col
from ingestion.constants import CURRENT, STATE_LEVEL, NATIONAL_LEVEL, US_FIPS
import pandas as pd
import numpy as np
from typing import Dict, cast, List
from ingestion.merge_utils import merge_dfs_list
from ingestion.dataset_utils import combine_race_ethnicity

# CDC Wonder Constants
YEAR_COL = "Year"
RACE_NAME = "Race"
AGE_GROUP = "Age Groups"
SEX_COL = "Sex"
COUNT_COL = "Count"
POP_COL = "Population"
CRUDE_RATE_COL = "Crude Rate"

# State column names for different breakdowns
STATE_CODE_RACE = "States Code"
STATE_CODE_DEFAULT = 'States and Puerto Rico Code'

TMP_ALL: CANCER_TYPE_OR_ALL = 'all'
CDC_WONDER_DIR = 'cdc_wonder'

# Cancer conditions based on sex breakdown requirements
CANCERS_WITH_SEX_BREAKDOWN = ["Colorectal", "Lung"]
ALL_CANCER_CONDITIONS = ["Breast", "Cervical", "Prostate"] + CANCERS_WITH_SEX_BREAKDOWN

# Mapping for demographic breakdowns
breakdown_het_to_source_type = {
    "age": AGE_GROUP,
    "race_and_ethnicity": RACE_NAME,
    "sex": SEX_COL,
}

BREAKDOWN_TO_STANDARD_BY_COL = {
    # Age source groups already match needed HET groups
    std_col.RACE_CATEGORY_ID_COL: {
        'American Indian or Alaska Native': std_col.Race.AIAN_NH.value,
        'Asian or Pacific Islander': std_col.Race.API_NH.value,
        'Hispanic': std_col.Race.HISP.value,
        'White': std_col.Race.WHITE_NH.value,
        'Black or African American': std_col.Race.BLACK_NH.value,
        'Other Races and Unknown combined': std_col.Race.OTHER_NONSTANDARD_NH.value,
    },
    # Sex source groups already match needed HET groups
}

DTYPE = {STATE_CODE_RACE: str, STATE_CODE_DEFAULT: str}


def get_state_code_col(breakdown: CANCER_TYPE_OR_ALL) -> str:
    """Returns appropriate state code column based on breakdown type and geo level"""
    if breakdown == std_col.RACE_OR_HISPANIC_COL:
        return STATE_CODE_RACE
    return STATE_CODE_DEFAULT


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
    """Generates CDC data by breakdown and geo_level"""
    sheet_name = get_sheet_name(geo_level, breakdown)
    merge_cols = [std_col.TIME_PERIOD_COL, std_col.STATE_FIPS_COL]

    if breakdown != TMP_ALL:
        breakdown_col = std_col.RACE_CATEGORY_ID_COL if breakdown == std_col.RACE_OR_HISPANIC_COL else breakdown
        merge_cols.append(breakdown_col)

    # Update keep_cols to include race and ethnicity columns
    keep_cols = []
    if breakdown != TMP_ALL:
        keep_cols.append(breakdown_het_to_source_type[breakdown])

    if breakdown == std_col.RACE_OR_HISPANIC_COL:
        keep_cols.extend([RACE_NAME, "Ethnicity"])

    state_code_col = get_state_code_col(breakdown)
    if geo_level == STATE_LEVEL:
        keep_cols.append(state_code_col)

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
            CDC_WONDER_DIR,
            file_name,
            subdirectory=folder_name,
            dtype=DTYPE,
            na_values=['Not Applicable'],
            usecols=keep_cols,
        )

        topic_df = topic_df.dropna(subset=[YEAR_COL])

        if geo_level == NATIONAL_LEVEL:
            topic_df[state_code_col] = US_FIPS

        topic_df = topic_df.rename(columns={YEAR_COL: std_col.TIME_PERIOD_COL})

        # Handle race and ethnicity combination if applicable
        if breakdown == std_col.RACE_OR_HISPANIC_COL:
            initial_renames = {
                state_code_col: std_col.STATE_FIPS_COL,
                RACE_NAME: std_col.RACE_COL,
                "Ethnicity": std_col.ETH_COL,
            }
            topic_df = topic_df.rename(columns=initial_renames)

            count_cols_to_sum = [COUNT_COL, POP_COL]

            topic_df = combine_race_ethnicity(
                topic_df,
                count_cols_to_sum=count_cols_to_sum,
                race_alone_to_het_code_map=BREAKDOWN_TO_STANDARD_BY_COL[std_col.RACE_CATEGORY_ID_COL],
                ethnicity_value="Hispanic",
                # race_eth_output_col=std_col.RACE_CATEGORY_ID_COL,
            )

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
    df_merged = dataset_utils.ensure_leading_zeros(df_merged, std_col.STATE_FIPS_COL, 2)

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
        POP_COL: f'{condition.lower()}_{std_col.RAW_POP_SUFFIX}',
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


def get_float_cols(time_type: str, conditions: List[str]) -> List[str]:
    """Get the float columns for the given time type.

    Args:
        time_type (str): time type (CURRENT or HISTORICAL)
        conditions: List of cancer conditions to process
    Returns:
        List[str]: list of numerical columns
    """
    cols = []

    for condition in conditions:
        cancer_type = condition.lower()

        cols.append(f"{cancer_type}_{std_col.PER_100K_SUFFIX}")

        if time_type == CURRENT:
            cols.extend(
                [
                    f"{cancer_type}_count_{std_col.RAW_SUFFIX}",
                    f'{cancer_type}_{std_col.POP_PCT_SUFFIX}',
                    f"{cancer_type}_{std_col.RAW_POP_SUFFIX}",
                    f"{cancer_type}_{std_col.PCT_SHARE_SUFFIX}",
                ]
            )
        else:
            cols.extend(
                [
                    f"{cancer_type}_{std_col.PCT_SHARE_SUFFIX}",
                    f"{cancer_type}_{std_col.PCT_REL_INEQUITY_SUFFIX}",
                ]
            )

    return cols
