import json
import pandas as pd
import requests

from datasources.data_source import DataSource
from ingestion import url_file_to_gcs, gcs_to_bq_util
from ingestion.standardized_columns import (STATE_FIPS_COL, COUNTY_FIPS_COL,
                                            STATE_NAME_COL, COUNTY_NAME_COL,
                                            AGE_COL, SEX_COL,
                                            RACE_COL, WITH_HEALTH_INSURANCE_COL,
                                            WITHOUT_HEALTH_INSURANCE_COL,
                                            TOTAL_HEALTH_INSURANCE_COL, Race)
from typing import Dict

# TODO pass this in from message data.
BASE_ACS_URL = "https://api.census.gov/data/2019/acs/acs5"


class HealthInsurancePopulation:
    WITH = "With"
    WITHOUT = "Without"
    TOTAL = "Total"


class Sex:
    MALE = "Male"
    FEMALE = "Female"


class MetadataKey:
    RACE = "race"
    SEX = "sex"
    POPULATION = "population"
    AGE = "age"

#   Metadata to map the ACS variables to more specific data:
#   Sex
#   Age (Min-Max)
#   Population [WithHealthInsurance / WithoutHealthInsurance / TotalHealthInsurance]
#
#   Note: Race is not included because it


def meta(sex, min_age, max_age, hi_status=HealthInsurancePopulation.TOTAL):
    age = f'{min_age}+' if max_age is None else f'{min_age}-{max_age}'
    return {MetadataKey.SEX: sex, MetadataKey.AGE: age, MetadataKey.POPULATION: hi_status}


# ACS Health Insurance By Race Prefixes.
# Acs variables are in the form C27001A_xxx0 C27001A_xxx2 ect
# to determine age buckets.  The metadata variables are merged with the suffixes to form the entire metadeta.
HEALTH_INSURANCE_BY_RACE_GROUP_PREFIXES = [
    {"C27001A": {MetadataKey.RACE: Race.WHITE.value}},
    {"C27001B": {MetadataKey.RACE: Race.BLACK.value}},
    {"C27001C": {
        MetadataKey.RACE: Race.AIAN.value}},
    {"C27001D": {MetadataKey.RACE: Race.ASIAN.value}},
    {"C27001E": {
        MetadataKey.RACE: Race.NHPI.value}},
    {"C27001F": {MetadataKey.RACE: Race.OTHER.value}},
    {"C27001G": {MetadataKey.RACE: Race.MULTI.value}},
    {"C27001H": {
        MetadataKey.RACE: Race.WHITE_NH.value}},
    {"C27001I": {MetadataKey.RACE: Race.HISP.value}},
]

# Race group suffixes. See comment on Race group prefixes.
HEALTH_INSURANCE_BY_RACE_GROUP_SUFFIXES = {
    "_002E": meta(None, 0, 19),
    "_003E": meta(None, 0, 19, HealthInsurancePopulation.WITH),
    "_004E": meta(None, 0, 19, HealthInsurancePopulation.WITHOUT),
    "_005E": meta(None, 19, 64),
    "_006E": meta(None, 19, 64, HealthInsurancePopulation.WITH),
    "_007E": meta(None, 19, 64, HealthInsurancePopulation.WITHOUT),
    "_008E": meta(None, 65, None),
    "_009E": meta(None, 65, None, HealthInsurancePopulation.WITH),
    "_010E": meta(None, 65, None, HealthInsurancePopulation.WITHOUT),
}

# Health insurance by Sex only has one prefix, and is kept
# in the form of a dict to help with standardizing code flow
HEALTH_INSURANCE_BY_SEX_GROUPS_PREFIX: Dict[str, object] = {"B27001": {}}


