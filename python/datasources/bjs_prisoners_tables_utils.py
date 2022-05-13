import ingestion.standardized_columns as std_col
import pandas as pd
from ingestion.standardized_columns import Race
from ingestion import constants
import re

# consts used in BJS Tables
US_TOTAL = "U.S. total"
STATE = "State"
FED = "Federal"
NON_STATE_ROWS = [US_TOTAL, STATE, FED]

RAW_COL = std_col.generate_column_name(
    std_col.PRISON_PREFIX, std_col.RAW_SUFFIX)
PER_100K_COL = std_col.generate_column_name(
    std_col.PRISON_PREFIX, std_col.PER_100K_SUFFIX)
PCT_SHARE_COL = std_col.generate_column_name(
    std_col.PRISON_PREFIX, std_col.PCT_SHARE_SUFFIX)

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

BJS_AGE_GROUPS_JUV_ADULT = [std_col.ALL_VALUE, '0-17', '18+']

BJS_SEX_GROUPS = [constants.Sex.FEMALE, constants.Sex.MALE, std_col.ALL_VALUE]


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


def swap_race_col_names_to_codes(col_name: str):
    """
    Swap a BJS race column name for the HET standard race code.
    BJS uses exclusive races, so equivalent codes will be _NH

    Parameter:
        col_name: string representing a BJS table race (eg `American Indian/Alaska Native`)
    Returns:
        string race code (eg `AIAN_NH`)
    """
    if col_name in BJS_RACE_GROUPS_TO_STANDARD.keys():
        race_tuple = BJS_RACE_GROUPS_TO_STANDARD[col_name]
        return race_tuple.value
    else:
        return col_name


# For every "clean" fn, the goal is to:
# - start by making the correct columns, which generally are state_name + demo_breakdown_groups
# - get all cell values in demo_group columns as numbers (not strings) or None is data is missing
# - remove any extra columns


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

    df.columns = [swap_race_col_names_to_codes(col_name)
                  for col_name in df.columns]

    df = missing_data_to_none(df)

    df[[*STANDARD_RACE_CODES, "Did not report"]] = df[[*STANDARD_RACE_CODES, "Did not report"]].astype(
        float).round(decimals=0)

    df[Race.UNKNOWN.value] = (
        df[Race.UNKNOWN.value] + df["Did not report"])

    df = df[[std_col.STATE_NAME_COL, *STANDARD_RACE_CODES]]

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

    df[std_col.STATE_NAME_COL] = df["Jurisdiction"].combine_first(
        df["Unnamed: 1"])

    df = df.drop(columns=[constants.Sex.MALE, constants.Sex.FEMALE])

    df = df.rename(
        columns={'Total.1': std_col.ALL_VALUE, "Male.1": constants.Sex.MALE, "Female.1": constants.Sex.FEMALE})

    df = df[[std_col.STATE_NAME_COL, std_col.ALL_VALUE,
             constants.Sex.MALE, constants.Sex.FEMALE]]

    df[BJS_SEX_GROUPS] = df[BJS_SEX_GROUPS].astype(float).round(decimals=0)

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

    df[std_col.AGE_COL] = df["Age"].combine_first(
        df["Unnamed: 1"])

    # replace all weird characters (specifically EN-DASH –) with normal hyphen
    df[std_col.AGE_COL] = df[std_col.AGE_COL].apply(
        lambda datum: re.sub('[^0-9a-zA-Z ]+', '-', datum))

    df = df.rename(
        columns={'Total': PER_100K_COL})

    df = df[[std_col.AGE_COL, PER_100K_COL]]

    df = df.replace("Total", std_col.ALL_VALUE)
    df = df.replace("65 or older", "65+")

    df[std_col.STATE_NAME_COL] = constants.US_NAME

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

    df = df.rename(
        columns={'U.S. territory/U.S. commonwealth': std_col.STATE_NAME_COL, 'Total': Race.ALL.value})

    df[Race.ALL.value] = df[Race.ALL.value].combine_first(
        df["Total custody population"])

    df = df[[std_col.STATE_NAME_COL, Race.ALL.value]]

    df = missing_data_to_none(df)

    df[Race.ALL.value] = df[Race.ALL.value].astype(float).round(decimals=0)

    return df
