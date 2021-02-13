import requests
import sys
import json 
from datasources.data_source import DataSource

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

def meta(sex, min_age, max_age, hi_status = HealthInsurancePopulation.TOTAL):
    return {"sex": sex, "age": {"min": min_age, "max": max_age}, "population": hi_status}

HEALTH_INSURANCE_BY_RACE_GROUP_PREFIXES = [
    {"C27001A":{"race": Race.WHITE_ALONE}},
    {"C27001B":{"race": Race.BLACK_OR_AFRICAN_AMERICAN_ALONE}},
    {"C27001C":{"race": Race.AMERICAN_INDIAN_AND_ALASKA_NATIVE_ALONE}},
    {"C27001D":{"race": Race.ASIAN_ALONE}},
    {"C27001E":{"race": Race.NATIVE_HAWAIIAN_AND_OTHER_PACIFIC_ISLANDER_ALONE}},
    {"C27001F":{"race": Race.SOME_OTHER_RACE_ALONE}},
    {"C27001G":{"race": Race.TWO_OR_MORE_RACES}},
    {"C27001H":{"race": Race.WHITE_ALONE_NOT_HISPANIC_OR_LATINO}},
    {"C27001I":{"race": Race.HISPANIC_OR_LATINO}},
]

HEALTH_INSURANCE_BY_RACE_GROUP_SUFFIXES= {
    "_002E":meta(None,None, 19),
    "_003E":meta(None,None, 19,HealthInsurancePopulation.WITH),
    "_004E":meta(None,None, 19,HealthInsurancePopulation.WITHOUT),
    "_005E":meta(None,19, 64),
    "_006E":meta(None,19, 64,HealthInsurancePopulation.WITH),
    "_007E":meta(None,19, 64,HealthInsurancePopulation.WITHOUT),
    "_008E":meta(None,65, None),
    "_009E":meta(None,65, None,HealthInsurancePopulation.WITH),
    "_010E":meta(None,65, None,HealthInsurancePopulation.WITHOUT),
}

HEALTH_INSURANCE_BY_SEX_GROUPS_PREFIX = {"B27001":{}}


