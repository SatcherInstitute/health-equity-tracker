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
    Function to clean numeric values by removing commas and converting '**' to NaN.
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


def generate_cols_map(prefixes, suffix):
    """
    Generates a mapping of columns with given prefixes to their corresponding columns
    with specified suffix.

    Parameters:
    prefixes (list): A list of prefixes to generate the mapping for.
    suffix (str): The suffix to add to the columns.

    Returns:
    dict: A dictionary mapping the original prefixes to the modified prefixes with the
    specified suffix.
    """
    return {
        prefix: prefix.replace(f"_{std_col.RAW_SUFFIX}", "") + f"_{suffix}" for prefix in prefixes
    }
