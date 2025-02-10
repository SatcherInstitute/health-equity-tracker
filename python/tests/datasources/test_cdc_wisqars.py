from unittest import mock
from pandas._testing import assert_frame_equal
from datasources.cdc_wisqars import CDCWisqarsData
import pandas as pd
import os
from test_utils import _load_csv_as_df_from_real_data_dir

THIS_DIR = os.path.dirname(os.path.abspath(__file__))
TEST_DIR = os.path.join(THIS_DIR, os.pardir, "data")
GOLDEN_DIR = os.path.join(TEST_DIR, "cdc_wisqars", "golden_data")

CURRENT = "_current"
HISTORICAL = "_historical"

AGE_NATIONAL = "age_national"
RACE_NATIONAL = "race_and_ethnicity_national"
SEX_NATIONAL = "sex_national"
SEX_STATE = "sex_state"

AGE_NATIONAL_CURRENT = AGE_NATIONAL + CURRENT
AGE_NATIONAL_HISTORICAL = AGE_NATIONAL + HISTORICAL
RACE_NATIONAL_CURRENT = RACE_NATIONAL + CURRENT
RACE_NATIONAL_HISTORICAL = RACE_NATIONAL + HISTORICAL
SEX_NATIONAL_CURRENT = SEX_NATIONAL + CURRENT
SEX_NATIONAL_HISTORICAL = SEX_NATIONAL + HISTORICAL
SEX_STATE_CURRENT = SEX_STATE + CURRENT
SEX_STATE_HISTORICAL = SEX_STATE + HISTORICAL

GOLDEN_DATA = {
    AGE_NATIONAL_CURRENT: os.path.join(GOLDEN_DIR, f"{AGE_NATIONAL_CURRENT}.csv"),
    AGE_NATIONAL_HISTORICAL: os.path.join(GOLDEN_DIR, f"{AGE_NATIONAL_HISTORICAL}.csv"),
    RACE_NATIONAL_CURRENT: os.path.join(GOLDEN_DIR, f"{RACE_NATIONAL_CURRENT}.csv"),
    RACE_NATIONAL_HISTORICAL: os.path.join(GOLDEN_DIR, f"{RACE_NATIONAL_HISTORICAL}.csv"),
    SEX_NATIONAL_CURRENT: os.path.join(GOLDEN_DIR, f"{SEX_NATIONAL_CURRENT}.csv"),
    SEX_NATIONAL_HISTORICAL: os.path.join(GOLDEN_DIR, f"{SEX_NATIONAL_HISTORICAL}.csv"),
    SEX_STATE_CURRENT: os.path.join(GOLDEN_DIR, f"{SEX_STATE_CURRENT}.csv"),
    SEX_STATE_HISTORICAL: os.path.join(GOLDEN_DIR, f"{SEX_STATE_HISTORICAL}.csv"),
}

DTYPE = {"state_fips": str, "time_period": str}


@mock.patch("ingestion.gcs_to_bq_util.add_df_to_bq", return_value=None)
@mock.patch("ingestion.gcs_to_bq_util.load_csv_as_df_from_data_dir", side_effect=_load_csv_as_df_from_real_data_dir)
def test_write_to_bq_age_national(
    mock_data_dir: mock.MagicMock,
    mock_bq: mock.MagicMock,
):
    datasource = CDCWisqarsData()
    datasource.write_to_bq("dataset", "gcs_bucket", demographic="age", geographic="national")

    assert mock_data_dir.call_count == 4
    assert mock_bq.call_count == 2

    (mock_current, mock_historical) = mock_bq.call_args_list

    actual_current_df, _, table_name = mock_current[0]
    expected_current_df = pd.read_csv(GOLDEN_DATA[table_name], dtype=DTYPE)
    assert table_name == "age_national_current"
    # actual_current_df.to_csv(table_name, index=False)

    actual_historical_df, _, table_name = mock_historical[0]
    expected_historical_df = pd.read_csv(GOLDEN_DATA[table_name], dtype=DTYPE)
    assert table_name == "age_national_historical"
    # actual_historical_df.to_csv(table_name, index=False)

    assert_frame_equal(actual_current_df, expected_current_df, check_like=True)
    assert_frame_equal(actual_historical_df, expected_historical_df, check_like=True)


