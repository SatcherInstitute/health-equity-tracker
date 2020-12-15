import json
import pandas
import requests
from datetime import datetime
import math
from datasources.standardized_columns import *

from ingestion import census, url_file_to_gcs, gcs_to_bq_util
from datasources.data_source import DataSource
from acs_utils import fetchAcsMetadata, parseAcsMetadata, fetchAcsVariables, acsJsonToDataFrame, fetchAcsGroup, getVarsForGroup, standardizeFrame




GROUPS = {
  # Note: B01003, B02001, and B03003 are not strictly necessary since you can
  # derive any of them by summing across values in
  # "HISPANIC OR LATINO ORIGIN BY RACE", but it is often clearer to use these
  # directly.
  "B01003": "TOTAL POPULATION", # Total
  "B02001": "RACE", # By race alone
  "B03003": "HISPANIC OR LATINO ORIGIN", # By hispanic/latino alone

  # Hispanic/latino separate. When doing it this way, we don't get sex/age
  # breakdowns. This is the best way to get cannonical race/ethnicity categories
  "B03002": "HISPANIC OR LATINO ORIGIN BY RACE",

  # By sex and age, for various races.
  "B01001": "SEX BY AGE",
  "B01001A": "SEX BY AGE (WHITE ALONE)",
  "B01001B": "SEX BY AGE (BLACK OR AFRICAN AMERICAN ALONE)",
  "B01001C": "SEX BY AGE (AMERICAN INDIAN AND ALASKA NATIVE ALONE)",
  "B01001D": "SEX BY AGE (ASIAN ALONE)",
  "B01001E": "SEX BY AGE (NATIVE HAWAIIAN AND OTHER PACIFIC ISLANDER ALONE)",
  "B01001F": "SEX BY AGE (SOME OTHER RACE ALONE)",
  "B01001G": "SEX BY AGE (TWO OR MORE RACES)",
  "B01001H": "SEX BY AGE (WHITE ALONE, NOT HISPANIC OR LATINO)",
  "B01001I": "SEX BY AGE (HISPANIC OR LATINO)"
}


SEX_BY_AGE_CONCEPTS_TO_RACE = {
  # All of these include Hispanic/Latino except B01001H.
  # Therefore, these are not standardized categories.
  "SEX BY AGE": "Total",
  "SEX BY AGE (WHITE ALONE)": "White alone",
  "SEX BY AGE (BLACK OR AFRICAN AMERICAN ALONE)": "Black or African American alone",
  "SEX BY AGE (AMERICAN INDIAN AND ALASKA NATIVE ALONE)": "American Indian and Alaska Native alone",
  "SEX BY AGE (ASIAN ALONE)": "Asian alone",
  "SEX BY AGE (NATIVE HAWAIIAN AND OTHER PACIFIC ISLANDER ALONE)": "Native Hawaiian and Other Pacific Islander alone",
  "SEX BY AGE (SOME OTHER RACE ALONE)": "Some other race alone",
  "SEX BY AGE (TWO OR MORE RACES)": "Two or more races",
  "SEX BY AGE (WHITE ALONE, NOT HISPANIC OR LATINO)": "White alone (Non-Hispanic)",
  "SEX BY AGE (HISPANIC OR LATINO)": "Hispanic or Latino"
}


# TODO pass in via scheduler payload
# TODO switch to 2019
BASE_ACS_URL = "https://api.census.gov/data/2018/acs/acs5"




#TODO some column value renaming: shorten race and age brackets

county_level = False

BASE_GROUP_BY_COLS = [STATE_FIPS_COL, COUNTY_FIPS_COL, COUNTY_NAME_COL] if county_level else [STATE_FIPS_COL, STATE_NAME_COL]
BASE_SORT_COLS = [STATE_FIPS_COL, COUNTY_FIPS_COL] if county_level else [STATE_FIPS_COL]



def getStandardizedRace(row):
    if (row[HISPANIC_COL] == 'Hispanic or Latino'):
        return row[HISPANIC_COL]
    else:
        return row[RACE_COL] + " (Non-Hispanic)"

# Standardized format using mutually exclusive groups by excluding Hispanic or
# Latino from other racial groups. Summing across all
# RACE_OR_HISPANIC_COL values equals the total population.
def standardizeRace(df):
    standardized_race = df.copy()
    standardized_race[RACE_OR_HISPANIC_COL] = standardized_race.apply(getStandardizedRace, axis=1)
    standardized_race = standardized_race.drop([HISPANIC_COL, RACE_COL], axis=1)
    group_by_cols = BASE_GROUP_BY_COLS.copy()
    group_by_cols.append(RACE_OR_HISPANIC_COL)
    standardized_race = standardized_race.groupby(group_by_cols).sum().reset_index()
    return standardized_race


def sortRaceFrame(df):
    sort_cols = BASE_SORT_COLS.copy()
    sort_cols.append(RACE_OR_HISPANIC_COL)
    return df.sort_values(sort_cols)