# Health insurance by Sex suffixes for Male.  Split because
# ACS get will only allow 50 variables at a time.
HEALTH_INSURANCE_BY_SEX_MALE_SUFFIXES = {
    "_003E": meta(Sex.MALE, 0, 6),
    "_004E": meta(Sex.MALE, 0, 6, HealthInsurancePopulation.WITH),
    "_005E": meta(Sex.MALE, 0, 6, HealthInsurancePopulation.WITHOUT),
    "_006E": meta(Sex.MALE, 6, 18),
    "_007E": meta(Sex.MALE, 6, 18, HealthInsurancePopulation.WITH),
    "_008E": meta(Sex.MALE, 6, 18, HealthInsurancePopulation.WITHOUT),
    "_009E": meta(Sex.MALE, 19, 25),
    "_010E": meta(Sex.MALE, 19, 25, HealthInsurancePopulation.WITH),
    "_011E": meta(Sex.MALE, 19, 25, HealthInsurancePopulation.WITHOUT),
    "_012E": meta(Sex.MALE, 26, 34),
    "_013E": meta(Sex.MALE, 26, 34, HealthInsurancePopulation.WITH),
    "_014E": meta(Sex.MALE, 26, 34, HealthInsurancePopulation.WITHOUT),
    "_015E": meta(Sex.MALE, 35, 44),
    "_016E": meta(Sex.MALE, 35, 44, HealthInsurancePopulation.WITH),
    "_017E": meta(Sex.MALE, 35, 44, HealthInsurancePopulation.WITHOUT),
    "_018E": meta(Sex.MALE, 45, 54),
    "_019E": meta(Sex.MALE, 45, 54, HealthInsurancePopulation.WITH),
    "_020E": meta(Sex.MALE, 45, 54, HealthInsurancePopulation.WITHOUT),
    "_021E": meta(Sex.MALE, 55, 64),
    "_022E": meta(Sex.MALE, 55, 64, HealthInsurancePopulation.WITH),
    "_023E": meta(Sex.MALE, 55, 64, HealthInsurancePopulation.WITHOUT),
    "_024E": meta(Sex.MALE, 65, 74),
    "_025E": meta(Sex.MALE, 65, 74, HealthInsurancePopulation.WITH),
    "_026E": meta(Sex.MALE, 65, 74, HealthInsurancePopulation.WITHOUT),
    "_027E": meta(Sex.MALE, 65, None),
    "_028E": meta(Sex.MALE, 65, None, HealthInsurancePopulation.WITH),
    "_029E": meta(Sex.MALE, 65, None, HealthInsurancePopulation.WITHOUT),
}

# Health insurance by female suffixes.
HEALTH_INSURANCE_BY_SEX_FEMALE_SUFFIXES = {
    "_031E": meta(Sex.FEMALE, 0, 6),
    "_032E": meta(Sex.FEMALE, 0, 6, HealthInsurancePopulation.WITH),
    "_033E": meta(Sex.FEMALE, 0, 6, HealthInsurancePopulation.WITHOUT),
    "_034E": meta(Sex.FEMALE, 6, 18),
    "_035E": meta(Sex.FEMALE, 6, 18, HealthInsurancePopulation.WITH),
    "_036E": meta(Sex.FEMALE, 6, 18, HealthInsurancePopulation.WITHOUT),
    "_037E": meta(Sex.FEMALE, 19, 25),
    "_038E": meta(Sex.FEMALE, 19, 25, HealthInsurancePopulation.WITH),
    "_039E": meta(Sex.FEMALE, 19, 25, HealthInsurancePopulation.WITHOUT),
    "_040E": meta(Sex.FEMALE, 26, 34),
    "_041E": meta(Sex.FEMALE, 26, 34, HealthInsurancePopulation.WITH),
    "_042E": meta(Sex.FEMALE, 26, 34, HealthInsurancePopulation.WITHOUT),
    "_043E": meta(Sex.FEMALE, 35, 44),
    "_044E": meta(Sex.FEMALE, 35, 44, HealthInsurancePopulation.WITH),
    "_045E": meta(Sex.FEMALE, 35, 44, HealthInsurancePopulation.WITHOUT),
    "_046E": meta(Sex.FEMALE, 45, 54),
    "_047E": meta(Sex.FEMALE, 45, 54, HealthInsurancePopulation.WITH),
    "_048E": meta(Sex.FEMALE, 45, 54, HealthInsurancePopulation.WITHOUT),
    "_049E": meta(Sex.FEMALE, 55, 64),
    "_050E": meta(Sex.FEMALE, 55, 64, HealthInsurancePopulation.WITH),
    "_051E": meta(Sex.FEMALE, 55, 64, HealthInsurancePopulation.WITHOUT),
    "_052E": meta(Sex.FEMALE, 65, 74),
    "_053E": meta(Sex.FEMALE, 65, 74, HealthInsurancePopulation.WITH),
    "_054E": meta(Sex.FEMALE, 65, 74, HealthInsurancePopulation.WITHOUT),
    "_055E": meta(Sex.FEMALE, 65, None),
    "_056E": meta(Sex.FEMALE, 65, None, HealthInsurancePopulation.WITH),
    "_057E": meta(Sex.FEMALE, 65, None, HealthInsurancePopulation.WITHOUT),
}

