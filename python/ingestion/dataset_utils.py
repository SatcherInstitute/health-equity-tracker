import pandas as pd  # type: ignore
from ingestion import gcs_to_bq_util
import ingestion.standardized_columns as std_col
import ingestion.constants as constants


def generate_pct_share_col(df, raw_count_col, pct_share_col, breakdown_col, all_val):
    """Returns a DataFrame with a percent share row based on the raw_count_col
       Each row must have a corresponding 'ALL' row.

       df: DataFrame to generate the `pct_share_col` for.
       raw_count_col: String column name with the
                      raw count to use to calculate the `pct_share_col`.
       pct_share_col: String column name to create with the percent share.
       breakdown_col: The name of column to calculate the percent across.
       all_val: The value representing 'ALL'"""

    def calc_pct_share(record, total_value):
        record[pct_share_col] = percent_avoid_rounding_to_zero(
            record[raw_count_col], total_value)
        return record

    groupby_cols = [std_col.STATE_FIPS_COL]
    if std_col.COUNTY_FIPS_COL in df.columns:
        groupby_cols.append(std_col.COUNTY_FIPS_COL)

    with_pct_share = []
    grouped = df.groupby(groupby_cols)

    for _, group_df in grouped:
        total_row = group_df.loc[(group_df[breakdown_col] == all_val)]

        if len(total_row) == 0:
            raise ValueError("There is no ALL value for this chunk of data")

        if len(total_row) > 1:
            raise ValueError(
                "There are multiple ALL values for this chunk of data, there should only be one")

        total = total_row[raw_count_col].values[0]
        with_pct_share.append(group_df.reset_index(
            drop=True).apply(calc_pct_share, args=(total,), axis=1))

    return pd.concat(with_pct_share).reset_index(drop=True)


def percent_avoid_rounding_to_zero(numerator, denominator, default_decimals=1, max_decimals=2):
    """Calculates percentage to `default_decimals` number of decimal places. If
       the percentage would round to 0, calculates with more decimal places until
       either it doesn't round to 0, or until `max_decimals`. `default_decimals`
       and `max_decimals` should be >= 0 and `max_decimals` should be >=
       `default_decimals`.

       Avoids division by zero errors and returns `0.0` instead
        """

    if denominator == 0:
        return 0.0
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


def merge_fips_codes(df):
    """Merges in the `state_fips` column into a dataframe, based on the `census_utility` big query public dataset.

       df: dataframe to merge fips codes into, with a `state_name` column"""

    all_fips_codes_df = gcs_to_bq_util.load_public_dataset_from_bigquery_as_df(
        'census_utility', 'fips_codes_states', dtype={'state_fips_code': str})

    united_states_fips = pd.DataFrame(
        [{'state_fips_code': constants.US_FIPS, 'state_name': constants.US_NAME}])
    all_fips_codes_df = all_fips_codes_df[['state_fips_code', 'state_name']]
    all_fips_codes_df = pd.concat([all_fips_codes_df, united_states_fips])

    df = pd.merge(df, all_fips_codes_df, how='left',
                  on=std_col.STATE_NAME_COL).reset_index(drop=True)
    df = df.rename(
        columns={'state_fips_code': std_col.STATE_FIPS_COL}).reset_index(drop=True)

    return df


def replace_state_abbr_with_names(df):
    """Replaces all two-letter place codes with the place name.  based on the `census_utility` big query public dataset.
       df: dataframe to swap two-letter abbreviations for names, with a `state_postal_abbreviation` column"""

    # get table from BQ
    all_state_codes_df = gcs_to_bq_util.load_public_dataset_from_bigquery_as_df(
        'census_utility', 'fips_codes_states', dtype={std_col.STATE_NAME_COL: str, 'state_postal_abbreviation': str})
    all_state_codes_df = all_state_codes_df[[
        std_col.STATE_NAME_COL, 'state_postal_abbreviation']]

    # add USA as a "state" for potentially swapping
    united_states_code = pd.DataFrame(
        [{'state_postal_abbreviation': constants.US_ABBR, std_col.STATE_NAME_COL: constants.US_NAME}])
    all_state_codes_df = pd.concat([all_state_codes_df, united_states_code])

    # swap CODES for NAMES
    df = pd.merge(df, all_state_codes_df, how='left',
                  on='state_postal_abbreviation').reset_index(drop=True)
    df = df.drop(columns=['state_postal_abbreviation'])
    return df


def merge_pop_numbers(df, demo, loc):
    """Merges the corresponding `population` and `population_pct` column into the given df

      df: a pandas df with demographic (race, sex, or age) and a `state_fips` column
      demo: the demographic in the df, either `age`, `race`, or `sex`
      loc: the location level for the df, either `state` or `national`"""

    on_col_map = {
        'age': std_col.AGE_COL,
        'race': std_col.RACE_CATEGORY_ID_COL,
        'sex': std_col.SEX_COL,
    }

    pop_dtype = {std_col.STATE_FIPS_COL: str,
                 std_col.POPULATION_COL: object,
                 std_col.POPULATION_PCT_COL: float}

    if demo not in on_col_map:
        raise ValueError('%s not a demographic option, must be one of: %s' % (
            demo, list(on_col_map.keys())))

    pop_table_name = 'by_%s_%s' % (demo, loc)

    # all states, DC, PR
    if demo == 'race' and loc == 'state':
        pop_table_name += '_std'

    pop_df = gcs_to_bq_util.load_df_from_bigquery(
        'acs_population', pop_table_name, pop_dtype)
    pop_df = pop_df[[std_col.STATE_FIPS_COL, on_col_map[demo],
                     std_col.POPULATION_COL, std_col.POPULATION_PCT_COL]]

    # other territories from ACS 2010 (VI, GU, AS, MP)
    if loc == 'state':
        verbose_demo = "race_and_ethnicity" if demo == 'race' else demo
        pop_2010_table_name = 'by_%s_territory' % (
            verbose_demo)

        pop_2010_df = gcs_to_bq_util.load_df_from_bigquery(
            'acs_2010_population', pop_2010_table_name, pop_dtype)
        pop_2010_df = pop_2010_df[[std_col.STATE_FIPS_COL, on_col_map[demo],
                                   std_col.POPULATION_COL, std_col.POPULATION_PCT_COL]]
        pop_df = pd.concat([pop_df, pop_2010_df])
        pop_df = pop_df.sort_values(std_col.STATE_FIPS_COL)

    df = pd.merge(df, pop_df, how='left', on=[
                  std_col.STATE_FIPS_COL, on_col_map[demo]])

    return df.reset_index(drop=True)
