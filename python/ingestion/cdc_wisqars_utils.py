import pandas as pd
import numpy as np
from typing import List
from ingestion import standardized_columns as std_col
from ingestion.dataset_utils import generate_per_100k_col

WISQARS_COLS = [
    "Age-Adjusted Rate",
    "Cases (Sample)",
    "CV",
    "Lower 95% CI",
    "Standard Error",
    "Upper 95% CI",
    "Years of Potential Life Lost",
]

RACE_COLS_TO_STANDARD = {
    "American Indian / Alaska Native Non-Hispanic": std_col.Race.AIAN_NH.value,
    "Asian Non-Hispanic": std_col.Race.ASIAN_NH.value,
    "Black Non-Hispanic": std_col.Race.BLACK_NH.value,
    "HI Native / Pacific Islander Non-Hispanic": std_col.Race.NHPI_NH.value,
    "More than One Race Non-Hispanic": std_col.Race.MULTI_NH.value,
    "White Non-Hispanic": std_col.Race.WHITE_NH.value,
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


def standardize_and_merge_race_ethnicity(df: pd.DataFrame):
    df['Race'] = df.apply(lambda row: f"{row['Race']} {row['Ethnicity']}", axis=1)
    df = df.replace(to_replace=RACE_COLS_TO_STANDARD)

    df_excl_ethnicity = df[~df['Ethnicity'].isin(['Unknown', 'Hispanic'])]
    df_incl_ethnicity = df[df['Ethnicity'].isin(['Unknown', 'Hispanic'])]

    df_incl_ethnicity.loc[
        df_incl_ethnicity['Ethnicity'] == 'Hispanic', 'Race'
    ] = std_col.Race.HISP.value

    df_incl_ethnicity.loc[
        df_incl_ethnicity['Ethnicity'] == 'Unknown', 'Race'
    ] = std_col.Race.ETHNICITY_UNKNOWN.value

    df_incl_ethnicity = (
        df_incl_ethnicity.groupby(['Year', 'State', 'Race', 'Ethnicity'])
        .sum(min_count=1)
        .reset_index()
    )

    df_incl_ethnicity = generate_per_100k_col(
        df_incl_ethnicity, 'Deaths', 'Population', 'Crude Rate'
    )

    df = pd.concat([df_excl_ethnicity, df_incl_ethnicity], ignore_index=True)
    df.drop(columns=['Ethnicity'], inplace=True)

    return df
