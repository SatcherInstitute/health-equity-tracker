from google.cloud import bigquery

import ingestion.standardized_columns as std_col
import pandas as pd

REFERENCE_POPULATION = std_col.Race.WHITE_NH.value

AGE_ADJUST_RACES = {std_col.Race.WHITE_NH.value, std_col.Race.BLACK_NH.value, std_col.Race.HISP.value,
                    std_col.Race.AIAN_NH.value, std_col.Race.NHPI_NH.value, std_col.Race.ASIAN_NH.value}

# def get_population_df():
#     bqclient = bigquery.Client()

#     query_string = """
# SELECT *
# FROM `jzarrabi-het-infra-test-f4.acs_population.by_age_race_county_decade_buckets`
# """
#     return bqclient.query(query_string).result().to_dataframe()


def get_race_age_covid_df():
    bqclient = bigquery.Client()

    query_string = """
SELECT *
FROM `jzarrabi-het-infra-test-f4.cdc_restricted_data.by_race_age_state`
"""
    return bqclient.query(query_string).result().to_dataframe()


def per_100k(rate):
    return round(rate * 1000 * 100, 2)


def get_expected_deaths(race_and_age_df, population_df):

    def get_expected_death_rate(row):
        true_death_rate = float(row['death_y']) / float(row['population'])

        ref_pop_size = population_df.loc[
                (population_df[std_col.RACE_CATEGORY_ID_COL] == REFERENCE_POPULATION) &
                (population_df[std_col.AGE_COL] == row[std_col.AGE_COL]) &
                (population_df[std_col.STATE_FIPS_COL] == row[std_col.STATE_FIPS_COL])
            ][std_col.POPULATION_COL].values[0]

        return round(true_death_rate * ref_pop_size, 2)

    on_cols = [std_col.STATE_FIPS_COL, std_col.STATE_NAME_COL, std_col.AGE_COL]
    on_cols.extend(std_col.RACE_COLUMNS)

    df = pd.merge(race_and_age_df, population_df, how='left', on=on_cols)

    states_with_pop = set(population_df[std_col.STATE_FIPS_COL].drop_duplicates().to_list())
    df = df.loc[df[std_col.AGE_COL] != "UNKNOWN"].reset_index(drop=True)
    df = df.loc[df[std_col.RACE_CATEGORY_ID_COL].isin(AGE_ADJUST_RACES)].reset_index(drop=True)
    df = df.loc[df[std_col.STATE_FIPS_COL].isin(states_with_pop)].reset_index(drop=True)

    df['expected_deaths'] = df.apply(get_expected_death_rate, axis=1)

    return df


def age_adjust(df, population_df):

    def get_age_adjusted_rate(row):
        ref_pop_size = population_df.loc[
                (population_df[std_col.RACE_CATEGORY_ID_COL] == REFERENCE_POPULATION) &
                (population_df[std_col.AGE_COL] == std_col.ALL_VALUE) &
                (population_df[std_col.STATE_FIPS_COL] == row[std_col.STATE_FIPS_COL])
            ][std_col.POPULATION_COL].values[0]

        return per_100k(row['expected_deaths'] / ref_pop_size)

    groupby_cols = [std_col.STATE_FIPS_COL, std_col.STATE_NAME_COL]
    groupby_cols.extend(std_col.RACE_COLUMNS)

    grouped = df.groupby(groupby_cols)
    df = grouped.sum().reset_index()

    df['age_adjusted_deaths_per_100k'] = df.apply(get_age_adjusted_rate, axis=1)

    needed_cols = groupby_cols
    needed_cols.append('age_adjusted_deaths_per_100k')

    return df[needed_cols]


def age_adjust_states():
    pop_data = pd.read_csv('all-pop.csv', dtype={'state_fips': str})
    covid_data = get_race_age_covid_df()

    df = get_expected_deaths(covid_data, pop_data)
    df = age_adjust(df, pop_data)

    df.to_json('age-adjusted-all.json', orient='records')
