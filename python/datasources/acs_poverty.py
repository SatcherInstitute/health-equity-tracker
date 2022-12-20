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
    BELOW_POVERTY_COL,
    ABOVE_POVERTY_COL,
    RACE_CATEGORY_ID_COL,
    Race,
    add_race_columns_from_category_id,
    RACE_INCLUDES_HISPANIC_COL,
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

import sys

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

CUSTOM_AGE_BUCKETS = [
    {"min": 0, "max": 5},
    {"min": 6, "max": 11},
    {"min": 12, "max": 17},
]


def remove_suffix(input_string, suffix):
    if suffix and input_string.endswith(suffix):
        return input_string[: -len(suffix)]
    return input_string


def parseAgeString(in_str):
    if in_str.endswith("+"):
        return {"min": int(remove_suffix(in_str, "+")), "max": sys.maxsize}

    parts = in_str.split("-")
    if len(parts) == 2:
        return {"min": int(parts[0]), "max": int(parts[1])}
    else:
        return {"min": int(parts[0]), "max": int(parts[0])}


def determine_new_age_bucket(ageStr):
    age = parseAgeString(ageStr)
    for bucket in CUSTOM_AGE_BUCKETS:
        if bucket["min"] <= age["min"] and bucket["max"] >= age["max"]:
            return f'{bucket["min"]}-{bucket["max"]}'
        elif bucket["min"] > age["max"] or bucket["max"] < age["min"]:
            pass
        elif bucket["min"] <= age["min"] and age["max"] >= bucket["min"]:
            raise Exception(
                f"Invalid Grouping [1] for age {age} for bucket {bucket}")
        elif bucket["max"] >= age["max"] and age["min"] <= bucket["min"]:
            raise Exception(
                f"Invalid Grouping [2] for age {age} for bucket {bucket}")

    return ageStr


# Gets the race from ACS Variable ex. B17001A_001E


def get_race_from_key(key):
    parts = key.split("_")
    return POVERTY_BY_RACE_SEX_AGE_GROUPS[parts[0]]


# Standardized way of getting filename by group
def get_filename(grp_code, is_county):
    geo = "COUNTY" if is_county else "STATE"
    grp_name = POVERTY_BY_RACE_SEX_AGE_GROUPS[grp_code].replace(
        " ", "_").upper()
    return f"ACS_POVERTY_BY_AGE_RACE_{geo}_{grp_name}"

    # Helper method from grabbing a tuple in data.  If the
    # tuple hasn't been created then it initializes an empty tuple.
    # This is needed as each data variable will only
    # update one of the population values at a time.


def upsert_row(data, state_fip, county_fip, age, sex, race, default_values=-1):
    if (state_fip, county_fip, age, sex, race) not in data:
        data[(state_fip, county_fip, age, sex, race)] = {
            PovertyPopulation.ABOVE: default_values,
            PovertyPopulation.BELOW: default_values,
        }
    return data[(state_fip, county_fip, age, sex, race)]


