import pandas as pd

from ingestion.standardized_columns import Race
import ingestion.standardized_columns as std_col

from datasources.data_source import DataSource
from ingestion import gcs_to_bq_util
from ingestion.dataset_utils import merge_fips_codes

from ingestion.dataset_utils import replace_state_abbr_with_names

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


def get_women_only_race_groups(race_code: str):
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


def get_standard_code_from_cawp_phrase(cawp_place_phrase: str):
    """ Accepts a CAWP place phrase found in the LINE ITEM table
    `{STATE NAME} - {CODE}` with the standard 2 letter code
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


def get_nonstandard_territory_abbr(abbr: str):
    """Replaces standard territory abbreviations found in
    CAWP TOTAL with alternate versions found in CAWP LINE LEVEL files """
    return {"AS": "AM", "MP": "MI"}.get(abbr, abbr)


def swap_territory_name(territory_name: str):
    """Replaces mismatched territory names between ACS and CAWP files """
    return {"Virgin Islands": "U.S. Virgin Islands"}.get(territory_name, territory_name)


def remove_markup(datum: str):
    """Returns the string with any asterisks and/r italics markup removed """

    datum = str(datum)

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


def count_matching_rows(df, place_name: str, gov_level: str, string_to_match: str):
    """ Accepts a dataframe, a level of government, a place name, and an optional
    string to match within the race_ethnicity column. It then counts the number of
    rows where those conditions are all met  """

    # to get ALL women, don't restrict by race
    if string_to_match == std_col.ALL_VALUE:
        string_to_match = ""

    # to get national values, don't restrict by state
    if place_name == "United States":
        df = df[
            (df['race_ethnicity'].str.contains(string_to_match)) &
            (df['level'].isin(
                CAWP_DATA_TYPES[gov_level]))
        ]

    else:
        df = df[
            (df[std_col.STATE_NAME_COL] == place_name) &
            (df['race_ethnicity'].str.contains(string_to_match)) &
            (df['level'].isin(
                CAWP_DATA_TYPES[gov_level]))
        ]

    return len(df.index)


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

        # load in and standardize tables with US Congress members by state
        df_us_house = gcs_to_bq_util.load_json_as_df_from_data_dir(
            'cawp', PROPUB_US_HOUSE_FILE)

        df_us_senate = gcs_to_bq_util.load_json_as_df_from_data_dir(
            'cawp', PROPUB_US_SENATE_FILE)

        # load in ACS national populations by race
        df_acs_pop_national = gcs_to_bq_util.load_df_from_bigquery(
            'acs_population', 'by_race_national')

        # load in ACS states and puerto rico populations by race
        df_acs_pop_state = gcs_to_bq_util.load_df_from_bigquery(
            'acs_population', 'by_race_state_std', dtype={'state_fips': str})

        # load in ACS 2010 territories' populations by race
        df_acs_2010_pop_territory = gcs_to_bq_util.load_df_from_bigquery(
            'acs_2010_population', 'by_race_and_ethnicity_territory', dtype={'state_fips': str})

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

        place_abbr_map = {}
        for place in df_line_items['state'].dropna():
            place_terms = place.split(" - ")
            place_abbr_map[place_terms[1]] = place_terms[0]

        # Standardize CAWP LINE ITEM table
        df_line_items = df_line_items[['level', 'state', 'race_ethnicity']]
        df_line_items = df_line_items.dropna()
        df_line_items['state'] = df_line_items['state'].apply(
            get_standard_code_from_cawp_phrase)
        df_line_items = df_line_items.rename(
            columns={"state": "state_postal_abbreviation"})
        df_line_items = replace_state_abbr_with_names(df_line_items)

        # Standardize CAWP TOTALS table
        df_state_leg_totals = df_state_leg_totals[['State',
                                                   'Total Women/Total Legislators',
                                                   '%Women Overall']]
        df_state_leg_totals = df_state_leg_totals.dropna()

        df_state_leg_totals = df_state_leg_totals.applymap(remove_markup)

        df_state_leg_totals = df_state_leg_totals.rename(
            columns={"State": "state_postal_abbreviation"})

        df_state_leg_totals = replace_state_abbr_with_names(
            df_state_leg_totals)

        # Standardize PROPUBLICA US CONGRESS TOTALS

        # remove out of office congresspeople
        df_us_house = df_us_house[df_us_house['in_office']]
        df_us_senate = df_us_senate[df_us_senate['in_office']]

        # remove extra cols
        df_us_house = df_us_house[['state']]
        df_us_senate = df_us_senate[['state']]

        df_us_congress = pd.concat([df_us_senate, df_us_house])

        # replace postal with full name
        df_us_congress = df_us_congress.rename(
            columns={"state": "state_postal_abbreviation"})
        df_us_congress = replace_state_abbr_with_names(df_us_congress)

        # pivot so columns are | places | counts for each place
        df_us_congress_totals = df_us_congress[std_col.STATE_NAME_COL].value_counts(
        ).reset_index()
        df_us_congress_totals.columns = [std_col.STATE_NAME_COL, "total_count"]

        # add a row for US and set value to the sum of all states/territories
        united_states_count = pd.DataFrame(
            [{std_col.STATE_NAME_COL: "United States", "total_count": df_us_congress_totals["total_count"].sum()}])

        df_us_congress_totals = pd.concat(
            [df_us_congress_totals, united_states_count], ignore_index=True)

        all_places = set(
            df_us_congress_totals[std_col.STATE_NAME_COL].to_list())

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

        print(all_places)

        # ITERATE STATES / TERRITORIES / US
        for current_place in all_places:
            # print("current_place", current_place)

            total_women_federal_legislators = count_matching_rows(
                df_line_items, current_place, "federal", std_col.ALL_VALUE)

            total_us_congress_people_current_place = df_us_congress_totals.loc[
                df_us_congress_totals[std_col.STATE_NAME_COL] == current_place]["total_count"].values[0]

            if current_place != "United States":
                # find row containing TOTAL STATE LEGISLATORS for each state/territory
                matched_row = df_state_leg_totals.loc[
                    (df_state_leg_totals[std_col.STATE_NAME_COL] == current_place)]

                total_ratio = matched_row["Total Women/Total Legislators"].values[0]

                total_women_state_legislators = int(total_ratio.split(
                    "/")[0])
                total_state_legislators = int(total_ratio.split(
                    "/")[1])

            for cawp_race_name in CAWP_RACE_GROUPS_TO_STANDARD.keys():
                # print("\tcawp_race_name", cawp_race_name)

                # Setup row
                race_code = CAWP_RACE_GROUPS_TO_STANDARD[cawp_race_name]

                output_row = {}
                output_row[std_col.STATE_NAME_COL] = current_place
                output_row[std_col.RACE_CATEGORY_ID_COL] = race_code

                # national pop and pop_share
                if current_place == "United States":
                    output_row = set_pop_metrics_by_race_in_state(
                        output_row, df_acs_pop_national, race_code, current_place)
                # states, DC, PR
                elif current_place in place_names_with_acs_pop:
                    output_row = set_pop_metrics_by_race_in_state(
                        output_row, df_acs_pop_state, race_code, current_place)
                # other territories
                elif current_place in territory_names_with_acs_2010_pop:
                    output_row = set_pop_metrics_by_race_in_state(
                        output_row, df_acs_2010_pop_territory, race_code, current_place)
                # mismatched races
                else:
                    output_row[std_col.POPULATION_COL] = None
                    output_row[std_col.POPULATION_PCT_COL] = None

                # calculate and set incidence rates

                # count  number of all us congresswomen (of all races) for this place
                num_matches_us_congress = count_matching_rows(
                    df_line_items, current_place, "federal", cawp_race_name)

                # count the number of women leg. who selected current race
                num_matches_state_legs = count_matching_rows(
                    df_line_items, current_place, "state", cawp_race_name)

                # for MULTI, sum "Multiracial Alone" women +
                #  women who identify with multiple, specific races
                if cawp_race_name == "Multiracial Alone":
                    # comma delimiter signifies multiple races
                    num_matches_state_legs += count_matching_rows(
                        df_line_items, current_place, "state", ", ")
                    num_matches_us_congress += count_matching_rows(
                        df_line_items, current_place, "federal", ", ")

                # calculate incidence rates and shares for {race} women leg. / all legislators

                if current_place == "United States":

                    pct_women_state_leg = get_pretty_pct(
                        num_matches_state_legs, total_state_legislators)

                    pct_share_women_state_leg = get_pretty_pct(
                        num_matches_state_legs, total_women_state_legislators)

                else:
                    pct_women_state_leg = get_pretty_pct(
                        num_matches_state_legs, total_state_legislators)

                    pct_share_women_state_leg = get_pretty_pct(
                        num_matches_state_legs, total_women_state_legislators)

                if cawp_race_name == std_col.ALL_VALUE:

                    # pct_share of ALL will always be 100%
                    pct_share_women_state_leg = "100"
                    pct_share_women_us_congress = "100"

                # calculate incidence rates
                pct_women_us_congress = get_pretty_pct(
                    num_matches_us_congress, total_us_congress_people_current_place)

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
                output_row[std_col.RACE_WOMEN_COL] = get_women_only_race_groups(
                    race_code)

                # add row for this place/race to output
                output.append(output_row)

        output_df = pd.DataFrame(output, columns=columns)

        output_df = merge_fips_codes(output_df)

        std_col.add_race_columns_from_category_id(output_df)

        # uncomment to override with women-only race names
        # output_df[std_col.RACE_OR_HISPANIC_COL] = output_df[std_col.RACE_WOMEN_COL]

        return output_df
