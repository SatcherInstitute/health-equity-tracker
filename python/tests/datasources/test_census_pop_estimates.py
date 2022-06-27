from unittest import mock
import os

import pandas as pd
from pandas._testing import assert_frame_equal

from datasources.census_pop_estimates import CensusPopEstimates
from datasources.census_pop_estimates import generate_national_pop_data
import ingestion.standardized_columns as std_col

# Current working directory.
THIS_DIR = os.path.dirname(os.path.abspath(__file__))
TEST_DIR = os.path.join(THIS_DIR, os.pardir, "data", "census_pop_estimates")

STATE_POP_DATA_CDC = os.path.join(
    TEST_DIR, 'census_pop_estimates-race_ethnicity_age_state.csv')
NATIONAL_POP_DATA_CDC = os.path.join(
    TEST_DIR, 'census_pop_estimates-race_ethnicity_age_national.csv')

STATE_POP_DATA_BJS = os.path.join(
    TEST_DIR, 'census_pop_estimates_bjs-race_ethnicity_age_state.csv')
NATIONAL_POP_DATA_BJS = os.path.join(
    TEST_DIR, 'census_pop_estimates_bjs-race_ethnicity_age_national.csv')


def get_pop_estimates_as_df():
    return pd.read_csv(os.path.join(TEST_DIR, 'census_pop_estimates.csv'), dtype={
        'STATE': str,
        'STNAME': str,
    })


def testGenerateCdcNationalPopData():
    state_df = pd.read_csv(STATE_POP_DATA_CDC, dtype={
        'state_fips': str,
    })

    national_df = pd.read_csv(NATIONAL_POP_DATA_CDC, dtype={
        'state_fips': str,
    })

    states_to_include = state_df[std_col.STATE_FIPS_COL].drop_duplicates(
    ).to_list()
    df = generate_national_pop_data(state_df, states_to_include)

    assert_frame_equal(df, national_df, check_like=True)


def testGenerateBjsNationalPopData():
    state_df = pd.read_csv(STATE_POP_DATA_BJS, dtype={
        'state_fips': str,
    })

    expected_national_bjs_df = pd.read_csv(NATIONAL_POP_DATA_BJS, dtype={
        'state_fips': str,
    })

    states_to_include = state_df[std_col.STATE_FIPS_COL].drop_duplicates(
    ).to_list()
    df = generate_national_pop_data(state_df, states_to_include)

    assert_frame_equal(df, expected_national_bjs_df, check_like=True)
