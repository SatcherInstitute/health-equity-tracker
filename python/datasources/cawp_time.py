from typing import List
from datasources.data_source import DataSource
from ingestion.constants import (
    NATIONAL_LEVEL,
    STATE_LEVEL,
    STATE_LEVEL_FIPS_LIST,
    US_ABBR,
    US_FIPS,
    US_NAME,
    TERRITORY_POSTALS,
    RACE
)
import ingestion.standardized_columns as std_col
from ingestion import gcs_to_bq_util, merge_utils, dataset_utils
from ingestion.standardized_columns import Race
import pandas as pd


def get_consecutive_time_periods(first_year: int = 1915, last_year: int = 2022):
    """
    Generates a list of consecutive time periods in the "YYYY" format

    Parameters:
        first_year: optional int to start the list; defaults to 1915
            which is two years before the first woman in US Congress
        last_year: optional int to be the last element in the list
            other than the default of 2022

    Returns:
        a list of string years (e.g. ["1999", "2000", "2001"])
    """
    return [str(x) for x in list(range(first_year, last_year + 1))]


def get_state_level_fips():
    """
    Returns a list of 2-letter strings for all state and territory fips codes
    """
    return STATE_LEVEL_FIPS_LIST


# data urls
US_CONGRESS_CURRENT_URL = "https://theunitedstates.io/congress-legislators/legislators-current.json"
US_CONGRESS_HISTORICAL_URL = "https://theunitedstates.io/congress-legislators/legislators-historical.json"
CAWP_LINE_ITEMS_FILE = "cawp-by_race_and_ethnicity_time_series.csv"

# CAWP labels
CAWP_RACE_GROUPS_TO_STANDARD = {
    'Asian American/Pacific Islander': Race.ASIAN_PAC.value,
    'Latina': Race.HISP.value,
    'Middle Eastern/North African': Race.MENA.value,
    # for now we will NOT present a multiracial category, and instead have
    # multiple specific races in their individual races, and have "Multiracial Alone"
    # grouped into "Unrepresented Race"
    # need to confirm if CAWP has any other races besides "Multiracial Alone"
    # that need to be grouped into this "Unrepresented Race" bucket
    'Multiracial Alone': Race.OTHER_NONSTANDARD.value,
    'Native American/Alaska Native/Native Hawaiian': Race.AIANNH.value,
    'Black': Race.BLACK.value,
    'White': Race.WHITE.value,
    'Unavailable': Race.UNKNOWN.value,
}
POSITION_LABELS = {
    "U.S. Representative": "Rep.",
    "U.S. Delegate": "Del.",
    "U.S. Senator": "Sen."
}
RACE_ETH = "race_ethnicity"
NAME = "name"

