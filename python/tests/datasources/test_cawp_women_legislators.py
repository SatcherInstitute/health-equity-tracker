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
                              get_pretty_pct,
                              count_matching_rows,
                              #   set_pop_metrics_by_race_in_state,
                              remove_markup)

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


def test_get_pretty_pct():
    assert get_pretty_pct(1, 3) == "33.33"
    assert get_pretty_pct(3, 3) == "100"
    assert get_pretty_pct(12345, 100_000) == "12.35"
    assert get_pretty_pct(3, 0) == "0"


def test_count_matching_rows():
    df_test = pd.DataFrame(
        {std_col.STATE_NAME_COL: ["Florida", "Florida", "Puerto Rico", "Puerto Rico", "Maine", "Maine"],
         'race_ethnicity': ["Black, White", "Black", "Black", "Black", "White", "Multiracial Alone"],
         'level': ["Congress", "State Legislative", "Territorial/D.C.", "U.S. Delegate", "Congress", "Congress"]})

    assert count_matching_rows(
        df_test, "United States", "federal", "Black") == 2
    assert count_matching_rows(
        df_test, "Florida", "federal", "Black") == 1
    assert count_matching_rows(
        df_test, "Florida", "federal", "All") == 1
    assert count_matching_rows(
        df_test, "United States", "state", "All") == 2
    # include "Multiracial Alone"
    # and multiple specific races "White, Black"
    assert count_matching_rows(
        df_test, "United States", "federal", "Multiracial Alone") == 2


# def test_set_pop_metrics_by_race_in_state():
#     test_row = {"test key": "test value"}
#     df_pop_test = pd.DataFrame(
#         {
#             std_col.STATE_NAME_COL: ["Florida", "Florida", "Florida", "Maine", "Maine", "Maine"],
#             std_col.RACE_CATEGORY_ID_COL: [Race.BLACK_NH.value,
#                                            Race.WHITE_NH,
#                                            "TOTAL",
#                                            Race.BLACK_NH.value,
#                                            Race.WHITE_NH,
#                                            "TOTAL"],
#             std_col.POPULATION_COL: [200, 300, 500, 10, 30, 40],
#             std_col.POPULATION_PCT_COL: [40, 60, 100, 25, 75, 100]
#         })

    # # test a valid place/race
    # assert set_pop_metrics_by_race_in_state(
    #     test_row,
    #     df_pop_test,
    #     Race.BLACK_NH.value,
    #     "Florida") == {'test key': 'test value',
    #                    'population': 200,
    #                    'population_pct': 40.0}
    # # test valid place / invalid race
    # assert set_pop_metrics_by_race_in_state(
    #     test_row,
    #     df_pop_test,
    #     Race.ASIAN_NH.value,
    #     "Florida") == {'test key': 'test value',
    #                    'population': None,
    #                    'population_pct': None}
    # # test invalid place / valid race
    # assert set_pop_metrics_by_race_in_state(
    #     test_row,
    #     df_pop_test,
    #     Race.WHITE_NH.value,
    #     "Virginia") == {'test key': 'test value',
    #                     'population': None,
    #                     'population_pct': None}
    # # test valid place total
    # assert set_pop_metrics_by_race_in_state(
    #     test_row,
    #     df_pop_test,
    #     "ALL",
    #     "Florida") == {'test key': 'test value',
    #                    'population': 500,
    #                    'population_pct': 100.0}


# Map production URLs to mock CSVs
mock_file_map = {
    # state leg TOTALS by state (FULL FILE) mocking WEB CALL
    CAWP_TOTALS_URL: {
        "filename": 'cawp_test_input_totals.csv',  # FULL CSV FILE
        # "filename": 'cawp_test_input_totals-SUBSET.csv',  # LIMITED SAMPLE CSV FILE
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
        # "filename": 'cawp_test_input_line_items-SUBSET.csv',  # LIMITED SAMPLE CSV FILE
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
    },
    # for ACS 2010 territories by race mocking /data FOLDER
    "by_race_and_ethnicity_territory": {
        "filename": 'by_race_and_ethnicity_territory.json',  # FULL FILE
        "data_types": {'state_fips': str}
    },

}

