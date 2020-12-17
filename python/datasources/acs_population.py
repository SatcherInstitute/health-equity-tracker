import json
import pandas
import requests
from datetime import datetime
import math
from ingestion.standardized_columns import *

from ingestion import url_file_to_gcs, gcs_to_bq_util
from datasources.data_source import DataSource
from ingestion.census import get_census_params, fetch_acs_metadata, parse_acs_metadata, fetch_acs_variables, fetch_acs_group, get_vars_for_group, standardize_frame


# TODO move to standardized columns file
# TODO add Asian/Pacific Islander combined, and Indigenous combined
RACE_AIAN = "American Indian and Alaska Native"
RACE_AIAN_NH = "American Indian and Alaska Native (Non-Hispanic)"
RACE_ASIAN = "Asian"
RACE_ASIAN_NH = "Asian (Non-Hispanic)"
RACE_BLACK = "Black or African American"
RACE_BLACK_NH = "Black or African American (Non-Hispanic)"
RACE_HISP = "Hispanic or Latino"
RACE_NHPI = "Native Hawaiian and Pacific Islander"
RACE_NHPI_NH = "Native Hawaiian and Pacific Islander (Non-Hispanic)"
RACE_NH = "Not Hispanic or Latino"
RACE_OTHER = "Some other race"
RACE_OTHER_NH = "Some other race (Non-Hispanic)"
RACE_TOTAL = "Total"
RACE_MULTI = "Two or more races"
RACE_MULTI_NH = "Two or more races (Non-Hispanic)"
RACE_WHITE = "White"
RACE_WHITE_NH = "White (Non-Hispanic)"


GROUPS = {
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
  "SEX BY AGE": RACE_TOTAL,
  "SEX BY AGE (WHITE ALONE)": RACE_WHITE,
  "SEX BY AGE (BLACK OR AFRICAN AMERICAN ALONE)": RACE_BLACK,
  "SEX BY AGE (AMERICAN INDIAN AND ALASKA NATIVE ALONE)": RACE_AIAN,
  "SEX BY AGE (ASIAN ALONE)": RACE_ASIAN,
  "SEX BY AGE (NATIVE HAWAIIAN AND OTHER PACIFIC ISLANDER ALONE)": RACE_NHPI,
  "SEX BY AGE (SOME OTHER RACE ALONE)": RACE_OTHER,
  "SEX BY AGE (TWO OR MORE RACES)": RACE_MULTI,
  "SEX BY AGE (WHITE ALONE, NOT HISPANIC OR LATINO)": RACE_WHITE_NH,
  "SEX BY AGE (HISPANIC OR LATINO)": RACE_HISP
}


RENAME_RACE = {
    "American Indian and Alaska Native alone": RACE_AIAN,
    "Asian alone": RACE_ASIAN,
    "Black or African American alone": RACE_BLACK,
    "Native Hawaiian and Other Pacific Islander alone": RACE_NHPI,
    "Some other race alone": RACE_OTHER,
    "Two or more races": RACE_MULTI,
    "White alone": RACE_WHITE
}


BASE_TABLE_NAME_BY_RACE = "acs_population_by_race"
BASE_TABLE_NAME_BY_SEX_AGE_RACE = "acs_population_by_sex_age_race"


def rename_age_bracket(bracket):
    parts = bracket.split()
    if len(parts) == 3 and parts[0] == "Under":
        return "0-" + str(int(parts[1]) - 1)
    elif len(parts) == 4 and parts[1] == "to" and parts[3] == "years":
        return parts[0] + "-" + parts[2]
    elif len(parts) == 4 and parts[1] == "and" and parts[3] == "years":
        return parts[0] + "-" + parts[2]
    elif len(parts) == 2 and parts[1] == "years":
        return parts[0] + "-" + parts[0]
    elif len(parts) == 4 and " ".join(parts[1:]) == "years and over":
        return parts[0] + "+"
    else:
        return bracket


def rename_race_value(race):
    renamed_race = RENAME_RACE.get(race)
    if renamed_race:
        return renamed_race
    return race


def get_standardized_race(row):
    if (row[HISPANIC_COL] == 'Hispanic or Latino'):
        return row[HISPANIC_COL]
    else:
        return rename_race_value(row[RACE_COL]) + " (Non-Hispanic)"


def get_filename(concept):
    return concept.replace(" ", "_") + ".json"


def update_col_types(frame):
    colTypes = {}
    for col in frame.columns:
        if col != "NAME" and col != "state" and col != "county":
            colTypes[col] = "int64"
        else:
            colTypes["state"] = "string"
    frame = frame.astype(colTypes)
    return frame


