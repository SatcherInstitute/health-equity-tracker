import json
from unittest import mock
import os
import pandas as pd
from pandas._testing import assert_frame_equal
import ingestion.standardized_columns as std_col
from datasources.bjs import (BJSData)


# INTEGRATION TEST SETUP

# Current working directory.
THIS_DIR = os.path.dirname(os.path.abspath(__file__))
TEST_DIR = os.path.join(THIS_DIR, os.pardir, "data", "bjs_corrections")

GOLDEN_DATA = {
    'race_and_ethnicity_national': os.path.join(TEST_DIR, 'bjs_test_output_race_and_ethnicity_national.json'),
}


def _get_test_data_as_df(*args):
    [filename] = args
    test_input_data_types = {
        "state": str,
        "race_ethnicity": str
    }

    test_input_filename = f'bjs_test_input_{filename}'
    return pd.read_csv(os.path.join(TEST_DIR, test_input_filename),
                       dtype=test_input_data_types)


# RUN INTEGRATION TESTS ON NATIONAL LEVEL
@mock.patch('ingestion.gcs_to_bq_util.load_csv_as_df_from_web',
            side_effect=_get_test_data_as_df)
@ mock.patch('ingestion.gcs_to_bq_util.add_df_to_bq',
             return_value=None)
def testWriteNationalLevelToBq(mock_bq: mock.MagicMock, mock_csv: mock.MagicMock):

    bjs_data = BJSData()

    # required by bigQuery
    kwargs = {'filename': 'test_file.csv',
              'metadata_table_id': 'test_metadata',
              'table_name': 'output_table'}

    bjs_data.write_to_bq('dataset', 'gcs_bucket', **kwargs)

    mock_bq.assert_called_once
    mock_csv.assert_called_once

    expected_dtype = {
        'state_name': str,
        'state_fips': str,
        "prison_per_100k": float,
        "prison_pct_share": float,
        "population": object,
        "population_pct": float,
        'race_and_ethnicity': str,
        'race': str,
        'race_includes_hispanic': object,
        'race_category_id': str,
    }

    # read test OUTPUT file
    expected_df_national = pd.read_json(
        GOLDEN_DATA['race_and_ethnicity_national'], dtype=expected_dtype)

    print(mock_bq.call_args_list)

    args, kwargs = mock_bq.call_args_list

    print(args, kwargs)

    # # save NATIONAL results to file
    # mock_df_national.to_json(
    #     "bjs-run-results-national.json", orient="records")

    # # output created in mocked load_csv_as_df_from_web() should be the same as the expected df
    # assert set(mock_df_national) == set(
    #     expected_df_national.columns)
    # assert_frame_equal(
    #     mock_df_national, expected_df_national, check_like=True)
