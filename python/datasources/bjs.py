from datasources.data_source import DataSource
import ingestion.standardized_columns as std_col
import re
import pandas as pd
from ingestion.standardized_columns import Race
from ingestion import gcs_to_bq_util, dataset_utils, constants


BJS_DATA_TYPES = [
    std_col.PRISON_PREFIX,
    # std_col.JAIL_PREFIX,
    # std_col.INCARCERATED_PREFIX
]

header_rows = {
    "prisoner2020_appendix_table_2": [*list(range(10)), 12],
    "prisoners2020_table_23": [*list(range(11)), 12],
    "prisoners2020_table_2": [*list(range(12))],
    "prisoners2020_table_11": [*list(range(12))],


}

footer_rows = {
    "prisoner2020_appendix_table_2": 13,
    "prisoners2020_table_23": 10,
    "prisoners2020_table_2": 10,
    "prisoners2020_table_11": 8
}


BJS_RAW_PRISON_BY_RACE = "p20stat02.csv"
BJS_RAW_PRISON_BY_SEX = "p20stt02.csv"
BJS_PER_100K_PRISON_BY_AGE = "p20stt11.csv"
BJS_RAW_PRISON_TERRITORY_TOTALS = "p20stt23.csv"


BJS_SEX_GROUPS = [constants.Sex.FEMALE, constants.Sex.MALE, std_col.ALL_VALUE]

# BJS_AGE_GROUPS = []

BJS_RACE_GROUPS_TO_STANDARD = {
    'White': Race.WHITE_NH,
    'Black': Race.BLACK_NH,
    'Hispanic': Race.HISP,
    'American Indian/Alaska Native': Race.AIAN_NH,
    'Asian': Race.ASIAN_NH,
    'Native Hawaiian/Other Pacific Islander': Race.NHPI_NH,
    'Two or more races': Race.MULTI_NH,
    'Other': Race.OTHER_STANDARD_NH,
    'Unknown': Race.UNKNOWN_NH,
    # for now summing 'Unknown' and 'Did not report' into "Unknown"
    # but need to confirm
    # 'Did not report': Race.UNKNOWN,
    'All': Race.ALL
}

STANDARD_RACE_CODES = [
    race_tuple.value for race_tuple in BJS_RACE_GROUPS_TO_STANDARD.values()]


def cols_to_rows(df, demographic_groups, demographic_col, value_col):
    # make "wide" table into a "long" table
    # move columns for demographic groups (e.g. `All`, `White (Non-Hispanic)`
    # to be additional rows per geo
    return df.melt(id_vars=[std_col.STATE_NAME_COL],
                   value_vars=demographic_groups,
                   var_name=demographic_col,
                   value_name=value_col)


def calc_per_100k(num, denom):
    return round((num / denom) * 100000, 1)


def strip_footnote_refs(cell_value):
    """
    BJS embeds the footnote indicators into the cell values
    This fn uses regex if input is a string to remove those
    footnote indicators, and returns the cleaned string or original
    non-string cell_value
     """
    return re.sub(r'/[a-z].*', "", cell_value) if isinstance(cell_value, str) else cell_value


def drop_unnamed(df):
    """
    Because of the styling on the BJS .csv, some columns end up without names.
    This fn removes those columns and returns the updated df
     """
    df = df.drop(df.filter(regex="Unnamed"), axis=1)
    return df


def missing_data_to_none(df):
    """
    Replace all missing df values with None.
    BJS uses two kinds of missing data:
    `~` N/A. Jurisdiction does not track this race or ethnicity.
    `/` Not reported.

    Parameters:
            df (Pandas Dataframe): a dataframe with some missing values set to `~` or `/`

    Returns:
            df (Pandas Dataframe): a dataframe with all missing values set to `None`
    """

    df = df.applymap(lambda datum: None if datum ==
                     "/" or datum == "~" else datum)

    return df


def col_to_ints(column: pd.Series):
    """
    Parameters:

    Returns:
    """

    column = column.apply(lambda datum: 0 if
                          datum is None or
                          datum == "/" or
                          datum == "~"
                          else int(datum))

    return column


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


def df_to_ints_or_none(df: pd.DataFrame):
    """
    Parameters:

    Returns:
    """

    df = df.applymap(lambda datum: None if
                     datum is None
                     else int(datum))

    return df


def swap_col_name(col_name: str):

    if col_name in BJS_RACE_GROUPS_TO_STANDARD.keys():
        race_tuple = BJS_RACE_GROUPS_TO_STANDARD[col_name]
        return race_tuple.value
    else:
        return col_name


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
        df, STANDARD_RACE_CODES, std_col.RACE_CATEGORY_ID_COL, "prison_raw")

    return df


def make_prison_national_sex_df(source_df):

    df = source_df[source_df[std_col.STATE_NAME_COL] == 'U.S. total']
    df[std_col.STATE_NAME_COL] = constants.US_NAME
    df = cols_to_rows(
        df, BJS_SEX_GROUPS, std_col.SEX_COL, "prison_raw")
    return df


