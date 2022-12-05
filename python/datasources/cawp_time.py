from typing import List
from datasources.data_source import DataSource
from ingestion.constants import (
    NATIONAL_LEVEL, STATE_LEVEL,
    STATE_LEVEL_FIPS_LIST,
    US_ABBR, US_FIPS, US_NAME,
    TERRITORY_POSTALS,
    RACE
)
import ingestion.standardized_columns as std_col
from ingestion import gcs_to_bq_util, merge_utils
from ingestion.dataset_utils import (generate_pct_rel_inequity_col,
                                     zero_out_pct_rel_inequity)
from ingestion.standardized_columns import Race
import pandas as pd

# time_periods for entire dataset
DEFAULT_FIRST_YR = 1915
DEFAULT_LAST_YR = 2022

# time_periods which are appropriate to merge ACS2019 figures onto
ACS_FIRST_YR = 2019
ACS_LAST_YR = 2022

# data urls
US_CONGRESS_CURRENT_URL = "https://theunitedstates.io/congress-legislators/legislators-current.json"
US_CONGRESS_HISTORICAL_URL = "https://theunitedstates.io/congress-legislators/legislators-historical.json"
CAWP_LINE_ITEMS_FILE = "cawp-by_race_and_ethnicity_time_series.csv"

# CAWP labels
CAWP_RACE_GROUPS_TO_STANDARD = {
    'Asian American/Pacific Islander': Race.ASIAN_PAC.value,
    'Latina': Race.HISP.value,
    'Middle Eastern/North African': Race.MENA.value,
    'Native American/Alaska Native/Native Hawaiian': Race.AIANNH.value,
    'Black': Race.BLACK.value,
    'White': Race.WHITE.value,
    # no women identified as the labels below at the US CONGRESS level in any year
    # at State Leg. level there were - Multi alone: 2, Other: 1, Unavailable: 4441
    # TODO: combine "Multiracial Alone" with "Other" when adding STATE LEGISLATURES
    # 'Other': Race.OTHER_NONSTANDARD.value
    'Multiracial Alone': Race.OTHER_NONSTANDARD.value,
    'Unavailable': Race.UNKNOWN.value,
}

AIAN_API_RACES = ['Asian American/Pacific Islander',
                  'Native American/Alaska Native/Native Hawaiian']

POSITION_LABELS = {
    "U.S. Representative": "Rep.",
    "U.S. Delegate": "Del.",
    "U.S. Senator": "Sen."
}
RACE_ETH = "race_ethnicity"
NAME = "name"
FIRST = "first"
LAST = "last"
TYPE = "type"
ID = "id"
STATE = "state"
TERMS = "terms"
START = "start"
END = "end"
FIRST_NAME = "first_name"
LAST_NAME = "last_name"
POSITION = "position"
LEVEL = "level"
YEAR = "year"
CONGRESS = "Congress"

STATE_COLS = [
    std_col.STATE_FIPS_COL,
    std_col.STATE_POSTAL_COL,
    std_col.STATE_NAME_COL
]

MERGE_COLS = [
    std_col.TIME_PERIOD_COL,
    *STATE_COLS,
    RACE_ETH
]


