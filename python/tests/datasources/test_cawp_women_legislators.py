from unittest import mock
import os

import pandas as pd
from pandas._testing import assert_frame_equal

from datasources.cawp import CAWPData

# TABLE FOR STATE-LEVEL CONGRESSES
# table includes States/Territories as rows; rank, w senate, total senate, w house, total house, w house+senate / total house+senate, %overall
CAWP_TOTALS_URL = "QQQhttps://cawp.rutgers.edu/tablefield/export/paragraph/1028/field_table/und/0"
# table includes full breakdown of women by race, but doesn't include TOTAL legislature numbers
#  id,year,first_name,middle_name,last_name,party,level,position,state,district,race_ethnicity
CAWP_LINE_ITEMS_URL = "https://cawpdata.rutgers.edu/women-elected-officials/race-ethnicity/export-roles/csv?current=1&yearend_filter=All&level%5B0%5D=Federal%20Congress&level%5B1%5D=State%20Legislative&level%5B2%5D=Territorial/DC%20Legislative&items_per_page=50&page&_format=csv"


# Current working directory.
THIS_DIR = os.path.dirname(os.path.abspath(__file__))
TEST_DIR = os.path.join(THIS_DIR, os.pardir, "data", "cawp_women_legislators")

GOLDEN_DATA = {
    'race_and_ethnicity': os.path.join(TEST_DIR, 'cawp_test_output_race_and_ethnicity.json'),
}


def get_test_data_as_df(*args):

    # for line level CSV
    test_input_csv = 'cawp_test_input_by_race.csv'
    data_types = {"id": str,
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

    # for TOTALS csv
    if args[0] == CAWP_TOTALS_URL:
        test_input_csv = 'cawp_test_input.csv'
        data_types = {"level": str,
                      "state": str,
                      "race_ethnicity": str,
                      }

    # read file that contains state leg TOTALS by state
    return pd.read_csv(os.path.join(TEST_DIR, test_input_csv),
                       dtype=data_types
                       )


@mock.patch('ingestion.gcs_to_bq_util.load_csv_as_dataframe_from_web',
            side_effect=get_test_data_as_df)
@mock.patch('ingestion.gcs_to_bq_util.add_dataframe_to_bq',
            return_value=None)
def testWriteToBq(mock_bq: mock.MagicMock, mock_csv: mock.MagicMock):

    cawp_data = CAWPData()

    # pretend arguments required by bigQuery
    kwargs = {'filename': 'test_file.csv',
              'metadata_table_id': 'test_metadata',
              'table_name': 'output_table'}

    cawp_data.write_to_bq('dataset', 'gcs_bucket', **kwargs)

    assert mock_csv.call_count == 1
    assert mock_bq.call_count == 1

    expected_dtype = {
        'state_name': str,
        "pct_women_state_leg": float,
        'race_and_ethnicity': str,
        'race': str,
        'race_includes_hispanic': object,
        'race_category_id': str
    }

    # read in the test output file as a dataframe with expected columns/types
    expected_df = pd.read_json(
        GOLDEN_DATA['race_and_ethnicity'], dtype=expected_dtype)

    # print("mock call results")
    # print(mock_bq.call_args_list[0].args[0].to_string())

    # print("expected output file")
    # print(expected_df.to_string())

    # output created in mocked load_csv_as_dataframe_from_web() should be the same as the expected df
    assert_frame_equal(
        mock_bq.call_args_list[0].args[0], expected_df, check_like=True)
