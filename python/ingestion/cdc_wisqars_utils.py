"""
This module defines utilities for processing and analyzing CDC WISQARS data,
focusing on injury outcomes and intents, particularly gun violence incidents.
It includes functions for data cleaning, conversion to numeric types, and
mapping of column names based on specific prefixes and suffixes.

Features include:
- Cleaning numeric values in the dataset, including handling of special markers and commas.
- Converting specified columns in a DataFrame to numeric types.
- Generating mappings for column names based on given prefixes and a specified suffix.
- Checking for the presence of 'unknown' values in a dataset.
"""

from typing import List
import pandas as pd
from ingestion import standardized_columns as std_col, gcs_to_bq_util
from ingestion.dataset_utils import generate_per_100k_col
from ingestion.het_types import RATE_CALC_COLS_TYPE, WISQARS_VAR_TYPE, GEO_TYPE, WISQARS_DEMO_TYPE
from ingestion.constants import NATIONAL_LEVEL, US_NAME

DATA_DIR = "cdc_wisqars"

INJ_OUTCOMES = [std_col.FATAL_PREFIX]

INJ_INTENTS = [std_col.GUN_VIOLENCE_HOMICIDE_PREFIX, std_col.GUN_VIOLENCE_SUICIDE_PREFIX, "gun_deaths"]

WISQARS_URBANICITY = "Metro / Non-Metro"
WISQARS_AGE_GROUP = "Age Group"
WISQARS_YEAR = "Year"
WISQARS_STATE = "State"
WISQARS_DEATHS = "Deaths"
WISQARS_CRUDE_RATE = "Crude Rate"
WISQARS_POP = "Population"

WISQARS_ALL: WISQARS_DEMO_TYPE = "all"

WISQARS_IGNORE_COLS = [
    "Age-Adjusted Rate",
    "Cases (Sample)",
    "CV",
    "Lower 95% CI",
    "Standard Error",
    "Upper 95% CI",
    "Years of Potential Life Lost",
]

RACE_NAMES_MAPPING = {
    "American Indian / Alaska Native": std_col.Race.AIAN_NH.value,
    "Asian": std_col.Race.ASIAN_NH.value,
    "Black": std_col.Race.BLACK_NH.value,
    "HI Native / Pacific Islander": std_col.Race.NHPI_NH.value,
    "More than One Race": std_col.Race.MULTI_NH.value,
    "White": std_col.Race.WHITE_NH.value,
}


def clean_numeric(val):
    """
    Function to clean numeric string values by removing commas and converting '**' to NaN.
    Takes a single parameter 'val' and returns the cleaned str value.
    """
    if isinstance(val, str):
        if "**" in val:
            val = val.replace("**", "")
        if "," in val:
            val = val.replace(",", "")
    return val


def contains_unknown(x):
    """
    Check if the input contains the word 'unknown' (case insensitive) and return True
    if it does, False otherwise.

    Args:
        x: The input to be checked for the presence of the word 'unknown'.

    Returns:
        bool: True if the input contains the word 'unknown', False otherwise.
    """
    if isinstance(x, str) and "unknown" in x.lower():
        return True

    return False


def convert_columns_to_numeric(df: pd.DataFrame, columns_to_convert: List[str]):
    """
    Convert the specified columns in the DataFrame to numeric type.

    Args:
        df (pd.DataFrame): The DataFrame to operate on.
        columns_to_convert (List[str]): The list of column names to convert to numeric type.

    Returns:
        None
    """
    for column in columns_to_convert:
        df[column] = df[column].apply(clean_numeric)
        df[column] = pd.to_numeric(df[column], errors="coerce")


def generate_cols_map(prefixes: List[WISQARS_VAR_TYPE], suffix: str):
    """
    Generates a mapping of column prefixes to new column names, based on incoming list of prefixes and incoming
    suffix. Note: if any of the incoming prefixes are in the count column format (ending in `_estimated_total`), the
    resulting dict will use the original count col as the key, but will swap `_estimated_total`
    for the new suffix in the column name value.

    Parameters:
        estimated_total_cols: A list of column prefix strings.
        suffix (str): The new suffix that will be applied to the incoming list of prefixes
        for the generated column names.

    Returns:
        dict: A dictionary mapping original prefixes to new column names with the specified suffix.
    """

    return {
        estimated_total_col: estimated_total_col.replace(f"_{std_col.RAW_SUFFIX}", "") + f"_{suffix}"
        for estimated_total_col in prefixes
    }


