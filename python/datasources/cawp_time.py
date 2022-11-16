from typing import List
from datasources.data_source import DataSource
from ingestion.constants import NATIONAL_LEVEL, STATE_LEVEL, STATE_LEVEL_FIPS_LIST, US_ABBR, US_FIPS, US_NAME, TERRITORY_POSTALS
import ingestion.standardized_columns as std_col
from ingestion import gcs_to_bq_util, merge_utils
from ingestion.standardized_columns import Race
import pandas as pd

FIRST_YR = 1917
LAST_YR = 2022

# restrict index years to this list
TIME_PERIODS = [str(x) for x in list(range(FIRST_YR, LAST_YR + 1))]

US_CONGRESS_CURRENT_URL = "https://theunitedstates.io/congress-legislators/legislators-current.json"
US_CONGRESS_HISTORICAL_URL = "https://theunitedstates.io/congress-legislators/legislators-historical.json"

CAWP_LINE_ITEMS_FILE = "cawp-by_race_and_ethnicity_time_series.csv"

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

RACE = "race_ethnicity"


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

        merge_cols = [
            std_col.TIME_PERIOD_COL,
            std_col.STATE_FIPS_COL,
            std_col.STATE_POSTAL_COL,
            std_col.STATE_NAME_COL,
            RACE
        ]

        # STATE ROWS FOR THE "ALL" RACE
        df_alls = scaffold_df_by_year_by_state_by_race_list(["All"])
        df_alls_total_cols = merge_us_congress_total_names_count_cols(
            df_alls.copy())
        df_alls_women_any_race_cols = merge_us_congress_women_any_race_names_cols(
            df_alls.copy())
        df_alls_women_this_race_cols = df_alls_women_any_race_cols.copy().rename(columns={
            "women_all_races_us_congress_names": "women_this_race_us_congress_names",
            "women_all_races_us_congress_count": "women_this_race_us_congress_count",
        })

        # STATE ROWS FOR EACH CAWP RACE
        df_by_races = scaffold_df_by_year_by_state_by_race_list(list(
            CAWP_RACE_GROUPS_TO_STANDARD.keys()))
        df_by_races_total_cols = merge_us_congress_total_names_count_cols(
            df_by_races.copy())
        df_by_races_women_any_race_cols = merge_us_congress_women_any_race_names_cols(
            df_by_races.copy())
        df_by_races_women_this_race_cols = merge_us_congress_women_this_race_cols(
            df_by_races.copy())

        df_alls = pd.merge(
            df_alls, df_alls_total_cols, on=merge_cols)
        df_alls = pd.merge(
            df_alls, df_alls_women_any_race_cols, on=merge_cols)
        df_alls = pd.merge(
            df_alls, df_alls_women_this_race_cols, on=merge_cols)

        df_by_races = pd.merge(
            df_by_races, df_by_races_total_cols, on=merge_cols)
        df_by_races = pd.merge(
            df_by_races, df_by_races_women_any_race_cols, on=merge_cols)
        df_by_races = pd.merge(
            df_by_races, df_by_races_women_this_race_cols, on=merge_cols)

        # CONCAT ROWS TOGETHER FOR ALLS AND RACES
        _df = pd.concat([df_alls, df_by_races])
        _df = _df.sort_values(
            by=merge_cols).reset_index(drop=True)

        for geo_level in [
            STATE_LEVEL,
            NATIONAL_LEVEL
        ]:
            df = _df.copy()

            if geo_level == NATIONAL_LEVEL:
                df = combine_states_to_national(df)

            # print(df)

            # TODO confirm new MULTI behavior and that UNKNOWN are being combined

            # for BQ
            table_name = f'race_and_ethnicity_{geo_level}'
            print(f'making {table_name}')

            # calculate rates of representation
            df[std_col.PCT_SHARE_OF_US_CONGRESS] = round(df["women_this_race_us_congress_count"] /
                                                         df["total_us_congress_count"] * 100, 1)
            df[std_col.PCT_SHARE_OF_WOMEN_US_CONGRESS] = round(df["women_this_race_us_congress_count"] /
                                                               df["women_all_races_us_congress_count"] * 100, 1).fillna(0)

            # the ALL WOMEN NAMES are already stored as THIS RACE NAMES for the ALL rows so we can drop to save filesize and complexity
            # df = df.drop(columns=["women_all_races_us_congress_names"])

            # only keep lists of ALL MEMBERS and ALL WOMEN on the ALL ROWS
            # only keep the lists of WOMEN BY RACE on the RACE ROWS (not the ALLS)
            df.loc[df[RACE] != "All", [
                "total_us_congress_names"
            ]] = "see ALL row"

            # standardize race labels
            df[std_col.RACE_CATEGORY_ID_COL] = df[RACE].apply(
                lambda x: "ALL" if x == "All" else CAWP_RACE_GROUPS_TO_STANDARD[x])
            std_col.add_race_columns_from_category_id(df)
            df = df.drop(columns=[RACE])

        #             df = df.sort_values(
        #                 by=[std_col.STATE_FIPS_COL, std_col.TIME_PERIOD_COL, std_col.RACE_CATEGORY_ID_COL]).reset_index(drop=True)

        #             # df["total_us_congress_names"] = ""
        #             # print(df.to_string())

        #             # print(df.drop(columns=["total_us_congress_names"]).to_string())
        #             print(df)
            gcs_to_bq_util.add_df_to_bq(
                df, dataset, table_name)


