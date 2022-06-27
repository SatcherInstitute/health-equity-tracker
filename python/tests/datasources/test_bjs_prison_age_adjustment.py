from unittest import mock
import os
import pandas as pd
from pandas._testing import assert_frame_equal
from datasources.age_adjust_bjs import AgeAdjustBjsIncarceration

# Current working directory.
THIS_DIR = os.path.dirname(os.path.abspath(__file__))
TEST_DIR = os.path.join(THIS_DIR, os.pardir, "data",
                        "bjs_prison_age_adjustment")

PRISON_DATA_SIMPLE = os.path.join(TEST_DIR, 'race_age_state_simple.json')

EXPECTED_PRISONERS_JSON = os.path.join(TEST_DIR, "expected_prisoners.json")
# AGE_ADJUST_JSON = os.path.join(TEST_DIR, "age_adjusted.json")

GOLDEN_INTEGRATION_DATA_NATIONAL = os.path.join(
    TEST_DIR, 'bjs-by_race_national-with_age_adjust.json')


def get_census_pop_estimates_as_df():
    return pd.read_csv(os.path.join(TEST_DIR, "census_pop_estimates.csv"), dtype={'state_fips': str})


def get_bjs_by_race_age_national_as_df():
    return pd.read_json(os.path.join(TEST_DIR, "bjs-race_age_national.json"), dtype={'state_fips': str})


# # "Unit" tests
def testExpectedPrisoners():
    incarceration_data = pd.read_json(
        PRISON_DATA_SIMPLE, dtype={'state_fips': str})
    pop_data = get_census_pop_estimates_as_df()

    df = AgeAdjustBjsIncarceration.get_expected_prisoners(
        incarceration_data, pop_data)
    expected_df = pd.read_json(
        EXPECTED_PRISONERS_JSON, dtype={'state_fips': str})

    assert_frame_equal(df, expected_df, check_like=True)


def testBjsAgeAdjust():
    expected_prisoners_df = pd.read_json(
        EXPECTED_PRISONERS_JSON, dtype={'state_fips': str})

    df = AgeAdjustBjsIncarceration.age_adjust_from_expected(
        expected_prisoners_df)
    expected_df = pd.read_json(
        GOLDEN_INTEGRATION_DATA_NATIONAL, dtype={'state_fips': str})

    assert_frame_equal(df, expected_df, check_like=True)


# Integration tests

@mock.patch('ingestion.gcs_to_bq_util.load_df_from_bigquery')
@mock.patch('ingestion.gcs_to_bq_util.add_df_to_bq',
            return_value=None)
def testWriteToBqNational(
    mock_bq: mock.MagicMock,
    mock_df: mock.MagicMock
):
    mock_df.side_effect = [
        get_bjs_by_race_age_national_as_df(),
        get_census_pop_estimates_as_df(),
    ]

    age_adjust = AgeAdjustBjsIncarceration()

    kwargs = {'filename': 'test_file.csv',
              'metadata_table_id': 'test_metadata',
              'table_name': 'output_table'}

    age_adjust.write_to_bq('dataset', 'gcs_bucket', **kwargs)
    assert mock_bq.call_count == 1

    expected_df = pd.read_json(GOLDEN_INTEGRATION_DATA_NATIONAL, dtype={
        'state_fips': str,
    })

    df = mock_bq.call_args_list[0].args[0]

    assert_frame_equal(
        df, expected_df, check_like=True)
