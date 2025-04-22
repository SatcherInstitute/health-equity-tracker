from unittest import mock
import os
import pandas as pd
from pandas._testing import assert_frame_equal
from datasources.maternal_mortality import MaternalMortalityData
from test_utils import _load_csv_as_df_from_real_data_dir

THIS_DIR = os.path.dirname(os.path.abspath(__file__))
TEST_DIR = os.path.join(THIS_DIR, os.pardir, "data", "maternal_mortality")

GOLDEN_DIR = os.path.join(TEST_DIR, "golden_data")
GOLDEN_DATA_RACE_STATE_HISTORICAL = os.path.join(
    GOLDEN_DIR, "maternal_mortality_output_race_and_ethnicity_state_historical.csv"
)

GOLDEN_DATA_RACE_NATIONAL_HISTORICAL = os.path.join(
    GOLDEN_DIR, "maternal_mortality_output_race_and_ethnicity_national_historical.csv"
)

GOLDEN_DATA_RACE_STATE_CURRENT = os.path.join(
    GOLDEN_DIR, "maternal_mortality_output_race_and_ethnicity_state_current.csv"
)

GOLDEN_DATA_RACE_NATIONAL_CURRENT = os.path.join(
    GOLDEN_DIR, "maternal_mortality_output_race_and_ethnicity_national_current.csv"
)


@mock.patch(
    "ingestion.gcs_to_bq_util.load_tsv_as_df_from_data_dir",
    side_effect=_load_csv_as_df_from_real_data_dir,
)
@mock.patch(
    "ingestion.gcs_to_bq_util.load_csv_as_df_from_data_dir",
    side_effect=_load_csv_as_df_from_real_data_dir,
)
@mock.patch("ingestion.gcs_to_bq_util.add_df_to_bq", return_value=None)
def testWriteToBq(mock_bq: mock.MagicMock, mock_csv: mock.MagicMock, mock_tsv: mock.MagicMock):
    datasource = MaternalMortalityData()

    kwargs = {
        "filename": "test_file.csv",
        "metadata_table_id": "test_metadata",
        "table_name": "output_table",
    }

    datasource.write_to_bq("dataset", "gcs_bucket", **kwargs)

    assert mock_csv.call_count == 2  # calls to JAMA main table and manual counts
    assert mock_tsv.call_count == 1  # call to CDC Natality counts at state level

    df_state_historical, _, table_name = mock_bq.call_args_list[0][0]
    # df_state_historical.to_csv(table_name, index=False)
    assert table_name == "race_and_ethnicity_state_historical"

    expected_state_historical_df = pd.read_csv(
        GOLDEN_DATA_RACE_STATE_HISTORICAL, dtype={"state_fips": str, "time_period": str}
    )
    assert_frame_equal(df_state_historical, expected_state_historical_df, check_like=True, check_dtype=False)

    df_state_current, _, table_name = mock_bq.call_args_list[1][0]
    # df_state_current.to_csv(table_name, index=False)
    assert table_name == "race_and_ethnicity_state_current"

    expected_state_current_df = pd.read_csv(GOLDEN_DATA_RACE_STATE_CURRENT, dtype={"state_fips": str})
    assert_frame_equal(df_state_current, expected_state_current_df, check_like=True, check_dtype=False)

    df_national_historical, _, table_name = mock_bq.call_args_list[2][0]
    # df_national_historical.to_csv(table_name, index=False)
    assert table_name == "race_and_ethnicity_national_historical"

    expected_national_historical_df = pd.read_csv(
        GOLDEN_DATA_RACE_NATIONAL_HISTORICAL, dtype={"state_fips": str, "time_period": str}
    )
    assert_frame_equal(df_national_historical, expected_national_historical_df, check_like=True, check_dtype=False)

    df_national_current, _, table_name = mock_bq.call_args_list[3][0]
    # df_national_current.to_csv(table_name, index=False)
    assert table_name == "race_and_ethnicity_national_current"

    expected_national_current_df = pd.read_csv(GOLDEN_DATA_RACE_NATIONAL_CURRENT, dtype={"state_fips": str})
    assert_frame_equal(df_national_current, expected_national_current_df, check_like=True, check_dtype=False)