def scaffold_df_by_year_by_state_by_race_list(race_list: List[str]):
    """
    Creates the scaffold df with a row for every STATE/YEAR/RACE IN race_list combo
    Parameters:
        race_list: list of strings to serve as values in the "race_ethnicity" column
    Returns:
        df with a row for every combo of `race_list` race, years, and state/territories
        including columns for "state_name", "state_postal" and "state_fips"
    """
    # start with single column of all state-level fips as our df template
    df = pd.DataFrame({
        std_col.STATE_FIPS_COL: [*STATE_LEVEL_FIPS_LIST],
    })

    # explode to every combo of state/year
    df[std_col.TIME_PERIOD_COL] = [TIME_PERIODS] * len(df)
    df = df.explode(std_col.TIME_PERIOD_COL).reset_index(drop=True)

    # merge in FIPS codes to the scaffold df
    df = merge_utils.merge_state_ids(df, keep_postal=True)

    df[RACE] = [race_list] * len(df)
    df = df.explode(RACE)

    return df


def merge_us_congress_total_names_count_cols(scaffold_df):
    """
    Calculates a list of ALL US Congress members per state/year, and merges that info into the scaffold df
    Parameters:
        scaffold_df: a df containing a row for every combo of "time_period" and "state_fips"
    Returns:
        df with a column "us_congress_total_count" containing the int count of total members in the state/year,
        and a string list of those same members
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

                full_name = f'{title} {legislator["name"]["first"]} {legislator["name"]["last"]}'
                entry = {
                    "id": legislator["id"]["govtrack"],
                    "name": full_name,
                    "type": term["type"],
                    std_col.STATE_POSTAL_COL: term["state"],
                    std_col.TIME_PERIOD_COL: year
                }
                # add entry of service for id/year/state. this should avoid
                # double counting and match CAWP which only has one entry per legislator per year
                if year in TIME_PERIODS and entry not in us_congress_totals_list_of_dict:
                    us_congress_totals_list_of_dict.append(entry)

    # convert to df
    us_congress_df = pd.DataFrame.from_dict(
        us_congress_totals_list_of_dict)

    # get names of all TOTAL members in lists per row
    us_congress_df = us_congress_df.groupby(
        [std_col.STATE_POSTAL_COL, std_col.TIME_PERIOD_COL])["name"].apply(list).reset_index()
    us_congress_df = us_congress_df.rename(columns={
        "name": "total_us_congress_names"})
    # get counts of all TOTAL members in lists per row
    us_congress_df["total_us_congress_count"] = us_congress_df["total_us_congress_names"].apply(
        lambda list: len(list))

    # merge in calculated counts and name lists by state/year where they exist;
    df = pd.merge(scaffold_df, us_congress_df,
                  on=[std_col.TIME_PERIOD_COL, std_col.STATE_POSTAL_COL], how="left")
    # fill counts with 0 and names with empty string where no info available
    df["total_us_congress_count"] = df["total_us_congress_count"].fillna(
        0)
    df["total_us_congress_names"] = df["total_us_congress_names"].fillna(
        "")

    return df


def merge_us_congress_women_any_race_names_cols(scaffold_df):

    # load in CAWP counts of women by race by year by state
    df = gcs_to_bq_util.load_csv_as_df_from_data_dir(
        'cawp', CAWP_LINE_ITEMS_FILE)

    # keep only needed cols
    df = df[[
        'id', 'year', 'level', 'state', 'first_name', 'last_name', 'position']]

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
    df["name"] = (
        df["position"] + " " +
        df["first_name"] + " " +
        df["last_name"]
    )
    df = df.drop(
        columns=["first_name", "last_name", "position"])

    # get lists of names of WOMEN per year/state regardless of race for the "All"
    df = df[[
        std_col.STATE_FIPS_COL,
        std_col.STATE_NAME_COL,
        std_col.STATE_POSTAL_COL,
        std_col.TIME_PERIOD_COL,
        "name",
    ]]

    df = df.groupby(
        [
            std_col.STATE_FIPS_COL,
            std_col.STATE_NAME_COL,
            std_col.STATE_POSTAL_COL,
            std_col.TIME_PERIOD_COL,
        ])["name"].apply(list).reset_index()

    df = df.rename(columns={
        "name": "women_all_races_us_congress_names"})

    df["women_all_races_us_congress_count"] = df['women_all_races_us_congress_names'].apply(
        lambda list: len(list))

    df = pd.merge(scaffold_df, df, on=[
        "state_fips",
        "state_name",
        "state_postal",
        "time_period"
    ], how="left")

    df["women_all_races_us_congress_count"] = df["women_all_races_us_congress_count"].fillna(
        0)
    df["women_all_races_us_congress_names"] = df["women_all_races_us_congress_names"].fillna(
        "")

    # print(df)

    return df


def merge_us_congress_women_this_race_cols(scaffold_df):
    # load in CAWP counts of women by race by year by state
    df = gcs_to_bq_util.load_csv_as_df_from_data_dir(
        'cawp', CAWP_LINE_ITEMS_FILE)

    # keep only needed cols
    df = df[[
        'id', 'year', 'level', 'state', 'first_name', 'last_name', 'position', RACE]]

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
    df["name"] = (
        df["position"] + " " +
        df["first_name"] + " " +
        df["last_name"]
    )
    df = df.drop(
        columns=["first_name", "last_name", "position"])

    # get lists of names of WOMEN per year/state per race
    df = df[[
        std_col.STATE_FIPS_COL,
        std_col.STATE_NAME_COL,
        std_col.STATE_POSTAL_COL,
        std_col.TIME_PERIOD_COL,
        "name",
        RACE
    ]]

    df = df.groupby(
        [
            std_col.STATE_FIPS_COL,
            std_col.STATE_NAME_COL,
            std_col.STATE_POSTAL_COL,
            std_col.TIME_PERIOD_COL,
            RACE
        ])["name"].apply(list).reset_index()

    df = df.rename(columns={
        "name": "women_this_race_us_congress_names"})

    df["women_this_race_us_congress_count"] = df['women_this_race_us_congress_names'].apply(
        lambda list: len(list))

    df = pd.merge(scaffold_df, df, on=[
        "time_period",
        "state_fips",
        "state_name",
        "state_postal",
        RACE
    ], how="left")

    df["women_this_race_us_congress_count"] = df["women_this_race_us_congress_count"].fillna(
        0)
    df["women_this_race_us_congress_names"] = df["women_this_race_us_congress_names"].fillna(
        "")

    # print("$$$")
    # print(df)

    return df

    # def merge_us_congress_women_by_race(df):
    #     """
    #     Loads the line-item data from CAWP and merges as columns into exploded incoming df
    #     Parameters:
    #         df: incoming df with rows per state/year/race
    #     Returns:
    #         df with rows per state/year/race, a column for counts of women US Congress members
    #         and a columns for lists of their names
    #     """

    #     # make all CAWP comma-delimited race(s) strings into lists
    #     line_items_df[RACE] = [x.split(", ")
    #                            for x in line_items_df[RACE]]

    #     # count the names to generate the total number of women of ANY race, per state/year,
    #     # to be used later as the numerator AND denominator in rate calculations

    #     line_items_df_us_congress_alls_cols_df = line_items_df_us_congress_alls_df[[
    #         std_col.STATE_FIPS_COL,
    #         std_col.TIME_PERIOD_COL,
    #         "women_all_races_us_congress_count",
    #         'women_all_races_us_congress_names',
    #     ]]

    #     # merge COLUMNS with ALL WOMEN counts and names into the unexploded df so these totals will be available on every row
    #     merge_cols = [
    #         std_col.STATE_FIPS_COL,
    #         std_col.TIME_PERIOD_COL,
    #     ]

    #     df = pd.merge(
    #         df, line_items_df_us_congress_alls_cols_df, on=merge_cols, how="left")
    #     df["women_all_races_us_congress_count"] = df["women_all_races_us_congress_count"].fillna(
    #         0)
    #     df["women_all_races_us_congress_names"] = df["women_all_races_us_congress_names"].fillna(
    #         "")

    #     # later we will again merge the ALL WOMEN data as ALL RACE rows and the MULTIPLE RACE WOMEN as MULTI rows

    #     # explode those race lists with one row per race
    #     line_items_df_us_congress = line_items_df_us_congress.explode(
    #         RACE).reset_index(drop=True)

    #     line_items_df_us_congress = line_items_df_us_congress[[
    #         "time_period",
    #         "race_ethnicity",
    #         "state_postal",
    #         "state_fips",
    #         "state_name",
    #         "name",
    #     ]]

    #     # combine rows, adding a columns with lists of all WOMEN legislators for that race/state/year
    #     line_items_df_us_congress = line_items_df_us_congress.groupby(
    #         [
    #             "time_period",
    #             "race_ethnicity",
    #             "state_postal",
    #             "state_fips",
    #             "state_name",
    #         ])["name"].apply(list).reset_index()
    #     line_items_df_us_congress = line_items_df_us_congress.rename(columns={
    #         "name": "women_this_race_us_congress_names"})

    #     # count the names to generate the total number of women per race/state/year,
    #     # to be used later as the numerator in rate calculations
    #     line_items_df_us_congress['women_this_race_us_congress_count'] = line_items_df_us_congress['women_this_race_us_congress_names'].apply(
    #         lambda list: len(list))

    #     # treat the ALLs like they are a race
    #     line_items_df_us_congress_alls_df[RACE] = "All"
    #     line_items_df_us_congress_alls_df["women_this_race_us_congress_names"] = line_items_df_us_congress_alls_df["women_all_races_us_congress_names"]
    #     line_items_df_us_congress_alls_df["women_this_race_us_congress_count"] = line_items_df_us_congress_alls_df["women_all_races_us_congress_count"]

    #     df_totals = df[[
    #         "time_period",
    #         "state_postal",
    #         "total_us_congress_names",
    #         "total_us_congress_count"
    #     ]]

    #     # merge the totals and the ALL COLS into the ALL ROWS
    #     merge_cols = [
    #         "time_period",
    #         "state_postal"
    #     ]
    #     line_items_df_us_congress_alls_df = pd.merge(
    #         line_items_df_us_congress_alls_df, df_totals, on=merge_cols, how="inner")

    #     # print(line_items_df_us_congress_alls_df)

    #     # merge CAWP counts by RACE with incoming df per race/year/state
    #     merge_cols = [
    #         std_col.TIME_PERIOD_COL,
    #         RACE,
    #         std_col.STATE_POSTAL_COL,
    #         std_col.STATE_NAME_COL,
    #         std_col.STATE_FIPS_COL
    #     ]
    #     df = pd.merge(
    #         df, line_items_df_us_congress, on=merge_cols, how="left")

    #     # concat the ALL rows with the RACE rows
    #     # df = pd.concat([df, line_items_df_us_congress_alls_df])

    #     # state/race/years with NO WOMEN should have counts as zero and names as empty string
    #     df["women_this_race_us_congress_count"] = df["women_this_race_us_congress_count"].fillna(
    #         0)
    #     df["women_this_race_us_congress_names"] = df["women_this_race_us_congress_names"].fillna(
    #         "")

    #     # print(df)

    #     # print(df.drop(columns=["total_us_congress_names"]).to_string())
    #     return df


