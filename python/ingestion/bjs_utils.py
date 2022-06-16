import ingestion.standardized_columns as std_col
from ingestion.standardized_columns import Race
from ingestion.gcs_to_bq_util import fetch_zip_as_files
from ingestion import constants
import re
import numpy as np
import pandas as pd

# consts used in BJS Tables
US_TOTAL = "U.S. total"
STATE = "State"
FED = "Federal"
# note the extra trailing space on most regional strings
NON_STATE_ROWS = [US_TOTAL, STATE, FED, constants.US_ABBR,
                  constants.US_NAME, "Northeast", "Midwest ", "South ", "West ", ]

RAW_PRISON_COL = std_col.generate_column_name(
    std_col.PRISON_PREFIX, std_col.RAW_SUFFIX)
PRISON_PER_100K_COL = std_col.generate_column_name(
    std_col.PRISON_PREFIX, std_col.PER_100K_SUFFIX)
PRISON_PCT_SHARE_COL = std_col.generate_column_name(
    std_col.PRISON_PREFIX, std_col.PCT_SHARE_SUFFIX)

RAW_JAIL_COL = std_col.generate_column_name(
    std_col.JAIL_PREFIX, std_col.RAW_SUFFIX)
JAIL_PER_100K_COL = std_col.generate_column_name(
    std_col.JAIL_PREFIX, std_col.PER_100K_SUFFIX)
JAIL_PCT_SHARE_COL = std_col.generate_column_name(
    std_col.JAIL_PREFIX, std_col.PCT_SHARE_SUFFIX)


TOTAL_CHILDREN_COL = "total_confined_children"


# maps BJS labels to our race CODES
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
    # 'Unknown' + 'Did not report' -> "Unknown"
    'Total': Race.ALL
}

STANDARD_RACE_CODES = [
    race_tuple.value for race_tuple in BJS_RACE_GROUPS_TO_STANDARD.values()]

BJS_JAIL_AGE_GROUPS = [std_col.ALL_VALUE, "0-17", "18+"]
BJS_PRISON_AGE_GROUPS = [std_col.ALL_VALUE, "18-19", "20-24", "25-29", "30-34",
                         "35-39", "40-44", "45-49", "50-54", "55-59", "60-64", "65+"]

BJS_SEX_GROUPS = [constants.Sex.FEMALE, constants.Sex.MALE, std_col.ALL_VALUE]


BJS_DATA_TYPES = [
    std_col.PRISON_PREFIX,
    std_col.JAIL_PREFIX,
]

# BJS Prisoners Report
BJS_PRISONERS_ZIP = "https://bjs.ojp.gov/content/pub/sheets/p20st.zip"
PRISON_2 = "p20stt02.csv"  # RAW# JURISDICTION / TOTAL+STATE+FED / SEX
PRISON_10 = "p20stt10.csv"  # %, RAW # SENTENCED JURISDICTION / TOTAL+STATE+FED / SEX
PRISON_13 = "p20stt13.csv"  # RAW# JUVENILE CUSTODY / TOTAL+STATE+FED / AGE / SEX
PRISON_23 = "p20stt23.csv"  # RAW# JURISDICTION / TERRITORY
APPENDIX_PRISON_2 = "p20stat02.csv"  # RAW# JURISDICTION / STATE+FED / RACE

# BJS tables include excess header and footer rows that need to be trimmed
bjs_prisoners_tables = {
    APPENDIX_PRISON_2: {"header_rows": [*list(range(10)), 12], "footer_rows": 13},
    PRISON_2: {"header_rows": [*list(range(11))], "footer_rows": 10, },
    PRISON_10: {"header_rows": [*list(range(11))], "footer_rows": 8, },
    PRISON_13: {"header_rows": [*list(range(11)), 13, 14], "footer_rows": 6},
    PRISON_23: {"header_rows": [*list(range(11)), 12], "footer_rows": 10}
}

# BJS Census of Jails Report
BJS_CENSUS_OF_JAILS_ZIP = "https://bjs.ojp.gov/sites/g/files/xyckuh236/files/media/document/cj0519st.zip"
# Raw Total Age (Juv/Adult) and Raw Total Sex by State
JAIL_6 = "cj0519stt06.csv"
JAIL_7 = "cj0519stt07.csv"  # Raw Total by State with Pct Share Breakdown by Race

