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


@mock.patch('ingestion.gcs_to_bq_util.load_csv_as_df_from_web',
            return_value=get_pop_estimates_as_df())
@mock.patch('ingestion.gcs_to_bq_util.add_df_to_bq',
            return_value=None)
def testWriteToBq(mock_bq: mock.MagicMock, mock_csv: mock.MagicMock):
    censusPopEstimates = CensusPopEstimates()

    kwargs = {'filename': 'test_file.csv',
              'metadata_table_id': 'test_metadata',
              'table_name': 'output_table'}

    censusPopEstimates.write_to_bq('dataset', 'gcs_bucket', **kwargs)
    assert mock_bq.call_count == 2
    assert mock_csv.call_count == 1

    expected_df = pd.read_csv(STATE_POP_DATA_CDC, dtype={
        'state_fips': str,
    })

    assert_frame_equal(
        mock_bq.call_args_list[0].args[0], expected_df, check_like=True)


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