HEALTH_INSURANCE_BY_SEX_MALE_SUFFIXES = {
    "_003E":meta(Sex.MALE,None, 6),
    "_004E":meta(Sex.MALE,None, 6,HealthInsurancePopulation.WITH),
    "_005E":meta(Sex.MALE,None, 6,HealthInsurancePopulation.WITHOUT),
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
    "_031E":meta(Sex.FEMALE,None, 6),
    "_032E":meta(Sex.FEMALE,None, 6,HealthInsurancePopulation.WITH),
    "_033E":meta(Sex.FEMALE,None, 6,HealthInsurancePopulation.WITHOUT),
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

def format_params(prefixes, suffixes):
    groups = []
    for prefix in prefixes:
        for suffix in suffixes:
            groups.append(prefix+suffix)
    return ','.join(groups)

def log_response(resp):
    print("-"*50)
    print(f'Get Request ({resp.status_code}): {resp.url}')
    print("Content")
    print(resp.content)
    print("-"*50)

def getMetadata(key, prefixList, suffixList):
    parts = key.split("_")
    suffixKey = "_" + parts[1]
    prefixKey = parts[0]
    metadata = {}
    suffixMetadata = suffixList.get(suffixKey).copy()
    prefixMetadata = prefixList.get(prefixKey).copy()
    print(f'Merging metadata: {prefixKey}:{prefixMetadata} with "{suffixKey}:{suffixMetadata}')
    metadata.update(prefixMetadata)
    metadata.update(suffixMetadata)
    print(f'Result metadata: {metadata}')
    return metadata


    



class AcsHealthInsuranceStateIngestor:

    def __init__(self, base):
        self.baseUrl = base
        self.stateDataBySex = {}
        self.stateDataByRace = {}

        self.getStateFipsMap()
        self.getHealthInsuranceDataBySex()
        self.getHealthInsuranceDataByRace()

    def write_local_files_debug(self):
        with open('health_insurance_by_sex_state.json', 'w') as f:
            print(json.dumps(self.stateDataBySex, indent = 4), file=f)

        with open('health_insurance_by_race_state.json', 'w') as f:
            print(json.dumps(self.stateDataByRace, indent = 4), file=f)

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
            self.stateDataByRace[fipCode] = {}
            self.stateDataBySex[fipCode] = {}

        self.stateFips = stateFips

    
    def getAcsDataFromVariables(self, params):
        params = {'for':'state',"get": params}
        resp = requests.get(self.baseUrl, params=params)
        log_response(resp)
        return resp.json()

    def getHealthInsuranceDataByRace(self):
        for prefix in HEALTH_INSURANCE_BY_RACE_GROUP_PREFIXES:
            data = self.getAcsDataFromVariables(format_params(prefix, HEALTH_INSURANCE_BY_RACE_GROUP_SUFFIXES))
            self.accumulateAcsData(data, prefix, HEALTH_INSURANCE_BY_RACE_GROUP_SUFFIXES, self.stateDataByRace)
 

    def getHealthInsuranceDataBySex(self):
        maleData = self.getAcsDataFromVariables(format_params(HEALTH_INSURANCE_BY_SEX_GROUPS_PREFIX, HEALTH_INSURANCE_BY_SEX_MALE_SUFFIXES))
        femaleData = self.getAcsDataFromVariables(format_params(HEALTH_INSURANCE_BY_SEX_GROUPS_PREFIX, HEALTH_INSURANCE_BY_SEX_FEMALE_SUFFIXES))

        self.accumulateAcsData(maleData, HEALTH_INSURANCE_BY_SEX_GROUPS_PREFIX, HEALTH_INSURANCE_BY_SEX_MALE_SUFFIXES, self.stateDataBySex)
        self.accumulateAcsData(femaleData, HEALTH_INSURANCE_BY_SEX_GROUPS_PREFIX, HEALTH_INSURANCE_BY_SEX_FEMALE_SUFFIXES, self.stateDataBySex)

    def accumulateAcsData(self, data, prefixes, suffixes, target):
        keyRow = data[0]
        for row in data[1::]:
            colIndex = 0
            data = {}
            for key in keyRow:
                if(key != 'state'):
                    data[key] = {}
            stateFip = ''
            for col in row:
                key = keyRow[colIndex]
                if(key == 'state'):
                    stateFip = col; 
                else:
                    data[key]['key'] = key
                    data[key]['value'] = col
                    data[key]['metadata'] = getMetadata(key, prefixes, suffixes)
                colIndex += 1
            target[stateFip].update(data)

    

class AcsCountInsuranceCountyIngestor:

    def __init__(self, baseUrl):
        self.baseUrl = baseUrl

    def write_local_files_debug(self):
        pass


#class ACSHealthInsurance(DataSource):

    # @staticmethod 
    # def get_table_name():
    #     # Writes multiple tables, so this is not applicable.
    #     pass

    # @staticmethod
    # def get_id():
    #     """Returns the data source's unique id. """
    #     return 'ACS_HEALTH_INSURANCE'

    # def upload_to_gcs(self, gcs_bucket, **attrs):
    #     file_diff = False
    #     for ingester in self._create_ingesters():
    #         next_file_diff = ingester.upload_to_gcs(gcs_bucket)
    #         file_diff = file_diff or next_file_diff
    #     return file_diff

    # def write_to_bq(self, dataset, gcs_bucket, **attrs):
    #     for ingester in self._create_ingesters():
    #         ingester.write_to_bq(dataset, gcs_bucket)

    # def _create_ingesters(self):
    #     return [
    #         AcsHealthInsuranceStateIngestor(False, BASE_ACS_URL),
    #         AcsCountInsuranceCountyIngestor(True, BASE_ACS_URL)
    #     ]


AcsHealthInsuranceStateIngestor(BASE_ACS_URL).write_local_files_debug()
#AcsCountInsuranceCountyIngestor(BASE_ACS_URL).write_local_files_debug()
