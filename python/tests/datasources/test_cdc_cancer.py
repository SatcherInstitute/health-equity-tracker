from unittest import mock
import os
from datasources.cdc_cancer import CdcCancerData
from test_utils import _load_csv_as_df_from_real_data_dir

THIS_DIR = os.path.dirname(os.path.abspath(__file__))
TEST_DIR = os.path.join(THIS_DIR, os.pardir, "data", "cdc_cancer")
GOLDEN_DIR = os.path.join(TEST_DIR, 'golden_data')

GOLDEN_DATA = {
    'race_and_ethnicity_national_current': os.path.join(GOLDEN_DIR, 'expected_race_and_ethnicity_national.csv'),
    'race_and_ethnicity_state_current': os.path.join(GOLDEN_DIR, 'expected_race_and_ethnicity_state.csv'),
    'age_national_current': os.path.join(GOLDEN_DIR, 'expected_age_national.csv'),
    'age_state_current': os.path.join(GOLDEN_DIR, 'expected_age_state.csv'),
    'sex_national_current': os.path.join(GOLDEN_DIR, 'expected_sex_national.csv'),
    'sex_state_current': os.path.join(GOLDEN_DIR, 'expected_sex_state.csv'),
}


# Breakdown Tests
@mock.patch('ingestion.gcs_to_bq_util.add_df_to_bq', return_value=None)
@mock.patch('ingestion.gcs_to_bq_util.load_csv_as_df_from_data_dir', side_effect=_load_csv_as_df_from_real_data_dir)
def testBreakdownRaceNational(mock_data_dir: mock.MagicMock, mock_bq_write: mock.MagicMock):
    datasource = CdcCancerData()
    datasource.write_to_bq('dataset', 'gcs_bucket', demographic='sex', geographic='national')

    assert mock_data_dir.called

    (_breakdown_df, _dataset, table_name), _dtypes = mock_bq_write.call_args
    assert table_name == 'sex_national_current'
