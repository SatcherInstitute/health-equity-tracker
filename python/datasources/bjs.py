from datasources.data_source import DataSource
import ingestion.standardized_columns as std_col
import pandas as pd
from ingestion.standardized_columns import Race
from ingestion import gcs_to_bq_util, dataset_utils, constants

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


BJS_RAW_PRISON_BY_RACE = "p20stat02.csv"
BJS_RAW_PRISON_BY_SEX = "p20stt02.csv"
BJS_PER_100K_PRISON_BY_AGE = "p20stt11.csv"
BJS_RAW_PRISON_JUV_ADULT = "p20stt13.csv"
BJS_RAW_PRISON_TERRITORY_TOTALS = "p20stt23.csv"


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

    # print(row[RAW_COL], "/", row[std_col.POPULATION_COL],
    #       "=", row[RAW_COL] / row[std_col.POPULATION_COL])

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


def make_prison_national_race_df(source_df):
    """
    Parameter:
        source_df: takes a "cleaned" df representing a BJS Prisoners 2020 table

    Returns:
        df: a df containing the final columns needed for the frontend
        | race_category_id | state_name | state_fips | prison_per_100k |
        | prison_pct_share | population_pct_share |
     """

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

    df = dataset_utils.merge_fips_codes(df)
    df = dataset_utils.merge_pop_numbers(
        df, std_col.RACE_COL, "national")
    df[std_col.POPULATION_PCT_COL] = df[std_col.POPULATION_PCT_COL].astype(
        float)

    df[PER_100K_COL] = df.apply(calc_per_100k, axis="columns")

    return df


def make_prison_national_sex_df(source_df):

    df = source_df[source_df[std_col.STATE_NAME_COL] == 'U.S. total']
    df[std_col.STATE_NAME_COL] = constants.US_NAME
    df = cols_to_rows(
        df, BJS_SEX_GROUPS, std_col.SEX_COL, RAW_COL)
    df = dataset_utils.merge_fips_codes(df)
    df = dataset_utils.merge_pop_numbers(
        df, std_col.SEX_COL, "national")
    df[std_col.POPULATION_PCT_COL] = df[std_col.POPULATION_PCT_COL].astype(
        float)

    df[PER_100K_COL] = df.apply(calc_per_100k, axis="columns")

    return df


def make_prison_national_age_df(source_df, source_df_juveniles):

    # get ADULT rows to include RAW, PER_100K, POP
    df = source_df.copy()

    df = dataset_utils.merge_fips_codes(df)
    df = dataset_utils.merge_pop_numbers(
        df, std_col.AGE_COL, "national")
    df[std_col.POPULATION_PCT_COL] = df[std_col.POPULATION_PCT_COL].astype(
        float)

    # BJS table only has `per_100k` values, so calculate the raw #
    df[RAW_COL] = df.apply(
        estimate_total, axis="columns", args=(PER_100K_COL, ))

    # get JUVENILE row to include RAW, PER_100K, POP
    row_juveniles_us = source_df_juveniles[
        source_df_juveniles[std_col.STATE_NAME_COL] == constants.US_NAME]

    row_juveniles_us = dataset_utils.merge_fips_codes(row_juveniles_us)
    row_juveniles_us = dataset_utils.merge_pop_numbers(
        row_juveniles_us, std_col.AGE_COL, "national")
    row_juveniles_us[std_col.POPULATION_PCT_COL] = row_juveniles_us[std_col.POPULATION_PCT_COL].astype(
        float)

    row_juveniles_us[PER_100K_COL] = row_juveniles_us.apply(
        calc_per_100k, axis="columns")

    # add combine 0-17 from table 13 with 18-65+ from table 11
    df = df.append(row_juveniles_us)

    return df


def make_prison_state_race_df(source_df, source_df_territories):

    df = source_df[source_df[std_col.STATE_NAME_COL]
                   != 'Federal']

    df = df.append(source_df_territories)

    df = cols_to_rows(
        df, STANDARD_RACE_CODES, std_col.RACE_CATEGORY_ID_COL, RAW_COL)

    df = dataset_utils.merge_fips_codes(df)
    df = dataset_utils.merge_pop_numbers(
        df, std_col.RACE_COL, "state")

    df[std_col.POPULATION_PCT_COL] = df[std_col.POPULATION_PCT_COL].astype(
        float)
    df[PER_100K_COL] = df.apply(calc_per_100k, axis="columns")

    return df


