import json
import pandas as pd

from ingestion.constants import HealthInsurancePopulation
from datasources.data_source import DataSource
from ingestion import url_file_to_gcs, gcs_to_bq_util

from ingestion.acs_utils import (
    MetadataKey,
    parseMetadata,
    trimMetadata,
    get_acs_data_from_variables,
    get_params,
)
from ingestion.census import (
    fetch_acs_metadata,
    get_state_fips_mapping,
    get_county_fips_mapping,
)
from ingestion.standardized_columns import (
    STATE_FIPS_COL,
    COUNTY_FIPS_COL,
    STATE_NAME_COL,
    COUNTY_NAME_COL,
    AGE_COL,
    SEX_COL,
    RACE_CATEGORY_ID_COL,
    RACE_INCLUDES_HISPANIC_COL,
    WITH_HEALTH_INSURANCE_COL,
    WITHOUT_HEALTH_INSURANCE_COL,
    TOTAL_HEALTH_INSURANCE_COL,
    Race,
    add_race_columns_from_category_id,
)

# TODO pass this in from message data.
BASE_ACS_URL = "https://api.census.gov/data/2019/acs/acs5"


# ACS Health Insurance By Race Prefixes.
# Acs variables are in the form C27001A_xxx0 C27001A_xxx2 ect
# to determine age buckets.  The metadata variables are merged with the suffixes to form the entire metadeta.
HEALTH_INSURANCE_BY_RACE_GROUP_PREFIXES = {
    "C27001A": Race.WHITE.value,
    "C27001B": Race.BLACK.value,
    "C27001C": Race.AIAN.value,
    "C27001D": Race.ASIAN.value,
    "C27001E": Race.NHPI.value,
    "C27001F": Race.OTHER_STANDARD.value,
    "C27001G": Race.MULTI.value,
    "C27001H": Race.WHITE_NH.value,
    "C27001I": Race.HISP.value,
}


# Health insurance by Sex only has one prefix, and is kept
# in the form of a dict to help with standardizing code flow
HEALTH_INSURANCE_BY_SEX_GROUPS_PREFIX = "B27001"


def get_race_from_key(key):
    parts = key.split("_")
    return HEALTH_INSURANCE_BY_RACE_GROUP_PREFIXES[parts[0]]


