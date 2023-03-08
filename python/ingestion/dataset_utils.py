from typing import Literal, List, Dict
import pandas as pd  # type: ignore
import numpy as np  # type: ignore
import ingestion.standardized_columns as std_col
from ingestion.standardized_columns import Race
from ingestion.constants import (
    NATIONAL_LEVEL,
    STATE_LEVEL,
    COUNTY_LEVEL,
    RACE,
    UNKNOWN
)
from functools import reduce


def melt_to_het_style_df(
        source_df: pd.DataFrame,
        demo_col: Literal["age",
                          "sex",
                          "race",
                          "race_and_ethnicity"],
        keep_cols: List[Literal["county_fips",
                                "county_name",
                                "state_fips",
                                "state_name",
                                "time_period"]],
        value_to_cols: Dict[str, Dict[str, str]]
):
    """ Generalized util fn for melting a source df into the skinny/long
    HET-style df that contains 1 row per FIP/GROUP (or FIPS/TIME_PERIOD/GROUP)
    and a unique col per metric

    df: incoming wide/short df that contains 1 row per FIP (or FIPS/TIME_PERIOD)
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
        df = df.melt(id_vars=keep_cols,
                     var_name=demo_col,
                     value_name=value_name)
        partial_dfs.append(df)

    # merge all partial_dfs
    result_df = reduce(
        lambda x, y: pd.merge(x, y,
                              on=[*keep_cols,
                                  demo_col]), partial_dfs)

    return result_df.sort_values(by=keep_cols).reset_index(drop=True)


def generate_pct_share_col_without_unknowns(df: pd.DataFrame,
                                            raw_count_to_pct_share: dict,
                                            breakdown_col: Literal["sex", "age", "race", "race_and_ethnicity"],
                                            all_val: str):
    """Returns a DataFrame with a percent share column based on the raw_count_cols
       Each row must have a corresponding 'ALL' row.
       This function is meant to be used on datasets without any rows where the
       breakdown value is `Unknown`.

       df: DataFrame to generate the `pct_share_col` for.
       raw_count_to_pct_share: A dictionary with the mapping of raw_count
                               columns to the pct_share columns they should
                               be used to generate. eg: ({'population': 'population_pct'})
       breakdown_col: The name of column to calculate the percent across.
       all_val: The value representing 'ALL'"""

    all_demo_values = set(df[breakdown_col].to_list())
    if Race.UNKNOWN.value in all_demo_values or 'Unknown' in all_demo_values:
        raise ValueError(('This dataset contains unknowns, use the'
                          'generate_pct_share_col_with_unknowns function instead'))

    return _generate_pct_share_col(df, raw_count_to_pct_share, breakdown_col, all_val)


def generate_pct_share_col_with_unknowns(df, raw_count_to_pct_share,
                                         breakdown_col, all_val, unknown_val):
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
                      (race/sex/age).
       all_val: String representing an ALL demographic value in the dataframe.
       unknown_val: String representing an UNKNOWN value in the dataframe."""

    # First, only run the _generate_pct_share_col function on the UNKNOWNS
    # in the dataframe, so we only need the ALL and UNKNOWN rows
    unknown_all_df = df.loc[df[breakdown_col].isin({unknown_val, all_val})]
    unknown_all_df = _generate_pct_share_col(
        unknown_all_df, raw_count_to_pct_share, breakdown_col, all_val)

    # Make sure this dataframe contains unknowns
    unknown_df = df.loc[df[breakdown_col] ==
                        unknown_val].reset_index(drop=True)
    if len(unknown_df) == 0:
        raise ValueError(('This dataset does not contains unknowns, use the'
                          'generate_pct_share_col_without_unknowns function instead'))

    df = df.loc[~df[breakdown_col].isin({unknown_val, all_val})]

    groupby_cols = [std_col.STATE_FIPS_COL]
    if std_col.COUNTY_FIPS_COL in df.columns:
        groupby_cols.append(std_col.COUNTY_FIPS_COL)
    if std_col.TIME_PERIOD_COL in df.columns:
        groupby_cols.append(std_col.TIME_PERIOD_COL)

    # Calculate an all demographic based on the known cases.
    alls = df.groupby(groupby_cols).sum().reset_index()
    alls[breakdown_col] = all_val
    df = pd.concat([df, alls]).reset_index(drop=True)

    df = _generate_pct_share_col(
        df, raw_count_to_pct_share, breakdown_col, all_val)

    df = df.loc[df[breakdown_col] != all_val]

    for share_of_known_col in raw_count_to_pct_share.values():
        unknown_all_df.loc[unknown_all_df[breakdown_col]
                           == all_val, share_of_known_col] = 100.0

    df = pd.concat([df, unknown_all_df]).reset_index(drop=True)
    return df