class CAWPTimeData(DataSource):

    @ staticmethod
    def get_id():
        return 'CAWP_TIME_DATA'

    @ staticmethod
    def get_table_name():
        return 'cawp_time_data'

    def upload_to_gcs(self, _, **attrs):
        raise NotImplementedError(
            'upload_to_gcs should not be called for CAWPTimeData')

    def write_to_bq(self, dataset, gcs_bucket, **attrs):
        base_df = self.generate_base_df()

        for geo_level in [
            STATE_LEVEL,
            NATIONAL_LEVEL
        ]:
            df = base_df.copy()
            df, bq_table_name = self.generate_breakdown(df, geo_level)

            float_cols = [
                std_col.CONGRESS_COUNT,
                std_col.W_ALL_RACES_CONGRESS_COUNT,
                std_col.W_THIS_RACE_CONGRESS_COUNT,
                std_col.PCT_OF_CONGRESS,
                std_col.PCT_OF_W_CONGRESS,
                std_col.W_CONGRESS_PCT_INEQUITY,
                std_col.POPULATION_COL,
                std_col.POPULATION_PCT_COL
            ]

            column_types = gcs_to_bq_util.get_bq_column_types(df, float_cols)
            gcs_to_bq_util.add_df_to_bq(
                df, dataset, bq_table_name, column_types=column_types)

    # CLASS METHODS

    def generate_base_df(self):
        """ Creates a dataframe with the raw counts by state by year by race of:
        all congress members, all women congress members,
        and women congress members of the row's race """

        # fetch and form data
        us_congress_totals_df = get_us_congress_totals_df()
        us_congress_women_df = get_us_congress_women_df()

        # create ROWS for the "All" race
        df_alls_rows = build_base_rows_df(
            us_congress_totals_df, us_congress_women_df, [Race.ALL.value])

        # create ROWS for each CAWP race group
        df_by_races_rows = build_base_rows_df(us_congress_totals_df, us_congress_women_df, list(
            CAWP_RACE_GROUPS_TO_STANDARD.keys()))

        # append combo race group ROWS
        df_by_races_rows = add_aian_api_rows(df_by_races_rows)

        # combine ROWS together from ALLS ROWS and BY RACES rows
        df = pd.concat([df_alls_rows, df_by_races_rows])
        df = df.sort_values(
            by=MERGE_COLS).reset_index(drop=True)

        df = df.drop(
            [std_col.CONGRESS_NAMES,
             std_col.W_ALL_RACES_CONGRESS_NAMES,
             std_col.W_THIS_RACE_CONGRESS_NAMES], axis=1)

        return df

    def generate_breakdown(self, _df, geo_level: str):
        """ Takes df with rows per year/race incl ALL/state and calculates the metrics
        shown on the frontend

        Parameters:
            df: with columns for state info, CAWP "race_ethnicity",
                "time_period" years, along with the raw counts for total,
                all women, and women of each race
            geo_level:
                "national" or "state"
        Returns [df, bq_table_name]:
            df: with calculated columns for share of congress,
                share of women in congress, percent relative inequity
            bq_table_name: string name used for writing each breakdown to bq """

        df = _df.copy()
        if geo_level == NATIONAL_LEVEL:
            df = combine_states_to_national(df)

        bq_table_name = f'race_and_ethnicity_{geo_level}_time_series'
        print(f'making {bq_table_name}')

        # calculate rates of representation
        df[std_col.PCT_OF_CONGRESS] = round(df[std_col.W_THIS_RACE_CONGRESS_COUNT] /
                                            df[std_col.CONGRESS_COUNT] * 100, 1)
        df[std_col.PCT_OF_W_CONGRESS] = round(df[std_col.W_THIS_RACE_CONGRESS_COUNT] /
                                              df[std_col.W_ALL_RACES_CONGRESS_COUNT] * 100, 1).fillna(0)

        # standardize race labels
        df[std_col.RACE_CATEGORY_ID_COL] = df[RACE_ETH].apply(
            lambda x: "ALL" if x == Race.ALL.value else CAWP_RACE_GROUPS_TO_STANDARD.get(x, x))
        std_col.add_race_columns_from_category_id(df)
        df = df.drop(columns=[RACE_ETH])

        # TODO: expand this once we have pop. info prior to 2019
        target_time_periods = get_consecutive_time_periods(
            first_year=ACS_FIRST_YR, last_year=ACS_LAST_YR)

        df = merge_utils.merge_current_pop_numbers(
            df, RACE, geo_level, target_time_periods)

        df = generate_pct_rel_inequity_col(df,
                                           std_col.PCT_OF_W_CONGRESS,
                                           std_col.POPULATION_PCT_COL,
                                           std_col.W_CONGRESS_PCT_INEQUITY,
                                           )
        df = zero_out_pct_rel_inequity(df,
                                       geo_level,
                                       RACE,
                                       {std_col.PCT_OF_CONGRESS: std_col.W_CONGRESS_PCT_INEQUITY},
                                       std_col.POPULATION_PCT_COL
                                       )

        sort_cols = [std_col.TIME_PERIOD_COL,
                     *STATE_COLS,
                     std_col.RACE_CATEGORY_ID_COL]

        df = df.sort_values(
            by=sort_cols).reset_index(drop=True)

        # we will only use AIAN_API for the disparity bar chart and
        # pct_relative_inequity calculations
        df.loc[df[std_col.RACE_CATEGORY_ID_COL]
               == Race.AIAN_API][std_col.PCT_OF_CONGRESS] = None

        return [df, bq_table_name]