class AcsHealhInsuranceRaceIngestor:

    # Initialize variables in class instance, also merge all metadata so that lookup of the
    # prefix, suffix combos can return the entire metadata
    def __init__(self, base_url):
        self.base_url = base_url
        metadata = fetch_acs_metadata(self.base_url)["variables"]
        metadata = trimMetadata(
            metadata, HEALTH_INSURANCE_BY_RACE_GROUP_PREFIXES.keys()
        )
        self.metadata = parseMetadata(
            metadata, [MetadataKey.AGE,
                       MetadataKey.RACE], self.metadataInitializer
        )
        for k, v in self.metadata.items():
            if MetadataKey.POPULATION not in v:
                self.metadata[k][
                    MetadataKey.POPULATION
                ] = HealthInsurancePopulation.TOTAL
        self.state_fips = get_state_fips_mapping(base_url)
        self.county_fips = get_county_fips_mapping(base_url)
        self.data = {}

    def metadataInitializer(self, key):
        return {MetadataKey.RACE: get_race_from_key(key)}

    # Gets standardized filename
    # If race is set, gets race filename
    # If race is None and sex is set, gets filename for sex
    def get_filename(self, race, is_county):
        geo = "STATE" if is_county else "COUNTY"
        race = race.replace(" ", "_").upper()
        return "HEALTH_INSURANCE_BY_RACE_{0}_{1}.json".format(geo, race)

    # Method to output <Filename.csv>.  Used for debugging purposes.
    def write_local_files_debug(self):

        with open("acs_health_insurance_by_race_metadata.json", "w") as f:
            print(json.dumps(self.metadata, indent=4), file=f)

        self.getData()

        with open("acs_health_insurance_by_race_internal_data.json", "w") as f:
            print(
                json.dumps({str(k): v for k, v in self.data.items()}, indent=4), file=f
            )

        self.split_data_frames()

        for table_name, df in self.frames.items():
            df.to_csv(table_name + ".csv", index=False)
            df.to_json(table_name + ".json", orient="records", indent=4)

    # Uploads the ACS data to GCS by providing
    # the ACS Base URL
    # Acs Query Params
    # Standardized Filename
    #
    # An example file created in GCS:
    # HEALTH_INSURANCE_BY_RACE_COUNTY_WHITE_ALONE.json
    #
    # Returns:
    # FileDiff = If the data has changed by diffing the old run vs the new run.
    # (presumably to skip the write to bq step though not 100% sure as of writing this)
    def upload_to_gcs(self, bucket):
        # Iterates over the different race ACS variables,
        # retrieves the race from the metadata merged dict
        # writes the data to the GCS bucket and sees if file diff is changed
        file_diff = False
        for prefix_key in HEALTH_INSURANCE_BY_RACE_GROUP_PREFIXES:
            race = HEALTH_INSURANCE_BY_RACE_GROUP_PREFIXES[prefix_key]
            for is_county in [True, False]:
                params = get_params(prefix_key, is_county)

                file_diff = (
                    url_file_to_gcs.url_file_to_gcs(
                        self.base_url,
                        params,
                        bucket,
                        self.get_filename(race, is_county),
                    )
                    or file_diff
                )

        return file_diff

    def write_to_bq(self, dataset, gcs_bucket):
        self.getData(gcs_bucket=gcs_bucket)

        # Split internal memory into data frames for sex/race by state/county
        self.split_data_frames()

        # Create BQ columns and write dataframes to BQ
        for table_name, df in self.frames.items():
            # All breakdown columns are strings
            column_types = {c: "STRING" for c in df.columns}

            if RACE_INCLUDES_HISPANIC_COL in df.columns:
                column_types[RACE_INCLUDES_HISPANIC_COL] = "BOOL"

            column_types[WITH_HEALTH_INSURANCE_COL] = "INT64"
            column_types[WITHOUT_HEALTH_INSURANCE_COL] = "INT64"
            column_types[TOTAL_HEALTH_INSURANCE_COL] = "INT64"

            gcs_to_bq_util.add_df_to_bq(
                df, dataset, table_name, column_types=column_types
            )

    #   Get Health insurance data from either GCS or Directly, and aggregate the data in memory

    def getData(self, gcs_bucket=None):
        if gcs_bucket is not None:
            for race in HEALTH_INSURANCE_BY_RACE_GROUP_PREFIXES.values():
                for is_county in [True, False]:
                    # Get cached data from GCS
                    data = gcs_to_bq_util.load_values_as_json(
                        gcs_bucket, self.get_filename(race, is_county)
                    )
                    self.accumulate_acs_data(data)
        else:
            for prefix in HEALTH_INSURANCE_BY_RACE_GROUP_PREFIXES:
                for is_county in [True, False]:
                    data = get_acs_data_from_variables(
                        self.base_url, get_params(prefix, is_county)
                    )
                    self.accumulate_acs_data(data)

    """
    Takes data in the form of
    [
        [C27001A_002E, C27001A_003E, C27001B_002E, C27001B_002E][state][?county],
        [12345, 1245, 123546, 124567, 01, 02]
        ...
    ]
    This method determines the variables at the top (aka: key_row)
    matches the value with the metadata from the prefix_suffix list
    and stores it in the self.data as a tuple

    (state_fip, county_fip, age, sex, race) example:
    {
        "('01', None, '0-6', 'Male', None)": {
            "Total": "177643",
            "With": "172850",
            "Without": "4793"
        },
        "('01', None, '6-18', 'Male', None)": {
            "Total": "414407",
            "With": "400460",
            "Without": "13947"
        },
        ...
    } Note: This can be debugged via the total_health_insurance.json output file via local_debug
    """

    def accumulate_acs_data(self, data):
        key_row = data[0]
        for row in data[1::]:
            data = {}
            for key in key_row:
                if key != "state" and key != "county" and key in self.metadata:
                    data[key] = {}
            state_fip = None
            county_fip = None
            for col_index in range(len(row)):
                col = row[col_index]
                key = key_row[col_index]

                if key == "state":
                    state_fip = col  # Extract the static key_row state
                elif key == "county":
                    # Extract the static key_row (county) *if exists
                    county_fip = col
                elif key in self.metadata:
                    data[key] = {"value": col, "meta": self.metadata[key]}

            for key in data:
                metadata = data[key]["meta"]
                population = data[key]["value"]
                row = self.upsert_row(
                    state_fip,
                    county_fip,
                    metadata.get(MetadataKey.AGE),
                    metadata.get(MetadataKey.RACE),
                )
                row[metadata[MetadataKey.POPULATION]] = population

    def upsert_row(self, state_fip, county_fip, age, race):
        if (state_fip, county_fip, age, race) not in self.data:
            self.data[(state_fip, county_fip, age, race)] = {
                HealthInsurancePopulation.TOTAL: -1,
                HealthInsurancePopulation.WITH: -1,
                HealthInsurancePopulation.WITHOUT: -1,
            }
        return self.data[(state_fip, county_fip, age, race)]

    # Helper method from grabbing a tuple in self.data.  If the
    # tuple hasnt been created then it initializes an empty tuple.
    # This is needed as each data variable will only
    # update one of the population values at a time.

    # Splits the in memory aggregation into dataframes

    def split_data_frames(self):
        state_race_data = []
        county_race_data = []

        # Extract keys from self.data Tuple
        # (state_fip, County_fip, Age, Sex, Race): {PopulationObj}
        for data in self.data:
            state_fip, county_fip, age, race = data

            population = self.data[data]
            whi = population[HealthInsurancePopulation.WITH]
            wohi = population[HealthInsurancePopulation.WITHOUT]
            total = population[HealthInsurancePopulation.TOTAL]

            if county_fip is None:
                state_race_data.append(
                    [state_fip, self.state_fips[state_fip],
                        age, race, whi, wohi, total]
                )
            else:
                county_race_data.append(
                    [
                        state_fip,
                        self.state_fips[state_fip],
                        state_fip + county_fip,
                        self.county_fips[(state_fip, county_fip)],
                        age,
                        race,
                        whi,
                        wohi,
                        total,
                    ]
                )

        self.state_race_frame = pd.DataFrame(
            state_race_data,
            columns=[
                STATE_FIPS_COL,
                STATE_NAME_COL,
                AGE_COL,
                RACE_CATEGORY_ID_COL,
                WITH_HEALTH_INSURANCE_COL,
                WITHOUT_HEALTH_INSURANCE_COL,
                TOTAL_HEALTH_INSURANCE_COL,
            ],
        )
        self.county_race_frame = pd.DataFrame(
            county_race_data,
            columns=[
                STATE_FIPS_COL,
                STATE_NAME_COL,
                COUNTY_FIPS_COL,
                COUNTY_NAME_COL,
                AGE_COL,
                RACE_CATEGORY_ID_COL,
                WITH_HEALTH_INSURANCE_COL,
                WITHOUT_HEALTH_INSURANCE_COL,
                TOTAL_HEALTH_INSURANCE_COL,
            ],
        )

        add_race_columns_from_category_id(self.state_race_frame)
        add_race_columns_from_category_id(self.county_race_frame)

        # Aggregate Frames by Filename
        self.frames = {
            "health_insurance_by_race_age_state": self.state_race_frame,
            "health_insurance_by_race_age_county": self.county_race_frame,
        }


