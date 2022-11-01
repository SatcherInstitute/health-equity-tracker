from ingestion.standardized_columns import Race
from datasources.data_source import DataSource

from ingestion import gcs_to_bq_util
import ingestion.standardized_columns as std_col
import ingestion.constants as constants

import pandas as pd  # type: ignore

BASE_POPULATION_URL = (
    'https://www2.census.gov/programs-surveys/popest/datasets/2020-2021/state/asrh/sc-est2021-alldata6.csv')

# The key for SEX is as follows:
# 0 = Total
# 1 = Male
# 2 = Female

# The key for ORIGIN is as follows:
# 0 = Total
# 1 = Not Hispanic
# 2 = Hispanic

# The key for RACE is as follows:
#  1 = White Alone
# 2 = Black or African American Alone
# 3 = American Indian or Alaska Native Alone
# 4 = Asian Alone
# 5 = Native Hawaiian and Other Pacific Islander Alone
# 6 = Two or more races

# RACES_MAP = {
#     'NHWA': Race.WHITE_NH.value,
#     'NHBA': Race.BLACK_NH.value,
#     'NHIA': Race.AIAN_NH.value,
#     'NHAA': Race.ASIAN_NH.value,
#     'NHNA': Race.NHPI_NH.value,
#     'H': Race.HISP.value,
#     'ALL': Race.ALL.value
# }


# AGES_MAP = {
#     'All': (0, ), '0-9': (1, 2), '10-19': (3, 4), '20-29': (5, 6),
#     '30-39': (7, 8), '40-49': (9, 10), '50-59': (11, 12),
#     '60-69': (13, 14), '70-79': (15, 16), '80+': (17, 18)}

# YEAR_2019 = 12


# def total_race(row, race):
#     if race == 'ALL':
#         return row['TOT_POP']

#     return row[f'{race}_MALE'] + row[f'{race}_FEMALE']


class CensusPopEstimatesSC(DataSource):

    @ staticmethod
    def get_id():
        return 'CENSUS_POP_ESTIMATES_SC'

    @ staticmethod
    def get_table_name():
        return 'census_pop_estimates_sc'

    def upload_to_gcs(self, _, **attrs):
        raise NotImplementedError(
            'upload_to_gcs should not be called for CensusPopEstimatesSC')

    def write_to_bq(self, dataset, gcs_bucket, **attrs):
        df = gcs_to_bq_util.load_csv_as_df_from_web(
            BASE_POPULATION_URL, dtype={'STATE': str}, encoding="ISO-8859-1")

        state_df = generate_state_pop_data_18plus(df)

        column_types = {c: 'STRING' for c in state_df.columns}

        if std_col.RACE_INCLUDES_HISPANIC_COL in df.columns:
            column_types[std_col.RACE_INCLUDES_HISPANIC_COL] = 'BOOL'

        gcs_to_bq_util.add_df_to_bq(
            state_df, dataset, "race_and_ethnicity", column_types=column_types)


def generate_state_pop_data_18plus(df):
    """
    Accepts the raw census csv as a df

    Returns a standardized df with a single row for each combination of year, state, race OR sex groups, and the corresponding population estimate for only 18+ 
    """
    print("inside generate_state_pop_data_18plus()")
    # print(df)
    return df
