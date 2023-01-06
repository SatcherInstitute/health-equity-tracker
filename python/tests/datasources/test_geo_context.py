import math
from unittest import mock
import os
import pytest
import pandas as pd
from pandas._testing import assert_frame_equal

from datasources.geo_context import GeoContext, format_svi


# UNIT TESTS

def test_format_svi():
    # normal number between 0-1
    assert format_svi(0.4354) == .44
    # special case of -999
    assert math.isnan(format_svi(-999.0))
    # otherwise should error
    with pytest.raises(ValueError):
        format_svi(12345)
        format_svi(None)


# Current working directory.
THIS_DIR = os.path.dirname(os.path.abspath(__file__))
TEST_DIR = os.path.join(THIS_DIR, os.pardir, "data", "geo_context")
REAL_SVI_DIR = os.path.abspath('data/cdc_svi_county')

GOLDEN_DATA_NATIONAL = os.path.join(
    TEST_DIR, 'test_output_geo_context_national.csv')
GOLDEN_DATA_STATE = os.path.join(
    TEST_DIR, 'test_output_geo_context_state.csv')
GOLDEN_DATA_COUNTY = os.path.join(
    TEST_DIR, 'test_output_geo_context_county.csv')


def _get_svi_as_df():
    return pd.read_csv(os.path.join(TEST_DIR, 'cdc_svi_county_test.csv'), dtype={"FIPS": str})


# def _get_full_svi_as_df():
#     return pd.read_csv(os.path.join(REAL_SVI_DIR, 'cdc_svi_county_totals.csv'), dtype={"FIPS": str})


def get_county_names():
    return pd.read_csv(os.path.join(TEST_DIR, 'county_names.csv'), dtype={"county_fips_code": str})


def _generate_breakdown(*args):
    print("mocking generate_breakdown()")
    return pd.DataFrame({
        "fake_col1": [0, 1, 2],
        "fake_col2": ["a", "b", "c"]
    })


def _load_df_from_bigquery_national():
    print("mocking load_df_from_bigquery() for national population")
    return pd.read_csv(os.path.join(
        TEST_DIR, 'mock_population_tables', 'by_age_national.csv'), dtype={"state_fips": str})


def _load_df_from_bigquery_state(*args):

    _requested_dataset_name, requested_table_name = args

    if requested_table_name == "by_age_state":
        print("mocking load_df_from_bigquery() for state populations")
        return pd.read_csv(os.path.join(
            TEST_DIR, 'mock_population_tables', 'by_age_state.csv'), dtype={"state_fips": str})

    if requested_table_name == "by_age_territory":
        print("mocking load_df_from_bigquery() for territory populations")
        return pd.read_csv(os.path.join(
            TEST_DIR, 'mock_population_tables', 'by_age_territory.csv'), dtype={"state_fips": str})


def _load_df_from_bigquery_county():
    print("mocking load_df_from_bigquery() for county populations")
    return pd.read_csv(os.path.join(
        TEST_DIR, 'mock_population_tables', 'by_age_county.csv'), dtype={"county_fips": str})


# TESTS

@ mock.patch('datasources.geo_context.GeoContext.generate_breakdown',
             side_effect=_generate_breakdown)
@mock.patch('ingestion.gcs_to_bq_util.add_df_to_bq', return_value=None)
def testWriteToBq(
    mock_bq: mock.MagicMock,
    mock_generate_breakdown: mock.MagicMock
):
    """ Ensures the correct structure and arguments were
    generated to be written to BigQuery """
    print("testWriteToBq()")

    geoContext = GeoContext()
    kwargs = {'filename': 'test_file.csv',
              'metadata_table_id': 'test_metadata',
              'table_name': 'output_table'}
    geoContext.write_to_bq('dataset', 'gcs_bucket', **kwargs)

    assert mock_generate_breakdown.call_count == 3
    assert mock_bq.call_count == 3

    national_call, state_call, county_call = mock_bq.call_args_list

    assert national_call[1]["column_types"] == state_call[1]["column_types"] == {
        'fake_col1': 'STRING',
        'fake_col2': 'STRING',
        'population': 'FLOAT',
    }
    assert county_call[1]["column_types"] == {
        'fake_col1': 'STRING',
        'fake_col2': 'STRING',
        'svi': 'FLOAT',
        'population': 'FLOAT',
    }


@ mock.patch('ingestion.gcs_to_bq_util.load_df_from_bigquery',
             return_value=_load_df_from_bigquery_national())
def testGenerateNationalBreakdown(
    mock_pop: mock.MagicMock
):
    """ Tests the generation of national breakdown  """
    print("testGenerateNationalBreakdown()")

    geoContext = GeoContext()
    national_df = geoContext.generate_breakdown("national")

    assert mock_pop.call_count == 1

    expected_national_df = pd.read_csv(GOLDEN_DATA_NATIONAL, dtype={
        'state_fips': str,
    })
    assert_frame_equal(
        national_df, expected_national_df, check_like=True)


@ mock.patch('ingestion.gcs_to_bq_util.load_df_from_bigquery',
             side_effect=_load_df_from_bigquery_state)
def testGenerateStateLevelBreakdown(
    mock_pop: mock.MagicMock
):
    """ Tests the generation of state and territory breakdown  """
    print("testGenerateStateLevelBreakdown()")

    geoContext = GeoContext()
    state_level_df = geoContext.generate_breakdown("state")
    expected_state_level_df = pd.read_csv(GOLDEN_DATA_STATE, dtype={
        'state_fips': str,
    })

    assert mock_pop.call_count == 2

    assert_frame_equal(
        state_level_df, expected_state_level_df, check_like=True)


@ mock.patch('ingestion.gcs_to_bq_util.load_df_from_bigquery',
             return_value=_load_df_from_bigquery_county())
@mock.patch('ingestion.gcs_to_bq_util.load_csv_as_df_from_data_dir', return_value=_get_svi_as_df())
def testGenerateCountyBreakdown(
    mock_svi_data: mock.MagicMock,
    mock_pop: mock.MagicMock
):
    """ Tests the generation of county breakdown  """
    print("testGenerateCountyBreakdown()")

    geoContext = GeoContext()
    county_df = geoContext.generate_breakdown("county")

    assert mock_svi_data.call_count == 1
    assert mock_pop.call_count == 1

    expected_county_df = pd.read_csv(
        GOLDEN_DATA_COUNTY, dtype={'county_fips': str})
    assert_frame_equal(
        county_df, expected_county_df, check_like=True)
