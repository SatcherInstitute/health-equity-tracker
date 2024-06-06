from typing import Literal, List, Dict, Union, Type
import pandas as pd  # type: ignore
import numpy as np  # type: ignore
import ingestion.standardized_columns as std_col
from ingestion.standardized_columns import Race
from ingestion.constants import (
    NATIONAL_LEVEL,
    STATE_LEVEL,
    COUNTY_LEVEL,
    RACE,
    UNKNOWN,
    STATE_LEVEL_FIPS_LIST,
    COUNTY_LEVEL_FIPS_LIST,
    CURRENT,
    HISTORICAL,
    BQ_STRING,
    BQ_FLOAT,
    ALL_VALUE,
)
from functools import reduce
import os

INGESTION_DIR = os.path.dirname(os.path.abspath(__file__))
ACS_MERGE_DATA_DIR = os.path.join(INGESTION_DIR, 'acs_population')

# shared dataset utility functions


def melt_to_het_style_df(
    source_df: pd.DataFrame,
    demo_col: Literal["age", "sex", "race", "race_and_ethnicity"],
    keep_cols: List[str],
    value_to_cols: Dict[str, Dict[str, str]],
):
    """Generalized util fn for melting a source df into the skinny/long
    HET-style df that contains 1 row per FIPS/GROUP (or FIPS/TIME_PERIOD/GROUP)
    and a unique col per metric

    df: incoming wide/short df that contains 1 row per FIPS (or FIPS/TIME_PERIOD)
        and a unique column for each group metric
    demo_col: string column name for resulting df that will contain the
        group names. Typically "sex", "age", etc.
    keep_cols: list of string column names for columns that will remain from
        the old df to the new df (getting exploded across new rows in the
        new df). Typically a combination of geo columns plus time_period
        for time-series dfs. Prefer `time_period` first in the list, as this list
        is used for sorting the resulting df.
    value_to_cols: nested dict relating keys of new string column names
        for the resulting df (typically a metric like "population_pct_share")
        to the col name mapping that is a dict of old_group_metric column names
        to new_group_names

    Example:

    -- source_df --
    1|state_fips  | black_A_100k  | white_A_100k  | black_B_100k  | white_B_100k
    2|"99"        | 100           | 50            | 999           | 2222

    -- args --
    demo_col = "race"
    keep_cols = ["state_fips"]
    value_to_cols = {
        "A_100k": { "black_A_100k" : "black", "white_A_100k" : "white"},
        "B_100k": { "black_B_100k" : "black", "white_B_100k" : "white"},
    }

    -- resulting het-style df --
    1|state_fips  | A_100k        | B_100k        | race
    2|"99"        | 100           | 999           | black
    3|"99"        | 50            | 2222          | white

    """

    # each resulting metric col melted individually
    partial_dfs = []
    for value_name, group_cols_map in value_to_cols.items():
        df = source_df.copy().rename(columns=group_cols_map)
        needed_cols = keep_cols + list(group_cols_map.values())
        df = df[needed_cols]
        df = df.melt(id_vars=keep_cols, var_name=demo_col, value_name=value_name)
        partial_dfs.append(df)

    # merge all partial_dfs
    result_df = reduce(lambda x, y: pd.merge(x, y, how="outer", on=[*keep_cols, demo_col]), partial_dfs)

    return result_df.sort_values(by=keep_cols).reset_index(drop=True)


def scaffold_fips_df(geo_level: Literal["national", "state", "county"]) -> pd.DataFrame:
    """Build the FIPS column first, so we have something to merge population info onto

    geo_level: str for which geographic level df should be created
    Returns: a df consisting of a single column with either `state_fips` (for national / state)
     or `county_fips` for county request, and a row for every FIPS code at that level"""

    if geo_level == NATIONAL_LEVEL:
        return pd.DataFrame(
            {
                std_col.STATE_FIPS_COL: ["00"],
            }
        )
    if geo_level == STATE_LEVEL:
        return pd.DataFrame(
            {
                std_col.STATE_FIPS_COL: STATE_LEVEL_FIPS_LIST,
            }
        )
    if geo_level == COUNTY_LEVEL:
        return pd.DataFrame(
            {
                std_col.COUNTY_FIPS_COL: COUNTY_LEVEL_FIPS_LIST,
            }
        )

    raise ValueError(f'The provided geo_level: {geo_level} in invalid; it must be `national`, `state`, or `county`.')


