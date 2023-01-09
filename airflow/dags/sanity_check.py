import pandas as pd

RACE_CATEGORY_ID_COL = "race_category_id"
SEX_COL = "sex"
AGE_COL = "age"
COUNTY_FIPS_COL = "county_fips"
STATE_FIPS_COL = "state_fips"
TIME_PERIOD_COL = 'time_period'


def generate_cols(df: pd.DataFrame):
    share_cols = df.columns.to_series(
    ).loc[df.columns.str.contains('share')].tolist()

    # determine demographic column
    if RACE_CATEGORY_ID_COL in df.columns:
        dem_col = RACE_CATEGORY_ID_COL
    elif SEX_COL in df.columns:
        dem_col = SEX_COL
    elif AGE_COL in df.columns:
        dem_col = AGE_COL

    # determine geo column
    if COUNTY_FIPS_COL in df.columns:
        std_cols = [COUNTY_FIPS_COL]
    else:
        df = df[df[STATE_FIPS_COL] != 'Unknown']
        std_cols = [STATE_FIPS_COL]

    # determine if standard columns
    if TIME_PERIOD_COL in df.columns:
        std_cols = std_cols + [TIME_PERIOD_COL]

    return std_cols, share_cols, dem_col, df


def check_pct_values(df):
    # determine cols needed for DF
    std_cols, share_cols, dem_col, df = generate_cols(df)
    cols = std_cols + [dem_col] + share_cols
    df = df[cols]

    # remove rows with 'All', 'Unknown', & 'Other as values
    options = ['All', 'Unknown', 'Other']
    df = df[-df[dem_col].isin(options)]

    # # group and sum rows
    df = df.groupby(std_cols).sum().reset_index()
    # # filter rows that do not equal 100
    bad_fips_df = df.loc[(df[share_cols].values < 99.0) | (
        df[share_cols].values > 101.0)].drop_duplicates()

    # return error w/county info if DF exists
    if len(bad_fips_df) > 0:
        raise RuntimeError(
            f'These fips percent share values do not equal 100%: {df[std_cols[0]].tolist()}')

    return True
