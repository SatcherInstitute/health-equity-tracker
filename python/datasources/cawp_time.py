# import time
from typing import List
from datasources.data_source import DataSource
from ingestion.constants import (
    NATIONAL_LEVEL, STATE_LEVEL,
    STATE_LEVEL_FIPS_LIST,
    TERRITORY_FIPS_LIST,
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

FIPS_TO_STATE_TABLE_MAP = {
    "01": "128", "02": "2312", "04": "764", "05": "775", "06": "781",
    "08": "787", "09": "793",
    "10": "799", "12": "167", "13": "805", "15": "173", "16": "648",
    "17": "649", "18": "650", "19": "651",
    "20": "836", "21": "653", "22": "654", "23": "655", "24": "857",
    "25": "657", "26": "658", "27": "879", "28": "660", "29": "661",
    "30": "662", "31": "276", "32": "663", "33": "664", "34": "665",
    "35": "209", "36": "918", "37": "667", "38": "668", "39": "669",
    "40": "672", "41": "673", "42": "679", "44": "685",
    "45": "691", "46": "697", "47": "703", "48": "710", "49": "716",
    "50": "722", "51": "233", "53": "739", "54": "740", "55": "746",
    "56": "752"
}

# time_periods for entire dataset
DEFAULT_CONGRESS_FIRST_YR = 1915
DEFAULT_STLEG_FIRST_YR = 1983
DEFAULT_LAST_YR = 2022

# time_periods which are appropriate to merge ACS2019 figures onto
ACS_FIRST_YR = 2019
ACS_LAST_YR = 2022

# data urls
US_CONGRESS_CURRENT_URL = "https://theunitedstates.io/congress-legislators/legislators-current.json"
US_CONGRESS_HISTORICAL_URL = "https://theunitedstates.io/congress-legislators/legislators-historical.json"
CAWP_LINE_ITEMS_FILE = "cawp-by_race_and_ethnicity_time_series.csv"


def get_stleg_url(id: str):
    """
    Constructs the needed url for each state's table that contains the
    total number of state legislators per year. These tables are on the
    state info pages, for example:
    https://cawp.rutgers.edu/facts/state-state-information/alabama
    """
    return ("https://cawp.rutgers.edu/tablefield/export/paragraph/" +
            id + "/field_table/und/0")


CAWP_MULTI = "Multiracial Alone"

# CAWP labels
CAWP_RACE_GROUPS_TO_STANDARD = {
    'Asian American/Pacific Islander': Race.ASIAN_PAC.value,
    'Latina': Race.HISP.value,
    'Middle Eastern/North African': Race.MENA.value,
    'Native American/Alaska Native/Native Hawaiian': Race.AIANNH.value,
    'Black': Race.BLACK.value,
    'White': Race.WHITE.value,
    'Unavailable': Race.UNKNOWN.value,
    'Other': Race.OTHER_STANDARD.value,
    # will combine CAWP's "Multiracial Alone" with women who selected more than one specific race
    CAWP_MULTI: Race.MULTI.value,
}


AIAN_API_RACES = ['Asian American/Pacific Islander',
                  'Native American/Alaska Native/Native Hawaiian']


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
STATE_LEG = "State Legislative"
TERRITORY_LEG = "Territorial/D.C."

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

POSITION_LABELS = {
    CONGRESS: {"U.S. Representative": "U.S. Rep.",
               "U.S. Senator": "U.S. Sen.",
               "U.S. Delegate": "U.S. Del."},
    STATE_LEG: {"State Representative": "State Rep.",
                "State Senator": "State Sen.",
                "Territorial/D.C. Representative": "Rep.",
                "Territorial/D.C. Senator": "Sen.", }
}


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

        # base_df.to_csv('test_expected_base_df.csv', index=False)

        for geo_level in [
            STATE_LEVEL,
            NATIONAL_LEVEL
        ]:
            df = base_df.copy()
            df, bq_table_name = self.generate_breakdown(df, geo_level)

            # df.to_csv(f'{bq_table_name}.csv', index=False)

            float_cols = [
                std_col.CONGRESS_COUNT,
                std_col.W_THIS_RACE_CONGRESS_COUNT,
                std_col.PCT_OF_CONGRESS,
                std_col.PCT_OF_W_CONGRESS,
                std_col.W_CONGRESS_PCT_INEQUITY,
                std_col.STLEG_COUNT,
                std_col.W_THIS_RACE_STLEG_COUNT,
                std_col.PCT_OF_STLEG,
                std_col.PCT_OF_W_STLEG,
                std_col.W_STLEG_PCT_INEQUITY,
                std_col.POPULATION_COL,
                std_col.POPULATION_PCT_COL
            ]

            # df.to_json(
            #     f'frontend/public/tmp/cawp_time_data-{bq_table_name}.json', orient="records")

            column_types = gcs_to_bq_util.get_bq_column_types(df, float_cols)
            gcs_to_bq_util.add_df_to_bq(
                df, dataset, bq_table_name, column_types=column_types)

    # CLASS METHODS

    def generate_base_df(self):
        """ Creates a dataframe with the raw counts by state by year by race of:
        all congress members, all women congress members,
        and women congress members of the row's race """

        # fetch and form data
        women_us_congress_df, women_state_leg_df = get_women_dfs()
        us_congress_totals_df = get_us_congress_totals_df()
        state_leg_totals_df = get_state_leg_totals_df()

        # create ROWS for the "All" race
        df_alls_rows = build_base_rows_df(
            us_congress_totals_df, state_leg_totals_df,
            women_us_congress_df, women_state_leg_df,
            [Race.ALL.value])

        # create ROWS for each CAWP race group
        df_by_races_rows = build_base_rows_df(
            us_congress_totals_df, state_leg_totals_df,
            women_us_congress_df, women_state_leg_df,
            list(CAWP_RACE_GROUPS_TO_STANDARD.keys()))

        # append ROWS for combo race AIAN_API
        df_by_races_rows = add_aian_api_rows(df_by_races_rows)

        # combine ROWS together from ALLS ROWS and BY RACES rows
        df = pd.concat([df_alls_rows, df_by_races_rows])

        df = df.sort_values(
            by=MERGE_COLS).reset_index(drop=True)

        df = df.drop(
            [std_col.CONGRESS_NAMES,
             std_col.W_ALL_RACES_CONGRESS_NAMES,
             std_col.W_THIS_RACE_CONGRESS_NAMES,
             std_col.W_ALL_RACES_STLEG_NAMES,
             std_col.W_THIS_RACE_STLEG_NAMES
             ], axis=1)

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
        df[std_col.PCT_OF_STLEG] = round(df[std_col.W_THIS_RACE_STLEG_COUNT] /
                                         df[std_col.STLEG_COUNT] * 100, 1)
        df[std_col.PCT_OF_W_STLEG] = round(df[std_col.W_THIS_RACE_STLEG_COUNT] /
                                           df[std_col.W_ALL_RACES_STLEG_COUNT] * 100, 1)

        # drop the ALL WOMEN counts since that data is available on the "All" race rows
        df = df.drop(
            columns=[std_col.W_ALL_RACES_CONGRESS_COUNT, std_col.W_ALL_RACES_STLEG_COUNT])

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

        df = generate_pct_rel_inequity_col(df,
                                           std_col.PCT_OF_W_STLEG,
                                           std_col.POPULATION_PCT_COL,
                                           std_col.W_STLEG_PCT_INEQUITY,
                                           )
        df = zero_out_pct_rel_inequity(df,
                                       geo_level,
                                       RACE,
                                       {std_col.PCT_OF_STLEG: std_col.W_STLEG_PCT_INEQUITY},
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
        df.loc[df[std_col.RACE_CATEGORY_ID_COL]
               == Race.AIAN_API][std_col.PCT_OF_STLEG] = None
        return [df, bq_table_name]


# HELPER FUNCTIONS

def scaffold_df_by_year_by_state_by_race_list(race_list: List[str], first_year: int):
    """ Creates the scaffold df with a row for every STATE/YEAR/RACE_ETH IN race_list combo
    Parameters:
        race_list: list of strings to serve as values in the "race_ethnicity" column
        first_year: int year to start building the scaffold e.g. 1983
    Returns:
        df with a row for every combo of `race_list` race, years, and state/territories
        including columns for "state_name", "state_postal" and "state_fips" """
    # start with single column of all state-level fips as our df template
    fips_list = get_state_level_fips()
    df = pd.DataFrame({
        std_col.STATE_FIPS_COL: [*fips_list],
    })

    # explode to every combo of state/year
    years = get_consecutive_time_periods(first_year=first_year)
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


def merge_total_cols(scaffold_congress_df, scaffold_stleg_df, us_congress_df, state_leg_df):
    """ Merges previously made congress df and state_leg_df info into the incoming scaffold df
    Parameters:
        scaffold_congress_df: df containing a row for every combo of
            "time_period" for valid us congress totals X "state_postal" X "race_ethnicity
        scaffold_stleg_df: df containing a row for every combo of
            "time_period" for valid state leg totals X "state_postal" X "race_ethnicity
        congress_df: df containing a row for every legislator-term
        state_leg_df: df containing a row for every "time_period" X "state_fips"

    Returns:
        df with a column "us_congress_total_count" ints count of total members in the state/year,
        and column "us_congress_total_names" a string list of those same members """

    # merge in CONGRESS calculated counts and name lists by state/year where they exist;
    df_congress_totals = pd.merge(scaffold_congress_df, us_congress_df,
                                  on=[std_col.TIME_PERIOD_COL, std_col.STATE_POSTAL_COL], how="left")
    # fill counts with 0 and names with empty string where no info available
    df_congress_totals[std_col.CONGRESS_COUNT] = df_congress_totals[std_col.CONGRESS_COUNT].fillna(
        0)
    df_congress_totals[std_col.CONGRESS_NAMES] = df_congress_totals[std_col.CONGRESS_NAMES].fillna(
        "")

    # merge in STATE LEG counts by state/year where they exist;
    df_stateleg_totals = pd.merge(scaffold_stleg_df, state_leg_df,
                                  on=[std_col.TIME_PERIOD_COL, std_col.STATE_FIPS_COL], how="left")

    df = pd.merge(df_congress_totals, df_stateleg_totals,
                  on=MERGE_COLS, how="left")

    # fill counts with null where no info available
    df[std_col.STLEG_COUNT] = df[std_col.STLEG_COUNT].astype(float)

    return df


def get_women_dfs():
    """ Fetches CAWP data counts of women by race by year by state,
    generates two dfs, each with rows for every woman
    in U.S. Congress or state/territory legislature in any year

    Returns :
        [women_us_congress_df, women_state_leg_df] each with rows per woman legislator
            columns "time_period" by year and "state_postal", "race_ethnicity"
            with specific CAWP race strings """

    df = gcs_to_bq_util.load_csv_as_df_from_data_dir(
        'cawp_time', CAWP_LINE_ITEMS_FILE)

    # keep only needed cols
    df = df[[ID, YEAR, STATE,
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

    women_dfs = []

    for gov_level in [CONGRESS, STATE_LEG]:

        # remove non-legislative line items
        df_gov_level = df.copy().loc[df[POSITION].isin(
            POSITION_LABELS[gov_level].keys())]

        # standardize gov. titles between sources
        df_gov_level[POSITION] = df_gov_level[POSITION].apply(
            lambda x: POSITION_LABELS[gov_level][x])

        # consolidate name columns
        df_gov_level[NAME] = (
            df_gov_level[POSITION] + " " +
            df_gov_level[FIRST_NAME] + " " +
            df_gov_level[LAST_NAME]
        )
        df_gov_level = df_gov_level.drop(
            columns=[FIRST_NAME, LAST_NAME, POSITION])

        women_dfs.append(df_gov_level)

    return women_dfs


def merge_women_cols(scaffold_df, women_df, gov_level: str, preserve_races: bool = False):
    """ Merges previously made CAWP df info into the incoming scaffold df
    Parameters:
        scaffold_df: df containing a row for every combo of
            "time_period" X "state_postal" X "race_ethnicity
        women_df: df containing a row for every woman in US Congress or State Leg
        gov_level: string to choose the level of government to add cols for,
            either `state_leg` or `us_congress`
        preserve_races (optional boolean): if True will calculate the counts and names
            per race and merge "_this_race" cols, if False will perform the
            calculations for the Race.ALL.value race group and merge the "_all_races" cols

    Returns:
        df with rows for "time_period" X "state_postal" X (optional RACE_ETH), and
        _count cols for state_leg and us_congress of total women members in
            the state/year/each race or all races
        and _names cols with string lists of those same members """

    df = women_df.copy()

    groupby_cols = [*STATE_COLS, std_col.TIME_PERIOD_COL]

    needed_cols = groupby_cols[:]
    needed_cols.append(NAME)

    if preserve_races:
        df = handle_other_and_multi_races(df)
        needed_cols.append(RACE_ETH)
        groupby_cols.append(RACE_ETH)

        if gov_level == CONGRESS:
            count_col = std_col.W_THIS_RACE_CONGRESS_COUNT
            names_col = std_col.W_THIS_RACE_CONGRESS_NAMES
        elif gov_level == STATE_LEG:
            count_col = std_col.W_THIS_RACE_STLEG_COUNT
            names_col = std_col.W_THIS_RACE_STLEG_NAMES
    else:
        if gov_level == CONGRESS:
            count_col = std_col.W_ALL_RACES_CONGRESS_COUNT
            names_col = std_col.W_ALL_RACES_CONGRESS_NAMES
        elif gov_level == STATE_LEG:
            count_col = std_col.W_ALL_RACES_STLEG_COUNT
            names_col = std_col.W_ALL_RACES_STLEG_NAMES

    # remove unneeded cols
    df = df[needed_cols]

    # collapse yr/state/race rows, combine names into a list
    df = df.groupby(groupby_cols
                    )[NAME].apply(list).reset_index()
    df = df.rename(columns={
        NAME: names_col})

    # generate counts by counting the # of names
    df[count_col] = df[names_col].apply(
        lambda list: len(list)).astype(float)

    df = pd.merge(scaffold_df, df, on=groupby_cols, how="left")
    df[count_col] = df[count_col].fillna(0)
    df[names_col] = df[names_col].fillna("")

    return df


def get_state_leg_totals_df():
    """ Fetches each individual CAWP state info page's state legislature
    table, combines into a single cleaned df. Nulls everything before 1983;
    CAWPs totals are problematic between 1975-1982 and missing before that.

    Returns: df with "time_period", "state_fips", and stleg
        total_ and total_women cols

     """

    territory_dfs = []
    for fips in TERRITORY_FIPS_LIST:
        filename = f'cawp_state_leg_{fips}.csv'
        territory_df = gcs_to_bq_util.load_csv_as_df_from_data_dir(
            "cawp_time", filename)
        territory_dfs.append(territory_df)
    df_rows_by_territory = pd.concat(territory_dfs)

    state_dfs = []
    for fips, id in FIPS_TO_STATE_TABLE_MAP.items():
        state_df = gcs_to_bq_util.load_csv_as_df_from_web(get_stleg_url(id))
        state_df.columns = state_df.columns.str.replace(r'\W', '', regex=True)

        # TODO: confirm this weird shifted column data; ideally get them to fix
        df_leftIndex = state_df[state_df["10"] < 1800]
        df_rightIndex = state_df[state_df["10"] >= 1800]
        df_rightIndex = df_rightIndex.shift(periods=1, axis="columns")
        state_df = pd.concat([df_leftIndex, df_rightIndex])

        # standardize the year col
        state_df[std_col.TIME_PERIOD_COL] = state_df["Year"]
        state_df[std_col.TIME_PERIOD_COL] = state_df[
            std_col.TIME_PERIOD_COL].astype(str).replace(
            r'\D', '', regex=True)

        # extract totals
        state_df[[std_col.W_ALL_RACES_STLEG_COUNT, std_col.STLEG_COUNT]
                 ] = state_df['TotalWomenTotalLegislature'].str.split('/', 1, expand=True)

        # keep only needed cols
        state_df = state_df[[std_col.TIME_PERIOD_COL,
                            # std_col.W_ALL_RACES_STLEG_COUNT,
                             std_col.STLEG_COUNT]]

        # TODO: confirm this typo with CAWP; ideally get them to fix
        if fips == "56":
            state_df.at[0, "time_period"] = "2022"

        # append this state df to the list
        state_df[std_col.STATE_FIPS_COL] = fips
        state_dfs.append(state_df)

    # combine all state ROWS into one big df
    df_rows_by_state = pd.concat(state_dfs)

    # combine all territory ROWS as well
    df = pd.concat([df_rows_by_state, df_rows_by_territory])
    df = df.sort_values(by=[std_col.TIME_PERIOD_COL,
                            std_col.STATE_FIPS_COL]).reset_index(drop=True)

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
        std_col.W_THIS_RACE_CONGRESS_COUNT,
        std_col.STLEG_COUNT,
        std_col.W_ALL_RACES_STLEG_COUNT,
        std_col.W_THIS_RACE_STLEG_COUNT
    ].agg("sum", min_count=1)
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


def get_consecutive_time_periods(first_year: int = DEFAULT_CONGRESS_FIRST_YR, last_year: int = DEFAULT_LAST_YR):
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

    level_names_col_map = {CONGRESS: std_col.W_THIS_RACE_CONGRESS_NAMES,
                           STATE_LEG: std_col.W_THIS_RACE_STLEG_NAMES}
    level_count_col_map = {CONGRESS: std_col.W_THIS_RACE_CONGRESS_COUNT,
                           STATE_LEG: std_col.W_THIS_RACE_STLEG_COUNT}
    level_denom_cols_map = {CONGRESS: [std_col.CONGRESS_COUNT,
                                       std_col.CONGRESS_NAMES,
                                       std_col.W_ALL_RACES_CONGRESS_COUNT,
                                       std_col.W_ALL_RACES_CONGRESS_NAMES],
                            STATE_LEG: [std_col.STLEG_COUNT,
                                        std_col.W_ALL_RACES_STLEG_COUNT,
                                        std_col.W_ALL_RACES_STLEG_NAMES]
                            }

    aian_api_dfs = []

    for gov_level in [CONGRESS, STATE_LEG]:

        # specific columns needed for this level of government
        names_col = level_names_col_map[gov_level]
        count_col = level_count_col_map[gov_level]
        level_denom_cols = level_denom_cols_map[gov_level]

        # only keep needed columns
        df_aian_api_rows_gov_level = df_aian_api_rows.copy()[[std_col.TIME_PERIOD_COL,
                                                              *STATE_COLS,
                                                              names_col
                                                              ]].reset_index(
            drop=True)

        # combine the race rows, and their lists of names
        df_aian_api_rows_gov_level = df_aian_api_rows_gov_level.groupby([
            std_col.TIME_PERIOD_COL, *STATE_COLS], as_index=False)[
            names_col
        ].agg(lambda nested_list: [x for list in nested_list for x in list])

        # remove any duplicates if a women was in both of the combined race groups
        df_aian_api_rows_gov_level[names_col] = df_aian_api_rows_gov_level[
            names_col].apply(set).apply(list)

        df_aian_api_rows_gov_level[count_col] = df_aian_api_rows_gov_level[
            names_col].apply(lambda list: len(list)).astype(float)
        df_aian_api_rows_gov_level[RACE_ETH] = Race.AIAN_API.value
        df_aian_api_rows_gov_level = df_aian_api_rows_gov_level.reset_index(
            drop=True)

        # re-merge with this to preserve the non-summed rows like "total_congress_count", etc
        # could use either Asian or AIAN, the totals would be the same
        orig_df = df.copy()
        df_denom_cols_aian_api_rows = orig_df.copy().loc[
            orig_df[RACE_ETH] == 'Asian American/Pacific Islander']

        denom_cols = [std_col.TIME_PERIOD_COL,
                      *STATE_COLS,
                      *level_denom_cols]

        df_denom_cols = df_denom_cols_aian_api_rows[denom_cols].reset_index(
            drop=True)

        # add back on the COLUMNS that didn't need to sum
        df_aian_api_rows_gov_level = pd.merge(df_aian_api_rows_gov_level, df_denom_cols, on=[
            std_col.TIME_PERIOD_COL,
            *STATE_COLS
        ]).reset_index(drop=True)

        # store for later merging on cols
        aian_api_dfs.append(df_aian_api_rows_gov_level)

    # merge combo race rows state_leg cols and us_congress cols
    aian_api_rows_state_leg_cols_df, aian_api_rows_us_congress_cols_df = aian_api_dfs

    df_aian_api_rows = pd.merge(aian_api_rows_state_leg_cols_df, aian_api_rows_us_congress_cols_df, on=[
        std_col.TIME_PERIOD_COL,
        *STATE_COLS,
        RACE_ETH
    ]).reset_index(drop=True)

    # add COMBO AIAN_API RACE ROWS onto the original race groups ROWS
    df = pd.concat([df, df_aian_api_rows], axis="rows").reset_index(drop=True)

    return df


def build_base_rows_df(us_congress_totals_df,
                       state_leg_totals_df,
                       women_us_congress_df,
                       women_state_leg_df,
                       race_list: List[str]):
    """ Builds out a scaffold of rows with YEAR/STATE/RACE combos,
    then merges columns for:
    - TOTAL CONGRESS, WOMEN IN CONGRESS, WOMEN THIS RACE IN CONGRESS
    - TOTAL STATE LEG, WOMEN IN STATE LEG, WOMEN THIS RACE STATE LEG

    Parameters:
        us_congress_totals_df: previously loaded and processed df with congress info from unitedstates project
        state_leg_totals_df: previously loaded and processed df with state legislature info from CAWP state info pages
        women_us_congress_df: previously loaded and processed df with women in US Congress info from CAWP database
        women_state_leg_df: previously loaded and processed df with women in state leg. info from CAWP database
        race_list: a list of strings representing which races should be included in this base chunk

    Returns: a df with rows per year/state/race from race list, with columns incl.
        US CONGRESS and STATE LEG counts for TOTAL, WOMEN ALL RACE, and WOMEN THIS RACE
    """

    # create chunks with needed COLUMNS
    df_congress_scaffold = scaffold_df_by_year_by_state_by_race_list(
        race_list, 1915)
    df_stleg_scaffold = scaffold_df_by_year_by_state_by_race_list(
        race_list, 1983)

    df_total_cols = merge_total_cols(
        df_congress_scaffold.copy(), df_stleg_scaffold, us_congress_totals_df, state_leg_totals_df)

    df_w_any_race_us_congress_cols = merge_women_cols(
        df_congress_scaffold.copy(), women_us_congress_df, CONGRESS)

    # intentionally merging onto congress scaffold because we can have
    #  STLEG WOMEN COUNTS back further than the STLEG TOTALS
    df_w_any_race_state_leg_cols = merge_women_cols(
        df_congress_scaffold.copy(), women_state_leg_df, STATE_LEG)

    # for the ALL rows, the ALL_W cols will be the same as the W_THIS_RACE cols
    # so don't need to waste time recalculating them
    if race_list == [Race.ALL.value]:
        df_w_this_race_us_congress_cols = df_w_any_race_us_congress_cols.copy().rename(columns={
            std_col.W_ALL_RACES_CONGRESS_NAMES: std_col.W_THIS_RACE_CONGRESS_NAMES,
            std_col.W_ALL_RACES_CONGRESS_COUNT: std_col.W_THIS_RACE_CONGRESS_COUNT})
        df_w_this_race_state_leg_cols = df_w_any_race_state_leg_cols.copy().rename(columns={
            std_col.W_ALL_RACES_STLEG_NAMES: std_col.W_THIS_RACE_STLEG_NAMES,
            std_col.W_ALL_RACES_STLEG_COUNT: std_col.W_THIS_RACE_STLEG_COUNT})
    else:
        df_w_this_race_us_congress_cols = merge_women_cols(
            df_congress_scaffold.copy(), women_us_congress_df, CONGRESS, preserve_races=True)
        df_w_this_race_state_leg_cols = merge_women_cols(
            df_congress_scaffold.copy(), women_state_leg_df, STATE_LEG, preserve_races=True)

    # combine COLUMN chunks
    df = pd.merge(
        df_congress_scaffold, df_total_cols, on=MERGE_COLS)
    df = pd.merge(
        df, df_w_any_race_us_congress_cols, on=MERGE_COLS)
    df = pd.merge(
        df, df_w_this_race_us_congress_cols, on=MERGE_COLS)
    df = pd.merge(
        df, df_w_any_race_state_leg_cols, on=MERGE_COLS)
    df = pd.merge(
        df, df_w_this_race_state_leg_cols, on=MERGE_COLS)

    return df


def handle_other_and_multi_races(df):
    """
     Parameters:
         df which includes rows per women legislator, with a RACE_ETH column
            containing a string of either: a single CAWP race or multiple
            CAWP races separated by commas

     Returns:
         df where the original comma-containing "multiple specific race" rows have their
         RACE_ETH value replaced by a list of specific CAWP races. Equivalent rows
         are added with race labeled as MULTI_OTHER_TMP, and "Other" and "Multiracial Alone"
         are renamed, allowing these 3 types of other/multi to be combined in the aggregation
      """
    # convert comma separated names string into list, doesn't affect single race strings
    df[RACE_ETH] = df[RACE_ETH].str.split(', ')

    # rows with multiple specific races will sum later with
    # CAWP's incoming "multiracial alone"
    df_multiple_specific = df[df[RACE_ETH].map(len) > 1]
    df_multiple_specific[RACE_ETH] = CAWP_MULTI
    df = pd.concat([df, df_multiple_specific])

    # create individual race rows from multiple specific rows
    df = df.explode(RACE_ETH)

    return df
