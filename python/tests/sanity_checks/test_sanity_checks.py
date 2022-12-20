import os
import pandas as pd
from pandas._testing import assert_frame_equal
from sanity_checks.sanity_checks import check_pct_values


THIS_DIR = os.path.dirname(os.path.abspath(__file__))
TEST_DIR = os.path.join(THIS_DIR, os.pardir, "data", "sanity_checks")

CDC_DATA_RESTRICTED_SEX_TIME = os.path.join(
    TEST_DIR, 'cdc_restricted_sex_time.json')


def get_cdc_restricted_by_sex_county_as_df():
    return pd.read_json(
        os.path.join(TEST_DIR, 'cdc_restricted_sex_county.json'), dtype={'state_fips': str})


def get_cdc_restricted_by_sex_county_time_as_df():
    return pd.read_json(
        os.path.join(TEST_DIR, 'cdc_restricted_sex_county_time.json'), dtype={'state_fips': str})


def get_cdc_restricted_by_sex_state_as_df():
    return pd.read_json(
        os.path.join(TEST_DIR, 'cdc_restricted_sex_state.json'), dtype={'state_fips': str})


def get_cdc_restricted_by_sex_national_as_df():
    return pd.read_json(
        os.path.join(TEST_DIR, 'cdc_restricted_sex_national.json'), dtype={'state_fips': str})


def get_cdc_restricted_by_age_as_df():
    return pd.read_json(
        os.path.join(TEST_DIR, 'cdc_restricted_age_county.json'), dtype={'state_fips': str})


def testGenerateVerifyPercentShareBySexCountyFix():
    df = get_cdc_restricted_by_sex_county_as_df()
    result = check_pct_values(df)
    pass


def testGenerateVerifyPercentShareBySexCountyTimeFix():
    df = get_cdc_restricted_by_sex_county_time_as_df()
    result = check_pct_values(df)
    pass


def testGenerateVerifyPercentShareByAgeStateFix():
    df = get_cdc_restricted_by_sex_state_as_df()
    result = check_pct_values(df)
    pass


def testGenerateVerifyPercentShareBySexNationalFix():
    df = get_cdc_restricted_by_sex_national_as_df()
    result = check_pct_values(df)
    pass


def testGenerateVerifyPercentShareByAgeCountyFix():
    df = get_cdc_restricted_by_age_as_df()
    result = check_pct_values(df)
    pass
