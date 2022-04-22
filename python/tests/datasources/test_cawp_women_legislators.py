import json
from unittest import mock
import os
import pandas as pd
from pandas._testing import assert_frame_equal
import ingestion.standardized_columns as std_col
from datasources.cawp import (CAWPData,
                              get_standard_code_from_cawp_phrase,
                              get_pct,
                              count_matching_rows,
                              remove_markup,
                              NATIONAL,
                              STATE,
                              POSTAL_COL,
                              POSITION_COL,
                              RACE_COL)


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
        {POSTAL_COL: ["FL", "FL", "PR", "PR", "ME", "ME"],
         RACE_COL: ["Black, White", "Black", "Black", "Black", "White", "Multiracial Alone"],
         POSITION_COL: ["U.S. Senator", "State Senator", "Territorial/D.C. Representative",
         "U.S. Delegate", "U.S. Representative", "U.S. Representative"]})

    assert count_matching_rows(
        df_test, "US", NATIONAL, "Black") == 2
    assert count_matching_rows(
        df_test, "FL", NATIONAL, "Black") == 1
    assert count_matching_rows(
        df_test, "FL", NATIONAL, "All") == 1
    assert count_matching_rows(
        df_test, "US", STATE, "All") == 2
    assert count_matching_rows(
        df_test, "US", NATIONAL, "Multiracial Alone") == 2


# Current working directory.
THIS_DIR = os.path.dirname(os.path.abspath(__file__))
TEST_DIR = os.path.join(THIS_DIR, os.pardir, "data", "cawp_women_legislators")

GOLDEN_DATA = {
    'race_and_ethnicity_state': os.path.join(TEST_DIR, 'cawp_test_output_race_and_ethnicity_state.json'),
    'race_and_ethnicity_national': os.path.join(TEST_DIR, 'cawp_test_output_race_and_ethnicity_national.json'),
}


def _get_test_line_items_csv_as_df(*args):

    [_folder, filename] = args
    test_input_data_types = {
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

    test_input_filename = f'test_input_{filename}'
    return pd.read_csv(os.path.join(TEST_DIR, test_input_filename),
                       dtype=test_input_data_types)


def _get_test_totals_csv_as_df(*args):

    filename = "test_input_cawp_totals.csv"
    test_input_data_types = {
        "State": str,
        "State Rank": object,
        "Senate": str,
        "Total Women/Total Senate": str,
        "House": str,
        "Total Women/Total House": str,
        "Total Women/Total Legislators": str,
        "%Women Overall": str
    }
    return pd.read_csv(os.path.join(TEST_DIR, filename),
                       dtype=test_input_data_types)


def _get_test_json_as_df_based_on_key_list(*args):

    [_mock_data_folder, mock_data_filename, mock_data_keys_list] = args
    test_json_filename = os.path.join(
        TEST_DIR, f'test_input_{mock_data_filename}')
    with open(test_json_filename) as data_file:
        data = json.load(data_file)
    df = pd.json_normalize(data, mock_data_keys_list)
    return df


def _get_test_pop_data_as_df(*args):
    [mock_pop_dir, mock_pop_filename, mock_pop_dtype] = args
    mock_pop_df = pd.read_json(os.path.join(
        TEST_DIR, mock_pop_dir, f'{mock_pop_filename}.json'), dtype=mock_pop_dtype)
    return mock_pop_df


def _get_test_state_names(*args, **kwargs):
    return pd.DataFrame(
        {
            std_col.STATE_NAME_COL: ["American Samoa", "Alaska", "Nebraska"],
            'state_postal_abbreviation': ["AS", "AK", "NE"],
            'state_fips_code': ["60", "02", "31"]
        })


@ mock.patch('ingestion.gcs_to_bq_util.load_public_dataset_from_bigquery_as_df',
             side_effect=_get_test_state_names)
@ mock.patch('ingestion.gcs_to_bq_util.load_json_as_df_from_data_dir_based_on_key_list',
             side_effect=_get_test_json_as_df_based_on_key_list)
@ mock.patch('ingestion.gcs_to_bq_util.load_df_from_bigquery',
             side_effect=_get_test_pop_data_as_df)
@ mock.patch('ingestion.gcs_to_bq_util.load_csv_as_df_from_data_dir',
             side_effect=_get_test_line_items_csv_as_df)
@ mock.patch('ingestion.gcs_to_bq_util.load_csv_as_df_from_web',
             side_effect=_get_test_totals_csv_as_df)
@ mock.patch('ingestion.gcs_to_bq_util.add_df_to_bq',
             return_value=None)
def testWriteToBq(mock_bq: mock.MagicMock,
                  mock_web_csv: mock.MagicMock,
                  mock_data_dir_csv: mock.MagicMock,
                  mock_pop_data: mock.MagicMock,
                  mock_data_dir_based_on_key_list_data: mock.MagicMock,
                  mock_bq_state_names: mock.MagicMock):

    cawp_data = CAWPData()

    # required by bigQuery
    kwargs = {'filename': 'test_file.csv',
              'metadata_table_id': 'test_metadata',
              'table_name': 'output_table'}

    cawp_data.write_to_bq('dataset', 'gcs_bucket', **kwargs)

    mock_bq.assert_called_once
    mock_web_csv.assert_called_once
    mock_data_dir_csv.assert_called_once
    mock_pop_data.assert_called_once
    mock_data_dir_based_on_key_list_data.assert_called_once
    mock_bq_state_names.assert_called_once

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

    # output created in mocked load_csv_as_df_from_web() should be the same as the expected df
    assert set(mock_df_state) == set(
        expected_df_state.columns)
    assert_frame_equal(
        mock_df_state, expected_df_state, check_like=True)

    assert set(mock_df_national) == set(
        expected_df_national.columns)
    assert_frame_equal(
        mock_df_national, expected_df_national, check_like=True)
