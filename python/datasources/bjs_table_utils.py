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
NON_STATE_ROWS = [US_TOTAL, STATE, FED, constants.US_ABBR, constants.US_NAME]

RAW_COL = std_col.generate_column_name(
    std_col.PRISON_PREFIX, std_col.RAW_SUFFIX)
PER_100K_COL = std_col.generate_column_name(
    std_col.PRISON_PREFIX, std_col.PER_100K_SUFFIX)
PCT_SHARE_COL = std_col.generate_column_name(
    std_col.PRISON_PREFIX, std_col.PCT_SHARE_SUFFIX)

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
# BJS_AGE_GROUPS = [std_col.ALL_VALUE, '0-17']
BJS_AGE_GROUPS = [std_col.ALL_VALUE, "18-19", "20-24", "25-29", "30-34",
                  "35-39", "40-44", "45-49", "50-54", "55-59", "60-64", "65+"]

BJS_SEX_GROUPS = [constants.Sex.FEMALE, constants.Sex.MALE, std_col.ALL_VALUE]


BJS_DATA_TYPES = [
    std_col.PRISON_PREFIX,
    # std_col.JAIL_PREFIX,
    # std_col.INCARCERATED_PREFIX
]

NON_NULL_RAW_COUNT_GROUPS = ["0-17"]

# BJS Prisoners Report
BJS_PRISONERS_ZIP = "https://bjs.ojp.gov/content/pub/sheets/p20st.zip"
TABLE_2 = "p20stt02.csv"  # RAW# JURISDICTION / TOTAL+STATE+FED / SEX
TABLE_10 = "p20stt10.csv"  # %, RAW # SENTENCED JURISDICTION / TOTAL+STATE+FED / SEX
TABLE_13 = "p20stt13.csv"  # RAW# JUVENILE CUSTODY / TOTAL+STATE+FED / AGE / SEX
TABLE_23 = "p20stt23.csv"  # RAW# JURISDICTION / TERRITORY
APPENDIX_TABLE_2 = "p20stat02.csv"  # RAW# JURISDICTION / STATE+FED / RACE

# BJS tables include excess header and footer rows that need to be trimmed
bjs_prisoners_tables = {
    APPENDIX_TABLE_2: {"header_rows": [*list(range(10)), 12], "footer_rows": 13},
    TABLE_2: {"header_rows": [*list(range(11))], "footer_rows": 10, },
    TABLE_10: {"header_rows": [*list(range(11))], "footer_rows": 8, },
    TABLE_13: {"header_rows": [*list(range(11)), 13, 14], "footer_rows": 6},
    TABLE_23: {"header_rows": [*list(range(11)), 12], "footer_rows": 10}
}


def load_tables(zip_url: str):
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
        if file in bjs_prisoners_tables:
            source_df = pd.read_csv(
                files.open(file),
                encoding="ISO-8859-1",
                skiprows=bjs_prisoners_tables[file]["header_rows"],
                skipfooter=bjs_prisoners_tables[file]["footer_rows"],
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
    BJS uses two kinds of missing data:
    `~` N/A. Jurisdiction does not track this race or ethnicity.
    `/` Not reported.

    Parameters:
            df (Pandas Dataframe): a dataframe with some missing values set to `~` or `/`

    Returns:
            df (Pandas Dataframe): a dataframe with all missing values nulled
    """
    df = df.applymap(lambda datum: np.nan if datum ==
                     "/" or datum == "~" else datum)

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

    df = df.rename(columns={"Total": PCT_SHARE_COL})

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
        columns={'Total': RAW_COL})
    df = df[[std_col.STATE_NAME_COL, RAW_COL]]
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


def keep_only_states(df):

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
    # make "wide" table into a "long" table
    # move columns for demographic groups (e.g. `All`, `White (Non-Hispanic)`
    # to be additional rows per geo
    return df.melt(id_vars=[std_col.STATE_NAME_COL],
                   value_vars=demographic_groups,
                   var_name=demographic_col,
                   value_name=value_col)


def add_missing_demographic_values(df, demographic, null_values_column):
    """
    For dataframes where some geo/demo rows are expected to be missing data
    (e.g. only the "All" value is known), we need to manually fill in those missing
    rows with null to allow the pct_share functions to operate properly

    Parameters:
        df: pandas dataframe with columns | "state_name" | "age" or "sex" or "race_category_id"
        demographic: string of which breakdown we want, either "race_and_ethnicity" or "sex".
        null_values_column: string column name for the added null values

    Returns:
        df with additional rows containing the missing geo/demo rows with null values

    """
    unique_places = df[std_col.STATE_NAME_COL].drop_duplicates()

    expected_groups = STANDARD_RACE_CODES if demographic == "race_and_ethnicity" else BJS_SEX_GROUPS
    demo_col = "race_category_id" if demographic == "race_and_ethnicity" else demographic

    missing_rows = []

    for place in unique_places:
        for group in expected_groups:
            if not ((df[std_col.STATE_NAME_COL] == place)
                    & (df[demo_col] == group)).any():
                missing_rows.append(
                    {std_col.STATE_NAME_COL: place, demo_col: group, null_values_column: np.nan})

    # so territories are in the same order as states
    missing_rows.reverse()

    missing_df = pd.DataFrame(missing_rows, columns=[
                              std_col.STATE_NAME_COL, demo_col, null_values_column])

    df = df.append(missing_df)

    df = df.reset_index(drop=True)

    return df
