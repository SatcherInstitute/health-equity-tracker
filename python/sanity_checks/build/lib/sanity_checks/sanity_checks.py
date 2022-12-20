import numpy as np
import pandas as pd
import ingestion.standardized_columns as std_col


def check_pct_values(df):
    # determine cols needed for DF
    std_cols, share_cols, dem_col = determine_needed_cols(df)
    cols = std_cols + [dem_col] + share_cols
    df = df[cols]

    # remove rows with 'All', 'Unknown', & 'Other as values
    options = ['All', 'Unknown', 'Other']
    df = df[-df[dem_col].isin(options)]

    # # group and sum rows
    df = df.groupby(std_cols).sum().reset_index()
    # # filter rows that do not equal 100
    df = df.loc[(df[share_cols].values < 99.0) | (
        df[share_cols].values > 101.0)].drop_duplicates()

    # return False if DF exists
    if len(df) > 0:
        print(
            f'These counties percent share values do not equal 100%: {df[std_cols[0]].tolist()}')
        return False

    return True


def determine_needed_cols(df):
    share_cols = df.columns.to_series(
    ).loc[df.columns.str.contains('share')].tolist()

    # determine demographic column
    if std_col.RACE_CATEGORY_ID_COL in df.columns:
        dem_col = std_col.RACE_CATEGORY_ID_COL
    elif std_col.SEX_COL in df.columns:
        dem_col = std_col.SEX_COL
    elif std_col.AGE_COL in df.columns:
        dem_col = std_col.AGE_COL

    # determine geo column
    if std_col.COUNTY_FIPS_COL in df.columns:
        std_cols = [std_col.COUNTY_FIPS_COL]
    else:
        std_cols = [std_col.STATE_FIPS_COL]

    # determine if standard columns
    if std_col.TIME_PERIOD_COL in df.columns:
        std_cols = std_cols + [std_col.TIME_PERIOD_COL]

    return std_cols, share_cols, dem_col
