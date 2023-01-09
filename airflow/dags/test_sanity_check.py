import os
import pandas as pd
import pytest
import re
import sanity_check

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
    assert sanity_check.check_pct_values(df)


def testGenerateCountyDatasetSexTime():
    df = pd.read_json(CDC_RESTRICTED['sex_county_time'], dtype=test_dtype)
    assert sanity_check.check_pct_values(df)


def testGenerateNationalDatasetSex():
    df = pd.read_json(CDC_RESTRICTED['sex_national'], dtype={
                      'state_fips': str})
    assert sanity_check.check_pct_values(df)


def testGenerateStateDatasetSex():
    df = pd.read_json(CDC_RESTRICTED['sex_state'], dtype={'state_fips': str})
    assert sanity_check.check_pct_values(df)


def testGenerateCountyDatasetSexError():
    expected_error = re.escape(
        'These fips percent share values do not equal 100%')

    df = pd.read_json(CDC_RESTRICTED['sex_county'], dtype=test_dtype)

    with pytest.raises(RuntimeError, match=expected_error):
        sanity_check.check_pct_values(df)
