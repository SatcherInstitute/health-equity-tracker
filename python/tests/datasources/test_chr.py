from unittest import mock
from pandas._testing import assert_frame_equal
from datasources.chr import CHRData
import pandas as pd
import os

SOURCE_DIR = "chr"
THIS_DIR = os.path.dirname(os.path.abspath(__file__))
TEST_DIR = os.path.join(THIS_DIR, os.pardir, "data")
GOLDEN_DIR = os.path.join(TEST_DIR, SOURCE_DIR, "golden_data")

GOLDEN_DATA = {
    "race_and_ethnicity_county_current": os.path.join(GOLDEN_DIR, "race_and_ethnicity_county_current.csv"),
}

EXP_DTYPE = {"state_fips": str, "county_fips": str, "time_period": str}


def _load_csv_as_df_from_data_dir(*args, **kwargs):
    directory, filename = args
    filename = "test_" + filename
    use_cols = kwargs["usecols"]
    dtype = kwargs["dtype"]
    skiprows = kwargs["skiprows"]

    print("MOCKING FILE READ:", directory, filename)
    df = pd.read_csv(
        os.path.join(
            TEST_DIR,
            directory,
            filename,
        ),
        usecols=use_cols,
        dtype=dtype,
        skiprows=skiprows,
    )
    return df


@mock.patch("ingestion.gcs_to_bq_util.add_df_to_bq", return_value=None)
@mock.patch(
    "ingestion.gcs_to_bq_util.load_csv_as_df_from_data_dir",
    side_effect=_load_csv_as_df_from_data_dir,
)
def test_write_to_bq_race_county(
    mock_data_dir: mock.MagicMock,
    mock_bq: mock.MagicMock,
):
    datasource = CHRData()
    datasource.write_to_bq("dataset", "gcs_bucket", demographic="race")

    # loading source from data/
    assert mock_data_dir.call_count == 1

    # calls writing COUNTY CURRENT to bq
    assert mock_bq.call_count == 1

    actual_current_df, _, table_name = mock_bq.call_args_list[0][0]
    expected_current_df = pd.read_csv(GOLDEN_DATA[table_name], dtype=EXP_DTYPE)
    assert table_name == "race_and_ethnicity_county_current"
    # actual_current_df.to_csv(table_name, index=False)

    assert_frame_equal(actual_current_df, expected_current_df, check_like=True)