def generate_pct_share_col_without_unknowns(
    df: pd.DataFrame, raw_count_to_pct_share: dict, breakdown_col: str, all_val: str
) -> pd.DataFrame:
    """Returns a DataFrame with a percent share column based on the raw_count_cols
    Each row must have a corresponding 'ALL' row.
    This function is meant to be used on datasets without any rows where the
    breakdown value is `Unknown`.

    df: DataFrame to generate the `pct_share_col` for.
    raw_count_to_pct_share: A dictionary with the mapping of raw_count
                            columns to the pct_share columns they should
                            be used to generate. eg: ({'population': 'population_pct'})
    breakdown_col: The name of column to calculate the percent across, usually a demographic
         breakdown string like 'age' or 'sex'.
    all_val: The value representing 'ALL'"""

    all_demo_values = set(df[breakdown_col].to_list())
    if Race.UNKNOWN.value in all_demo_values or 'Unknown' in all_demo_values:
        raise ValueError(
            ('This dataset contains unknowns, use the `generate_pct_share_col_with_unknowns` function instead')
        )

    return _generate_pct_share_col(df, raw_count_to_pct_share, breakdown_col, all_val)


def generate_pct_share_col_with_unknowns(
    df: pd.DataFrame,
    raw_count_to_pct_share: dict,
    breakdown_col: str,
    all_val: str,
    unknown_val: str,
):
    """Returns a DataFrame with a percent share column based on the raw_count_cols.
    The resulting `pct_share` value for the 'unknown' row will be the raw
    percent share, whereas the resulting `pct_share` values for all other
    rows will be the percent share disregarding unknowns.

    df: DataFrame to generate the share_of_known column for.
    raw_count_to_pct_share: dictionary {raw_col_name: pct_share_col_name }
         mapping a string column name for the raw condition count column to a
         string column name for the resulting percent share of known / percent
         share unknown column.
    breakdown_col: String column name representing the demographic breakdown
         column name (race/race_and_ethnicity/sex/age).
    all_val: String representing an ALL demographic value in the dataframe.
    unknown_val: String representing an UNKNOWN value in the dataframe."""

    # First, only run the _generate_pct_share_col function on the UNKNOWNS
    # in the dataframe, so we only need the ALL and UNKNOWN rows
    unknown_all_df = df.loc[df[breakdown_col].isin({unknown_val, all_val})]
    unknown_all_df = _generate_pct_share_col(unknown_all_df, raw_count_to_pct_share, breakdown_col, all_val)

    # Make sure this dataframe contains unknowns
    unknown_df = df.loc[df[breakdown_col] == unknown_val].reset_index(drop=True)
    if len(unknown_df) == 0:
        raise ValueError(
            (
                'This dataset does not contains unknowns, use the '
                'generate_pct_share_col_without_unknowns function instead'
            )
        )

    df = df.loc[~df[breakdown_col].isin({unknown_val, all_val})]

    groupby_cols = [std_col.STATE_FIPS_COL]
    if std_col.COUNTY_FIPS_COL in df.columns:
        groupby_cols.append(std_col.COUNTY_FIPS_COL)
    if std_col.TIME_PERIOD_COL in df.columns:
        groupby_cols.append(std_col.TIME_PERIOD_COL)

    # Calculate an all demographic based on the known cases.
    alls = df.groupby(groupby_cols).sum(numeric_only=True).reset_index()
    alls[breakdown_col] = all_val
    df = pd.concat([df, alls]).reset_index(drop=True)

    df = _generate_pct_share_col(df, raw_count_to_pct_share, breakdown_col, all_val)

    df = df.loc[df[breakdown_col] != all_val]

    for share_of_known_col in raw_count_to_pct_share.values():
        unknown_all_df.loc[unknown_all_df[breakdown_col] == all_val, share_of_known_col] = 100.0

    df = pd.concat([df, unknown_all_df]).reset_index(drop=True)
    return df


