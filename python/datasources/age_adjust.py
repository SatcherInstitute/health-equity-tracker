from google.cloud import bigquery

import ingestion.standardized_columns as std_col
import pandas as pd

# plan for age adjustment
# 1. do a race_and_age type situation
# 2. age adjust based off of that
# 3. profit
REFERENCE_POPULATION = std_col.Race.WHITE_NH.value


def get_population_df():
    bqclient = bigquery.Client()

    query_string = """
SELECT *
FROM `jzarrabi-het-infra-test-f4.acs_population.by_age_race_county_decade_buckets`
"""
    return bqclient.query(query_string).result().to_dataframe()


def age_adjust(race_and_age_df, population_df, geo):
    pass
