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
import numpy as np

from ingestion import standardized_columns as std_col


DATA_DIR = "cdc_wisqars"

INJ_OUTCOMES = [std_col.FATAL_PREFIX]

INJ_INTENTS = [
    std_col.GUN_VIOLENCE_HOMICIDE_PREFIX,
    std_col.GUN_VIOLENCE_SUICIDE_PREFIX,
]

WISQARS_URBANICITY = "Metro / Non-Metro"
WISQARS_AGE_GROUP = "Age Group"
WISQARS_YEAR = "Year"
WISQARS_STATE = "State"
WISQARS_DEATHS = "Deaths"
WISQARS_CRUDE_RATE = "Crude Rate"
WISQARS_POP = "Population"

WISQARS_ALL = 'all'

WISQARS_COLS = [
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
    Takes a single parameter 'val' and returns the cleaned value.
    """
    if isinstance(val, str):
        if '**' in val:
            return np.nan
        if ',' in val:
            return val.replace(',', '')
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
    if isinstance(x, str) and 'unknown' in x.lower():
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
        df[column] = pd.to_numeric(df[column], errors='coerce')


def generate_cols_map(estimated_total_cols: List[str], suffix: str):
    """
    Generates a mapping of column names from a list of estimated total column names to a column name
    with a specified suffix.

    Parameters:
        estimated_total_cols (List[str]): A list of column names, each ending with a standard raw suffix.
        suffix (str): The suffix that will replace each RAW_SUFFIX in the new column names.

    Returns:
        dict: A dictionary mapping original estimated total column names to new column names with the specified suffix.

    Raises:
        AssertionError: If any column name in `estimated_total_cols` does not end with the standard raw suffix.
    """
    for col in estimated_total_cols:
        assert col.endswith(std_col.RAW_SUFFIX)
    return {
        estimated_total_col: estimated_total_col.replace(f"_{std_col.RAW_SUFFIX}", "") + f"_{suffix}"
        for estimated_total_col in estimated_total_cols
    }
