from unittest import mock
from pandas._testing import assert_frame_equal
from datasources.cdc_wisqars import CDCWisqarsData
import os
from test_utils import _load_csv_as_df_from_real_data_dir, load_golden_df

THIS_DIR = os.path.dirname(os.path.abspath(__file__))
GOLDEN_DIR = os.path.join(THIS_DIR, os.pardir, "data", "cdc_wisqars", "golden_data")

DTYPE = {"state_fips": str, "time_period": str}


@mock.patch("ingestion.gcs_to_bq_util.add_df_to_bq", return_value=None)
@mock.patch("ingestion.gcs_to_bq_util.load_csv_as_df_from_data_dir", side_effect=_load_csv_as_df_from_real_data_dir)
def test_write_to_bq_age_national(mock_data_dir: mock.MagicMock, mock_bq: mock.MagicMock):
    datasource = CDCWisqarsData()
    datasource.write_to_bq("dataset", "gcs_bucket", demographic="age", geographic="national")

    assert mock_data_dir.call_count == 4
    assert mock_bq.call_count == 2

    mock_current, mock_historical = mock_bq.call_args_list

    actual_current_df, _, table_name = mock_current[0]
    assert table_name == "age_national_current"
    assert_frame_equal(actual_current_df, load_golden_df(GOLDEN_DIR, table_name, DTYPE), check_like=True)

    actual_historical_df, _, table_name = mock_historical[0]
    assert table_name == "age_national_historical"
    assert_frame_equal(actual_historical_df, load_golden_df(GOLDEN_DIR, table_name, DTYPE), check_like=True)


@mock.patch("ingestion.gcs_to_bq_util.add_df_to_bq", return_value=None)
@mock.patch("ingestion.gcs_to_bq_util.load_csv_as_df_from_data_dir", side_effect=_load_csv_as_df_from_real_data_dir)
def test_write_to_bq_race_national(mock_data_dir: mock.MagicMock, mock_bq: mock.MagicMock):
    datasource = CDCWisqarsData()
    datasource.write_to_bq("dataset", "gcs_bucket", demographic="race_and_ethnicity", geographic="national")

    assert mock_data_dir.call_count == 6
    assert mock_bq.call_count == 2

    mock_current, mock_historical = mock_bq.call_args_list

    actual_current_df, _, table_name = mock_current[0]
    assert table_name == "race_and_ethnicity_national_current"
    assert_frame_equal(actual_current_df, load_golden_df(GOLDEN_DIR, table_name, DTYPE), check_like=True)

    actual_historical_df, _, table_name = mock_historical[0]
    assert table_name == "race_and_ethnicity_national_historical"
    assert_frame_equal(actual_historical_df, load_golden_df(GOLDEN_DIR, table_name, DTYPE), check_like=True)


@mock.patch("ingestion.gcs_to_bq_util.add_df_to_bq", return_value=None)
@mock.patch("ingestion.gcs_to_bq_util.load_csv_as_df_from_data_dir", side_effect=_load_csv_as_df_from_real_data_dir)
def test_write_to_bq_sex_national(mock_data_dir: mock.MagicMock, mock_bq: mock.MagicMock):
    datasource = CDCWisqarsData()
    datasource.write_to_bq("dataset", "gcs_bucket", demographic="sex", geographic="national")

    assert mock_data_dir.call_count == 4
    assert mock_bq.call_count == 2

    mock_current, mock_historical = mock_bq.call_args_list

    actual_current_df, _, table_name = mock_current[0]
    assert table_name == "sex_national_current"
    assert_frame_equal(actual_current_df, load_golden_df(GOLDEN_DIR, table_name, DTYPE), check_like=True)

    actual_historical_df, _, table_name = mock_historical[0]
    assert table_name == "sex_national_historical"
    assert_frame_equal(actual_historical_df, load_golden_df(GOLDEN_DIR, table_name, DTYPE), check_like=True)


@mock.patch("ingestion.gcs_to_bq_util.add_df_to_bq", return_value=None)
@mock.patch("ingestion.gcs_to_bq_util.load_csv_as_df_from_data_dir", side_effect=_load_csv_as_df_from_real_data_dir)
def test_write_to_bq_sex_state(mock_data_dir: mock.MagicMock, mock_bq: mock.MagicMock):
    datasource = CDCWisqarsData()
    datasource.write_to_bq("dataset", "gcs_bucket", demographic="sex", geographic="state")

    assert mock_data_dir.call_count == 4
    assert mock_bq.call_count == 2

    mock_current, mock_historical = mock_bq.call_args_list

    actual_current_df, _, table_name = mock_current[0]
    assert table_name == "sex_state_current"
    assert_frame_equal(actual_current_df, load_golden_df(GOLDEN_DIR, table_name, DTYPE), check_like=True)

    actual_historical_df, _, table_name = mock_historical[0]
    assert table_name == "sex_state_historical"
    assert_frame_equal(actual_historical_df, load_golden_df(GOLDEN_DIR, table_name, DTYPE), check_like=True)
