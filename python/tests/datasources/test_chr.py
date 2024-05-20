from unittest import mock

# from pandas._testing import assert_frame_equal
from datasources.chr import CHRData
import pandas as pd
import os

SOURCE_DIR = "chr"

THIS_DIR = os.path.dirname(os.path.abspath(__file__))
TEST_DIR = os.path.join(THIS_DIR, os.pardir, "data")
GOLDEN_DIR = os.path.join(TEST_DIR, SOURCE_DIR, "golden_data")

GOLDEN_DATA = {
    "race_county_current": os.path.join(GOLDEN_DIR, "race_county_current.csv"),
}

EXP_DTYPE = {"state_fips": str, "county_fips": str, "time_period": str}


def _load_csv_as_df_from_data_dir(*args):
    directory, filename = args

    print("MOCKING FILE READ:", directory, filename)
    df = pd.read_csv(
        os.path.join(TEST_DIR, directory, filename),
    )
    return df


@mock.patch("ingestion.gcs_to_bq_util.add_df_to_bq", return_value=None)
@mock.patch(
    "ingestion.gcs_to_bq_util.load_csv_as_df_from_data_dir",
    side_effect=_load_csv_as_df_from_data_dir,
)
def test_write_to_bq_race_national(
    mock_data_dir: mock.MagicMock,
    mock_bq: mock.MagicMock,
):
    datasource = CHRData()
    datasource.write_to_bq("dataset", "gcs_bucket", demographic="race", geographic="national")

    assert mock_data_dir.call_count == 1

    assert mock_bq.call_count == 0
    # (
    #     mock_bq_race_age_national,
    #     mock_bq_race_national_current,
    #     mock_bq_race_national_historical,
    # ) = mock_bq.call_args_list
