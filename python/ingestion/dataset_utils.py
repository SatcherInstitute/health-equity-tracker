import pandas as pd  # type: ignore
import numpy as np  # type: ignore
from ingestion import gcs_to_bq_util
import ingestion.standardized_columns as std_col
import ingestion.constants as constants


def generate_pct_share_col(df, raw_count_to_pct_share, breakdown_col, all_val):
    """Returns a DataFrame with a percent share row based on the raw_count_col
       Each row must have a corresponding 'ALL' row.

       df: DataFrame to generate the `pct_share_col` for.
       raw_count_col: String column name with the
                      raw count to use to calculate the `pct_share_col`.
       pct_share_col: String column name to create with the percent share.
       breakdown_col: The name of column to calculate the percent across.
       all_val: The value representing 'ALL'"""

    def calc_pct_share(record, raw_count_col):
        return percent_avoid_rounding_to_zero(
            record[raw_count_col], record[f'{raw_count_col}_all'])

    rename_cols = {}
    for raw_count_col in raw_count_to_pct_share.keys():
        rename_cols[raw_count_col] = f'{raw_count_col}_all'

    alls = df.loc[df[breakdown_col] == all_val]
    alls = alls.rename(columns=rename_cols)

    on_cols = [std_col.STATE_FIPS_COL]
    if std_col.COUNTY_FIPS_COL in df.columns:
        on_cols.append(std_col.COUNTY_FIPS_COL)

    alls = alls[on_cols + list(rename_cols.values())]

    grouped = df.groupby(on_cols)

    if len(alls) != len(grouped):
        raise ValueError(
            f'This dataset has {len(alls)} alls and {len(grouped)} groups, they should be the same')

    df = pd.merge(df, alls, how='left', on=on_cols)

    for raw_count_col, pct_share_col in raw_count_to_pct_share.items():
        df[pct_share_col] = df.apply(calc_pct_share, axis=1, args=(raw_count_col,))

    df = df.drop(columns=list(rename_cols.values()))
    return df.reset_index(drop=True)


def generate_per_100k_col(df, raw_count_col, pop_col, per_100k_col):
    """Returns a dataframe with a `per_100k` column

       df: DataFrame to generate the `per_100k_col` for.
       raw_count_col: String column name with the total number of people
                      who have the given condition.
       pop_col: String column name with the population number.
       per_100k_col: String column name to place the generate row in."""

    def calc_per_100k(record):
        per_100k = percent_avoid_rounding_to_zero(1000 * float(record[raw_count_col]), float(record[pop_col]))
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
       `default_decimals`.

       Avoids division by zero errors and returns `0.0` instead"""

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
    """Merges in the `state_fips` column into a dataframe, based on the
       `census_utility` big query public dataset.

       df: dataframe to merge fips codes into, with a `state_name` or `state_postal` column"""

    all_fips_codes_df = gcs_to_bq_util.load_public_dataset_from_bigquery_as_df(
        'census_utility', 'fips_codes_states', dtype={'state_fips_code': str})

    united_states_fips = pd.DataFrame([
        {
            'state_fips_code': constants.US_FIPS,
            'state_name': constants.US_NAME,
            'state_postal_abbreviation': constants.US_ABBR,
        }
    ])

    all_fips_codes_df = all_fips_codes_df[['state_fips_code', 'state_name', 'state_postal_abbreviation']]
    all_fips_codes_df = pd.concat([all_fips_codes_df, united_states_fips])

    all_fips_codes_df = all_fips_codes_df.rename(
        columns={
            'state_fips_code': std_col.STATE_FIPS_COL,
            'state_postal_abbreviation': std_col.STATE_POSTAL_COL,
        }).reset_index(drop=True)

    merge_col = std_col.STATE_NAME_COL
    if std_col.STATE_POSTAL_COL in df.columns:
        merge_col = std_col.STATE_POSTAL_COL

    df = pd.merge(df, all_fips_codes_df, how='left',
                  on=merge_col).reset_index(drop=True)

    if std_col.STATE_POSTAL_COL in df.columns:
        df = df.drop(columns=std_col.STATE_POSTAL_COL)

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
                 std_col.POPULATION_COL: float,
                 std_col.POPULATION_PCT_COL: float}

    if demo not in on_col_map:
        raise ValueError('%s not a demographic option, must be one of: %s' % (
            demo, list(on_col_map.keys())))

    pop_table_name = f'by_{demo}_{loc}'

    # all states, DC, PR
    if demo == 'race' and (loc == 'state' or loc == 'county'):
        pop_table_name += '_std'

    pop_df = gcs_to_bq_util.load_df_from_bigquery(
        'acs_population', pop_table_name, pop_dtype)

    needed_cols = [std_col.STATE_FIPS_COL, on_col_map[demo],
                   std_col.POPULATION_COL, std_col.POPULATION_PCT_COL]

    if loc == 'county':
        needed_cols.append(std_col.COUNTY_FIPS_COL)

    pop_df = pop_df[needed_cols]

    # other territories from ACS 2010 (VI, GU, AS, MP)
    if loc == 'state':
        verbose_demo = "race_and_ethnicity" if demo == 'race' else demo
        pop_2010_table_name = f'by_{verbose_demo}_territory'

        pop_2010_df = gcs_to_bq_util.load_df_from_bigquery(
            'acs_2010_population', pop_2010_table_name, pop_dtype)
        pop_2010_df = pop_2010_df[[std_col.STATE_FIPS_COL, on_col_map[demo],
                                   std_col.POPULATION_COL, std_col.POPULATION_PCT_COL]]

        pop_df = pd.concat([pop_df, pop_2010_df])
        pop_df = pop_df.sort_values(std_col.STATE_FIPS_COL)

    on_cols = [std_col.STATE_FIPS_COL, on_col_map[demo]]
    if loc == 'county':
        on_cols.append(std_col.COUNTY_FIPS_COL)

    df = pd.merge(df, pop_df, how='left', on=on_cols)

    return df.reset_index(drop=True)
