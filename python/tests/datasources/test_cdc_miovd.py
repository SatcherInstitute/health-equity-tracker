import os

from datasources.cdc_miovd import CdcMIOVD
from ingestion.local_pipeline_utils import load_csv_as_df_from_data_dir
from unittest import mock


THIS_DIR = os.path.dirname(os.path.abspath(__file__))
TEST_DIR = os.path.join(THIS_DIR, os.pardir, "data")


# Breakdown Tests
@mock.patch("ingestion.gcs_to_bq_util.load_csv_as_df_from_data_dir", side_effect=load_csv_as_df_from_data_dir)
def test_write_to_bq_alls_county(mock_csv_data_dir: mock.MagicMock):
    datasource = CdcMIOVD()
    datasource.write_to_bq("dataset", "gcs_bucket", demographic="all", geographic="county")

    assert mock_csv_data_dir.called
