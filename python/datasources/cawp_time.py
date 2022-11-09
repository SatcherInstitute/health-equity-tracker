from datasources.data_source import DataSource
from ingestion.constants import NATIONAL_LEVEL, STATE_LEVEL, STATE_LEVEL_FIPS_LIST, US_ABBR
import ingestion.standardized_columns as std_col
from ingestion import gcs_to_bq_util, merge_utils
from ingestion.standardized_columns import Race
import pandas as pd


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
    'All': Race.ALL.value
}


def get_postal_from_cawp_phrase(cawp_place_phrase: str):
    """ Accepts a CAWP place phrase found in the LINE ITEM table
    `{STATE_COL_LINE NAME} - {CODE}` with the standard 2 letter code
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

        # for geo_level in [STATE_LEVEL, NATIONAL_LEVEL]:
        for geo_level in [STATE_LEVEL]:

            # restrict index years to this list
            # time_periods = ["2021", "2022"]
            time_periods_ints = list(range(2021, 2022))
            time_periods = [str(x) for x in time_periods_ints]

            # for BQ
            table_name = f'race_and_ethnicity_{geo_level}'

            # start with single column of all state-level fips as our df template
            df = pd.DataFrame(
                {
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
            for item in raw_legislators_json:

                # and each term they served
                for term in item["terms"]:

                    term_years = list(
                        range(int(term["start"][:4]), int(term["end"][:4])+1))
                    # and each year of each term
                    for year in term_years:

                        year = str(year)

                        entry = {
                            "id": item["id"]["govtrack"],
                            "type": term["type"],
                            std_col.STATE_POSTAL_COL: term["state"],
                            std_col.TIME_PERIOD_COL: year
                        }

                        if year in time_periods and entry not in us_congress_totals_list_of_dict:
                            # add entry of service for id/year/state. this should avoid double counting and match CAWP which only has one entry per legislator per year
                            us_congress_totals_list_of_dict.append(entry)

                        # and to the national count
                        # us_congress_totals_list_of_dict.append({
                        #     std_col.STATE_POSTAL_COL: US_ABBR,
                        #     std_col.TIME_PERIOD_COL: year
                        # })

                        # convert to df
            us_congress_total_count_df = pd.DataFrame.from_dict(
                us_congress_totals_list_of_dict)

            # convert giant list of duplicate state/year entries into a new column with the counts for each state/year combo
            # us_congress_total_count_df = us_congress_total_count_df.groupby(
            #     [std_col.STATE_POSTAL_COL, std_col.TIME_PERIOD_COL]).size().reset_index().rename(
            #     columns={0: 'total_us_congress_count'})

            # us_congress_total_count_df["total_us_congress_count"] = 1

            us_house_total_count_df = us_congress_total_count_df[
                us_congress_total_count_df["type"] == "rep"]
            us_house_total_count_df["total_us_house_count"] = 1
            us_house_total_count_df = us_house_total_count_df.groupby(
                [std_col.STATE_POSTAL_COL, std_col.TIME_PERIOD_COL])["total_us_house_count"].count().reset_index()

            us_senate_total_count_df = us_congress_total_count_df[
                us_congress_total_count_df["type"] == "sen"]
            us_senate_total_count_df["total_us_senate_count"] = 1
            us_senate_total_count_df = us_senate_total_count_df.groupby(
                [std_col.STATE_POSTAL_COL, std_col.TIME_PERIOD_COL])["total_us_senate_count"].count().reset_index()

            merge_cols = [std_col.TIME_PERIOD_COL, std_col.STATE_POSTAL_COL]
            us_congress_total_count_df = pd.merge(
                us_house_total_count_df, us_senate_total_count_df, on=merge_cols)
            us_congress_total_count_df["total_us_congress_count"] = (
                us_congress_total_count_df["total_us_senate_count"] +
                us_congress_total_count_df["total_us_house_count"]
            )

            # merge in FIPS codes
            us_congress_total_count_df = merge_utils.merge_state_fips_codes(
                us_congress_total_count_df, keep_postal=True)

            # merge in calculated counts by state/year
            merge_cols = [std_col.TIME_PERIOD_COL, std_col.STATE_FIPS_COL]
            df = pd.merge(df, us_congress_total_count_df, on=merge_cols)

            # explode with row per race
            df['race_ethnicity'] = [
                list(CAWP_RACE_GROUPS_TO_STANDARD.keys())
            ] * len(df)
            df = df.explode('race_ethnicity').fillna("")

            ###

            # load in CAWP counts of women by race by year by state
            line_items_df = gcs_to_bq_util.load_csv_as_df_from_data_dir(
                'cawp', CAWP_LINE_ITEMS_FILE)

            # keep only needed cols
            line_items_df = line_items_df[[
                'id', 'year', 'level', 'state', 'race_ethnicity']]

            # standardize CAWP state names as postal
            line_items_df[std_col.STATE_POSTAL_COL] = line_items_df["state"].apply(
                get_postal_from_cawp_phrase)

            # merge in FIPS codes
            line_items_df = merge_utils.merge_state_fips_codes(
                line_items_df, keep_postal=True)

            line_items_df = line_items_df.drop(columns=["state", "state_name"])

            # rename year
            line_items_df = line_items_df.rename(
                columns={"year": std_col.TIME_PERIOD_COL})

            # make all race comma-delimited strings into lists
            line_items_df["race_ethnicity"] = [x.split(", ")
                                               for x in line_items_df["race_ethnicity"]]

            # remove non-Congress line items
            line_items_df_us_congress = line_items_df.loc[line_items_df['level']
                                                          == 'Congress']

            # count the number of women leg. per year/state regardless of race for the "All"
            line_items_alls_count_df = line_items_df_us_congress[[
                std_col.STATE_FIPS_COL, std_col.STATE_POSTAL_COL, std_col.TIME_PERIOD_COL]]
            line_items_alls_count_df['women_any_race_us_congress_count'] = 1
            line_items_alls_count_df = line_items_alls_count_df.groupby([std_col.STATE_FIPS_COL, std_col.STATE_POSTAL_COL, std_col.TIME_PERIOD_COL])[
                "women_any_race_us_congress_count"].count().reset_index()

            # count the number of women leg. per year/state/race
            # explode those race lists with one row per race
            line_items_df_us_congress = line_items_df_us_congress.explode(
                "race_ethnicity").reset_index(drop=True)

            # # TODO make this counting rows concept a util fn
            line_items_df_us_congress['women_by_race_us_congress_count'] = 1
            line_items_df_us_congress = line_items_df_us_congress.groupby([std_col.STATE_FIPS_COL, std_col.STATE_POSTAL_COL, "race_ethnicity", 'level', std_col.TIME_PERIOD_COL])[
                "women_by_race_us_congress_count"].count().reset_index()

            line_items_df_us_congress = line_items_df_us_congress.drop(
                'level', axis="columns")

            # merge in the ALL totals as a column here for calculations (later we can merge as rows with race = All)

            merge_cols = [std_col.TIME_PERIOD_COL,
                          std_col.STATE_FIPS_COL,
                          std_col.STATE_POSTAL_COL]
            df = pd.merge(df, line_items_alls_count_df,
                          on=merge_cols, how="left").fillna(0)

            merge_cols = [std_col.TIME_PERIOD_COL,
                          "race_ethnicity",
                          std_col.STATE_FIPS_COL,
                          std_col.STATE_POSTAL_COL]
            df = pd.merge(df, line_items_df_us_congress,
                          on=merge_cols, how="left").fillna(0)

            # calculate rates of representation
            df[std_col.PCT_SHARE_OF_US_CONGRESS] = round(df["women_by_race_us_congress_count"] /
                                                         df["total_us_congress_count"] * 100, 1)
            df[std_col.PCT_SHARE_OF_WOMEN_US_CONGRESS] = round(df["women_by_race_us_congress_count"] /
                                                               df["women_any_race_us_congress_count"] * 100, 1).fillna(0)

            df[std_col.RACE_CATEGORY_ID_COL] = df["race_ethnicity"].apply(
                lambda x: CAWP_RACE_GROUPS_TO_STANDARD[x])

            std_col.add_race_columns_from_category_id(df)

            df = df.drop(columns=["race_ethnicity"])

            print(df.to_string())

            # need to merge in the "All" races as ROWS

            gcs_to_bq_util.add_df_to_bq(
                df, dataset, table_name)
