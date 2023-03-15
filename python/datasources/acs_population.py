import pandas as pd  # type: ignore
import ingestion.standardized_columns as std_col
import ingestion.constants as constants
from ingestion.standardized_columns import Race
from ingestion import url_file_to_gcs, gcs_to_bq_util, census
from datasources.data_source import DataSource
from ingestion.census import (get_census_params, parse_acs_metadata,
                              get_vars_for_group, standardize_frame, rename_age_bracket)
from ingestion.dataset_utils import add_sum_of_rows, generate_pct_share_col_without_unknowns
from ingestion.merge_utils import (ACS_DEFAULT_YEAR,
                                   ACS_EARLIEST_YEAR,
                                   ACS_LATEST_YEAR)


ACS_URLS_MAP = {
    ACS_EARLIEST_YEAR: 'https://api.census.gov/data/2009/acs/acs5',
    '2010': 'https://api.census.gov/data/2010/acs/acs5',
    '2011': 'https://api.census.gov/data/2011/acs/acs5',
    '2012': 'https://api.census.gov/data/2012/acs/acs5',
    '2013': 'https://api.census.gov/data/2013/acs/acs5',
    '2014': 'https://api.census.gov/data/2014/acs/acs5',
    '2015': 'https://api.census.gov/data/2015/acs/acs5',
    '2016': 'https://api.census.gov/data/2016/acs/acs5',
    '2017': 'https://api.census.gov/data/2017/acs/acs5',
    '2018': 'https://api.census.gov/data/2018/acs/acs5',
    ACS_DEFAULT_YEAR: 'https://api.census.gov/data/2019/acs/acs5',
    '2020': 'https://api.census.gov/data/2020/acs/acs5',
    ACS_LATEST_YEAR: 'https://api.census.gov/data/2021/acs/acs5',
}

HISPANIC_BY_RACE_CONCEPT = "HISPANIC OR LATINO ORIGIN BY RACE"


