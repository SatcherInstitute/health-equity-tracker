from unittest import mock
from pandas._testing import assert_frame_equal
from datasources.cdc_hiv_black_women import CDCHIVBlackWomenData, HIV_DIRECTORY
from ingestion.cdc_hiv_utils import DTYPE, NA_VALUES
import pandas as pd
import os

THIS_DIR = os.path.dirname(os.path.abspath(__file__))
TEST_DIR = os.path.join(THIS_DIR, os.pardir, "data")
GOLDEN_DIR = os.path.join(TEST_DIR, HIV_DIRECTORY, "golden_data")

GOLDEN_DATA = {
    "black_women_national_current": os.path.join(GOLDEN_DIR, "black_women_by_age_national_current.csv"),
    "black_women_national_historical": os.path.join(GOLDEN_DIR, "black_women_by_age_national_historical.csv"),
    "black_women_state_current": os.path.join(GOLDEN_DIR, "black_women_by_age_state_current.csv"),
    "black_women_state_historical": os.path.join(GOLDEN_DIR, "black_women_by_age_state_historical.csv"),
}

EXP_DTYPE = {"state_fips": str, "county_fips": str, "time_period": str}


def _load_csv_as_df_from_data_dir(*args, **kwargs):
    directory, filename = args
    subdirectory = kwargs["subdirectory"]

    print("MOCKING FILE READ:", directory, subdirectory, filename)
    usecols = kwargs["usecols"]
    df = pd.read_csv(
        os.path.join(TEST_DIR, directory, subdirectory, filename),
        dtype=DTYPE,
        na_values=NA_VALUES,
        usecols=usecols,
        thousands=",",
    )
    return df


@mock.patch("ingestion.gcs_to_bq_util.add_df_to_bq", return_value=None)
@mock.patch("ingestion.gcs_to_bq_util.load_csv_as_df_from_data_dir", side_effect=_load_csv_as_df_from_data_dir)
def test_write_to_bq_black_women_national(mock_data_dir: mock.MagicMock, mock_bq: mock.MagicMock):
    datasource = CDCHIVBlackWomenData()
    datasource.write_to_bq("dataset", "gcs_bucket", demographic="black_women", geographic="national")

    assert mock_data_dir.call_count == 6

    assert mock_bq.call_count == 2

    (mock_bq_black_women_national_current, mock_bq_black_women_national_historical) = mock_bq.call_args_list
    (black_women_national_current_df, _dataset, table_name), _col_types = mock_bq_black_women_national_current

    assert table_name == "black_women_by_age_national_current"
    expected_black_women_national_current_df = pd.read_csv(GOLDEN_DATA["black_women_national_current"], dtype=EXP_DTYPE)

    assert_frame_equal(
        black_women_national_current_df.sort_values(by=["age"]).reset_index(drop=True),
        expected_black_women_national_current_df.sort_values(by=["age"]).reset_index(drop=True),
        check_like=True,
    )

    (black_women_national_historical_df, _dataset, table_name), _col_types = mock_bq_black_women_national_historical

    assert table_name == "black_women_by_age_national_historical"
    expected_black_women_national_historical_df = pd.read_csv(
        GOLDEN_DATA["black_women_national_historical"], dtype=EXP_DTYPE
    )

    assert_frame_equal(
        black_women_national_historical_df.sort_values(by=["time_period", "age"]).reset_index(drop=True),
        expected_black_women_national_historical_df.sort_values(by=["time_period", "age"]).reset_index(drop=True),
        check_like=True,
    )


@mock.patch("ingestion.gcs_to_bq_util.add_df_to_bq", return_value=None)
@mock.patch("ingestion.gcs_to_bq_util.load_csv_as_df_from_data_dir", side_effect=_load_csv_as_df_from_data_dir)
def test_write_to_bq_black_women_state(mock_data_dir: mock.MagicMock, mock_bq: mock.MagicMock):
    datasource = CDCHIVBlackWomenData()
    datasource.write_to_bq("dataset", "gcs_bucket", demographic="black_women", geographic="state")

    assert mock_data_dir.call_count == 6

    assert mock_bq.call_count == 2

    (mock_bq_black_women_state_current, mock_bq_black_women_state_historical) = mock_bq.call_args_list
    (black_women_state_current_df, _dataset, table_name), _col_types = mock_bq_black_women_state_current

    assert table_name == "black_women_by_age_state_current"
    black_women_state_current_df.sort_values(by=["state_name", "age"]).reset_index(drop=True).to_csv(
        "black_women_state_current_df.csv", index=False
    )
    expected_black_women_state_current_df = pd.read_csv(GOLDEN_DATA["black_women_state_current"], dtype=EXP_DTYPE)

    assert_frame_equal(
        black_women_state_current_df.sort_values(by=["state_name", "age"]).reset_index(drop=True),
        expected_black_women_state_current_df.sort_values(by=["state_name", "age"]).reset_index(drop=True),
        check_like=True,
    )

    (black_women_state_historical_df, _dataset, table_name), _col_types = mock_bq_black_women_state_historical

    assert table_name == "black_women_by_age_state_historical"
    black_women_state_historical_df.sort_values(by=["time_period", "state_name", "age"]).reset_index(drop=True).to_csv(
        "black_women_by_age_state_historical.csv", index=False
    )
    expected_black_women_state_historical_df = pd.read_csv(GOLDEN_DATA["black_women_state_historical"], dtype=EXP_DTYPE)

    assert_frame_equal(
        black_women_state_historical_df.sort_values(by=["time_period", "state_name", "age"]).reset_index(drop=True),
        expected_black_women_state_historical_df.sort_values(by=["time_period", "state_name", "age"]).reset_index(
            drop=True
        ),
        check_like=True,
    )