def make_prison_national_age_df(source_df):
    print("prison state age")
    print(source_df.to_string())

    df = source_df

    print("df returned from prison national sex")
    print(df.to_string())

    return df


def make_prison_state_race_df(source_df, source_df_territories):
    print("prison state race")
    df = source_df[source_df[std_col.STATE_NAME_COL]
                   != 'Federal']
    df = df.append(source_df_territories)
    return df


def make_prison_state_sex_df(source_df):
    demographic_groups = BJS_SEX_GROUPS
    print("prison state sex")
    # return df


def make_prison_state_age_df(source_df):
    print("prison state age")
    # return df


def clean_prison_appendix_table_2_df(df):
    """
    Unique steps needed to clean BJS Prisoners 2020 - Appendix Table 2
    Raw # Prisoners by state + federal by race/ethnicity

    Parameters:
            df (Pandas Dataframe): specific dataframe from BJS
            * Note, excess header and footer info must be cleaned in the read_csv()
            before this step (both mocked + prod flows)
    Returns:
            df (Pandas Dataframe): a "clean" dataframe ready for manipulation
    """

    df = df.rename(
        columns={'Jurisdiction': std_col.STATE_NAME_COL, 'Total': Race.ALL.value})
    df[std_col.STATE_NAME_COL] = df[std_col.STATE_NAME_COL].combine_first(
        df["Unnamed: 1"])
    df = drop_unnamed(df)
    df.columns = [strip_footnote_refs(col_name) for col_name in df.columns]
    df[std_col.STATE_NAME_COL] = df[std_col.STATE_NAME_COL].apply(
        strip_footnote_refs)

    df = missing_data_to_none(df)
    df.columns = [swap_col_name(col_name)
                  for col_name in df.columns]

    unknowns_as_ints = col_to_ints(df[Race.UNKNOWN_NH.value])

    df[Race.UNKNOWN_NH.value] = (unknowns_as_ints +
                                 df["Did not report"])
    df = df.drop(columns=["Did not report"])

    df[STANDARD_RACE_CODES] = df_to_ints_or_none(df[STANDARD_RACE_CODES])

    return df


def clean_prison_table_2_df(df):
    """
    Unique steps needed to clean BJS Prisoners 2020 - Table 2
    Raw # Prisoners by Sex by State

    Parameters:
            df (Pandas Dataframe): specific dataframe from BJS
            * Note, excess header and footer info must be cleaned in the read_csv()
            before this step (both mocked + prod flows)
    Returns:
            df (Pandas Dataframe): a "clean" dataframe ready for manipulation
    """

    df.columns = [strip_footnote_refs(col_name) for col_name in df.columns]
    df = df.applymap(strip_footnote_refs)

    df[std_col.STATE_NAME_COL] = df["Jurisdiction"].combine_first(
        df["Jurisdiction2"])

    df = df[[std_col.STATE_NAME_COL, std_col.ALL_VALUE,
             constants.Sex.MALE, constants.Sex.FEMALE]]

    df[BJS_SEX_GROUPS] = df[BJS_SEX_GROUPS].astype(int)

    return df


def clean_prison_table_11_df(df):
    """
    Unique steps needed to clean BJS Prisoners 2020 - Table 11
    Per 100k Prisoners by Age - National

    Parameters:
            df (Pandas Dataframe): specific dataframe from BJS
            * Note, excess header and footer info must be cleaned in the read_csv()
            before this step (both mocked + prod flows)
    Returns:
            df (Pandas Dataframe): a "clean" dataframe ready for manipulation
    """

    df.columns = [strip_footnote_refs(col_name) for col_name in df.columns]
    df = df.applymap(strip_footnote_refs)

    df[std_col.AGE_COL] = df["Age"].combine_first(
        df["Unnamed: 1"])

    # replace all weird characters (specifically EN-DASH –) with normal hyphen
    df[std_col.AGE_COL] = df[std_col.AGE_COL].apply(
        lambda datum: re.sub('[^0-9a-zA-Z ]+', '-', datum))

    df = df.rename(
        columns={'Total': "prison_per_100k"})

    df = df[[std_col.AGE_COL, "prison_per_100k"]]

    df = df.replace("Total", std_col.ALL_VALUE)
    df = df.replace("65 or older", "65+")

    df[std_col.STATE_NAME_COL] = "United States"

    # print("df in clean table 11 - age")
    # print(df.to_string())

    # df[std_col.STATE_NAME_COL] = df[std_col.STATE_NAME_COL].apply(
    #     strip_footnote_refs)

    # df = missing_data_to_none(df)

    # df[Race.ALL.value] = df[Race.ALL.value].combine_first(
    #     df["Total custody population"])

    # df[Race.ALL.value].apply(lambda datum: None if datum ==
    #                          "/" or datum == "~" else datum)

    # df = df[[std_col.STATE_NAME_COL, Race.ALL.value]]

    # df[Race.ALL.value] = df[Race.ALL.value].apply(lambda datum: None if
    #                                               datum is None
    #                                               else int(datum))

    return df