GROUPS = {
    # Hispanic/latino separate. When doing it this way, we don't get sex/age
    # breakdowns. This is the best way to get canonical race/ethnicity categories
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
    "SEX BY AGE": Race.ALL.value,
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


# This only works for the "Total" race category, because ACS provides more
# granular age buckets when looking at all races than when breaking down by
# race.
def get_decade_age_bucket(age_range):
    if age_range in {'0-4', '5-9'}:
        return '0-9'
    elif age_range in {'10-14', '15-17', '18-19'}:
        return '10-19'
    elif age_range in {'20-20', '21-21', '22-24', '25-29'}:
        return '20-29'
    elif age_range in {'30-34', '35-39'}:
        return '30-39'
    elif age_range in {'40-44', '45-49'}:
        return '40-49'
    elif age_range in {'50-54', '55-59'}:
        return '50-59'
    elif age_range in {'60-61', '62-64', '65-66', '67-69'}:
        return '60-69'
    elif age_range in {'70-74', '75-79'}:
        return '70-79'
    elif age_range in {'80-84', '85+'}:
        return '80+'
    elif age_range == std_col.ALL_VALUE:
        return std_col.ALL_VALUE


def get_uhc_standard_age_bucket(age_range):
    if age_range == std_col.ALL_VALUE:
        return std_col.ALL_VALUE
    # buckets for most UHC / AHR determinants
    elif age_range in {'18-19', '20-24', '20-20', '21-21', '22-24',
                       '25-29', '30-34', '35-44', '35-39', '40-44'}:
        return '18-44'
    elif age_range in {'45-54', '45-49', '50-54', '55-64', '55-59', '60-61', '62-64'}:
        return '45-64'
    elif age_range in {'65-74', '65-66', '67-69', '70-74', '75-84', '75-79', '80-84', '85+'}:
        return '65+'


def get_uhc_decade_plus_5_age_bucket(age_range):
    if age_range == std_col.ALL_VALUE:
        return std_col.ALL_VALUE
    # buckets for Suicide
    elif age_range in {'15-17', '18-19', '20-20', '21-21', '22-24'}:
        return '15-24'
    elif age_range in {'25-29', '30-34'}:
        return '25-34'
    elif age_range in {'35-39', '40-44'}:
        return '35-44'
    elif age_range in {'45-49', '50-54'}:
        return '45-54'
    elif age_range in {'55-59', '60-61', '62-64'}:
        return '55-64'
    elif age_range in {'65-66', '67-69', '70-74'}:
        return '65-74'
    elif age_range in {'75-79', '80-84'}:
        return '75-84'
    elif age_range in {'85+'}:
        return '85+'


def get_uhc_voter_age_bucket(age_range):
    if age_range == std_col.ALL_VALUE:
        return std_col.ALL_VALUE
    # buckets for Voter Participation
    elif age_range in {'18-19', '20-20', '21-21', '22-24'}:
        return '18-24'
    elif age_range in {'25-29', '30-34'}:
        return '25-34'
    elif age_range in {'35-39', '40-44'}:
        return '35-44'
    elif age_range in {'45-49', '50-54'}:
        return '45-54'
    elif age_range in {'55-59', '60-61', '62-64'}:
        return '55-64'


# buckets for BJS prisoners 2020
def get_prison_age_bucket(age_range):
    if age_range in {'18-19'}:
        return age_range
    elif age_range in {'20-20',
                       '21-21',
                       '22-24'}:
        return '20-24'
    elif age_range in {'25-29',
                       '30-34',
                       '35-39',
                       '40-44',
                       '45-49',
                       '50-54',
                       '55-59', }:
        return age_range
    elif age_range in {'60-61', '62-64'}:
        return '60-64'
    elif age_range in {'65-66',
                       '67-69',
                       '70-74',
                       '75-79',
                       '80-84',
                       '85+'}:
        return '65+'
    elif age_range == std_col.ALL_VALUE:
        return std_col.ALL_VALUE

# buckets for BJS Census of Jail


def get_jail_age_bucket(age_range):
    if age_range in {'0-4', '5-9', '10-14', '15-17', }:
        return '0-17'
    elif age_range in {'18-19',
                       '20-20',
                       '21-21',
                       '22-24',
                       '25-29',
                       '30-34',
                       '35-39',
                       '40-44',
                       '45-49',
                       '50-54',
                       '55-59',
                       '60-61',
                       '62-64',
                       '65-66',
                       '67-69',
                       '70-74',
                       '75-79',
                       '80-84',
                       '85+'}:
        return '18+'
    elif age_range == std_col.ALL_VALUE:
        return std_col.ALL_VALUE


def update_col_types(frame):
    """Returns a new DataFrame with the column types replaced with int64 for
       population columns and string for other columns.

       frame: The original DataFrame"""
    colTypes = {}
    for col in frame.columns:
        if col != "NAME" and col != "state" and col != "county":
            colTypes[col] = "int64"
        else:
            colTypes["state"] = str
    frame = frame.astype(colTypes)
    return frame


class ACSPopulationIngester():
    """American Community Survey population data in the United States from the
       US Census. This class is instanciated twice by ACSPopulation; once for county level
       and once for state+national level."""

    def __init__(self, county_level: bool, year: str):

        # Whether data is at county level. If false, it is state level
        self.county_level = county_level

        # The base columns that are always used to group by.
        self.base_group_by_cols = (
            [std_col.STATE_FIPS_COL, std_col.COUNTY_FIPS_COL, std_col.COUNTY_NAME_COL] if county_level
            else [std_col.STATE_FIPS_COL, std_col.STATE_NAME_COL])

        # The base columns that are always used to sort by
        self.base_sort_by_cols = (
            [std_col.STATE_FIPS_COL, std_col.COUNTY_FIPS_COL] if county_level
            else [std_col.STATE_FIPS_COL])

        self.year = year
        self.base_acs_url = ACS_URLS_MAP[year]

    def upload_to_gcs(self, gcs_bucket):
        """Uploads population data from census to GCS bucket."""

        metadata = census.fetch_acs_metadata(self.base_acs_url)
        var_map = parse_acs_metadata(metadata, list(GROUPS.keys()))

        concepts = list(SEX_BY_AGE_CONCEPTS_TO_RACE.keys())
        concepts.append(HISPANIC_BY_RACE_CONCEPT)

        file_diff = False
        for concept in concepts:
            group_vars = get_vars_for_group(concept, var_map, 2)
            cols = list(group_vars.keys())
            url_params = get_census_params(cols, self.county_level)
            filename = self.get_filename(concept)
            concept_file_diff = url_file_to_gcs.url_file_to_gcs(
                self.base_acs_url, url_params, gcs_bucket,
                filename)
            file_diff = file_diff or concept_file_diff

        return file_diff

    def write_to_bq(self, dataset, gcs_bucket):
        """Writes population data to BigQuery from the provided GCS bucket

        dataset: The BigQuery dataset to write to
        gcs_bucket: The name of the gcs bucket to read the data from"""

        frames = self.build_frames_for_this_year(
            gcs_bucket)

        # iterate across the prepared dataframe items
        # writing single-years and also queuing for time-series
        for table_name, df in frames.items():

            # SINGLE YEAR TABLE
            if self.year == ACS_DEFAULT_YEAR:
                df_single_year = df.copy()
                float_cols = [std_col.POPULATION_COL]
                if std_col.POPULATION_PCT_COL in df_single_year.columns:
                    float_cols.append(std_col.POPULATION_PCT_COL)
                column_types = gcs_to_bq_util.get_bq_column_types(
                    df_single_year, float_cols=float_cols)

                # write the default single year table without a time_period col
                # to maintain existing merge_util functionality
                gcs_to_bq_util.add_df_to_bq(
                    df_single_year, dataset, table_name, column_types=column_types)

            # TIME SERIES TABLE
            df_for_time_series = df.copy()
            df_for_time_series[std_col.TIME_PERIOD_COL] = self.year

            # the first year written should OVERWRITE, the subsequent years should APPEND
            overwrite = self.year == ACS_EARLIEST_YEAR

            float_cols = [std_col.POPULATION_COL]
            if std_col.POPULATION_PCT_COL in df_for_time_series.columns:
                float_cols.append(std_col.POPULATION_PCT_COL)
            column_types = gcs_to_bq_util.get_bq_column_types(
                df_for_time_series, float_cols=float_cols)
            gcs_to_bq_util.add_df_to_bq(
                df_for_time_series, dataset,
                f'{table_name}_time_series',
                column_types=column_types,
                overwrite=overwrite
            )

    def build_frames_for_this_year(self, gcs_bucket: str):
        """ Builds the various breakdown frames needed for this year's URL string """

        metadata = census.fetch_acs_metadata(self.base_acs_url)
        var_map = parse_acs_metadata(metadata, list(GROUPS.keys()))

        race_and_hispanic_frame = gcs_to_bq_util.load_values_as_df(
            gcs_bucket, self.get_filename(HISPANIC_BY_RACE_CONCEPT))
        race_and_hispanic_frame = update_col_types(race_and_hispanic_frame)

        race_and_hispanic_frame = standardize_frame(
            race_and_hispanic_frame,
            get_vars_for_group(HISPANIC_BY_RACE_CONCEPT, var_map, 2),
            [std_col.HISPANIC_COL, std_col.RACE_COL],
            self.county_level,
            std_col.POPULATION_COL)

        sex_by_age_frames = {}
        for concept in SEX_BY_AGE_CONCEPTS_TO_RACE:
            sex_by_age_frame = gcs_to_bq_util.load_values_as_df(
                gcs_bucket, self.get_filename(concept))
            sex_by_age_frame = update_col_types(sex_by_age_frame)
            sex_by_age_frames[concept] = sex_by_age_frame

        frames = {
            self.get_table_name_by_race(): self.get_all_races_frame(
                race_and_hispanic_frame),
            self.get_table_name_by_sex_age_race(): self.get_sex_by_age_and_race(
                var_map, sex_by_age_frames)
        }

        frames['by_sex_age_%s' % self.get_geo_name()] = self.get_by_sex_age(
            frames[self.get_table_name_by_sex_age_race()], get_decade_age_bucket)

        by_sex_standard_age_uhc = None
        by_sex_decade_plus_5_age_uhc = None
        by_sex_voter_age_uhc = None
        by_sex_bjs_prison_age = None
        by_sex_bjs_jail_age = None

        if not self.county_level:
            by_sex_standard_age_uhc = self.get_by_sex_age(
                frames[self.get_table_name_by_sex_age_race()], get_uhc_standard_age_bucket)
            by_sex_decade_plus_5_age_uhc = self.get_by_sex_age(
                frames[self.get_table_name_by_sex_age_race()], get_uhc_decade_plus_5_age_bucket)
            by_sex_voter_age_uhc = self.get_by_sex_age(
                frames[self.get_table_name_by_sex_age_race()], get_uhc_voter_age_bucket)
            by_sex_bjs_prison_age = self.get_by_sex_age(
                frames[self.get_table_name_by_sex_age_race()], get_prison_age_bucket)
            by_sex_bjs_jail_age = self.get_by_sex_age(
                frames[self.get_table_name_by_sex_age_race()], get_jail_age_bucket)

        frames['by_age_%s' % self.get_geo_name()] = self.get_by_age(
            frames['by_sex_age_%s' % self.get_geo_name()],
            by_sex_standard_age_uhc, by_sex_decade_plus_5_age_uhc,
            by_sex_voter_age_uhc, by_sex_bjs_prison_age, by_sex_bjs_jail_age)

        frames['by_sex_%s' % self.get_geo_name()] = self.get_by_sex(
            frames[self.get_table_name_by_sex_age_race()])

        # Generate national level datasets based on state datasets
        if not self.county_level:
            for demo in ['age', 'race', 'sex']:
                state_table_name = f'by_{demo}_state'
                frames[f'by_{demo}_national'] = generate_national_dataset_with_all_states(
                    frames[state_table_name], demo)

        return frames

    def get_table_geo_suffix(self):
        return "_county" if self.county_level else "_state"

    def get_geo_name(self):
        return 'county' if self.county_level else 'state'

    def get_fips_col(self):
        return std_col.COUNTY_FIPS_COL if self.county_level else std_col.STATE_FIPS_COL

    def get_geo_name_col(self):
        return std_col.COUNTY_NAME_COL if self.county_level else std_col.STATE_NAME_COL

    def get_table_name_by_race(self):
        return "by_race" + self.get_table_geo_suffix()

    def get_table_name_by_sex_age_race(self):
        return "by_sex_age_race" + self.get_table_geo_suffix()

    def get_filename(self, concept: str):
        """Returns the name of a file for the given ACS concept

        concept: The ACS concept description, eg 'SEX BY AGE' """

        filename = self.add_filename_suffix(concept.replace(" ", "_"))

        return f'{self.year}-{filename}'

    def add_filename_suffix(self, root_name):
        """Adds geography and file type suffix to the root name.

        root_name: The root file name."""
        return root_name + self.get_table_geo_suffix() + ".json"

    def sort_race_frame(self, df):
        sort_cols = self.base_sort_by_cols.copy()
        sort_cols.append(std_col.RACE_CATEGORY_ID_COL)
        return df.sort_values(sort_cols).reset_index(drop=True)

    def sort_sex_age_race_frame(self, df):
        sort_cols = self.base_sort_by_cols.copy()
        # Note: This sorts alphabetically, which isn't ideal for the age column.
        # However, it doesn't matter how these are sorted in the backend, this
        # is just for convenience when looking at the data in BigQuery.
        sort_cols.extend([std_col.RACE_CATEGORY_ID_COL,
                         std_col.SEX_COL, std_col.AGE_COL])
        return df.sort_values(sort_cols).reset_index(drop=True)

    def standardize_race_exclude_hispanic(self, df):
        """Standardized format using mutually exclusive groups by excluding
           Hispanic or Latino from other racial groups. Summing across all race
           categories equals the total population."""

        def get_race_category_id_exclude_hispanic(row):
            if (row[std_col.HISPANIC_COL] == 'Hispanic or Latino'):
                return Race.HISP.value
            else:
                return RACE_STRING_TO_CATEGORY_ID_EXCLUDE_HISP[row[std_col.RACE_COL]]

        standardized_race = df.copy()
        standardized_race[std_col.RACE_CATEGORY_ID_COL] = standardized_race.apply(
            get_race_category_id_exclude_hispanic, axis=1)
        standardized_race.drop(std_col.HISPANIC_COL, axis=1, inplace=True)

        group_by_cols = self.base_group_by_cols.copy()
        group_by_cols.append(std_col.RACE_CATEGORY_ID_COL)
        standardized_race = standardized_race.groupby(
            group_by_cols).sum().reset_index()
        return standardized_race

    def standardize_race_include_hispanic(self, df):
        """Alternative format where race categories include Hispanic/Latino.
           Totals are also included because summing over the column will give a
           larger number than the actual total."""
        by_hispanic = df.copy()
        group_by_cols = self.base_group_by_cols.copy()
        group_by_cols.append(std_col.HISPANIC_COL)
        by_hispanic = by_hispanic.groupby(group_by_cols).sum().reset_index()
        by_hispanic[std_col.RACE_CATEGORY_ID_COL] = by_hispanic.apply(
            lambda r: (Race.HISP.value
                       if r[std_col.HISPANIC_COL] == 'Hispanic or Latino'
                       else Race.NH.value),
            axis=1)
        by_hispanic.drop(std_col.HISPANIC_COL, axis=1, inplace=True)

        by_race = df.copy()
        group_by_cols = self.base_group_by_cols.copy()
        group_by_cols.append(std_col.RACE_COL)
        by_race = by_race.groupby(group_by_cols).sum().reset_index()
        by_race[std_col.RACE_CATEGORY_ID_COL] = by_race.apply(
            lambda r: RACE_STRING_TO_CATEGORY_ID_INCLUDE_HISP[r[std_col.RACE_COL]],
            axis=1)

        return pd.concat([by_hispanic, by_race])

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
            standardized_race[std_col.RACE_CATEGORY_ID_COL] != Race.HISP.value]
        all_races = pd.concat([all_races, standardized_race])

        # Drop extra columns before adding derived rows so they don't interfere
        # with grouping.
        all_races.drop(std_col.RACE_COL, axis=1, inplace=True)

        # Add derived rows.
        all_races = add_sum_of_rows(
            all_races, std_col.RACE_CATEGORY_ID_COL, std_col.POPULATION_COL, Race.ALL.value,
            list(RACE_STRING_TO_CATEGORY_ID_INCLUDE_HISP.values()))
        all_races = add_sum_of_rows(
            all_races, std_col.RACE_CATEGORY_ID_COL, std_col.POPULATION_COL,
            Race.MULTI_OR_OTHER_STANDARD_NH.value,
            [Race.MULTI_NH.value, Race.OTHER_STANDARD_NH.value])
        all_races = add_sum_of_rows(
            all_races, std_col.RACE_CATEGORY_ID_COL, std_col.POPULATION_COL,
            Race.MULTI_OR_OTHER_STANDARD.value,
            [Race.MULTI.value, Race.OTHER_STANDARD.value])
        all_races = add_sum_of_rows(
            all_races, std_col.RACE_CATEGORY_ID_COL, std_col.POPULATION_COL,
            Race.API_NH.value,
            [Race.ASIAN_NH.value, Race.NHPI_NH.value])
        all_races = add_sum_of_rows(
            all_races, std_col.RACE_CATEGORY_ID_COL, std_col.POPULATION_COL,
            Race.AIAN_API.value,
            [Race.AIAN.value, Race.ASIAN.value, Race.NHPI.value])

        all_races = generate_pct_share_col_without_unknowns(
            all_races, {std_col.POPULATION_COL: std_col.POPULATION_PCT_COL},
            std_col.RACE_CATEGORY_ID_COL, Race.ALL.value)

        std_col.add_race_columns_from_category_id(all_races)
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
                                           [std_col.SEX_COL, std_col.AGE_COL],
                                           self.county_level, std_col.POPULATION_COL)

            sex_by_age[std_col.RACE_CATEGORY_ID_COL] = race
            frames.append(sex_by_age)
        result = pd.concat(frames)
        result[std_col.AGE_COL] = result[std_col.AGE_COL].apply(
            rename_age_bracket)

        result = add_sum_of_rows(
            result, std_col.AGE_COL, std_col.POPULATION_COL, std_col.ALL_VALUE)
        result = add_sum_of_rows(
            result, std_col.SEX_COL, std_col.POPULATION_COL, std_col.ALL_VALUE)

        std_col.add_race_columns_from_category_id(result)
        return self.sort_sex_age_race_frame(result)

    def get_by_sex_age(self, by_sex_age_race_frame, age_aggregator_func):
        by_sex_age = by_sex_age_race_frame.loc[by_sex_age_race_frame[std_col.RACE_CATEGORY_ID_COL]
                                               == Race.ALL.value]

        cols = [
            std_col.STATE_FIPS_COL,
            self.get_fips_col(),
            self.get_geo_name_col(),
            std_col.SEX_COL,
            std_col.AGE_COL,
            std_col.POPULATION_COL,
        ]

        by_sex_age = by_sex_age[cols] if self.county_level else by_sex_age[cols[1:]]
        by_sex_age[std_col.AGE_COL] = by_sex_age[std_col.AGE_COL].apply(
            age_aggregator_func)

        groupby_cols = cols[:-1] if self.county_level else cols[1: -1]
        by_sex_age = by_sex_age.groupby(
            groupby_cols)[std_col.POPULATION_COL].sum().reset_index()

        return by_sex_age

    def get_by_age(self,
                   by_sex_age,
                   by_sex_standard_age_uhc=None,
                   by_sex_decade_plus_5_age_uhc=None,
                   by_sex_voter_age_uhc=None,
                   by_sex_bjs_prison_age=None,
                   by_sex_bjs_jail_age=None
                   ):
        by_age = by_sex_age.loc[by_sex_age[std_col.SEX_COL]
                                == std_col.ALL_VALUE]

        cols = [
            std_col.STATE_FIPS_COL,
            self.get_fips_col(),
            self.get_geo_name_col(),
            std_col.AGE_COL,
            std_col.POPULATION_COL,
        ]

        by_age = by_age[cols] if self.county_level else by_age[cols[1:]]

        if not self.county_level:
            by_standard_age_uhc = by_sex_standard_age_uhc.loc[
                by_sex_standard_age_uhc[std_col.SEX_COL] == std_col.ALL_VALUE]
            by_standard_age_uhc = by_standard_age_uhc[cols[1:]]
            by_decade_plus_5_age_uhc = by_sex_decade_plus_5_age_uhc.loc[
                by_sex_decade_plus_5_age_uhc[std_col.SEX_COL] == std_col.ALL_VALUE]
            by_decade_plus_5_age_uhc = by_decade_plus_5_age_uhc[cols[1:]]
            by_voter_age_uhc = by_sex_voter_age_uhc.loc[
                by_sex_voter_age_uhc[std_col.SEX_COL] == std_col.ALL_VALUE]
            by_voter_age_uhc = by_voter_age_uhc[cols[1:]]
            by_bjs_prison_age = by_sex_bjs_prison_age.loc[
                by_sex_bjs_prison_age[std_col.SEX_COL] == std_col.ALL_VALUE]
            by_bjs_prison_age = by_bjs_prison_age[cols[1:]]
            by_bjs_jail_age = by_sex_bjs_jail_age.loc[
                by_sex_bjs_jail_age[std_col.SEX_COL] == std_col.ALL_VALUE]
            by_bjs_jail_age = by_bjs_jail_age[cols[1:]]

            by_age = pd.concat([by_age,
                                by_standard_age_uhc,
                                by_decade_plus_5_age_uhc,
                                by_voter_age_uhc,
                                by_bjs_prison_age,
                                by_bjs_jail_age
                                ]).drop_duplicates().reset_index(drop=True)

        by_age = generate_pct_share_col_without_unknowns(
            by_age, {std_col.POPULATION_COL: std_col.POPULATION_PCT_COL}, std_col.AGE_COL, std_col.ALL_VALUE)

        by_age = by_age.sort_values(by=cols[1:-1]).reset_index(drop=True)
        return by_age

    def get_by_sex(self, by_sex_age_race_frame):
        by_sex = by_sex_age_race_frame.loc[
            (by_sex_age_race_frame[std_col.RACE_CATEGORY_ID_COL] == Race.ALL.value) &
            (by_sex_age_race_frame[std_col.AGE_COL] == std_col.ALL_VALUE)]

        cols = [
            std_col.STATE_FIPS_COL,
            self.get_fips_col(),
            self.get_geo_name_col(),
            std_col.SEX_COL,
            std_col.POPULATION_COL,
        ]

        by_sex = by_sex[cols] if self.county_level else by_sex[cols[1:]]

        by_sex = generate_pct_share_col_without_unknowns(
            by_sex, {std_col.POPULATION_COL: std_col.POPULATION_PCT_COL}, std_col.SEX_COL, std_col.ALL_VALUE)

        by_sex = by_sex.sort_values(by=cols[1:-1]).reset_index(drop=True)
        return by_sex


