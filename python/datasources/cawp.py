import pandas as pd
from ingestion.standardized_columns import Race
import ingestion.standardized_columns as std_col

from datasources.data_source import DataSource
from ingestion import gcs_to_bq_util, constants
from ingestion.dataset_utils import percent_avoid_rounding_to_zero
from ingestion.merge_utils import merge_state_fips_codes, merge_pop_numbers

from ingestion.constants import NATIONAL_LEVEL, STATE_LEVEL

# Tables for CAWP data and State Legislature Denominators
CAWP_LINE_ITEMS_FILE = "cawp-by_race_and_ethnicity.csv"
CAWP_TOTALS_URL = "https://cawp.rutgers.edu/tablefield/export/paragraph/1028/field_table/und/0"

# Tables for US Congress Denominators
PROPUB_US_SENATE_FILE = "propublica-us-senate.json"
PROPUB_US_HOUSE_FILE = "propublica-us-house.json"


# CAWP COLUMNS
RACE_COL = "race_ethnicity"
COUNT_ALL = "total_count"
COUNT_W = "total_count_women"

RATIO_COL = "Total Women/Total Legislators"
PCT_W_COL = "%Women Overall"
STATE_COL_CAWP_TOTALS = "State"
STATE_COL_LINE = "state"
POSITION_COL = "position"

# PROPUB COLUMNS
IN_OFFICE_COL = "in_office"

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

CAWP_DATA_TYPES = {
    STATE_LEVEL: ["Territorial/D.C. Senator",
                  "Territorial/D.C. Representative",
                  "State Representative",
                  "State Senator"],
    NATIONAL_LEVEL: ["U.S. Representative", "U.S. Senator", "U.S. Delegate"]
}


def pct_never_null(numerator, denominator):
    """ The function acts as a filter for the util fn that calculates a pct
         based on two values. Normally we would want a number divided by 0 to be null,
         but for CAWP data we want it to return 0.0% (e.g. if there are 0 black women
         senators, and zero women senators of any color, we still want to show the
         result as 0% rather than null)

        Parameters:
            numerator: top number of ratio to convert to pct
            denominator: bottom number of ratio to convert to pct

        Returns:
            the pct value, with an attempt to avoid rounding to zero if both inputs are not 0
    """
    numerator = int(numerator)
    denominator = int(denominator)

    if numerator > denominator:
        raise ValueError(
            f'The number of women legislators *of a particular race*: ({numerator}) ' +
            "cannot be larger then the *total* number of " +
            f'women legislators in that place: ({denominator})')

    if numerator == 0 and denominator == 0:
        return 0.0
    return percent_avoid_rounding_to_zero(numerator, denominator)


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


def count_matching_rows(df, place_code: str, gov_level: str, race_to_match: str):
    """ Accepts a dataframe, a level of government, a place code,
    and a race name (CAWP terminology) string to match within the
     race_ethnicity column. It then counts the number of
    rows where those conditions are all met  """

    df = df[(df[POSITION_COL].isin(CAWP_DATA_TYPES[gov_level]))]

    # to get national values, don't restrict by state
    if place_code != constants.US_ABBR:
        df = df[(
            df[std_col.STATE_POSTAL_COL] == place_code)]

    # to get ALL women, don't restrict by race
    if race_to_match == std_col.ALL_VALUE:
        return len(df.index)
    else:
        df_race_matches = df[(df[RACE_COL].str.contains(race_to_match))]

    # for individual race matches
    if race_to_match != "Multiracial Alone":
        return len(df_race_matches.index)

    # combine 3 CAWP categorizations to form MULTI_OR_OTHER_STANDARD
    # - "Multiracial Alone"
    # - ", " (women who have a list of specific races)
    # - "Other"
    df_race_list_matches = df[(df[RACE_COL].str.contains(", "))]
    df_race_other_matches = df[(df[RACE_COL].str.contains("Other"))]

    return len(df_race_matches.index) + len(df_race_list_matches.index) + len(df_race_other_matches.index)


def get_cawp_line_items_as_df():
    """
    Load in line-item table from CAWP (needs to be manually saved in /data)
    with all women, all positions, by state/territory, by race
    https://cawpdata.rutgers.edu/women-elected-officials/race-ethnicity/export-roles/csv?page&_format=csv

    Returns a dataframe with columns STATE_POSTAL_COL, POSITION_COL, RACE_COL,
    and each row as an individual woman in gov
     """
    df = gcs_to_bq_util.load_csv_as_df_from_data_dir(
        'cawp', CAWP_LINE_ITEMS_FILE)
    df = df[[POSITION_COL, STATE_COL_LINE, RACE_COL]]
    df = df.dropna()
    df[STATE_COL_LINE] = df[STATE_COL_LINE].apply(
        get_standard_code_from_cawp_phrase)
    df = df.rename(
        columns={STATE_COL_LINE: std_col.STATE_POSTAL_COL})
    return df


