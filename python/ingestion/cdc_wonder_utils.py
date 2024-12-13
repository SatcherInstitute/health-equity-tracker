from ingestion.het_types import GEO_TYPE, CANCER_TYPE_OR_ALL
from ingestion import gcs_to_bq_util, dataset_utils
import ingestion.standardized_columns as std_col
from ingestion.constants import CURRENT, STATE_LEVEL, NATIONAL_LEVEL, US_FIPS
import pandas as pd
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

# State column names for different demographic types
STATE_CODE_RACE = "States Code"
STATE_CODE_DEFAULT = 'States and Puerto Rico Code'

TMP_ALL: CANCER_TYPE_OR_ALL = 'all'
CDC_WONDER_DIR = 'cdc_wonder'

# Cancer conditions based on sex demographic requirements
CANCERS_WITH_SEX_DEMOGRAPHIC = ["Colorectal", "Lung"]
ALL_CANCER_CONDITIONS = ["Breast", "Cervical", "Prostate"] + CANCERS_WITH_SEX_DEMOGRAPHIC

# Mapping for demographic types to source columns
demographic_type_to_source = {
    "age": AGE_GROUP,
    "race_and_ethnicity": RACE_NAME,
    "sex": SEX_COL,
}

DEMOGRAPHIC_TO_STANDARD_BY_COL = {
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


def get_state_code_col(demographic_type: CANCER_TYPE_OR_ALL) -> str:
    """Returns appropriate state code column based on demographic type and geo level"""
    if demographic_type == std_col.RACE_OR_HISPANIC_COL:
        return STATE_CODE_RACE
    return STATE_CODE_DEFAULT


def get_source_type(geo_level: GEO_TYPE, demographic_type: CANCER_TYPE_OR_ALL) -> str:
    """Returns the appropriate source type identifier based on geography level and demographic type

    Args:
        geo_level: string equal to `national`, or `state`
        demographic_type: string demographic type (e.g., race, sex, age)

    Returns:
        str: Source type identifier based on the provided parameters
    """
    source_type_map = {
        (TMP_ALL, NATIONAL_LEVEL): "US",
        (TMP_ALL, STATE_LEVEL): "State",
        (std_col.RACE_OR_HISPANIC_COL, NATIONAL_LEVEL): "Race_US",
        (std_col.RACE_OR_HISPANIC_COL, STATE_LEVEL): "Race_State",
        (std_col.SEX_COL, NATIONAL_LEVEL): "Sex_US",
        (std_col.SEX_COL, STATE_LEVEL): "Sex_State",
        (std_col.AGE_COL, NATIONAL_LEVEL): "Age_US",
        (std_col.AGE_COL, STATE_LEVEL): "Age_State",
    }

    return source_type_map[(demographic_type, geo_level)]


def load_cdc_df_from_data_dir(
    geo_level: GEO_TYPE,
    demographic_type: CANCER_TYPE_OR_ALL,
    conditions: List[str],
) -> pd.DataFrame:
    """Generates CDC data by demographic type and geographic level

    Args:
        geo_level: Geographic level ('national' or 'state')
        demographic_type: Demographic type for analysis (e.g., race, sex, age)
        conditions: List of cancer conditions to process

    Returns:
        pd.DataFrame: Processed CDC data with standardized columns
    """
    source_type = get_source_type(geo_level, demographic_type)
    merge_cols = [std_col.TIME_PERIOD_COL, std_col.STATE_FIPS_COL]

    if demographic_type != TMP_ALL:
        demographic_col = (
            std_col.RACE_CATEGORY_ID_COL if demographic_type == std_col.RACE_OR_HISPANIC_COL else demographic_type
        )
        merge_cols.append(demographic_col)

    # Update keep_cols to include race and ethnicity columns
    keep_cols = []
    if demographic_type != TMP_ALL:
        keep_cols.append(demographic_type_to_source[demographic_type])

    if demographic_type == std_col.RACE_OR_HISPANIC_COL:
        keep_cols.extend([RACE_NAME, "Ethnicity"])

    state_code_col = get_state_code_col(demographic_type)
    if geo_level == STATE_LEVEL:
        keep_cols.append(state_code_col)

    keep_cols.extend([YEAR_COL, COUNT_COL, POP_COL, CRUDE_RATE_COL])

    topic_dfs = []

    for condition in conditions:
        folder_name = f'CDC_Wonder_{condition}_Cancer'
        file_name = f'{folder_name}-{source_type}.csv'

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

        topic_df[YEAR_COL] = topic_df[YEAR_COL].astype(int).astype(str)
        topic_df = topic_df.rename(columns={YEAR_COL: std_col.TIME_PERIOD_COL})

        # Handle race and ethnicity combination if applicable
        if demographic_type == std_col.RACE_OR_HISPANIC_COL:
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
                race_alone_to_het_code_map=DEMOGRAPHIC_TO_STANDARD_BY_COL[std_col.RACE_CATEGORY_ID_COL],
                ethnicity_value="Hispanic",
            )

        topic_df = standardize_columns(
            topic_df,
            cast(GEO_TYPE, geo_level),
            cast(CANCER_TYPE_OR_ALL, demographic_type),
            condition,
            state_code_col,
        )

        topic_dfs.append(topic_df)

    df_merged = merge_dfs_list(topic_dfs, merge_cols)

    # drop rows that dont include FIPS and demographic values
    df_merged = df_merged[df_merged[std_col.STATE_FIPS_COL].notna()]
    df_merged = dataset_utils.ensure_leading_zeros(df_merged, std_col.STATE_FIPS_COL, 2)

    return df_merged


def standardize_columns(
    df: pd.DataFrame,
    geo_level: GEO_TYPE,
    demographic_type: CANCER_TYPE_OR_ALL,
    condition: str,
    state_code_col: str,
) -> pd.DataFrame:
    """Standardizes column names based on the demographic type and geographic level

    Args:
        df: Input DataFrame
        geo_level: Geographic level
        demographic_type: Type of demographic analysis
        condition: Cancer condition being analyzed
        state_code_col: Column name for state codes

    Returns:
        pd.DataFrame: DataFrame with standardized column names
    """
    rename_cols_map: Dict[str, str] = {
        COUNT_COL: f'{condition.lower()}_count_{std_col.RAW_SUFFIX}',
        POP_COL: f'{condition.lower()}_{std_col.RAW_POP_SUFFIX}',
        CRUDE_RATE_COL: f'{condition.lower()}_{std_col.PER_100K_SUFFIX}',
    }

    if geo_level in [STATE_LEVEL, NATIONAL_LEVEL]:
        rename_cols_map[state_code_col] = std_col.STATE_FIPS_COL

    if demographic_type == std_col.RACE_OR_HISPANIC_COL:
        rename_cols_map[RACE_NAME] = std_col.RACE_CATEGORY_ID_COL

    if demographic_type == std_col.AGE_COL:
        rename_cols_map[AGE_GROUP] = std_col.AGE_COL

    if demographic_type == std_col.SEX_COL:
        rename_cols_map[SEX_COL] = std_col.SEX_COL

    df = df.rename(columns=rename_cols_map)
    return df


def get_float_cols(time_type: str, conditions: List[str]) -> List[str]:
    """Get the float columns for the given time type.

    Args:
        time_type: Time type (CURRENT or HISTORICAL)
        conditions: List of cancer conditions to process

    Returns:
        List[str]: List of numerical columns
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