class ACSPopulation(DataSource):
    """ Called from the DAG  """

    @staticmethod
    def get_table_name():
        # Writes multiple tables, so this is not applicable.
        pass

    @staticmethod
    def get_id():
        """Returns the data source's unique id. """
        return 'ACS_POPULATION'

    def upload_to_gcs(self, gcs_bucket, **attrs):

        all_years = ACS_URLS_MAP.keys()

        file_diff = False
        for year in all_years:
            for is_county in [True, False]:
                ingester = ACSPopulationIngester(is_county, year)
                next_file_diff = ingester.upload_to_gcs(gcs_bucket)
                file_diff = file_diff or next_file_diff
        return file_diff

    def write_to_bq(self, dataset, gcs_bucket, **attrs):
        """ Called once per year url from DAG, creates a county and non-county
        ingester to proceed with processing the time-series tables and
        potentially single year tables """
        year = self.get_attr(attrs, 'year')

        for is_county in [True, False]:
            ingester = ACSPopulationIngester(is_county, year)
            ingester.write_to_bq(dataset, gcs_bucket)


def generate_national_dataset_with_all_states(state_df, demographic_breakdown_category):
    all_state_fips = set(state_df[std_col.STATE_FIPS_COL].to_list())
    return GENERATE_NATIONAL_DATASET(state_df, all_state_fips, demographic_breakdown_category)