def _generate_pct_share_col(df, raw_count_to_pct_share: dict[str, str], breakdown_col: str, all_val: str):
    def calc_pct_share(record, raw_count_col):
        return percent_avoid_rounding_to_zero(record[raw_count_col], record[f'{raw_count_col}_all'])

    rename_cols = {}
    for raw_count_col in raw_count_to_pct_share.keys():
        rename_cols[raw_count_col] = f'{raw_count_col}_all'

    alls = df.loc[df[breakdown_col] == all_val]
    alls = alls.rename(columns=rename_cols).reset_index(drop=True)

    on_cols = [std_col.STATE_FIPS_COL]
    if std_col.COUNTY_FIPS_COL in df.columns:
        on_cols.append(std_col.COUNTY_FIPS_COL)
    if std_col.TIME_PERIOD_COL in df.columns:
        on_cols.append(std_col.TIME_PERIOD_COL)

    alls = alls[on_cols + list(rename_cols.values())]

    # Ensure there is exactly one ALL value for each fips or fips/time_period group.
    split_cols = [std_col.COUNTY_FIPS_COL] if std_col.COUNTY_FIPS_COL in df.columns else [std_col.STATE_FIPS_COL]

    if std_col.TIME_PERIOD_COL in df.columns:
        split_cols.append(std_col.TIME_PERIOD_COL)

    all_splits = df[split_cols].drop_duplicates()
    all_splits = list(all_splits.itertuples(index=False, name=None))

    value_counts = alls[split_cols].value_counts()
    for f in all_splits:
        count = value_counts[f]
        if count != 1:
            raise ValueError(f'Fips {f} has {count} ALL rows, there should be 1')

    df = pd.merge(df, alls, how='left', on=on_cols)

    for raw_count_col, pct_share_col in raw_count_to_pct_share.items():
        df[pct_share_col] = df.apply(calc_pct_share, axis=1, args=(raw_count_col,))

    df = df.drop(columns=list(rename_cols.values()))
    return df.reset_index(drop=True)


def generate_pct_share_col_of_summed_alls(
    df: pd.DataFrame, raw_count_to_pct_share: dict[str, str], demo_col: Literal['age', 'sex', 'race_and_ethnicity']
):
    """
    Adds a `pct_share` column for each raw_count_to_pct_share item. Rather than using the "All" row's
    estimate_total values, this recalculates the "All" rows' values as the sum of the groups' rows.
    This is done to ensure the resultant pct_share values total 100%, which isn't necessarily the case
    when using estimated totals from a reference population different than the original rate's denominator

    Parameters:
    - df: DataFrame to generate the `pct_share_col` for.
    - raw_count_to_pct_share: Dict of raw_count_col: pct_share_col
    - breakdown_col: String column name with the group of the raw count
    """

    geo_cols = []
    for col in [std_col.STATE_FIPS_COL, std_col.STATE_NAME_COL, std_col.COUNTY_FIPS_COL, std_col.COUNTY_NAME_COL]:
        if col in df.columns:
            geo_cols.append(col)

    for raw_col in raw_count_to_pct_share.keys():

        # replace the estimated_total "All" with the sum of the groups' estimated_totals
        # Calculate the sum of "topic_estimated_total" for each state where demographic group is not "All"
        sums_df = df[df[demo_col] != ALL_VALUE].groupby(geo_cols)[raw_col].sum().reset_index()

        # Rename the column to avoid conflict when merging
        sum_raw_col = f'sum_{raw_col}'
        sums_df.rename(columns={raw_col: sum_raw_col}, inplace=True)

        # Merge the sums back into the original DataFrame
        df = df.merge(sums_df, on=geo_cols, how='left')

        # Overwrite the "topic_estimated_total" value where demographic group is "All"
        df.loc[df[demo_col] == ALL_VALUE, raw_col] = df[sum_raw_col]

        # Drop the auxiliary sum column
        df.drop(columns=[sum_raw_col], inplace=True)

    df = _generate_pct_share_col(df, raw_count_to_pct_share, demo_col, ALL_VALUE)

    return df


def generate_per_100k_col(df, raw_count_col, pop_col, per_100k_col):
    """Returns a dataframe with a `per_100k` column

    df: DataFrame to generate the `per_100k_col` for.
    raw_count_col: String column name with the total number of people
                   who have the given condition.
    pop_col: String column name with the population number.
    per_100k_col: String column name to place the generated row in."""

    def calc_per_100k(record):
        per_100k = percent_avoid_rounding_to_zero(1000 * float(record[raw_count_col]), float(record[pop_col]), 0, 0)
        if not pd.isna(per_100k):
            return round(per_100k, 0)
        return np.nan

    df[per_100k_col] = df.apply(calc_per_100k, axis=1)
    return df


