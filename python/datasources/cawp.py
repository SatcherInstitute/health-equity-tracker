import pandas as pd

from ingestion.standardized_columns import Race
import ingestion.standardized_columns as std_col

from datasources.data_source import DataSource
from ingestion import gcs_to_bq_util
from ingestion.dataset_utils import merge_fips_codes

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
    "federal": ["U.S. Delegate", "Congress"],
}


def get_women_only_race(race_code: str):
    """ Accepts a standard race code and
    returns a race name string specific to only women of that race/ethnicity """

    women_race_overrides = {
        Race.HISP.value: 'Hispanic Women and Latinas',
        Race.MULTI.value: 'Women of two or more races',
        Race.UNKNOWN.value: 'Women of unknown race',
    }

    if race_code in women_race_overrides.keys():
        women_race_name = women_race_overrides[race_code]
    else:
        race_tuple = Race[race_code].as_tuple()
        women_race_name = f'{race_tuple.race} Women'
        if race_tuple.race_includes_hispanic is False:
            women_race_name += " (Non-Hispanic)"

    return women_race_name


def swap_territory_abbr(abbr: str):
    """Replaces mismatched territory abbreviations between TOTAL and LINE LEVEL files """
    return {"AS": "AM", "MP": "MI"}.get(abbr, abbr)


def swap_territory_name(territory_name: str):
    """Replaces mismatched territory names between ACS and CAWP files """
    return {"Virgin Islands": "U.S. Virgin Islands"}.get(territory_name, territory_name)


def clean(datum: str):
    """Returns the string with any asterisks and/r italics markup removed """
    return datum.replace("<i>", "").replace("</i>", "").replace("*", "")


def get_pretty_pct(numerator: int, denominator: int):
    """ Takes a proportion float (between 0 and 1) and converts to a string
    representing the pct equivalent, with a maximum of 2 significant digits
    and no trailing zeros. Prevents division by zero and returns `None` """

    if denominator == 0:
        return "0"

    pct = numerator / denominator * 100
    pct_rounded = float(str(round(pct, 2)))
    return f'{pct_rounded:g}'


def count_matching_rows(df, state_phrase: str, gov_level: str, string_to_match: str):
    """ Accepts a dataframe, a level of government, a state phrase, and an optional
    string to match within the race_ethnicity column. It then counts the number of
    rows where those conditions are all met  """

    # to get ALL women, don't restrict by race
    if string_to_match == std_col.ALL_VALUE:
        string_to_match = ""

    # to get national values, don't restrict by state
    if state_phrase == "United States - US":
        df = df[
            (df['race_ethnicity'].str.contains(string_to_match)) &
            (df['level'].isin(
                CAWP_DATA_TYPES[gov_level]))
        ]

    else:
        df = df[
            (df['state'] == state_phrase) &
            (df['race_ethnicity'].str.contains(string_to_match)) &
            (df['level'].isin(
                CAWP_DATA_TYPES[gov_level]))
        ]

    # print(state_phrase, gov_level, string_to_match, len(df.index))
    # print(df.to_string())

    return len(df.index)


def get_congress_size(df_house, df_senate, place_abbr: str):
    """ Accepts two dataframes (for house and senate), and a place_name (US, state or territory)
    and returns the TOTAL number of legislators at that level for that place.
    This is used as the denominator in calculating incidence rate """

    def is_active_from_place(member):

        if place_abbr == "US":
            return member["in_office"] is True
        else:
            return member["in_office"] is True and member["state"] == place_abbr

    senators = df_senate["results"][0]["members"]
    active_senators = list(filter(is_active_from_place, senators))

    house_members = df_house["results"][0]["members"]
    active_house_members = list(filter(is_active_from_place, house_members))

    # print(place_abbr, "sen", len(active_senators),
    #   "house", len(active_house_members))

    return len(active_senators) + len(active_house_members)


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


# Table for Line-Items incl US- and STATE-LEVEL LEG by race by state
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

