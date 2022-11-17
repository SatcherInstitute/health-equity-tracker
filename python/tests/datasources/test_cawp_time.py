
from unittest import mock
from datasources.cawp_time import (
    CAWPTimeData, US_CONGRESS_HISTORICAL_URL, US_CONGRESS_CURRENT_URL)
import os
import pandas as pd
import json
from test_utils import get_state_fips_codes_as_df


print("\n\n...\n\n")

# INTEGRATION TEST SETUP

# Current working directory.
THIS_DIR = os.path.dirname(os.path.abspath(__file__))
TEST_DIR = os.path.join(THIS_DIR, os.pardir, "data", "cawp_women_legislators")


def _fetch_json_from_web(*args):
    [url] = args

    if url == US_CONGRESS_HISTORICAL_URL:
        file_name = "test_legislators-historical.json"

    elif url == US_CONGRESS_CURRENT_URL:
        file_name = "test_legislators-current.json"

    print(f'reading mock US CONGRESS: {file_name}')

    with open(os.path.join(TEST_DIR, file_name)) as file:
        return json.load(file)


def _get_test_line_items_csv_as_df(*args):
    print("reading mock CAWP line items")
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


# RUN INTEGRATION TESTS ON STATE_LEVEL/TERRITORY LEVEL

@ mock.patch('ingestion.gcs_to_bq_util.load_csv_as_df_from_data_dir',
             side_effect=_get_test_line_items_csv_as_df)
@ mock.patch('ingestion.gcs_to_bq_util.load_public_dataset_from_bigquery_as_df',
             return_value=get_state_fips_codes_as_df())
@ mock.patch('ingestion.gcs_to_bq_util.fetch_json_from_web',
             side_effect=_fetch_json_from_web)
@ mock.patch('ingestion.gcs_to_bq_util.add_df_to_bq',
             return_value=None)
def testWriteToBq(
    mock_bq: mock.MagicMock,
    mock_web_json: mock.MagicMock,
    mock_fips: mock.MagicMock,
    mock_data_dir_csv: mock.MagicMock,
):

    cawp_data = CAWPTimeData()

    # required by bigQuery
    kwargs = {'filename': 'test_file.csv',
              'metadata_table_id': 'test_metadata',
              'table_name': 'output_table'}

    cawp_data.write_to_bq('dataset', 'gcs_bucket', **kwargs)
    mock_df_state = mock_bq.call_args_list[0].args[0]

    for arg in mock_bq.call_args_list:
        arg[0][0].to_json(
            f'frontend/public/tmp/cawp_data-{arg[0][2]}.json', orient="records")

    # print("state df sent to BQ")
    # print(mock_df_state.to_string())
    # print(mock_df_state)