# BJS tables include excess header and footer rows that need to be trimmed
BJS_PRISONERS_CROPS = {
    APPENDIX_PRISON_2: {"header_rows": [*list(range(10)), 12], "footer_rows": 13},
    PRISON_2: {"header_rows": [*list(range(11))], "footer_rows": 10, },
    PRISON_10: {"header_rows": [*list(range(11))], "footer_rows": 8, },
    PRISON_13: {"header_rows": [*list(range(11)), 13, 14], "footer_rows": 6},
    PRISON_23: {"header_rows": [*list(range(11)), 12], "footer_rows": 10}
}

BJS_CENSUS_OF_JAILS_CROPS = {
    JAIL_6: {"header_rows": [*list(range(11))], "footer_rows": 7},
    JAIL_7: {"header_rows": [*list(range(10))], "footer_rows": 6}
}


def load_tables(zip_url: str, table_crops):
    """
    Loads all of the tables needed from remote zip file,
    applying specific cropping of header/footer rows

        Parameters:
            zip_url: string with url where the .zip can be found with the specific tables
        Returns:
            a dictionary mapping <filename.csv>: <table as dataframe>. The dataframes have
            been cleaned, but still need to be standardized before using to generate a breakdown
    """
    loaded_tables = {}
    files = fetch_zip_as_files(zip_url)
    for file in files.namelist():
        if file in table_crops:
            source_df = pd.read_csv(
                files.open(file),
                encoding="ISO-8859-1",
                skiprows=table_crops[file]["header_rows"],
                skipfooter=table_crops[file]["footer_rows"],
                thousands=',',
                engine="python",
            )

            source_df = strip_footnote_refs_from_df(source_df)
            source_df = missing_data_to_none(source_df)
            source_df = set_state_col(source_df)

            loaded_tables[file] = source_df

    return loaded_tables


def strip_footnote_refs_from_df(df):
    """
    BJS embeds the footnote indicators into the cell values of the tables.
    This fn uses regex on every cell in the df (including the column names)
    and removes matching footnote indicators if cell is a string.

    Parameters:
        df: df from BJS table, potentially with embedded footnotes
        refs (eg `/b,c`) in some cells.

    Returns:
        the same df with footnote refs removed from every string cell
     """

    def strip_footnote_refs(cell_value):
        return re.sub(r'/[a-z].*', "", cell_value) if isinstance(cell_value, str) else cell_value

    df.columns = [strip_footnote_refs(col_name) for col_name in df.columns]
    df = df.applymap(strip_footnote_refs)

    return df


def missing_data_to_none(df):
    """
    Replace all missing df values with null.
    BJS Prisoners uses two kinds of missing data:
    `~` N/A. Jurisdiction does not track this race or ethnicity.
    `/` Not reported.
    BJS Census of Jails uses two kinds of missing data:
    `^` Less than 0.05%

    Parameters:
            df (Pandas Dataframe): a dataframe with some missing value symbols

    Returns:
            df (Pandas Dataframe): a dataframe with all missing values nulled
    """

    symbols_to_null = ["/", "~", "^"]

    df = df.applymap(lambda datum: np.nan if datum in symbols_to_null
                     else datum)

    return df


def set_state_col(df):
    """
    Takes a df from a BJS table and assigns the places to a "state_name" column

    Parameters:
            df (Pandas Dataframe): a dataframe with various options for place columns

    Returns:
            df (Pandas Dataframe): the same dataframe with a "state_name" column added, using existing place columns
    """

    if 'U.S. territory/U.S. commonwealth' in list(df.columns):
        df[std_col.STATE_NAME_COL] = df['U.S. territory/U.S. commonwealth']
        return df

    elif 'Jurisdiction' in list(df.columns):
        df[std_col.STATE_NAME_COL] = df['Jurisdiction'].combine_first(
            df["Unnamed: 1"])
        return df

    elif 'State' in list(df.columns):
        df[std_col.STATE_NAME_COL] = df['State'].combine_first(
            df["Unnamed: 1"])
        return df

    return df


def filter_cols(df, demo_type):
    """
    Takes a df, removes any columns that aren't either state_name or a relevant demographic group,
    and converts all data in those demographic columns to floats

    Parameters:
            df (Pandas Dataframe): a dataframe with any columns
            demo_type: string "race_or_ethnicity" | "sex" to decide demographic groups

    Returns:
            df (Pandas Dataframe): the same dataframe with extra columns removed and data values as floats
    """
    cols_to_keep = {
        std_col.RACE_COL: STANDARD_RACE_CODES,
        std_col.SEX_COL: BJS_SEX_GROUPS,
    }
    if demo_type not in cols_to_keep.keys():
        raise ValueError(
            f'{demo_type} is not a demographic option, must be one of: {list(cols_to_keep.keys())} ')
    df = df[df.columns.intersection(
        [std_col.STATE_NAME_COL, *cols_to_keep[demo_type]])]
    df[df.columns.intersection(cols_to_keep[demo_type])] = df[df.columns.intersection(cols_to_keep[demo_type])].astype(
        float)

    return df


