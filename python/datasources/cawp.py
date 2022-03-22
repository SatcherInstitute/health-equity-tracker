import pandas as pd

from ingestion.standardized_columns import Race
import ingestion.standardized_columns as std_col

from datasources.data_source import DataSource
from ingestion import gcs_to_bq_util
from ingestion.dataset_utils import merge_fips_codes, generate_pct_share_col

CAWP_RACE_GROUPS_TO_STANDARD = {
    'Asian American/Pacific Islander': Race.ASIAN_PAC_NH.value,
    'Latina': Race.HISP.value,
    'Middle Eastern/North African': Race.MENA_NH.value,
    # currently reporting MULTI as the sum of "Multiracial Alone" +
    # women who chose multiple specific races
    'Multiracial Alone': Race.MULTI.value,
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
    """Replaces mismatched territory abbreviations between TOTAL and LINE LEVEL files """
    return {"AS": "AM", "MP": "MI"}.get(abbr, abbr)


def swap_territory_name(territory_name: str):
    """Replaces mismatched territory names between ACS and CAWP files """
    return {"Virgin Islands": "U.S. Virgin Islands"}.get(territory_name, territory_name)


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


def count_matching_rows(df, state_phrase: str, gov_level: str, string_to_match: str):
    """ Accepts a dataframe, a level of government, a state phrase, and a string to match
    and counts the number of rows where where that string occurs in the race_ethnicity column  """
    return len(df[
        (df['state'] == state_phrase) &
        (df['race_ethnicity'].str.contains(string_to_match)) &
        (df['level'].isin(
            CAWP_DATA_TYPES[gov_level]))
    ])


def set_pop_metrics_by_race_in_state(output_row, df_pop, race_code: str, place_name: str):
    """ Accepts a output row object, a dataframe with populations,
    race name and state name, and returns that population

    output_row: object that  will receive a "population" metric and a "population_pct" metric
    df_pop: pandas dataframe with population by state/territory and race/ethnicity
    race_name: string of the race/ethnicity code (eg API_NH) to match to ACS `race_category_id` column
    place_name: string of the state/territory/USA to match to ACS's `state_name` columns
    """

    if race_code == "ALL":
        race_code = "TOTAL"

    matched_row = df_pop[(df_pop[std_col.STATE_NAME_COL] == place_name) &
                         (df_pop[std_col.RACE_CATEGORY_ID_COL] == race_code)]

    pop = matched_row[std_col.POPULATION_COL].values[0] if len(
        matched_row[std_col.POPULATION_COL].values) > 0 else None
    pop_pct = matched_row[std_col.POPULATION_PCT_COL].values[0] if len(
        matched_row[std_col.POPULATION_PCT_COL].values) > 0 else None

    output_row[std_col.POPULATION_COL] = pop
    output_row[std_col.POPULATION_PCT_COL] = pop_pct

    return output_row


# 2 TABLES FOR STATE-LEVEL CONGRESSES
# LINE ITEM numbers
# table includes breakdown of women by race by state by level,
# but doesn't include total legislature numbers
CAWP_LINE_ITEMS_FILE = "cawp-by_race_and_ethnicity.csv"
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

        # read needed files directly from /data rather than external URLs
        df_line_items = gcs_to_bq_util.load_csv_as_df_from_data_dir(
            'cawp', 'cawp-by_race_and_ethnicity.csv')

        # load in table with % of women legislators for /state
        df_totals = gcs_to_bq_util.load_csv_as_df_from_web(
            CAWP_TOTALS_URL)

        # load in ACS national populations by race
        df_acs_pop_national = gcs_to_bq_util.load_df_from_bigquery(
            'acs_population', 'by_race_national')

        print(df_acs_pop_national.to_string())

        # load in ACS states and puerto rico populations by race
        df_acs_pop_state = gcs_to_bq_util.load_df_from_bigquery(
            'acs_population', 'by_race_state_std', dtype={'state_fips': str})

        # print(df_acs_pop_state.to_string())

        # load in ACS 2010 territories' populations by race
        df_acs_2010_pop_territory = gcs_to_bq_util.load_df_from_bigquery(
            'acs_2010_population', 'by_race_and_ethnicity_territory', dtype={'state_fips': str})

        # print(df_acs_2010_pop_territory.to_string())

        # make table by race
        breakdown_df = self.generate_breakdown(
            df_totals, df_line_items, df_acs_pop_state, df_acs_pop_national, df_acs_2010_pop_territory)

        # set column types
        column_types = {c: 'STRING' for c in breakdown_df.columns}
        column_types[std_col.WOMEN_STATE_LEG_PCT] = 'STRING'
        column_types[std_col.RACE_INCLUDES_HISPANIC_COL] = 'BOOL'
        column_types[std_col.POPULATION_COL] = 'INT'
        column_types[std_col.POPULATION_PCT_COL] = 'FLOAT'

        gcs_to_bq_util.add_df_to_bq(
            breakdown_df, dataset, std_col.RACE_OR_HISPANIC_COL, column_types=column_types)

    def generate_breakdown(self, df_totals, df_line_items, df_acs_pop_state,
                           df_acs_pop_national, df_acs_2010_pop_territory):

        # list of states/territories FIPS we have population breakdowns for from ACS
        place_names_with_acs_pop = set(
            df_acs_pop_state[std_col.STATE_NAME_COL].to_list())

        territory_names_with_acs_2010_pop = set(
            df_acs_2010_pop_territory[std_col.STATE_NAME_COL].to_list())

        # race_codes_with_acs_pop = set(
        #     df_acs_pop_state[std_col.RACE_CATEGORY_ID_COL].to_list())

        # print("place_names_with_acs_pop", place_names_with_acs_pop)
        # print("territory_names_with_acs_2010_pop",
        #   territory_names_with_acs_2010_pop)
        # print("race_codes_with_acs_pop", race_codes_with_acs_pop)

        # for LINE ITEM CSV
        # split 'state' into a map of 'state 2 letter code' : 'statename'
        # NOTE: these values may contain formatting and must be cleaned before
        # placing into output df
        place_abbr_map = {}
        for place in df_line_items['state'].dropna():
            place_terms = place.split(" - ")
            place_abbr_map[place_terms[1]] = place_terms[0]

        # for TOTALS CSV cleanup state codes
        cawp_place_abbrs = df_totals['State'].drop_duplicates(
        ).to_list()

        cawp_place_abbrs.append("US")

        output = []

        # set output column names
        columns = [std_col.STATE_NAME_COL,
                   std_col.WOMEN_STATE_LEG_PCT,
                   std_col.POPULATION_COL,
                   std_col.POPULATION_PCT_COL,
                   std_col.RACE_CATEGORY_ID_COL]

        # initialize tally for national state legislature totals (all genders)
        us_tally = {"total_all_genders": 0}
        # initialize for and women by race (incl UNKNOWN and ALL = all women)
        for race_code in CAWP_RACE_GROUPS_TO_STANDARD.values():
            us_tally[race_code] = 0

        # ITERATE STATES / TERRITORIES / US
        for cawp_place_abbr in cawp_place_abbrs:

            print("PLACE", cawp_place_abbr)

            if cawp_place_abbr == "US":
                print("do USA stuff")
                place_name = "United States"

            else:
                clean_place_abbr = swap_territory_abbr(clean(cawp_place_abbr))
                cawp_place_name = place_abbr_map[clean_place_abbr]
                place_name = swap_territory_name(cawp_place_name)

                print(place_name)

                # find row containing TOTAL LEGISLATORS for every state
                matched_row = df_totals.loc[
                    (df_totals['State'] == cawp_place_abbr)]

                total_women_by_total_legislators = clean(
                    matched_row["Total Women/Total Legislators"].values[0])

                total_women_legislators = int(total_women_by_total_legislators.split(
                    "/")[0])
                total_legislators = int(total_women_by_total_legislators.split(
                    "/")[1])

                # tally national total of women legislators of all races and
                # total of all state leg of any gender (denominator)
                us_tally["ALL"] += total_women_legislators
                us_tally["total_all_genders"] += total_legislators

            for cawp_race_name in CAWP_RACE_GROUPS_TO_STANDARD.keys():

                race_code = CAWP_RACE_GROUPS_TO_STANDARD[cawp_race_name]

                print("\tRACE:", race_code)

                output_row = {}

                # set {cawp_race_name} population for this state/territory
                #     # set population totals nationally by race
                if place_name == "United States":
                    output_row = set_pop_metrics_by_race_in_state(
                        output_row, df_acs_pop_national, race_code, place_name)
                elif place_name in place_names_with_acs_pop:
                    output_row = set_pop_metrics_by_race_in_state(
                        output_row, df_acs_pop_state, race_code, place_name)
                elif place_name in territory_names_with_acs_2010_pop:
                    output_row = set_pop_metrics_by_race_in_state(
                        output_row, df_acs_2010_pop_territory, race_code, place_name)
                else:
                    output_row = {std_col.POPULATION_COL: None,
                                  std_col.POPULATION_PCT_COL: None}

                if cawp_race_name == std_col.ALL_VALUE:
                    # get TOTAL pct from TOTAL csv file
                    pct_women_leg = clean(
                        matched_row['%Women Overall'].values[0])

                else:
                    cawp_place_phrase = f"{place_name} - {swap_territory_abbr(clean(cawp_place_abbr))}"
                    print(cawp_place_phrase)
                    gov_level = "state"

                    # count the number of leg. who selected current race
                    num_matches = count_matching_rows(
                        df_line_items, cawp_place_phrase, gov_level, cawp_race_name)

                    # for MULTI sum "Multiracial Alone" women
                    #  w/ women who identify with multiple specific races
                    if cawp_race_name == "Multiracial Alone":
                        # comma delimiter signifies multiple races
                        num_matches += count_matching_rows(
                            df_line_items, cawp_place_phrase, gov_level, ", ")

                    # tally national level of each race's # (numerator)
                    us_tally[race_code] += num_matches

                    # calculate % of {race} women leg. for this state
                    pct_women_leg = get_pretty_pct(
                        num_matches / total_legislators)

                # set place and race
                print(output_row)
                output_row[std_col.STATE_NAME_COL] = place_name
                output_row[std_col.RACE_CATEGORY_ID_COL] = race_code

                # set pct_women_leg for this state/race
                output_row[std_col.WOMEN_STATE_LEG_PCT] = pct_women_leg

                print("after\n", output_row)
                # add state row to output
                output.append(output_row)

        # UNITED STATES (for all state legislatures combined)

        # matched_row = df_acs_pop_national[(
        #     df_acs_pop_national[std_col.RACE_CATEGORY_ID_COL] == "TOTAL")]
        # national_total_pop = matched_row[std_col.POPULATION_COL].values[0]

        # for cawp_race_name in CAWP_RACE_GROUPS_TO_STANDARD.keys():

        #     race_code = CAWP_RACE_GROUPS_TO_STANDARD[cawp_race_name]

        #     us_output_row = {}
        #     us_output_row[std_col.RACE_CATEGORY_ID_COL] = race_code
        #     us_output_row[std_col.STATE_NAME_COL] = "United States"

        #     # set % women leg by cawp_race_name for US
        #     pct_women_leg = get_pretty_pct(
        #         us_tally[race_code] / us_tally['total_all_genders'])
        #     us_output_row[std_col.WOMEN_STATE_LEG_PCT] = pct_women_leg

        #     # add each race's US rows like a state row
        #     output.append(us_output_row)

        output_df = pd.DataFrame(output, columns=columns)

        output_df = merge_fips_codes(output_df)

        # std_col.add_race_columns_from_category_id(output_df)

        return output_df
