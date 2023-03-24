from unittest import mock
import os
import pandas as pd
from pandas._testing import assert_frame_equal
from test_utils import get_state_fips_codes_as_df
from datasources.uhc_test import UHCData
import ingestion.standardized_columns as std_col

THIS_DIR = os.path.dirname(os.path.abspath(__file__))

TEST_DIR = os.path.join(THIS_DIR, os.pardir, "data")
GOLDEN_DIR = os.path.join(TEST_DIR, 'golden_data')


def _load_csv_as_df_from_data_dir(*args, **kwargs):
    directory, filename = args

    df = pd.read_csv(os.path.join(TEST_DIR, directory, filename))

    return df


@mock.patch('ingestion.gcs_to_bq_util.add_df_to_bq', return_value=None)
@mock.patch('ingestion.gcs_to_bq_util.load_csv_as_df_from_data_dir', side_effect=_load_csv_as_df_from_data_dir)
def testWriteToBqCalls(
    mock_data_dir_df: mock.MagicMock,
    mock_bq: mock.MagicMock,
):
    datasource = UHCData()
    datasource.write_to_bq('dataset', 'gcs_bucket')

    print(mock_bq)
