import pandas as pd  # type: ignore
import numpy as np
from ingestion import gcs_to_bq_util
import ingestion.standardized_columns as std_col
import ingestion.constants as constants


def merge_county_names(df):
    """Merges standardized county names by county FIPS code found in the `census_utility`
     big query public dataset into an existing county level dataframe. Any existing
    'county_name' data in the incoming df will be overwritten.

    Parameters:
        df: county-level dataframe with a 'county_fips' column containing 5-digit FIPS code strings
    Returns:
        The same df with 'county_name' column filled with standardized county names
          """

    if std_col.COUNTY_FIPS_COL not in df.columns:
        raise ValueError(
            'Dataframe must be a county-level table with a `county_fips` column containing 5 digit FIPS strings.' +
            f'This dataframe only contains these columns: {list(df.columns)}')

    all_county_names = gcs_to_bq_util.load_public_dataset_from_bigquery_as_df(
        'census_utility', 'fips_codes_all', dtype={'state_fips_code': str, 'county_fips_code': str})
    all_county_names = all_county_names.loc[all_county_names['summary_level_name'] == 'state-county']

    all_county_names = all_county_names[['county_fips_code', 'area_name']]
    all_county_names = all_county_names.rename(
        columns={
            'county_fips_code': std_col.COUNTY_FIPS_COL,
            'area_name': std_col.COUNTY_NAME_COL,
        })

    # fill in missing territory county equivalents
    county_equivalent_names = pd.DataFrame(
        list(constants.COUNTY_EQUIVALENT_FIPS_MAP.items()), columns=[
            std_col.COUNTY_FIPS_COL, std_col.COUNTY_NAME_COL])

    all_county_names = pd.concat([
        all_county_names, county_equivalent_names
    ]).reset_index(drop=True)

    if std_col.COUNTY_NAME_COL in df.columns:
        df = df.drop(columns=std_col.COUNTY_NAME_COL)

    df = pd.merge(df, all_county_names, how='left',
                  on=std_col.COUNTY_FIPS_COL).reset_index(drop=True)

    return df


def merge_state_ids(df, keep_postal=False):
    """Accepts a df that may be lacking state info (like names, FIPS codes or postal codes)
    and merges in the missing columns based on the
       `census_utility` big query public dataset.

    Parameters:
       df: dataframe to missing info into, with at least one of the following columns:
        `state_name`, `state_postal`, `state_fips`
       keep_postal: if True, keeps the `state_postal` column, default False
    Returns:
        the same df with a 'state_fips' column containing 2-digit string FIPS codes,
        a 'state_name' column containing the standardize name,
        and optionally a 'state_postal' columns with the 2-letter postal codes
    """

    if (
        std_col.STATE_NAME_COL not in df.columns and
        std_col.STATE_POSTAL_COL not in df.columns and
        std_col.STATE_FIPS_COL not in df.columns
    ):
        raise ValueError(
            'Dataframe must be a state-level table ' +
            'with at least one of the following columns: ' +
            '`state_name`, `state_fips` (2 digit FIPS strings), ' +
            ' or `state_postal` containing 2 digit FIPS strings.' +
            f'This dataframe only contains these columns: {list(df.columns)}')

    all_fips_codes_df = gcs_to_bq_util.load_public_dataset_from_bigquery_as_df(
        'census_utility', 'fips_codes_states', dtype={'state_fips_code': str})

    united_states_fips = pd.DataFrame([
        {
            'state_fips_code': constants.US_FIPS,
            'state_name': constants.US_NAME,
            'state_postal_abbreviation': constants.US_ABBR,
        }
    ])

    unknown_fips = pd.DataFrame([
        {
            'state_fips_code': 'Unknown',
            'state_name': 'Unknown',
            'state_postal_abbreviation': 'Unknown',
        }
    ])

    all_fips_codes_df = all_fips_codes_df[['state_fips_code', 'state_name',
                                           'state_postal_abbreviation']]
    all_fips_codes_df = pd.concat(
        [all_fips_codes_df, united_states_fips, unknown_fips])

    all_fips_codes_df = all_fips_codes_df.rename(
        columns={
            'state_fips_code': std_col.STATE_FIPS_COL,
            'state_postal_abbreviation': std_col.STATE_POSTAL_COL,
        }).reset_index(drop=True)

    merge_col = std_col.STATE_NAME_COL
    if std_col.STATE_POSTAL_COL in df.columns:
        merge_col = std_col.STATE_POSTAL_COL
    if std_col.STATE_FIPS_COL in df.columns:
        merge_col = std_col.STATE_FIPS_COL

    df = pd.merge(df, all_fips_codes_df, how='left',
                  on=merge_col).reset_index(drop=True)

    if (not keep_postal) and (std_col.STATE_POSTAL_COL in df.columns):
        df = df.drop(columns=std_col.STATE_POSTAL_COL)

    return df


