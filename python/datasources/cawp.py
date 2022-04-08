import pandas as pd

from ingestion.standardized_columns import Race
import ingestion.standardized_columns as std_col

from datasources.data_source import DataSource
from ingestion import gcs_to_bq_util, constants
from ingestion.dataset_utils import (percent_avoid_rounding_to_zero,
                                     merge_fips_codes,
                                     merge_pop_numbers,
                                     replace_state_abbr_with_names)

# CAWP COLUMNS
RACE_COL = "race_ethnicity"
POSTAL_COL = "state_postal_abbreviation"
COUNT_ALL = "total_count"
COUNT_W = "total_count_women"

RATIO_COL = "Total Women/Total Legislators"
PCT_W_COL = "%Women Overall"
STATE_COL_TOTAL = "State"
STATE_COL_LINE = "state"
POSITION_COL = "position"

# PROPUB COLUMNS
IN_OFFICE_COL = "in_office"

# CAWP CONSTS
NATIONAL = "national"
STATE = "state"


CAWP_RACE_GROUPS_TO_STANDARD = {
    'Asian American/Pacific Islander': Race.ASIAN_PAC.value,
    'Latina': Race.HISP.value,
    'Middle Eastern/North African': Race.MENA.value,
    # MULTI = "Multiracial Alone" + women w multiple specific races
    'Multiracial Alone': Race.MULTI.value,
    'Native American/Alaska Native/Native Hawaiian': Race.AIANNH.value,
    'Black': Race.BLACK.value,
    'White': Race.WHITE.value,
    'Unavailable': Race.UNKNOWN.value,
    'All': Race.TOTAL.value
}

CAWP_DATA_TYPES = {
    # TODO : this is causing a miscount for territories,
    # because territorial governors share the "Territorial/D.C." 'level' column of gov
    # instead need to match the ['position'] column for
    # for ["Territorial/D.C. Senator", "Territorial/D.C. Representative", "State Legislative"]
    # STATE: ["Territorial/D.C.", "State Legislative"],
    STATE: ["Territorial/D.C. Senator", "Territorial/D.C. Representative", "State Representative", "State Senator"],
    # NATIONAL: ["U.S. Delegate", "Congress"],
    NATIONAL: ["U.S. Representative", "U.S. Senator", "U.S. Delegate"]
}


def get_pct(numerator: int, denominator: int):
    """ Prevents division by zero errors from using util pct function
    numerator: top number as int
    denominator: bottom number as int

    returns: float representing the % value of that rounded fraction

    Note: Division by zero just returns 0.0 instead of error
    """
    if denominator == 0:
        return 0.0
    return percent_avoid_rounding_to_zero(numerator, denominator)


def get_women_only_race_group(race_code: str):
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


def remove_markup(datum: str):
    """Returns the string with any asterisks and/r italics markup removed """
    datum = str(datum)
    return datum.replace("<i>", "").replace("</i>", "").replace("*", "")


def count_matching_rows(df, place_name: str, gov_level: str, race_to_match: str):
    """ Accepts a dataframe, a level of government, a place name,
    and a race name (CAWP terminology) string to match within the
     race_ethnicity column. It then counts the number of
    rows where those conditions are all met  """

    df = df[(df[POSITION_COL].isin(CAWP_DATA_TYPES[gov_level]))]

    # to get national values, don't restrict by state
    if place_name != constants.US_NAME:
        df = df[(
            df[std_col.STATE_NAME_COL] == place_name)]

    # to get ALL women, don't restrict by race
    if race_to_match == std_col.ALL_VALUE:
        race_to_match = ""

    # find race matches
    df_race_matches = df[(df[RACE_COL].str.contains(race_to_match))]

    if race_to_match != "Multiracial Alone":
        return len(df_race_matches.index)

    # sum "Multiracial Alone" + ", " for women who a race list
    df_race_list_matches = df[(df[RACE_COL].str.contains(", "))]

    return len(df_race_matches.index) + len(df_race_list_matches.index)


CAWP_LINE_ITEMS_FILE = "cawp-by_race_and_ethnicity.csv"
# this URL could be used for an API endpoint but needs authentication
# CAWP_LINE_ITEMS_URL = ("https://cawpdata.rutgers.edu/women-elected-officials/"
#    "race-ethnicity/export-roles/csv?current=1&yearend_filter=All"
#    "&level%5B0%5D=Federal%20Congress&level%5B1%5D=State%20Legislative"
#    "&level%5B2%5D=Territorial/DC%20Legislative&items_per_page=50"
#    "&page&_format=csv")

