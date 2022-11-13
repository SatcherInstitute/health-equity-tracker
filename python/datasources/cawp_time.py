from datasources.data_source import DataSource
from ingestion.constants import NATIONAL_LEVEL, STATE_LEVEL, STATE_LEVEL_FIPS_LIST, US_ABBR, US_FIPS, US_NAME
import ingestion.standardized_columns as std_col
from ingestion import gcs_to_bq_util, merge_utils
from ingestion.standardized_columns import Race
import pandas as pd
import numpy as np

FIRST_YR = 2019
LAST_YR = 2022

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

            # restrict index years to this list
            time_periods = [str(x) for x in list(range(FIRST_YR, LAST_YR + 1))]

            # for BQ
            table_name = f'race_and_ethnicity_{geo_level}'

            # start with single column of all state-level fips as our df template
            df = pd.DataFrame({
                std_col.STATE_FIPS_COL: [*STATE_LEVEL_FIPS_LIST],
            })

            # explode to every combo of state/year
            df[std_col.TIME_PERIOD_COL] = [time_periods] * len(df)
            df = df.explode(std_col.TIME_PERIOD_COL).reset_index(drop=True)

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
                        if year in time_periods and entry not in us_congress_totals_list_of_dict:
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

            # merge in FIPS codes to the scaffold df
            df = merge_utils.merge_state_ids(df, keep_postal=True)

            # merge in FIPS codes to the CONGRESS TOTALS df
            us_congress_total_count_df = merge_utils.merge_state_ids(
                us_congress_total_count_df, keep_postal=True)

            # merge in calculated counts by state/year where they exist;
            # fill with 0 counts where no info available
            merge_cols = [std_col.TIME_PERIOD_COL, std_col.STATE_FIPS_COL,
                          std_col.STATE_NAME_COL, std_col.STATE_POSTAL_COL]

            df = pd.merge(df, us_congress_total_count_df,
                          on=merge_cols, how="left").fillna(0)

            # explode with a new row per race
            df[RACE] = [
                list(CAWP_RACE_GROUPS_TO_STANDARD.keys())
            ] * len(df)
            df = df.explode(RACE)

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

            # line_items_df_us_congress_name_lists = line_items_df_us_congress.groupby(
            #     [std_col.STATE_POSTAL_COL, std_col.TIME_PERIOD_COL])["name"].apply(list).reset_index()
            # line_items_df_us_congress_name_lists = line_items_df_us_congress_name_lists.rename(columns={
            #     "name": "congress_names_women"})
            # print(line_items_df_us_congress_name_lists)

            # count the number of women leg. per year/state regardless of race for the "All"
            line_items_alls_count_df = line_items_df_us_congress[[
                std_col.STATE_FIPS_COL, std_col.STATE_POSTAL_COL, std_col.STATE_NAME_COL, std_col.TIME_PERIOD_COL]]
            line_items_alls_count_df['women_any_race_us_congress_count'] = 1
            line_items_alls_count_df = line_items_alls_count_df.groupby([std_col.STATE_FIPS_COL, std_col.STATE_POSTAL_COL, std_col.STATE_NAME_COL, std_col.TIME_PERIOD_COL])[
                "women_any_race_us_congress_count"].count().reset_index()

            # explode those race lists with one row per race
            line_items_df_us_congress = line_items_df_us_congress.explode(
                RACE).reset_index(drop=True)

            # count the number of women leg. per year/state/race
            # # # TODO make this counting rows concept a util fn
            line_items_df_us_congress_counts_per_race = line_items_df_us_congress[[
                "time_period",
                std_col.STATE_NAME_COL,
                std_col.STATE_FIPS_COL,
                std_col.STATE_POSTAL_COL,
                RACE,
                "level"
            ]]

            line_items_df_us_congress_counts_per_race['women_by_race_us_congress_count'] = 1
            line_items_df_us_congress_counts_per_race = line_items_df_us_congress_counts_per_race.groupby([
                std_col.STATE_NAME_COL,
                std_col.STATE_FIPS_COL,
                std_col.STATE_POSTAL_COL,
                RACE,
                'level',
                std_col.TIME_PERIOD_COL,
            ])[
                "women_by_race_us_congress_count"].count().reset_index()

            line_items_df_us_congress = line_items_df_us_congress.drop(
                'level', axis="columns")

            merge_cols = [std_col.TIME_PERIOD_COL,
                          std_col.STATE_NAME_COL,
                          std_col.STATE_FIPS_COL,
                          std_col.STATE_POSTAL_COL]
            df = pd.merge(
                df, line_items_df_us_congress_counts_per_race, on=merge_cols)

            # combine names by race for WOMEN legislators
            line_items_df_us_congress_name_lists_by_race = line_items_df_us_congress.groupby(
                [std_col.STATE_POSTAL_COL, std_col.TIME_PERIOD_COL, RACE])["name"].apply(list).reset_index()
            line_items_df_us_congress_name_lists_by_race = line_items_df_us_congress_name_lists_by_race.rename(columns={
                "name": "congress_names_women"})

            # print(line_items_alls_count_df)

            # merge in the ALL totals as a column here for calculations (later we merge as "ALL" rows)
            merge_cols = [std_col.TIME_PERIOD_COL,
                          std_col.STATE_NAME_COL,
                          std_col.STATE_FIPS_COL,
                          std_col.STATE_POSTAL_COL,
                          RACE
                          ]
            df = pd.merge(df, line_items_alls_count_df,
                          on=merge_cols, how="left").fillna(0)

            print(df)

            # merge the individual race rows
            merge_cols = [std_col.TIME_PERIOD_COL,
                          RACE,
                          std_col.STATE_FIPS_COL,
                          std_col.STATE_NAME_COL,
                          std_col.STATE_POSTAL_COL]
            df = pd.merge(df, line_items_df_us_congress,
                          on=merge_cols, how="left").fillna(0)

            # merge in the name lists per race
            line_items_df_us_congress_name_lists_by_race = line_items_df_us_congress_name_lists_by_race.rename(columns={
                "name": "congress_names_women"})

            # print(line_items_df_us_congress_name_lists_by_race)
            merge_cols = [std_col.TIME_PERIOD_COL,
                          RACE,
                          std_col.STATE_POSTAL_COL]

            df = pd.merge(
                df, line_items_df_us_congress_name_lists_by_race, on=merge_cols)

            if geo_level == NATIONAL_LEVEL:
                df_national_sum = df.groupby(
                    [RACE,
                     std_col.TIME_PERIOD_COL
                     ])[
                    "total_us_house_count",
                    "total_us_senate_count",
                    "total_us_congress_count",
                    "women_any_race_us_congress_count",
                    "women_by_race_us_congress_count"
                ].sum().reset_index()
                df_national_sum[std_col.STATE_FIPS_COL] = US_FIPS
                df_national_sum[std_col.STATE_NAME_COL] = US_NAME
                df_national_sum[std_col.STATE_POSTAL_COL] = US_ABBR

                merge_cols = [
                    std_col.TIME_PERIOD_COL,
                    RACE,
                ]

                # create national list of lists of names
                df_national_listed_congress_names = df.groupby(
                    [std_col.TIME_PERIOD_COL, RACE])["congress_names_all"].apply(list).reset_index()
                # flatten lists of lists
                df_national_listed_congress_names["congress_names_all"] = df_national_listed_congress_names["congress_names_all"].apply(
                    lambda nested_list: [item for sublist in nested_list for item in sublist])

                df = pd.merge(df_national_sum, df_national_listed_congress_names,
                              on=merge_cols)

            # calculate rates of representation

            df[std_col.PCT_SHARE_OF_US_CONGRESS] = round(df["women_by_race_us_congress_count"] /
                                                         df["total_us_congress_count"] * 100, 1)
            df[std_col.PCT_SHARE_OF_WOMEN_US_CONGRESS] = round(df["women_by_race_us_congress_count"] /
                                                               df["women_any_race_us_congress_count"] * 100, 1).fillna(0)

            # melt the women_any_race_us_congress_count column into new "All" race rows
            # The "All" values per year are present in every race's rows; so just use one set of race rows to melt
            df_alls = df[df[RACE] == "White"]

            # Remove unneeded columns
            df_alls = df_alls[[
                std_col.TIME_PERIOD_COL,
                std_col.STATE_FIPS_COL,
                std_col.STATE_NAME_COL,
                std_col.STATE_POSTAL_COL,
                "total_us_house_count",
                "total_us_senate_count",
                "total_us_congress_count",
                "women_any_race_us_congress_count",
                "women_by_race_us_congress_count",

            ]]

            # take the "All" count from being shown via column to being shown as new "All" race rows
            df_alls = df_alls.melt(id_vars=[
                std_col.TIME_PERIOD_COL,
                std_col.STATE_FIPS_COL,
                std_col.STATE_NAME_COL,
                std_col.STATE_POSTAL_COL,
                "total_us_house_count",
                "total_us_senate_count",
                "total_us_congress_count",
            ],
                value_vars=["women_any_race_us_congress_count"],
                var_name=RACE,

                value_name="women_by_race_us_congress_count"
            )

            df_alls = df_alls[[
                RACE,
                std_col.TIME_PERIOD_COL,
                std_col.STATE_FIPS_COL,
                std_col.STATE_NAME_COL,
                std_col.STATE_POSTAL_COL,
                "total_us_house_count",
                "total_us_senate_count",
                "total_us_congress_count",
                "women_by_race_us_congress_count",
            ]]

            df_alls[RACE] = "All"

            # calculate rates of representation for "All"
            df_alls[std_col.PCT_SHARE_OF_US_CONGRESS] = round(df_alls["women_by_race_us_congress_count"] /
                                                              df_alls["total_us_congress_count"] * 100, 1)
            df_alls[std_col.PCT_SHARE_OF_WOMEN_US_CONGRESS] = round(df_alls["women_by_race_us_congress_count"] /
                                                                    df_alls["women_by_race_us_congress_count"] * 100, 1).fillna(0)

            # append the "All" rows to the race rows
            df = pd.concat(
                [df.drop(columns=["women_any_race_us_congress_count"]), df_alls], axis=0, ignore_index=True)

            # standardize race labels
            df[std_col.RACE_CATEGORY_ID_COL] = df[RACE].apply(
                lambda x: "ALL" if x == "All" else CAWP_RACE_GROUPS_TO_STANDARD[x])
            std_col.add_race_columns_from_category_id(df)
            df = df.drop(columns=[RACE])

            df = df.sort_values(
                by=[std_col.STATE_FIPS_COL, std_col.TIME_PERIOD_COL, std_col.RACE_CATEGORY_ID_COL]).reset_index(drop=True)

            gcs_to_bq_util.add_df_to_bq(
                df, dataset, table_name)
