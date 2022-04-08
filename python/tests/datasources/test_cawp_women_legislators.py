from unittest import mock
import os

import pandas as pd
from pandas._testing import assert_frame_equal

from datasources.cawp import (CAWPData,
                              CAWP_TOTALS_URL,
                              CAWP_LINE_ITEMS_FILE,
                              PROPUB_US_HOUSE_FILE,
                              PROPUB_US_SENATE_FILE,
                              get_women_only_race_group,
                              get_standard_code_from_cawp_phrase,
                              get_pct,
                              count_matching_rows,
                              remove_markup,
                              NATIONAL,
                              STATE,
                              POSITION_COL, RACE_COL)

from ingestion.standardized_columns import Race
import ingestion.standardized_columns as std_col


# test utility functions
def test_get_women_only_race_group():
    assert get_women_only_race_group(
        Race.HISP.value) == 'Hispanic Women and Latinas'
    assert get_women_only_race_group(
        Race.ASIAN_NH.value) == 'Asian Women (Non-Hispanic)'
    assert get_women_only_race_group(Race.ASIAN.value) == 'Asian Women'


def test_get_standard_code_from_cawp_phrase():
    assert get_standard_code_from_cawp_phrase("American Samoa - AS") == "AS"
    assert get_standard_code_from_cawp_phrase("American Samoa - AM") == "AS"
    assert get_standard_code_from_cawp_phrase("Anything At All - XX") == "XX"


def test_remove_markup():
    assert remove_markup(
        "<i>Test Remove Italics Markup</i>") == "Test Remove Italics Markup"
    assert remove_markup("Remove Asterisk*") == "Remove Asterisk"
    assert remove_markup("Double Star**") == "Double Star"
    assert remove_markup("<i>All the Above</i>**") == "All the Above"


def test_get_pct():
    assert get_pct(1, 3) == 33.3
    assert get_pct(3, 3) == 100.0
    assert get_pct(3, 0) == 0.0


def test_count_matching_rows():
    df_test = pd.DataFrame(
        {std_col.STATE_NAME_COL: ["Florida", "Florida", "Puerto Rico", "Puerto Rico", "Maine", "Maine"],
         RACE_COL: ["Black, White", "Black", "Black", "Black", "White", "Multiracial Alone"],
         POSITION_COL: ["U.S. Senator", "State Senator", "Territorial/D.C. Representative",
         "U.S. Delegate", "U.S. Representative", "U.S. Representative"]})

    assert count_matching_rows(
        df_test, "United States", NATIONAL, "Black") == 2
    assert count_matching_rows(
        df_test, "Florida", NATIONAL, "Black") == 1
    assert count_matching_rows(
        df_test, "Florida", NATIONAL, "All") == 1
    assert count_matching_rows(
        df_test, "United States", STATE, "All") == 2
    # include "Multiracial Alone" +  multiple races e.g. "White, Black"
    assert count_matching_rows(
        df_test, "United States", NATIONAL, "Multiracial Alone") == 2


