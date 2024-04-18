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

    for call in mock_bq.call_args_list:
        print("**")
        # print(call[0])
        df, _, table_name = call[0]
        print(table_name)
        print(df)