def clean_prison_table_23_df(df):
    """
    Unique steps needed to clean BJS Prisoners 2020 - Table 23
    Raw # Prisoners Totals by Territory

    Parameters:
            df (Pandas Dataframe): specific dataframe from BJS
            * Note, excess header and footer info must be cleaned in the read_csv()
            before this step (both mocked + prod flows)
    Returns:
            df (Pandas Dataframe): a "clean" dataframe ready for manipulation
    """

    df.columns = [strip_footnote_refs(col_name) for col_name in df.columns]
    df = df.rename(
        columns={'U.S. territory/U.S. commonwealth': std_col.STATE_NAME_COL, 'Total': Race.ALL.value})

    df[std_col.STATE_NAME_COL] = df[std_col.STATE_NAME_COL].apply(
        strip_footnote_refs)

    df = missing_data_to_none(df)

    df[Race.ALL.value] = df[Race.ALL.value].combine_first(
        df["Total custody population"])

    df[Race.ALL.value].apply(lambda datum: None if datum ==
                             "/" or datum == "~" else datum)

    df = df[[std_col.STATE_NAME_COL, Race.ALL.value]]

    df[Race.ALL.value] = df[Race.ALL.value].apply(lambda datum: None if
                                                  datum is None
                                                  else int(datum))

    return df


def post_process(df, breakdown, geo):
    """Merge the population data and then do all needed calculations with it.
       Returns a dataframe ready for the frontend.

       df: Dataframe with all the raw data.
       breakdown: demographic breakdown (race, sex, age)
       geo: geographic level (national, state)
    """

    df = dataset_utils.merge_fips_codes(df)

    name = 'race' if breakdown == std_col.RACE_OR_HISPANIC_COL else breakdown

    df = dataset_utils.merge_pop_numbers(
        df, name, geo)
    df[std_col.POPULATION_PCT_COL] = df[std_col.POPULATION_PCT_COL].astype(
        float)

    for data_type in BJS_DATA_TYPES:
        raw_count_col = f'{data_type}_raw'

        # calculate PER_100K
        if raw_count_col in df.columns:

            incidence_rate_col = std_col.generate_column_name(
                data_type, std_col.PER_100K_SUFFIX)
            df[incidence_rate_col] = df.apply(lambda row: calc_per_100k(
                row['prison_raw'], row[std_col.POPULATION_COL]), axis=1)

        # calculate PCT_SHARES
        pct_share_col = std_col.generate_column_name(
            data_type, std_col.PCT_SHARE_SUFFIX)
        total_val = Race.ALL.value if breakdown == std_col.RACE_CATEGORY_ID_COL else std_col.ALL_VALUE
        df = dataset_utils.generate_pct_share_col(
            df, raw_count_col, pct_share_col, breakdown, total_val)

    df = df.drop(columns=[std_col.POPULATION_COL, "prison_raw"])
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

        print("\n")

        # BJS by race by state+federal table
        prison_appendix_table_2_df = gcs_to_bq_util.load_csv_as_df_from_web(
            BJS_RAW_PRISON_BY_RACE)

        # BJS by sex by state+federal table
        prison_table_2_df = gcs_to_bq_util.load_csv_as_df_from_web(
            BJS_RAW_PRISON_BY_SEX)

        # BJS by age by state+federal table
        prison_table_11_df = gcs_to_bq_util.load_csv_as_df_from_web(
            BJS_PER_100K_PRISON_BY_AGE)

        # BJS totals by territory table
        prison_table_23_df = gcs_to_bq_util.load_csv_as_df_from_web(
            BJS_RAW_PRISON_TERRITORY_TOTALS)

        # TODO need to clean() the df coming from the fetch (in test it's mocked and cleaned)

        for geo_level in ["national", "state"]:

            for breakdown in [std_col.RACE_OR_HISPANIC_COL, std_col.SEX_COL, std_col.AGE_COL]:

                table_name = f'{breakdown}_{geo_level}'
                print("##-step of breakdown loop -##")
                print(table_name)

                if geo_level == 'national':
                    if breakdown == std_col.RACE_OR_HISPANIC_COL:
                        df = make_prison_national_race_df(
                            prison_appendix_table_2_df)

                    if breakdown == std_col.SEX_COL:
                        df = make_prison_national_sex_df(prison_table_2_df)

                    if breakdown == std_col.AGE_COL:
                        df = make_prison_national_age_df(prison_table_11_df)

                if geo_level == 'state':
                    if breakdown == std_col.RACE_OR_HISPANIC_COL:
                        df = make_prison_state_race_df(
                            prison_appendix_table_2_df)

                    if breakdown == std_col.SEX_COL:
                        df = make_prison_state_sex_df(prison_table_2_df)

                    if breakdown == std_col.AGE_COL:
                        df = make_prison_state_age_df(prison_table_11_df)

                if breakdown == std_col.RACE_OR_HISPANIC_COL:
                    std_col.add_race_columns_from_category_id(df)
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

                # print("/-/-/-/-/")
                # print(table_name)
                # print(df.to_string())
                gcs_to_bq_util.add_df_to_bq(
                    df, dataset, table_name, column_types=column_types)