def generate_pct_rate_col(df, raw_count_col, pop_col, pct_rate_col):
    """Returns a df with a `_pct_rate` col

    df: incoming df that will get the new column
    raw_count_col: str col name that contains the raw count
    of individuals with the condition. this will be the numerator
    pop_col: str col name with the total population number.
    this will be the denominator
    pct_rate_col: str col name to place the generated
    pct_rate data in.


    In general, we prefer using PCT_RATE for more frequently occurring,
    non-medical conditions like voting, poverty, etc. and use PER_100K
    for diagnoses of diseases that occur less frequently like COPD."""

    df[pct_rate_col] = df[raw_count_col].astype(float) / df[pop_col]
    df[pct_rate_col] = df[pct_rate_col].mul(100).round()

    # div by zero results in inf, cast these as nan
    df.replace([np.inf, -np.inf], np.nan, inplace=True)

    return df


def percent_avoid_rounding_to_zero(numerator, denominator, default_decimals=1, max_decimals=2):
    """Calculates percentage to `default_decimals` number of decimal places. If
    the percentage would round to 0, calculates with more decimal places until
    either it doesn't round to 0, or until `max_decimals`. `default_decimals`
    and `max_decimals` should be >= -1 and `max_decimals` should be >=
    `default_decimals`."""

    if (float(denominator) == 0.0) or (numerator is None) or (denominator is None):
        return None

    decimals = default_decimals
    pct = round((float(numerator) / float(denominator) * 100), decimals)
    while pct == 0 and numerator != 0 and decimals < max_decimals:
        decimals += 1
        pct = round((float(numerator) / float(denominator) * 100), decimals)

    return pct


def ratio_round_to_None(numerator, denominator):
    """Calculates a ratio to one decimal point and rounds any number less than .1 to None
    so it is shown as the warning triangle sign on the frontend."""

    ratio = float(numerator) / float(denominator)

    if ratio < 0.1:
        return None

    return round(ratio, 1)


def add_sum_of_rows(df, breakdown_col, value_col, new_row_breakdown_val, breakdown_vals_to_sum=None):
    """Returns a new DataFrame by appending rows by summing the values of other
    rows. Automatically groups by all other columns, so this won't work if
    there are extraneous columns.

    For example, calling
        `add_sum_of_rows(df, 'race', 'population', 'Total')`
    will group by all columns except for 'race' and 'population, and for each
    group add a row with race='Total' and population=the sum of population
    for all races in that group.

    df: The DataFrame to calculate new rows from.
    breakdown_col: String: The name of the breakdown column that a new value is being
                   summed over.
    value_col: String or list[String]:
               The name or names of the column/s whose values should be summed.
    new_row_breakdown_val: String: The value to use for the breakdown column.
    breakdown_vals_to_sum: list[String]: The list of breakdown values to sum
                           across. If not provided, defaults to summing across
                           all values.
    """
    filtered_df = df
    if breakdown_vals_to_sum is not None:
        filtered_df = df.loc[df[breakdown_col].isin(breakdown_vals_to_sum)]

    group_by_cols = list(df.columns)
    group_by_cols.remove(breakdown_col)

    if isinstance(value_col, str):
        group_by_cols.remove(value_col)
    else:
        for col in value_col:
            group_by_cols.remove(col)

    sums = filtered_df.groupby(group_by_cols).sum(numeric_only=True).reset_index()
    sums[breakdown_col] = new_row_breakdown_val

    result = pd.concat([df, sums])
    result = result.reset_index(drop=True)
    return result


def ensure_leading_zeros(df: pd.DataFrame, fips_col_name: str, num_digits: int) -> pd.DataFrame:
    """
    Ensure a column contains values of a certain digit length, adding leading zeros as needed.
    This could be used for 5 digit fips codes, or zip codes, etc.

    Parameters:
        df: dataframe containing a column of value that need leading zeros padded to
             ensure a consistent number of digits
        fips_col_name: string column name containing the values to be padded
        num_digits: how many digits should be present after leading zeros are added
    """
    df[fips_col_name] = df[fips_col_name].apply(lambda code: (str(code).rjust(num_digits, '0')))
    return df