# Current working directory.
THIS_DIR = os.path.dirname(os.path.abspath(__file__))
TEST_DIR = os.path.join(THIS_DIR, os.pardir, "data", "cawp_women_legislators")

GOLDEN_DATA = {
    'race_and_ethnicity': os.path.join(TEST_DIR, 'cawp_test_output_race_and_ethnicity.json'),
}


def get_test_csv_as_df(*args):

    print("args")
    print(args)
    # read in correct CSV (mocking the network call to the CAWP api or /data)
    filename_arg_index = 0
    if len(args) > 1:
        filename_arg_index = 1

    test_input_csv = mock_file_map[args[filename_arg_index]]["filename"]
    test_input_dtype = mock_file_map[args[filename_arg_index]]["data_types"]
    return pd.read_csv(os.path.join(TEST_DIR, test_input_csv),
                       dtype=test_input_dtype)


def get_test_json_as_df(*args):
    # read in correct json (mocking the call to /data or API)
    filename_arg_index = 0
    if len(args) > 1:
        filename_arg_index = 1

    test_input_json = mock_file_map[args[filename_arg_index]]["filename"]
    test_input_dtype = mock_file_map[args[filename_arg_index]]["data_types"]

    return pd.read_json(os.path.join(TEST_DIR, test_input_json), dtype=test_input_dtype)


@ mock.patch('ingestion.gcs_to_bq_util.load_json_as_df_from_data_dir',
             side_effect=get_test_json_as_df)
@ mock.patch('ingestion.gcs_to_bq_util.load_csv_as_df_from_data_dir',
             side_effect=get_test_csv_as_df)
@ mock.patch('ingestion.gcs_to_bq_util.load_csv_as_df_from_web',
             side_effect=get_test_csv_as_df)
@ mock.patch('ingestion.gcs_to_bq_util.add_df_to_bq',
             return_value=None)
def testWriteToBq(mock_bq: mock.MagicMock,
                  mock_web_csv: mock.MagicMock,
                  mock_data_dir_csv: mock.MagicMock,
                  mock_data_json_csv: mock.MagicMock):

    cawp_data = CAWPData()

    # required by bigQuery
    kwargs = {'filename': 'test_file.csv',
              'metadata_table_id': 'test_metadata',
              'table_name': 'output_table'}

    cawp_data.write_to_bq('dataset', 'gcs_bucket', **kwargs)

    mock_bq.assert_called_once
    mock_web_csv.assert_called_once
    mock_data_dir_csv.assert_called_once
    mock_data_json_csv.assert_called_once

    expected_dtype = {
        'state_name': str,
        'state_fips': str,
        "women_state_leg_pct": str,
        "women_state_leg_pct_share": str,
        "women_us_congress_pct": str,
        "women_us_congress_pct_share": str,
        # "population": int,
        # "population_pct": float,
        'race_and_ethnicity': str,
        'race': str,
        'race_includes_hispanic': object,
        'race_category_id': str,
        'race_women': str
    }

    # read test OUTPUT file
    expected_df = pd.read_json(
        GOLDEN_DATA['race_and_ethnicity'], dtype=expected_dtype)

    # save results to file
    mock_bq.call_args_list[0].args[0].to_json(
        "cawp-run-results.json", orient="records")

    print("mock call results")
    print(mock_bq.call_args_list[0].args[0].dtypes)
    print(mock_bq.call_args_list[0].args[0].to_string())

    print("expected output file")
    print(expected_df.dtypes)
    print(expected_df.to_string())

    # output created in mocked load_csv_as_df_from_web() should be the same as the expected df
    assert set(mock_bq.call_args_list[0].args[0]) == set(expected_df.columns)
    assert_frame_equal(
        mock_bq.call_args_list[0].args[0], expected_df, check_like=True)