# American Community Survey populationdata in the United States from the US Census.
class ACSPopulationBase(DataSource):

    def __init__(self, county_level):
        # TODO pass this in from message data.
        self.base_acs_url = "https://api.census.gov/data/2019/acs/acs5"
        self.county_level = county_level
        self.base_group_by_cols = [STATE_FIPS_COL, COUNTY_FIPS_COL, COUNTY_NAME_COL] if county_level else [STATE_FIPS_COL, STATE_NAME_COL]
        self.base_sort_by_cols = [STATE_FIPS_COL, COUNTY_FIPS_COL] if county_level else [STATE_FIPS_COL]

    @staticmethod
    def get_id():
        """Returns the data source's unique id. """
        # Children implement this.
        pass

    @staticmethod
    def get_table_name():
        """Returns the BigQuery table name where the data source's data will
        stored. """
        # Writes multiple tables, so this is not applicable.
        pass

    def upload_to_gcs(self, url, gcs_bucket, filename):
        """Uploads population data from census to GCS bucket."""
        metadata = fetch_acs_metadata(self.base_acs_url)
        var_map = parse_acs_metadata(metadata, list(GROUPS.keys()))

        concepts = list(SEX_BY_AGE_CONCEPTS_TO_RACE.keys())
        concepts.append("HISPANIC OR LATINO ORIGIN BY RACE")

        for concept in concepts:
            group_vars = get_vars_for_group(concept, var_map, 2)
            cols = list(group_vars.keys())
            url_params = get_census_params(cols, self.county_level)
            url_file_to_gcs.url_file_to_gcs(
                self.base_acs_url, url_params, gcs_bucket, get_filename(concept))
        # Total population
        url_params = get_census_params(['B01003_001E'], self.county_level)
        url_file_to_gcs.url_file_to_gcs(
            self.base_acs_url, url_params, gcs_bucket, 'B01003_001E.json')

    def write_to_bq(self, dataset, gcs_bucket, filename):
        """Writes population data to BigQuery from the provided GCS bucket

        dataset: The BigQuery dataset to write to
        table_name: The name of the biquery table to write to
        gcs_bucket: The name of the gcs bucket to read the data from
        filename: The name of the file in the gcs bucket to read from"""
        # TODO change this to have it read metadata from GCS bucket
        metadata = fetch_acs_metadata(self.base_acs_url)
        var_map = parse_acs_metadata(metadata, list(GROUPS.keys()))

        concept = "HISPANIC OR LATINO ORIGIN BY RACE"
        race_and_hispanic_frame = gcs_to_bq_util.load_values_as_dataframe(
            gcs_bucket, get_filename(concept))
        race_and_hispanic_frame = update_col_types(race_and_hispanic_frame)

        race_and_hispanic_frame = standardize_frame(
            race_and_hispanic_frame,
            get_vars_for_group("HISPANIC OR LATINO ORIGIN BY RACE", var_map, 2),
            [HISPANIC_COL, RACE_COL],
            self.county_level,
            POPULATION_COL)

        total_frame = gcs_to_bq_util.load_values_as_dataframe(
            gcs_bucket, 'B01003_001E.json')
        total_frame = update_col_types(total_frame)
        total_frame = standardize_frame(
            total_frame,
            {'B01003_001E': ['Total']},
            [RACE_OR_HISPANIC_COL],
            self.county_level,
            POPULATION_COL)

        sex_by_age_frames = {}
        for concept in SEX_BY_AGE_CONCEPTS_TO_RACE:
            sex_by_age_frame = gcs_to_bq_util.load_values_as_dataframe(
                gcs_bucket, get_filename(concept))
            sex_by_age_frame = update_col_types(sex_by_age_frame)
            sex_by_age_frames[concept] = sex_by_age_frame

        geo_suffix = "_county" if self.county_level else "_state"
        frames = {
            BASE_TABLE_NAME_BY_RACE + geo_suffix: self.get_all_races_frame(
                race_and_hispanic_frame, total_frame),
            BASE_TABLE_NAME_BY_SEX_AGE_RACE + geo_suffix: self.get_sex_by_age_and_race(
                var_map, sex_by_age_frames)
        }

        for table_name, df in frames.items():
            # All breakdown columns are strings
            column_types = { c: 'STRING' for c in df.columns }
            column_types[POPULATION_COL] = 'INT64'
            gcs_to_bq_util.append_dataframe_to_bq(
                df, dataset, table_name, column_types=column_types)
    
    def write_local_files_debug(self):
        """Downloads and writes the tables to the local file system as csv and
           json files. This is only for debugging/convenience, and should not
           be used in production."""
        metadata = fetch_acs_metadata(self.base_acs_url)
        var_map = parse_acs_metadata(metadata, list(GROUPS.keys()))

        by_hisp_and_race_json = fetch_acs_group(
            self.base_acs_url, "HISPANIC OR LATINO ORIGIN BY RACE", var_map, 2,
            self.county_level)
        total_json = fetch_acs_variables(
            self.base_acs_url, ['B01003_001E'], self.county_level)
        sex_by_age_frames = {}
        for concept in SEX_BY_AGE_CONCEPTS_TO_RACE:
            json_string = fetch_acs_group(
                self.base_acs_url, concept, var_map, 2, self.county_level)
            frame = gcs_to_bq_util.values_json_to_dataframe(json_string)
            sex_by_age_frames[concept] = update_col_types(frame)

        race_and_hispanic_frame = gcs_to_bq_util.values_json_to_dataframe(by_hisp_and_race_json)
        race_and_hispanic_frame = update_col_types(race_and_hispanic_frame)
        race_and_hispanic_frame = standardize_frame(
            race_and_hispanic_frame,
            get_vars_for_group("HISPANIC OR LATINO ORIGIN BY RACE", var_map, 2),
            [HISPANIC_COL, RACE_COL],
            self.county_level,
            POPULATION_COL)

        total_frame = gcs_to_bq_util.values_json_to_dataframe(total_json)
        total_frame = update_col_types(total_frame)
        total_frame = standardize_frame(
            total_frame,
            {'B01003_001E': ['Total']},
            [RACE_OR_HISPANIC_COL],
            self.county_level,
            POPULATION_COL)

        frames = {
            BASE_TABLE_NAME_BY_RACE: self.get_all_races_frame(
                race_and_hispanic_frame, total_frame),
            BASE_TABLE_NAME_BY_SEX_AGE_RACE: self.get_sex_by_age_and_race(
                var_map, sex_by_age_frames)
        }
        for key, df in frames.items():
            df.to_csv("table_" + key + ".csv", index=False)
            df.to_json("table_" + key + ".json", orient="records")

    def sort_race_frame(self, df):
        sort_cols = self.base_sort_by_cols.copy()
        sort_cols.append(RACE_OR_HISPANIC_COL)
        return df.sort_values(sort_cols)

    def standardize_race(self, df):
        """Standardized format using mutually exclusive groups by excluding
           Hispanic or Latino from other racial groups. Summing across all
           RACE_OR_HISPANIC_COL values equals the total population."""
        standardized_race = df.copy()
        standardized_race[RACE_OR_HISPANIC_COL] = standardized_race.apply(
            get_standardized_race, axis=1)
        standardized_race = standardized_race.drop([HISPANIC_COL, RACE_COL], axis=1)
        group_by_cols = self.base_group_by_cols.copy()
        group_by_cols.append(RACE_OR_HISPANIC_COL)
        standardized_race = standardized_race.groupby(group_by_cols).sum().reset_index()
        return standardized_race

    def standardize_race_include_hispanic(self, df, total_frame):
        """Alternative format where race categories includ Hispanic/Latino.
           Totals are also included because summing over the column will give a
           larger number than the actual total."""
        by_hispanic = df.copy()
        group_by_cols = self.base_group_by_cols.copy()
        group_by_cols.append(HISPANIC_COL)
        by_hispanic = by_hispanic.groupby(group_by_cols).sum().reset_index()
        by_hispanic = by_hispanic.rename(columns={HISPANIC_COL: RACE_OR_HISPANIC_COL})

        by_race = df.copy()
        by_race[RACE_COL] = by_race[RACE_COL].apply(rename_race_value)
        group_by_cols = self.base_group_by_cols.copy()
        group_by_cols.append(RACE_COL)
        by_race = by_race.groupby(group_by_cols).sum().reset_index()
        by_race = by_race.rename(columns={RACE_COL: RACE_OR_HISPANIC_COL})

        combined = pandas.concat([by_hispanic, by_race, total_frame])
        return self.sort_race_frame(combined)

    def get_all_races_frame(self, race_and_hispanic_frame, total_frame):
        """Includes all race categories, both including and not including
           Hispanic/Latino."""
        all_races = self.standardize_race_include_hispanic(race_and_hispanic_frame, total_frame)
        standardized_race = self.standardize_race(race_and_hispanic_frame)
        standardized_race = standardized_race.copy()
        # both variants of standardized race include a "Hispanic or Latino" group, so
        # remove from one before concatenating.
        standardized_race = standardized_race[standardized_race[RACE_OR_HISPANIC_COL] != "Hispanic or Latino"]
        all_races = pandas.concat([all_races, standardized_race])
        return self.sort_race_frame(all_races)
    
    def get_sex_by_age_and_race(self, var_map, sex_by_age_frames):
        frames = []
        for concept, race in SEX_BY_AGE_CONCEPTS_TO_RACE.items():
            frame = sex_by_age_frames[concept]
            group_vars = get_vars_for_group(concept, var_map, 2)
            sex_by_age = standardize_frame(frame, group_vars, [SEX_COL, AGE_COL], self.county_level, POPULATION_COL)

            # TODO reorder columns so population is last
            sex_by_age[RACE_OR_HISPANIC_COL] = race
            frames.append(sex_by_age)
        result = pandas.concat(frames)
        result[AGE_COL] = result[AGE_COL].apply(rename_age_bracket)
        return result


class ACSStatePopulation(ACSPopulationBase):
    def __init__(self):
        super().__init__(False)

    @staticmethod
    def get_id():
        """Returns the data source's unique id. """
        return 'ACS_POPULATION_STATE'


class ACSCountyPopulation(ACSPopulationBase):
    def __init__(self):
        super().__init__(True)

    @staticmethod
    def get_id():
        """Returns the data source's unique id. """
        return 'ACS_POPULATION_COUNTY'