def generate_pct_rel_inequity_col(
    df: pd.DataFrame,
    pct_share_col: str,
    pct_pop_col: str,
    pct_relative_inequity_col: str,
):
    """Returns a new DataFrame with an inequitable share column.

    df: Pandas DataFrame to generate the column for.
    pct_share_col: String column name for the pct share of condition.
    pct_pop_col: String column name for the pct of population.
    pct_relative_inequity_col: String column name to place the calculated
                           inequitable shares in.
    """

    def calc_pct_relative_inequity(row):
        if pd.isna(row[pct_share_col]) or pd.isna(row[pct_pop_col]) or (row[pct_pop_col] == 0):
            return np.NaN

        pct_relative_inequity_ratio = (row[pct_share_col] - row[pct_pop_col]) / row[pct_pop_col]
        return round(pct_relative_inequity_ratio * 100, 1)

    df[pct_relative_inequity_col] = df.apply(calc_pct_relative_inequity, axis=1)
    return df


def zero_out_pct_rel_inequity(
    df: pd.DataFrame,
    geo: Literal["national", "state", "county"],
    demographic: Literal["sex", "age", "race"],
    rate_to_inequity_col_map: dict,
    pop_pct_col: str = "",
):
    """Sets inequitable share of targeted conditions to zero if every known
    demographic group in a particular place/time reports rates of `0` or null.
    The justification for this is that such a small number of case counts can
    lead to misleading relative inequities, and it's strange to see large disparities in the
    same time_period when we are see `<1 per 100k` of a condition.

    Parameters:
        df: Dataframe to zero rows out on.
        geo: string of Geographic level.
        demographic: Demographic breakdown. Must be `race`, `age`, or `sex`.
        rate_cols: dict mapping condition rates (usually but not always `per_100k`)
           to the corresponding`pct_rel_inequity`s. Example map below:
            {"something_per_100k": "something_pct_relative_inequity",
            "pct_share_of_us_congress": "women_us_congress_pct_relative_inequity"}
        pop_pct_col: optional string column name that contains the population pct share,
            used to preserve the null `pct_rel_inequity` values on rows with no pop. data

    Returns:
        df with the pct_relative_inequities columns zeroed for the zero-rate time/place rows
    """

    geo_col_mapping = {
        NATIONAL_LEVEL: [
            std_col.STATE_FIPS_COL,
            std_col.STATE_NAME_COL,
        ],
        STATE_LEVEL: [
            std_col.STATE_FIPS_COL,
            std_col.STATE_NAME_COL,
        ],
        COUNTY_LEVEL: [
            std_col.COUNTY_FIPS_COL,
            std_col.COUNTY_NAME_COL,
        ],
    }
    geo_cols = geo_col_mapping[geo]

    per_100k_col_names = {}
    for rate_col in rate_to_inequity_col_map.keys():
        per_100k_col_names[rate_col] = f'{rate_col}_grouped'

    demo_col = std_col.RACE_CATEGORY_ID_COL if demographic == RACE else demographic
    unknown_val = Race.UNKNOWN.value if demographic == RACE else UNKNOWN
    all_val = Race.ALL.value if demographic == RACE else std_col.ALL_VALUE

    df_without_all_unknown = df.loc[~df[demo_col].isin({unknown_val, all_val})]
    df_all_unknown = df.loc[df[demo_col].isin({unknown_val, all_val})]

    grouped_df = (
        df_without_all_unknown.groupby(geo_cols + [std_col.TIME_PERIOD_COL])
        .sum(min_count=1, numeric_only=False)
        .reset_index()
    )
    grouped_df = grouped_df.rename(columns=per_100k_col_names)
    grouped_df = grouped_df[geo_cols + list(per_100k_col_names.values()) + [std_col.TIME_PERIOD_COL]]

    df = pd.merge(df_without_all_unknown, grouped_df, on=geo_cols + [std_col.TIME_PERIOD_COL])
    for rate_col, pct_inequity_col in rate_to_inequity_col_map.items():
        grouped_col = f'{rate_col}_grouped'
        # set pct_inequity to 0 in a place/time_period if the summed rates are zero
        df.loc[df[grouped_col] == 0, pct_inequity_col] = 0

    df = df.drop(columns=list(per_100k_col_names.values()))
    df = pd.concat([df, df_all_unknown])

    # optionally preserve null pct_inequity for race rows that have no population info
    if pop_pct_col:
        for rate_col, pct_inequity_col in rate_to_inequity_col_map.items():
            df.loc[df[pop_pct_col].isnull(), pct_inequity_col] = np.nan

    return df


