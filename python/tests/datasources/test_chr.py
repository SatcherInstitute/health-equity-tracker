from unittest import mock
from pandas._testing import assert_frame_equal
from datasources.chr import CHRData, CHR_DIR
import pandas as pd
import os
from test_utils import _load_xlsx_as_df_from_real_data_dir

THIS_DIR = os.path.dirname(os.path.abspath(__file__))
TEST_DIR = os.path.join(THIS_DIR, os.pardir, "data")
GOLDEN_DIR = os.path.join(TEST_DIR, CHR_DIR, "golden_data")

GOLDEN_DATA = {
    "race_and_ethnicity_county_current": os.path.join(GOLDEN_DIR, "race_and_ethnicity_county_current.csv"),
}
EXP_DTYPE = {"state_fips": str, "county_fips": str, "time_period": str}


@mock.patch("ingestion.gcs_to_bq_util.add_df_to_bq", return_value=None)
@mock.patch(
    "ingestion.gcs_to_bq_util.load_xlsx_as_df_from_data_dir",
    side_effect=_load_xlsx_as_df_from_real_data_dir,
)
def test_write_to_bq_race_county(
    mock_xlsx_data_dir: mock.MagicMock,
    mock_bq: mock.MagicMock,
):
    datasource = CHRData()
    datasource.write_to_bq("dataset", "gcs_bucket", demographic="race")

    assert mock_xlsx_data_dir.call_count == 2

    # calls writing COUNTY CURRENT to bq
    assert mock_bq.call_count == 1

    actual_current_df, _, table_name = mock_bq.call_args_list[0][0]
    expected_current_df = pd.read_csv(GOLDEN_DATA[table_name], dtype=EXP_DTYPE)
    assert table_name == "race_and_ethnicity_county_current"
    # actual_current_df.to_csv(table_name, index=False)

    assert_frame_equal(
        actual_current_df,
        expected_current_df,
        check_like=True,
    )
