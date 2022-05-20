from datasources.data_source import DataSource
import ingestion.standardized_columns as std_col
import numpy as np
import pandas as pd
import re
from ingestion.standardized_columns import Race
from ingestion import gcs_to_bq_util, dataset_utils, constants
from ingestion.constants import NATIONAL_LEVEL, STATE_LEVEL
from ingestion.gcs_to_bq_util import fetch_zip_as_files
from ingestion.dataset_utils import generate_per_100k_col
from datasources.bjs_prisoners_tables_utils import (clean_prison_table_10_df,
                                                    clean_prison_table_2_df,
                                                    clean_prison_table_23_df,
                                                    clean_prison_table_13_df,
                                                    clean_prison_appendix_table_2_df,
                                                    missing_data_to_none,
                                                    STANDARD_RACE_CODES,
                                                    BJS_SEX_GROUPS,
                                                    BJS_AGE_GROUPS_JUV_ADULT,
                                                    NON_STATE_ROWS,
                                                    FED,
                                                    US_TOTAL,
                                                    RAW_COL,
                                                    PER_100K_COL,
                                                    PCT_SHARE_COL
                                                    )


BJS_DATA_TYPES = [
    std_col.PRISON_PREFIX,
    # std_col.JAIL_PREFIX,
    # std_col.INCARCERATED_PREFIX
]

# BJS Prisoners Report
BJS_PRISONERS_ZIP = "https://bjs.ojp.gov/content/pub/sheets/p20st.zip"

# NOTE: the rates used in the BJS tables are calculated with a different population source
APPENDIX_TABLE_2 = "p20stat02.csv"  # RAW# / STATE+FED / RACE
TABLE_2 = "p20stt02.csv"  # RAW# / STATE+FED / SEX
TABLE_10 = "p20stt10.csv"  # PCT_SHARE & RAW TOTAL / AGE / SEX / RACE
TABLE_13 = "p20stt13.csv"  # RAW# / STATE+FED / AGE: JUV-ADULT / SEX
TABLE_23 = "p20stt23.csv"  # RAW# / TERRITORY

