from typing import Literal, List, Dict, Union, Tuple, Callable, Any
import pandas as pd  # type: ignore
import numpy as np  # type: ignore
import ingestion.standardized_columns as std_col
from ingestion.standardized_columns import Race
from ingestion.merge_utils import merge_dfs_list
from ingestion.constants import (
    NATIONAL_LEVEL,
    STATE_LEVEL,
    COUNTY_LEVEL,
    UNKNOWN,
    STATE_LEVEL_FIPS_LIST,
    COUNTY_LEVEL_FIPS_LIST,
    CURRENT,
    HISTORICAL,
    BQ_STRING,
    BQ_FLOAT,
    BQ_BOOLEAN,
    ALL_VALUE,
)
import os
from ingestion.het_types import TIME_VIEW_TYPE  # pylint: disable=no-name-in-module

INGESTION_DIR = os.path.dirname(os.path.abspath(__file__))
ACS_MERGE_DATA_DIR = os.path.join(INGESTION_DIR, "acs_population")

# shared dataset utility functions


def melt_to_het_style_df(
    source_df: pd.DataFrame,
    demo_col: Literal["age", "sex", "race", "race_and_ethnicity"],
    keep_cols: List[str],
    value_to_cols: Dict[str, Dict[str, str]],
    drop_empty_rows: bool = False,
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
    drop_empty_rows: whether to drop rows that contain all nulls

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
    merge_cols = [*keep_cols, demo_col]
    result_df = merge_dfs_list(partial_dfs, merge_cols)

    if drop_empty_rows:
        value_cols = list(value_to_cols.keys())
        result_df = result_df.dropna(subset=value_cols, how="all")

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

    raise ValueError(f"The provided geo_level: {geo_level} in invalid; it must be `national`, `state`, or `county`.")


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
    if Race.UNKNOWN.value in all_demo_values or "Unknown" in all_demo_values:
        raise ValueError(
            ("This dataset contains unknowns, use the `generate_pct_share_col_with_unknowns` function instead")
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
                "This dataset does not contains unknowns, use the "
                "generate_pct_share_col_without_unknowns function instead"
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


def _generate_pct_share_col(
    df, raw_count_to_pct_share: dict[str, str], breakdown_col: str, all_val: str
):  # pylint: disable=unsubscriptable-object
    def calc_pct_share(record, raw_count_col):
        return percent_avoid_rounding_to_zero(record[raw_count_col], record[f"{raw_count_col}_all"])

    rename_cols = {}
    for raw_count_col in raw_count_to_pct_share.keys():
        rename_cols[raw_count_col] = f"{raw_count_col}_all"

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
            raise ValueError(f"Fips {f} has {count} ALL rows, there should be 1")

    df = pd.merge(df, alls, how="left", on=on_cols)

    for raw_count_col, pct_share_col in raw_count_to_pct_share.items():
        df[pct_share_col] = df.apply(calc_pct_share, axis=1, args=(raw_count_col,))

    df = df.drop(columns=list(rename_cols.values()))
    return df.reset_index(drop=True)


# pylint: disable=unsubscriptable-object
def generate_pct_share_col_of_summed_alls(
    df: pd.DataFrame, raw_count_to_pct_share: dict[str, str], demo_col: Literal["age", "sex", "race_and_ethnicity"]
) -> pd.DataFrame:
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

    group_by_cols = []
    for col in [std_col.STATE_FIPS_COL, std_col.STATE_NAME_COL, std_col.COUNTY_FIPS_COL, std_col.COUNTY_NAME_COL]:
        if col in df.columns:
            group_by_cols.append(col)

    # Include the time period column for grouping
    if std_col.TIME_PERIOD_COL in df.columns:
        group_by_cols.append(std_col.TIME_PERIOD_COL)

    for raw_col in raw_count_to_pct_share.keys():

        # replace the estimated_total "All" with the sum of the groups' estimated_totals
        # Calculate the sum of "topic_estimated_total" for each state where demographic group is not "All"
        sums_df = df[df[demo_col] != ALL_VALUE].groupby(group_by_cols)[raw_col].sum().reset_index()

        # Rename the column to avoid conflict when merging
        sum_raw_col = f"sum_{raw_col}"
        sums_df.rename(columns={raw_col: sum_raw_col}, inplace=True)

        # Merge the sums back into the original DataFrame
        df = df.merge(sums_df, on=group_by_cols, how="left")

        # Overwrite the "topic_estimated_total" value where demographic group is "All"
        df.loc[df[demo_col] == ALL_VALUE, raw_col] = df[sum_raw_col]

        # Drop the auxiliary sum column
        df.drop(columns=[sum_raw_col], inplace=True)

    df = _generate_pct_share_col(df, raw_count_to_pct_share, demo_col, ALL_VALUE)

    return df


def generate_per_100k_col(df, raw_count_col, pop_col, per_100k_col, decimal_places=0):
    """Returns a dataframe with a `per_100k` column

    df: DataFrame to generate the `per_100k_col` for.
    raw_count_col: String column name with the total number of people
                   who have the given condition.
    pop_col: String column name with the population number.
    per_100k_col: String column name to place the generated row in.
    num_of_decimal_places: Number of decimal places to round to, defaults to 0 (whole numbers)
    """

    # Convert columns to float to ensure proper division
    raw_count = df[raw_count_col].astype(float)
    population = df[pop_col].astype(float)

    # Calculate per 100k rate
    per_100k = 100_000 * raw_count / population

    # Handle division by zero and invalid results
    per_100k = per_100k.where((population != 0) & (per_100k.notnull()) & (per_100k != np.inf), np.nan)

    # Round
    df[per_100k_col] = per_100k.round(decimal_places)

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
    df[fips_col_name] = df[fips_col_name].apply(lambda code: (str(code).rjust(num_digits, "0")))
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

    # Ensure input columns are float
    df[pct_share_col] = pd.to_numeric(df[pct_share_col], errors="coerce")
    df[pct_pop_col] = pd.to_numeric(df[pct_pop_col], errors="coerce")

    # Create a mask for valid calculations
    valid_mask = (~df[pct_share_col].isna()) & (~df[pct_pop_col].isna()) & (df[pct_pop_col] != 0)

    # Initialize the new column with NaN
    df[pct_relative_inequity_col] = np.nan

    # Perform the calculation only where valid
    df.loc[valid_mask, pct_relative_inequity_col] = (
        (df.loc[valid_mask, pct_share_col] - df.loc[valid_mask, pct_pop_col]) / df.loc[valid_mask, pct_pop_col] * 100
    )

    # Round the results
    df[pct_relative_inequity_col] = df[pct_relative_inequity_col].round(1)
    df[pct_relative_inequity_col] = df[pct_relative_inequity_col].astype(float)

    return df


def zero_out_pct_rel_inequity(
    df: pd.DataFrame,
    geo: Literal["national", "state", "county"],
    demographic: Literal["sex", "age", "race", "race_and_ethnicity"],
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
        demographic: Demographic breakdown. Must be `race`, `race_and_ethnicity`, `age`, or `sex`.
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
        per_100k_col_names[rate_col] = f"{rate_col}_grouped"

    demo_col = (
        std_col.RACE_CATEGORY_ID_COL if demographic in [std_col.RACE_OR_HISPANIC_COL, std_col.RACE_COL] else demographic
    )
    unknown_val = Race.UNKNOWN.value if demographic == std_col.RACE_OR_HISPANIC_COL else UNKNOWN
    all_val = Race.ALL.value if demographic == std_col.RACE_OR_HISPANIC_COL else std_col.ALL_VALUE

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
        grouped_col = f"{rate_col}_grouped"
        # set pct_inequity to 0 in a place/time_period if the summed rates are zero
        df.loc[df[grouped_col] == 0, pct_inequity_col] = 0

    df = df.drop(columns=list(per_100k_col_names.values()))
    df = pd.concat([df, df_all_unknown])

    # optionally preserve null pct_inequity for race rows that have no population info
    if pop_pct_col:
        for rate_col, pct_inequity_col in rate_to_inequity_col_map.items():
            df.loc[df[pop_pct_col].isnull(), pct_inequity_col] = np.nan

    return df


def preserve_most_recent_year_rows_per_topic(df: pd.DataFrame, topic_prefixes: List[str]) -> pd.DataFrame:
    """Takes a dataframe with a 'time_period' col of string dates like 'YYYY' or 'YYYY-MM',
    and returns a new dataframe that contains only rows with the most recent 'time_period'
    for each topic's rate column.

    Parameters:
        df: dataframe with a 'time_period' col of string dates like 'YYYY' or 'YYYY-MM'
        topic_prefixes: list of topic prefixes, used to identify the rate cols for determining
            the most recent 'time_period' per topic, and also to identify all metric cols
            for time view sorting

    Returns:
        new dataframe with only each topic's most recent rows; the time_period col is dropped

    """

    # collect base_cols (non-metric id columns like state_name, race_and_ethnicity, etc.)
    base_cols = [
        col
        for col in df.columns
        if not std_col.ends_with_suffix_from_list(col, std_col.SUFFIXES) and col != std_col.TIME_PERIOD_COL
    ]

    # split df based on data recency
    recent_year_to_rate_col_map: Dict[str, List[str]] = {}

    # handle topic prefixes that are shared between cols like topic_pct_share and topic_per_100k
    for topic_prefix in topic_prefixes:
        topic_primary_col = get_topic_primary_col(topic_prefix, df)
        most_recent_time_period = df[df[topic_primary_col].notnull()][std_col.TIME_PERIOD_COL].max()
        col_list = list(df.columns[df.columns.str.startswith(topic_prefix)])

        # build the mapping of string year to list of topics where that year is the most recent
        if most_recent_time_period in recent_year_to_rate_col_map:
            recent_year_to_rate_col_map[most_recent_time_period].extend(col_list)
        else:
            recent_year_to_rate_col_map[most_recent_time_period] = col_list

    # iterate over the recent_year_to_rate_col_map and extract the most recent year rows data per rate_col
    dfs_by_recent_year: List[pd.DataFrame] = []
    for year, topic_cols in recent_year_to_rate_col_map.items():
        keep_cols = list(dict.fromkeys(base_cols + topic_cols))

        # get a subset df with the keep_cols and only the rows where time_period == year
        df_for_year = df[df[std_col.TIME_PERIOD_COL] == year][keep_cols]
        dfs_by_recent_year.append(df_for_year)

    # merge all subset dfs
    merged_df = merge_dfs_list(dfs_by_recent_year, base_cols)
    return merged_df.reset_index(drop=True)


def get_topic_primary_col(topic_prefix: str, df: pd.DataFrame) -> str:
    """Given a topic prefix, returns the 'primary' col for that topic;
    typically the primary col will be a rate like 'per_100k' or 'pct_rate'
    but could also be a population like 'ahr_population_pct'. We consider these
    columns 'primary' because they are more likely to have solid data than the
    other suffixes like 'pct_relative_inequity' or 'pct_share'

    Parameters:
        topic_prefix: str topic prefix
        df: dataframe

    Returns:
        the primary col for that topic
    """
    for primary_col_suffix in [
        std_col.PER_100K_SUFFIX,
        std_col.PCT_RATE_SUFFIX,
        std_col.INDEX_SUFFIX,
        std_col.POP_PCT_SUFFIX,
        std_col.RAW_SUFFIX,
    ]:
        possible_primary_col = f"{topic_prefix}_{primary_col_suffix}"
        if possible_primary_col in df.columns:
            return possible_primary_col

    raise ValueError(f"Could not find primary column (e.g. rate or pop. share) for topic prefix: {topic_prefix}")


# TODO: Remove this in favor of preserve_most_recent_year_rows_per_topic above
def preserve_only_current_time_period_rows(
    df: pd.DataFrame, time_period_col: str = std_col.TIME_PERIOD_COL, keep_time_period_col: bool = False
):
    """Takes a dataframe with a time col (default `time_period`) that contains datatime strings
    in formats like `YYYY` or `YYYY-MM`,
    calculates the most recent time_period value,
    removes all rows that contain older time_periods,
    and removes (or optionally keeps) the original string time_period col"""

    if time_period_col not in df.columns:
        raise ValueError(f"df does not contain column: {time_period_col}.")

    # Convert time_period to datetime-like object
    df["time_period_dt"] = pd.to_datetime(df[time_period_col], errors="coerce", format="%Y-%m")
    # For rows that failed to convert (NaT), try again assuming just a year is provided
    df.loc[df["time_period_dt"].isna(), "time_period_dt"] = pd.to_datetime(
        df[time_period_col], format="%Y", errors="coerce"
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
    count_cols_to_sum: List[str],
    race_alone_to_het_code_map: Dict[str, str],
    ethnicity_value: str = std_col.Race.HISP.race,
    unknown_values: Union[List[str], None] = None,
    additional_group_cols: Union[List[str], None] = None,
    race_eth_output_col: str = std_col.RACE_CATEGORY_ID_COL,
    treat_zero_count_as_missing: bool = False,
):
    """Combines the `race` and `ethnicity` columns into a single `race_and_ethnicity` col.

    Parameters:
    - df: must have cols for `race` and `ethnicity`, and any supplied `count_cols_to_sum`, and `additional_group_cols`.
    - count_cols_to_sum: A list of column names with topic counts that will be summed.
         (All Hispanic cases across various race groups will sum to be a new row with race_category_id='HISP'
         same for the sum of various types of unknown race/ethnicity).
    - race_alone_to_het_code_map: A dict of source race names to their race_category_id code including `_NH` as needed.
    Optional parameters:
    - ethnicity_value (optional default='Hispanic or Latino'): str value of `ethnicity` col representing Hispanic
    - unknown_values (optional): List of values to be considered as unknown ethnicity or race
    - additional_group_cols (optional): List of additional columns to group by
    - race_eth_output_col (optional default='race_and_ethnicity'): str name of the added combination race and eth col
    - treat_zero_count_as_missing (optional default=False): if True, sum gets min_count=1 argument
    """

    # Require std_col.RACE_COL and std_col.ETH_COL
    if std_col.RACE_COL not in df.columns or std_col.ETH_COL not in df.columns:
        raise ValueError("df must contain columns: std_col.RACE_COL and std_col.ETH_COL")

    if unknown_values is None:
        unknown_values = ["NA", "Missing", "Unknown"]

    # Create a copy of the DataFrame to avoid SettingWithCopyWarning
    df = df.copy()

    # Create the race_and_ethnicity column defaulting to unknown
    df[race_eth_output_col] = std_col.Race.UNKNOWN.value

    # Set to 'HISP' where ethnicity matches ethnicity_value
    df.loc[df[std_col.ETH_COL] == ethnicity_value, race_eth_output_col] = std_col.Race.HISP.value

    # Set to mapped race value where ethnicity is not ethnicity_value and neither race nor ethnicity is unknown
    mask = (
        (df[std_col.ETH_COL] != ethnicity_value)
        & (~df[std_col.RACE_COL].isin(unknown_values))
        & (~df[std_col.ETH_COL].isin(unknown_values))
    )
    df.loc[mask, race_eth_output_col] = (
        df.loc[mask, std_col.RACE_COL].map(race_alone_to_het_code_map).fillna(std_col.Race.UNKNOWN.value)
    )

    df = df.drop(columns=[std_col.RACE_COL, std_col.ETH_COL])

    # Aggregate the data by whichever breakdown cols are present
    group_cols = []
    possible_group_cols = [
        std_col.TIME_PERIOD_COL,
        std_col.STATE_FIPS_COL,
        std_col.STATE_NAME_COL,
        std_col.COUNTY_FIPS_COL,
        std_col.COUNTY_NAME_COL,
        race_eth_output_col,
    ]

    if additional_group_cols is not None:
        possible_group_cols.extend(additional_group_cols)

    for col in possible_group_cols:
        if col in df.columns:
            group_cols.append(col)

    # needed to satisfy mypy
    def sum_function(x, min_count: int = 0):
        return x.sum(min_count=min_count)

    agg_col_map: dict[str, Callable[[Any], Any]] = {
        count_col: lambda x: sum_function(x, min_count=1 if treat_zero_count_as_missing else 0)
        for count_col in count_cols_to_sum
    }

    if not count_cols_to_sum:
        return df

    # if count cols were provided, we need the new HISP rows to sum the various Hispanic+Race groups
    df_aggregated = df.groupby(group_cols).agg(agg_col_map).reset_index()

    return df_aggregated


def get_timeview_df_and_cols(
    df: pd.DataFrame, time_view: TIME_VIEW_TYPE, topic_prefixes: List[str]
) -> Tuple[pd.DataFrame, Dict[str, str]]:
    """Returns a dataframe with only the rows and columns that are needed for the given time view.

    Parameters:
    - df: The dataframe to process.
    - time_view: The time view to process for. Can be 'current' or 'historical'.
    - topic_prefixes: The list of str topic prefixes e.g. ['covid', 'diabetes', 'population_pct]

    Returns:
    - A tuple containing the processed DataFrame and a dict mapping column names needed by BigQuery
    """

    if time_view not in ["current", "historical"]:
        raise ValueError('time_view must be either "current" or "historical"')

    df = df.copy()

    # remove unneeded columns
    unwanted_suffixes = (
        std_col.SUFFIXES_CURRENT_TIME_VIEWS if time_view == "historical" else std_col.SUFFIXES_HISTORICAL_TIME_VIEWS
    )

    for col in df.columns:
        if std_col.ends_with_suffix_from_list(col, unwanted_suffixes):
            df.drop(columns=[col], inplace=True)

    # remove unneeded rows
    if time_view == "current":
        df = preserve_most_recent_year_rows_per_topic(df, topic_prefixes)

    bq_col_types = build_bq_col_types(df)

    return (df, bq_col_types)


def build_bq_col_types(df: pd.DataFrame) -> Dict[str, str]:
    """Returns a dict mapping column names needed by BigQuery to their BQ types."""
    bq_col_types: Dict[str, str] = {}
    for col in df.columns:
        if col.endswith(std_col.IS_SUPPRESSED_SUFFIX):
            bq_col_types[col] = BQ_BOOLEAN
        elif std_col.ends_with_suffix_from_list(col, std_col.SUFFIXES):
            bq_col_types[col] = BQ_FLOAT
        else:
            bq_col_types[col] = BQ_STRING
    return bq_col_types


# TODO: Remove in favor of new function get_timeview_df_and_cols() above
def generate_time_df_with_cols_and_types(
    df: pd.DataFrame,
    numerical_cols_to_keep: List[str],
    table_type: Literal["current", "historical"],
    dem_col: Literal["age", "race", "race_and_ethnicity", "sex"],
) -> tuple[pd.DataFrame, Dict[str, str]]:  # pylint: disable=unsubscriptable-object
    """
    Accepts a DataFrame along with list of column names for either current or
    historical data and generates the appropriate BQ types for each column.

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

    # Remove duplicate columns in the DataFrame
    df = df.loc[:, ~df.columns.duplicated()]

    # Remove duplicate columns in float_cols
    float_cols = list(dict.fromkeys([col for col in numerical_cols_to_keep if col in df.columns]))

    df[float_cols] = df[float_cols].astype(float)

    column_types = {c: (BQ_FLOAT if c in float_cols else BQ_STRING) for c in df.columns}

    return df, column_types


def generate_estimated_total_col(
    df: pd.DataFrame,
    intersectional_pop_col: str,
    rate_to_raw_col_map: Dict[str, str],
) -> pd.DataFrame:
    """
    Generates the estimated_total column by applying the given rate col against the intersectional population.
    Note: the needed 'intersectional_pop_col' is obtained from the output of merge_utils.merge_intersectional_pop()

    Parameters:
    - df: The DataFrame to be processed.
    - intersectional_pop_col: The str col name of the incoming df's specific intersectional population,
    e.g. 'population_18+' or 'population_18+_Male'.
    - rate_to_raw_col_map: A dict of rate column names to their corresponding raw count column names.

    Returns:
    - A DataFrame with the estimated_total column(s) added.
    """

    # calculate the estimated_total
    conversion_factor = 1

    for rate_col, raw_col in rate_to_raw_col_map.items():

        if std_col.PCT_RATE_SUFFIX in rate_col:
            conversion_factor = 100
        elif std_col.PER_100K_SUFFIX in rate_col:
            conversion_factor = 100_000
        else:
            raise ValueError(f"{rate_col} must have a suffix of _pct_rate or _per_100k.")

        df[raw_col] = df[rate_col] / conversion_factor * df[intersectional_pop_col]
        df[raw_col] = df[raw_col].round()

    return df