# Map production URLs to mock CSVs
mock_file_map = {
    # state leg TOTALS by state (FULL FILE) mocking WEB CALL
    CAWP_TOTALS_URL: {
        "filename": 'cawp_test_input_totals.csv',  # FULL CSV FILE
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
    CAWP_LINE_ITEMS_FILE: {
        "filename": 'cawp_test_input_line_items.csv',  # FULL CSV FILE
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
    # for US SENATE mocking /data FOLDER
    PROPUB_US_SENATE_FILE: {
        "filename": 'test_input_propublica-us-senate.json',  # FULL FILE
        "data_types": {}
    },
    # for US HOUSE mocking /data FOLDER
    PROPUB_US_HOUSE_FILE: {
        "filename": 'test_input_propublica-us-house.json',  # FULL FILE
        "data_types": {}
    }
}

# Current working directory.
THIS_DIR = os.path.dirname(os.path.abspath(__file__))
TEST_DIR = os.path.join(THIS_DIR, os.pardir, "data", "cawp_women_legislators")

GOLDEN_DATA = {
    'race_and_ethnicity_state': os.path.join(TEST_DIR, 'cawp_test_output_race_and_ethnicity_state.json'),
    'race_and_ethnicity_national': os.path.join(TEST_DIR, 'cawp_test_output_race_and_ethnicity_national.json'),
}


def _get_test_csv_as_df(*args):

    # read in correct CSV (mocking the network call to the CAWP api or /data)
    filename_arg_index = 0
    if len(args) > 1:
        filename_arg_index = 1

    test_input_csv = mock_file_map[args[filename_arg_index]]["filename"]
    test_input_dtype = mock_file_map[args[filename_arg_index]]["data_types"]
    return pd.read_csv(os.path.join(TEST_DIR, test_input_csv),
                       dtype=test_input_dtype)


def _get_test_json_as_df(*args):
    # read in correct json (mocking the call to /data or API)
    filename_arg_index = 0
    if len(args) > 1:
        filename_arg_index = 1

    test_input_json = mock_file_map[args[filename_arg_index]]["filename"]
    test_input_dtype = mock_file_map[args[filename_arg_index]]["data_types"]

    return pd.read_json(os.path.join(TEST_DIR, test_input_json), dtype=test_input_dtype)


def _get_test_pop_data_as_df(*args):
    [mock_pop_dir, mock_pop_filename, mock_pop_dtype] = args
    return pd.read_json(os.path.join(TEST_DIR, mock_pop_dir, f'{mock_pop_filename}.json'), dtype=mock_pop_dtype)


@mock.patch('ingestion.gcs_to_bq_util.load_df_from_bigquery',
            side_effect=_get_test_pop_data_as_df)
@ mock.patch('ingestion.gcs_to_bq_util.load_json_as_df_from_data_dir',
             side_effect=_get_test_json_as_df)
@ mock.patch('ingestion.gcs_to_bq_util.load_csv_as_df_from_data_dir',
             side_effect=_get_test_csv_as_df)
@ mock.patch('ingestion.gcs_to_bq_util.load_csv_as_df_from_web',
             side_effect=_get_test_csv_as_df)
@ mock.patch('ingestion.gcs_to_bq_util.add_df_to_bq',
             return_value=None)
def testWriteToBq(mock_bq: mock.MagicMock,
                  mock_web_csv: mock.MagicMock,
                  mock_data_dir_csv: mock.MagicMock,
                  mock_data_dir_json: mock.MagicMock,
                  mock_pop_data: mock.MagicMock):

    cawp_data = CAWPData()

    # required by bigQuery
    kwargs = {'filename': 'test_file.csv',
              'metadata_table_id': 'test_metadata',
              'table_name': 'output_table'}

    cawp_data.write_to_bq('dataset', 'gcs_bucket', **kwargs)

    mock_bq.assert_called_once
    mock_web_csv.assert_called_once
    mock_data_dir_csv.assert_called_once
    mock_data_dir_json.assert_called_once
    mock_pop_data.assert_called_once

    expected_dtype = {
        'state_name': str,
        'state_fips': str,
        "women_state_leg_pct": float,
        "women_state_leg_pct_share": float,
        "women_us_congress_pct": float,
        "women_us_congress_pct_share": float,
        "population": object,
        "population_pct": float,
        'race_and_ethnicity': str,
        'race': str,
        'race_includes_hispanic': object,
        'race_category_id': str,
        'race_women': str
    }

    # read test OUTPUT file
    expected_df_state = pd.read_json(
        GOLDEN_DATA['race_and_ethnicity_state'], dtype=expected_dtype)

    expected_df_national = pd.read_json(
        GOLDEN_DATA['race_and_ethnicity_national'], dtype=expected_dtype)

    mock_df_state = mock_bq.call_args_list[0].args[0]
    mock_df_national = mock_bq.call_args_list[1].args[0]

    # save STATE results to file
    mock_df_state.to_json(
        "cawp-run-results-state.json", orient="records")

    # save NATIONAL results to file
    mock_df_national.to_json(
        "cawp-run-results-national.json", orient="records")

    # print("mock state results")
    # print(mock_df_state.to_string())

    # print("expected state output file")
    # print(expected_df_state.to_string())

    # print("mock national call results")
    # print(mock_df_national.to_string())

    # print("expected national output file")
    # print(expected_df_national.to_string())

    # output created in mocked load_csv_as_df_from_web() should be the same as the expected df
    assert set(mock_df_state) == set(
        expected_df_state.columns)
    assert_frame_equal(
        mock_df_state, expected_df_state, check_like=True)

    assert set(mock_df_national) == set(
        expected_df_national.columns)
    assert_frame_equal(
        mock_df_national, expected_df_national, check_like=True)
