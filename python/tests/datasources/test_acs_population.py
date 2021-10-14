import os
import json

import pandas as pd

from unittest import mock
from pandas._testing import assert_frame_equal

from datasources.acs_population import ACSPopulationIngester
from ingestion import gcs_to_bq_util

# Current working directory.
THIS_DIR = os.path.dirname(os.path.abspath(__file__))
TEST_DIR = os.path.join(THIS_DIR, os.pardir, "data", "acs_population")

GOLDEN_DATA = os.path.join(TEST_DIR, 'table_by_race_state_std.csv')


def get_hispanic_or_latino_values_by_race_state_as_df():
    return gcs_to_bq_util.values_json_to_dataframe(
            os.path.join(TEST_DIR, 'HISPANIC_OR_LATINO_ORIGIN_BY_RACE_state.json')).reset_index(drop=True)


def get_acs_metadata_as_json():
    with open(os.path.join(TEST_DIR, 'metadata.json')) as f:
        return json.load(f)


@mock.patch('ingestion.census.fetch_acs_metadata',
            return_value=get_acs_metadata_as_json())
@mock.patch('ingestion.gcs_to_bq_util.load_values_as_dataframe',
            return_value=get_hispanic_or_latino_values_by_race_state_as_df())
@mock.patch('ingestion.gcs_to_bq_util.add_dataframe_to_bq',
            return_value=None)
def testWriteToBq(mock_bq: mock.MagicMock, mock_csv: mock.MagicMock, mock_json: mock.MagicMock):
    acsPopulationIngester = ACSPopulationIngester(False, "https://api.census.gov/data/2019/acs/acs5")

    acsPopulationIngester.write_to_bq('dataset', 'gcs_bucket')
    assert mock_bq.call_count == 1

    expected_df = pd.read_csv(GOLDEN_DATA, dtype={
        'state_fips': str,
    })
    print(mock_bq.call_args_list[0].args[0])
    print(expected_df)
    assert_frame_equal(mock_bq.call_args_list[0].args[0], expected_df, check_like=True)
