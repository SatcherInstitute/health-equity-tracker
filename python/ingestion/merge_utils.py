import pandas as pd  # type: ignore
from ingestion import gcs_to_bq_util
import ingestion.standardized_columns as std_col
import ingestion.constants as constants
from typing import Literal, List

ACS_DEFAULT_YEAR = '2019'
ACS_EARLIEST_YEAR = '2009'
ACS_LATEST_YEAR = '2021'
DECIA_CUTOFF_YEAR = '2016'


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


def merge_pop_numbers(df, demo: Literal['age', 'sex', 'race'], loc: Literal['county', 'state', 'national']):
    """Merges the corresponding `population` and `population_pct` column into the given df

      df: a pandas df with demographic column and a `state_fips` column
      demo: the demographic in the df, either `age`, `race`, or `sex`
      loc: the location level for the df, either `county`, `state`, or `national`"""

    return _merge_pop(df, demo, loc)


def merge_yearly_pop_numbers(
    df: pd.DataFrame,
    demo: Literal['age', 'race', 'sex'],
    geo_level: Literal['county', 'state', 'national']
) -> pd.DataFrame:
    """ Merges multiple years of population data onto incoming df
    that contains a `time_period` col of 4 digit string year values

    For states/counties + PR + DC:
    - Any rows where the year is earlier than 2009 will be merged as `null`
    - Any rows where the year is present in our ACS tables will be merged directly
    - Any rows where the year is later than most recent ACS year will be merged
    with that most recent year of ACS population data
    - Any rows with year 2009-2015 for Island Area territories will
        merge against the 2010 Decennial from `decia_2010`
    - Any rows with year 2016-current for Island Area territories / county-equivalents
        will merge against the 2020 Decennial from `decia_2020`

    df: pandas df with a demographic col, and `time_period` col, and a fips col
    demo: the demographic in the df
    geo_level: the location level for the df
    """

    if std_col.TIME_PERIOD_COL not in df.columns:
        raise ValueError(
            "Cannot merge by year as the provided df does not contain a `time_period` col")

    _tmp_time_period_col = "temp_time_period_col_as_int"
    df[_tmp_time_period_col] = df[std_col.TIME_PERIOD_COL].astype(int)

    # dont merge pre-2009 years
    pre_acs_rows_df = df[df[_tmp_time_period_col] < int(ACS_EARLIEST_YEAR)]

    # merge matchable years directly
    acs_rows_df = df.loc[(df[_tmp_time_period_col] >= int(ACS_EARLIEST_YEAR))
                         & (df[_tmp_time_period_col] <= int(ACS_LATEST_YEAR))]
    acs_rows_df = _merge_pop(acs_rows_df, demo, geo_level, on_time_period=True)

    # merge the most recent SOURCE data (without equivalent years from ACS) with the most recent ACS data
    post_acs_rows_df = df[df[_tmp_time_period_col] > int(ACS_LATEST_YEAR)]
    # temporarily save the original SOURCE years in a new column
    _tmp_src_yr_col = "temp_source_year_col"
    post_acs_rows_df[_tmp_src_yr_col] = post_acs_rows_df[std_col.TIME_PERIOD_COL]
    # set the mergeable column year to the most recent to merge that data from ACS
    post_acs_rows_df[std_col.TIME_PERIOD_COL] = ACS_LATEST_YEAR
    # merge that recent year pop data
    post_acs_rows_df = _merge_pop(
        post_acs_rows_df, demo, geo_level, on_time_period=True)
    # swap back to the real year data
    post_acs_rows_df[std_col.TIME_PERIOD_COL] = post_acs_rows_df[_tmp_src_yr_col]
    post_acs_rows_df = post_acs_rows_df.drop(columns=[_tmp_src_yr_col])

    # combine the three sub-dfs
    df = pd.concat([pre_acs_rows_df, acs_rows_df,
                   post_acs_rows_df], axis=0).reset_index(drop=True)
    df = df.drop(columns=[_tmp_time_period_col])

    return df


