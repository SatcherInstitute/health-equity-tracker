import pandas as pd


def generate_pct_share_col(df, raw_count_col, pct_share_col, breakdown_col, total_val):
    """Returns a DataFrame with a percent share row based on the raw_count_col
       Each row must have a corresponding 'TOTAL' row.

       df: DataFrame to generate the `pct_share_col` for.
       raw_count_col: String column name with the
                      raw count to use to caculate the `pct_share_col`.
       pct_share_col: String column name to create with the percent share.
       breakdown_col: The name of column to calculate the percent across.
       total_val: The value representing 'ALL' or 'TOTAL'"""

    def calc_pct_share(record, total_value):
        record[pct_share_col] = percent_avoid_rounding_to_zero(record[raw_count_col], total)
        return record

    groupby_cols = list(df.columns)
    groupby_cols.remove(breakdown_col)
    groupby_cols.remove(raw_count_col)

    with_pct_share = []
    grouped = df.groupby(groupby_cols)
    for _, group_df in grouped:
        total_row = group_df.loc[(group_df[breakdown_col] == total_val)]

        if len(total_row) == 0:
            raise ValueError("There is no TOTAL value for this chunk of data")

        if len(total_row) > 1:
            raise ValueError("There are multiple TOTAL values for this chunk of data, there should only be one")

        total = total_row[raw_count_col].values[0]
        with_pct_share.append(group_df.reset_index(drop=True).apply(calc_pct_share, args=(total,), axis=1))

    return pd.concat(with_pct_share).reset_index(drop=True)


def percent_avoid_rounding_to_zero(numerator, denominator, default_decimals=1, max_decimals=2):
    """Calculates percentage to `default_decimals` number of decimal places. If
       the percentage would round to 0, calculates with more decimal places until
       either it doesn't round to 0, or until `max_decimals`. `default_decimals`
       and `max_decimals` should be >= 0 and `max_decimals` should be >=
       `default_decimals`. """

    decimals = default_decimals
    pct = round((float(numerator) / float(denominator) * 100), decimals)
    while pct == 0 and numerator != 0 and decimals < max_decimals:
        decimals += 1
        pct = round((float(numerator) / float(denominator) * 100), decimals)

    return pct


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
       breakdown_col: The name of the breakdown column that a new value is being
                      summed over.
       value_col: The name of the column whose values should be summed.
       new_row_breakdown_val: The value to use for the breakdown column.
       breakdown_vals_to_sum: The list of breakdown values to sum across. If not
                              provided, defaults to summing across all values.
       """
    filtered_df = df
    if breakdown_vals_to_sum is not None:
        filtered_df = df.loc[df[breakdown_col].isin(breakdown_vals_to_sum)]

    group_by_cols = list(df.columns)
    group_by_cols.remove(breakdown_col)
    group_by_cols.remove(value_col)

    sums = filtered_df.groupby(group_by_cols).sum().reset_index()
    sums[breakdown_col] = new_row_breakdown_val

    result = pd.concat([df, sums])
    result = result.reset_index(drop=True)
    return result