def swap_race_col_names_to_codes(df):
    """
    Swap BJS race column names for the HET standard race codes.
    BJS uses exclusive races, so equivalent codes will be _NH

    Parameter:
        df: dataframe with column names as strings representing BJS races (eg `American Indian/Alaska Native`)
    Returns:
        df: dataframe with column names swapped when applicable for the race code equivalent (eg `AIAN_NH`)
    """

    def swap_race_col_name_to_code(col_name: str):
        if col_name in BJS_RACE_GROUPS_TO_STANDARD.keys():
            race_tuple = BJS_RACE_GROUPS_TO_STANDARD[col_name]
            return race_tuple.value
        else:
            return col_name

    df.columns = [swap_race_col_name_to_code(col_name)
                  for col_name in df.columns]
    return df


def standardize_table_2_df(df):
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

    df = df.rename(
        columns={'Total.1': std_col.ALL_VALUE,
                 "Male": "Male-2019",
                 "Female": "Female-2019",
                 "Male.1": constants.Sex.MALE,
                 "Female.1": constants.Sex.FEMALE})
    df = filter_cols(df, std_col.SEX_COL)

    return df


def standardize_table_10_df(df):
    """
    Unique steps needed to clean BJS Prisoners 2020 - Table 10
    Percent Share by Age plus Total Raw # of Sentenced Prisoners
    under Jurisdiction by Age

    Parameters:
            df (Pandas Dataframe): specific dataframe from BJS
            * Note, excess header and footer info must be cleaned in the read_csv()
            before this step (both mocked + prod flows)
    Returns:
            df (Pandas Dataframe): a "clean" dataframe ready for manipulation
    """

    df[std_col.AGE_COL] = df['Age'].combine_first(
        df["Unnamed: 1"])

    # replace all weird characters (specifically EN-DASH –) with normal hyphen
    df[std_col.AGE_COL] = df[std_col.AGE_COL].apply(
        lambda datum: re.sub('[^0-9a-zA-Z ]+', '-', datum))

    df = df[[std_col.AGE_COL, "Total"]]

    df = df.rename(columns={"Total": PRISON_PCT_SHARE_COL})

    df = df.replace("Total", std_col.ALL_VALUE)
    df = df.replace("65 or older", "65+")

    df[std_col.STATE_NAME_COL] = constants.US_NAME
    return df


def standardize_table_13_df(df):
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

    df = df.rename(
        columns={'Total': RAW_PRISON_COL})
    df = df[[std_col.STATE_NAME_COL, RAW_PRISON_COL]]
    df = df.replace("U.S. total", constants.US_NAME)
    df[std_col.AGE_COL] = "0-17"
    return df


def standardize_table_23_df(df):
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
        columns={'Total': Race.ALL.value})
    # since American Samoa reports numbers differently,
    # we will use their Custody # instead of the null jurisdiction #
    df[Race.ALL.value] = df[Race.ALL.value].combine_first(
        df["Total custody population"])

    # use RACE because we need ALL not All
    df = filter_cols(df, std_col.RACE_COL)

    # remove any weird leftover rows
    df = df.dropna()

    return df


def standardize_appendix_table_2_df(df):
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

    df = swap_race_col_names_to_codes(df)

    df[[Race.UNKNOWN.value, "Did not report"]] = df[[
        Race.UNKNOWN.value, "Did not report"]].astype(float)
    df[Race.UNKNOWN.value] = df[[Race.UNKNOWN.value,
                                 "Did not report"]].sum(axis="columns", min_count=1)
    df = filter_cols(df, std_col.RACE_COL)

    return df