# Given the Prefix: eg.
# {"C27001A":{MetadataKey.RACE: RACE["WHITE_ALONE"]}}
# will combine with the provided suffixes eg.
# {
#   "_002E":meta(None,0, 19),
#   "_003E":meta(None,0, 19,HealthInsurancePopulation.WITH)
#   ...
# }
# to create the ACS variable params.
# ?for=state&get=C27001A_002E,C27001A_003E...


def format_params(prefixes, suffixes, is_county=False):
    groups = []
    for prefix in prefixes:
        for suffix in suffixes:
            groups.append(prefix+suffix)
    vars = ','.join(groups)

    return {'for': 'county' if is_county else 'state', "get": vars}


class AcsHealhInsuranceIngestor:

    # Initialize variables in class instance, also merge all metadata so that lookup of the
    # prefix, suffix combos can return the entire metadata
    def __init__(self, base):
        self.base_url = base
        self.data = {}
        self.metadata = {}
        self.build_metadata_list()

    # Gets standardized filename
    # If race is set, gets race filename
    # If race is None and sex is set, gets filename for sex
    def get_filename(self, sex, race, is_county):
        if race is not None:
            return "HEALTH_INSURANCE_BY_RACE_{0}_{1}.json".format("STATE" if is_county else "COUNTY", race)
        else:
            return "HEALTH_INSURANCE_BY_SEX_{0}_{1}.json".format("STATE" if is_county else "COUNTY", sex)

    # Method to output <Filename.csv>.  Used for debugging purposes.
    def write_local_files_debug(self):
        self.get_state_fips_mapping()
        self.get_county_fips_mapping()
        self.get_health_insurance_data_by_sex()
        self.get_health_insurance_data_by_race()
        self.split_data_frames()

        with open('total_health_insurance.json', 'w') as f:
            print(json.dumps(
                {str(k): v for k, v in self.data.items()}, indent=4), file=f)

        for table_name, df in self.frames.items():
            df.to_csv(table_name + ".csv", index=False)

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
        male_state_params = format_params(
            HEALTH_INSURANCE_BY_SEX_GROUPS_PREFIX, HEALTH_INSURANCE_BY_SEX_MALE_SUFFIXES)

        file_diff = url_file_to_gcs.url_file_to_gcs(
            self.base_url, male_state_params, bucket,
            self.get_filename(Sex.MALE, None, False))

        female_state_params = format_params(
            HEALTH_INSURANCE_BY_SEX_GROUPS_PREFIX, HEALTH_INSURANCE_BY_SEX_FEMALE_SUFFIXES)
        file_diff = url_file_to_gcs.url_file_to_gcs(
            self.base_url, female_state_params, bucket,
            self.get_filename(Sex.FEMALE, None, False)) or file_diff

        male_county_params = format_params(
            HEALTH_INSURANCE_BY_SEX_GROUPS_PREFIX, HEALTH_INSURANCE_BY_SEX_MALE_SUFFIXES, True)
        file_diff = url_file_to_gcs.url_file_to_gcs(
            self.base_url, male_county_params, bucket,
            self.get_filename(Sex.MALE, None, True)) or file_diff

        female_county_params = format_params(
            HEALTH_INSURANCE_BY_SEX_GROUPS_PREFIX, HEALTH_INSURANCE_BY_SEX_FEMALE_SUFFIXES, True)
        file_diff = url_file_to_gcs.url_file_to_gcs(
            self.base_url, female_county_params, bucket,
            self.get_filename(Sex.FEMALE, None, True)) or file_diff

        # Iterates over the different race ACS variables,
        # retrieves the race from the metadata merged dict
        # writes the data to the GCS bucket and sees if file diff is changed
        for prefix in HEALTH_INSURANCE_BY_RACE_GROUP_PREFIXES:
            for prefix_key in prefix:
                race_state_params = format_params(
                    prefix, HEALTH_INSURANCE_BY_RACE_GROUP_SUFFIXES)
                race = prefix[prefix_key][MetadataKey.RACE]
                file_diff = url_file_to_gcs.url_file_to_gcs(
                    self.base_url, race_state_params, bucket,
                    self.get_filename(None, race, False)) or file_diff

                race_county_params = format_params(
                    prefix, HEALTH_INSURANCE_BY_RACE_GROUP_SUFFIXES, True)
                file_diff = url_file_to_gcs.url_file_to_gcs(
                    self.base_url, race_county_params, bucket,
                    self.get_filename(None, race, True)) or file_diff

        return file_diff

    def write_to_bq(self, dataset, gcs_bucket):
        # Get an ACS mapping of Fip Codes to State Names and county codes to county names
        self.get_state_fips_mapping()
        self.get_county_fips_mapping()

        # Pull data from GCS and aggregate in memory
        self.get_health_insurance_data_by_sex(
            use_gcs=True, gcs_bucket=gcs_bucket)
        self.get_health_insurance_data_by_race(
            use_gcs=True, gcs_bucket=gcs_bucket)

        # Split internal memory into data frames for sex/race by state/county
        self.split_data_frames()

        # Create BQ columns and write dataframes to BQ
        for table_name, df in self.frames.items():
            # All breakdown columns are strings
            column_types = {c: 'STRING' for c in df.columns}

            column_types[WITH_HEALTH_INSURANCE_COL] = 'INT64'
            column_types[WITHOUT_HEALTH_INSURANCE_COL] = 'INT64'
            column_types[TOTAL_HEALTH_INSURANCE_COL] = 'INT64'

            gcs_to_bq_util.append_dataframe_to_bq(
                df, dataset, table_name, column_types=column_types)

    # This method runs through each Race/Sex Prefix Suffix
    # group and creates an in memory metadata table
    # by combining the prefix metadata with the suffix metadata. This makes lookup of the combined
    # Metadata quick, without having to explicitely define each combination of metadata
    # EG:
    # Prefixes:
    # {"C27001A":{MetadataKey.RACE: RACE["WHITE_ALONE"]}},
    # {"C27001B":{MetadataKey.RACE: RACE["BLACK_OR_AFRICAN_AMERICAN_ALONE"]}}
    # Suffixes:
    #    {"_002E":meta(None,0, 19),
    #     "_003E":meta(None,0, 19,HealthInsurancePopulation.WITH) ``}
    # Combine Into Four:
    # {"C27001A_002E": {Race: White, Age: 0-19: Sex: None, Population: Total}}
    # {"C27001A_OO3E": {Race: White, Age: 0-19: Sex: None, PopulW[MetadataKey.RACE]
    def build_metadata_list(self):
        for race_prefix in HEALTH_INSURANCE_BY_RACE_GROUP_PREFIXES:
            for prefix in race_prefix:
                for suffix in HEALTH_INSURANCE_BY_RACE_GROUP_SUFFIXES:
                    key = prefix+suffix
                    prefix_metadata = race_prefix[prefix].copy()
                    prefix_metadata.update(
                        HEALTH_INSURANCE_BY_RACE_GROUP_SUFFIXES[suffix])
                    self.metadata[key] = prefix_metadata

        for sex_prefix in HEALTH_INSURANCE_BY_SEX_GROUPS_PREFIX:
            for male_suffix in HEALTH_INSURANCE_BY_SEX_MALE_SUFFIXES:
                key = sex_prefix + male_suffix
                meta = HEALTH_INSURANCE_BY_SEX_GROUPS_PREFIX[sex_prefix].copy()
                meta.update(HEALTH_INSURANCE_BY_SEX_MALE_SUFFIXES[male_suffix])
                self.metadata[key] = meta

            for female_suffix in HEALTH_INSURANCE_BY_SEX_FEMALE_SUFFIXES:
                key = sex_prefix + female_suffix
                meta = HEALTH_INSURANCE_BY_SEX_GROUPS_PREFIX[sex_prefix].copy()
                meta.update(
                    HEALTH_INSURANCE_BY_SEX_FEMALE_SUFFIXES[female_suffix])
                self.metadata[key] = meta

    # Pull the State_Fips map Code->Name from ACS

    def get_state_fips_mapping(self):
        params = {'for': 'state', "get": "NAME"}
        resp = requests.get(self.base_url, params=params)
        json_formatted_response = resp.json()
        state_fips = {}
        for row in json_formatted_response[1::]:
            state_name, fip_code = row
            state_fips[fip_code] = state_name

        self.state_fips = state_fips

    # Pull the County Fips map Code->Name from ACS
    def get_county_fips_mapping(self):
        params = {'for': 'county', "get": "NAME"}
        resp = requests.get(self.base_url, params=params)
        json_formatted_response = resp.json()
        county_fips = {}
        for row in json_formatted_response[1::]:
            county_name, state_fip, county_fip = row

            county_fips[(state_fip, county_fip)] = county_name

        self.county_fips = county_fips

    # Given an ACS formatted param string, query the server, log and return the response as JSON
    # Note: the method is defined this way to be similar to the Upload_to_GCS_util method.
    def get_acs_data_from_variables(self, params):
        resp = requests.get(self.base_url, params=params)
        return resp.json()

    #   Get Health insurance data from either GCS or Directly, and aggregate the data in memory
    def get_health_insurance_data_by_race(self, use_gcs=False, gcs_bucket=None):
        if use_gcs:
            for race in RACE:
                # Get cached data from GCS
                state_data = gcs_to_bq_util.load_values_as_json(
                    gcs_bucket, self.get_filename(None, race, False))
                county_data = gcs_to_bq_util.load_values_as_json(
                    gcs_bucket, self.get_filename(None, race, True))

                # Aggregate in Memory
                self.accumulate_acs_data(state_data)
                self.accumulate_acs_data(county_data)
        else:
            for prefix in HEALTH_INSURANCE_BY_RACE_GROUP_PREFIXES:
                # Get ACS data from API
                state_data = self.get_acs_data_from_variables(format_params(
                    prefix, HEALTH_INSURANCE_BY_RACE_GROUP_SUFFIXES))
                county_sex_data = self.get_acs_data_from_variables(format_params(
                    prefix, HEALTH_INSURANCE_BY_RACE_GROUP_SUFFIXES, True))

                # Aggregate in Memory
                self.accumulate_acs_data(state_data)
                self.accumulate_acs_data(county_sex_data)

    # Get Health insurance By Sex from either API or GCS and aggregate it in memory
    def get_health_insurance_data_by_sex(self, use_gcs=False, gcs_bucket=None):
        if(use_gcs):  # LOAD JSON BLOBS FROM GCS
            male_state_data = gcs_to_bq_util.load_values_as_json(
                gcs_bucket, self.get_filename(Sex.MALE, None, False))
            female_state_data = gcs_to_bq_util.load_values_as_json(
                gcs_bucket, self.get_filename(Sex.FEMALE, None, False))
            male_county_data = gcs_to_bq_util.load_values_as_json(
                gcs_bucket, self.get_filename(Sex.MALE, None, True))
            female_county_data = gcs_to_bq_util.load_values_as_json(
                gcs_bucket, self.get_filename(Sex.FEMALE, None, True))
        else:  # LOAD DATA FROM ACS (useful for local debug)
            male_state_request_params = format_params(
                HEALTH_INSURANCE_BY_SEX_GROUPS_PREFIX, HEALTH_INSURANCE_BY_SEX_MALE_SUFFIXES)
            female_state_request_params = format_params(
                HEALTH_INSURANCE_BY_SEX_GROUPS_PREFIX, HEALTH_INSURANCE_BY_SEX_FEMALE_SUFFIXES)
            male_county_request_params = format_params(
                HEALTH_INSURANCE_BY_SEX_GROUPS_PREFIX, HEALTH_INSURANCE_BY_SEX_MALE_SUFFIXES, True)
            female_county_request_params = format_params(
                HEALTH_INSURANCE_BY_SEX_GROUPS_PREFIX, HEALTH_INSURANCE_BY_SEX_FEMALE_SUFFIXES, True)

            male_state_data = self.get_acs_data_from_variables(
                male_state_request_params)
            female_state_data = self.get_acs_data_from_variables(
                female_state_request_params)
            male_county_data = self.get_acs_data_from_variables(
                male_county_request_params)
            female_county_data = self.get_acs_data_from_variables(
                female_county_request_params)

        # Aggregate and accumulate data in memory
        self.accumulate_acs_data(male_state_data)
        self.accumulate_acs_data(female_state_data)
        self.accumulate_acs_data(male_county_data)
        self.accumulate_acs_data(female_county_data)

    '''
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
    '''

    def accumulate_acs_data(self, data):
        key_row = data[0]
        for row in data[1::]:
            data = {}
            for key in key_row:
                if(key != 'state' and key != 'county'):
                    data[key] = {}
            state_fip = None
            county_fip = None
            for col_index in range(len(row)):
                col = row[col_index]
                key = key_row[col_index]
                if(key == 'state'):
                    state_fip = col  # Extract the static key_row state
                elif key == 'county':
                    # Extract the static key_row (county) *if exists
                    county_fip = col
                else:
                    data[key] = {'value': col, 'meta': self.metadata[key]}

            for var in data:
                metadata = data[var]['meta']
                value = data[var]['value']
                row = self.upsert_row(state_fip, county_fip, metadata.get(
                    MetadataKey.AGE), metadata.get(MetadataKey.SEX),
                    metadata.get(MetadataKey.RACE))
                row[metadata[MetadataKey.POPULATION]] = value

    # Helper method from grabbing a tuple in self.data.  If the
    # tuple hasnt been created then it initializes an empty tuple.
    # This is needed as each data variable will only
    # update one of the population values at a time.

    def upsert_row(self, state_fip, county_fip, age, sex, race):
        if (state_fip, county_fip, age, sex, race) not in self.data:
            self.data[(state_fip, county_fip, age, sex, race)] = {
                HealthInsurancePopulation.TOTAL: -1,
                HealthInsurancePopulation.WITH: -1,
                HealthInsurancePopulation.WITHOUT: -1
            }
        return self.data[(state_fip, county_fip, age, sex, race)]

    # Splits the in memory aggregation into dataframes
    def split_data_frames(self):
        state_sex_data = []
        state_race_data = []
        county_race_data = []
        county_sex_data = []

        # Extract keys from self.data Tuple
        # (state_fip, County_fip, Age, Sex, Race): {PopulationObj}
        for data in self.data:
            state_fip, county_fip, age, sex, race = data

            population = self.data[data]
            whi = population[HealthInsurancePopulation.WITH]
            wohi = population[HealthInsurancePopulation.WITHOUT]
            total = population[HealthInsurancePopulation.TOTAL]

            if county_fip is None:
                # State-Sex
                if race is None:
                    state_sex_data.append(
                        [state_fip, self.state_fips[state_fip], age, sex, whi, wohi, total])
                # State-Race
                else:
                    state_race_data.append(
                        [state_fip, self.state_fips[state_fip], age, race, whi, wohi, total])
            else:

                # County-Sex
                if race is None:
                    county_sex_data.append([state_fip, self.state_fips[state_fip], county_fip, self.county_fips[(
                        state_fip, county_fip)], age, sex, whi, wohi, total])

                # County-Race
                else:
                    county_race_data.append([state_fip, self.state_fips[state_fip], county_fip, self.county_fips[(
                        state_fip, county_fip)], age, race, whi, wohi, total])

        # Build Panda DataFrames with standardized cols
        self.state_sex_frame = pd.DataFrame(state_sex_data, columns=[
            STATE_FIPS_COL,
            STATE_NAME_COL,
            AGE_COL,
            SEX_COL,
            WITH_HEALTH_INSURANCE_COL,
            WITHOUT_HEALTH_INSURANCE_COL,
            TOTAL_HEALTH_INSURANCE_COL])
        self.state_race_frame = pd.DataFrame(state_race_data, columns=[
            STATE_FIPS_COL,
            STATE_NAME_COL,
            AGE_COL,
            RACE_COL,
            WITH_HEALTH_INSURANCE_COL,
            WITHOUT_HEALTH_INSURANCE_COL,
            TOTAL_HEALTH_INSURANCE_COL])
        self.county_sex_frame = pd.DataFrame(county_sex_data, columns=[
            STATE_FIPS_COL,
            STATE_NAME_COL,
            COUNTY_FIPS_COL,
            COUNTY_NAME_COL,
            AGE_COL,
            SEX_COL,
            WITH_HEALTH_INSURANCE_COL,
            WITHOUT_HEALTH_INSURANCE_COL,
            TOTAL_HEALTH_INSURANCE_COL])
        self.county_race_frame = pd.DataFrame(county_race_data, columns=[
            STATE_FIPS_COL,
            STATE_NAME_COL,
            COUNTY_FIPS_COL,
            COUNTY_NAME_COL,
            AGE_COL,
            RACE_COL,
            WITH_HEALTH_INSURANCE_COL,
            WITHOUT_HEALTH_INSURANCE_COL,
            TOTAL_HEALTH_INSURANCE_COL])

        # Aggregate Frames by Filename
        self.frames = {
            'health_insurance_by_race_state': self.state_race_frame,
            'health_insurance_by_sex_state': self.state_sex_frame,
            'health_insurance_by_race_county': self.county_race_frame,
            'health_insurance_by_sex_county': self.county_sex_frame
        }


class ACSHealthInsurance(DataSource):

    @staticmethod
    def get_id():
        """Returns the data source's unique id. """
        return 'ACS_HEALTH_INSURANCE'

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
            AcsHealhInsuranceIngestor(BASE_ACS_URL),
        ]


# AcsHealhInsuranceIngestor(BASE_ACS_URL).upload_to_gcs(
#     'kalieki-dev-landing-bucket')
# AcsHealhInsuranceIngestor(BASE_ACS_URL).write_to_bq(
#     'acs_health_insurance_manual_test', 'kalieki-dev-landing-bucket')


# AcsHealhInsuranceIngestor(BASE_ACS_URL).write_local_files_debug()
