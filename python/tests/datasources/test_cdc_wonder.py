from unittest import mock
import os
from datasources.cdc_wonder import CdcWonderData
from ingestion.cdc_wonder_utils import CDC_WONDER_DIR
import pandas as pd

from pandas._testing import assert_frame_equal

from test_utils import _load_csv_as_df_from_real_data_dir
import ingestion.standardized_columns as std_col

THIS_DIR = os.path.dirname(os.path.abspath(__file__))
TEST_DIR = os.path.join(THIS_DIR, os.pardir, "data")
GOLDEN_DIR = os.path.join(TEST_DIR, CDC_WONDER_DIR, "golden_data")

CSV_DTYPES = {std_col.TIME_PERIOD_COL: str, std_col.STATE_FIPS_COL: str}

GOLDEN_DATA = {
    "age_national_current": os.path.join(GOLDEN_DIR, "expected_age_national_current.csv"),
    "age_national_historical": os.path.join(GOLDEN_DIR, "expected_age_national_historical.csv"),
    "race_and_ethnicity_state_current": os.path.join(GOLDEN_DIR, "expected_race_and_ethnicity_state_current.csv"),
    "race_and_ethnicity_state_historical": os.path.join(GOLDEN_DIR, "expected_race_and_ethnicity_state_historical.csv"),
    "sex_national_current": os.path.join(GOLDEN_DIR, "expected_sex_national_current.csv"),
    "sex_national_historical": os.path.join(GOLDEN_DIR, "expected_sex_national_historical.csv"),
}


# Breakdown Tests
@mock.patch("ingestion.gcs_to_bq_util.add_df_to_bq", return_value=None)
@mock.patch("ingestion.gcs_to_bq_util.load_csv_as_df_from_data_dir", side_effect=_load_csv_as_df_from_real_data_dir)
def testBreakdownAgeNational(mock_data_dir: mock.MagicMock, mock_bq_write: mock.MagicMock):
    datasource = CdcWonderData()
    datasource.write_to_bq("dataset", "gcs_bucket", demographic="age", geographic="national")

    assert mock_data_dir.called

    mock_current, mock_historical = mock_bq_write.call_args_list

    actual_current_df, _, current_table_name = mock_current[0]
    expected_current_df = pd.read_csv(GOLDEN_DATA[current_table_name], dtype=CSV_DTYPES)
    assert current_table_name == "age_national_current"
    # actual_current_df.to_csv(current_table_name, index=False)
    assert_frame_equal(actual_current_df, expected_current_df, check_like=True)

    actual_historical_df, _, historical_table_name = mock_historical[0]
    expected_historical_df = pd.read_csv(GOLDEN_DATA[historical_table_name], dtype=CSV_DTYPES)
    assert historical_table_name == "age_national_historical"
    # actual_historical_df.to_csv(historical_table_name, index=False)
    assert_frame_equal(actual_historical_df, expected_historical_df, check_like=True)


@mock.patch("ingestion.gcs_to_bq_util.add_df_to_bq", return_value=None)
@mock.patch("ingestion.gcs_to_bq_util.load_csv_as_df_from_data_dir", side_effect=_load_csv_as_df_from_real_data_dir)
def testBreakdownSexNational(mock_data_dir: mock.MagicMock, mock_bq_write: mock.MagicMock):
    datasource = CdcWonderData()
    datasource.write_to_bq("dataset", "gcs_bucket", demographic="sex", geographic="national")

    assert mock_data_dir.called

    mock_current, mock_historical = mock_bq_write.call_args_list

    actual_current_df, _, current_table_name = mock_current[0]
    expected_current_df = pd.read_csv(GOLDEN_DATA[current_table_name], dtype=CSV_DTYPES)
    assert current_table_name == "sex_national_current"
    # actual_current_df.to_csv(current_table_name, index=False)

    assert_frame_equal(actual_current_df, expected_current_df, check_like=True)

    actual_historical_df, _, historical_table_name = mock_historical[0]
    expected_historical_df = pd.read_csv(GOLDEN_DATA[historical_table_name], dtype=CSV_DTYPES)
    assert historical_table_name == "sex_national_historical"
    # actual_historical_df.to_csv(historical_table_name, index=False)
    assert_frame_equal(actual_historical_df, expected_historical_df, check_like=True)


@mock.patch("ingestion.gcs_to_bq_util.add_df_to_bq", return_value=None)
@mock.patch("ingestion.gcs_to_bq_util.load_csv_as_df_from_data_dir", side_effect=_load_csv_as_df_from_real_data_dir)
def testBreakdownRaceState(mock_data_dir: mock.MagicMock, mock_bq_write: mock.MagicMock):
    datasource = CdcWonderData()
    datasource.write_to_bq("dataset", "gcs_bucket", demographic="race_and_ethnicity", geographic="state")

    assert mock_data_dir.called

    mock_current, mock_historical = mock_bq_write.call_args_list

    actual_current_df, _, current_table_name = mock_current[0]
    expected_current_df = pd.read_csv(GOLDEN_DATA[current_table_name], dtype=CSV_DTYPES)
    assert current_table_name == "race_and_ethnicity_state_current"
    # actual_current_df.to_csv(current_table_name, index=False)
    assert_frame_equal(actual_current_df, expected_current_df, check_like=True)

    actual_historical_df, _, historical_table_name = mock_historical[0]
    expected_historical_df = pd.read_csv(GOLDEN_DATA[historical_table_name], dtype=CSV_DTYPES)
    assert historical_table_name == "race_and_ethnicity_state_historical"
    # actual_historical_df.to_csv(historical_table_name, index=False)
    assert_frame_equal(actual_historical_df, expected_historical_df, check_like=True)