def standardize_jail_6(df):
    """
    Unique steps needed to clean BJS Census of Jails 2019 - Table 6
    Raw #Confined inmates in local jails, by adult or juvenile status, sex, and state, midyear 2019

    Parameters:
            df (Pandas Dataframe): specific dataframe from BJS
            * Note, excess header and footer info must be cleaned in the read_csv()
            before this step
    Returns:
            df (Pandas Dataframe): a "clean" dataframe ready for manipulation
    """

    df = df.rename(
        columns={'Total inmates in custody': RAW_JAIL_COL,
                 "Total": "18+",
                 "Male": "Male 18+",
                 "Female": "Female 18+",
                 "Total.1": "0-17",
                 "Male.1": "Male 0-17",
                 "Female.1": "Female 0-17",
                 "Male.2": "Male Pct",
                 "Female.2": "Female Pct"})

    df = df[[std_col.STATE_NAME_COL, RAW_JAIL_COL, "0-17", "18+", "Male 0-17",
             "Male 18+", "Female 0-17", "Female 18+", "Male Pct", "Female Pct"]]

    df = df.replace("U.S. total", constants.US_NAME)

    return df


def standardize_jail_7(df):
    """
    Unique steps needed to clean BJS Census of Jails 2019 - Table 7
    Percent of confined inmates in local jails, by race or ethnicity and state, midyear 2019
    Raw # Total, Pct Share Breakdowns

    Parameters:
            df (Pandas Dataframe): specific dataframe from BJS
            * Note, excess header and footer info must be cleaned in the read_csv()
            before this step
    Returns:
            df (Pandas Dataframe): a "clean" dataframe ready for manipulation
    """

    df = swap_race_col_names_to_codes(df)
    df = df.rename(
        columns={'Total inmates in custody': Race.ALL.value,
                 })

    df = filter_cols(df, std_col.RACE_COL)

    return df


def keep_only_states(df):
    """
    Accepts a cleaned and standardized BJS table df, and returns a df with any
    non-state / non-territory rows removed (e.g. removes "U.S. Total" and "Federal" rows).

    Parameters:
        df: a cleaned and standardized pandas df from a BJS table where cols are the demographic groups

    Returns:
        a pandas df with a single row per state (or territory) with "state_name" column and their values
     """
    return df[~df[std_col.STATE_NAME_COL].isin(NON_STATE_ROWS)]


def keep_only_national(df, demo_group_cols):
    """
    Accepts a cleaned and standardized BJS table df, and returns a df with only a national row
    If a "U.S. Total" or "United States" row is already present in the table, that is used
    Otherwise is it calculated as the sum of all states plus federal

    Parameters:
        df: a cleaned and standardized pandas df from a BJS table where cols are the demographic groups
        demo_group_cols: a list of string column names that contain the values to be summed if needed

    Returns:
        a pandas df with a single row with state_name: "United States" and the correlating values
     """

    # see if there is a US total row
    df_us = df.loc[df[std_col.STATE_NAME_COL].isin(
        [US_TOTAL, constants.US_NAME])]

    if len(df_us.index) == 1:
        df_us.loc[:, std_col.STATE_NAME_COL] = constants.US_NAME
        return df_us

    if len(df_us.index) > 1:
        raise ValueError("There is more than one U.S. Total row")

    # if not, remove any rows that aren't states or federal
    df = keep_only_states(df).append(
        df.loc[df[std_col.STATE_NAME_COL] == FED])

    # sum, treating nan as 0, and set as United States
    df.loc[0, demo_group_cols] = df[demo_group_cols].sum(min_count=1)
    df.loc[0, std_col.STATE_NAME_COL] = constants.US_NAME
    df = df.loc[df[std_col.STATE_NAME_COL] == constants.US_NAME]

    return df


def cols_to_rows(df, demographic_groups, demographic_col, value_col):
    """
    Makes a "wide" BJS style table into a "long" HET style table. The
    incoming BJS tables store demographic breakdowns as their own columns,
    and the values per location in those columns. Each geography has a single
    row. For our HET style tables, we need a row for every combination of
    places/demographic groups. To do this we have a specific type of "melt"
    we must perform

    Parameters:
        df: "Wide" BJS style df with a column "state_name" and columns for
          each demographic group
        demographic_groups: list of strings containing the column names for
            demographic groups (e.g. [`All`, `White (Non-Hispanic)`])
        demographic_col: string column name for new column that will store the
            previous "demographic_groups" column headers as values per row
        value_col: string column name to contain the values per place/group row,
          previously stored as values under the "demographic_groups" columns

    Returns:
        A HET-style "melted" or "un-pivoted" long table, where each row contains a
        unique place/ demographic group pair

"""
    represented_groups = [
        group for group in demographic_groups if group in df.columns]

    return df.melt(id_vars=[std_col.STATE_NAME_COL],
                   value_vars=represented_groups,
                   var_name=demographic_col,
                   value_name=value_col)
