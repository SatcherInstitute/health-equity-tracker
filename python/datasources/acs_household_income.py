import json
import pandas as pd

from datasources.data_source import DataSource
from ingestion import url_file_to_gcs, gcs_to_bq_util
from ingestion.standardized_columns import (
    STATE_FIPS_COL,
    COUNTY_FIPS_COL,
    STATE_NAME_COL,
    COUNTY_NAME_COL,
    INCOME_COL,
    AGE_COL,
    RACE_CATEGORY_ID_COL,
    POPULATION_COL,
    Race,
    add_race_columns_from_category_id,
    RACE_INCLUDES_HISPANIC_COL
)
from ingestion.census import (
    fetch_acs_metadata,
    get_state_fips_mapping,
    get_county_fips_mapping,
)
from ingestion.acs_utils import (
    MetadataKey,
    parseMetadata,
    trimMetadata,
    get_acs_data_from_variables,
    get_params,
)

# TODO pass this in from message data.
BASE_ACS_URL = "https://api.census.gov/data/2019/acs/acs5"


# Acs Groups for income / age / race
MEDIAN_INCOME_BY_RACE_GROUPS = {
    "B19037A": Race.WHITE.value,
    "B19037B": Race.BLACK.value,
    "B19037C": Race.AIAN.value,
    "B19037D": Race.ASIAN.value,
    "B19037E": Race.NHPI.value,
    "B19037F": Race.OTHER_STANDARD.value,
    "B19037G": Race.MULTI.value,
    "B19037H": Race.WHITE_NH.value,
    "B19037I": Race.HISP.value,
}


# Gets the race from ACS Variable ex. B19037A_001E


def get_race_from_key(key):
    parts = key.split("_")
    return MEDIAN_INCOME_BY_RACE_GROUPS[parts[0]]


# Standardized way of getting filename by group
def get_filename(grp_code, is_county):
    geo = "COUNTY" if is_county else "STATE"
    grp_name = MEDIAN_INCOME_BY_RACE_GROUPS[grp_code].replace(" ", "_").upper()
    return f"ACS_MEDIAN_INCOME_BY_AGE_RACE_{geo}_{grp_name}"


