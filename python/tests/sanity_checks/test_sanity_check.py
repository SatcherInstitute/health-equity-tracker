import os
import pandas as pd
from sanity_checks.sanity_check import check_pct_values, main
from airflow.utils.dates import days_ago
from airflow import DAG
from airflow.models import Variable


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


def testGenerateCountyDatasetAge():
    df = pd.read_json(CDC_RESTRICTED['age_county'], dtype=test_dtype)
    result = check_pct_values(df)
    return result


def testGenerateCountyDatasetSexTime():
    df = pd.read_json(CDC_RESTRICTED['sex_county_time'], dtype=test_dtype)
    result = check_pct_values(df)
    return result


def testGenerateCountyDatasetSex():
    df = pd.read_json(CDC_RESTRICTED['sex_county'], dtype=test_dtype)
    result = check_pct_values(df)
    return result


def testGenerateNationalDatasetSex():
    df = pd.read_json(CDC_RESTRICTED['sex_national'], dtype={
                      'state_fips': str})
    result = check_pct_values(df)
    return result


def testGenerateStateDatasetSex():
    df = pd.read_json(CDC_RESTRICTED['sex_state'], dtype={'state_fips': str})
    result = check_pct_values(df)
    return result
