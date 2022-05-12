from datasources.data_source import DataSource
import ingestion.standardized_columns as std_col
import pandas as pd
from ingestion.standardized_columns import Race
from ingestion import gcs_to_bq_util, dataset_utils, constants
from ingestion.gcs_to_bq_util import fetch_zip_as_files


from datasources.bjs_prisoners_tables_utils import (clean_prison_table_11_df,
                                                    clean_prison_table_2_df,
                                                    clean_prison_table_23_df,
                                                    clean_prison_table_13_df,
                                                    clean_prison_appendix_table_2_df)


RAW_COL = std_col.generate_column_name(
    std_col.PRISON_PREFIX, std_col.RAW_SUFFIX)
PER_100K_COL = std_col.generate_column_name(
    std_col.PRISON_PREFIX, std_col.PER_100K_SUFFIX)
PCT_SHARE_COL = std_col.generate_column_name(
    std_col.PRISON_PREFIX, std_col.PCT_SHARE_SUFFIX)


BJS_DATA_TYPES = [
    std_col.PRISON_PREFIX,
    # std_col.JAIL_PREFIX,
    # std_col.INCARCERATED_PREFIX
]

NON_STATE_ROWS = ['U.S. total', 'State', 'Federal']

# BJS Prisoners Report

BJS_PRISONERS_ZIP = "https://bjs.ojp.gov/content/pub/sheets/p20st.zip"

APPENDIX_TABLE_2 = "p20stat02.csv"  # RAW# / STATE+FED / RACE
TABLE_2 = "p20stt02.csv"  # RAW# / STATE+FED / SEX
TABLE_11 = "p20stt11.csv"  # 100K / AGE / SEX / RACE
TABLE_13 = "p20stt13.csv"  # RAW# / STATE+FED / AGE: JUV-ADULT / SEX
TABLE_23 = "p20stt23.csv"  # RAW# / TERRITORY

bjs_prisoners_tables = {
    APPENDIX_TABLE_2: {"header_rows": [*list(range(10)), 12], "footer_rows": 13},
    TABLE_2: {"header_rows": [*list(range(11))], "footer_rows": 10, },
    TABLE_11: {"header_rows": [*list(range(12))], "footer_rows": 8},
    TABLE_13: {"header_rows": [*list(range(11)), 13, 14], "footer_rows": 6},
    TABLE_23: {"header_rows": [*list(range(11)), 12], "footer_rows": 10}
}


BJS_SEX_GROUPS = [constants.Sex.FEMALE, constants.Sex.MALE, std_col.ALL_VALUE]

# need to manually calculate "0-17",
# BJS_AGE_GROUPS = ["18-19", "20-24", "25-29", "30-34",
#                   "35-39", "40-44", "45-49", "50-54", "55-59", "60-64", "65+"]

BJS_AGE_GROUPS_JUV_ADULT = [std_col.ALL_VALUE, '0-17', '18+']


BJS_RACE_GROUPS_TO_STANDARD = {
    'White': Race.WHITE_NH,
    'Black': Race.BLACK_NH,
    'Hispanic': Race.HISP,
    'American Indian/Alaska Native': Race.AIAN_NH,
    'Asian': Race.ASIAN_NH,
    'Native Hawaiian/Other Pacific Islander': Race.NHPI_NH,
    'Two or more races': Race.MULTI_NH,
    'Other': Race.OTHER_STANDARD_NH,
    'Unknown': Race.UNKNOWN,
    # BJS's 'Did not report' gets summed into "Unknown" for pct_share
    'All': Race.ALL
}

STANDARD_RACE_CODES = [
    race_tuple.value for race_tuple in BJS_RACE_GROUPS_TO_STANDARD.values()]


def keep_only_states(df):
    return df[~df[std_col.STATE_NAME_COL].isin(NON_STATE_ROWS)]


def cols_to_rows(df, demographic_groups, demographic_col, value_col):
    # make "wide" table into a "long" table
    # move columns for demographic groups (e.g. `All`, `White (Non-Hispanic)`
    # to be additional rows per geo
    return df.melt(id_vars=[std_col.STATE_NAME_COL],
                   value_vars=demographic_groups,
                   var_name=demographic_col,
                   value_name=value_col)


def calc_per_100k(row):
    """
    Takes a row from a dataframe that includes a RAW_COL and a POPULATION_COL
    and returns the calculated PER_100K number
     """
    if row[std_col.POPULATION_COL] == 0:
        return None

    return round((row[RAW_COL] / row[std_col.POPULATION_COL]) * 100_000, 1)


def df_to_ints(df: pd.DataFrame):
    """
    Parameters:

    Returns:
    """

    df = df.applymap(lambda datum: 0 if
                     pd.isnull(datum) or
                     datum == "/" or
                     datum == "~"
                     else int(datum))

    return df


