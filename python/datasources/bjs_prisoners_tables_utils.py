import ingestion.standardized_columns as std_col
import re
import pandas as pd
from ingestion.standardized_columns import Race
from ingestion import constants

RAW_COL = std_col.generate_column_name(
    std_col.PRISON_PREFIX, std_col.RAW_SUFFIX)


header_rows = {
    "prisoner2020_appendix_table_2": [*list(range(10)), 12],
    "prisoners2020_table_23": [*list(range(11)), 12],
    "prisoners2020_table_2": [*list(range(12))],
    "prisoners2020_table_11": [*list(range(12))],
    "prisoners2020_table_13": [*list(range(11)), 13, 14],
}

footer_rows = {
    "prisoner2020_appendix_table_2": 13,
    "prisoners2020_table_23": 10,
    "prisoners2020_table_2": 10,
    "prisoners2020_table_11": 8,
    "prisoners2020_table_13": 6,
}


BJS_SEX_GROUPS = [constants.Sex.FEMALE, constants.Sex.MALE, std_col.ALL_VALUE]


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
    # for now summing 'Unknown' and 'Did not report' into "Unknown"
    # but need to confirm
    # 'Did not report': Race.UNKNOWN,
    'All': Race.ALL
}

STANDARD_RACE_CODES = [
    race_tuple.value for race_tuple in BJS_RACE_GROUPS_TO_STANDARD.values()]


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
    df = df.drop(df.filter(regex="Unnamed"), axis="columns")
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

    unknowns_as_ints = col_to_ints(df[Race.UNKNOWN.value])

    df[Race.UNKNOWN.value] = (unknowns_as_ints +
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

    return df


def clean_prison_table_13_df(df):
    """
    Unique steps needed to clean BJS Prisoners 2020 - Table 13
    Raw Prisoners by Age (Adult / Juvenile) by Sex by Federal + State

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
        df["Unnamed: 1"])
    df = df.rename(
        columns={'Total': RAW_COL})
    df = df[[std_col.STATE_NAME_COL, RAW_COL]]

    df = df.replace("U.S. total", constants.US_NAME)

    df[std_col.AGE_COL] = "0-17"
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
