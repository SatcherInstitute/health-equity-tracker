import pandas as pd 

import requests
import sys
import json 
from datasources.data_source import DataSource
from ingestion import url_file_to_gcs, gcs_to_bq_util

# TODO pass this in from message data.
BASE_ACS_URL = "https://api.census.gov/data/2019/acs/acs5"

class HealthInsurancePopulation:
    WITH = "With"
    WITHOUT = "Without"
    TOTAL = "Total"

class Race:
    WHITE_ALONE="WHITE_ALONE"
    BLACK_OR_AFRICAN_AMERICAN_ALONE="BLACK_OR_AFRICAN_AMERICAN_ALONE"
    AMERICAN_INDIAN_AND_ALASKA_NATIVE_ALONE="AMERICAN_INDIAN_AND_ALASKA_NATIVE_ALONE"
    ASIAN_ALONE="ASIAN_ALONE"
    NATIVE_HAWAIIAN_AND_OTHER_PACIFIC_ISLANDER_ALONE="NATIVE_HAWAIIAN_AND_OTHER_PACIFIC_ISLANDER_ALONE"
    SOME_OTHER_RACE_ALONE="SOME_OTHER_RACE_ALONE"
    TWO_OR_MORE_RACES="TWO_OR_MORE_RACES"
    WHITE_ALONE_NOT_HISPANIC_OR_LATINO="WHITE_ALONE,_NOT_HISPANIC_OR_LATINO"
    HISPANIC_OR_LATINO="HISPANIC_OR_LATINO"

class Sex:
    MALE="Male"
    FEMALE="Female"

class MetadataKey:
    RACE="race"
    SEX="sex"
    POPULATION="population"
    AGE = "age"

def meta(sex, min_age, max_age, hi_status = HealthInsurancePopulation.TOTAL):
    age = f'{min_age}+' if max_age is None else f'{min_age}-{max_age}'
    return {MetadataKey.SEX: sex, MetadataKey.AGE: age , MetadataKey.POPULATION: hi_status}


HEALTH_INSURANCE_BY_RACE_GROUP_PREFIXES = [
    {"C27001A":{MetadataKey.RACE: Race.WHITE_ALONE}},
    {"C27001B":{MetadataKey.RACE: Race.BLACK_OR_AFRICAN_AMERICAN_ALONE}},
    {"C27001C":{MetadataKey.RACE: Race.AMERICAN_INDIAN_AND_ALASKA_NATIVE_ALONE}},
    {"C27001D":{MetadataKey.RACE: Race.ASIAN_ALONE}},
    {"C27001E":{MetadataKey.RACE: Race.NATIVE_HAWAIIAN_AND_OTHER_PACIFIC_ISLANDER_ALONE}},
    {"C27001F":{MetadataKey.RACE: Race.SOME_OTHER_RACE_ALONE}},
    {"C27001G":{MetadataKey.RACE: Race.TWO_OR_MORE_RACES}},
    {"C27001H":{MetadataKey.RACE: Race.WHITE_ALONE_NOT_HISPANIC_OR_LATINO}},
    {"C27001I":{MetadataKey.RACE: Race.HISPANIC_OR_LATINO}},
]

HEALTH_INSURANCE_BY_RACE_GROUP_SUFFIXES= {
    "_002E":meta(None,0, 19),
    "_003E":meta(None,0, 19,HealthInsurancePopulation.WITH),
    "_004E":meta(None,0, 19,HealthInsurancePopulation.WITHOUT),
    "_005E":meta(None,19, 64),
    "_006E":meta(None,19, 64,HealthInsurancePopulation.WITH),
    "_007E":meta(None,19, 64,HealthInsurancePopulation.WITHOUT),
    "_008E":meta(None,65, None),
    "_009E":meta(None,65, None,HealthInsurancePopulation.WITH),
    "_010E":meta(None,65, None,HealthInsurancePopulation.WITHOUT),
}

HEALTH_INSURANCE_BY_SEX_GROUPS_PREFIX = {"B27001":{}}