def preserve_only_current_time_period_rows(
    df: pd.DataFrame, time_period_col: str = None, keep_time_period_col: bool = False
):
    """Takes a dataframe with a time col (default `time_period`) that contains datatime strings
    in formats like `YYYY` or `YYYY-MM`,
    calculates the most recent time_period value,
    removes all rows that contain older time_periods,
    and removes (or optionally keeps) the original string time_period col"""
    if time_period_col is None:
        time_period_col = std_col.TIME_PERIOD_COL

    if time_period_col not in df.columns:
        raise ValueError(f'df does not contain column: {time_period_col}.')

    # Convert time_period to datetime-like object
    df['time_period_dt'] = pd.to_datetime(df[time_period_col], errors='coerce', format='%Y-%m')
    # For rows that failed to convert (NaT), try again assuming just a year is provided
    df.loc[df['time_period_dt'].isna(), 'time_period_dt'] = pd.to_datetime(
        df[time_period_col], format='%Y', errors='coerce'
    )

    # Filter the DataFrame to keep only the rows with the most recent rows
    most_recent = df["time_period_dt"].max()
    filtered_df = df[df["time_period_dt"] == most_recent]

    # optionally keep the original string "time_period" col
    drop_cols = ["time_period_dt"]
    if not keep_time_period_col:
        drop_cols.append(time_period_col)

    filtered_df = filtered_df.drop(columns=drop_cols)

    return filtered_df.reset_index(drop=True)


def combine_race_ethnicity(
    df: pd.DataFrame,
    RACE_NAMES_MAPPING: Dict[str, str],
    ethnicity_value: str = 'Hispanic',
):
    """Combines the race and ethnicity fields into the legacy race/ethnicity category.
    We will keep this in place until we can figure out a plan on how to display
    the race and ethnicity to our users in a disaggregated way."""

    # Create a mask for Hispanic/Latino
    hispanic_mask = df[std_col.ETH_COL].isin([ethnicity_value])

    # Create masks for 'NA', 'Missing', 'Unknown'
    race_missing_mask = df[std_col.RACE_COL].isin({'NA', 'Missing', 'Unknown'})
    eth_missing_mask = df[std_col.ETH_COL].isin({'NA', 'Missing', 'Unknown'})

    # Create a mask for other cases
    other_mask = ~race_missing_mask & ~eth_missing_mask

    # Create a new combined race/eth column Initialize with UNKNOWN
    df[std_col.RACE_ETH_COL] = std_col.Race.UNKNOWN.value

    # Overwrite specific race if given
    df.loc[other_mask, std_col.RACE_ETH_COL] = df.loc[other_mask, std_col.RACE_COL].map(RACE_NAMES_MAPPING)

    # overwrite with Hispanic if given
    df.loc[hispanic_mask, std_col.RACE_ETH_COL] = std_col.Race.HISP.value

    # Drop unnecessary columns
    df = df.drop(columns=[std_col.RACE_COL, std_col.ETH_COL])

    return df


def generate_time_df_with_cols_and_types(
    df: pd.DataFrame,
    numerical_cols_to_keep: List[str],
    table_type: Literal['current', 'historical'],
    dem_col: Literal['age', 'race', 'race_and_ethnicity', 'sex'],
) -> tuple[pd.DataFrame, Dict[str, str]]:
    """
    Accepts a DataFrame along with list of column names for either current or
    historical data and generates the appropiate BQ types for each column.

    Parameters:
    - df: The DataFrame to be processed.
    - numerical_cols_to_keep: A list of column names related to `table_type` that
      will be included in the DataFrame and converted to floats.
      - For current dataframes: estimated_total, per_100k/pct_rate, pct_share,
        population_pct
      - For historical dataframes: per_100k/pct_rate, pct_share(if unknown rows exist),
        pct_relative_inequity
    - table_type: `current` or `historical`.
    - dem_col: The name of the demographic column to be included in the DataFrame.

    Returns:
    - A tuple containing the processed DataFrame and a dict mapping column names
      to their BQ data types ('STRING' or 'FLOAT64').

    Note: This function aligns with the specific front-end table requirements,
    The rate map, rate chart, unknown demographic map, pop vs dist, and data table use
    the current DataFrame. The rates over time and inequities over time use the historical
    DataFrame.
    """
    df = df.copy()
    str_cols_to_keep = [std_col.TIME_PERIOD_COL, std_col.STATE_NAME_COL, std_col.STATE_FIPS_COL, dem_col]

    if std_col.COUNTY_NAME_COL in df.columns:
        str_cols_to_keep.append(std_col.COUNTY_NAME_COL)
    if std_col.COUNTY_FIPS_COL in df.columns:
        str_cols_to_keep.append(std_col.COUNTY_FIPS_COL)

    all_cols = str_cols_to_keep + numerical_cols_to_keep
    df = df[all_cols]

    if table_type == CURRENT:
        df = preserve_only_current_time_period_rows(df)
    elif table_type == HISTORICAL:
        df = df[[col for col in df.columns if std_col.POP_PCT_SUFFIX not in col]]
        df = df[[col for col in df.columns if std_col.RAW_SUFFIX not in col]]

    float_cols = [col for col in numerical_cols_to_keep if col in df.columns]
    df[float_cols] = df[float_cols].astype(float)

    column_types = {c: (BQ_FLOAT if c in float_cols else BQ_STRING) for c in df.columns}

    return df, column_types