def make_prison_state_sex_df(source_df, source_df_territories):

    df = source_df[source_df[std_col.STATE_NAME_COL] != 'U.S. total']
    df = keep_only_states(df)

    df = df.append(source_df_territories)
    df[std_col.ALL_VALUE] = df[std_col.ALL_VALUE].combine_first(
        df[Race.ALL.value])
    df = df.drop(columns=[Race.ALL.value])

    df = cols_to_rows(
        df, BJS_SEX_GROUPS, std_col.SEX_COL, RAW_COL)

    df = dataset_utils.merge_fips_codes(df)

    df = dataset_utils.merge_pop_numbers(
        df, std_col.SEX_COL, "state")

    df[std_col.POPULATION_PCT_COL] = df[std_col.POPULATION_PCT_COL].astype(
        float)

    df[PER_100K_COL] = df.apply(calc_per_100k, axis="columns")

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

    df = dataset_utils.merge_fips_codes(df)
    df = dataset_utils.merge_pop_numbers(
        df, std_col.AGE_COL, "state")
    df[std_col.POPULATION_PCT_COL] = df[std_col.POPULATION_PCT_COL].astype(
        float)

    df[PER_100K_COL] = df.apply(calc_per_100k, axis="columns")

    return df


def post_process(df, breakdown, geo):
    """Merge the population data and then do all needed calculations with it.
       Returns a dataframe ready for the frontend.

       df: Dataframe with all the raw data.
       breakdown: demographic breakdown (race, sex, age)
       geo: geographic level (national, state)
    """

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

        # BJS by race by state+federal table
        prison_appendix_table_2_df = gcs_to_bq_util.load_csv_as_df_from_web(
            BJS_RAW_PRISON_BY_RACE)

        # BJS by sex by state+federal table
        prison_table_2_df = gcs_to_bq_util.load_csv_as_df_from_web(
            BJS_RAW_PRISON_BY_SEX)

        # BJS by age by state+federal table
        prison_table_11_df = gcs_to_bq_util.load_csv_as_df_from_web(
            BJS_PER_100K_PRISON_BY_AGE)

        prison_table_13_df = gcs_to_bq_util.load_csv_as_df_from_web(
            BJS_RAW_PRISON_JUV_ADULT)

        # BJS totals by territory table
        prison_table_23_df = gcs_to_bq_util.load_csv_as_df_from_web(
            BJS_RAW_PRISON_TERRITORY_TOTALS)

        # TODO need to clean() the df coming from the fetch (in test it's mocked and cleaned)

        for geo_level in ["national", "state"]:

            for breakdown in [std_col.AGE_COL, std_col.RACE_OR_HISPANIC_COL, std_col.SEX_COL]:

                table_name = f'{breakdown}_{geo_level}'

                if geo_level == 'national':

                    if breakdown == std_col.AGE_COL:
                        df = make_prison_national_age_df(
                            prison_table_11_df, prison_table_13_df)

                    if breakdown == std_col.RACE_OR_HISPANIC_COL:
                        df = make_prison_national_race_df(
                            prison_appendix_table_2_df)

                    if breakdown == std_col.SEX_COL:
                        df = make_prison_national_sex_df(prison_table_2_df)

                if geo_level == 'state':
                    if breakdown == std_col.AGE_COL:
                        df = make_prison_state_age_df(
                            prison_table_13_df, prison_table_2_df, prison_table_23_df)

                    if breakdown == std_col.RACE_OR_HISPANIC_COL:
                        df = make_prison_state_race_df(
                            prison_appendix_table_2_df, prison_table_23_df)

                    if breakdown == std_col.SEX_COL:
                        df = make_prison_state_sex_df(
                            prison_table_2_df, prison_table_23_df)

                if breakdown == std_col.RACE_OR_HISPANIC_COL:
                    std_col.add_race_columns_from_category_id(df)

                df = post_process(df, breakdown, geo_level)

                df[std_col.STATE_FIPS_COL] = df[std_col.STATE_FIPS_COL].astype(
                    str)

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