def _generate_pct_share_col(df, raw_count_to_pct_share, breakdown_col, all_val):
    def calc_pct_share(record, raw_count_col):
        return percent_avoid_rounding_to_zero(
            record[raw_count_col], record[f'{raw_count_col}_all'])

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
    split_cols = [std_col.COUNTY_FIPS_COL] if std_col.COUNTY_FIPS_COL in \
        df.columns else [std_col.STATE_FIPS_COL]

    if std_col.TIME_PERIOD_COL in df.columns:
        split_cols.append(std_col.TIME_PERIOD_COL)

    all_splits = df[split_cols].drop_duplicates()
    all_splits = list(all_splits.itertuples(index=False, name=None))

    value_counts = alls[split_cols].value_counts()
    for f in all_splits:
        count = value_counts[f]
        if count != 1:
            raise ValueError(
                f'Fips {f} has {count} ALL rows, there should be 1')

    df = pd.merge(df, alls, how='left', on=on_cols)

    for raw_count_col, pct_share_col in raw_count_to_pct_share.items():
        df[pct_share_col] = df.apply(
            calc_pct_share, axis=1, args=(raw_count_col,))

    df = df.drop(columns=list(rename_cols.values()))
    return df.reset_index(drop=True)


def generate_per_100k_col(df, raw_count_col, pop_col, per_100k_col):
    """Returns a dataframe with a `per_100k` column

       df: DataFrame to generate the `per_100k_col` for.
       raw_count_col: String column name with the total number of people
                      who have the given condition.
       pop_col: String column name with the population number.
       per_100k_col: String column name to place the generated row in."""

    def calc_per_100k(record):
        per_100k = percent_avoid_rounding_to_zero(1000 * float(record[raw_count_col]),
                                                  float(record[pop_col]), 0, 0)
        if not pd.isna(per_100k):
            return round(per_100k, 0)
        return np.nan

    df[per_100k_col] = df.apply(calc_per_100k, axis=1)
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

    if ratio < .1:
        return None

    return round(ratio, 1)


def add_sum_of_rows(df, breakdown_col, value_col, new_row_breakdown_val,
                    breakdown_vals_to_sum=None):
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

    if type(value_col) == str:
        group_by_cols.remove(value_col)
    else:
        for col in value_col:
            group_by_cols.remove(col)

    sums = filtered_df.groupby(group_by_cols).sum().reset_index()
    sums[breakdown_col] = new_row_breakdown_val

    result = pd.concat([df, sums])
    result = result.reset_index(drop=True)
    return result


def estimate_total(row, condition_name_per_100k):
    """Returns an estimate of the total number of people with a given condition.
        Parameters:
            row: a dataframe row containing a "per_100k" column with values for the incidence rate
                and a "population" column containing the total number of people
            condition_name_per_100k: string column name of the "per_100k" referenced above used for the calc
        Returns:
            float value representing the estimated raw total for the row
            """

    if (pd.isna(row[condition_name_per_100k]) or
        pd.isna(row[std_col.POPULATION_COL]) or
            int(row[std_col.POPULATION_COL]) == 0):
        return None

    return round((float(row[condition_name_per_100k]) / 100_000) * float(row[std_col.POPULATION_COL]))


def ensure_leading_zeros(df, fips_col_name: str, num_digits: int):
    """
    Ensure a column contains values of a certain digit length, adding leading zeros as needed.
    This could be used for 5 digit fips codes, or zip codes, etc.

    Parameters:
        df: dataframe containing a column of value that need leading zeros padded to
             ensure a consistent number of digits
        fips_col_name: string column name containing the values to be padded
        num_digits: how many digits should be present after leading zeros are added
    """
    df[fips_col_name] = df[fips_col_name].apply(
        lambda code: (str(code).rjust(num_digits, '0')))
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

        pct_relative_inequity_ratio = (

            row[pct_share_col] - row[pct_pop_col]) / row[pct_pop_col]
        return round(pct_relative_inequity_ratio * 100, 1)

    df[pct_relative_inequity_col] = df.apply(
        calc_pct_relative_inequity, axis=1)
    return df


def zero_out_pct_rel_inequity(df: pd.DataFrame,
                              geo: Literal["national", "state", "county"],
                              demographic: Literal["sex", "age", "race"],
                              rate_to_inequity_col_map: dict,
                              pop_pct_col: str = None):
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

    grouped_df = df_without_all_unknown.groupby(
        geo_cols + [std_col.TIME_PERIOD_COL]).sum(min_count=1).reset_index()
    grouped_df = grouped_df.rename(columns=per_100k_col_names)
    grouped_df = grouped_df[geo_cols +
                            list(per_100k_col_names.values()) + [std_col.TIME_PERIOD_COL]]

    df = pd.merge(df_without_all_unknown, grouped_df,
                  on=geo_cols + [std_col.TIME_PERIOD_COL])
    for rate_col, pct_inequity_col in rate_to_inequity_col_map.items():
        grouped_col = f'{rate_col}_grouped'
        # set pct_inequity to 0 in a place/time_period if the summed rates are zero
        df.loc[df[grouped_col] == 0,
               pct_inequity_col] = 0

    df = df.drop(columns=list(per_100k_col_names.values()))
    df = pd.concat([df, df_all_unknown])

    # optionally preserve null pct_inequity for race rows that have no population info
    if pop_pct_col:
        df.loc[df[pop_pct_col].isnull(
        ), pct_inequity_col] = np.nan

    return df