def generate_estimated_total_col(
    df: pd.DataFrame,
    rate_to_raw_col_map: Dict[str, str],
    geo_level: Literal['state', 'county'],
    primary_demo_col: Literal['age', 'race_and_ethnicity', 'sex'],
    race_specific_group: str = None,
    age_specific_group: str = None,
    sex_specific_group: str = None,
) -> pd.DataFrame:
    """
    Generates the estimated_total column by applying the given rate col against the ACS reference population.

    Parameters:
    - df: The DataFrame to be processed.
    - rate_col: The name of the rate column to be applied against the reference population.
    - geo_level: The geo level of the DataFrame, e.g. 'state'.
    - primary_demo_col: The name of the disaggregated demographic column to be included in the DataFrame,
    e.g. 'race_and_ethnicity' with one row per race group.
    - race_specific_group: The name of the race-specific sub-group to use from the reference population.
    - age_specific_group: The name of the age-specific sub-group to use from the reference population.
    - sex_specific_group: The name of the sex-specific sub-group to use from the reference population.

    NOTE: the specific group kwargs above are useful when the df breakdown is for a specific population,
    like "adults by race",
    or "black women by age". In this case, we must use this specific subset population for our estimate calculation,
    rather than
    the entire reference population.

    Returns:
    - A DataFrame with the estimated_total column added.
    """

    pop_dtype: dict[str, Union[Type[float], Type[str]]] = {
        std_col.POPULATION_COL: float,
    }

    if geo_level == COUNTY_LEVEL:
        pop_dtype[std_col.COUNTY_FIPS_COL] = str
    if geo_level == STATE_LEVEL:
        pop_dtype[std_col.STATE_FIPS_COL] = str

    pop_file = os.path.join(ACS_MERGE_DATA_DIR, f'by_sex_age_race_{geo_level}.csv')
    pop_df = pd.read_csv(pop_file, dtype=pop_dtype)

    # the primary demographic breakdown can't use a specific group
    if primary_demo_col == 'race_and_ethnicity' and race_specific_group:
        raise ValueError('race_specific_group kwarg is not applicable when primary_demo_col is race.')
    if primary_demo_col == 'age' and age_specific_group:
        raise ValueError('age_specific_group kwarg is not applicable when primary_demo_col is age.')
    if primary_demo_col == 'sex' and sex_specific_group:
        raise ValueError('sex_specific_group kwarg is not applicable when primary_demo_col is sex.')

    if age_specific_group == '18+':
        pop_df = sum_age_groups(pop_df, '18+')

    specific_group_map = {}
    specific_group_map[std_col.RACE_OR_HISPANIC_COL] = ALL_VALUE if race_specific_group is None else race_specific_group
    specific_group_map[std_col.AGE_COL] = ALL_VALUE if age_specific_group is None else age_specific_group
    specific_group_map[std_col.SEX_COL] = ALL_VALUE if sex_specific_group is None else sex_specific_group

    # scope the pop df to the specific intersectional subgroup (e.g. Black Women, ages 65+)
    for demo in [std_col.AGE_COL, std_col.RACE_OR_HISPANIC_COL, std_col.SEX_COL]:

        # keep all rows and columns for the main demographic breakdown
        if demo == primary_demo_col:
            continue

        # drop the rows that don't match the specific group
        pop_df = pop_df[pop_df[demo] == specific_group_map[demo]]

        secondary_demo_col = [demo]

        if demo == std_col.RACE_OR_HISPANIC_COL:
            secondary_demo_col.append(std_col.RACE_CATEGORY_ID_COL)

        # drop the secondary demographic columns
        pop_df = pop_df.drop(columns=secondary_demo_col).reset_index(drop=True)

    # merge the population column onto the original df
    potential_geo_cols = [std_col.COUNTY_FIPS_COL, std_col.STATE_FIPS_COL, std_col.STATE_NAME_COL]
    merge_cols = []

    for col in potential_geo_cols:
        if col in df.columns:
            merge_cols.append(col)

    if primary_demo_col == std_col.RACE_OR_HISPANIC_COL:
        merge_cols.append(std_col.RACE_CATEGORY_ID_COL)
    else:
        merge_cols.append(primary_demo_col)

    # the sex/race/age/county ACS data only has NH for White
    # we can approximate the other race groups using the non-NH race codes
    if primary_demo_col == std_col.RACE_OR_HISPANIC_COL:
        # string "_NH" off race_category_id on evrything except "WHITE_NH"
        race_replace_map = {
            'AIAN': 'AIAN_NH',
            'ASIAN': 'ASIAN_NH',
            'BLACK': 'BLACK_NH',
            'NHPI': 'NHPI_NH',
            'MULTI': 'MULTI_NH',
            'OTHER_STANDARD': 'OTHER_STANDARD_NH',
        }
        pop_df[std_col.RACE_CATEGORY_ID_COL] = pop_df[std_col.RACE_CATEGORY_ID_COL].replace(race_replace_map)

    df = df.merge(pop_df, on=merge_cols, how='left')

    # calculate the estimated_total
    conversion_factor = 1

    for rate_col, raw_col in rate_to_raw_col_map.items():

        if std_col.PCT_RATE_SUFFIX in rate_col:
            conversion_factor = 100
        elif std_col.PER_100K_SUFFIX in rate_col:
            conversion_factor = 100_000
        else:
            raise ValueError(f'{rate_col} must have a suffix of _pct_rate or _per_100k.')

        df[raw_col] = df[rate_col] / conversion_factor * df[std_col.POPULATION_COL]
        df[raw_col] = df[raw_col].round()

    return df


