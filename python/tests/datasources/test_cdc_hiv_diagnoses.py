from unittest import mock
from datasources.cdc_hiv_diagnoses import CDCHIVDiagnosesData
import pandas as pd
import os

THIS_DIR = os.path.dirname(os.path.abspath(__file__))
TEST_DIR = os.path.join(THIS_DIR, os.pardir, "data",)


def _load_csv_as_df_from_data_dir(*args, **kwargs):
    dataset, filename = args
    df = pd.read_csv(os.path.join(TEST_DIR, dataset, filename),
                     dtype={'FIPS': str}, skiprows=9)
    return df


@mock.patch('ingestion.gcs_to_bq_util.load_csv_as_df_from_data_dir', side_effect=_load_csv_as_df_from_data_dir)
@mock.patch('ingestion.gcs_to_bq_util.add_df_to_bq',
            return_value=None)
def testRunner(
    mock_bq: mock.MagicMock,
    mock_data_dir: mock.MagicMock,
):
    datasource = CDCHIVDiagnosesData()
    datasource.write_to_bq('dataset', 'gcs_bucket')