# HELPER FUNCTIONS

def scaffold_df_by_year_by_state_by_race_list(race_list: List[str]):
    """ Creates the scaffold df with a row for every STATE/YEAR/RACE_ETH IN race_list combo
    Parameters:
        race_list: list of strings to serve as values in the "race_ethnicity" column
    Returns:
        df with a row for every combo of `race_list` race, years, and state/territories
        including columns for "state_name", "state_postal" and "state_fips" """
    # start with single column of all state-level fips as our df template
    fips_list = get_state_level_fips()
    df = pd.DataFrame({
        std_col.STATE_FIPS_COL: [*fips_list],
    })

    # explode to every combo of state/year
    years = get_consecutive_time_periods()
    df[std_col.TIME_PERIOD_COL] = [years] * len(df)
    df = df.explode(std_col.TIME_PERIOD_COL).reset_index(drop=True)

    # merge in FIPS codes to the scaffold df
    df = merge_utils.merge_state_ids(df, keep_postal=True)
    df[RACE_ETH] = [race_list] * len(df)
    df = df.explode(RACE_ETH)

    return df


def get_us_congress_totals_df():
    """ Fetches historic and current congress data, combines them, and iterates over
    each Congress member and their terms served to generate a dataframe.

    Returns:
        df with rows per legislator-term and
        columns "time_period" by year and "state_postal" """

    # load US congress data for total_counts
    raw_historical_congress_json = gcs_to_bq_util.fetch_json_from_web(
        US_CONGRESS_HISTORICAL_URL)
    raw_current_congress_json = gcs_to_bq_util.fetch_json_from_web(
        US_CONGRESS_CURRENT_URL)

    raw_legislators_json = [*raw_historical_congress_json,
                            *raw_current_congress_json]

    us_congress_totals_list_of_dict = []
    years = get_consecutive_time_periods()

    # iterate through each legislator
    for legislator in raw_legislators_json:
        # and each term they served
        for term in legislator[TERMS]:
            term_years = list(
                range(int(term[START][:4]), int(term[END][:4]) + 1))

            # and each year of each term
            for year in term_years:
                year = str(year)
                title = f'{term[TYPE].capitalize()}.' if term[STATE] not in TERRITORY_POSTALS else "Del."
                full_name = f'{title} {legislator[NAME][FIRST]} {legislator[NAME][LAST]}'
                entry = {
                    ID: legislator[ID]["govtrack"],
                    NAME: full_name,
                    TYPE: term[TYPE],
                    std_col.STATE_POSTAL_COL: term[STATE],
                    std_col.TIME_PERIOD_COL: year
                }
                # add entry of service for id/year/state.
                # avoid double counting, CAWP only has 1 entry per leg. per year
                if year in years and entry not in us_congress_totals_list_of_dict:
                    us_congress_totals_list_of_dict.append(entry)

    # convert to df
    df = pd.DataFrame.from_dict(
        us_congress_totals_list_of_dict)

    # get names of all TOTAL members in lists per row
    df = df.groupby(
        [std_col.STATE_POSTAL_COL, std_col.TIME_PERIOD_COL])[NAME].apply(list).reset_index()
    df = df.rename(columns={
        NAME: std_col.CONGRESS_NAMES})
    # get counts of all TOTAL members in lists per row
    df[std_col.CONGRESS_COUNT] = df[std_col.CONGRESS_NAMES].apply(
        lambda list: len(list)).astype(float)

    return df