class AcsHouseholdIncomeIngestor:

    # Initialize the fips mappings, retrieve all concepts for groups,
    # parse metadata into dict for easy lookup.
    def __init__(self, base_url):
        self.base_url = base_url
        metadata = fetch_acs_metadata(self.base_url)["variables"]
        metadata = trimMetadata(metadata, MEDIAN_INCOME_BY_RACE_GROUPS.keys())
        self.metadata = parseMetadata(
            metadata,
            [MetadataKey.AGE, MetadataKey.INCOME, MetadataKey.RACE],
            self.metadataInitializer,
        )
        self.state_fips = get_state_fips_mapping(base_url)
        self.county_fips = get_county_fips_mapping(base_url)
        self.data = {}

    def metadataInitializer(self, key):
        return {MetadataKey.RACE: get_race_from_key(key)}

    def write_to_bq(self, dataset, bucket):
        self.getData(bucket)

        # Split internal memory into data frames for sex/race by state/county
        self.split_data_frames()

        # Create BQ columns and write dataframes to BQ
        for table_name, df in self.frames.items():
            # All breakdown columns are strings
            column_types = {c: "STRING" for c in df.columns}
            if RACE_INCLUDES_HISPANIC_COL in df.columns:
                column_types[RACE_INCLUDES_HISPANIC_COL] = 'BOOL'

            column_types[POPULATION_COL] = "INT64"

            gcs_to_bq_util.add_df_to_bq(
                df, dataset, table_name, column_types=column_types
            )

    # Uploads the acs data to gcs and returns if files are diff.
    def upload_to_gcs(self, bucket):
        file_diff = False
        for group in MEDIAN_INCOME_BY_RACE_GROUPS:
            for is_county in [True, False]:
                file_diff = (
                    url_file_to_gcs.url_file_to_gcs(
                        self.base_url,
                        get_params(group, is_county),
                        bucket,
                        get_filename(group, is_county),
                    )
                    or file_diff
                )

        return file_diff

    # Write all the datas to local files to debug
    def write_local_files_debug(self):

        with open("acs_hhi_metadata.json", "w") as f:
            print(json.dumps(self.metadata, indent=4), file=f)

        self.getData()

        with open("acs_hhi_internal_data.json", "w") as f:
            print(
                json.dumps({str(k): v for k, v in self.data.items()}, indent=4), file=f
            )

        self.split_data_frames()

        for table_name, df in self.frames.items():
            df.to_csv(table_name + ".csv", index=False)
            df.to_json(table_name + ".json", orient="records", indent=4)

    # Get the acs data for all the group / concept combinations.
    # Accumulate to in memory data to be split later
    def getData(self, gcs_bucket=None):
        for group in MEDIAN_INCOME_BY_RACE_GROUPS:
            for is_county in [True, False]:
                data = None
                if gcs_bucket is None:
                    data = get_acs_data_from_variables(
                        self.base_url, get_params(group, is_county)
                    )
                else:
                    data = gcs_to_bq_util.load_values_as_json(
                        gcs_bucket, get_filename(group, is_county)
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
        "('01', 'None', '0-6', 'White', $0-$10000)": {
            "Population": "143",

        "('01', 'None', '0-6', 'White', $10,000-$20,000)": {
            "Population": "104",
        },
        ...
    } Note: This can be debugged via the acs_hhi_internal_data.json file
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
                self.data[
                    (
                        state_fip,
                        county_fip,
                        metadata[MetadataKey.RACE],
                        metadata[MetadataKey.AGE],
                        metadata[MetadataKey.INCOME],
                    )
                ] = population

    # Splits the in memory aggregation into dataframes

    def split_data_frames(self):
        state_data = []
        county_data = []

        # Extract keys from self.data Tuple
        # (state_fip, County_fip, Age, Sex, Race): {PopulationObj}
        for data, population in self.data.items():
            state_fip, county_fip, race, age, income = data

            if county_fip is None:
                state_data.append(
                    [
                        state_fip,
                        self.state_fips[state_fip],
                        race,
                        age,
                        income,
                        population,
                    ]
                )
            else:
                county_data.append(
                    [
                        state_fip,
                        self.state_fips[state_fip],
                        state_fip + county_fip,
                        self.county_fips[(state_fip, county_fip)],
                        race,
                        age,
                        income,
                        population,
                    ]
                )

        # Build Panda DataFrames with standardized cols
        self.income_by_race_age_state_frame = pd.DataFrame(
            state_data,
            columns=[
                STATE_FIPS_COL,
                STATE_NAME_COL,
                RACE_CATEGORY_ID_COL,
                AGE_COL,
                INCOME_COL,
                POPULATION_COL,
            ],
        )
        self.income_by_race_age_county_frame = pd.DataFrame(
            county_data,
            columns=[
                STATE_FIPS_COL,
                STATE_NAME_COL,
                COUNTY_FIPS_COL,
                COUNTY_NAME_COL,
                RACE_CATEGORY_ID_COL,
                AGE_COL,
                INCOME_COL,
                POPULATION_COL,
            ],
        )

        add_race_columns_from_category_id(self.income_by_race_age_state_frame)
        add_race_columns_from_category_id(self.income_by_race_age_county_frame)

        # Aggregate Frames by Filename
        self.frames = {
            "household_income_by_race_age_state": self.income_by_race_age_state_frame,
            "household_income_by_race_age_county": self.income_by_race_age_county_frame,
        }


class ACSHouseholdIncomeDatasource(DataSource):
    @staticmethod
    def get_id():
        """Returns the data source's unique id. """
        return "ACS_HOUSEHOLD_INCOME"

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
            AcsHouseholdIncomeIngestor(BASE_ACS_URL),
        ]


# AcsHouseholdIncomeIngestor(BASE_ACS_URL).upload_to_gcs(
#     'kalieki-dev-landing-bucket')
# AcsHouseholdIncomeIngestor(BASE_ACS_URL).write_to_bq(
#     'acs_income_manual_test', 'kalieki-dev-landing-bucket')

# AcsHouseholdIncomeIngestor(BASE_ACS_URL).write_local_files_debug()
