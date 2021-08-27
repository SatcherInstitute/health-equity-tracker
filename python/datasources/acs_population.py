import pandas
from ingestion.standardized_columns import (HISPANIC_COL, RACE_COL,
                                            STATE_FIPS_COL, COUNTY_FIPS_COL,
                                            STATE_NAME_COL, COUNTY_NAME_COL,
                                            POPULATION_COL, AGE_COL, SEX_COL,
                                            Race, RACE_CATEGORY_ID_COL,
                                            RACE_INCLUDES_HISPANIC_COL,
                                            TOTAL_VALUE,
                                            add_race_columns_from_category_id)
from ingestion import url_file_to_gcs, gcs_to_bq_util
from datasources.data_source import DataSource
from ingestion.census import (get_census_params, fetch_acs_metadata,
                              parse_acs_metadata, fetch_acs_group,
                              get_vars_for_group, standardize_frame)


# TODO pass this in from message data.
BASE_ACS_URL = "https://api.census.gov/data/2019/acs/acs5"


HISPANIC_BY_RACE_CONCEPT = "HISPANIC OR LATINO ORIGIN BY RACE"


GROUPS = {
  # Hispanic/latino separate. When doing it this way, we don't get sex/age
  # breakdowns. This is the best way to get cannonical race/ethnicity categories
  "B03002": HISPANIC_BY_RACE_CONCEPT,

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
  # These include Hispanic/Latino, so they're not standardized categories.
  "SEX BY AGE": Race.TOTAL.value,
  "SEX BY AGE (WHITE ALONE)": Race.WHITE.value,
  "SEX BY AGE (BLACK OR AFRICAN AMERICAN ALONE)": Race.BLACK.value,
  "SEX BY AGE (AMERICAN INDIAN AND ALASKA NATIVE ALONE)": Race.AIAN.value,
  "SEX BY AGE (ASIAN ALONE)": Race.ASIAN.value,
  "SEX BY AGE (NATIVE HAWAIIAN AND OTHER PACIFIC ISLANDER ALONE)": Race.NHPI.value,
  "SEX BY AGE (SOME OTHER RACE ALONE)": Race.OTHER_STANDARD.value,
  "SEX BY AGE (TWO OR MORE RACES)": Race.MULTI.value,
  "SEX BY AGE (HISPANIC OR LATINO)": Race.HISP.value,

  # Doesn't include Hispanic/Latino
  "SEX BY AGE (WHITE ALONE, NOT HISPANIC OR LATINO)": Race.WHITE_NH.value
}


RACE_STRING_TO_CATEGORY_ID_INCLUDE_HISP = {
    "American Indian and Alaska Native alone": Race.AIAN.value,
    "Asian alone": Race.ASIAN.value,
    "Black or African American alone": Race.BLACK.value,
    "Native Hawaiian and Other Pacific Islander alone": Race.NHPI.value,
    "Some other race alone": Race.OTHER_STANDARD.value,
    "Two or more races": Race.MULTI.value,
    "White alone": Race.WHITE.value
}


RACE_STRING_TO_CATEGORY_ID_EXCLUDE_HISP = {
    "American Indian and Alaska Native alone": Race.AIAN_NH.value,
    "Asian alone": Race.ASIAN_NH.value,
    "Black or African American alone": Race.BLACK_NH.value,
    "Native Hawaiian and Other Pacific Islander alone": Race.NHPI_NH.value,
    "Some other race alone": Race.OTHER_STANDARD_NH.value,
    "Two or more races": Race.MULTI_NH.value,
    "White alone": Race.WHITE_NH.value
}


# TODO move this to a utility file and add tests.
def add_sum_of_rows(df, breakdown_col, value_col, new_row_breakdown_val,
                    breakdown_vals_to_sum=None):
    """Returns a new DataFrame by appending rows by summing the values of other
       rows. Automatically groups by all other columns, so this won't work if
       there are extraneous columns.

       For example, calling
           `add_sum_of_rows(df, 'race', 'population', 'Total')`
       will group by all columns except for 'race' and 'population, and for each
       group add a row with race='Total' and population=the sum of population
       for all races in that group.

       df: The DataFrame to calculate new rows from.
       breakdown_col: The name of the breakdown column that a new value is being
                      summed over.
       value_col: The name of the column whose values should be summed.
       new_row_breakdown_val: The value to use for the breakdown column.
       breakdown_vals_to_sum: The list of breakdown values to sum across. If not
                              provided, defaults to summing across all values.
       """
    filtered_df = df
    if breakdown_vals_to_sum is not None:
        filtered_df = df.loc[df[breakdown_col].isin(breakdown_vals_to_sum)]

    group_by_cols = list(df.columns)
    group_by_cols.remove(breakdown_col)
    group_by_cols.remove(value_col)

    sums = filtered_df.groupby(group_by_cols).sum().reset_index()
    sums[breakdown_col] = new_row_breakdown_val

    result = pandas.concat([df, sums])
    result = result.reset_index(drop=True)
    return result