# Table for STATE LEG. TOTALS
# WEBSITE FOR TOTALS https://cawp.rutgers.edu/facts/levels-office/state-legislature/women-state-legislatures-2022#table
CAWP_TOTALS_URL = "https://cawp.rutgers.edu/tablefield/export/paragraph/1028/field_table/und/0"

# Tables for US LEVEL LEG TOTALS
PROPUB_US_SENATE_FILE = "propublica-us-senate.json"
PROPUB_US_HOUSE_FILE = "propublica-us-house.json"


class CAWPData(DataSource):

    @ staticmethod
    def get_id():
        return 'CAWP_DATA'

    @ staticmethod
    def get_table_name():
        return 'cawp_data'

    def upload_to_gcs(self, _, **attrs):
        raise NotImplementedError(
            'upload_to_gcs should not be called for CAWPData')

    def write_to_bq(self, dataset, gcs_bucket, **attrs):

        # load in line-item table from CAWP with all women all levels by race/state
        df_line_items = gcs_to_bq_util.load_csv_as_df_from_data_dir(
            'cawp', CAWP_LINE_ITEMS_FILE)

        # load in table with # and % of women legislators for state leg. by race/state
        df_state_leg_totals = gcs_to_bq_util.load_csv_as_df_from_web(
            CAWP_TOTALS_URL)

        # load in tables with US Congress members by state
        df_us_house = gcs_to_bq_util.load_json_as_df_from_data_dir(
            'cawp', PROPUB_US_HOUSE_FILE)
        df_us_senate = gcs_to_bq_util.load_json_as_df_from_data_dir(
            'cawp', PROPUB_US_SENATE_FILE)

        # load in ACS national populations by race
        df_acs_pop_national = gcs_to_bq_util.load_df_from_bigquery(
            'acs_population', 'by_race_national')

        # print(df_acs_pop_national.to_string())

        # load in ACS states and puerto rico populations by race
        df_acs_pop_state = gcs_to_bq_util.load_df_from_bigquery(
            'acs_population', 'by_race_state_std', dtype={'state_fips': str})

        # print(df_acs_pop_state.to_string())

        # load in ACS 2010 territories' populations by race
        df_acs_2010_pop_territory = gcs_to_bq_util.load_df_from_bigquery(
            'acs_2010_population', 'by_race_and_ethnicity_territory', dtype={'state_fips': str})

        # print(df_acs_2010_pop_territory.to_string())

        # make table by race
        breakdown_df = self.generate_breakdown(df_us_house, df_us_senate,
                                               df_state_leg_totals, df_line_items, df_acs_pop_state,
                                               df_acs_pop_national, df_acs_2010_pop_territory)

        # set column types
        column_types = {c: 'STRING' for c in breakdown_df.columns}
        column_types[std_col.WOMEN_STATE_LEG_PCT] = 'STRING'
        column_types[std_col.WOMEN_STATE_LEG_PCT_SHARE] = 'STRING'
        column_types[std_col.WOMEN_US_CONGRESS_PCT] = 'STRING'
        column_types[std_col.WOMEN_US_CONGRESS_PCT_SHARE] = 'STRING'
        column_types[std_col.RACE_INCLUDES_HISPANIC_COL] = 'BOOL'
        column_types[std_col.POPULATION_COL] = 'INT'
        column_types[std_col.POPULATION_PCT_COL] = 'FLOAT'
        column_types[std_col.RACE_WOMEN_COL] = "STRING"

        gcs_to_bq_util.add_df_to_bq(
            breakdown_df, dataset, std_col.RACE_OR_HISPANIC_COL, column_types=column_types)

    def generate_breakdown(self, df_us_house, df_us_senate, df_state_leg_totals, df_line_items, df_acs_pop_state,
                           df_acs_pop_national, df_acs_2010_pop_territory):

        # list of states/territories FIPS we have population breakdowns for from ACS
        place_names_with_acs_pop = set(
            df_acs_pop_state[std_col.STATE_NAME_COL].to_list())

        territory_names_with_acs_2010_pop = set(
            df_acs_2010_pop_territory[std_col.STATE_NAME_COL].to_list())

        # for LINE ITEM CSV
        # split 'state' into a map of 'state 2 letter code' : 'statename'
        # NOTE: these values may contain formatting and must be cleaned before
        # placing into output df
        place_abbr_map = {}
        for place in df_line_items['state'].dropna():
            place_terms = place.split(" - ")
            place_abbr_map[place_terms[1]] = place_terms[0]

        # for TOTALS CSV cleanup state codes
        cawp_place_abbrs = df_state_leg_totals['State'].drop_duplicates(
        ).to_list()

        # iterate over US like another state
        cawp_place_abbrs.append("US")

        # set output column names
        columns = [std_col.STATE_NAME_COL,
                   std_col.WOMEN_STATE_LEG_PCT,
                   std_col.WOMEN_STATE_LEG_PCT_SHARE,
                   std_col.WOMEN_US_CONGRESS_PCT,
                   std_col.WOMEN_US_CONGRESS_PCT_SHARE,
                   std_col.POPULATION_COL,
                   std_col.POPULATION_PCT_COL,
                   std_col.RACE_CATEGORY_ID_COL,
                   std_col.RACE_WOMEN_COL
                   ]

        output = []

        # initialize tally for national state legislature totals (all genders)
        us_women_by_race_state_legs_tally = {"total_all_genders": 0}
        # initialize tally for national us congress totals (all genders)
        # us_women_by_race_us_congress_tally = {}

        # initialize for and women by race (incl UNKNOWN and ALL = all women)
        for race_code in CAWP_RACE_GROUPS_TO_STANDARD.values():
            us_women_by_race_state_legs_tally[race_code] = 0

        # ITERATE STATES / TERRITORIES / US
        for cawp_place_abbr in cawp_place_abbrs:
            print(cawp_place_abbr)

            place_abbr = swap_territory_abbr(clean(cawp_place_abbr))

            cawp_place_name = "United States" if place_abbr == "US" else place_abbr_map[
                place_abbr]
            place_name = swap_territory_name(cawp_place_name)

            cawp_place_phrase = f"{cawp_place_name} - {swap_territory_abbr(clean(cawp_place_abbr))}"
            total_women_federal_legislators = count_matching_rows(
                df_line_items, cawp_place_phrase, "federal", std_col.ALL_VALUE)

            total_federal_legislators = get_congress_size(
                df_us_house, df_us_senate, place_abbr)

            if place_abbr != "US":
                # find row containing TOTAL STATE LEGISLATORS for each state/territory
                matched_row = df_state_leg_totals.loc[
                    (df_state_leg_totals['State'] == cawp_place_abbr)]

                total_ratio = clean(
                    matched_row["Total Women/Total Legislators"].values[0])

                total_women_state_legislators = int(total_ratio.split(
                    "/")[0])
                total_state_legislators = int(total_ratio.split(
                    "/")[1])

                # keep a tally of national total of women state legislators of all races and
                # total of all state leg of any gender (denominator)

                us_women_by_race_state_legs_tally["ALL"] += total_women_state_legislators
                us_women_by_race_state_legs_tally["total_all_genders"] += total_state_legislators
            else:
                print("***********\n***********\n*******")

            for cawp_race_name in CAWP_RACE_GROUPS_TO_STANDARD.keys():
                print("\t", cawp_race_name)
                print("\n", us_women_by_race_state_legs_tally)

                # Setup row
                race_code = CAWP_RACE_GROUPS_TO_STANDARD[cawp_race_name]

                output_row = {}
                output_row[std_col.STATE_NAME_COL] = place_name
                output_row[std_col.RACE_CATEGORY_ID_COL] = race_code

                # national pop and pop_share
                if place_name == "United States":
                    output_row = set_pop_metrics_by_race_in_state(
                        output_row, df_acs_pop_national, race_code, place_name)
                # states, DC, PR
                elif place_name in place_names_with_acs_pop:
                    output_row = set_pop_metrics_by_race_in_state(
                        output_row, df_acs_pop_state, race_code, place_name)
                # other territories
                elif place_name in territory_names_with_acs_2010_pop:
                    output_row = set_pop_metrics_by_race_in_state(
                        output_row, df_acs_2010_pop_territory, race_code, place_name)
                # mismatched races
                else:
                    output_row[std_col.POPULATION_COL] = None
                    output_row[std_col.POPULATION_PCT_COL] = None

                # calculate and set incidence rates

                # count  number of all us congresswomen (of all races) for this place
                num_matches_us_congress = count_matching_rows(
                    df_line_items, cawp_place_phrase, "federal", cawp_race_name)

                if cawp_race_name == std_col.ALL_VALUE:
                    pct_women_state_leg = clean(
                        matched_row['%Women Overall'].values[0])

                    # pct_share of ALL will always be 100%
                    pct_share_women_state_leg = "100"
                    pct_share_women_us_congress = "100"

                else:

                    # count the number of women leg. who selected current race
                    num_matches_state_legs = count_matching_rows(
                        df_line_items, cawp_place_phrase, "state", cawp_race_name)

                    # for MULTI, sum "Multiracial Alone" women +
                    #  women who identify with multiple, specific races
                    if cawp_race_name == "Multiracial Alone":
                        # comma delimiter signifies multiple races
                        num_matches_state_legs += count_matching_rows(
                            df_line_items, cawp_place_phrase, "state", ", ")
                        num_matches_us_congress += count_matching_rows(
                            df_line_items, cawp_place_phrase, "federal", ", ")

                    # tally national level of each race's # (numerator)

                    # print("$$$")
                    # print(
                    #     us_women_by_race_state_legs_tally[race_code], "+", num_matches_state_legs)

                    # print("=", us_women_by_race_state_legs_tally[race_code])

                    # calculate incidence rates and shares for {race} women leg. / all legislators

                    if place_name == "United States":

                        print(us_women_by_race_state_legs_tally[race_code], ":", us_women_by_race_state_legs_tally[
                            'total_all_genders'], "=")

                        pct_women_state_leg = get_pretty_pct(
                            us_women_by_race_state_legs_tally[race_code], us_women_by_race_state_legs_tally[
                                'total_all_genders'])
                        print(pct_women_state_leg, "%")

                        pct_share_women_state_leg = get_pretty_pct(
                            us_women_by_race_state_legs_tally[race_code], us_women_by_race_state_legs_tally["ALL"])

                    else:
                        us_women_by_race_state_legs_tally[race_code] += num_matches_state_legs

                        pct_women_state_leg = get_pretty_pct(
                            num_matches_state_legs, total_state_legislators)

                        pct_share_women_state_leg = get_pretty_pct(
                            num_matches_state_legs, total_women_state_legislators)

                # calculate incidence rates
                pct_women_us_congress = get_pretty_pct(
                    num_matches_us_congress, total_federal_legislators)

                # calculate incidence shares
                pct_share_women_us_congress = get_pretty_pct(
                    num_matches_us_congress, total_women_federal_legislators)

                # set incidence rates
                output_row[std_col.WOMEN_STATE_LEG_PCT] = pct_women_state_leg
                output_row[std_col.WOMEN_US_CONGRESS_PCT] = pct_women_us_congress

                # set incidence shares
                output_row[std_col.WOMEN_STATE_LEG_PCT_SHARE] = pct_share_women_state_leg
                output_row[std_col.WOMEN_US_CONGRESS_PCT_SHARE] = pct_share_women_us_congress

                # set "women only" version of race codes
                output_row[std_col.RACE_WOMEN_COL] = get_women_only_race(
                    race_code)

                # add row for this place/race to output
                output.append(output_row)

        output_df = pd.DataFrame(output, columns=columns)

        output_df = merge_fips_codes(output_df)

        std_col.add_race_columns_from_category_id(output_df)

        output_df[std_col.RACE_OR_HISPANIC_COL] = output_df[std_col.RACE_WOMEN_COL]

        return output_df