def merge_us_congress_total_names_count_cols(scaffold_df, us_congress_df):
    """ Merges previously made congress df info into the incoming scaffold df
    Parameters:
        scaffold_df: df containing a row for every combo of
            "time_period" X "state_postal" X "race_ethnicity
        congress_df: df containing a row for every legislator-term

    Returns:
        df with a column "us_congress_total_count" ints count of total members in the state/year,
        and column "us_congress_total_names" a string list of those same members """

    # merge in calculated counts and name lists by state/year where they exist;
    df = pd.merge(scaffold_df, us_congress_df,
                  on=[std_col.TIME_PERIOD_COL, std_col.STATE_POSTAL_COL], how="left")
    # fill counts with 0 and names with empty string where no info available
    df[std_col.CONGRESS_COUNT] = df[std_col.CONGRESS_COUNT].fillna(
        0)
    df[std_col.CONGRESS_NAMES] = df[std_col.CONGRESS_NAMES].fillna(
        "")
    return df


def get_us_congress_women_df():
    """ Fetches CAWP data counts of women by race by year by state,
    generates a dataframe with rows for every woman
    in U.S. Congress any year

    Returns:
        df with rows per woman in US Congress, and
        columns "time_period" by year and "state_postal", "race_ethnicity"
        with specific CAWP race strings """
    df = gcs_to_bq_util.load_csv_as_df_from_data_dir(
        'cawp_time', CAWP_LINE_ITEMS_FILE)

    # keep only needed cols
    df = df[[ID, YEAR, LEVEL, STATE,
             FIRST_NAME, LAST_NAME,
             POSITION, RACE_ETH]]

    # standardize CAWP state names as postal
    df[std_col.STATE_POSTAL_COL] = df[STATE].apply(
        get_postal_from_cawp_phrase)

    # merge in FIPS codes
    df = merge_utils.merge_state_ids(
        df, keep_postal=True)
    df = df.drop(columns=[STATE])

    # rename year
    df = df.rename(
        columns={YEAR: std_col.TIME_PERIOD_COL})
    df[std_col.TIME_PERIOD_COL] = df[std_col.TIME_PERIOD_COL].astype(str)

    # remove non-Congress line items
    df = df.loc[df[LEVEL] == CONGRESS]

    # standardize gov. titles between sources
    df[POSITION] = df[POSITION].apply(
        lambda x: POSITION_LABELS[x])

    # consolidate name columns
    df[NAME] = (
        df[POSITION] + " " +
        df[FIRST_NAME] + " " +
        df[LAST_NAME]
    )
    df = df.drop(
        columns=[FIRST_NAME, LAST_NAME, POSITION])
    return df


def merge_us_congress_women_cols(scaffold_df, us_congress_women_df, preserve_races: bool = False):
    """ Merges previously made CAWP df info into the incoming scaffold df
    Parameters:
        scaffold_df: df containing a row for every combo of
            "time_period" X "state_postal" X "race_ethnicity
        congress_df: df containing a row for every woman in US Congress ever
        preserve_races (optional boolean): if True will calculate the counts and names
            per race and merge "_this_race" cols, if False will perform the
            calculations for the Race.ALL.value race group and merge the "_all_races" cols

    Returns:
        df with rows for every combo of "time_period" years and "state_postal" codes,
        a column std_col.W_ALL_RACES_CONGRESS_COUNT ints count of total women members in the state/year,
        and column std_col.W_ALL_RACES_CONGRESS_COUNT a string list of those same members """

    df = us_congress_women_df.copy()

    groupby_cols = [*STATE_COLS, std_col.TIME_PERIOD_COL]

    needed_cols = groupby_cols[:]
    needed_cols.append(NAME)

    if preserve_races:
        needed_cols.append(RACE_ETH)
        groupby_cols.append(RACE_ETH)
        count_col = std_col.W_THIS_RACE_CONGRESS_COUNT
        names_col = std_col.W_THIS_RACE_CONGRESS_NAMES
    else:
        count_col = std_col.W_ALL_RACES_CONGRESS_COUNT
        names_col = std_col.W_ALL_RACES_CONGRESS_NAMES

    # remove unneeded cols
    df = df[needed_cols]
    df = df.groupby(groupby_cols
                    )[NAME].apply(list).reset_index()
    df = df.rename(columns={
        NAME: names_col})
    df[count_col] = df[names_col].apply(
        lambda list: len(list)).astype(float)

    df = pd.merge(scaffold_df, df, on=groupby_cols, how="left")
    df[count_col] = df[count_col].fillna(0)
    df[names_col] = df[names_col].fillna("")
    return df


