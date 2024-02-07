import os
from unittest import mock

import pandas as pd
from pandas._testing import assert_frame_equal

from datasources.cdc_wisqars_youth_by_race import CDCWisqarsYouthData
from ingestion import standardized_columns as std_col
from ingestion.constants import NATIONAL_LEVEL, STATE_LEVEL
from test_utils import _load_public_dataset_from_bigquery_as_df

THIS_DIR = os.path.dirname(os.path.abspath(__file__))
TEST_DIR = os.path.join(THIS_DIR, os.pardir, "data")
GOLDEN_DIR = os.path.join(TEST_DIR, "cdc_wisqars", "golden_data")

DTYPE = {std_col.TIME_PERIOD_COL: str, std_col.STATE_FIPS_COL: str}

GOLDEN_DATA = {
    "youth_by_race_and_ethnicity_national_current": os.path.join(
        GOLDEN_DIR, "youth_by_race_and_ethnicity_national_current.csv"
    ),
    "youth_by_race_and_ethnicity_national_historical": os.path.join(
        GOLDEN_DIR, "youth_by_race_and_ethnicity_national_historical.csv"
    ),
    "youth_by_race_and_ethnicity_state_current": os.path.join(
        GOLDEN_DIR, "youth_by_race_and_ethnicity_state_current.csv"
    ),
    "youth_by_race_and_ethnicity_state_historical": os.path.join(
        GOLDEN_DIR, "youth_by_race_and_ethnicity_state_historical.csv"
    ),
}


def _load_csv_as_df_from_data_dir(*args, **kwargs):
    directory, filename = args
    use_cols = kwargs["usecols"]

    df = pd.read_csv(
        os.path.join(TEST_DIR, directory, filename),
        usecols=use_cols,
        na_values=["--"],
        dtype={"Year": str, "Population": float},
        thousands=",",
    )

    return df


@mock.patch("ingestion.gcs_to_bq_util.add_df_to_bq", return_value=None)
@mock.patch(
    "ingestion.gcs_to_bq_util.load_public_dataset_from_bigquery_as_df",
    side_effect=_load_public_dataset_from_bigquery_as_df,
)
@mock.patch(
    "ingestion.gcs_to_bq_util.load_csv_as_df_from_data_dir",
    side_effect=_load_csv_as_df_from_data_dir,
)
def test_write_to_bq_youth_by_race_national(
    mock_data_dir: mock.MagicMock,
    mock_public_bq: mock.MagicMock,
    mock_bq: mock.MagicMock,
):
    datasource = CDCWisqarsYouthData()
    datasource.write_to_bq(
        "dataset",
        "gcs_bucket",
        demographic=std_col.RACE_OR_HISPANIC_COL,
        geographic=NATIONAL_LEVEL,
    )

    (mock_current, mock_historical) = mock_bq.call_args_list

    actual_current_df, _, table_name = mock_current[0]
    expected_current_df = pd.read_csv(GOLDEN_DATA[table_name], dtype=DTYPE)
    assert table_name == "youth_by_race_and_ethnicity_national_current"

    actual_historical_df, _, table_name = mock_historical[0]
    expected_historical_df = pd.read_csv(GOLDEN_DATA[table_name], dtype=DTYPE)
    assert table_name == "youth_by_race_and_ethnicity_national_historical"

    assert mock_bq.call_count == 2

    assert_frame_equal(actual_current_df, expected_current_df, check_like=True)
    assert_frame_equal(actual_historical_df, expected_historical_df, check_like=True)


@mock.patch("ingestion.gcs_to_bq_util.add_df_to_bq", return_value=None)
@mock.patch(
    "ingestion.gcs_to_bq_util.load_public_dataset_from_bigquery_as_df",
    side_effect=_load_public_dataset_from_bigquery_as_df,
)
@mock.patch(
    "ingestion.gcs_to_bq_util.load_csv_as_df_from_data_dir",
    side_effect=_load_csv_as_df_from_data_dir,
)
def test_write_to_bq_youth_by_race_state(
    mock_data_dir: mock.MagicMock,
    mock_public_bq: mock.MagicMock,
    mock_bq: mock.MagicMock,
):
    datasource = CDCWisqarsYouthData()
    datasource.write_to_bq(
        "dataset",
        "gcs_bucket",
        demographic=std_col.RACE_OR_HISPANIC_COL,
        geographic=STATE_LEVEL,
    )

    (mock_current, mock_historical) = mock_bq.call_args_list

    actual_current_df, _, table_name = mock_current[0]
    expected_current_df = pd.read_csv(GOLDEN_DATA[table_name], dtype=DTYPE)
    assert table_name == "youth_by_race_and_ethnicity_state_current"

    actual_historical_df, _, table_name = mock_historical[0]
    expected_historical_df = pd.read_csv(GOLDEN_DATA[table_name], dtype=DTYPE)
    assert table_name == "youth_by_race_and_ethnicity_state_historical"

    assert mock_bq.call_count == 2

    assert_frame_equal(actual_current_df, expected_current_df, check_like=True)
    assert_frame_equal(actual_historical_df, expected_historical_df, check_like=True)
