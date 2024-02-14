import pandas as pd
import numpy as np
from typing import List
from ingestion import standardized_columns as std_col

DATA_DIR = "cdc_wisqars"

INJ_OUTCOMES = [std_col.FATAL_PREFIX, std_col.NON_FATAL_PREFIX]

INJ_INTENTS = [
    std_col.GUN_VIOLENCE_HOMICIDE_PREFIX,
    std_col.GUN_VIOLENCE_LEGAL_INTERVENTION_PREFIX,
    std_col.GUN_VIOLENCE_SUICIDE_PREFIX,
    std_col.GUN_VIOLENCE_INJURIES_PREFIX,
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
    removes strings with '**' subset and replaces commas
    """
    if isinstance(val, str):
        if '**' in val:
            return np.nan
        if ',' in val:
            return val.replace(',', '')
    return val


def convert_columns_to_numeric(df: pd.DataFrame, columns_to_convert: List[str]):
    """
    applies clean_numeric to necessary columns and convert values to float
    """
    for column in columns_to_convert:
        df[column] = df[column].apply(clean_numeric)
        df[column] = pd.to_numeric(df[column], errors='coerce')


def generate_cols_map(prefixes, suffix):
    return {
        prefix: prefix.replace(f"_{std_col.RAW_SUFFIX}", "") + f"_{suffix}"
        for prefix in prefixes
    }


def contains_unknown(x):
    if isinstance(x, str) and 'unknown' in x.lower():
        return True
    return False
