from unittest import mock
import os

import pandas as pd
from pandas._testing import assert_frame_equal

from test_utils import get_state_fips_codes_as_df
from datasources.cdc_restricted import CDCRestrictedData

# Current working directory.
THIS_DIR = os.path.dirname(os.path.abspath(__file__))
TEST_DIR = os.path.join(THIS_DIR, os.pardir, "data", "cdc_restricted")

GOLDEN_DATA_BY_SEX_STATE = os.path.join(
    TEST_DIR, 'golden_data', 'by_state_sex.json')

GOLDEN_DATA_BY_SEX_COUNTY = os.path.join(
    TEST_DIR, 'golden_data', 'by_sex_county.json')


def get_population_by_sex_state_as_df():
    return pd.read_csv(os.path.join(TEST_DIR, 'population_by_sex_state.csv'), dtype={
        'state_fips': str,
    })


def get_population_by_sex_county_as_df():
    return pd.read_csv(os.path.join(TEST_DIR, 'population_by_sex_county.csv'), dtype={
        'state_fips': str,
        'county_fips': str,
    })


def get_population_by_sex_territory_as_df():
    return pd.read_csv(os.path.join(TEST_DIR, 'population_2010_sex.csv'), dtype={
        'state_fips': str,
    })


def get_cdc_restricted_by_sex_state_as_df():
    return pd.read_csv(os.path.join(TEST_DIR, 'cdc_restricted_by_sex_state.csv'), dtype={
        'state_fips': str,
    })


def get_cdc_restricted_by_sex_county_as_df():
    return pd.read_csv(os.path.join(TEST_DIR, 'cdc_restricted_by_sex_county.csv'), dtype={
        'state_fips': str,
        'county_fips': str,
    })


@mock.patch('ingestion.gcs_to_bq_util.load_df_from_bigquery')
@mock.patch('ingestion.gcs_to_bq_util.load_public_dataset_from_bigquery_as_df',
            return_value=get_state_fips_codes_as_df())
def testGenerateBreakdownSexState(mock_fips: mock.MagicMock, mock_pop: mock.MagicMock):
    mock_pop.side_effect = [
        get_population_by_sex_state_as_df(),
        get_population_by_sex_territory_as_df(),
    ]
    cdc_restricted = CDCRestrictedData()

    df = cdc_restricted.generate_breakdown(get_cdc_restricted_by_sex_state_as_df(), 'sex', 'state')
    expected_df = pd.read_json(GOLDEN_DATA_BY_SEX_STATE, dtype={
        'state_fips': str,
    })
    assert_frame_equal(df, expected_df, check_like=True)


@mock.patch('ingestion.gcs_to_bq_util.load_df_from_bigquery',
            return_value=get_population_by_sex_county_as_df())
@mock.patch('ingestion.gcs_to_bq_util.load_public_dataset_from_bigquery_as_df',
            return_value=get_state_fips_codes_as_df())
def testGenerateBreakdownSexCounty(mock_fips: mock.MagicMock, mock_pop: mock.MagicMock):
    cdc_restricted = CDCRestrictedData()

    df = cdc_restricted.generate_breakdown(get_cdc_restricted_by_sex_county_as_df(), 'sex', 'county')
    expected_df = pd.read_json(GOLDEN_DATA_BY_SEX_COUNTY, dtype={
        'state_fips': str,
        'county_fips': str,
    })
    assert_frame_equal(df, expected_df, check_like=True)