"""
The following make_prison_ functions accept "cleaned" dataframes
representing specific tables from the BJS Prisoners (2020) report
and return standardized dfs with rows for each combo of place + demographic group,
and columns for | RAW# | "race" or "age" or "sex" | "state_name"

Parameters:
    1 or more cleaned source df generated in the clean_df utils

Returns:
    df: standardized with raw numbers by demographic by place

 """


def make_prison_national_age_df(source_df_adults, source_df_juveniles):

    # standardize df with ADULT RAW # / AGE / USA
    df_adults = dataset_utils.merge_fips_codes(source_df_adults)
    df_adults = dataset_utils.merge_pop_numbers(
        df_adults, std_col.AGE_COL, "national")
    df_adults[RAW_COL] = df_adults.apply(
        estimate_total, axis="columns", args=(PER_100K_COL, ))
    df_adults = df_adults[[RAW_COL, std_col.STATE_NAME_COL, std_col.AGE_COL]]

    # standardize df with JUVENILE RAW # / AGE / USA
    df_juv = source_df_juveniles[
        source_df_juveniles[std_col.STATE_NAME_COL] == constants.US_NAME]

    # combine to create standardized df of RAW # / AGE / USA
    df = df_adults.append(df_juv)

    return df


def make_prison_national_race_df(source_df):

    # split apart into STATE PRISON and FEDERAL_PRISON
    df_bjs_states = source_df[source_df[std_col.STATE_NAME_COL] != 'Federal']
    df_bjs_fed = source_df[source_df[std_col.STATE_NAME_COL]
                           == 'Federal']

    # national# = federal# + sum of states#
    df = (df_to_ints(df_bjs_fed[STANDARD_RACE_CODES]) +
          df_to_ints(df_bjs_states[STANDARD_RACE_CODES]).sum())
    df.loc[0, std_col.STATE_NAME_COL] = constants.US_NAME

    df = cols_to_rows(
        df, STANDARD_RACE_CODES, std_col.RACE_CATEGORY_ID_COL, RAW_COL)

    return df


def make_prison_national_sex_df(source_df):

    df = source_df[source_df[std_col.STATE_NAME_COL] == 'U.S. total']
    df[std_col.STATE_NAME_COL] = constants.US_NAME
    df = cols_to_rows(
        df, BJS_SEX_GROUPS, std_col.SEX_COL, RAW_COL)

    return df


def make_prison_state_race_df(source_df, source_df_territories):

    df = source_df[source_df[std_col.STATE_NAME_COL]
                   != 'Federal']

    df = df.append(source_df_territories)

    df = cols_to_rows(
        df, STANDARD_RACE_CODES, std_col.RACE_CATEGORY_ID_COL, RAW_COL)

    return df


def make_prison_state_sex_df(source_df, source_df_territories):

    # df = source_df[source_df[std_col.STATE_NAME_COL] != 'U.S. total']
    df = keep_only_states(source_df)

    df = df.append(source_df_territories)
    df[std_col.ALL_VALUE] = df[std_col.ALL_VALUE].combine_first(
        df[Race.ALL.value])
    df = df.drop(columns=[Race.ALL.value])

    df = cols_to_rows(
        df, BJS_SEX_GROUPS, std_col.SEX_COL, RAW_COL)

    # df = dataset_utils.merge_fips_codes(df)

    # df = dataset_utils.merge_pop_numbers(
    #     df, std_col.SEX_COL, "state")

    return df


def make_prison_state_age_df(source_df_juveniles, source_df_totals, source_df_territories):

    source_df_juveniles = source_df_juveniles[source_df_juveniles[std_col.STATE_NAME_COL]
                                              != constants.US_NAME]

    source_df_juveniles = source_df_juveniles.rename(columns={RAW_COL: '0-17'})

    source_df_juveniles = source_df_juveniles.drop(columns=[std_col.AGE_COL])

    source_df_totals = keep_only_states(source_df_totals)
    source_df_totals = source_df_totals[[
        std_col.STATE_NAME_COL, std_col.ALL_VALUE]]

    df = pd.merge(source_df_juveniles, source_df_totals,
                  on=std_col.STATE_NAME_COL)

    df = df.append(source_df_territories)

    df[std_col.ALL_VALUE] = df[std_col.ALL_VALUE].combine_first(
        df[Race.ALL.value])
    df = df.drop(columns=[Race.ALL.value])

    df["18+"] = df[std_col.ALL_VALUE] - df['0-17']

    df = cols_to_rows(df, BJS_AGE_GROUPS_JUV_ADULT, std_col.AGE_COL, RAW_COL)

    # df = dataset_utils.merge_fips_codes(df)
    # df = dataset_utils.merge_pop_numbers(
    #     df, std_col.AGE_COL, "state")

    return df


