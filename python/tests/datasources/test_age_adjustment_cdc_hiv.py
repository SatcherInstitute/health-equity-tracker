from unittest import mock
import os
import pandas as pd
from pandas._testing import assert_frame_equal
from datasources.age_adjust_cdc_hiv import AgeAdjustCDCHiv

# Current working directory.
THIS_DIR = os.path.dirname(os.path.abspath(__file__))
TEST_DIR = os.path.join(THIS_DIR, os.pardir, "data", "cdc_hiv_age_adjustment")

GOLDEN_INTEGRATION_DATA_NATIONAL = os.path.join(
    TEST_DIR, "golden_data", "race_and_ethnicity_national_current-with_age_adjust.csv"
)
GOLDEN_INTEGRATION_DATA_STATE = os.path.join(
    TEST_DIR, "golden_data", "race_and_ethnicity_state_current-with_age_adjust.csv"
)


def _load_df_from_bigquery(*args, **kwargs):
    dataset, table_name = args
    print("mocking read of HET COVID tables (pre age-adjusted):", f"{dataset}-{table_name}")
    dtype = kwargs["dtype"]
    race_age_df = pd.read_csv(os.path.join(TEST_DIR, f"{table_name}.csv"), dtype=dtype)

    return race_age_df


# Integration tests
@mock.patch("ingestion.gcs_to_bq_util.add_df_to_bq", return_value=None)
@mock.patch("ingestion.gcs_to_bq_util.load_df_from_bigquery", side_effect=_load_df_from_bigquery)
def testWriteToBq(
    mock_race_age: mock.MagicMock,
    mock_bq: mock.MagicMock,
):
    adjust = AgeAdjustCDCHiv()
    kwargs = {
        "filename": "test_file.csv",
        "metadata_table_id": "test_metadata",
        "table_name": "output_table",
    }

    adjust.write_to_bq("dataset", "gcs_bucket", **kwargs)

    # (RACE/AGE + RACE) X (STATE + NATIONAL)
    assert mock_race_age.call_count == 4
    called_bq_tables = [call[0][1] for call in mock_race_age.call_args_list]
    assert called_bq_tables == [
        "by_race_age_national",
        "race_and_ethnicity_national_current",
        "by_race_age_state",
        "race_and_ethnicity_state_current",
    ]

    # NATIONAL + STATE
    assert mock_bq.call_count == 2

    dtype = {
        "state_fips": str,
        "death_ratio_age_adjusted": float,
    }

    national_df, _national_dataset, national_table_name = mock_bq.call_args_list[0][0]
    assert national_table_name == "race_and_ethnicity_national_current-with_age_adjust"
    expected_national_df = pd.read_csv(GOLDEN_INTEGRATION_DATA_NATIONAL, dtype=dtype, index_col=False)

    assert_frame_equal(national_df, expected_national_df, check_like=True)

    state_df, _state_dataset, state_table_name = mock_bq.call_args_list[1][0]
    assert state_table_name == "race_and_ethnicity_state_current-with_age_adjust"
    expected_state_df = pd.read_csv(GOLDEN_INTEGRATION_DATA_STATE, dtype=dtype, index_col=False)
    assert_frame_equal(state_df, expected_state_df, check_like=True)