bjs_prisoners_tables = {
    APPENDIX_TABLE_2: {"header_rows": [*list(range(10)), 12], "footer_rows": 13},
    TABLE_2: {"header_rows": [*list(range(11))], "footer_rows": 10, },
    TABLE_10: {"header_rows": [*list(range(11))], "footer_rows": 8},
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
            been partially formatted, but still need to be cleaned before using in
            generate_breakdown
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


def keep_only_states(df):

    return df[~df[std_col.STATE_NAME_COL].isin(NON_STATE_ROWS)]


def keep_only_national(df, demo_group_cols):
    """
    Accepts a cleaned BJS table df, and returns a df with only a national row
    If a US Total is already present in the table, that is used
    Otherwise is it calculated as the sum of all states plus federal

    Parameters:
        df: a cleaned pandas df from a BJS table where cols are the demographic groups
        demo_group_cols: a list of string column names that contain the values to be summed if needed

    Returns:
        a pandas df with a single row with state_name: "United States" and the correlating values
     """

    # see if there is a US total row
    df_us = df.loc[df[std_col.STATE_NAME_COL] == US_TOTAL]

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


def generate_breakdown(demo, geo_level, source_tables):
    """
    Takes demographic type and geographic level, along with
     "cleaned" dataframes representing specific tables
    from the BJS Prisoners (2020) report and returns a standardized df
    with rows for each combo of place + demographic group,
    and columns for | RAW# | "race" or "age" or "sex" | "state_name"

    Parameters:
        demo: string "race_or_ethnicity" | "sex" for breakdown to generate
        geo_level: string "national" | "state" for breakdown to generate
        source_df_list: list of specific data frames needed for breakdown

    Returns:
        df: standardized with raw numbers by demographic group by geographic place(s)
    """

    [source_df, source_df_territories] = source_tables

    if demo == std_col.SEX_COL:
        demo_cols = BJS_SEX_GROUPS
        demo_for_flip = demo

    if demo == std_col.RACE_OR_HISPANIC_COL:
        demo_cols = STANDARD_RACE_CODES
        demo_for_flip = std_col.RACE_CATEGORY_ID_COL

    if geo_level == STATE_LEVEL:
        df = keep_only_states(source_df)
        df = df.append(source_df_territories)

        # race uses `ALL` and sex uses `All`
        if demo == std_col.SEX_COL:
            df[std_col.ALL_VALUE] = df[std_col.ALL_VALUE].combine_first(
                df[Race.ALL.value])
            df = df.drop(columns=[Race.ALL.value])

    if geo_level == NATIONAL_LEVEL:
        df = keep_only_national(source_df, demo_cols)

    df = cols_to_rows(
        df, demo_cols, demo_for_flip, RAW_COL)

    return df


def make_prison_national_age_raw_df(source_tables):
    """
    Takes "cleaned" dataframes representing specific tables 10 and 13
    from the BJS Prisoners (2020) report and returns a standardized df
    with rows for each combo of place + demographic group,
    and columns for | RAW# | "race" or "age" or "sex" | "state_name"

    Parameters:
        source_df_adults: df of table 10
        source_df_juveniles: df of table 13

    Returns:
        df: standardized with raw numbers by age group nationally
    """

    [source_df, source_df_juveniles, source_df_territories] = source_tables

    # get total raw and remove that row leaving only age rows
    total_raw = source_df.loc[
        source_df[std_col.AGE_COL] == 'Number of sentenced prisoners', PCT_SHARE_COL].values[0]
    source_df = source_df.loc[source_df[std_col.AGE_COL]
                              != 'Number of sentenced prisoners']

    # standardize df with ADULT RAW # / AGE / USA
    df_adults = dataset_utils.merge_fips_codes(source_df)
    df_adults = dataset_utils.merge_pop_numbers(
        df_adults, std_col.AGE_COL, NATIONAL_LEVEL)

    # infer the raw count for each age breakdown
    df_adults[RAW_COL] = df_adults[PCT_SHARE_COL] / 100 * total_raw

    # drop fips/pop columns because juv is missing
    # will be re-merged in post-process
    df_adults = df_adults[[
        RAW_COL,
        std_col.STATE_NAME_COL,
        std_col.AGE_COL,
    ]]

    # standardize df with JUVENILE RAW # / AGE / USA
    df_juv = source_df_juveniles[
        source_df_juveniles[std_col.STATE_NAME_COL] == constants.US_NAME]

    # combine to create standardized df of RAW # / AGE / USA
    df = df_adults.append(df_juv).reset_index(drop=True)

    return df


def make_prison_state_age_raw_df(source_tables):
    """
    Takes "cleaned" dataframes representing specific tables 13, 2, and 23
    from the BJS Prisoners (2020) report and returns a standardized df
    with rows for each combo of place + demographic group,
    and columns for | RAW# | "race" or "age" or "sex" | "state_name"

    Parameters:
        source_df_adults: df of table 13
        source_df_juveniles: df of table 2
        source_df_territories: df of table 23

    Returns:
        df: standardized with raw numbers by age by state
    """

    [source_df_juveniles, source_df_totals, source_df_territories] = source_tables

    # standardize df with JUVENILE RAW # / AGE / STATE
    source_df_juveniles = keep_only_states(source_df_juveniles)
    source_df_juveniles = source_df_juveniles.rename(
        columns={RAW_COL: '0-17'})
    source_df_juveniles = source_df_juveniles.drop(columns=[std_col.AGE_COL])

    # standardize df with TOTAL RAW # / AGE / STATE
    source_df_totals = keep_only_states(source_df_totals)
    source_df_totals = source_df_totals[[
        std_col.STATE_NAME_COL, std_col.ALL_VALUE]]

    # df with TOTAL+JUV AGE / STATE+TERRITORY
    df = pd.merge(source_df_juveniles, source_df_totals,
                  on=std_col.STATE_NAME_COL)
    df = df.append(source_df_territories)

    df[std_col.ALL_VALUE] = df[std_col.ALL_VALUE].combine_first(
        df[Race.ALL.value])
    df = df.drop(columns=[Race.ALL.value])

    # df with TOTAL+JUV+18+ AGE / STATE+TERRITORY
    df["18+"] = df[std_col.ALL_VALUE] - df['0-17']
    df = cols_to_rows(df, BJS_AGE_GROUPS_JUV_ADULT, std_col.AGE_COL, RAW_COL)

    return df


def post_process(df, breakdown, geo):
    """
        Takes a standardized breakdown df with raw incidence values and fills in missing columns
        - generates `PER_100K` column (some incoming df may already have this col and partial data)
        - generates `PCT_SHARE` column
        - removes temporary columns needed only for calculating our metrics

       df: Dataframe with all the raw data containing:
       "state_name" column, raw values column, and demographic column
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

    # if a rate isn't coming directly from BJS, calculate it here
    if PER_100K_COL not in df.columns:
        df = generate_per_100k_col(
            df, RAW_COL, std_col.POPULATION_COL, PER_100K_COL)
    if PCT_SHARE_COL not in df.columns:
        if breakdown == std_col.RACE_OR_HISPANIC_COL:
            print(df.to_string())
            df = dataset_utils.generate_pct_share_col_with_unknowns(
                df,
                {RAW_COL:
                 PCT_SHARE_COL},
                breakdown,
                std_col.ALL_VALUE,
                Race.UNKNOWN.race
            )
        else:
            df = dataset_utils.generate_pct_share_col_without_unknowns(
                df,
                {RAW_COL:
                 PCT_SHARE_COL},
                breakdown,
                std_col.ALL_VALUE,
            )

    # manually set 0-17 rates to nan (keeping RAW count for frontend)
    if breakdown == std_col.AGE_COL:
        df.loc[df[std_col.AGE_COL] == '0-17',
               [PER_100K_COL, PCT_SHARE_COL]] = np.nan

        # keep raw column; frontend will only use 0-17 value
        df = df.drop(columns=[std_col.POPULATION_COL])

    else:
        df = df.drop(columns=[std_col.POPULATION_COL, RAW_COL])

    print("in post")
    print(df.to_string())

    return df


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

        loaded_tables = load_tables(BJS_PRISONERS_ZIP)
        df_10 = clean_prison_table_10_df(loaded_tables[TABLE_10])
        df_13 = clean_prison_table_13_df(loaded_tables[TABLE_13])
        df_2 = clean_prison_table_2_df(loaded_tables[TABLE_2])
        df_app_2 = clean_prison_appendix_table_2_df(
            loaded_tables[APPENDIX_TABLE_2])
        df_23 = clean_prison_table_23_df(loaded_tables[TABLE_23])

        # BJS tables needed per breakdown
        table_lookup = {
            # non-standard breakdown fn
            f'{std_col.AGE_COL}_{NATIONAL_LEVEL}': [df_10, df_13, df_23],
            f'{std_col.AGE_COL}_{STATE_LEVEL}': [df_13, df_2, df_23],
            # uses standard breakdown fn
            f'{std_col.RACE_OR_HISPANIC_COL}_{NATIONAL_LEVEL}': [df_app_2, df_23],
            f'{std_col.SEX_COL}_{NATIONAL_LEVEL}': [df_2, df_23],
            f'{std_col.RACE_OR_HISPANIC_COL}_{STATE_LEVEL}': [df_app_2, df_23],
            f'{std_col.SEX_COL}_{STATE_LEVEL}': [df_2, df_23],
        }

        for geo_level in [NATIONAL_LEVEL, STATE_LEVEL]:
            for breakdown in [std_col.AGE_COL, std_col.RACE_OR_HISPANIC_COL, std_col.SEX_COL]:
                table_name = f'{breakdown}_{geo_level}'

                if breakdown == std_col.AGE_COL and geo_level == NATIONAL_LEVEL:
                    df = make_prison_national_age_raw_df(
                        table_lookup[table_name])

                elif breakdown == std_col.AGE_COL and geo_level == STATE_LEVEL:
                    df = make_prison_state_age_raw_df(
                        table_lookup[table_name])

                else:
                    df = generate_breakdown(
                        breakdown, geo_level, table_lookup[table_name])

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
