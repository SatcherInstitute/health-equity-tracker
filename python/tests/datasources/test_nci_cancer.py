import os
import pandas as pd
from datasources.nci_cancer import NciCancerData
from pandas._testing import assert_frame_equal
from test_utils import _load_csv_as_df_from_real_data_dir
from unittest import mock
import ingestion.standardized_columns as std_col

THIS_DIR = os.path.dirname(os.path.abspath(__file__))
TEST_DIR = os.path.join(THIS_DIR, os.pardir, "data")
GOLDEN_DIR = os.path.join(TEST_DIR, NciCancerData.DIRECTORY, "golden_data")
EXP_DTYPE = {std_col.COUNTY_FIPS_COL: str, std_col.STATE_FIPS_COL: str}

GOLDEN_DATA = {
    "race_and_ethnicity_county_current": os.path.join(GOLDEN_DIR, "race_and_ethnicity_county_current.csv"),
}


@mock.patch("ingestion.gcs_to_bq_util.add_df_to_bq", return_value=None)
@mock.patch("ingestion.gcs_to_bq_util.load_csv_as_df_from_data_dir", side_effect=_load_csv_as_df_from_real_data_dir)
def test_write_to_bq_race_county(mock_csv_data_dir: mock.MagicMock, mock_bq: mock.MagicMock):
    datasource = NciCancerData()
    datasource.write_to_bq("dataset", "gcs_bucket", demographic="race_and_ethnicity", geographic="county")

    assert mock_csv_data_dir.called
    assert mock_bq.call_count == 1

    actual_bq_col_types = mock_bq.call_args_list[0][1]["column_types"]
    assert actual_bq_col_types == {
        std_col.COUNTY_FIPS_COL: "STRING",
        std_col.COUNTY_NAME_COL: "STRING",
        std_col.STATE_FIPS_COL: "STRING",
        std_col.STATE_NAME_COL: "STRING",
        std_col.RACE_OR_HISPANIC_COL: "STRING",
        "cervical_per_100k": "FLOAT64",
        "cervical_estimated_total": "FLOAT64",
        "cervical_per_100k_is_suppressed": "BOOL",
    }

    actual_df, _, table_name = mock_bq.call_args_list[0][0]
    actual_df = actual_df.sort_values([std_col.COUNTY_FIPS_COL, std_col.RACE_OR_HISPANIC_COL]).reset_index(drop=True)
    # actual_df.to_csv(table_name, index=False)

    expected_df = pd.read_csv(GOLDEN_DATA[table_name], dtype=EXP_DTYPE)
    assert table_name == "race_and_ethnicity_county_current"
    assert_frame_equal(actual_df, expected_df, check_like=True)
