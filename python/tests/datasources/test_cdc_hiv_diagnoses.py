from unittest import mock
from datasources.cdc_hiv_diagnoses import CDCHIVDiagnosesData
import pandas as pd
import os

THIS_DIR = os.path.dirname(os.path.abspath(__file__))
TEST_DIR = os.path.join(THIS_DIR, os.pardir, "data", "cdc_hiv_diagnoses")


def get_hiv_as_df():
    return pd.read_csv(os.path.join(TEST_DIR, 'test_sex_male_state_2019.csv'))


@mock.patch('ingestion.gcs_to_bq_util.load_csv_as_df_from_data_dir', return_value=get_hiv_as_df())
@mock.patch('ingestion.gcs_to_bq_util.add_df_to_bq', return_value=None)
def testWriteToBq(mock_bq: mock.MagicMock, mock_csv: mock.MagicMock):

    kwargs_for_bq = {'filename': 'test_file.csv',
                     'metadata_table_id': 'test_metadata', 'table_name': 'output_table'}

    cdcHivDiagnosesData = CDCHIVDiagnosesData()
    cdcHivDiagnosesData.write_to_bq('dataset', 'gcs_bucket', **kwargs_for_bq)
    assert mock_bq.call_count == 1
    assert mock_csv.call_count == 1

    print("/n")
    print(mock_bq.call_args_list[0].args[0])
