import pandas as pd

from ingestion.standardized_columns import Race
import ingestion.standardized_columns as std_col

from datasources.data_source import DataSource
from ingestion import gcs_to_bq_util

CAWP_RACE_GROUPS_TO_STANDARD = {
    'Asian American/Pacific Islander': Race.ASIAN_PAC_NH.value,
    'Latina': Race.HISP_F.value,
    'Middle Eastern/North African': Race.MENA_NH.value,
    # currently reporting MULTI as the sum of "Multiracial Alone" +
    # women who chose multiple specific races
    'Multiracial Alone': Race.MULTI_NH.value,
    'Native American/Alaska Native/Native Hawaiian': Race.AIANNH_NH.value,
    'Black': Race.BLACK_NH.value,
    'White': Race.WHITE_NH.value,
    'Unavailable': Race.UNKNOWN.value,
    'All': Race.ALL.value,
}

CAWP_DATA_TYPES = {
    "state": ["Territorial/D.C.", "State Legislative"],
    "us": ["Congress"],
}


def swap_territory_abbr(abbr: str):
    """Replaces mismatched territory codes between TOTAL and LINE LEVEL files """
    abbr_swaps = {"AS": "AM", "MP": "MI"}

    if abbr in abbr_swaps:
        abbr = abbr_swaps.get(abbr)

    return abbr


def clean(datum: str):
    """Returns the string with any asterisks and/r italics markup removed """
    return datum.replace("<i>", "").replace("</i>", "").replace("*", "")


def get_pretty_pct(proportion: float):
    """ Takes a proportion float (between 0 and 1) and converts to a string
    representing the pct equivalent, with a maximum of 2 significant digits
    and no trailing zeros """
    pct = proportion * 100
    pct_rounded = float(str(round(pct, 2)))
    return f'{pct_rounded:g}'


# 2 TABLES FOR STATE-LEVEL CONGRESSES
# LINE ITEM numbers
# table includes breakdown of women by race by state by level,
# but doesn't include total legislature numbers
CAWP_LINE_ITEMS_PATH = "../../data/cawp/cawp_line_items.csv"
# this URL could be used for an API endpoint but needs authentication
# CAWP_LINE_ITEMS_URL = ("https://cawpdata.rutgers.edu/women-elected-officials/"
#    "race-ethnicity/export-roles/csv?current=1&yearend_filter=All"
#    "&level%5B0%5D=Federal%20Congress&level%5B1%5D=State%20Legislative"
#    "&level%5B2%5D=Territorial/DC%20Legislative&items_per_page=50"
#    "&page&_format=csv")

# TOTAL state_legislature numbers
# WEBSITE FOR TOTALS https://cawp.rutgers.edu/facts/levels-office/state-legislature/women-state-legislatures-2022#table
CAWP_TOTALS_URL = "https://cawp.rutgers.edu/tablefield/export/paragraph/1028/field_table/und/0"


