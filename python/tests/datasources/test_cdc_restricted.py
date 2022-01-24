from unittest import mock
import os

import pandas as pd
from pandas._testing import assert_frame_equal

from datasources.cdc_restricted import CDCRestrictedData

# Current working directory.
THIS_DIR = os.path.dirname(os.path.abspath(__file__))
TEST_DIR = os.path.join(THIS_DIR, os.pardir, "data", "cdc_restricted")

GOLDEN_DATA = os.path.join(TEST_DIR, 'cdc_restricted-by_race_state-with_age_adjust.json')


def get_census_pop_estimates_as_df():
    return pd.read_csv(os.path.join(TEST_DIR, 'census_pop_estimates.csv'), dtype={'state_fips': str})


def get_cdc_restricted_by_race_age_state_as_df():
    return pd.read_json(os.path.join(TEST_DIR, 'cdc_restricted_race_age_state.json'), dtype={'state_fips': str})


def get_cdc_restricted_by_race_state_as_df():
    return pd.read_json(os.path.join(TEST_DIR, 'cdc_restricted_race_state.json'), dtype={'state_fips': str})


@mock.patch('ingestion.gcs_to_bq_util.load_csv_as_dataframe')
@mock.patch('ingestion.gcs_to_bq_util.load_dataframe_from_bigquery',
            return_value=get_census_pop_estimates_as_df())
@mock.patch('ingestion.gcs_to_bq_util.add_dataframe_to_bq',
            return_value=None)
def testWriteToBq(mock_bq: mock.MagicMock, mock_df: mock.MagicMock, mock_csv: mock.MagicMock):
    mock_csv.side_effect = [
        get_cdc_restricted_by_race_age_state_as_df(),
        get_cdc_restricted_by_race_state_as_df(),
        get_cdc_restricted_by_race_state_as_df(),
    ]

    cdcRestricted = CDCRestrictedData()

    filenames = (
        'cdc_restricted_by_race_state.csv,'
        'cdc_restricted_by_race_and_age_state.csv'
    )

    kwargs = {'filename': filenames,
              'metadata_table_id': 'test_metadata',
              'table_name': 'output_table'}

    cdcRestricted.write_to_bq('dataset', 'gcs_bucket', **kwargs)
    assert mock_bq.call_count == 2

    expected_df = pd.read_json(GOLDEN_DATA, dtype={
        'state_fips': str,
    })
    assert_frame_equal(mock_bq.call_args_list[0].args[0], expected_df, check_like=True)