class AcsHealhInsuranceSexIngestor:

    # Initialize variables in class instance, also merge all metadata so that lookup of the
    # prefix, suffix combos can return the entire metadata
    def __init__(self, base_url):
        self.base_url = base_url
        metadata = fetch_acs_metadata(self.base_url)["variables"]
        metadata = trimMetadata(
            metadata, [HEALTH_INSURANCE_BY_SEX_GROUPS_PREFIX])
        self.metadata = parseMetadata(
            metadata, [MetadataKey.AGE, MetadataKey.SEX], lambda key: dict()
        )
        for k, v in self.metadata.items():
            if MetadataKey.POPULATION not in v:
                self.metadata[k][
                    MetadataKey.POPULATION
                ] = HealthInsurancePopulation.TOTAL
        self.state_fips = get_state_fips_mapping(base_url)
        self.county_fips = get_county_fips_mapping(base_url)
        self.data = {}

    # Gets standardized filename
    # If race is set, gets race filename
    # If race is None and sex is set, gets filename for sex
    def get_filename(self, is_county):
        return "HEALTH_INSURANCE_BY_SEX_{0}.json".format(
            "STATE" if is_county else "COUNTY"
        )

    # Method to output <Filename.csv>.  Used for debugging purposes.
    def write_local_files_debug(self):
        with open("acs_health_insurance_by_sex_metadata.json", "w") as f:
            print(json.dumps(self.metadata, indent=4), file=f)

        self.getData()

        with open("acs_health_insurance_by_sex_internal_data.json", "w") as f:
            print(
                json.dumps({str(k): v for k, v in self.data.items()}, indent=4), file=f
            )

        self.split_data_frames()

        for table_name, df in self.frames.items():
            df.to_csv(table_name + ".csv", index=False)
            df.to_json(table_name + ".json", orient="records", indent=4)

    # Uploads the ACS data to GCS by providing
    # the ACS Base URL
    # Acs Query Params
    # Standardized Filename
    #
    # An example file created in GCS:
    # HEALTH_INSURANCE_BY_RACE_COUNTY_WHITE_ALONE.json
    #
    # Returns:
    # FileDiff = If the data has changed by diffing the old run vs the new run.
    # (presumably to skip the write to bq step though not 100% sure as of writing this)
    def upload_to_gcs(self, bucket):
        file_diff = False
        for is_county in [True, False]:
            params = get_params(
                HEALTH_INSURANCE_BY_SEX_GROUPS_PREFIX, is_county)

            file_diff = (
                url_file_to_gcs.url_file_to_gcs(
                    self.base_url, params, bucket, self.get_filename(is_county)
                )
                or file_diff
            )
        return file_diff

    def write_to_bq(self, dataset, gcs_bucket):
        # Pull data from GCS and aggregate in memory
        self.getData(gcs_bucket=gcs_bucket)

        # Split internal memory into data frames for sex/race by state/county
        self.split_data_frames()

        # Create BQ columns and write dataframes to BQ
        for table_name, df in self.frames.items():
            # All breakdown columns are strings
            column_types = {c: "STRING" for c in df.columns}

            column_types[WITH_HEALTH_INSURANCE_COL] = "INT64"
            column_types[WITHOUT_HEALTH_INSURANCE_COL] = "INT64"
            column_types[TOTAL_HEALTH_INSURANCE_COL] = "INT64"

            gcs_to_bq_util.add_df_to_bq(
                df, dataset, table_name, column_types=column_types
            )

    # Get Health insurance By Sex from either API or GCS and aggregate it in memory

    def getData(self, gcs_bucket=None):

        for is_county in [True, False]:
            if gcs_bucket is not None:  # LOAD JSON BLOBS FROM GCS
                data = gcs_to_bq_util.load_values_as_json(
                    gcs_bucket, self.get_filename(is_county)
                )
            else:  # LOAD DATA FROM ACS (useful for local debug)
                data = get_acs_data_from_variables(
                    self.base_url,
                    get_params(HEALTH_INSURANCE_BY_SEX_GROUPS_PREFIX, False),
                )

            # Aggregate and accumulate data in memory
            self.accumulate_acs_data(data)

    """
    Takes data in the form of
    [
        [C27001A_002E, C27001A_003E, C27001B_002E, C27001B_002E][state][?county],
        [12345, 1245, 123546, 124567, 01, 02]
        ...
    ]
    This method determines the variables at the top (aka: key_row)
    matches the value with the metadata from the prefix_suffix list
    and stores it in the self.data as a tuple

    (state_fip, county_fip, age, sex, race) example:
    {
        "('01', None, '0-6', 'Male', None)": {
            "Total": "177643",
            "With": "172850",
            "Without": "4793"
        },
        "('01', None, '6-18', 'Male', None)": {
            "Total": "414407",
            "With": "400460",
            "Without": "13947"
        },
        ...
    } Note: This can be debugged via the total_health_insurance.json output file via local_debug
    """

    def accumulate_acs_data(self, data):
        key_row = data[0]
        for row in data[1::]:
            row_data = {}
            for key in key_row:
                if key != "state" and key != "county" and key in self.metadata:
                    row_data[key] = {}
            state_fip = None
            county_fip = None
            for col_index in range(len(row)):
                col = row[col_index]
                key = key_row[col_index]

                if key == "state":
                    state_fip = col  # Extract the static key_row state
                elif key == "county":
                    # Extract the static key_row (county) *if exists
                    county_fip = col
                elif key in self.metadata:
                    row_data[key] = {"value": col, "meta": self.metadata[key]}

            for key in row_data:
                metadata = row_data[key]["meta"]
                population = row_data[key]["value"]
                row = self.upsert_row(
                    state_fip,
                    county_fip,
                    metadata.get(MetadataKey.AGE),
                    metadata.get(MetadataKey.SEX),
                )
                row[metadata[MetadataKey.POPULATION]] = population

    def upsert_row(self, state_fip, county_fip, age, sex):
        if (state_fip, county_fip, age, sex) not in self.data:
            self.data[(state_fip, county_fip, age, sex)] = {
                HealthInsurancePopulation.TOTAL: -1,
                HealthInsurancePopulation.WITH: -1,
                HealthInsurancePopulation.WITHOUT: -1,
            }
        return self.data[(state_fip, county_fip, age, sex)]

    # Helper method from grabbing a tuple in self.data.  If the
    # tuple hasnt been created then it initializes an empty tuple.
    # This is needed as each data variable will only
    # update one of the population values at a time.

    # Splits the in memory aggregation into dataframes

    def split_data_frames(self):
        state_sex_data = []
        county_sex_data = []

        # Extract keys from self.data Tuple
        # (state_fip, County_fip, Age, Sex, Race): {PopulationObj}
        for data in self.data:
            state_fip, county_fip, age, sex = data

            population = self.data[data]
            whi = population[HealthInsurancePopulation.WITH]
            wohi = population[HealthInsurancePopulation.WITHOUT]
            total = population[HealthInsurancePopulation.TOTAL]

            if county_fip is None:

                state_sex_data.append(
                    [state_fip, self.state_fips[state_fip],
                        age, sex, whi, wohi, total]
                )

            else:

                county_sex_data.append(
                    [
                        state_fip,
                        self.state_fips[state_fip],
                        state_fip + county_fip,
                        self.county_fips[(state_fip, county_fip)],
                        age,
                        sex,
                        whi,
                        wohi,
                        total,
                    ]
                )

        # Build Panda DataFrames with standardized cols
        self.state_sex_frame = pd.DataFrame(
            state_sex_data,
            columns=[
                STATE_FIPS_COL,
                STATE_NAME_COL,
                AGE_COL,
                SEX_COL,
                WITH_HEALTH_INSURANCE_COL,
                WITHOUT_HEALTH_INSURANCE_COL,
                TOTAL_HEALTH_INSURANCE_COL,
            ],
        )
        self.county_sex_frame = pd.DataFrame(
            county_sex_data,
            columns=[
                STATE_FIPS_COL,
                STATE_NAME_COL,
                COUNTY_FIPS_COL,
                COUNTY_NAME_COL,
                AGE_COL,
                SEX_COL,
                WITH_HEALTH_INSURANCE_COL,
                WITHOUT_HEALTH_INSURANCE_COL,
                TOTAL_HEALTH_INSURANCE_COL,
            ],
        )

        # Aggregate Frames by Filename
        self.frames = {
            "health_insurance_by_sex_age_state": self.state_sex_frame,
            "health_insurance_by_sex_age_county": self.county_sex_frame,
        }


