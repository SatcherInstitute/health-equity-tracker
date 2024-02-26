from unittest import mock
import os
import pandas as pd
from datasources.maternal_mortality import MaternalMortalityData
from test_utils import _load_public_dataset_from_bigquery_as_df, _load_df_from_bigquery


THIS_DIR = os.path.dirname(os.path.abspath(__file__))
TEST_DIR = os.path.join(THIS_DIR, os.pardir, "data", "maternal_mortality")
GOLDEN_DIR = os.path.join(TEST_DIR, 'golden_data')


# RUN THIS TO LOAD FAKE TEST DATA INSTEAD OF THE REAL /data
def get_test_data_as_df():
    df = pd.read_csv(
        os.path.join(
            TEST_DIR, 'IHME_USA_MMR_STATE_RACE_ETHN_1999_2019_ESTIMATES_Y2023M07D03.CSV'
        )
    )
    return df


# READ IN FAKE TEST DATA INSTEAD OF REAL /data
@mock.patch(
    'ingestion.gcs_to_bq_util.load_csv_as_df_from_data_dir',
    return_value=get_test_data_as_df(),
)
@mock.patch(
    'ingestion.gcs_to_bq_util.load_df_from_bigquery',
    side_effect=_load_df_from_bigquery,
)
@mock.patch(
    'ingestion.gcs_to_bq_util.load_public_dataset_from_bigquery_as_df',
    side_effect=_load_public_dataset_from_bigquery_as_df,
)
@mock.patch('ingestion.gcs_to_bq_util.add_df_to_bq', return_value=None)
def testWriteToBq(
    mock_bq: mock.MagicMock,
    mock_public: mock.MagicMock,
    mock_pop: mock.MagicMock,
    # VARIABLE THAT REPRESENTS THE MOCKED READ CSV FUNCTION
    mock_csv: mock.MagicMock,
):
    datasource = MaternalMortalityData()

    kwargs = {
        'filename': 'test_file.csv',
        'metadata_table_id': 'test_metadata',
        'table_name': 'output_table',
    }

    datasource.write_to_bq('dataset', 'gcs_bucket', **kwargs)

    # ASSERT THAT THE MOCKED READ CSV FUNCTION WAS CALLED ONCE
    assert mock_csv.call_count == 1

    for call in mock_bq.call_args_list:
        print("call from mock_bq", call)
