from unittest import mock
import os
import pandas as pd
from datasources.maternal_mortality import MaternalMortalityData

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
def testWriteToBq(
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