HEALTH_INSURANCE_BY_SEX_MALE_SUFFIXES = {
    "_003E":meta(Sex.MALE,0, 6),
    "_004E":meta(Sex.MALE,0, 6,HealthInsurancePopulation.WITH),
    "_005E":meta(Sex.MALE,0, 6,HealthInsurancePopulation.WITHOUT),
    "_006E":meta(Sex.MALE,6, 18),
    "_007E":meta(Sex.MALE,6, 18,HealthInsurancePopulation.WITH),
    "_008E":meta(Sex.MALE,6, 18,HealthInsurancePopulation.WITHOUT),
    "_009E":meta(Sex.MALE,19, 25),
    "_010E":meta(Sex.MALE,19, 25,HealthInsurancePopulation.WITH),
    "_011E":meta(Sex.MALE,19, 25,HealthInsurancePopulation.WITHOUT),
    "_012E":meta(Sex.MALE,26, 34),
    "_013E":meta(Sex.MALE,26, 34,HealthInsurancePopulation.WITH),
    "_014E":meta(Sex.MALE,26, 34,HealthInsurancePopulation.WITHOUT),
    "_015E":meta(Sex.MALE,35, 44),
    "_016E":meta(Sex.MALE,35, 44,HealthInsurancePopulation.WITH),
    "_017E":meta(Sex.MALE,35, 44,HealthInsurancePopulation.WITHOUT),
    "_018E":meta(Sex.MALE,45, 54),
    "_019E":meta(Sex.MALE,45, 54,HealthInsurancePopulation.WITH),
    "_020E":meta(Sex.MALE,45, 54,HealthInsurancePopulation.WITHOUT),
    "_021E":meta(Sex.MALE,55, 64),
    "_022E":meta(Sex.MALE,55, 64,HealthInsurancePopulation.WITH),
    "_023E":meta(Sex.MALE,55, 64,HealthInsurancePopulation.WITHOUT),
    "_024E":meta(Sex.MALE,65, 74),
    "_025E":meta(Sex.MALE,65, 74,HealthInsurancePopulation.WITH),
    "_026E":meta(Sex.MALE,65, 74,HealthInsurancePopulation.WITHOUT),
    "_027E":meta(Sex.MALE,65, None),
    "_028E":meta(Sex.MALE,65, None,HealthInsurancePopulation.WITH),
    "_029E":meta(Sex.MALE,65, None,HealthInsurancePopulation.WITHOUT),
}

HEALTH_INSURANCE_BY_SEX_FEMALE_SUFFIXES = {
    "_031E":meta(Sex.FEMALE,0, 6),
    "_032E":meta(Sex.FEMALE,0, 6,HealthInsurancePopulation.WITH),
    "_033E":meta(Sex.FEMALE,0, 6,HealthInsurancePopulation.WITHOUT),
    "_034E":meta(Sex.FEMALE,6, 18),
    "_035E":meta(Sex.FEMALE,6, 18,HealthInsurancePopulation.WITH),
    "_036E":meta(Sex.FEMALE,6, 18,HealthInsurancePopulation.WITHOUT),
    "_037E":meta(Sex.FEMALE,19, 25),
    "_038E":meta(Sex.FEMALE,19, 25,HealthInsurancePopulation.WITH),
    "_039E":meta(Sex.FEMALE,19, 25,HealthInsurancePopulation.WITHOUT),
    "_040E":meta(Sex.FEMALE,26, 34),
    "_041E":meta(Sex.FEMALE,26, 34,HealthInsurancePopulation.WITH),
    "_042E":meta(Sex.FEMALE,26, 34,HealthInsurancePopulation.WITHOUT),
    "_043E":meta(Sex.FEMALE,35, 44),
    "_044E":meta(Sex.FEMALE,35, 44,HealthInsurancePopulation.WITH),
    "_045E":meta(Sex.FEMALE,35, 44,HealthInsurancePopulation.WITHOUT),
    "_046E":meta(Sex.FEMALE,45, 54),
    "_047E":meta(Sex.FEMALE,45, 54,HealthInsurancePopulation.WITH),
    "_048E":meta(Sex.FEMALE,45, 54,HealthInsurancePopulation.WITHOUT),
    "_049E":meta(Sex.FEMALE,55, 64),
    "_050E":meta(Sex.FEMALE,55, 64,HealthInsurancePopulation.WITH),
    "_051E":meta(Sex.FEMALE,55, 64,HealthInsurancePopulation.WITHOUT),
    "_052E":meta(Sex.FEMALE,65, 74),
    "_053E":meta(Sex.FEMALE,65, 74,HealthInsurancePopulation.WITH),
    "_054E":meta(Sex.FEMALE,65, 74,HealthInsurancePopulation.WITHOUT),
    "_055E":meta(Sex.FEMALE,65, None),
    "_056E":meta(Sex.FEMALE,65, None,HealthInsurancePopulation.WITH),
    "_057E":meta(Sex.FEMALE,65, None,HealthInsurancePopulation.WITHOUT),
}