def combine_states_to_national(df):
    """ Takes the df that contains rows for every year/race by state and territory,
    and combines those rows into a national dataset

    Parameters:
        df: dataframe containing a row for every combination of state/race/year
    Output:
        df same dataframe summed to a national level with a row per race/year """

    state_cols = [*STATE_COLS]
    groupby_cols = [
        std_col.TIME_PERIOD_COL,
        RACE_ETH
    ]
    df_counts = df.copy().drop(state_cols, axis=1)
    df_counts = df_counts.groupby(groupby_cols, as_index=False)[
        std_col.CONGRESS_COUNT,
        std_col.W_ALL_RACES_CONGRESS_COUNT,
        std_col.W_THIS_RACE_CONGRESS_COUNT
    ].agg(sum)
    _df = df_counts

    _df[std_col.STATE_FIPS_COL] = US_FIPS
    _df[std_col.STATE_NAME_COL] = US_NAME
    _df[std_col.STATE_POSTAL_COL] = US_ABBR

    return _df


def get_postal_from_cawp_phrase(cawp_place_phrase: str):
    """ Swap CAWP place phrase found in the LINE ITEM table
    `{STATE_COL_LINE NAME} - {CODE}` with the standard 2 letter code

    Parameters:
        cawp_place_phrase: str
    Returns:
        string of standard 2-letter postal code """

    # swap out non-standard 2 letter codes
    cawp_place_phrase = {"American Samoa - AM":
                         "American Samoa - AS",
                         "Northern Mariana Islands - MI":
                         "Northern Mariana Islands - MP"}.get(
                             cawp_place_phrase, cawp_place_phrase)

    return cawp_place_phrase.split(" - ")[1]


def get_consecutive_time_periods(first_year: int = DEFAULT_FIRST_YR, last_year: int = DEFAULT_LAST_YR):
    """ Generates a list of consecutive time periods in the "YYYY" format

    Parameters:
        first_year: optional int to start the list; defaults to 1915
            which is two years before the first woman in US Congress
        last_year: optional int to be the last element in the list
            other than the default of 2022
    Returns:
        a list of string years (e.g. ["1999", "2000", "2001"]) """
    return [str(x) for x in list(range(first_year, last_year + 1))]


def get_state_level_fips():
    """ Returns list of 2-letter strings for state and territory fips codes """
    return STATE_LEVEL_FIPS_LIST