def merge_pop_numbers(df, demo, loc):
    """Merges the corresponding `population` and `population_pct` column into the given df

      df: a pandas df with demographic column and a `state_fips` column
      demo: the demographic in the df, either `age`, `race`, or `sex`
      loc: the location level for the df, either `county`, `state`, or `national`"""
    return _merge_pop(df, demo, loc)


def merge_current_pop_numbers(df, demo, loc, target_time_periods):
    """Merges the corresponding `population` and `population_pct` columns
    into the given df, only populating values for rows where the `time_period`
    value is in `target_time_periods`.

      df: a pandas df with demographic column and a `state_fips` column
      demo: the demographic in the df, either `age`, `race`, or `sex`
      loc: the location level for the df, either `county`, `state`, or `national`
      target_time_periods: list of strings in format YYYY or MM-YYYY used
      to target which rows to merge population data on to.
      For most topics besides COVID, these will be used to calculate
      pct_relative_inequity, and the most recent year will be
      used on DisparityBarChart.

      """

    target_rows_df = df[df[std_col.TIME_PERIOD_COL].isin(
        target_time_periods)]
    nontarget_rows_df = df[~df[std_col.TIME_PERIOD_COL].isin(
        target_time_periods)]

    # merge pop cols only onto current rows
    target_rows_df = _merge_pop(target_rows_df, demo, loc)

    # placeholder NaNs
    nontarget_rows_df[[std_col.POPULATION_COL,
                       std_col.POPULATION_PCT_COL]] = np.nan

    # reassemble the HISTORIC (null pop. data) and CURRENT (merged pop. data)
    df = pd.concat([nontarget_rows_df, target_rows_df]).reset_index(drop=True)

    return df


def merge_multiple_pop_cols(df, demo, condition_cols):
    """Merges the population of each state into a column for each condition in `condition_cols`.
       If a condition is NaN for that state the population gets counted as zero.

       This function must be called on a state level dataset.

      df: a pandas df with demographic (race, sex, or age) and a `state_fips` column
      demo: the demographic in the df, either `age`, `race`, or `sex`
      condition_cols: a list of condition column names to generate population cols for."""

    df = _merge_pop(df, demo, 'state')

    for col in condition_cols:
        df[col] = df[std_col.POPULATION_COL]

    df = df.drop(columns=[std_col.POPULATION_COL, std_col.POPULATION_PCT_COL])
    return df


def _merge_pop(df, demo, loc):
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

    needed_cols = [on_col_map[demo],
                   std_col.POPULATION_COL, std_col.POPULATION_PCT_COL]

    if std_col.STATE_FIPS_COL in df.columns:
        needed_cols.append(std_col.STATE_FIPS_COL)

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
        pop_df = pop_df.sort_values(std_col.STATE_FIPS_COL)
        pop_2010_df = pop_2010_df.sort_values(std_col.STATE_FIPS_COL)
        pop_df = pd.concat([pop_df, pop_2010_df])

    on_cols = [on_col_map[demo]]
    if std_col.STATE_FIPS_COL in df.columns:
        on_cols.append(std_col.STATE_FIPS_COL)

    if loc == 'county':
        on_cols.append(std_col.COUNTY_FIPS_COL)

    # print(df.to_string())
    # print(pop_df.to_string())

    df = pd.merge(df, pop_df, how='left', on=on_cols)

    return df.reset_index(drop=True)
