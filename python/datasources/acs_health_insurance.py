import pandas as pd

import requests
import json
from datasources.data_source import DataSource
from ingestion import url_file_to_gcs, gcs_to_bq_util

from ingestion.standardized_columns import (STATE_FIPS_COL, COUNTY_FIPS_COL,
                                            STATE_NAME_COL, COUNTY_NAME_COL,
                                            AGE_COL, SEX_COL,
                                            RACE_COL, WITH_HEALTH_INSURANCE_COL,
                                            WITHOUT_HEALTH_INSURANCE_COL,
                                            TOTAL_HEALTH_INSURANCE_COL)
# TODO pass this in from message data.
BASE_ACS_URL = "https://api.census.gov/data/2019/acs/acs5"


class HealthInsurancePopulation:
    WITH = "With"
    WITHOUT = "Without"
    TOTAL = "Total"


class Race:
    WHITE_ALONE = "WHITE_ALONE"
    BLACK_OR_AFRICAN_AMERICAN_ALONE = "BLACK_OR_AFRICAN_AMERICAN_ALONE"
    AMERICAN_INDIAN_AND_ALASKA_NATIVE_ALONE = "AMERICAN_INDIAN_AND_ALASKA_NATIVE_ALONE"
    ASIAN_ALONE = "ASIAN_ALONE"
    NATIVE_HAWAIIAN_AND_OTHER_PACIFIC_ISLANDER_ALONE = "NATIVE_HAWAIIAN_AND_OTHER_PACIFIC_ISLANDER_ALONE"
    SOME_OTHER_RACE_ALONE = "SOME_OTHER_RACE_ALONE"
    TWO_OR_MORE_RACES = "TWO_OR_MORE_RACES"
    WHITE_ALONE_NOT_HISPANIC_OR_LATINO = "WHITE_ALONE,_NOT_HISPANIC_OR_LATINO"
    HISPANIC_OR_LATINO = "HISPANIC_OR_LATINO"

    @staticmethod
    def values():
        return [
            Race.WHITE_ALONE,
            Race.BLACK_OR_AFRICAN_AMERICAN_ALONE,
            Race.AMERICAN_INDIAN_AND_ALASKA_NATIVE_ALONE,
            Race.ASIAN_ALONE,
            Race.NATIVE_HAWAIIAN_AND_OTHER_PACIFIC_ISLANDER_ALONE,
            Race.SOME_OTHER_RACE_ALONE,
            Race.TWO_OR_MORE_RACES,
            Race.WHITE_ALONE_NOT_HISPANIC_OR_LATINO,
            Race.HISPANIC_OR_LATINO
        ]

    RENAME_RACE_DICT = {
        AMERICAN_INDIAN_AND_ALASKA_NATIVE_ALONE: "American Indian and Alaska Native alone",
        ASIAN_ALONE: "Asian alone",
        BLACK_OR_AFRICAN_AMERICAN_ALONE: "Black or African American alone",
        NATIVE_HAWAIIAN_AND_OTHER_PACIFIC_ISLANDER_ALONE: "Native Hawaiian and Other Pacific Islander alone",
        SOME_OTHER_RACE_ALONE: "Some other race alone",
        TWO_OR_MORE_RACES: "Two or more races",
        WHITE_ALONE: "White alone"
    }

    @staticmethod
    def rename(ACS_NAME):
        return Race.RENAME_RACE_DICT[ACS_NAME]


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
    {"C27001A": {MetadataKey.RACE: Race.WHITE_ALONE}},
    {"C27001B": {MetadataKey.RACE: Race.BLACK_OR_AFRICAN_AMERICAN_ALONE}},
    {"C27001C": {MetadataKey.RACE: Race.AMERICAN_INDIAN_AND_ALASKA_NATIVE_ALONE}},
    {"C27001D": {MetadataKey.RACE: Race.ASIAN_ALONE}},
    {"C27001E": {MetadataKey.RACE: Race.NATIVE_HAWAIIAN_AND_OTHER_PACIFIC_ISLANDER_ALONE}},
    {"C27001F": {MetadataKey.RACE: Race.SOME_OTHER_RACE_ALONE}},
    {"C27001G": {MetadataKey.RACE: Race.TWO_OR_MORE_RACES}},
    {"C27001H": {MetadataKey.RACE: Race.WHITE_ALONE_NOT_HISPANIC_OR_LATINO}},
    {"C27001I": {MetadataKey.RACE: Race.HISPANIC_OR_LATINO}},
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
HEALTH_INSURANCE_BY_SEX_GROUPS_PREFIX = {"B27001": {}}


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
# {"C27001A":{MetadataKey.RACE: Race.WHITE_ALONE}}
# will combine with the provided suffixes eg.
# {
#   "_002E":meta(None,0, 19),
#   "_003E":meta(None,0, 19,HealthInsurancePopulation.WITH)
#   ...
# }
# to create the ACS variable params.
# ?for=state&get=C27001A_002E,C27001A_003E...


