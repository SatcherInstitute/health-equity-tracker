import os
import pandas as pd
import json
from unittest import TestCase, mock
from sanity_checks.sanity_check import check_pct_values

# Current working directory
THIS_DIR = os.path.dirname(os.path.abspath(__file__))
TEST_DIR = os.path.join(THIS_DIR, os.pardir, "data", "sanity_checks")

CDC_RESTRICTED = {
    'age_county': os.path.join(TEST_DIR, 'cdc_restricted_age_county.json'),
    'sex_county_time': os.path.join(TEST_DIR, 'cdc_restricted_sex_county_time.json'),
    'sex_county': os.path.join(TEST_DIR, 'cdc_restricted_sex_county.json'),
    'sex_national': os.path.join(TEST_DIR, 'cdc_restricted_sex_national.json'),
    'sex_state': os.path.join(TEST_DIR, 'cdc_restricted_sex_state.json')
}

test_dtype = {
    'county_fips': str,
    'state_fips': str,
}


def get_age_county_as_json():
    with open(CDC_RESTRICTED['age_county']) as f:
        return json.load(f)


@mock.patch('ingestion.gcs_to_bq_util.load_df_from_bigquery',
            return_value=get_age_county_as_json())
def testGenerateTest(mock_bq: mock.MagicMock):
    expected_df = pd.read_json(CDC_RESTRICTED['sex_county'], dtype=test_dtype)
    result = check_pct_values(expected_df)
    return result


# def testGenerateCountyDatasetAge(mock_bq: mock.MagicMock):
#     expected_df = pd.read_json(CDC_RESTRICTED, dtype={
#         'state_fips': str,
#         'covid_cases_share': float,
#         'covid_hosp_share': float,
#         'covid_deaths_share': float,
#     })
#     print(expected_df)
#     pass
# class SanityCheck(TestCase):
#     "Test the county by age dataset"
#     def testGenerateCountyDatasetAge(self):
#         with open(CDC_RESTRICTED['age_county'], 'r') as data_file:
#             data = json.loads(data_file.read())
#         df = pd.json_normalize(data)
#         result = check_pct_values(df)
#         return result
#     pass
# def testGenerateCountyDatasetAge():
#     with open(CDC_RESTRICTED['age_county'], 'r') as data_file:
#         data = json.loads(data_file.read())
#     df = pd.json_normalize(data)
#     result = check_pct_values(df)
#     print(get_age_county_as_json())
#     return result
# def testGenerateCountyDatasetSexTime():
#     df = pd.read_json(CDC_RESTRICTED['sex_county_time'], dtype={
#                       'county_fips': str, 'state_fips': str})
#     result = check_pct_values(df)
#     return result
# def testGenerateCountyDatasetSex():
#     df = pd.read_json(CDC_RESTRICTED['sex_county'], dtype={
#                       'county_fips': str, 'state_fips': str})
#     result = check_pct_values(df)
#     return result
# def testGenerateNationalDatasetSex():
#     df = pd.read_json(CDC_RESTRICTED['sex_national'], dtype={
#                       'state_fips': str})
#     result = check_pct_values(df)
#     return result
# def testGenerateStateDatasetSex():
#     df = pd.read_json(CDC_RESTRICTED['sex_state'], dtype={'state_fips': str})
#     result = check_pct_values(df)
#     return result