MERGE_COLS = [
    std_col.TIME_PERIOD_COL,
    std_col.STATE_FIPS_COL,
    std_col.STATE_POSTAL_COL,
    std_col.STATE_NAME_COL,
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
        _df = self.generate_base_df()

        for geo_level in [
            STATE_LEVEL,
            NATIONAL_LEVEL
        ]:
            df = _df.copy()
            df, bq_table_name = self.generate_breakdown(df, geo_level)

            # to bypass GCP and test on the frontend locally
            # df.to_json(
            #     f'frontend/public/tmp/cawp_data-{bq_table_name}.json', orient="records")

            gcs_to_bq_util.add_df_to_bq(
                df, dataset, bq_table_name)

    # CLASS METHODS

    def generate_base_df(self):
        """
        Creates a dataframe with the raw counts by state by year by race of:
        all congress members, all women congress members,
        and women congress members of the row's race
        """

        # fetch and form data
        us_congress_totals_df = get_us_congress_totals_df()
        us_congress_women_df = get_us_congress_women_df()

        # STATE ROWS FOR THE "ALL" RACE_ETH
        df_alls_rows = scaffold_df_by_year_by_state_by_race_list([
            Race.ALL.value])
        df_alls_total_cols = merge_us_congress_total_names_count_cols(
            df_alls_rows.copy(), us_congress_totals_df)
        df_alls_women_any_race_cols = merge_us_congress_women_cols(
            df_alls_rows.copy(), us_congress_women_df, False)
        df_alls_women_this_race_cols = df_alls_women_any_race_cols.copy().rename(columns={
            std_col.W_ALL_RACES_CONGRESS_NAMES: std_col.W_THIS_RACE_CONGRESS_NAMES,
            std_col.W_ALL_RACES_CONGRESS_COUNT: std_col.W_THIS_RACE_CONGRESS_COUNT,
        })

        # STATE ROWS FOR EACH CAWP RACE_ETH
        df_by_races_rows = scaffold_df_by_year_by_state_by_race_list(list(
            CAWP_RACE_GROUPS_TO_STANDARD.keys()))
        df_by_races_total_cols = merge_us_congress_total_names_count_cols(
            df_by_races_rows.copy(), us_congress_totals_df)
        df_by_races_women_any_race_cols = merge_us_congress_women_cols(
            df_by_races_rows.copy(), us_congress_women_df, False)
        df_by_races_women_this_race_cols = merge_us_congress_women_cols(
            df_by_races_rows.copy(), us_congress_women_df, True)

        # combine COLUMNS for ALLS ROWS
        df_alls_rows = pd.merge(
            df_alls_rows, df_alls_total_cols, on=MERGE_COLS)
        df_alls_rows = pd.merge(
            df_alls_rows, df_alls_women_any_race_cols, on=MERGE_COLS)
        df_alls_rows = pd.merge(
            df_alls_rows, df_alls_women_this_race_cols, on=MERGE_COLS)

        # combine COLUMNS for BY RACES ROWS
        df_by_races_rows = pd.merge(
            df_by_races_rows, df_by_races_total_cols, on=MERGE_COLS)
        df_by_races_rows = pd.merge(
            df_by_races_rows, df_by_races_women_any_race_cols, on=MERGE_COLS)
        df_by_races_rows = pd.merge(
            df_by_races_rows, df_by_races_women_this_race_cols, on=MERGE_COLS)

        # combine ROWS together from ALLS ROWS and BY RACES rows
        df = pd.concat([df_alls_rows, df_by_races_rows])
        df = df.sort_values(
            by=MERGE_COLS).reset_index(drop=True)

        # TODO: these should either be available to the user somehow; via csv download or something?
        df = df.drop(
            ["total_us_congress_names",
             "women_all_races_us_congress_names",
             "women_this_race_us_congress_names"], axis=1)

        # # to generate mock base
        # df.to_csv(
        #     "python/tests/data/cawp_time/test_expected_base_df.csv", index=False)

        return df

    def generate_breakdown(self, _df, geo_level: str):
        """
        Takes df with rows per year/race incl ALL/state and calculates the metrics
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
            bq_table_name: string name used for writing each breakdown to bq

        """

        df = _df.copy()

        if geo_level == NATIONAL_LEVEL:
            df = combine_states_to_national(df)

        # TODO confirm new MULTI behavior and that UNKNOWN are being combined
        bq_table_name = f'race_and_ethnicity_{geo_level}_time_series'
        print(f'making {bq_table_name}')

        # calculate rates of representation
        df[std_col.PCT_OF_CONGRESS] = round(df[std_col.W_THIS_RACE_CONGRESS_COUNT] /
                                            df[std_col.CONGRESS_COUNT] * 100, 1)
        df[std_col.PCT_OF_W_CONGRESS] = round(df[std_col.W_THIS_RACE_CONGRESS_COUNT] /
                                              df[std_col.W_ALL_RACES_CONGRESS_COUNT] * 100, 1).fillna(0)

        # standardize race labels
        df[std_col.RACE_CATEGORY_ID_COL] = df[RACE_ETH].apply(
            lambda x: "ALL" if x == Race.ALL.value else CAWP_RACE_GROUPS_TO_STANDARD[x])
        std_col.add_race_columns_from_category_id(df)
        df = df.drop(columns=[RACE_ETH])

        # TODO: figure out what we are doing about historic population info
        target_time_periods = get_consecutive_time_periods(first_year=2019)

        df = merge_utils.merge_current_pop_numbers(
            df, RACE, geo_level, target_time_periods)

        # to generate MOCK population responses
        # df.to_csv(f'{geo_level}.csv', index=False)

        df = dataset_utils.generate_pct_rel_inequity_col(df,
                                                         std_col.PCT_OF_W_CONGRESS,
                                                         std_col.POPULATION_PCT_COL,
                                                         std_col.W_CONGRESS_PCT_INEQUITY,
                                                         )

        df = dataset_utils.zero_out_pct_rel_inequity(df,
                                                     geo_level,
                                                     "race",
                                                     {std_col.PCT_OF_CONGRESS: std_col.W_CONGRESS_PCT_INEQUITY},
                                                     std_col.POPULATION_PCT_COL
                                                     )

        sort_cols = [
            std_col.TIME_PERIOD_COL,
            std_col.STATE_FIPS_COL,
            std_col.STATE_POSTAL_COL,
            std_col.STATE_NAME_COL,
            std_col.RACE_CATEGORY_ID_COL
        ]

        df = df.sort_values(
            by=sort_cols).reset_index(drop=True)

        # # to generate GOLDEN DATA
        # df.to_csv(
        #     f'python/tests/data/cawp_time/{bq_table_name}.csv', index=False)

        return [df, bq_table_name]


# HELPER FUNCTIONS

def scaffold_df_by_year_by_state_by_race_list(race_list: List[str]):
    """
    Creates the scaffold df with a row for every STATE/YEAR/RACE_ETH IN race_list combo
    Parameters:
        race_list: list of strings to serve as values in the "race_ethnicity" column
    Returns:
        df with a row for every combo of `race_list` race, years, and state/territories
        including columns for "state_name", "state_postal" and "state_fips"
    """
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
    """
    Fetches historic and current congress data, combines them, and iterates over
    each Congress member and their terms served to generate a dataframe.

    Returns:
        df with rows per legislator-term and
        columns "time_period" by year and "state_postal"
    """

    # load US congress data for total_counts
    raw_historical_congress_json = gcs_to_bq_util.fetch_json_from_web(
        US_CONGRESS_HISTORICAL_URL)
    raw_current_congress_json = gcs_to_bq_util.fetch_json_from_web(
        US_CONGRESS_CURRENT_URL)

    raw_legislators_json = [
        *raw_historical_congress_json,
        *raw_current_congress_json
    ]

    us_congress_totals_list_of_dict = []
    years = get_consecutive_time_periods()

    # iterate through each legislator
    for legislator in raw_legislators_json:

        # and each term they served
        for term in legislator["terms"]:

            term_years = list(
                range(int(term["start"][:4]), int(term["end"][:4])+1))

            # and each year of each term
            for year in term_years:
                year = str(year)
                title = f'{term["type"].capitalize()}.' if term["state"] not in TERRITORY_POSTALS else "Del."
                full_name = f'{title} {legislator[NAME]["first"]} {legislator[NAME]["last"]}'
                entry = {
                    "id": legislator["id"]["govtrack"],
                    NAME: full_name,
                    "type": term["type"],
                    std_col.STATE_POSTAL_COL: term["state"],
                    std_col.TIME_PERIOD_COL: year
                }
                # add entry of service for id/year/state. this should avoid
                # double counting and match CAWP which only has one entry per legislator per year
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
        lambda list: len(list))

    return df


