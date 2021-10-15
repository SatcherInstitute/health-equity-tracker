import pandas as pd


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