def rename_age_bracket(bracket):
    """Converts ACS age bracket label to standardized bracket format of "a-b",
       where a is the lower end of the bracket and b is the upper end,
       inclusive.

       bracket: ACS age bracket."""
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


def update_col_types(frame):
    """Returns a new DataFrame with the column types replaced with int64 for
       population columns and string for other columns.

       frame: The original DataFrame"""
    colTypes = {}
    for col in frame.columns:
        if col != "NAME" and col != "state" and col != "county":
            colTypes[col] = "int64"
        else:
            colTypes["state"] = "string"
    frame = frame.astype(colTypes)
    return frame


class ACSPopulationIngester():
    """American Community Survey population data in the United States from the
       US Census."""

    def __init__(self, county_level, base_acs_url):
        # The base ACS url to use for API calls.
        self.base_acs_url = base_acs_url

        # Whether the data is at the county level. If false, it is at the state
        # level
        self.county_level = county_level

        # The base columns that are always used to group by.
        self.base_group_by_cols = (
            [STATE_FIPS_COL, COUNTY_FIPS_COL, COUNTY_NAME_COL] if county_level
            else [STATE_FIPS_COL, STATE_NAME_COL])

        # The base columns that are always used to sort by
        self.base_sort_by_cols = (
            [STATE_FIPS_COL, COUNTY_FIPS_COL] if county_level
            else [STATE_FIPS_COL])

    def upload_to_gcs(self, gcs_bucket):
        """Uploads population data from census to GCS bucket."""
        metadata = fetch_acs_metadata(self.base_acs_url)
        var_map = parse_acs_metadata(metadata, list(GROUPS.keys()))

        concepts = list(SEX_BY_AGE_CONCEPTS_TO_RACE.keys())
        concepts.append(HISPANIC_BY_RACE_CONCEPT)

        file_diff = False
        for concept in concepts:
            group_vars = get_vars_for_group(concept, var_map, 2)
            cols = list(group_vars.keys())
            url_params = get_census_params(cols, self.county_level)
            concept_file_diff = url_file_to_gcs.url_file_to_gcs(
                self.base_acs_url, url_params, gcs_bucket,
                self.get_filename(concept))
            file_diff = file_diff or concept_file_diff

        return file_diff

    def write_to_bq(self, dataset, gcs_bucket):
        """Writes population data to BigQuery from the provided GCS bucket

        dataset: The BigQuery dataset to write to
        gcs_bucket: The name of the gcs bucket to read the data from"""
        # TODO change this to have it read metadata from GCS bucket
        metadata = fetch_acs_metadata(self.base_acs_url)
        var_map = parse_acs_metadata(metadata, list(GROUPS.keys()))

        race_and_hispanic_frame = gcs_to_bq_util.load_values_as_dataframe(
            gcs_bucket, self.get_filename(HISPANIC_BY_RACE_CONCEPT))
        race_and_hispanic_frame = update_col_types(race_and_hispanic_frame)

        race_and_hispanic_frame = standardize_frame(
            race_and_hispanic_frame,
            get_vars_for_group(HISPANIC_BY_RACE_CONCEPT, var_map, 2),
            [HISPANIC_COL, RACE_COL],
            self.county_level,
            POPULATION_COL)

        sex_by_age_frames = {}
        for concept in SEX_BY_AGE_CONCEPTS_TO_RACE:
            sex_by_age_frame = gcs_to_bq_util.load_values_as_dataframe(
                gcs_bucket, self.get_filename(concept))
            sex_by_age_frame = update_col_types(sex_by_age_frame)
            sex_by_age_frames[concept] = sex_by_age_frame

        frames = {
            self.get_table_name_by_race(): self.get_all_races_frame(
                race_and_hispanic_frame),
            self.get_table_name_by_sex_age_race(): self.get_sex_by_age_and_race(
                var_map, sex_by_age_frames)
        }

        for table_name, df in frames.items():
            # All breakdown columns are strings
            column_types = {c: 'STRING' for c in df.columns}
            column_types[POPULATION_COL] = 'INT64'
            column_types[RACE_INCLUDES_HISPANIC_COL] = 'BOOL'
            gcs_to_bq_util.add_dataframe_to_bq(
                df, dataset, table_name, column_types=column_types)

    def write_local_files_debug(self):
        """Downloads and writes the tables to the local file system as csv and
           json files. This is only for debugging/convenience, and should not
           be used in production."""
        metadata = fetch_acs_metadata(self.base_acs_url)
        var_map = parse_acs_metadata(metadata, list(GROUPS.keys()))

        by_hisp_and_race_json = fetch_acs_group(
            self.base_acs_url, HISPANIC_BY_RACE_CONCEPT, var_map, 2,
            self.county_level)
        sex_by_age_frames = {}
        for concept in SEX_BY_AGE_CONCEPTS_TO_RACE:
            json_string = fetch_acs_group(
                self.base_acs_url, concept, var_map, 2, self.county_level)
            frame = gcs_to_bq_util.values_json_to_dataframe(json_string)
            sex_by_age_frames[concept] = update_col_types(frame)

        race_and_hispanic_frame = gcs_to_bq_util.values_json_to_dataframe(
            by_hisp_and_race_json)
        race_and_hispanic_frame = update_col_types(race_and_hispanic_frame)
        race_and_hispanic_frame = standardize_frame(
            race_and_hispanic_frame,
            get_vars_for_group(HISPANIC_BY_RACE_CONCEPT, var_map, 2),
            [HISPANIC_COL, RACE_COL],
            self.county_level,
            POPULATION_COL)

        frames = {
            self.get_table_name_by_race(): self.get_all_races_frame(
                race_and_hispanic_frame),
            self.get_table_name_by_sex_age_race(): self.get_sex_by_age_and_race(
                var_map, sex_by_age_frames)
        }
        for key, df in frames.items():
            df.to_csv("table_" + key + ".csv", index=False)
            df.to_json("table_" + key + ".json", orient="records")

    def get_table_geo_suffix(self):
        return "_county" if self.county_level else "_state"

    def get_table_name_by_race(self):
        return "by_race" + self.get_table_geo_suffix() + "_std"

    def get_table_name_by_sex_age_race(self):
        return "by_sex_age_race" + self.get_table_geo_suffix() + "_std"

    def get_filename(self, concept):
        """Returns the name of a file for the given ACS concept

        concept: The ACS concept description, eg 'SEX BY AGE'"""
        return self.add_filename_suffix(concept.replace(" ", "_"))

    def add_filename_suffix(self, root_name):
        """Adds geography and file type suffix to the root name.

        root_name: The root file name."""
        return root_name + self.get_table_geo_suffix() + ".json"

    def sort_race_frame(self, df):
        sort_cols = self.base_sort_by_cols.copy()
        sort_cols.append(RACE_CATEGORY_ID_COL)
        return df.sort_values(sort_cols)

    def sort_sex_age_race_frame(self, df):
        sort_cols = self.base_sort_by_cols.copy()
        # Note: This sorts alphabetically, which isn't ideal for the age column.
        # However, it doesn't matter how these are sorted in the backend, this
        # is just for convenience when looking at the data in BigQuery.
        sort_cols.extend([RACE_CATEGORY_ID_COL, SEX_COL, AGE_COL])
        return df.sort_values(sort_cols)

    def standardize_race_exclude_hispanic(self, df):
        """Standardized format using mutually exclusive groups by excluding
           Hispanic or Latino from other racial groups. Summing across all race
           categories equals the total population."""

        def get_race_category_id_exclude_hispanic(row):
            if (row[HISPANIC_COL] == 'Hispanic or Latino'):
                return Race.HISP.value
            else:
                return RACE_STRING_TO_CATEGORY_ID_EXCLUDE_HISP[row[RACE_COL]]

        standardized_race = df.copy()
        standardized_race[RACE_CATEGORY_ID_COL] = standardized_race.apply(
            get_race_category_id_exclude_hispanic, axis=1)
        standardized_race.drop(HISPANIC_COL, axis=1, inplace=True)

        group_by_cols = self.base_group_by_cols.copy()
        group_by_cols.append(RACE_CATEGORY_ID_COL)
        standardized_race = standardized_race.groupby(
            group_by_cols).sum().reset_index()
        return standardized_race

    def standardize_race_include_hispanic(self, df):
        """Alternative format where race categories include Hispanic/Latino.
           Totals are also included because summing over the column will give a
           larger number than the actual total."""
        by_hispanic = df.copy()
        group_by_cols = self.base_group_by_cols.copy()
        group_by_cols.append(HISPANIC_COL)
        by_hispanic = by_hispanic.groupby(group_by_cols).sum().reset_index()
        by_hispanic[RACE_CATEGORY_ID_COL] = by_hispanic.apply(
            lambda r: (Race.HISP.value
                       if r[HISPANIC_COL] == 'Hispanic or Latino'
                       else Race.NH.value),
            axis=1)
        by_hispanic.drop(HISPANIC_COL, axis=1, inplace=True)

        by_race = df.copy()
        group_by_cols = self.base_group_by_cols.copy()
        group_by_cols.append(RACE_COL)
        by_race = by_race.groupby(group_by_cols).sum().reset_index()
        by_race[RACE_CATEGORY_ID_COL] = by_race.apply(
            lambda r: RACE_STRING_TO_CATEGORY_ID_INCLUDE_HISP[r[RACE_COL]],
            axis=1)

        return pandas.concat([by_hispanic, by_race])

    def get_all_races_frame(self, race_and_hispanic_frame):
        """Includes all race categories, both including and not including
           Hispanic/Latino."""
        all_races = self.standardize_race_include_hispanic(
            race_and_hispanic_frame)
        standardized_race = self.standardize_race_exclude_hispanic(
            race_and_hispanic_frame)
        standardized_race = standardized_race.copy()
        # both variants of standardized race include a "Hispanic or Latino"
        # group, so remove from one before concatenating.
        standardized_race = standardized_race[
            standardized_race[RACE_CATEGORY_ID_COL] != Race.HISP.value]
        all_races = pandas.concat([all_races, standardized_race])

        # Drop extra columns before adding derived rows so they don't interfere
        # with grouping.
        all_races.drop(RACE_COL, axis=1, inplace=True)

        # Add derived rows.
        all_races = add_sum_of_rows(
            all_races, RACE_CATEGORY_ID_COL, POPULATION_COL, Race.TOTAL.value,
            list(RACE_STRING_TO_CATEGORY_ID_INCLUDE_HISP.values()))
        all_races = add_sum_of_rows(
            all_races, RACE_CATEGORY_ID_COL, POPULATION_COL,
            Race.MULTI_OR_OTHER_STANDARD_NH.value,
            [Race.MULTI_NH.value, Race.OTHER_STANDARD_NH.value])
        all_races = add_sum_of_rows(
            all_races, RACE_CATEGORY_ID_COL, POPULATION_COL,
            Race.MULTI_OR_OTHER_STANDARD.value,
            [Race.MULTI.value, Race.OTHER_STANDARD.value])

        add_race_columns_from_category_id(all_races)
        return self.sort_race_frame(all_races)

    def get_sex_by_age_and_race(self, var_map, sex_by_age_frames):
        """Returns a DataFrame of population by sex and age and race.

           var_map: ACS metadata variable map, as returned by
                    `parse_acs_metadata`
           sex_by_age_frames: Map of concept to non-standardized DataFrame for
                              that concept."""
        frames = []
        for concept, race in SEX_BY_AGE_CONCEPTS_TO_RACE.items():
            frame = sex_by_age_frames[concept]
            group_vars = get_vars_for_group(concept, var_map, 2)
            sex_by_age = standardize_frame(frame, group_vars,
                                           [SEX_COL, AGE_COL],
                                           self.county_level, POPULATION_COL)

            sex_by_age[RACE_CATEGORY_ID_COL] = race
            frames.append(sex_by_age)
        result = pandas.concat(frames)
        result[AGE_COL] = result[AGE_COL].apply(rename_age_bracket)

        result = add_sum_of_rows(result, AGE_COL, POPULATION_COL, TOTAL_VALUE)
        result = add_sum_of_rows(result, SEX_COL, POPULATION_COL, TOTAL_VALUE)

        add_race_columns_from_category_id(result)
        return self.sort_sex_age_race_frame(result)


class ACSPopulation(DataSource):

    @staticmethod
    def get_table_name():
        # Writes multiple tables, so this is not applicable.
        pass

    @staticmethod
    def get_id():
        """Returns the data source's unique id. """
        return 'ACS_POPULATION'

    def upload_to_gcs(self, gcs_bucket, **attrs):
        file_diff = False
        for ingester in self._create_ingesters():
            next_file_diff = ingester.upload_to_gcs(gcs_bucket)
            file_diff = file_diff or next_file_diff
        return file_diff

    def write_to_bq(self, dataset, gcs_bucket, **attrs):
        for ingester in self._create_ingesters():
            ingester.write_to_bq(dataset, gcs_bucket)

    def _create_ingesters(self):
        return [
            ACSPopulationIngester(False, BASE_ACS_URL),
            ACSPopulationIngester(True, BASE_ACS_URL)
        ]