def merge_us_congress_total_names_count_cols(scaffold_df, us_congress_df):
    """
    Merges previously made congress df info into the incoming scaffold df
    Parameters:
        scaffold_df: df containing a row for every combo of
            "time_period" X "state_postal" X "race_ethnicity
        congress_df: df containing a row for every legislator-term

    Returns:
        df with a column "us_congress_total_count" ints count of total members in the state/year,
        and column "us_congress_total_names" a string list of those same members
    """

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
    """
    Fetches CAWP data, generates a dataframe with rows for every woman
    in U.S. Congress any year

    Returns:
        df with rows per woman in US Congress, and
        columns "time_period" by year and "state_postal", "race_ethnicity"
        with specific CAWP race strings
    """
   # load in CAWP counts of women by race by year by state
    df = gcs_to_bq_util.load_csv_as_df_from_data_dir(
        'cawp', CAWP_LINE_ITEMS_FILE)

    # keep only needed cols
    df = df[[
        'id', 'year', 'level', 'state', 'first_name', 'last_name', 'position', RACE_ETH]]

    # standardize CAWP state names as postal
    df[std_col.STATE_POSTAL_COL] = df["state"].apply(
        get_postal_from_cawp_phrase)

    # merge in FIPS codes
    df = merge_utils.merge_state_ids(
        df, keep_postal=True)

    df = df.drop(columns=["state"])

    # rename year
    df = df.rename(
        columns={"year": std_col.TIME_PERIOD_COL})

    # remove non-Congress line items
    df = df.loc[df['level']
                == 'Congress']

    # standardize gov. titles between sources
    df["position"] = df["position"].apply(
        lambda x: POSITION_LABELS[x])

    # consolidate name columns
    df[NAME] = (
        df["position"] + " " +
        df["first_name"] + " " +
        df["last_name"]
    )
    df = df.drop(
        columns=["first_name", "last_name", "position"])

    return df