def condense_age_groups(df: pd.DataFrame, col_dicts: List[RATE_CALC_COLS_TYPE]) -> pd.DataFrame:
    """
    Combines source's numerous 5-year age groups into fewer, larger age group combo buckets

    Args:
        df: The data frame to operate on
        col_dicts: List of column name mappings per topic (numerator, denominator, rate)
        NOTE: this function doesn't handle pct_rate columns currently.

    Returns:
        The data frame with the condensed age groups
    """

    bucket_map = {
        ("All",): "All",
        ("Unknown",): "Unknown",
        (
            "0-4",
            "5-9",
            "10-14",
        ): "0-14",
        ("15-19",): "15-19",
        ("20-24",): "20-24",
        ("25-29",): "25-29",
        ("30-34",): "30-34",
        (
            "35-39",
            "40-44",
        ): "35-44",
        (
            "45-49",
            "50-54",
            "55-59",
            "60-64",
        ): "45-64",
        (
            "65-69",
            "70-74",
            "75-79",
            "80-84",
            "85+",
        ): "65+",
    }

    het_bucket_dfs = []

    for source_bucket, het_bucket in bucket_map.items():
        het_bucket_df = df.copy()
        het_bucket_df = het_bucket_df[het_bucket_df[std_col.AGE_COL].isin(source_bucket)]

        # some source buckets don't get combined, so only process combo ones
        if len(source_bucket) > 1:

            # create a list of all count cols
            numerator_cols = [col_dict["numerator_col"] for col_dict in col_dicts]
            denominator_cols = [col_dict["denominator_col"] for col_dict in col_dicts]
            count_cols = list(set(numerator_cols + denominator_cols))

            # aggregate by state and year, summing count cols and dropping source rate cols
            agg_map = {count_col: "sum" for count_col in count_cols}
            het_bucket_df = (
                het_bucket_df.groupby([std_col.TIME_PERIOD_COL, std_col.STATE_NAME_COL]).agg(agg_map).reset_index()
            )

            # recalculate each 100k rate with summed numerators/denominators
            for col_dict in col_dicts:
                numerator_col, denominator_col, rate_col = col_dict.values()
                het_bucket_df = generate_per_100k_col(
                    het_bucket_df,
                    numerator_col,
                    denominator_col,
                    rate_col,
                    decimal_places=2,
                )

        het_bucket_df[std_col.AGE_COL] = het_bucket
        het_bucket_dfs.append(het_bucket_df)

    # combine the df chunks for each condensed age group
    df_condensed_age_groups = pd.concat(het_bucket_dfs).reset_index(drop=True)

    return df_condensed_age_groups


def load_wisqars_as_df_from_data_dir(
    variable_string: WISQARS_VAR_TYPE, geo_level: GEO_TYPE, demographic: WISQARS_DEMO_TYPE
) -> pd.DataFrame:
    """
    Loads wisqars data from data directory

    Args:
        variable_string: The wisqars variable string
        geo_level: e.g. "state" or "national"
        demographic: e.g. "race_and_ethnicity" or "sex"

    Returns:
        The wisqars data frame
    """

    csv_filename = f"{variable_string}-{geo_level}-{demographic}.csv"

    df = gcs_to_bq_util.load_csv_as_df_from_data_dir(
        DATA_DIR,
        csv_filename,
        na_values=["--", "**"],
        usecols=lambda x: x not in WISQARS_IGNORE_COLS,
        thousands=",",
        dtype={WISQARS_YEAR: str},
    )

    df = remove_metadata(df)

    if geo_level == NATIONAL_LEVEL:
        df.insert(1, WISQARS_STATE, US_NAME)

    columns_to_convert = [WISQARS_DEATHS, WISQARS_CRUDE_RATE]
    convert_columns_to_numeric(df, columns_to_convert)

    return df


def remove_metadata(df: pd.DataFrame) -> pd.DataFrame:
    """
    Removes metadata from the wisqars data frame

    Args:
        df: The wisqars data frame

    Returns:
        The wisqars data frame with metadata removed
    """

    leftmost_column = df.columns[0]
    metadata_start_indices = df[df[leftmost_column] == "Total"].index
    if not metadata_start_indices.empty:
        metadata_start_index = int(metadata_start_indices[0])
        df = df.iloc[:metadata_start_index]

    return df