class AcsPovertyIngester:

    # Initialize the fips mappings, retrieve all concepts for groups,
    # parse metadata into dict for easy lookup.
    def __init__(self, base_url):
        self.base_url = base_url
        metadata = fetch_acs_metadata(self.base_url)["variables"]
        metadata = trimMetadata(
            metadata, POVERTY_BY_RACE_SEX_AGE_GROUPS.keys())
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
        self.custom_accumulations()

        # Split internal memory into data frames for sex/race by state/county
        self.split_data_frames()

        # Create BQ columns and write dataframes to BQ
        for table_name, df in self.frames.items():
            # All breakdown columns are strings
            column_types = {c: "STRING" for c in df.columns}

            column_types[BELOW_POVERTY_COL] = "INT64"
            column_types[ABOVE_POVERTY_COL] = "INT64"

            gcs_to_bq_util.add_df_to_bq(
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

    # Write all the data to local files to debug
    def write_local_files_debug(self):

        with open("acs_poverty_metadata.json", "w") as f:
            print(json.dumps(self.metadata, indent=4), file=f)

        self.getData()

        with open("acs_poverty_internal_data.json", "w") as f:
            print(
                json.dumps({str(k): v for k, v in self.data.items()}, indent=4), file=f
            )

        self.custom_accumulations()

        with open("acs_poverty_internal_accumulated_data.json", "w") as f:
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

    # Accumulates the data into new age groups and then splits the data
    # into unique groupings of age, race, and sex.
    def custom_accumulations(self):
        new_data = {}

        for data, population in self.data.items():
            state_fip, county_fip, age, sex, race = data

            above = int(population[PovertyPopulation.ABOVE])
            below = int(population[PovertyPopulation.BELOW])

            if above == -1 or below == -1:
                raise Exception(
                    "Custom Accumulation Error State"
                    + f" - Unset precondition, ({state_fip},{county_fip},{age},{sex},{race})"
                    + f" - Above: {above}, Below {below}"
                )

            new_age = determine_new_age_bucket(age)

            age_key = (state_fip, county_fip, new_age, None, None)
            sex_key = (state_fip, county_fip, None, sex, None)
            race_key = (state_fip, county_fip, None, None, race)

            upsert_row(new_data, state_fip, county_fip, new_age, None, None, 0)
            upsert_row(new_data, state_fip, county_fip, None, sex, None, 0)
            upsert_row(new_data, state_fip, county_fip, None, None, race, 0)

            for new_key in [age_key, sex_key, race_key]:
                new_population = new_data[new_key]
                new_population[PovertyPopulation.ABOVE] = str(
                    int(new_population[PovertyPopulation.ABOVE]) + above
                )
                new_population[PovertyPopulation.BELOW] = str(
                    int(new_population[PovertyPopulation.BELOW]) + below
                )

                new_data[new_key] = new_population

        self.data = new_data

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
                row = upsert_row(
                    self.data,
                    state_fip,
                    county_fip,
                    metadata.get(MetadataKey.AGE),
                    metadata.get(MetadataKey.SEX),
                    metadata.get(MetadataKey.RACE),
                )
                row[metadata[MetadataKey.POPULATION]] = value

    # Splits the in memory aggregation into dataframes

    def split_data_frames(self):
        race_state_data = []
        sex_state_data = []
        age_state_data = []

        race_county_data = []
        sex_county_data = []
        age_county_data = []

        # Extract keys from self.data Tuple
        # (state_fip, county_fip, Age, Sex, Race): {PopulationObj}
        for data, population in self.data.items():
            state_fip, county_fip, age, sex, race = data

            population = self.data[data]
            above = population[PovertyPopulation.ABOVE]
            below = population[PovertyPopulation.BELOW]

            # Since data is going into unique datasets, data should be split to
            # only have one dataset target.  If this fails,
            # check custom_accumulations
            if (age is not None) + (sex is not None) + (race is not None) != 1:
                raise AssertionError(f"Invalid Tuple: {data}")

            if county_fip is None:
                default_state_vals = [
                    state_fip,
                    self.state_fips[state_fip],
                    below,
                    above,
                ]
                if race is not None:
                    race_state_data.append(default_state_vals + [race])
                elif sex is not None:
                    sex_state_data.append(default_state_vals + [sex])
                elif age is not None:
                    age_state_data.append(default_state_vals + [age])
            else:
                default_county_vals = [
                    state_fip,
                    self.state_fips[state_fip],
                    state_fip + county_fip,
                    self.county_fips[(state_fip, county_fip)],
                    below,
                    above,
                ]
                if race is not None:
                    race_county_data.append(default_county_vals + [race])
                elif sex is not None:
                    sex_county_data.append(default_county_vals + [sex])
                elif age is not None:
                    age_county_data.append(default_county_vals + [age])

        base_state_cols = [
            STATE_FIPS_COL,
            STATE_NAME_COL,
            BELOW_POVERTY_COL,
            ABOVE_POVERTY_COL,
        ]

        base_county_cols = [
            STATE_FIPS_COL,
            STATE_NAME_COL,
            COUNTY_FIPS_COL,
            COUNTY_NAME_COL,
            BELOW_POVERTY_COL,
            ABOVE_POVERTY_COL,
        ]

        # Build Panda DataFrames with standardized cols
        self.poverty_by_race_state = pd.DataFrame(
            race_state_data,
            columns=base_state_cols + [RACE_CATEGORY_ID_COL],
        )
        self.poverty_by_race_county = pd.DataFrame(
            race_county_data,
            columns=base_county_cols + [RACE_CATEGORY_ID_COL],
        )

        add_race_columns_from_category_id(self.poverty_by_race_state)
        add_race_columns_from_category_id(self.poverty_by_race_county)

        # Build Panda DataFrames with standardized cols
        self.poverty_by_age_state = pd.DataFrame(
            age_state_data,
            columns=base_state_cols + [AGE_COL],
        )
        self.poverty_by_age_county = pd.DataFrame(
            age_county_data,
            columns=base_county_cols + [AGE_COL],
        )

        self.poverty_by_sex_state = pd.DataFrame(
            sex_state_data,
            columns=base_state_cols + [SEX_COL],
        )
        self.poverty_by_sex_county = pd.DataFrame(
            sex_county_data,
            columns=base_county_cols + [SEX_COL],
        )

        # Aggregate Frames by Filename
        self.frames = {
            "poverty_by_race_state": self.poverty_by_race_state,
            "poverty_by_race_county": self.poverty_by_race_county,
            "poverty_by_age_state": self.poverty_by_age_state,
            "poverty_by_age_county": self.poverty_by_age_county,
            "poverty_by_sex_state": self.poverty_by_sex_state,
            "poverty_by_sex_county": self.poverty_by_sex_county,
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
            AcsPovertyIngester(BASE_ACS_URL),
        ]