def combine_states_to_national(df):
    """
    Takes the df that contains rows for every year/race by state and territory,
    and combines those rows into a national dataset

    Parameters:
        df: dataframe containing a row for every combination of state/race/year
    Output:
        df same dataframe summed to a national level with a row per race/year
    """

    df_counts = df.copy().drop([
        "state_fips",
        "state_name",
        "state_postal"
    ], axis=1)

    df_counts = df_counts.groupby([
        "time_period",
        "race_ethnicity"
    ], as_index=False)[
        'total_us_congress_count',
        'women_all_races_us_congress_count',
        'women_this_race_us_congress_count'
    ].agg(sum)

    # print(df_counts)

    df_names = df.copy().drop([
        "state_fips",
        "state_name",
        "state_postal"
    ], axis=1)

    df_names = df_names.groupby([
        "time_period",
        "race_ethnicity"
    ], as_index=False)[
        'total_us_congress_names',
        'women_all_races_us_congress_names',
        'women_this_race_us_congress_names'
    ].agg(lambda nested_list: [x for list in nested_list for x in list])

    merge_cols = ["time_period", "race_ethnicity"]
    df = pd.merge(df_names, df_counts, on=merge_cols)

    df[std_col.STATE_FIPS_COL] = US_FIPS
    df[std_col.STATE_NAME_COL] = US_NAME
    df[std_col.STATE_POSTAL_COL] = US_ABBR

    # # Calculate each name list / count column pair separately

    # # combine names lists and counts for ALL LEG
    # df_totals = df.groupby(
    #     [std_col.TIME_PERIOD_COL, RACE])["total_us_congress_names"].apply(list).reset_index()
    # # flatten lists of lists
    # df_totals["total_us_congress_names"] = df_totals["total_us_congress_names"].apply(
    #     lambda nested_list: [item for sublist in nested_list for item in sublist])
    # df_totals["total_us_congress_count"] = df_totals['total_us_congress_names'].apply(
    #     lambda list: len(list))

    # # print(df_totals)

    # # combine names lists and counts for ALL WOMEN LEG ANY RACE
    # df_women_all_races = df.groupby(
    #     [std_col.TIME_PERIOD_COL, RACE])["women_all_races_us_congress_names"].apply(list).reset_index()
    # # flatten lists of lists
    # df_women_all_races["women_all_races_us_congress_names"] = df_women_all_races["women_all_races_us_congress_names"].apply(
    #     lambda nested_list: [item for sublist in nested_list for item in sublist])
    # df_women_all_races["women_all_races_us_congress_count"] = df_women_all_races['women_all_races_us_congress_names'].apply(
    #     lambda list: len(list))

    # # print(df_women_all_races)

    # # combine names lists and counts for ALL WOMEN LEG SPECIFIC RACE
    # df_women_this_race = df.groupby(
    #     [std_col.TIME_PERIOD_COL, RACE])["women_this_race_us_congress_names"].apply(list).reset_index()
    # # flatten lists of lists
    # df_women_this_race["women_this_race_us_congress_names"] = df_women_this_race["women_this_race_us_congress_names"].apply(
    #     lambda nested_list: [item for sublist in nested_list for item in sublist])
    # df_women_this_race["women_this_race_us_congress_count"] = df_women_this_race['women_this_race_us_congress_names'].apply(
    #     lambda list: len(list))

    # # print(df_women_this_race)

    # # merge all the columns created above together onto the df
    # merge_cols = [RACE, std_col.TIME_PERIOD_COL]
    # df = pd.merge(df_totals, df_women_all_races, on=merge_cols)
    # df = pd.merge(df, df_women_this_race, on=merge_cols)

    # # treat US like a state
    # df[std_col.STATE_FIPS_COL] = US_FIPS
    # df[std_col.STATE_NAME_COL] = US_NAME
    # df[std_col.STATE_POSTAL_COL] = US_ABBR

    return df
