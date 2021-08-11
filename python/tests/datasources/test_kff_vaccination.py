from unittest import mock
import os

import pandas as pd
from pandas._testing import assert_frame_equal

from datasources.kff_vaccination import KFFVaccination

# Current working directory.
THIS_DIR = os.path.dirname(os.path.abspath(__file__))
TEST_DIR = os.path.join(THIS_DIR, os.pardir, "data")

GOLDEN_DATA = os.path.join(TEST_DIR, 'kff_vaccination_by_race_and_ethnicity.csv')

def get_perecentage_of_race_test_data_as_df():
    return pd.read_csv(os.path.join(TEST_DIR, 'kff_vaccination_percentage_of_race_test.csv'), dtype={'state_fips': str})

def get_pct_share_race_test_data_as_df():
    return pd.read_csv(os.path.join(TEST_DIR, 'kff_vaccination_pct_share_race_test.csv'), dtype={'state_fips': str})

@mock.patch('ingestion.gcs_to_bq_util.load_csv_as_dataframe_from_web')
@mock.patch('ingestion.gcs_to_bq_util.add_dataframe_to_bq',
            return_value=None)
def testWriteToBq(mock_bq: mock.MagicMock, mock_csv: mock.MagicMock):
    mock_csv.side_effect = [get_perecentage_of_race_test_data_as_df(), get_pct_share_race_test_data_as_df()]
    kffVaccination = KFFVaccination()

    kwargs = {'filename': 'test_file.csv',
              'metadata_table_id': 'test_metadata',
              'table_name': 'output_table'}

    kffVaccination.write_to_bq('dataset', 'gcs_bucket', **kwargs)
    assert mock_bq.call_count == 1

    mock_bq.call_args_list[0].args[0].to_csv('hello.csv')

    expected_df = pd.read_csv(GOLDEN_DATA, dtype={
        'state_fips': str,
        'vaccinated_pct_share': str,
        'vaccinated_pct': str
    })
    assert_frame_equal(mock_bq.call_args_list[0].args[0], expected_df, check_like=True)