def get_state_leg_totals_as_df():
    """
    Fetches and parses table from CAWP "Facts" website with the COUNT_ALL (total of all genders)
    state legislators and COUNT_W (total women of all races) from each state/territory
    https://cawp.rutgers.edu/tablefield/export/paragraph/1028/field_table/und/0

    Returns a dataframe with columns STATE_POSTAL_COL, COUNT_W, COUNT_ALL, and each row as a state/territory
     """
    df = gcs_to_bq_util.load_csv_as_df_from_web(
        CAWP_TOTALS_URL)
    df = df[[STATE_COL_CAWP_TOTALS,
             RATIO_COL,
             PCT_W_COL]]
    df = df.dropna()
    df = df.applymap(remove_markup)
    df = df.rename(
        columns={STATE_COL_CAWP_TOTALS: std_col.STATE_POSTAL_COL})
    df[[COUNT_W, COUNT_ALL]
       ] = df[RATIO_COL].str.split("/", expand=True)
    df = df[[
        std_col.STATE_POSTAL_COL, COUNT_W, COUNT_ALL]]
    df = df.sort_values(
        by=[std_col.STATE_POSTAL_COL])
    return df


def get_congress_totals_as_df():
    """
    Fetch ProPublica Congress tables (Senate and House)
    and combine to create a US Congress totals (all genders) table
    https://www.propublica.org/datastore/api/propublica-congress-api

    Returns a dataframe with columns STATE_POSTAL_COL, COUNT_ALL, and each row as a state/territory
     """
    df_us_house = gcs_to_bq_util.load_json_as_df_from_data_dir_based_on_key_list(
        'cawp', PROPUB_US_HOUSE_FILE, ["results", "members"])
    df_us_senate = gcs_to_bq_util.load_json_as_df_from_data_dir_based_on_key_list(
        'cawp', PROPUB_US_SENATE_FILE, ["results", "members"])
    df = pd.concat([df_us_senate, df_us_house])
    df = df[df[IN_OFFICE_COL]]
    df = df[[STATE_LEVEL]]
    df = df.rename(
        columns={STATE_COL_LINE: std_col.STATE_POSTAL_COL})
    df = df[std_col.STATE_POSTAL_COL].value_counts(
    ).reset_index()
    df.columns = [std_col.STATE_POSTAL_COL, COUNT_ALL]
    df = df.sort_values(
        by=[std_col.STATE_POSTAL_COL]).reset_index()
    return df


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

        df_line_items = get_cawp_line_items_as_df()
        df_state_leg_totals = get_state_leg_totals_as_df()
        df_us_congress_totals = get_congress_totals_as_df()

        # set column types for BigQuery
        column_types = {}
        column_types[std_col.STATE_NAME_COL] = 'STRING'
        column_types[std_col.WOMEN_STATE_LEG_PCT] = 'DECIMAL'
        column_types[std_col.WOMEN_STATE_LEG_PCT_SHARE] = 'DECIMAL'
        column_types[std_col.WOMEN_US_CONGRESS_PCT] = 'DECIMAL'
        column_types[std_col.WOMEN_US_CONGRESS_PCT_SHARE] = 'DECIMAL'
        column_types[std_col.RACE_CATEGORY_ID_COL] = 'STRING'
        column_types[std_col.STATE_FIPS_COL] = 'STRING'
        column_types[std_col.POPULATION_PCT_COL] = 'DECIMAL'
        column_types[std_col.RACE_COL] = "STRING"
        column_types[std_col.RACE_INCLUDES_HISPANIC_COL] = 'BOOL'
        column_types[std_col.RACE_OR_HISPANIC_COL] = "STRING"

        # make two tables
        for geo_level in [STATE_LEVEL, NATIONAL_LEVEL]:
            table_name = f'race_and_ethnicity_{geo_level}'
            breakdown_df = self.generate_breakdown(df_us_congress_totals,
                                                   df_state_leg_totals,
                                                   df_line_items, geo_level)

            breakdown_df = merge_state_fips_codes(breakdown_df)
            breakdown_df = merge_pop_numbers(
                breakdown_df, std_col.RACE_COL, geo_level)
            breakdown_df = breakdown_df.drop(columns=[std_col.POPULATION_COL])
            std_col.add_race_columns_from_category_id(breakdown_df)

            gcs_to_bq_util.add_df_to_bq(
                breakdown_df, dataset, table_name, column_types=column_types)

    def generate_breakdown(self, df_us_congress_totals, df_state_leg_totals, df_line_items, level: str):

        if level == NATIONAL_LEVEL:
            all_place_codes = [constants.US_ABBR]

            # make a row for US and set value to the sum of all states/territories
            national_sum_state_leg_count = pd.DataFrame(
                [{std_col.STATE_POSTAL_COL: constants.US_ABBR,
                  COUNT_W: df_state_leg_totals[COUNT_W].astype(int).sum(),
                  COUNT_ALL: df_state_leg_totals[COUNT_ALL].astype(int).sum()}])

            us_congress_count = pd.DataFrame(
                [{std_col.STATE_POSTAL_COL: constants.US_ABBR, COUNT_ALL: df_us_congress_totals[COUNT_ALL].sum()}])

            # replace state/terr dfs with just US dfs
            df_state_leg_totals = national_sum_state_leg_count
            df_us_congress_totals = us_congress_count

        elif level == STATE_LEVEL:
            all_place_codes = df_us_congress_totals[std_col.STATE_POSTAL_COL].to_list(
            )

        output = []
        for current_place_code in all_place_codes:
            us_congress_women_current_place_all_races = count_matching_rows(
                df_line_items, current_place_code, NATIONAL_LEVEL, std_col.ALL_VALUE)

            us_congress_match_row = df_us_congress_totals.loc[
                df_us_congress_totals[std_col.STATE_POSTAL_COL] == current_place_code]

            us_congress_members_current_place_all_races = (
                0 if us_congress_match_row.empty
                else us_congress_match_row[COUNT_ALL].values[0])

            state_leg_women_current_place_all_races = count_matching_rows(
                df_line_items, current_place_code, STATE_COL_LINE, std_col.ALL_VALUE)

            state_leg_match_row = df_state_leg_totals.loc[
                df_state_leg_totals[std_col.STATE_POSTAL_COL] == current_place_code]

            state_leg_members_current_place_all_races = (
                0 if state_leg_match_row.empty
                else state_leg_match_row[COUNT_ALL].values[0])

            for cawp_race_name in CAWP_RACE_GROUPS_TO_STANDARD.keys():
                output_row = {}
                race_code = CAWP_RACE_GROUPS_TO_STANDARD[cawp_race_name]

                # calculate raw counts
                us_congress_women_current_place_current_race = count_matching_rows(
                    df_line_items, current_place_code, NATIONAL_LEVEL, cawp_race_name)
                state_leg_women_current_place_current_race = count_matching_rows(
                    df_line_items, current_place_code, STATE_LEVEL, cawp_race_name)

                # calculate incidence rates
                output_row[std_col.WOMEN_US_CONGRESS_PCT] = pct_never_null(
                    us_congress_women_current_place_current_race,
                    us_congress_members_current_place_all_races)

                output_row[std_col.WOMEN_STATE_LEG_PCT] = pct_never_null(
                    state_leg_women_current_place_current_race,
                    state_leg_members_current_place_all_races)

                # calculate incidence shares
                output_row[std_col.WOMEN_US_CONGRESS_PCT_SHARE] = pct_never_null(
                    us_congress_women_current_place_current_race,
                    us_congress_women_current_place_all_races)

                output_row[std_col.WOMEN_STATE_LEG_PCT_SHARE] = pct_never_null(
                    state_leg_women_current_place_current_race,
                    state_leg_women_current_place_all_races)

                # set this rows PLACE and RACE
                output_row[std_col.RACE_CATEGORY_ID_COL] = race_code
                output_row[std_col.STATE_POSTAL_COL] = current_place_code

                # add row for this place/race to output
                output.append(output_row)

        # column names for output df
        columns = [std_col.STATE_POSTAL_COL,
                   std_col.WOMEN_STATE_LEG_PCT,
                   std_col.WOMEN_STATE_LEG_PCT_SHARE,
                   std_col.WOMEN_US_CONGRESS_PCT,
                   std_col.WOMEN_US_CONGRESS_PCT_SHARE,
                   std_col.RACE_CATEGORY_ID_COL,
                   ]

        return pd.DataFrame(output, columns=columns)