def post_process(df, breakdown, geo):
    """
        Takes a standardized breakdown df with raw incidence values and fills in missing columns
        - generates `PER_100K` column (some incoming df may already have this col and partial data)
        - generates `PCT_SHARE` column
        - removes temporary columns needed only for calculating our metrics

       df: Dataframe with all the raw data containing:
       "state_name" column, raw values, and demographic col of groups
       breakdown: demographic breakdown (race, sex, age)
       geo: geographic level (national, state)
    """

    if breakdown == std_col.RACE_OR_HISPANIC_COL:
        std_col.add_race_columns_from_category_id(df)
        pop_breakdown = std_col.RACE_COL
    else:
        pop_breakdown = breakdown

    df = dataset_utils.merge_fips_codes(df)

    df = dataset_utils.merge_pop_numbers(
        df, pop_breakdown, geo)

    df[std_col.POPULATION_PCT_COL] = df[std_col.POPULATION_PCT_COL].astype(
        float)

    df[PER_100K_COL] = df.apply(calc_per_100k, axis="columns")

    df = dataset_utils.generate_pct_share_col(
        df, RAW_COL, PCT_SHARE_COL, breakdown, std_col.ALL_VALUE)

    df = df.drop(columns=[std_col.POPULATION_COL, RAW_COL])

    return df


def estimate_total(row, condition_name_per_100k):
    """Returns an estimate of the total number of people with a given condition.

       condition_name_per_100k: string column name of the condition per_100k to estimate the total of"""

    if (pd.isna(row[condition_name_per_100k]) or
        pd.isna(row[std_col.POPULATION_COL]) or
            int(row[std_col.POPULATION_COL]) == 0):
        return None

    return round((float(row[condition_name_per_100k]) / 100_000) * float(row[std_col.POPULATION_COL]))


class BJSData(DataSource):

    @ staticmethod
    def get_id():
        return 'BJS_DATA'

    @ staticmethod
    def get_table_name():
        return 'bjs_data'

    def upload_to_gcs(self, _, **attrs):
        raise NotImplementedError(
            'upload_to_gcs should not be called for BJSData')

    def write_to_bq(self, dataset, gcs_bucket, **attrs):

        loaded_tables = {}

        files = fetch_zip_as_files(BJS_PRISONERS_ZIP)
        for file in files.namelist():
            if file in bjs_prisoners_tables:
                source_df = pd.read_csv(files.open(
                    file),
                    encoding="ISO-8859-1",
                    skiprows=bjs_prisoners_tables[file]["header_rows"],
                    skipfooter=bjs_prisoners_tables[file]["footer_rows"],
                    thousands=',',
                    engine="python")
                loaded_tables[file] = source_df

        df_11 = clean_prison_table_11_df(loaded_tables[TABLE_11])
        df_13 = clean_prison_table_13_df(loaded_tables[TABLE_13])
        df_2 = clean_prison_table_2_df(loaded_tables[TABLE_2])
        df_app_2 = clean_prison_appendix_table_2_df(
            loaded_tables[APPENDIX_TABLE_2])
        df_23 = clean_prison_table_23_df(loaded_tables[TABLE_23])

        for geo_level in ["national", "state"]:

            for breakdown in [std_col.AGE_COL, std_col.RACE_OR_HISPANIC_COL, std_col.SEX_COL]:

                table_name = f'{breakdown}_{geo_level}'

                if geo_level == 'national':

                    if breakdown == std_col.AGE_COL:
                        df = make_prison_national_age_df(
                            df_11, df_13)

                    if breakdown == std_col.RACE_OR_HISPANIC_COL:
                        df = make_prison_national_race_df(
                            df_app_2)

                    if breakdown == std_col.SEX_COL:
                        df = make_prison_national_sex_df(
                            df_2)

                if geo_level == 'state':
                    if breakdown == std_col.AGE_COL:
                        df = make_prison_state_age_df(
                            df_13, df_2, df_23)

                    if breakdown == std_col.RACE_OR_HISPANIC_COL:
                        df = make_prison_state_race_df(
                            df_app_2, df_23)

                    if breakdown == std_col.SEX_COL:
                        df = make_prison_state_sex_df(
                            df_2, df_23)

                df = post_process(df, breakdown, geo_level)

                # set / add BQ types
                column_types = {c: 'STRING' for c in df.columns}
                for col in BJS_DATA_TYPES:
                    column_types[std_col.generate_column_name(
                        col, std_col.PER_100K_SUFFIX)] = 'FLOAT'
                    column_types[std_col.generate_column_name(
                        col, std_col.PCT_SHARE_SUFFIX)] = 'FLOAT'
                column_types[std_col.POPULATION_PCT_COL] = 'FLOAT'
                if std_col.RACE_INCLUDES_HISPANIC_COL in df.columns:
                    column_types[std_col.RACE_INCLUDES_HISPANIC_COL] = 'BOOL'

                gcs_to_bq_util.add_df_to_bq(
                    df, dataset, table_name, column_types=column_types)