def merge_us_congress_women_cols(scaffold_df, us_congress_women_df, preserve_race_breakdown: bool):
    """
    Merges previously made CAWP df info into the incoming scaffold df
    Parameters:
        scaffold_df: df containing a row for every combo of
            "time_period" X "state_postal" X "race_ethnicity
        congress_df: df containing a row for every woman in US Congress ever
        preserve_race_breakdown: if True will calculate the counts and names
            per race and merge "_this_race" cols, if False  will perform the
            calculations for the Race.ALL.value race group and merge the "_all_races" cols

    Returns:
        df with rows for every combo of "time_period" years and "state_postal" codes,
        a column std_col.W_ALL_RACES_CONGRESS_COUNT ints count of total women members in the state/year,
        and column std_col.W_ALL_RACES_CONGRESS_COUNT a string list of those same members
    """

    df = us_congress_women_df.copy()

    groupby_cols = [
        std_col.STATE_FIPS_COL,
        std_col.STATE_NAME_COL,
        std_col.STATE_POSTAL_COL,
        std_col.TIME_PERIOD_COL,
    ]

    needed_cols = groupby_cols[:]
    needed_cols.append(NAME)

    if preserve_race_breakdown is True:
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
        lambda list: len(list))
    df = pd.merge(scaffold_df, df, on=groupby_cols, how="left")
    df[count_col] = df[count_col].fillna(
        0)
    df[names_col] = df[names_col].fillna(
        "")
    return df


def combine_states_to_national(df):
    """
    Takes the df that contains rows for every year/race by state and territory,
    and combines those rows into a national dataset

    Parameters:
        df: dataframe containing a row for every combination of state/race/year
    Output:
        df same dataframe summed to a national level with a row per race/year
    """

    state_cols = [
        std_col.STATE_FIPS_COL,
        std_col.STATE_NAME_COL,
        std_col.STATE_POSTAL_COL
    ]
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
    df = df_counts

    # to keep lists of NAMES
    # df_names = df.copy().drop(state_cols, axis=1)
    # df_names = df_names.groupby(groupby_cols, as_index=False)[
    #     std_col.CONGRESS_NAMES,
    #     std_col.W_ALL_RACES_CONGRESS_NAMES,
    #     std_col.W_THIS_RACE_CONGRESS_NAMES
    # ].agg(lambda nested_list: [x for list in nested_list for x in list])

    # df = pd.merge(df_names, df_counts, on=groupby_cols)

    df[std_col.STATE_FIPS_COL] = US_FIPS
    df[std_col.STATE_NAME_COL] = US_NAME
    df[std_col.STATE_POSTAL_COL] = US_ABBR

    return df


def get_postal_from_cawp_phrase(cawp_place_phrase: str):
    """ Swap CAWP place phrase found in the LINE ITEM table
    `{STATE_COL_LINE NAME} - {CODE}` with the standard 2 letter code

    Parameters:
        cawp_place_phrase: str
    Returns:
        string of standard 2-letter postal code
     """

    # swap out non-standard 2 letter codes
    cawp_place_phrase = {"American Samoa - AM":
                         "American Samoa - AS",
                         "Northern Mariana Islands - MI":
                         "Northern Mariana Islands - MP"}.get(
                             cawp_place_phrase, cawp_place_phrase)

    # only keep 2 letter code portion
    place_terms_list = cawp_place_phrase.split(" - ")
    place_code = place_terms_list[1]

    return place_code