class CAWPData(DataSource):

    @staticmethod
    def get_id():
        return 'CAWP_DATA'

    @staticmethod
    def get_table_name():
        return 'cawp_data'

    def upload_to_gcs(self, _, **attrs):
        raise NotImplementedError(
            'upload_to_gcs should not be called for CAWPData')

    def write_to_bq(self, dataset, gcs_bucket, **attrs):

        # read LINE ITEM with women leg by race / level / state
        # df_line_items = gcs_to_bq_util.load_csv_as_dataframe_from_web(
        #     CAWP_LINE_ITEMS_URL)

        # read needed files directly from /data rather than external URLs
        # df_totals = gcs_to_bq_util.load_csv_as_dataframe_from_path(
        #     "../../data/cawp/cawp_totals.csv")
        df_line_items = gcs_to_bq_util.load_csv_as_dataframe_from_path(
            "../../data/cawp/cawp_line_items.csv")

        # load in table with % of women legislators for /state
        df_totals = gcs_to_bq_util.load_csv_as_dataframe_from_web(
            CAWP_TOTALS_URL)

        # load in ACS population by race
        df_pop = gcs_to_bq_util.load_dataframe_from_bigquery(
            'acs_population', 'by_race_state_std', dtype={'state_fips': str})

        # make table by race
        breakdown_df = self.generate_breakdown(
            df_totals, df_line_items, df_pop)

        # set column types
        column_types = {c: 'STRING' for c in breakdown_df.columns}
        column_types[std_col.WOMEN_STATE_LEG_PCT] = 'STRING'
        column_types[std_col.RACE_INCLUDES_HISPANIC_COL] = 'BOOL'

        gcs_to_bq_util.add_dataframe_to_bq(
            breakdown_df, dataset, std_col.RACE_OR_HISPANIC_COL, column_types=column_types)

    def generate_breakdown(self, df_totals, df_line_items, df_pop):

        print(df_pop.to_string())

        # for LINE ITEM CSV
        # split 'state' into a map of 'state 2 letter code' : 'statename'
        state_code_map = {}
        for state in df_line_items['state'].dropna():
            state_terms = state.split(" - ")
            state_code_map[state_terms[1]] = state_terms[0]

        # for TOTALS CSV cleanup state codes
        total_state_keys = df_totals['State'].drop_duplicates().to_list()

        output = []

        # set column names
        columns = [std_col.STATE_NAME_COL, std_col.WOMEN_STATE_LEG_PCT]
        columns.append(std_col.RACE_CATEGORY_ID_COL)

        # tally all states/territories to get national state legislature totals (all genders) and total women by race
        us_tally = {"total": 0}
        for race in CAWP_RACE_GROUPS_TO_STANDARD.keys():
            us_tally[race] = 0

        for state_key in total_state_keys:

            # remove any formatting and coordinate territory abbreviations
            state_abbr = swap_territory_abbr(clean(state_key))

            state = state_code_map[state_abbr]

            # find row containing TOTAL LEGISLATORS for every state
            matched_row = df_totals.loc[
                (df_totals['State'] == state_key)]
            total_women_by_total_legislators = clean(
                matched_row["Total Women/Total Legislators"].values[0])
            total_women_legislators = int(total_women_by_total_legislators.split(
                "/")[0])
            total_legislators = int(total_women_by_total_legislators.split(
                "/")[1])

            # tally national total of women legislators of all races and
            # total of all state leg of any gender (denominator)
            us_tally["All"] += total_women_legislators
            us_tally["total"] += total_legislators

            # this states total population (all genders, all races)
            state_total_pop_row = df_pop[
                (df_pop['state_name'] == state) &
                (df_pop['race'] == std_col.TOTAL_VALUE)
            ]
            # print("\n", state_total_pop_row)
            # print("\n", state_total_pop_row["population"].values)

            for race in CAWP_RACE_GROUPS_TO_STANDARD.keys():

                output_row = {}
                output_row[std_col.STATE_NAME_COL] = state
                output_row[std_col.RACE_CATEGORY_ID_COL] = CAWP_RACE_GROUPS_TO_STANDARD[race]

                if race == "All":
                    # get TOTAL pct from TOTAL csv file
                    pct_women_leg = str(clean(
                        matched_row['%Women Overall'].values[0]))

                else:
                    # calc BY RACE pct_women_leg from LINE ITEM csv file
                    num_matches = len(df_line_items[
                        (df_line_items['state'] == f"{state} - {state_abbr}") &
                        # any of her races match current race iteration
                        (df_line_items['race_ethnicity'].str.contains(race)) &
                        (df_line_items['level'].isin(CAWP_DATA_TYPES['state']))
                    ])

                    # sum "Multiracial Alone" women w/ women who identify with
                    #  multiple specific races
                    # (eg ["White","Black"]) with ["Multiracial Alone"]
                    if race == "Multiracial Alone":
                        num_matches += len(df_line_items[
                            (df_line_items['state'] == f"{state} - {state_abbr}") &
                            # comma delimiter signifies multiple races
                            (df_line_items['race_ethnicity'].str.contains(", ")) &
                            (df_line_items['level'].isin(
                                CAWP_DATA_TYPES['state']))
                        ])

                    # tally national level of each race's # women state leg (numerator)
                    us_tally[race] += num_matches

                    # calculate % of {race} women for this state
                    pct_women_leg = get_pretty_pct(
                        num_matches / total_legislators)

                    # calculate this race's % of population in this state

                    # pct_race_in_state_pop =

                # set pct_women_leg for this state
                output_row[std_col.WOMEN_STATE_LEG_PCT] = pct_women_leg

                # add state row to output
                output.append(output_row)

        # calc national totals by race (for all state legislatures combined)
        for race in CAWP_RACE_GROUPS_TO_STANDARD.keys():

            us_output_row = {}
            us_output_row[std_col.STATE_NAME_COL] = "United States"

            # set RACE
            us_output_row[std_col.RACE_CATEGORY_ID_COL] = CAWP_RACE_GROUPS_TO_STANDARD[race]

            # set %
            pct_women_leg = get_pretty_pct(us_tally[race] / us_tally['total'])
            us_output_row[std_col.WOMEN_STATE_LEG_PCT] = pct_women_leg

            # treat US like a state
            output.append(us_output_row)

        output_df = pd.DataFrame(output, columns=columns)

        std_col.add_race_columns_from_category_id(output_df)

        return output_df