def sum_age_groups(pop_df: pd.DataFrame, age_group: Literal['18+']) -> pd.DataFrame:
    """
    Sums rows of smaller age groups together to generate new rows for target age group

    Parameters:
    - pop_df: The DataFrame to be processed.
    - age_group: The name of the needed age group.

    Returns:
    - A DataFrame with the rows for the target age group replacing the rows for the smaller summed age groups.
    """

    summed_age_groups_map = {
        '18+': [
            '18-19',
            '20-20',
            '21-21',
            '22-24',
            '25-29',
            '30-34',
            '35-39',
            '40-44',
            '45-49',
            '50-54',
            '55-59',
            '60-61',
            '62-64',
            '65-66',
            '67-69',
            '70-74',
            '75-79',
            '80-84',
            '85+',
        ],
    }

    # throw an error is user supplies an age group that isn't in the summed_age_groups_map
    if age_group not in summed_age_groups_map:
        raise ValueError(f'age_group kwarg must be one of {summed_age_groups_map.keys()}')

    possible_geo_cols = [
        std_col.STATE_FIPS_COL,
        std_col.STATE_NAME_COL,
        std_col.COUNTY_FIPS_COL,
        std_col.COUNTY_NAME_COL,
    ]

    groupby_cols = [std_col.SEX_COL, std_col.RACE_OR_HISPANIC_COL, std_col.RACE_CATEGORY_ID_COL]

    for geo_col in possible_geo_cols:
        if geo_col in pop_df.columns:
            groupby_cols.append(geo_col)

    summed_pop_df = pop_df[pop_df[std_col.AGE_COL].isin(summed_age_groups_map[age_group])]
    rest_of_pop_df = pop_df[~pop_df[std_col.AGE_COL].isin(summed_age_groups_map[age_group])]

    # Group by 'state_fips' and 'time_period', and sum the 'population' for the filtered age groups
    summed_pop_df = summed_pop_df.groupby(
        groupby_cols,
        as_index=False,
    )[std_col.POPULATION_COL].sum()

    # Label the new age group
    summed_pop_df[std_col.AGE_COL] = age_group

    # Add the rest of the population
    df = pd.concat([rest_of_pop_df, summed_pop_df], axis=0).reset_index(drop=True)

    return df