# Alternative format using non-mutually-exclusive groups, by including Hispanic
# or Latino in its own group and also in other racial groups in cases where they
# overlap. Totals are also included because summing over the column will give
# a larger number than the actual total.
def standardizeRaceNotMutuallyExclusive(df, total_frame):
    by_hispanic = df.copy()
    group_by_cols = BASE_GROUP_BY_COLS.copy()
    group_by_cols.append(HISPANIC_COL)
    by_hispanic = by_hispanic.groupby(group_by_cols).sum().reset_index()
    by_hispanic = by_hispanic.rename(columns={HISPANIC_COL: RACE_OR_HISPANIC_COL})

    by_race = df.copy()
    group_by_cols = BASE_GROUP_BY_COLS.copy()
    group_by_cols.append(RACE_COL)
    by_race = by_race.groupby(group_by_cols).sum().reset_index()
    by_race = by_race.rename(columns={RACE_COL: RACE_OR_HISPANIC_COL})

    combined = pandas.concat([by_hispanic, by_race, total_frame])
    return sortRaceFrame(combined)


def getAllRacesFrame(race_and_hispanic_frame, total_frame):
    all_races = standardizeRaceNotMutuallyExclusive(race_and_hispanic_frame, total_frame)
    standardized_race = standardizeRace(race_and_hispanic_frame)
    standardized_race = standardized_race.copy()
    # both variants of standardized race include a "Hispanic or Latino" group, so
    # remove from one before concatenating.
    standardized_race = standardized_race[standardized_race[RACE_OR_HISPANIC_COL] != "Hispanic or Latino"]
    all_races = pandas.concat([all_races, standardized_race])
    return sortRaceFrame(all_races)


def getSexByAgeByRace(var_map, sex_by_age_json):
    frames = []
    for concept, race in SEX_BY_AGE_CONCEPTS_TO_RACE.items():
        json_string = sex_by_age_json[concept]
        frame = acsJsonToDataFrame(json_string)
        group_vars = getVarsForGroup(concept, var_map, 2)
        sex_by_age = standardizeFrame(frame, group_vars, [SEX_COL, AGE_COL], county_level, POPULATION_COL)

        # TODO reorder columns
        sex_by_age[RACE_OR_HISPANIC_COL] = race
        frames.append(sex_by_age)
    return pandas.concat(frames)



# American Community Survey populationdata in the United States from the US Census.
class ACSPopulation(DataSource):

    @staticmethod
    def get_id():
        """Returns the data source's unique id. """
        return 'ACS_POPULATION'

    @staticmethod
    def get_table_name():
        """Returns the BigQuery table name where the data source's data will
        stored. """
        # TODO what if there are multiple tables?
        return 'acs_population'

    def upload_to_gcs(self, url, gcs_bucket, filename):
        """Uploads population data from census to GCS bucket."""

        metadata = fetchAcsMetadata()
        var_map = parseAcsMetadata(metadata, GROUPS)

        concept = "HISPANIC OR LATINO ORIGIN BY RACE"
        group_vars = getVarsForGroup(concept, var_map, 2)
        cols = list(group_vars.keys())
        url_params = census.get_census_params(cols, county_level)
        url_file_to_gcs.url_file_to_gcs(BASE_ACS_URL, url_params, gcs_bucket, concept.replace(" ", "_") + ".json")

    def write_to_bq(self, dataset, gcs_bucket, filename):
        """Writes population data to BigQuery from the provided GCS bucket

        dataset: The BigQuery dataset to write to
        table_name: The name of the biquery table to write to
        gcs_bucket: The name of the gcs bucket to read the data from
        filename: The name of the file in the gcs bucket to read from"""

        concept = "HISPANIC OR LATINO ORIGIN BY RACE"
        frame = gcs_to_bq_util.load_values_as_dataframe(
            gcs_bucket, concept.replace(" ", "_") + ".json")

        colTypes = {}
        for col in frame.columns:
            if col != "NAME" and col != "state" and col != "county":
                colTypes[col] = "int64"
        frame = frame.astype(colTypes)

        gcs_to_bq_util.append_dataframe_to_bq(frame, dataset, 'acs_population_race_and_ethnicity_state')
    
    def write_local_files_debug(self):
        metadata = fetchAcsMetadata()
        var_map = parseAcsMetadata(metadata, GROUPS)

        by_hisp_and_race_json = fetchAcsGroup("HISPANIC OR LATINO ORIGIN BY RACE", var_map, 2, county_level)
        total_json = fetchAcsVariables(['B01003_001E'], county_level)
        sex_by_age_json = {}
        for concept in SEX_BY_AGE_CONCEPTS_TO_RACE:
            json_string = fetchAcsGroup(concept, var_map, 2, county_level)
            sex_by_age_json[concept] = json_string

        race_and_hispanic_frame = standardizeFrame(
            acsJsonToDataFrame(by_hisp_and_race_json),
            getVarsForGroup("HISPANIC OR LATINO ORIGIN BY RACE", var_map, 2),
            [HISPANIC_COL, RACE_COL],
            county_level,
            POPULATION_COL)

        total_frame = standardizeFrame(
            acsJsonToDataFrame(total_json),
            {'B01003_001E': ['Total']},
            [RACE_OR_HISPANIC_COL],
            county_level,
            POPULATION_COL)

        frames = {
            'race_stand': standardizeRace(race_and_hispanic_frame),
            'race_nonstand': getAllRacesFrame(race_and_hispanic_frame, total_frame),
            'sex_by_age_by_race': getSexByAgeByRace(var_map, sex_by_age_json)
        }
        for key, df in frames.items():
            df.to_csv("table_" + key + ".csv", index=False)
            df.to_json("table_" + key + ".json", orient="records")
