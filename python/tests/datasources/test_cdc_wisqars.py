from unittest import mock
from pandas._testing import assert_frame_equal
from datasources.cdc_wisqars import CDCWisqarsData
import pandas as pd
import os

THIS_DIR = os.path.dirname(os.path.abspath(__file__))
TEST_DIR = os.path.join(THIS_DIR, os.pardir, "data")
GOLDEN_DIR = os.path.join(TEST_DIR, "cdc_wisqars", "golden_data")

GOLDEN_DATA = {
    "age_national_current": os.path.join(GOLDEN_DIR, "age_national_current.csv"),
    "age_national_historical": os.path.join(GOLDEN_DIR, "age_national_historical.csv"),
    "sex_national_current": os.path.join(GOLDEN_DIR, "sex_national_current.csv"),
    "sex_national_historical": os.path.join(GOLDEN_DIR, "sex_national_historical.csv"),
}

DTYPE = {"state_fips": str, "time_period": str}


def _load_csv_as_df_from_data_dir(*args, **kwargs):
    directory, filename = args
    use_cols = kwargs["usecols"]

    df = pd.read_csv(
        os.path.join(TEST_DIR, directory, filename),
        usecols=use_cols,
        na_values='--',
        dtype={"Year": str},
        thousands=',',
    )
    return df


@mock.patch("ingestion.gcs_to_bq_util.add_df_to_bq", return_value=None)
@mock.patch(
    "ingestion.gcs_to_bq_util.load_csv_as_df_from_data_dir",
    side_effect=_load_csv_as_df_from_data_dir,
)
def test_write_to_bq_age_national(
    mock_data_dir: mock.MagicMock,
    mock_bq: mock.MagicMock,
):
    datasource = CDCWisqarsData()
    datasource.write_to_bq(
        "dataset", "gcs_bucket", demographic="age", geographic="national"
    )

    (mock_current, mock_historical) = mock_bq.call_args_list

    actual_current_df, _, table_name = mock_current[0]
    expected_current_df = pd.read_csv(GOLDEN_DATA[table_name], dtype=DTYPE)
    assert table_name == "age_national_current"

    actual_historical_df, _, table_name = mock_historical[0]
    expected_historical_df = pd.read_csv(GOLDEN_DATA[table_name], dtype=DTYPE)
    assert table_name == "age_national_historical"

    assert mock_bq.call_count == 2

    assert_frame_equal(actual_current_df, expected_current_df, check_like=True)
    assert_frame_equal(actual_historical_df, expected_historical_df, check_like=True)


@mock.patch("ingestion.gcs_to_bq_util.add_df_to_bq", return_value=None)
@mock.patch(
    "ingestion.gcs_to_bq_util.load_csv_as_df_from_data_dir",
    side_effect=_load_csv_as_df_from_data_dir,
)
def test_write_to_bq_sex_national(
    mock_data_dir: mock.MagicMock,
    mock_bq: mock.MagicMock,
):
    datasource = CDCWisqarsData()
    datasource.write_to_bq(
        "dataset", "gcs_bucket", demographic="sex", geographic="national"
    )

    (mock_current, mock_historical) = mock_bq.call_args_list

    actual_current_df, _, table_name = mock_current[0]
    expected_current_df = pd.read_csv(GOLDEN_DATA[table_name], dtype=DTYPE)
    assert table_name == "sex_national_current"

    actual_historical_df, _, table_name = mock_historical[0]
    expected_historical_df = pd.read_csv(GOLDEN_DATA[table_name], dtype=DTYPE)
    assert table_name == "sex_national_historical"

    assert mock_bq.call_count == 2

    assert_frame_equal(actual_current_df, expected_current_df, check_like=True)
    assert_frame_equal(actual_historical_df, expected_historical_df, check_like=True)
