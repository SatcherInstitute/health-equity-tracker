from unittest import mock
import os
import pandas as pd
from datasources.maternal_mortality import MaternalMortalityData

THIS_DIR = os.path.dirname(os.path.abspath(__file__))
TEST_DIR = os.path.join(THIS_DIR, os.pardir, "data", "maternal_mortality")
GOLDEN_DIR = os.path.join(TEST_DIR, 'golden_data')


# RUN THIS TO LOAD FAKE TEST DATA INSTEAD OF THE REAL /data
def get_test_data_as_df(*args):
    print("Reading test input data rather than actual /data dir")
    print(args[1])
    df = pd.read_csv(os.path.join(TEST_DIR, args[1]))
    return df


# READ IN FAKE TEST DATA INSTEAD OF REAL /data
@mock.patch(
    'ingestion.gcs_to_bq_util.load_csv_as_df_from_data_dir',
    side_effect=get_test_data_as_df,
)
@mock.patch('ingestion.gcs_to_bq_util.add_df_to_bq', return_value=None)
def testWriteToBq(
    mock_bq: mock.MagicMock,
    mock_csv: mock.MagicMock,
):
    datasource = MaternalMortalityData()

    kwargs = {
        'filename': 'test_file.csv',
        'metadata_table_id': 'test_metadata',
        'table_name': 'output_table',
    }

    datasource.write_to_bq('dataset', 'gcs_bucket', **kwargs)

    # ASSERT THAT THE MOCKED READ CSV FUNCTION WAS CALLED FOR NATIONAL AND STATE DATA
    assert mock_csv.call_count == 2

    # STATE LEVEL
    df_state, _, state_table_name = mock_bq.call_args_list[0][0]
    assert state_table_name == 'by_race_state_historical'
    print(df_state)
    # TODO: assert that the df_state is the same as the golden data file loaded via pd.read_csv

    # NATIONAL LEVEL
    df_national, _, national_table_name = mock_bq.call_args_list[1][0]
    assert national_table_name == 'by_race_national_historical'
    print(df_national)
    # TODO: assert that the df_national is the same as the golden data file loaded via pd.read_csv
