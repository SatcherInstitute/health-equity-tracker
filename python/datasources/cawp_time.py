from datasources.data_source import DataSource
from ingestion.constants import NATIONAL_LEVEL, STATE_LEVEL, STATE_LEVEL_FIPS_LIST, US_ABBR
import ingestion.standardized_columns as std_col
from ingestion import gcs_to_bq_util, merge_utils
import pandas as pd


US_CONGRESS_CURRENT_URL = "https://theunitedstates.io/congress-legislators/legislators-current.json"
US_CONGRESS_HISTORICAL_URL = "https://theunitedstates.io/congress-legislators/legislators-historical.json"

CAWP_LINE_ITEMS_FILE = "cawp-by_race_and_ethnicity_time_series.csv"


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
            time_periods = ["2018", "2019", "2020", "2021", "2022"]

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

            us_congress_total_count_df["total_us_congress_count"] = 1
            us_congress_total_count_df = us_congress_total_count_df.groupby(
                [std_col.STATE_POSTAL_COL, std_col.TIME_PERIOD_COL])["total_us_congress_count"].count().reset_index()

            # merge in FIPS codes
            us_congress_total_count_df = merge_utils.merge_state_fips_codes(
                us_congress_total_count_df, keep_postal=True)

            # merge in calculated counts by state/year
            merge_cols = [std_col.TIME_PERIOD_COL, std_col.STATE_FIPS_COL]
            df = pd.merge(df, us_congress_total_count_df, on=merge_cols)

            ###

            # load in CAWP counts of women by race by year by state
            line_items_df = gcs_to_bq_util.load_csv_as_df_from_data_dir(
                'cawp', CAWP_LINE_ITEMS_FILE)

            # keep only needed cols
            line_items_df = line_items_df[[
                'year', 'level', 'state', 'race_ethnicity']]

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

            # explode those race lists with one row per race
            line_items_df = line_items_df.explode(
                "race_ethnicity").reset_index(drop=True)

            line_items_df_us_congress = line_items_df.loc[line_items_df['level']
                                                          == 'Congress']

            # # TODO make this counting rows concept a util fn
            line_items_df_us_congress['women_us_congress_count'] = 1

            line_items_df_us_congress = line_items_df_us_congress.groupby([std_col.STATE_FIPS_COL, std_col.STATE_POSTAL_COL, "race_ethnicity", 'level', std_col.TIME_PERIOD_COL])[
                "women_us_congress_count"].count().reset_index()

            line_items_df_us_congress = line_items_df_us_congress.drop(
                'level', axis="columns")

            merge_cols = [std_col.TIME_PERIOD_COL,
                          std_col.STATE_FIPS_COL,
                          std_col.STATE_POSTAL_COL]
            df = pd.merge(df, line_items_df_us_congress, on=merge_cols)

            # calculate rates of representation
            df[std_col.WOMEN_US_CONGRESS_PCT] = round(df["women_us_congress_count"] /
                                                      df["total_us_congress_count"] * 100, 1)
            # df[std_col.WOMEN_US_CONGRESS_PCT_SHARE] = df["women_us_congress_count"] / need to get "ALL"

            gcs_to_bq_util.add_df_to_bq(
                df, dataset, table_name)
