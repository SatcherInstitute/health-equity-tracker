from google.cloud import bigquery

import ingestion.standardized_columns as std_col
import pandas as pd

# plan for age adjustment
# 1. do a race_and_age type situation
# 2. age adjust based off of that
# 3. profit
REFERENCE_POPULATION = std_col.Race.WHITE_NH.value

# def get_population_df():
#     bqclient = bigquery.Client()

#     query_string = """
# SELECT *
# FROM `jzarrabi-het-infra-test-f4.acs_population.by_age_race_county_decade_buckets`
# """
#     return bqclient.query(query_string).result().to_dataframe()


def per_100k(rate):
    return round(rate * 1000 * 100, 2)


def get_expected_deaths(race_and_age_df, population_df):

    def get_expected_death_rate(row):
        true_death_rate = float(row['death_y']) / float(row['population'])

        ref_pop_size = df.loc[
                (df[std_col.RACE_CATEGORY_ID_COL] == REFERENCE_POPULATION) &
                (df[std_col.AGE_COL] == row[std_col.AGE_COL]) &
                (df[std_col.STATE_FIPS_COL] == row[std_col.STATE_FIPS_COL])
            ][std_col.POPULATION_COL].values[0]

        return round(true_death_rate * ref_pop_size, 2)

    on_cols = [std_col.STATE_FIPS_COL, std_col.STATE_NAME_COL, std_col.AGE_COL]
    on_cols.extend(std_col.RACE_COLUMNS)

    df = pd.merge(race_and_age_df, population_df, how='left', on=on_cols)
    df = df.loc[df[std_col.AGE_COL] != "UNKNOWN"]

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

    # fips_codes = race_and_age_df['state_fips'].drop_duplicates().to_list()

    # for fips_code in fips_codes:
    #     geo_area = race_and_age_df.loc[race_and_age_df[GEO_TO_FIPS_COL[geo]] == fips_code]
    #     races = geo_area['race_category_id'].drop_duplicates().to_list()
    # return race_and_age_df
