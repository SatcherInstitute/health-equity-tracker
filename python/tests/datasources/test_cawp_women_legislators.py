from unittest import mock
import os

import pandas as pd
from pandas._testing import assert_frame_equal

from datasources.cawp import CAWPData, CAWP_TOTALS_URL, CAWP_LINE_ITEMS_PATH, clean, get_pretty_pct, swap_territory_abbr


# test my utility functions

def test_clean():
    assert clean(
        "<i>Test Remove Italics Markup</i>") == "Test Remove Italics Markup"
    assert clean("Remove Asterisk*") == "Remove Asterisk"
    assert clean("Double Star**") == "Double Star"
    assert clean("<i>All the Above</i>**") == "All the Above"


def test_swap_territory_abbr():
    assert swap_territory_abbr("MP") == "MI"
    assert swap_territory_abbr("AS") == "AM"
    assert swap_territory_abbr("ME") == "ME"


def test_get_pretty_pct():
    assert get_pretty_pct(1 / 3) == "33.33"
    assert get_pretty_pct(1) == "100"
    assert get_pretty_pct(0.12345678) == "12.35"


# Map production URLs to mock CSVs
mock_file_map = {
    # state leg TOTALS by state (FULL FILE) mocking WEB CALL
    CAWP_TOTALS_URL: {
        "filename": 'cawp_totals.csv',  # FULL CSV FILE
        # "filename": 'cawp_test_input_totals.csv',  # LIMITED SAMPLE CSV FILE
        "data_types": {
            "State": str,
            "State Rank": object,
            "Senate": str,
            "Total Women/Total Senate": str,
            "House": str,
            "Total Women/Total House": str,
            "Total Women/Total Legislators": str,
            "%Women Overall": str
        }
    },
    # for LINE LEVEL mocking /data FOLDER
    CAWP_LINE_ITEMS_PATH: {
        "filename": 'cawp_line_items.csv',  # FULL CSV FILE
        # "filename": 'cawp_test_input_line_items.csv',  # LIMITED SAMPLE CSV FILE
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
                       dtype=test_input_dtype)


@ mock.patch('ingestion.gcs_to_bq_util.load_csv_as_dataframe_from_path',
             side_effect=get_test_data_as_df)
@ mock.patch('ingestion.gcs_to_bq_util.load_csv_as_dataframe_from_web',
             side_effect=get_test_data_as_df)
@ mock.patch('ingestion.gcs_to_bq_util.add_dataframe_to_bq',
             return_value=None)
def testWriteToBq(mock_bq: mock.MagicMock, mock_web_csv: mock.MagicMock, mock_path_csv: mock.MagicMock):

    cawp_data = CAWPData()

    # required by bigQuery
    kwargs = {'filename': 'test_file.csv',
              'metadata_table_id': 'test_metadata',
              'table_name': 'output_table'}

    cawp_data.write_to_bq('dataset', 'gcs_bucket', **kwargs)

    mock_bq.assert_called_once
    mock_web_csv.assert_called_once
    mock_path_csv.assert_called_once

    expected_dtype = {
        'state_name': str,
        "women_state_leg_pct": str,
        'race_and_ethnicity': str,
        'race': str,
        'race_includes_hispanic': object,
        'race_category_id': str
    }

    # read test OUTPUT file
    expected_df = pd.read_json(
        GOLDEN_DATA['race_and_ethnicity'], dtype=expected_dtype)

    # save results to file
    # mock_bq.call_args_list[0].args[0].to_json(
    #     "cawp-run-results.json", orient="records")

    # print("mock call results")
    # print(mock_bq.call_args_list[0].args[0].to_string())

    # print("expected output file")
    # print(expected_df.to_string())

    # output created in mocked load_csv_as_dataframe_from_web() should be the same as the expected df
    assert set(mock_bq.call_args_list[0].args[0]) == set(expected_df.columns)
    assert_frame_equal(
        mock_bq.call_args_list[0].args[0], expected_df, check_like=True)
