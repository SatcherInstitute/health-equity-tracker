from unittest import mock
import os

import pandas as pd
from pandas._testing import assert_frame_equal

from datasources.cawp import CAWPData

# Current working directory.
THIS_DIR = os.path.dirname(os.path.abspath(__file__))
TEST_DIR = os.path.join(THIS_DIR, os.pardir, "data", "cawp_women_legislators")

GOLDEN_DATA = {
    'race_and_ethnicity': os.path.join(TEST_DIR, 'cawp_test_output_race_and_ethnicity.json'),
}


def get_test_data_as_df():
    return pd.read_csv(os.path.join(TEST_DIR, 'cawp_test_input.csv'),
                       dtype={"level": str,
                              "state": str,
                              "race_ethnicity": str,
                              })


@mock.patch('ingestion.gcs_to_bq_util.load_csv_as_dataframe_from_web',
            return_value=get_test_data_as_df())
@mock.patch('ingestion.gcs_to_bq_util.add_dataframe_to_bq',
            return_value=None)
def testWriteToBq(mock_bq: mock.MagicMock, mock_csv: mock.MagicMock):

    cawp_data = CAWPData()

    # pretend arguments required by bigQuery
    kwargs = {'filename': 'test_file.csv',
              'metadata_table_id': 'test_metadata',
              'table_name': 'output_table'}

    cawp_data.write_to_bq('dataset', 'gcs_bucket', **kwargs)

    assert mock_bq.call_count == 1

    expected_dtype = {
        'state_name': str,
        "diabetes_per_100k": float,
        'race_and_ethnicity': str,
        'race': str,
        'race_includes_hispanic': object,
        'race_category_id': str
    }

    # read in the test output file as a dataframe with expected columns/types
    expected_df = pd.read_json(
        GOLDEN_DATA['race_and_ethnicity'], dtype=expected_dtype)

    # output created in mocked load_csv_as_dataframe_from_web() should be the same as the expected df
    assert_frame_equal(
        mock_bq.call_args_list[0].args[0], expected_df, check_like=True)
