import os
import pandas as pd
import pytest
import re
import sys
sys.path.append(os.path.join(os.getcwd(), 'airflow'))
from dags.sanity_check import check_pct_values  # type: ignore

# Current working directory
THIS_DIR = os.path.dirname(os.path.abspath(__file__))
TEST_DIR = os.path.join(THIS_DIR, os.pardir, "data", "sanity_checks")
CDC_DIR = os.path.join(THIS_DIR, os.pardir, "data", "cdc_restricted")

CDC_RESTRICTED = {
    'age_county': os.path.join(TEST_DIR, 'cdc_restricted_age_county.json'),
    'sex_county_time': os.path.join(TEST_DIR, 'cdc_restricted_sex_county_time.json'),
    'sex_county': os.path.join(TEST_DIR, 'cdc_restricted_sex_county.json'),
    'sex_national': os.path.join(TEST_DIR, 'cdc_restricted_sex_national.json'),
    'sex_state': os.path.join(TEST_DIR, 'cdc_restricted_sex_state.json')
}

GOLDEN_DATA_BY_SEX_STATE_TIME_SERIES = os.path.join(
    CDC_DIR, 'golden_data', 'by_sex_state_time_series.json')

test_dtype = {
    'county_fips': str,
    'state_fips': str,
}


def testGenerateCountyDatasetAge():
    df = pd.read_json(CDC_RESTRICTED['age_county'], dtype=test_dtype)
    assert check_pct_values(df)


def testGenerateCountyDatasetSexTime():
    df = pd.read_json(CDC_RESTRICTED['sex_county_time'], dtype=test_dtype)
    assert check_pct_values(df)


def testGenerateCountyDatasetSex():
    df = pd.read_json(CDC_RESTRICTED['sex_county'], dtype=test_dtype)
    assert check_pct_values(df)


def testGenerateNationalDatasetSex():
    df = pd.read_json(CDC_RESTRICTED['sex_national'], dtype={
                      'state_fips': str})
    assert check_pct_values(df)


def testGenerateStateDatasetSex():
    df = pd.read_json(CDC_RESTRICTED['sex_state'], dtype={'state_fips': str})
    assert check_pct_values(df)


def testGeneratePctShareError():
    expected_error = re.escape(
        'These fips percent share values do not equal 100%')
    df = pd.read_json(GOLDEN_DATA_BY_SEX_STATE_TIME_SERIES,
                      dtype={'state_fips': str})

    with pytest.raises(RuntimeError, match=expected_error):
        check_pct_values(df)