def add_aian_api_rows(df):
    """ Adds new rows for the combined AIAN_API race group """

    # only keep rows with years that will get population
    target_time_periods = get_consecutive_time_periods(
        first_year=ACS_FIRST_YR, last_year=ACS_LAST_YR)
    df_aian_api_rows = df[df[std_col.TIME_PERIOD_COL].isin(
        target_time_periods)]

    # only keep rows with races to be combined
    df_aian_api_rows = df_aian_api_rows.loc[
        df_aian_api_rows[RACE_ETH].isin(
            AIAN_API_RACES)]
    df_aian_api_rows = df_aian_api_rows[[std_col.TIME_PERIOD_COL,
                                         *STATE_COLS,
                                         std_col.W_THIS_RACE_CONGRESS_NAMES]]

    df_aian_api_rows = df_aian_api_rows.groupby([std_col.TIME_PERIOD_COL,
                                                 *STATE_COLS], as_index=False)[
        std_col.W_THIS_RACE_CONGRESS_NAMES
    ].agg(lambda nested_list: [x for list in nested_list for x in list])

    # remove any duplicates if a women was in both of the combined race groups
    df_aian_api_rows[std_col.W_THIS_RACE_CONGRESS_NAMES] = df_aian_api_rows[std_col.W_THIS_RACE_CONGRESS_NAMES].apply(
        set).apply(list)
    df_aian_api_rows[std_col.W_THIS_RACE_CONGRESS_COUNT] = df_aian_api_rows[std_col.W_THIS_RACE_CONGRESS_NAMES].apply(
        lambda list: len(list)).astype(float)
    df_aian_api_rows[RACE_ETH] = "AIAN_API"
    df_aian_api_rows = df_aian_api_rows.reset_index(drop=True)

    # re-merge with this to preserve the non-summed rows like "total_congress_count", etc
    df_only_api_rows = df.loc[
        df[RACE_ETH] == 'Asian American/Pacific Islander']
    df_denom_cols = df_only_api_rows[[
        std_col.TIME_PERIOD_COL,
        *STATE_COLS,
        std_col.CONGRESS_COUNT,
        std_col.CONGRESS_NAMES,
        std_col.W_ALL_RACES_CONGRESS_COUNT,
        std_col.W_ALL_RACES_CONGRESS_NAMES
    ]].reset_index(drop=True)

    # add back on the COLUMNS that didn't need to sum
    df_aian_api_rows = pd.merge(df_aian_api_rows, df_denom_cols, on=[
        std_col.TIME_PERIOD_COL,
        *STATE_COLS
    ]).reset_index(drop=True)

    # add onto the original race group ROWS
    df = pd.concat([df, df_aian_api_rows], axis="rows").reset_index(drop=True)

    return df


def build_base_rows_df(us_congress_totals_df, us_congress_women_df, race_list: List[str]):
    """ Builds out a scaffold of rows with YEAR/STATE/RACE combos,
    then merges columns for TOTAL CONGRESS, WOMEN IN CONGRESS,
    and WOMEN THIS RACE IN CONGRESS

    Parameters:
        us_congress_totals_df: previously loaded and processed df with congress info from unitedstates project
        us_congress_women_df: previously loaded and processed df with women in congress info from CAWP
        race_list: a list of strings representing which races should be included in this base chunk

    Returns: a df with rows per year/state/race from race list, with columns incl.
        US CONGRESS counts for TOTAL, WOMEN ALL RACE, and WOMEN THIS RACE
    """

    # create chunks with needed COLUMNS
    df = scaffold_df_by_year_by_state_by_race_list(race_list)
    df_total_cols = merge_us_congress_total_names_count_cols(
        df.copy(), us_congress_totals_df)
    df_w_any_race_cols = merge_us_congress_women_cols(
        df.copy(), us_congress_women_df)

    # for the ALL rows, the ALL_W cols will be the same as the W_THIS_RACE cols
    # so don't need to waste time recalculating them
    if race_list == [Race.ALL.value]:
        df_w_this_race_cols = df_w_any_race_cols.copy().rename(columns={
            std_col.W_ALL_RACES_CONGRESS_NAMES: std_col.W_THIS_RACE_CONGRESS_NAMES,
            std_col.W_ALL_RACES_CONGRESS_COUNT: std_col.W_THIS_RACE_CONGRESS_COUNT})
    else:
        df_w_this_race_cols = merge_us_congress_women_cols(
            df.copy(), us_congress_women_df, preserve_races=True)

    # combine COLUMN chunks
    df = pd.merge(
        df, df_total_cols, on=MERGE_COLS)
    df = pd.merge(
        df, df_w_any_race_cols, on=MERGE_COLS)
    df = pd.merge(
        df, df_w_this_race_cols, on=MERGE_COLS)

    return df