def format_params(prefixes, suffixes, isCounty = False):
    groups = []
    for prefix in prefixes:
        for suffix in suffixes:
            groups.append(prefix+suffix)
    vars = ','.join(groups)

    return {'for':'county' if isCounty else 'state',"get": vars}

def log_response(resp):
    print("-"*50)
    print(f'Get Request ({resp.status_code}): {resp.url}')
    print("-"*50)


class AcsHealhInsuranceIngestor:

    def __init__(self, base):
        self.baseUrl = base
        self.data = {}
        self.metadata = {}
        self.buildMetadataList()

    def getFilename(self, sex, race, isCounty):
        if(race is not None):
            return "HEALTH_INSURANCE_BY_RACE_{0}_{1}.json".format("STATE" if isCounty else "COUNTY", race)
        else:
            return "HEALTH_INSURANCE_BY_SEX_{0}_{1}.json".format("STATE" if isCounty else "COUNTY", sex)

    def write_local_files_debug(self):
        self.getStateFipsMap()
        self.getCountyFipsMap()
        self.getHealthInsuranceDataBySex()
        self.getHealthInsuranceDataByRace()
        self.splitDataFrames()

        with open('total_health_insurance.json', 'w') as f:
            print(json.dumps({str(k):v for k, v in self.data.items()}, indent = 4), file=f)

        self.stateRaceFrame.to_csv('table_health_insurance_by_race_state.csv')
        self.stateSexFrame.to_csv('table_health_insurance_by_sex_state.csv')
        self.countyRaceFrame.to_csv('table_health_insurance_by_race_county.csv')
        self.countySexFrame.to_csv('table_health_insurance_by_sex_county.csv')

    def upload_to_gcs(self, bucket):
        maleStateParams = format_params(HEALTH_INSURANCE_BY_SEX_GROUPS_PREFIX, HEALTH_INSURANCE_BY_SEX_MALE_SUFFIXES)
        url_file_to_gcs.url_file_to_gcs(
                self.baseUrl, maleStateParams, bucket,
                self.getFilename(Sex.MALE, None, False))

        femaleStateParams= format_params(HEALTH_INSURANCE_BY_SEX_GROUPS_PREFIX, HEALTH_INSURANCE_BY_SEX_FEMALE_SUFFIXES)
        url_file_to_gcs.url_file_to_gcs(
                self.baseUrl, femaleStateParams, bucket,
                self.getFilename(Sex.FEMALE, None, False))


        maleCountyParams = format_params(HEALTH_INSURANCE_BY_SEX_GROUPS_PREFIX, HEALTH_INSURANCE_BY_SEX_MALE_SUFFIXES, True)
        url_file_to_gcs.url_file_to_gcs(
                self.baseUrl, maleCountyParams, bucket,
                self.getFilename(Sex.MALE, None, True))
        
        femaleCountyParams = format_params(HEALTH_INSURANCE_BY_SEX_GROUPS_PREFIX, HEALTH_INSURANCE_BY_SEX_FEMALE_SUFFIXES, True)
        url_file_to_gcs.url_file_to_gcs(
                self.baseUrl, femaleCountyParams, bucket,
                self.getFilename(Sex.FEMALE, None, True))
       
        for prefix in HEALTH_INSURANCE_BY_RACE_GROUP_PREFIXES:
            for prefixKey in prefix:
                raceStateParams = format_params(prefix, HEALTH_INSURANCE_BY_RACE_GROUP_SUFFIXES)
                race = prefix[prefixKey][MetadataKey.RACE]
                url_file_to_gcs.url_file_to_gcs(
                    self.baseUrl, raceStateParams, bucket,
                    self.getFilename(None, race, False))
                raceCountyParams = format_params(prefix, HEALTH_INSURANCE_BY_RACE_GROUP_SUFFIXES, True)
                url_file_to_gcs.url_file_to_gcs(
                    self.baseUrl, raceCountyParams, bucket,
                    self.getFilename(None, race, True))


    def buildMetadataList(self):
        for racePrefix in HEALTH_INSURANCE_BY_RACE_GROUP_PREFIXES:
            for prefix in racePrefix:
                for suffix in HEALTH_INSURANCE_BY_RACE_GROUP_SUFFIXES:
                    key = prefix+suffix
                    print(f'Building merged metadata for {key}: {racePrefix[prefix]} + {HEALTH_INSURANCE_BY_RACE_GROUP_SUFFIXES[suffix]}')
                    prefixMeta = racePrefix[prefix].copy()
                    prefixMeta.update(HEALTH_INSURANCE_BY_RACE_GROUP_SUFFIXES[suffix])
                    self.metadata[key] = prefixMeta

        for sex_prefix in HEALTH_INSURANCE_BY_SEX_GROUPS_PREFIX:
            for male_suffix in HEALTH_INSURANCE_BY_SEX_MALE_SUFFIXES:
                key = sex_prefix + male_suffix
                print(f'Building merged metadata for {key}: {HEALTH_INSURANCE_BY_SEX_GROUPS_PREFIX[sex_prefix]} + {HEALTH_INSURANCE_BY_SEX_MALE_SUFFIXES[male_suffix]}')
                meta = HEALTH_INSURANCE_BY_SEX_GROUPS_PREFIX[sex_prefix].copy();
                meta.update(HEALTH_INSURANCE_BY_SEX_MALE_SUFFIXES[male_suffix])
                self.metadata[key] = meta

            for female_suffix in HEALTH_INSURANCE_BY_SEX_FEMALE_SUFFIXES:
                key = sex_prefix + female_suffix
                print(f'Building merged metadata for {key}: {HEALTH_INSURANCE_BY_SEX_GROUPS_PREFIX[sex_prefix]} + {HEALTH_INSURANCE_BY_SEX_FEMALE_SUFFIXES[female_suffix]}')
                meta = HEALTH_INSURANCE_BY_SEX_GROUPS_PREFIX[sex_prefix].copy();
                meta.update(HEALTH_INSURANCE_BY_SEX_FEMALE_SUFFIXES[female_suffix])
                self.metadata[key] = meta
    

    def getStateFipsMap(self):
        params = {'for':'state',"get":"NAME"}
        resp = requests.get(self.baseUrl, params=params)
        log_response(resp)
        jResp = resp.json()
        stateFips = {}
        for row in jResp[1::]:
            fipCode = row[1]
            stateName = row[0]
            stateFips[fipCode] = stateName

        self.stateFips = stateFips

    def getCountyFipsMap(self):
        params = {'for':'county',"get":"NAME"}
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
    
    def getAcsDataFromVariables(self, params):
        resp = requests.get(self.baseUrl, params=params)
        log_response(resp)
        return resp.json()

    def getHealthInsuranceDataByRace(self):
        for prefix in HEALTH_INSURANCE_BY_RACE_GROUP_PREFIXES:
            stateData = self.getAcsDataFromVariables(format_params(prefix, HEALTH_INSURANCE_BY_RACE_GROUP_SUFFIXES))
            self.accumulateAcsData(stateData, prefix, HEALTH_INSURANCE_BY_RACE_GROUP_SUFFIXES)
            countySexData = self.getAcsDataFromVariables(format_params(prefix, HEALTH_INSURANCE_BY_RACE_GROUP_SUFFIXES, True))
            self.accumulateAcsData(countySexData, prefix, HEALTH_INSURANCE_BY_RACE_GROUP_SUFFIXES)
 

    def getHealthInsuranceDataBySex(self):
        maleStateData = self.getAcsDataFromVariables(format_params(HEALTH_INSURANCE_BY_SEX_GROUPS_PREFIX, HEALTH_INSURANCE_BY_SEX_MALE_SUFFIXES))
        femaleStateData = self.getAcsDataFromVariables(format_params(HEALTH_INSURANCE_BY_SEX_GROUPS_PREFIX, HEALTH_INSURANCE_BY_SEX_FEMALE_SUFFIXES))

        self.accumulateAcsData(maleStateData, HEALTH_INSURANCE_BY_SEX_GROUPS_PREFIX, HEALTH_INSURANCE_BY_SEX_MALE_SUFFIXES)
        self.accumulateAcsData(femaleStateData, HEALTH_INSURANCE_BY_SEX_GROUPS_PREFIX, HEALTH_INSURANCE_BY_SEX_FEMALE_SUFFIXES)

        maleCountyData = self.getAcsDataFromVariables(format_params(HEALTH_INSURANCE_BY_SEX_GROUPS_PREFIX, HEALTH_INSURANCE_BY_SEX_MALE_SUFFIXES, True))
        femaleCountyData = self.getAcsDataFromVariables(format_params(HEALTH_INSURANCE_BY_SEX_GROUPS_PREFIX, HEALTH_INSURANCE_BY_SEX_FEMALE_SUFFIXES, True))

        self.accumulateAcsData(maleCountyData, HEALTH_INSURANCE_BY_SEX_GROUPS_PREFIX, HEALTH_INSURANCE_BY_SEX_MALE_SUFFIXES)
        self.accumulateAcsData(femaleCountyData, HEALTH_INSURANCE_BY_SEX_GROUPS_PREFIX, HEALTH_INSURANCE_BY_SEX_FEMALE_SUFFIXES)

    def accumulateAcsData(self, data, prefixes, suffixes):
        keyRow = data[0]
        for row in data[1::]:
            data = {}
            for key in keyRow:
                if(key != 'state' and key != 'county'):
                    data[key] = {}
            stateFip = None
            countyFip = None
            for col in row:
                key = keyRow[colIndex]
                if(key == 'state'):
                    stateFip = col; 
                elif key == 'county':
                    countyFip = col
                else:
                    data[key] = {'value': col, 'meta': self.metadata[key]}

                colIndex += 1
            print("-"*50)
            print(f'Analyzing Data [State: {stateFip} County: {countyFip}]')
            for var in data:
                # print(f'Key: {var}, Data: {data[var]}')
                metadata = data[var]['meta']
                value = data[var]['value']
                row = self.upsertRow(stateFip, countyFip, metadata.get(MetadataKey.AGE), metadata.get(MetadataKey.SEX), metadata.get(MetadataKey.RACE))
                row[metadata[MetadataKey.POPULATION]] = value
            

    def upsertRow(self, stateFip, countyFip, age, sex, race):
        if self.data.get((stateFip, countyFip, age, sex, race)) is None:
            self.data[(stateFip, countyFip, age, sex, race)] = {HealthInsurancePopulation.TOTAL : -1, HealthInsurancePopulation.WITH: -1, HealthInsurancePopulation.WITHOUT: -1}
        return self.data[(stateFip, countyFip, age, sex, race)]
     
    def splitDataFrames(self):
        stateSexData = []
        stateRaceData = []
        countyRaceData = []
        countySexData = []

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
            if countyFip is None:
                #State-Sex
                if race is None:
                    stateSexData.append([stateFip, self.stateFips[stateFip], age, sex, whi, wohi, total])
                #State-Race
                else: 
                    stateRaceData.append([stateFip, self.stateFips[stateFip], age, race, whi, wohi, total])
            else:

                #County-Sex
                if race is None:
                    countySexData.append([stateFip, self.stateFips[stateFip], countyFip, self.countyFips[(stateFip, countyFip)], age, sex, whi, wohi, total])

                #County-Race
                else:
                    countyRaceData.append([stateFip, self.stateFips[stateFip], countyFip, self.countyFips[(stateFip, countyFip)], age, race, whi, wohi, total])

        self.stateSexFrame = pd.DataFrame(stateSexData, columns = ['state_fips', 'state_name', 'age', 'sex', 'with_health_insurance', 'without_health_insurance', 'total'])
        self.stateRaceFrame = pd.DataFrame(stateRaceData, columns = ['state_fips', 'state_name', 'age', 'race', 'with_health_insurance', 'without_health_insurance', 'total'])
        self.countySexFrame = pd.DataFrame(countySexData, columns = ['state_fips', 'state_name', 'county_fips', 'county_names','age', 'sex', 'with_health_insurance', 'without_health_insurance', 'total'])
        self.countyRaceFrame = pd.DataFrame(countyRaceData, columns = ['state_fips', 'state_name', 'county_fips', 'county_names','age', 'race', 'with_health_insurance', 'without_health_insurance', 'total'])

class ACSHEalthInsurance(DataSource):

    def get_id():
        """Returns the data source's unique id. """
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

AcsHealhInsuranceIngestor(BASE_ACS_URL).upload_to_gcs('kalieki-dev-landing-bucket')
