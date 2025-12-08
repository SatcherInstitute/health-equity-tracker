import os
import pandas as pd

from datasources.cdc_miovd import CDCMIOVDData
from pandas._testing import assert_frame_equal
from ingestion.local_pipeline_utils import load_csv_as_df_from_data_dir
from unittest import mock


THIS_DIR = os.path.dirname(os.path.abspath(__file__))
TEST_DIR = os.path.join(THIS_DIR, os.pardir, "data")
GOLDEN_DIR = os.path.join(TEST_DIR, CDCMIOVDData.DIRECTORY, "golden_data")
EXP_DTYPE = {"time_period": str, "county_fips": str, "state_fips": str}

GOLDEN_DATA = {
    "alls_county_current": os.path.join(GOLDEN_DIR, "alls_county_current.csv"),
    "alls_county_historical": os.path.join(GOLDEN_DIR, "alls_county_historical.csv"),
}


@mock.patch("ingestion.gcs_to_bq_util.add_df_to_bq", return_value=None)
@mock.patch("ingestion.gcs_to_bq_util.load_csv_as_df_from_data_dir", side_effect=load_csv_as_df_from_data_dir)
def test_write_to_bq_alls_county(mock_csv_data_dir: mock.MagicMock, mock_bq: mock.MagicMock):
    datasource = CDCMIOVDData()
    datasource.write_to_bq("dataset", "gcs_bucket", demographic="alls", geographic="county")

    assert mock_csv_data_dir.called
    assert mock_bq.call_count == 2

    # current
    actual_current_bq_col_types = mock_bq.call_args_list[0][1]["column_types"]
    assert actual_current_bq_col_types == {
        "state_name": "STRING",
        "county_fips": "STRING",
        "gun_violence_homicide_per_100k_is_suppressed": "BOOL",
        "gun_violence_suicide_per_100k_is_suppressed": "BOOL",
        "state_fips": "STRING",
        "county_name": "STRING",
        "gun_violence_homicide_estimated_total": "FLOAT64",
        "gun_violence_homicide_per_100k": "FLOAT64",
        "gun_violence_suicide_estimated_total": "FLOAT64",
        "gun_violence_suicide_per_100k": "FLOAT64",
    }

    actual_current_df, _, current_table_name = mock_bq.call_args_list[0][0]
    actual_current_df = actual_current_df.sort_values(["county_fips"]).reset_index(drop=True)

    expected_current_df = pd.read_csv(GOLDEN_DATA[current_table_name], dtype=EXP_DTYPE)
    assert current_table_name == "alls_county_current"
    assert_frame_equal(actual_current_df, expected_current_df, check_like=True)
    # actual_current_df.to_csv(current_table_name, index=False)

    # historical
    actual_historical_bq_col_types = mock_bq.call_args_list[1][1]["column_types"]

    assert actual_historical_bq_col_types == {
        "time_period": "STRING",
        "state_name": "STRING",
        "gun_violence_homicide_per_100k": "FLOAT64",
        "county_fips": "STRING",
        "gun_violence_homicide_per_100k_is_suppressed": "BOOL",
        "gun_violence_suicide_per_100k": "FLOAT64",
        "gun_violence_suicide_per_100k_is_suppressed": "BOOL",
        "state_fips": "STRING",
        "county_name": "STRING",
    }

    actual_historical_df, _, historical_table_name = mock_bq.call_args_list[1][0]
    actual_historical_df = actual_historical_df.sort_values(["county_fips"]).reset_index(drop=True)

    expected_historical_df = pd.read_csv(GOLDEN_DATA[historical_table_name], dtype=EXP_DTYPE)
    assert historical_table_name == "alls_county_historical"
    assert_frame_equal(actual_historical_df, expected_historical_df, check_like=True)
    # actual_historical_df.to_csv(historical_table_name, index=False)