def GENERATE_NATIONAL_DATASET(state_df, states_to_include, demographic_breakdown_category):
    df = state_df.loc[state_df[std_col.STATE_FIPS_COL].isin(states_to_include)]
    df = df.drop(columns=std_col.POPULATION_PCT_COL)

    breakdown_map = {
        'race': std_col.RACE_CATEGORY_ID_COL,
        'age': std_col.AGE_COL,
        'sex': std_col.SEX_COL,
    }

    df = df.groupby(
        breakdown_map[demographic_breakdown_category]).sum().reset_index()

    df[std_col.STATE_FIPS_COL] = constants.US_FIPS
    df[std_col.STATE_NAME_COL] = constants.US_NAME

    needed_cols = [std_col.STATE_FIPS_COL, std_col.STATE_NAME_COL,
                   std_col.POPULATION_COL, std_col.POPULATION_PCT_COL]
    if demographic_breakdown_category == 'race':
        needed_cols.extend(std_col.RACE_COLUMNS)
    else:
        needed_cols.append(breakdown_map[demographic_breakdown_category])

    total_val = std_col.ALL_VALUE
    if demographic_breakdown_category == 'race':
        total_val = Race.ALL.value

    df = generate_pct_share_col_without_unknowns(
        df, {std_col.POPULATION_COL: std_col.POPULATION_PCT_COL},
        breakdown_map[demographic_breakdown_category], total_val)

    if demographic_breakdown_category == 'race':
        std_col.add_race_columns_from_category_id(df)

    df[std_col.STATE_FIPS_COL] = df[std_col.STATE_FIPS_COL].astype(str)
    return df[needed_cols].sort_values(by=breakdown_map[demographic_breakdown_category]).reset_index(drop=True)
