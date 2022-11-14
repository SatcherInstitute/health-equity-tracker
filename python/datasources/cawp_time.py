from datasources.data_source import DataSource
from ingestion.constants import NATIONAL_LEVEL, STATE_LEVEL, STATE_LEVEL_FIPS_LIST, US_ABBR, US_FIPS, US_NAME
import ingestion.standardized_columns as std_col
from ingestion import gcs_to_bq_util, merge_utils
from ingestion.standardized_columns import Race
import pandas as pd
import numpy as np


# restrict index years to this list
TIME_PERIODS = [str(x) for x in list(range(2019, 2022 + 1))]

US_CONGRESS_CURRENT_URL = "https://theunitedstates.io/congress-legislators/legislators-current.json"
US_CONGRESS_HISTORICAL_URL = "https://theunitedstates.io/congress-legislators/legislators-historical.json"

CAWP_LINE_ITEMS_FILE = "cawp-by_race_and_ethnicity_time_series.csv"

CAWP_RACE_GROUPS_TO_STANDARD = {
    'Asian American/Pacific Islander': Race.ASIAN_PAC.value,
    'Latina': Race.HISP.value,
    'Middle Eastern/North African': Race.MENA.value,
    # MULTI = "Multiracial Alone" + women w multiple specific races
    'Multiracial Alone': Race.MULTI_OR_OTHER_STANDARD.value,
    'Native American/Alaska Native/Native Hawaiian': Race.AIANNH.value,
    'Black': Race.BLACK.value,
    'White': Race.WHITE.value,
    'Unavailable': Race.UNKNOWN.value,
    # 'All': Race.ALL.value
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

        for geo_level in [
            STATE_LEVEL,
            # NATIONAL_LEVEL
        ]:

            # for BQ
            table_name = f'race_and_ethnicity_{geo_level}'

            df = scaffold_df_by_year_by_state()
            df = merge_us_congress_totals(df)
            # print(df)

            df = merge_us_congress_women_by_race(df)

            # if geo_level == NATIONAL_LEVEL:
            #     df_national_sum = df.groupby(
            #         [RACE,
            #          std_col.TIME_PERIOD_COL
            #          ])[
            #         "total_us_house_count",
            #         "total_us_senate_count",
            #         "total_us_congress_count",
            #         "women_all_races_us_congress_count",
            #         "women_this_race_us_congress_count"
            #     ].sum().reset_index()
            #     df_national_sum[std_col.STATE_FIPS_COL] = US_FIPS
            #     df_national_sum[std_col.STATE_NAME_COL] = US_NAME
            #     df_national_sum[std_col.STATE_POSTAL_COL] = US_ABBR

            #     merge_cols = [
            #         std_col.TIME_PERIOD_COL,
            #         RACE,
            #     ]

            #     # create national list of lists of names
            #     df_national_listed_congress_names = df.groupby(
            #         [std_col.TIME_PERIOD_COL, RACE])["congress_names_all"].apply(list).reset_index()
            #     # flatten lists of lists
            #     df_national_listed_congress_names["congress_names_all"] = df_national_listed_congress_names["congress_names_all"].apply(
            #         lambda nested_list: [item for sublist in nested_list for item in sublist])

            #     df = pd.merge(df_national_sum, df_national_listed_congress_names,
            #                   on=merge_cols)

            # calculate rates of representation

            # df[std_col.PCT_SHARE_OF_US_CONGRESS] = round(df["women_this_race_us_congress_count"] /
            #                                              df["total_us_congress_count"] * 100, 1)
            # df[std_col.PCT_SHARE_OF_WOMEN_US_CONGRESS] = round(df["women_this_race_us_congress_count"] /
            #                                                    df["women_all_races_us_congress_count"] * 100, 1).fillna(0)

            # calculate rates of representation
            df[std_col.PCT_SHARE_OF_US_CONGRESS] = round(df["women_this_race_us_congress_count"] /
                                                         df["total_us_congress_count"] * 100, 1)
            df[std_col.PCT_SHARE_OF_WOMEN_US_CONGRESS] = round(df["women_this_race_us_congress_count"] /
                                                               df["women_this_race_us_congress_count"] * 100, 1).fillna(0)

            # only keep lists of ALL MEMBERS and ALL WOMEN on the ALL ROWS
            # only keep the lists of WOMEN BY RACE on the RACE ROWS (not the ALLS)
            df.loc[df[RACE] == "All", "women_this_race_us_congress_names"] = np.nan
            df.loc[df[RACE] != "All", [
                "women_all_races_us_congress_names",
                "congress_names_all"
            ]] = np.nan

            # standardize race labels
            df[std_col.RACE_CATEGORY_ID_COL] = df[RACE].apply(
                lambda x: "ALL" if x == "All" else CAWP_RACE_GROUPS_TO_STANDARD[x])
            std_col.add_race_columns_from_category_id(df)
            df = df.drop(columns=[RACE])

            df = df.sort_values(
                by=[std_col.STATE_FIPS_COL, std_col.TIME_PERIOD_COL, std_col.RACE_CATEGORY_ID_COL]).reset_index(drop=True)

            print(df.to_string())

            gcs_to_bq_util.add_df_to_bq(
                df, dataset, table_name)


def scaffold_df_by_year_by_state():
    """
    Creates the scaffold df with a row for every STATE/YEAR combo
    Returns:
        df with a row for every combo of years and state/territories including columns for "state_name", "state_postal" and "state_fips"
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

    return df


def merge_us_congress_totals(df):
    """
    Calculates a list of ALL US Congress members per state/year, and merges that info into the scaffold df
    Parameters: 
        df: a scaffold df containing a row for every combo of "time_period" and "state_fips"
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

                full_name = f'{term["type"].capitalize()}. {legislator["name"]["first"]} {legislator["name"]["last"]}'

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
    us_congress_total_count_df = pd.DataFrame.from_dict(
        us_congress_totals_list_of_dict)

    merge_cols = [std_col.TIME_PERIOD_COL, std_col.STATE_POSTAL_COL]

    # summarize US House by total count of members and a list of their names
    us_house_total_count_df = us_congress_total_count_df[
        us_congress_total_count_df["type"] == "rep"]
    us_house_total_count_df["total_us_house_count"] = 1
    us_house_total_count_df_summed = us_house_total_count_df.groupby(
        [std_col.STATE_POSTAL_COL, std_col.TIME_PERIOD_COL])["total_us_house_count"].count().reset_index()

    # summarize US House by total count of members and a list of their names
    us_senate_total_count_df = us_congress_total_count_df[
        us_congress_total_count_df["type"] == "sen"]
    us_senate_total_count_df["total_us_senate_count"] = 1
    us_senate_total_count_df_summed = us_senate_total_count_df.groupby(
        [std_col.STATE_POSTAL_COL, std_col.TIME_PERIOD_COL])["total_us_senate_count"].count().reset_index()

    # combine HOUSE + SENATE counts
    us_congress_total_count_df = pd.merge(
        us_congress_total_count_df, us_house_total_count_df_summed, on=merge_cols, how="outer").fillna(0)
    us_congress_total_count_df = pd.merge(
        us_congress_total_count_df, us_senate_total_count_df_summed, on=merge_cols, how="outer").fillna(0)

    us_congress_total_count_df["total_us_congress_count"] = (
        us_congress_total_count_df["total_us_senate_count"] +
        us_congress_total_count_df["total_us_house_count"]
    )

    # get names of all TOTAL members in lists per row

    us_congress_total_names_listed = us_congress_total_count_df.groupby(
        [std_col.STATE_POSTAL_COL, std_col.TIME_PERIOD_COL])["name"].apply(list).reset_index()
    us_congress_total_names_listed = us_congress_total_names_listed.rename(columns={
        "name": "congress_names_all"})

    us_congress_total_count_df = pd.merge(
        us_congress_total_count_df, us_congress_total_names_listed, on=merge_cols)

    us_congress_total_count_df = us_congress_total_count_df.drop(
        columns=["name", "type", "id"])

    # merge in FIPS codes to the CONGRESS TOTALS df
    us_congress_total_count_df = merge_utils.merge_state_ids(
        us_congress_total_count_df, keep_postal=True)

    # merge in calculated counts by state/year where they exist;
    # fill with 0 counts where no info available
    merge_cols = [std_col.TIME_PERIOD_COL, std_col.STATE_FIPS_COL,
                  std_col.STATE_NAME_COL, std_col.STATE_POSTAL_COL]

    df = pd.merge(df, us_congress_total_count_df,
                  on=merge_cols, how="left").fillna(0)

    return df


def merge_us_congress_women_by_race(df):
    """
    Loads the line-item data from CAWP and merges as columns into exploded incoming df
    Parameters:
        df: incoming df with rows per state/year
    Returns:
        df with rows per state/year/race, a column for counts of women US Congress members 
        and a columns for lists of their names
    """

    # load in CAWP counts of women by race by year by state
    line_items_df = gcs_to_bq_util.load_csv_as_df_from_data_dir(
        'cawp', CAWP_LINE_ITEMS_FILE)

    # keep only needed cols
    line_items_df = line_items_df[[
        'id', 'year', 'level', 'state', RACE, 'first_name', 'last_name', 'position']]

    # standardize CAWP state names as postal
    line_items_df[std_col.STATE_POSTAL_COL] = line_items_df["state"].apply(
        get_postal_from_cawp_phrase)

    # merge in FIPS codes
    line_items_df = merge_utils.merge_state_ids(
        line_items_df, keep_postal=True)

    line_items_df = line_items_df.drop(columns=["state"])

    # rename year
    line_items_df = line_items_df.rename(
        columns={"year": std_col.TIME_PERIOD_COL})

    # make all CAWP comma-delimited race(s) strings into lists
    line_items_df[RACE] = [x.split(", ")
                           for x in line_items_df[RACE]]

    # remove non-Congress line items
    line_items_df_us_congress = line_items_df.loc[line_items_df['level']
                                                  == 'Congress']

    # consolidate name columns
    line_items_df_us_congress["name"] = (
        line_items_df_us_congress["position"] + " " +
        line_items_df_us_congress["first_name"] + " " +
        line_items_df_us_congress["last_name"]
    )
    line_items_df_us_congress = line_items_df_us_congress.drop(
        columns=["first_name", "last_name", "position"])

    # get lists of names of WOMEN per year/state regardless of race for the "All"
    line_items_df_us_congress_alls_df = line_items_df_us_congress[[
        std_col.STATE_FIPS_COL,
        std_col.STATE_NAME_COL,
        std_col.STATE_POSTAL_COL,
        std_col.TIME_PERIOD_COL,
        "name",
    ]]

    line_items_df_us_congress_alls_df = line_items_df_us_congress_alls_df.groupby(
        [
            std_col.STATE_FIPS_COL,
            std_col.STATE_NAME_COL,
            std_col.STATE_POSTAL_COL,
            std_col.TIME_PERIOD_COL,
        ])["name"].apply(list).reset_index()

    line_items_df_us_congress_alls_df = line_items_df_us_congress_alls_df.rename(columns={
        "name": "women_all_races_us_congress_names"})

    # count the names to generate the total number of women of ANY race, per state/year,
    # to be used later as the numerator AND denominator in rate calculations
    line_items_df_us_congress_alls_df['women_all_races_us_congress_count'] = line_items_df_us_congress_alls_df['women_all_races_us_congress_names'].apply(
        lambda list: len(list))

    # treat the ALLs like they are a race
    line_items_df_us_congress_alls_df[RACE] = "All"
    line_items_df_us_congress_alls_df["women_this_race_us_congress_names"] = line_items_df_us_congress_alls_df["women_all_races_us_congress_names"]
    line_items_df_us_congress_alls_df["women_this_race_us_congress_count"] = line_items_df_us_congress_alls_df["women_all_races_us_congress_count"]

    # merge COLUMNS with ALL WOMEN counts and names into the unexploded df so these totals will be available on every row
    merge_cols = [
        std_col.STATE_FIPS_COL,
        std_col.TIME_PERIOD_COL
    ]
    line_items_df_us_congress = pd.merge(line_items_df_us_congress, line_items_df_us_congress_alls_df[[
        std_col.STATE_FIPS_COL,
        std_col.TIME_PERIOD_COL,
        "women_all_races_us_congress_count",
        'women_all_races_us_congress_names'
    ]], on=merge_cols)

    # later we will again merge the ALL WOMEN data as ALL RACE rows

    # explode those race lists with one row per race
    line_items_df_us_congress = line_items_df_us_congress.explode(
        RACE).reset_index(drop=True)

    line_items_df_us_congress = line_items_df_us_congress[[
        "time_period",
        "race_ethnicity",
        "state_postal",
        "state_fips",
        "state_name",
        "name",
        "women_all_races_us_congress_count",
        "women_all_races_us_congress_names"
    ]]

    # need to convert lists to tuples for df manipulation
    line_items_df_us_congress["women_all_races_us_congress_names"] = line_items_df_us_congress["women_all_races_us_congress_names"].map(
        tuple)

    # combine rows, adding a columns with lists of all WOMEN legislators for that race/state/year
    line_items_df_us_congress = line_items_df_us_congress.groupby(
        [
            "time_period",
            "race_ethnicity",
            "state_postal",
            "state_fips",
            "state_name",
            "women_all_races_us_congress_count",
            "women_all_races_us_congress_names"
        ])["name"].apply(list).reset_index()
    line_items_df_us_congress = line_items_df_us_congress.rename(columns={
        "name": "women_this_race_us_congress_names"})

    # count the names to generate the total number of women per race/state/year,
    # to be used later as the numerator in rate calculations
    line_items_df_us_congress['women_this_race_us_congress_count'] = line_items_df_us_congress['women_this_race_us_congress_names'].apply(
        lambda list: len(list))

    # need to convert tuples back to lists
    line_items_df_us_congress["women_all_races_us_congress_names"] = line_items_df_us_congress["women_all_races_us_congress_names"].map(
        list)

    # combine line items BY RACE with line item ROWS for ALL RACES calculated earlier
    # print("race")
    # print(line_items_df_us_congress)
    # print("all")
    # print(line_items_df_us_congress_alls_df)

    line_items_df_us_congress = pd.concat(
        [line_items_df_us_congress, line_items_df_us_congress_alls_df], ignore_index=True)

    # explode incoming df with totals to include rows per race incl. All, (per state per year)

    races_including_all = list(
        CAWP_RACE_GROUPS_TO_STANDARD.keys()) + ["All"]
    df[RACE] = [races_including_all] * len(df)
    df = df.explode(RACE)

    # merge CAWP counts with incoming df per race/year/state
    merge_cols = [
        std_col.TIME_PERIOD_COL,
        RACE,
        std_col.STATE_POSTAL_COL,
        std_col.STATE_NAME_COL,
        std_col.STATE_FIPS_COL
    ]
    df = pd.merge(
        df, line_items_df_us_congress, on=merge_cols, how="left")

    # state/race/years with NO WOMEN should have counts as zero and names as empty string, not null
    df["women_this_race_us_congress_count"] = df["women_this_race_us_congress_count"].fillna(
        0)
    df["women_all_races_us_congress_count"] = df["women_all_races_us_congress_count"].fillna(
        0)
    df["women_this_race_us_congress_names"] = df["women_this_race_us_congress_names"].fillna(
        "")
    df["women_all_races_us_congress_names"] = df["women_all_races_us_congress_names"].fillna(
        "")

    return df
