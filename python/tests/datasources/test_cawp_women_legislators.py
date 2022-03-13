from unittest import mock
import os

import pandas as pd
from pandas._testing import assert_frame_equal

from datasources.cawp import CAWPData, CAWP_TOTALS_URL, CAWP_LINE_ITEMS_URL

# Map production URLs to mock CSVs
mock_file_map = {
    # for state leg TOTALS by state
    CAWP_TOTALS_URL: {
        "filename": 'cawp_test_input_totals.csv',
        "data_types": {
            "id": str,
            "year": str,
            "first_name": str,
            "middle_name": str,
            "last_name": str,
            "party": str,
            "level": str,
            "position": str,
            "state": str,
            "district": str,
            "race_ethnicity": str
        }
    },
    # for line level CSV
    CAWP_LINE_ITEMS_URL: {
        "filename": 'cawp_test_input_line_items.csv',
        "data_types": {"level": str,
                       "state": str,
                       "race_ethnicity": str,
                       }
    }
}

# Current working directory.
THIS_DIR = os.path.dirname(os.path.abspath(__file__))
TEST_DIR = os.path.join(THIS_DIR, os.pardir, "data", "cawp_women_legislators")

GOLDEN_DATA = {
    'race_and_ethnicity': os.path.join(TEST_DIR, 'cawp_test_output_race_and_ethnicity.json'),
}


def get_test_data_as_df(*args):

    # read in correct CSV (mocking the network call to the CAWP api)
    test_input_csv = mock_file_map[args[0]]["filename"]
    test_input_dtype = mock_file_map[args[0]]["data_types"]
    return pd.read_csv(os.path.join(TEST_DIR, test_input_csv),
                       dtype=test_input_dtype
                       )


@ mock.patch('ingestion.gcs_to_bq_util.load_csv_as_dataframe_from_web',
             side_effect=get_test_data_as_df)
@ mock.patch('ingestion.gcs_to_bq_util.add_dataframe_to_bq',
             return_value=None)
def testWriteToBq(mock_bq: mock.MagicMock, mock_csv: mock.MagicMock):

    cawp_data = CAWPData()

    # required by bigQuery
    kwargs = {'filename': 'test_file.csv',
              'metadata_table_id': 'test_metadata',
              'table_name': 'output_table'}

    cawp_data.write_to_bq('dataset', 'gcs_bucket', **kwargs)

    assert mock_csv.call_count == 2
    mock_bq.assert_called_once

    expected_dtype = {
        'state_name': str,
        "pct_women_state_leg": float,
        'race_and_ethnicity': str,
        'race': str,
        'race_includes_hispanic': object,
        'race_category_id': str
    }

    # read test OUTPUT file
    expected_df = pd.read_json(
        GOLDEN_DATA['race_and_ethnicity'], dtype=expected_dtype)

    print("mock call results")
    print(mock_bq.call_args_list[0].args[0].to_string())

    print("expected output file")
    print(expected_df.to_string())

    # output created in mocked load_csv_as_dataframe_from_web() should be the same as the expected df
    assert_frame_equal(
        mock_bq.call_args_list[0].args[0], expected_df, check_like=True)