def merge_multiple_pop_cols(df: pd.DataFrame, demo: Literal['age', 'race', 'sex'], condition_cols: List[str]):
    """Merges the population of each state into a column for each condition in `condition_cols`.
       If a condition is NaN for that state the population gets counted as zero.

       This function must be called on a state level dataset.

      df: a pandas df with demographic (race, sex, or age) and a `state_fips` column
      demo: the demographic in the df, either `age`, `race`, or `sex`
      condition_cols: a list of strings which will serve as the col names to be added e.g.:
    ['condition_a_population', 'condition_b_population'] """

    df = _merge_pop(df, demo, 'state')

    for col in condition_cols:
        df[col] = df[std_col.POPULATION_COL]

    df = df.drop(columns=[std_col.POPULATION_COL, std_col.POPULATION_PCT_COL])
    return df


def _merge_pop(df, demo, loc, on_time_period: bool = None):

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

    if on_time_period:
        pop_table_name += "_time_series"
        pop_dtype[std_col.TIME_PERIOD_COL] = str

    pop_df = gcs_to_bq_util.load_df_from_bigquery(
        'acs_population', pop_table_name, pop_dtype)

    needed_cols = [on_col_map[demo],
                   std_col.POPULATION_COL, std_col.POPULATION_PCT_COL]

    if std_col.STATE_FIPS_COL in df.columns:
        needed_cols.append(std_col.STATE_FIPS_COL)

    if loc == 'county':
        needed_cols.append(std_col.COUNTY_FIPS_COL)

    keep_cols = ([*needed_cols, std_col.TIME_PERIOD_COL]
                 if on_time_period
                 else needed_cols)

    pop_df = pop_df[keep_cols]

    # merge pop data for other territories/county-equivalents
    # from DECIA_2020 (VI, GU, AS, MP)
    if loc != 'national':

        verbose_demo = "race_and_ethnicity" if demo == 'race' else demo
        pop_terr_table_name = f'by_{verbose_demo}_territory_{loc}_level'

        pop_terr_2020_df = gcs_to_bq_util.load_df_from_bigquery(
            'decia_2020_territory_population', pop_terr_table_name, pop_dtype)

        pop_terr_df = pop_terr_2020_df[needed_cols]

        if on_time_period:
            # re-use 2020 territory populations in every ACS year 2016-current
            # load and use 2010 territory populations in every ACS year 2009-2015
            pop_terr_2010_df = gcs_to_bq_util.load_df_from_bigquery(
                'decia_2010_territory_population', pop_terr_table_name, pop_dtype)
            pop_terr_2010_df = pop_terr_2010_df[needed_cols]

            yearly_pop_terr_dfs = []
            start_year = int(ACS_EARLIEST_YEAR)
            end_year = max(df[std_col.TIME_PERIOD_COL].astype(int)) + 1
            for year_num in range(start_year, end_year):
                year_str = str(year_num)
                yearly_df = (pop_terr_2010_df.copy()
                             if year_num < int(DECIA_CUTOFF_YEAR)
                             else pop_terr_df.copy())
                yearly_df[std_col.TIME_PERIOD_COL] = year_str
                yearly_pop_terr_dfs.append(yearly_df)

            # add all territory years together
            pop_terr_df = pd.concat(yearly_pop_terr_dfs)

        # add either time_series or single year territory rows to states rows
        pop_df = pd.concat([pop_df, pop_terr_df])

    on_cols = [on_col_map[demo]]
    if std_col.STATE_FIPS_COL in df.columns:
        on_cols.append(std_col.STATE_FIPS_COL)

    if loc == 'county':
        on_cols.append(std_col.COUNTY_FIPS_COL)

    if on_time_period:
        on_cols.append(std_col.TIME_PERIOD_COL)

    df = pd.merge(df, pop_df, how='left', on=on_cols)

    return df.reset_index(drop=True)