class ACSHealthInsurance(DataSource):
    @staticmethod
    def get_id():
        """Returns the data source's unique id. """
        return "ACS_HEALTH_INSURANCE"

    # Uploads to GCS. Sees if the data has changed by diffing the old run vs the new run.
    # (presumably to skip the write to bq step though not 100% sure as of writing this)
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
            AcsHealhInsuranceRaceIngestor(BASE_ACS_URL),
            AcsHealhInsuranceSexIngestor(BASE_ACS_URL),
        ]


# AcsHealhInsuranceSexIngestor(BASE_ACS_URL).upload_to_gcs(
#     'kalieki-dev-landing-bucket')
# AcsHealhInsuranceSexIngestor(BASE_ACS_URL).write_to_bq(
#     "acs_health_insurance_manual_test", "kalieki-dev-landing-bucket"
# )

# # AcsHealhInsuranceRaceIngestor(BASE_ACS_URL).upload_to_gcs(
# #     'kalieki-dev-landing-bucket')
# AcsHealhInsuranceRaceIngestor(BASE_ACS_URL).write_to_bq(
#     "acs_health_insurance_manual_test", "kalieki-dev-landing-bucket"
# )

# AcsHealhInsuranceRaceIngestor(BASE_ACS_URL).write_local_files_debug()
# AcsHealhInsuranceSexIngestor(BASE_ACS_URL).write_local_files_debug()