def format_params(prefixes, suffixes, isCounty=False):
    groups = []
    for prefix in prefixes:
        for suffix in suffixes:
            groups.append(prefix+suffix)
    vars = ','.join(groups)

    return {'for': 'county' if isCounty else 'state', "get": vars}

# Helper to log response codes from ACS calls


def log_response(resp):
    print("-"*50)
    print(f'Get Request ({resp.status_code}): {resp.url}')
    print("-"*50)


class AcsHealhInsuranceIngestor:

    # Initialize variables in class instance, also merge all metadata so that lookup of the
    # prefix, suffix combos can return the entire metadata
    def __init__(self, base):
        self.baseUrl = base
        self.data = {}
        self.metadata = {}
        self.buildMetadataList()

    # Gets standardized filename
    def getFilename(self, sex, race, isCounty):
        if(race is not None):
            return "HEALTH_INSURANCE_BY_RACE_{0}_{1}.json".format("STATE" if isCounty else "COUNTY", race)
        else:
            return "HEALTH_INSURANCE_BY_SEX_{0}_{1}.json".format("STATE" if isCounty else "COUNTY", sex)

    # Method to output <Filename.csv>.  Used for debugging purposes.
    def write_local_files_debug(self):
        self.getStateFipsMap()
        self.getCountyFipsMap()
        self.getHealthInsuranceDataBySex()
        self.getHealthInsuranceDataByRace()
        self.splitDataFrames()

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

    def upload_to_gcs(self, bucket):
        maleStateParams = format_params(
            HEALTH_INSURANCE_BY_SEX_GROUPS_PREFIX, HEALTH_INSURANCE_BY_SEX_MALE_SUFFIXES)
        fileDiff = url_file_to_gcs.url_file_to_gcs(
            self.baseUrl, maleStateParams, bucket,
            self.getFilename(Sex.MALE, None, False))

        femaleStateParams = format_params(
            HEALTH_INSURANCE_BY_SEX_GROUPS_PREFIX, HEALTH_INSURANCE_BY_SEX_FEMALE_SUFFIXES)
        fileDiff = url_file_to_gcs.url_file_to_gcs(
            self.baseUrl, femaleStateParams, bucket,
            self.getFilename(Sex.FEMALE, None, False)) and fileDiff

        maleCountyParams = format_params(
            HEALTH_INSURANCE_BY_SEX_GROUPS_PREFIX, HEALTH_INSURANCE_BY_SEX_MALE_SUFFIXES, True)
        fileDiff = url_file_to_gcs.url_file_to_gcs(
            self.baseUrl, maleCountyParams, bucket,
            self.getFilename(Sex.MALE, None, True)) and fileDiff

        femaleCountyParams = format_params(
            HEALTH_INSURANCE_BY_SEX_GROUPS_PREFIX, HEALTH_INSURANCE_BY_SEX_FEMALE_SUFFIXES, True)
        fileDiff = url_file_to_gcs.url_file_to_gcs(
            self.baseUrl, femaleCountyParams, bucket,
            self.getFilename(Sex.FEMALE, None, True)) and fileDiff

        for prefix in HEALTH_INSURANCE_BY_RACE_GROUP_PREFIXES:
            for prefixKey in prefix:
                raceStateParams = format_params(
                    prefix, HEALTH_INSURANCE_BY_RACE_GROUP_SUFFIXES)
                race = prefix[prefixKey][MetadataKey.RACE]
                fileDiff = url_file_to_gcs.url_file_to_gcs(
                    self.baseUrl, raceStateParams, bucket,
                    self.getFilename(None, race, False)) and fileDiff
                raceCountyParams = format_params(
                    prefix, HEALTH_INSURANCE_BY_RACE_GROUP_SUFFIXES, True)
                fileDiff = url_file_to_gcs.url_file_to_gcs(
                    self.baseUrl, raceCountyParams, bucket,
                    self.getFilename(None, race, True)) and fileDiff

        return fileDiff

    def write_to_bq(self, dataset, gcs_bucket):
        # Get an ACS mapping of Fip Codes to State Names and county codes to county names
        self.getStateFipsMap()
        self.getCountyFipsMap()

        # Pull data from GCS and aggregate in memory
        self.getHealthInsuranceDataBySex(useGcs=True, gcs_bucket=gcs_bucket)
        self.getHealthInsuranceDataByRace(useGcs=True, gcs_bucket=gcs_bucket)

        # Split internal memory into data frames for sex/race by state/county
        self.splitDataFrames()

        # Create BQ collumns and write dataframes to BQ
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
    # {"C27001A":{MetadataKey.RACE: Race.WHITE_ALONE}},
    # {"C27001B":{MetadataKey.RACE: Race.BLACK_OR_AFRICAN_AMERICAN_ALONE}}
    # Suffixes:
    #    {"_002E":meta(None,0, 19),
    #     "_003E":meta(None,0, 19,HealthInsurancePopulation.WITH) ``}
    # Combine Into Four:
    # {"C27001A_002E": {Race: White, Age: 0-19: Sex: None, Population: Total}}
    # {"C27001A_OO3E": {Race: White, Age: 0-19: Sex: None, PopulW[MetadataKey.RACE]
    def buildMetadataList(self):
        for racePrefix in HEALTH_INSURANCE_BY_RACE_GROUP_PREFIXES:
            for prefix in racePrefix:
                for suffix in HEALTH_INSURANCE_BY_RACE_GROUP_SUFFIXES:
                    key = prefix+suffix
                    print(
                        f'Building merged metadata for {key}: {racePrefix[prefix]} + '
                        f'{HEALTH_INSURANCE_BY_RACE_GROUP_SUFFIXES[suffix]}')
                    prefixMeta = racePrefix[prefix].copy()
                    prefixMeta.update(
                        HEALTH_INSURANCE_BY_RACE_GROUP_SUFFIXES[suffix])
                    self.metadata[key] = prefixMeta

        for sex_prefix in HEALTH_INSURANCE_BY_SEX_GROUPS_PREFIX:
            for male_suffix in HEALTH_INSURANCE_BY_SEX_MALE_SUFFIXES:
                key = sex_prefix + male_suffix
                print(
                    f'Building merged metadata for {key}: '
                    f'{HEALTH_INSURANCE_BY_SEX_GROUPS_PREFIX[sex_prefix]} + '
                    f'{HEALTH_INSURANCE_BY_SEX_MALE_SUFFIXES[male_suffix]}')
                meta = HEALTH_INSURANCE_BY_SEX_GROUPS_PREFIX[sex_prefix].copy()
                meta.update(HEALTH_INSURANCE_BY_SEX_MALE_SUFFIXES[male_suffix])
                self.metadata[key] = meta

            for female_suffix in HEALTH_INSURANCE_BY_SEX_FEMALE_SUFFIXES:
                key = sex_prefix + female_suffix
                print(
                    f'Building merged metadata for {key}: '
                    f'{HEALTH_INSURANCE_BY_SEX_GROUPS_PREFIX[sex_prefix]} + '
                    f'{HEALTH_INSURANCE_BY_SEX_FEMALE_SUFFIXES[female_suffix]}')
                meta = HEALTH_INSURANCE_BY_SEX_GROUPS_PREFIX[sex_prefix].copy()
                meta.update(
                    HEALTH_INSURANCE_BY_SEX_FEMALE_SUFFIXES[female_suffix])
                self.metadata[key] = meta

    # Pull the State_Fips map Code->Name from ACS

    def getStateFipsMap(self):
        params = {'for': 'state', "get": "NAME"}
        resp = requests.get(self.baseUrl, params=params)
        log_response(resp)
        jResp = resp.json()
        stateFips = {}
        for row in jResp[1::]:
            fipCode = row[1]
            stateName = row[0]
            stateFips[fipCode] = stateName

        self.stateFips = stateFips

    # Pull the County Fips map Code->Name from ACS
    def getCountyFipsMap(self):
        params = {'for': 'county', "get": "NAME"}
        resp = requests.get(self.baseUrl, params=params)
        log_response(resp)
        jResp = resp.json()
        countyFips = {}
        for row in jResp[1::]:
            countyFip = row[2]
            stateFip = row[1]
            countyName = row[0]
            countyFips[(stateFip, countyFip)] = countyName

        self.countyFips = countyFips

    # Given an ACS formatted param string, query the server, log and return the response as JSON
    # Note: the method is defined this way to be similar to the Upload_to_GCS_util method.
    def getAcsDataFromVariables(self, params):
        resp = requests.get(self.baseUrl, params=params)
        log_response(resp)
        return resp.json()

    #   Get Health insurance data from either GCS or Directly, and aggregate the data in memory
    def getHealthInsuranceDataByRace(self, useGcs=False, gcs_bucket=None):
        if useGcs:
            for race in Race.values():
                # Get cached data from GCS
                stateData = gcs_to_bq_util.load_values_as_json(
                    gcs_bucket, self.getFilename(None, race, False))
                countyData = gcs_to_bq_util.load_values_as_json(
                    gcs_bucket, self.getFilename(None, race, True))

                # Aggregate in Memory
                self.accumulateAcsData(stateData)
                self.accumulateAcsData(countyData)
        else:
            for prefix in HEALTH_INSURANCE_BY_RACE_GROUP_PREFIXES:
                # Get ACS data from API
                stateData = self.getAcsDataFromVariables(format_params(
                    prefix, HEALTH_INSURANCE_BY_RACE_GROUP_SUFFIXES))
                countySexData = self.getAcsDataFromVariables(format_params(
                    prefix, HEALTH_INSURANCE_BY_RACE_GROUP_SUFFIXES, True))

                # Aggregate in Memory
                self.accumulateAcsData(stateData)
                self.accumulateAcsData(countySexData)

    # Get Health insurance By Sex from either API or GCS and aggregate it in memory
    def getHealthInsuranceDataBySex(self, useGcs=False, gcs_bucket=None):
        if(useGcs):  # LOAD JSON BLOBS FROM GCS
            maleStateData = gcs_to_bq_util.load_values_as_json(
                gcs_bucket, self.getFilename(Sex.MALE, None, False))
            femaleStateData = gcs_to_bq_util.load_values_as_json(
                gcs_bucket, self.getFilename(Sex.FEMALE, None, False))
            maleCountyData = gcs_to_bq_util.load_values_as_json(
                gcs_bucket, self.getFilename(Sex.MALE, None, True))
            femaleCountyData = gcs_to_bq_util.load_values_as_json(
                gcs_bucket, self.getFilename(Sex.FEMALE, None, True))
        else:  # LOAD DATA FROM ACS (useful for local debug)
            maleStateRequestParams = format_params(
                HEALTH_INSURANCE_BY_SEX_GROUPS_PREFIX, HEALTH_INSURANCE_BY_SEX_MALE_SUFFIXES)
            femaleStateRequestParams = format_params(
                HEALTH_INSURANCE_BY_SEX_GROUPS_PREFIX, HEALTH_INSURANCE_BY_SEX_FEMALE_SUFFIXES)
            maleCountyRequestParams = format_params(
                HEALTH_INSURANCE_BY_SEX_GROUPS_PREFIX, HEALTH_INSURANCE_BY_SEX_MALE_SUFFIXES, True)
            femaleCountyRequestParams = format_params(
                HEALTH_INSURANCE_BY_SEX_GROUPS_PREFIX, HEALTH_INSURANCE_BY_SEX_FEMALE_SUFFIXES, True)

            maleStateData = self.getAcsDataFromVariables(
                maleStateRequestParams)
            femaleStateData = self.getAcsDataFromVariables(
                femaleStateRequestParams)
            maleCountyData = self.getAcsDataFromVariables(
                maleCountyRequestParams)
            femaleCountyData = self.getAcsDataFromVariables(
                femaleCountyRequestParams)

        # Aggregate and accumulate data in memory
        self.accumulateAcsData(maleStateData)
        self.accumulateAcsData(femaleStateData)
        self.accumulateAcsData(maleCountyData)
        self.accumulateAcsData(femaleCountyData)

    '''
    Takes data in the form of
    [
        [C27001A_002E, C27001A_003E, C27001B_002E, C27001B_002E][state][?county],
        [12345, 1245, 123546, 124567, 01, 02]
        ...
    ]
    This method determines the variables at the top (aka: keyrow)
    matches the value with the metadata from the prefix_suffix list
    and stores it in the self.data as a tuple

    (stateFip, countyFip, age, sex, race) example:
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

    def accumulateAcsData(self, data):
        keyRow = data[0]
        for row in data[1::]:
            data = {}
            for key in keyRow:
                if(key != 'state' and key != 'county'):
                    data[key] = {}
            stateFip = None
            countyFip = None
            colIndex = 0
            for col in row:
                key = keyRow[colIndex]
                if(key == 'state'):
                    stateFip = col  # Extract the static keyrow state
                elif key == 'county':
                    # Extract the static keyrow (county) *if exists
                    countyFip = col
                else:
                    data[key] = {'value': col, 'meta': self.metadata[key]}

                colIndex += 1

            # Helpful logging
            print("-"*50)
            print(f'Analyzing Data [State: {stateFip} County: {countyFip}]')

            for var in data:
                metadata = data[var]['meta']
                value = data[var]['value']
                row = self.upsertRow(stateFip, countyFip, metadata.get(
                    MetadataKey.AGE), metadata.get(MetadataKey.SEX),
                    metadata.get(MetadataKey.RACE))
                row[metadata[MetadataKey.POPULATION]] = value

    # Helper method from grabbing a tuple in self.data.  If the
    # tuple hasnt been created then it initializes an empty tuple.
    # This is needed as each data variable will only
    # update one of the population values at a time.

    def upsertRow(self, stateFip, countyFip, age, sex, race):
        if self.data.get((stateFip, countyFip, age, sex, race)) is None:
            self.data[(stateFip, countyFip, age, sex, race)] = {
                HealthInsurancePopulation.TOTAL: -1,
                HealthInsurancePopulation.WITH: -1,
                HealthInsurancePopulation.WITHOUT: -1
            }
        return self.data[(stateFip, countyFip, age, sex, race)]

    # Splits the in memory aggregation into dataframes
    def splitDataFrames(self):
        stateSexData = []
        stateRaceData = []
        countyRaceData = []
        countySexData = []

        # Extract keys from self.data Tuple
        # (StateFip, CountyFip, Age, Sex, Race): {PopulationObj}
        for data in self.data:
            stateFip = data[0]
            countyFip = data[1]
            age = data[2]
            sex = data[3]
            race = data[4]
            population = self.data[data]
            whi = population[HealthInsurancePopulation.WITH]
            wohi = population[HealthInsurancePopulation.WITHOUT]
            total = population[HealthInsurancePopulation.TOTAL]

            #
            if countyFip is None:
                # State-Sex
                if race is None:
                    stateSexData.append(
                        [stateFip, self.stateFips[stateFip], age, sex, whi, wohi, total])
                # State-Race
                else:
                    stateRaceData.append(
                        [stateFip, self.stateFips[stateFip], age, race, whi, wohi, total])
            else:

                # County-Sex
                if race is None:
                    countySexData.append([stateFip, self.stateFips[stateFip], countyFip, self.countyFips[(
                        stateFip, countyFip)], age, sex, whi, wohi, total])

                # County-Race
                else:
                    countyRaceData.append([stateFip, self.stateFips[stateFip], countyFip, self.countyFips[(
                        stateFip, countyFip)], age, race, whi, wohi, total])

        # Build Panda DataFrames with standardized cols
        self.stateSexFrame = pd.DataFrame(stateSexData, columns=[
            STATE_FIPS_COL,
            STATE_NAME_COL,
            AGE_COL,
            SEX_COL,
            WITH_HEALTH_INSURANCE_COL,
            WITHOUT_HEALTH_INSURANCE_COL,
            TOTAL_HEALTH_INSURANCE_COL])
        self.stateRaceFrame = pd.DataFrame(stateRaceData, columns=[
            STATE_FIPS_COL,
            STATE_NAME_COL,
            AGE_COL,
            RACE_COL,
            WITH_HEALTH_INSURANCE_COL,
            WITHOUT_HEALTH_INSURANCE_COL,
            TOTAL_HEALTH_INSURANCE_COL])
        self.countySexFrame = pd.DataFrame(countySexData, columns=[
            STATE_FIPS_COL,
            STATE_NAME_COL,
            COUNTY_FIPS_COL,
            COUNTY_NAME_COL,
            AGE_COL,
            SEX_COL,
            WITH_HEALTH_INSURANCE_COL,
            WITHOUT_HEALTH_INSURANCE_COL,
            TOTAL_HEALTH_INSURANCE_COL])
        self.countyRaceFrame = pd.DataFrame(countyRaceData, columns=[
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
            'table_health_insurance_by_race_state': self.stateRaceFrame,
            'table_health_insurance_by_sex_state': self.stateSexFrame,
            'table_health_insurance_by_race_county': self.countyRaceFrame,
            'table_health_insurance_by_sex_county': self.countySexFrame
        }


class ACSHealthInsurance(DataSource):

    def get_id():
        return 'ACS_HEALTH_INSURANCE'

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

# AcsHealhInsuranceIngestor(BASE_ACS_URL).upload_to_gcs('kalieki-dev-landing-bucket')
# AcsHealhInsuranceIngestor(BASE_ACS_URL).write_to_bq('acs_health_insurance_manual_test', 'kalieki-dev-landing-bucket')


# AcsHealhInsuranceIngestor(BASE_ACS_URL).write_local_files_debug()