# Table for STATE_COL_LINE LEG. TOTALS
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
        df_line_items = df_line_items[[POSITION_COL, STATE_COL_LINE, RACE_COL]]
        df_line_items = df_line_items.dropna()
        df_line_items[STATE_COL_LINE] = df_line_items[STATE_COL_LINE].apply(
            get_standard_code_from_cawp_phrase)
        df_line_items = df_line_items.rename(
            columns={STATE_COL_LINE: POSTAL_COL})
        df_line_items = replace_state_abbr_with_names(df_line_items)

        # load in table STATE LEGISLATURES total members by race/state
        df_state_leg_totals = gcs_to_bq_util.load_csv_as_df_from_web(
            CAWP_TOTALS_URL)
        df_state_leg_totals = df_state_leg_totals[[STATE_COL_TOTAL,
                                                   RATIO_COL,
                                                  PCT_W_COL]]
        df_state_leg_totals = df_state_leg_totals.dropna()
        df_state_leg_totals = df_state_leg_totals.applymap(remove_markup)
        df_state_leg_totals = df_state_leg_totals.rename(
            columns={STATE_COL_TOTAL: POSTAL_COL})
        df_state_leg_totals = replace_state_abbr_with_names(
            df_state_leg_totals)
        df_state_leg_totals[[COUNT_W, COUNT_ALL]
                            ] = df_state_leg_totals[RATIO_COL].str.split("/", expand=True)
        df_state_leg_totals = df_state_leg_totals[[
            std_col.STATE_NAME_COL, COUNT_W, COUNT_ALL]]
        df_state_leg_totals = df_state_leg_totals.sort_values(
            by=[std_col.STATE_NAME_COL])

        # load in and combine PROPUBLICA US CONGRESS tables with members by state
        df_us_house = gcs_to_bq_util.load_json_as_df_from_data_dir(
            'cawp', PROPUB_US_HOUSE_FILE)
        df_us_senate = gcs_to_bq_util.load_json_as_df_from_data_dir(
            'cawp', PROPUB_US_SENATE_FILE)
        df_us_house = df_us_house[df_us_house[IN_OFFICE_COL]]
        df_us_senate = df_us_senate[df_us_senate[IN_OFFICE_COL]]
        df_us_house = df_us_house[[STATE]]
        df_us_senate = df_us_senate[[STATE]]
        df_us_congress = pd.concat([df_us_senate, df_us_house])
        df_us_congress = df_us_congress.rename(
            columns={STATE_COL_LINE: POSTAL_COL})
        df_us_congress = replace_state_abbr_with_names(df_us_congress)
        df_us_congress_totals = df_us_congress[std_col.STATE_NAME_COL].value_counts(
        ).reset_index()
        df_us_congress_totals.columns = [std_col.STATE_NAME_COL, COUNT_ALL]
        df_us_congress_totals = df_us_congress_totals.sort_values(
            by=[std_col.STATE_NAME_COL]).reset_index()

        # set column types for BigQuery
        column_types = {}
        column_types[std_col.STATE_NAME_COL] = 'STRING'
        column_types[std_col.WOMEN_STATE_LEG_PCT] = 'DECIMAL'
        column_types[std_col.WOMEN_STATE_LEG_PCT_SHARE] = 'DECIMAL'
        column_types[std_col.WOMEN_US_CONGRESS_PCT] = 'DECIMAL'
        column_types[std_col.WOMEN_US_CONGRESS_PCT_SHARE] = 'DECIMAL'
        column_types[std_col.RACE_CATEGORY_ID_COL] = 'STRING'
        column_types[std_col.RACE_WOMEN_COL] = "STRING"
        column_types[std_col.STATE_FIPS_COL] = 'STRING'
        column_types[std_col.POPULATION_PCT_COL] = 'DECIMAL'
        column_types[std_col.RACE_COL] = "STRING"
        column_types[std_col.RACE_INCLUDES_HISPANIC_COL] = 'BOOL'
        column_types[std_col.RACE_OR_HISPANIC_COL] = "STRING"

        # make two tables
        for geo_level in ['state', 'national']:
            table_name = f'race_and_ethnicity_{geo_level}'
            breakdown_df = self.generate_breakdown(df_us_congress_totals,
                                                   df_state_leg_totals,
                                                   df_line_items, geo_level)

            gcs_to_bq_util.add_df_to_bq(
                breakdown_df, dataset, table_name, column_types=column_types)

    def generate_breakdown(self, df_us_congress_totals, df_state_leg_totals, df_line_items, level: str):

        if level == NATIONAL:
            all_places = [constants.US_NAME]

            # make a row for US and set value to the sum of all states/territories
            national_sum_state_leg_count = pd.DataFrame(
                [{std_col.STATE_NAME_COL: constants.US_NAME,
                  COUNT_W: df_state_leg_totals[COUNT_W].astype(int).sum(),
                  COUNT_ALL: df_state_leg_totals[COUNT_ALL].astype(int).sum()}])

            # add US row to other PLACE rows
            df_state_leg_totals = pd.concat(
                [df_state_leg_totals, national_sum_state_leg_count], ignore_index=True)

            # add a row for US and set value to the sum of all states/territories
            us_congress_count = pd.DataFrame(
                [{std_col.STATE_NAME_COL: constants.US_NAME, COUNT_ALL: df_us_congress_totals[COUNT_ALL].sum()}])

            df_us_congress_totals = pd.concat(
                [df_us_congress_totals, us_congress_count], ignore_index=True)

        elif level == STATE:
            all_places = df_us_congress_totals[std_col.STATE_NAME_COL].to_list(
            )

        output = []
        for current_place in all_places:

            us_congress_women_current_place_all_races = count_matching_rows(
                df_line_items, current_place, NATIONAL, std_col.ALL_VALUE)

            us_congress_members_current_place_all_races = df_us_congress_totals.loc[
                df_us_congress_totals[std_col.STATE_NAME_COL] == current_place][COUNT_ALL].values[0]

            state_leg_women_current_place_all_races = count_matching_rows(
                df_line_items, current_place, STATE_COL_LINE, std_col.ALL_VALUE)

            state_leg_members_current_place_all_races = df_state_leg_totals.loc[
                df_state_leg_totals[std_col.STATE_NAME_COL] == current_place][COUNT_ALL].values[0]

            # print(current_place)
            # print("\tus_congress_women_current_place_all_races",
            #       us_congress_women_current_place_all_races)
            # print("\tus_congress_members_current_place_all_races",
            #       us_congress_members_current_place_all_races)
            # print("\tstate_leg_women_current_place_all_races",
            #       state_leg_women_current_place_all_races)
            # print("\tstate_leg_members_current_place_all_races",
            #       state_leg_members_current_place_all_races)

            for cawp_race_name in CAWP_RACE_GROUPS_TO_STANDARD.keys():
                output_row = {}
                race_code = CAWP_RACE_GROUPS_TO_STANDARD[cawp_race_name]

                # calculate raw counts
                us_congress_women_current_place_current_race = count_matching_rows(
                    df_line_items, current_place, NATIONAL, cawp_race_name)
                state_leg_women_current_place_current_race = count_matching_rows(
                    df_line_items, current_place, STATE, cawp_race_name)

                # calculate incidence rates
                output_row[std_col.WOMEN_US_CONGRESS_PCT] = get_pct(
                    us_congress_women_current_place_current_race,
                    us_congress_members_current_place_all_races)

                output_row[std_col.WOMEN_STATE_LEG_PCT] = get_pct(
                    state_leg_women_current_place_current_race,
                    state_leg_members_current_place_all_races)

                # calculate incidence shares
                output_row[std_col.WOMEN_US_CONGRESS_PCT_SHARE] = get_pct(
                    us_congress_women_current_place_current_race,
                    us_congress_women_current_place_all_races)

                output_row[std_col.WOMEN_STATE_LEG_PCT_SHARE] = get_pct(
                    state_leg_women_current_place_current_race,
                    state_leg_women_current_place_all_races)

                # set "women only" version of race codes
                output_row[std_col.RACE_WOMEN_COL] = get_women_only_race_group(
                    race_code)

                output_row[std_col.RACE_CATEGORY_ID_COL] = race_code
                output_row[std_col.STATE_NAME_COL] = current_place

                # add row for this place/race to output
                output.append(output_row)

        # column names for output df
        columns = [std_col.STATE_NAME_COL,
                   std_col.WOMEN_STATE_LEG_PCT,
                   std_col.WOMEN_STATE_LEG_PCT_SHARE,
                   std_col.WOMEN_US_CONGRESS_PCT,
                   std_col.WOMEN_US_CONGRESS_PCT_SHARE,
                   std_col.RACE_CATEGORY_ID_COL,
                   std_col.RACE_WOMEN_COL
                   ]

        output_df = pd.DataFrame(output, columns=columns)
        output_df = merge_fips_codes(output_df)
        output_df = merge_pop_numbers(output_df, std_col.RACE_COL, level)
        output_df = output_df.drop(columns=[std_col.POPULATION_COL])
        std_col.add_race_columns_from_category_id(output_df)

        return output_df
