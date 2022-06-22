import pandas as pd  # type: ignore
import numpy as np  # type: ignore

from ingestion import gcs_to_bq_util
import ingestion.standardized_columns as std_col
import ingestion.constants as constants


def merge_fips_codes(df, county_level=False):
    """Merges in the `state_fips` column into a dataframe, based on the
       `census_utility` big query public dataset.

       df: dataframe to merge fips codes into, with a `state_name` or `state_postal` column"""

    if county_level:
        all_county_names = gcs_to_bq_util.load_public_dataset_from_bigquery_as_df(
            'census_utility', 'fips_codes_all', dtype={'state_fips_code': str, 'county_fips_code': str})
        all_county_names = all_county_names.loc[all_county_names['summary_level_name'] == 'state-county']

        all_county_names = all_county_names[['county_fips_code', 'area_name']]
        all_county_names = all_county_names.rename(
            columns={
                'county_fips_code': std_col.COUNTY_FIPS_COL,
                'area_name': std_col.COUNTY_NAME_COL,
            })

        df = df.drop(columns=std_col.COUNTY_NAME_COL)
        df = pd.merge(df, all_county_names, how='left',
                      on=std_col.COUNTY_FIPS_COL).reset_index(drop=True)

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

    df = pd.merge(df, all_fips_codes_df, how='left',
                  on=merge_col).reset_index(drop=True)

    if std_col.STATE_POSTAL_COL in df.columns:
        df = df.drop(columns=std_col.STATE_POSTAL_COL)

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


def merge_pop_numbers_per_condition(df, demo, loc, condition_cols):
    if loc != 'state':
        raise ValueError('This function should only be called for the "state" level')

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
    df = pd.merge(df, pop_df, how='left', on=on_cols)

    for col in condition_cols:
        df[f'{col}_population'] = df.apply(
                lambda row: row[std_col.POPULATION_COL] if not
                pd.isna(row[std_col.POPULATION_COL]) else np.nan, axis=1)

    return df
