import os
from datasources.nci_cancer import NciCancerData, NCI_HEADER_ROWS_TO_SKIP
from pandas._testing import assert_frame_equal
from test_utils import _load_csv_as_df_from_real_data_dir, load_golden_df
from unittest import mock
import ingestion.standardized_columns as std_col

THIS_DIR = os.path.dirname(os.path.abspath(__file__))
GOLDEN_DIR = os.path.join(THIS_DIR, os.pardir, "data", NciCancerData.DIRECTORY, "golden_data")

EXP_DTYPE = {std_col.COUNTY_FIPS_COL: str, std_col.STATE_FIPS_COL: str}


def test_nci_csv_header_row():
    """Fails loudly if NCI changes their file format and adds/removes preamble lines."""
    df = _load_csv_as_df_from_real_data_dir(
        NciCancerData.DIRECTORY,
        f"cervical-{std_col.Race.ALL.name}.csv",
        skiprows=NCI_HEADER_ROWS_TO_SKIP,
    )
    expected_cols = {
        "County",
        "FIPS",
        "Age-Adjusted Incidence Rate([rate note]) - cases per 100,000",
        "Average Annual Count",
    }
    missing = expected_cols - {col.strip() for col in df.columns}
    assert not missing, (
        f"Expected columns not found after skipping {NCI_HEADER_ROWS_TO_SKIP} rows: {missing}. "
        "NCI may have changed their file format — update NCI_HEADER_ROWS_TO_SKIP if so."
    )


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
    assert table_name == "race_and_ethnicity_county_current"
    assert_frame_equal(actual_df, load_golden_df(GOLDEN_DIR, table_name, EXP_DTYPE), check_like=True)
