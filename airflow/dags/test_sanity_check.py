import os
import pandas as pd
from sanity_check import check_pct_values

TEST_DIR = os.path.join(os.getcwd(), 'python', 'tests',
                        'data', 'sanity_checks')

CDC_RESTRICTED = {'age_county': os.path.join(TEST_DIR, 'cdc_restricted_age_county.json'),
                  'sex_county_time': os.path.join(TEST_DIR, 'cdc_restricted_sex_county_time.json'),
                  'sex_county': os.path.join(TEST_DIR, 'cdc_restricted_sex_county.json'),
                  'sex_national': os.path.join(TEST_DIR, 'cdc_restricted_sex_national.json'),
                  'sex_state': os.path.join(TEST_DIR, 'cdc_restricted_sex_state.json'), }


test_dtype = {'county_fips': str,
              'state_fips': str, }


def testGenerateCountyDatasetAge():
    df = pd.read_json(CDC_RESTRICTED['age_county'], dtype=test_dtype)
    assert check_pct_values(df, 'by_cdc_restricted_age_county')


def testGenerateCountyDatasetSexTime():
    df = pd.read_json(CDC_RESTRICTED['sex_county_time'], dtype=test_dtype)
    assert check_pct_values(df, 'by_cdc_restricted_sex_county_time')


def testGenerateNationalDatasetSex():
    df = pd.read_json(CDC_RESTRICTED['sex_national'], dtype={
                      'state_fips': str})
    assert check_pct_values(df, 'by_cdc_restricted_sex_national')


def testGenerateStateDatasetSex():
    df = pd.read_json(CDC_RESTRICTED['sex_state'], dtype={'state_fips': str})
    assert check_pct_values(df, 'by_cdc_restricted_sex_state')


def testGenerateCountyDatasetSexError():
    df = pd.read_json(CDC_RESTRICTED['sex_county'], dtype=test_dtype)

    output = check_pct_values(df, 'cdc_restricted_sex_county')
    expected_output = [
        False, {'table': 'cdc_restricted_sex_county', 'fips': ['06123']}]
    assert output == expected_output