@mock.patch("ingestion.gcs_to_bq_util.add_df_to_bq", return_value=None)
@mock.patch("ingestion.gcs_to_bq_util.load_csv_as_df_from_data_dir", side_effect=_load_csv_as_df_from_real_data_dir)
def test_write_to_bq_race_national(
    mock_data_dir: mock.MagicMock,
    mock_bq: mock.MagicMock,
):
    datasource = CDCWisqarsData()
    datasource.write_to_bq("dataset", "gcs_bucket", demographic="race_and_ethnicity", geographic="national")

    assert mock_data_dir.call_count == 6  # extra calls for the ETH tables, distinct from the NH RACE tables

    (mock_current, mock_historical) = mock_bq.call_args_list

    actual_current_df, _, table_name = mock_current[0]
    expected_current_df = pd.read_csv(GOLDEN_DATA[table_name], dtype=DTYPE)
    assert table_name == "race_and_ethnicity_national_current"
    # actual_current_df.to_csv(table_name, index=False)

    actual_historical_df, _, table_name = mock_historical[0]
    expected_historical_df = pd.read_csv(GOLDEN_DATA[table_name], dtype=DTYPE)
    assert table_name == "race_and_ethnicity_national_historical"
    # actual_historical_df.to_csv(table_name, index=False)

    assert mock_bq.call_count == 2

    assert_frame_equal(actual_current_df, expected_current_df, check_like=True)
    assert_frame_equal(actual_historical_df, expected_historical_df, check_like=True)


@mock.patch("ingestion.gcs_to_bq_util.add_df_to_bq", return_value=None)
@mock.patch("ingestion.gcs_to_bq_util.load_csv_as_df_from_data_dir", side_effect=_load_csv_as_df_from_real_data_dir)
def test_write_to_bq_sex_national(
    mock_data_dir: mock.MagicMock,
    mock_bq: mock.MagicMock,
):
    datasource = CDCWisqarsData()
    datasource.write_to_bq("dataset", "gcs_bucket", demographic="sex", geographic="national")

    assert mock_data_dir.call_count == 4

    (mock_current, mock_historical) = mock_bq.call_args_list

    actual_current_df, _, table_name = mock_current[0]
    expected_current_df = pd.read_csv(GOLDEN_DATA[table_name], dtype=DTYPE)
    assert table_name == "sex_national_current"
    # actual_current_df.to_csv(table_name, index=False)

    actual_historical_df, _, table_name = mock_historical[0]
    expected_historical_df = pd.read_csv(GOLDEN_DATA[table_name], dtype=DTYPE)
    assert table_name == "sex_national_historical"
    # actual_historical_df.to_csv(table_name, index=False)

    assert mock_bq.call_count == 2

    assert_frame_equal(actual_current_df, expected_current_df, check_like=True)
    assert_frame_equal(actual_historical_df, expected_historical_df, check_like=True)


@mock.patch("ingestion.gcs_to_bq_util.add_df_to_bq", return_value=None)
@mock.patch("ingestion.gcs_to_bq_util.load_csv_as_df_from_data_dir", side_effect=_load_csv_as_df_from_real_data_dir)
def test_write_to_bq_sex_state(
    mock_data_dir: mock.MagicMock,
    mock_bq: mock.MagicMock,
):
    datasource = CDCWisqarsData()
    datasource.write_to_bq("dataset", "gcs_bucket", demographic="sex", geographic="state")

    assert mock_data_dir.call_count == 4

    (mock_current, mock_historical) = mock_bq.call_args_list

    actual_current_df, _, table_name = mock_current[0]
    expected_current_df = pd.read_csv(GOLDEN_DATA[table_name], dtype=DTYPE)
    assert table_name == "sex_state_current"
    # actual_current_df.to_csv(table_name, index=False)

    actual_historical_df, _, table_name = mock_historical[0]
    expected_historical_df = pd.read_csv(GOLDEN_DATA[table_name], dtype=DTYPE)
    assert table_name == "sex_state_historical"
    # actual_historical_df.to_csv(table_name, index=False)

    assert mock_bq.call_count == 2

    assert_frame_equal(actual_current_df, expected_current_df, check_like=True)
    assert_frame_equal(actual_historical_df, expected_historical_df, check_like=True)
