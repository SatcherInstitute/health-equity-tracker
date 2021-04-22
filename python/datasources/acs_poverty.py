import json
import pandas as pd

from datasources.data_source import DataSource
from ingestion import url_file_to_gcs, gcs_to_bq_util
from ingestion.standardized_columns import (
    STATE_FIPS_COL,
    COUNTY_FIPS_COL,
    STATE_NAME_COL,
    COUNTY_NAME_COL,
    SEX_COL,
    AGE_COL,
    ABOVE_POVERTY_COL,
    BELOW_POVERTY_COL,
    RACE_CATEGORY_ID_COL,
    Race,
    add_race_columns_from_category_id,
    RACE_INCLUDES_HISPANIC_COL
)
from ingestion.census import (
    fetch_acs_metadata,
    get_state_fips_mapping,
    get_county_fips_mapping,
)
from ingestion.constants import PovertyPopulation
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
POVERTY_BY_RACE_SEX_AGE_GROUPS = {
    "B17001A": Race.WHITE.value,
    "B17001B": Race.BLACK.value,
    "B17001C": Race.AIAN.value,
    "B17001D": Race.ASIAN.value,
    "B17001E": Race.NHPI.value,
    "B17001F": Race.OTHER_STANDARD.value,
    "B17001G": Race.MULTI.value,
    "B17001H": Race.WHITE_NH.value,
    "B17001I": Race.HISP.value,
}


# Gets the race from ACS Variable ex. B17001A_001E


def get_race_from_key(key):
    parts = key.split("_")
    return POVERTY_BY_RACE_SEX_AGE_GROUPS[parts[0]]


# Standardized way of getting filename by group
def get_filename(grp_code, is_county):
    geo = "COUNTY" if is_county else "STATE"
    grp_name = POVERTY_BY_RACE_SEX_AGE_GROUPS[grp_code].replace(" ", "_").upper()
    return f"ACS_POVERTY_BY_AGE_RACE_{geo}_{grp_name}"


class AcsPovertyIngestor:

    # Initialize the fips mappings, retrieve all concepts for groups,
    # parse metadata into dict for easy lookup.
    def __init__(self, base_url):
        self.base_url = base_url
        metadata = fetch_acs_metadata(self.base_url)["variables"]
        metadata = trimMetadata(metadata, POVERTY_BY_RACE_SEX_AGE_GROUPS.keys())
        self.metadata = parseMetadata(
            metadata,
            [MetadataKey.AGE, MetadataKey.SEX, MetadataKey.RACE],
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

            column_types[ABOVE_POVERTY_COL] = "INT64"
            column_types[BELOW_POVERTY_COL] = "INT64"

            gcs_to_bq_util.add_dataframe_to_bq(
                df, dataset, table_name, column_types=column_types
            )

    # Uploads the acs data to gcs and returns if files are diff.
    def upload_to_gcs(self, bucket):
        file_diff = False
        for group in POVERTY_BY_RACE_SEX_AGE_GROUPS:
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

        with open("acs_poverty_metadata.json", "w") as f:
            print(json.dumps(self.metadata, indent=4), file=f)

        self.getData()

        with open("acs_poverty_internal_data.json", "w") as f:
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
        for group in POVERTY_BY_RACE_SEX_AGE_GROUPS:
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
        "('01', 'None', '0-6', 'White')": {
            "above_poverty_line": "143",
            "below_poverty_line": "13",

        "('01', 'None', '0-6', 'Asian')": {
             "above_poverty_line": "113",
            "below_poverty_line": "16",
        },
        ...
    } Note: This can be debugged via the acs_poverty_metadata.json file
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
            for var in row_data:
                metadata = row_data[var]["meta"]
                value = row_data[var]["value"]
                row = self.upsert_row(
                    state_fip,
                    county_fip,
                    metadata.get(MetadataKey.AGE),
                    metadata.get(MetadataKey.SEX),
                    metadata.get(MetadataKey.RACE),
                )
                row[metadata[MetadataKey.POPULATION]] = value

    # Helper method from grabbing a tuple in self.data.  If the
    # tuple hasnt been created then it initializes an empty tuple.
    # This is needed as each data variable will only
    # update one of the population values at a time.

    def upsert_row(self, state_fip, county_fip, age, sex, race):
        if (state_fip, county_fip, age, sex, race) not in self.data:
            self.data[(state_fip, county_fip, age, sex, race)] = {
                PovertyPopulation.ABOVE: -1,
                PovertyPopulation.BELOW: -1,
            }
        return self.data[(state_fip, county_fip, age, sex, race)]

    # Splits the in memory aggregation into dataframes

    def split_data_frames(self):
        state_data = []
        county_data = []

        # Extract keys from self.data Tuple
        # (state_fip, County_fip, Age, Sex, Race): {PopulationObj}
        for data, population in self.data.items():
            state_fip, county_fip, age, sex, race = data

            population = self.data[data]
            above = population[PovertyPopulation.ABOVE]
            below = population[PovertyPopulation.BELOW]

            if county_fip is None:
                state_data.append(
                    [
                        state_fip,
                        self.state_fips[state_fip],
                        race,
                        age,
                        sex,
                        above,
                        below,
                    ]
                )
            else:
                county_data.append(
                    [
                        state_fip,
                        self.state_fips[state_fip],
                        county_fip,
                        self.county_fips[(state_fip, county_fip)],
                        race,
                        age,
                        sex,
                        above,
                        below,
                    ]
                )

        # Build Panda DataFrames with standardized cols
        self.poverty_by_race_age_sex_state_frame = pd.DataFrame(
            state_data,
            columns=[
                STATE_FIPS_COL,
                STATE_NAME_COL,
                RACE_CATEGORY_ID_COL,
                AGE_COL,
                SEX_COL,
                ABOVE_POVERTY_COL,
                BELOW_POVERTY_COL,
            ],
        )
        self.poverty_by_race_age_sex_county_frame = pd.DataFrame(
            county_data,
            columns=[
                STATE_FIPS_COL,
                STATE_NAME_COL,
                COUNTY_FIPS_COL,
                COUNTY_NAME_COL,
                RACE_CATEGORY_ID_COL,
                AGE_COL,
                SEX_COL,
                ABOVE_POVERTY_COL,
                BELOW_POVERTY_COL,
            ],
        )

        add_race_columns_from_category_id(
            self.poverty_by_race_age_sex_state_frame)
        add_race_columns_from_category_id(
            self.poverty_by_race_age_sex_county_frame)

        # Aggregate Frames by Filename
        self.frames = {
            "poverty_by_race_age_sex_state": self.poverty_by_race_age_sex_state_frame,
            "poverty_by_race_age_sex_county": self.poverty_by_race_age_sex_county_frame,
        }


class ACSPovertyDataSource(DataSource):
    @staticmethod
    def get_id():
        """Returns the data source's unique id. """
        return "ACS_POVERTY"

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
            AcsPovertyIngestor(BASE_ACS_URL),
        ]


# AcsPovertyIngestor(BASE_ACS_URL).upload_to_gcs(
#     'kalieki-dev-landing-bucket')
# AcsPovertyIngestor(BASE_ACS_URL).write_to_bq(
#     'acs_poverty_manual_test', 'kalieki-dev-landing-bucket')

# AcsPovertyIngestor(BASE_ACS_URL).write_local_files_debug()
