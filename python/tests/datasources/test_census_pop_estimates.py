from unittest import mock
import os
import pandas as pd
from pandas._testing import assert_frame_equal
from datasources.census_pop_estimates import CensusPopEstimates, generate_national_pop_data
import ingestion.standardized_columns as std_col
from test_utils import load_golden_df

THIS_DIR = os.path.dirname(os.path.abspath(__file__))
GOLDEN_DIR = os.path.join(THIS_DIR, os.pardir, "data", "census_pop_estimates", "golden_data")
DATA_DIR = os.path.join(THIS_DIR, os.pardir, "data", "census_pop_estimates")


@mock.patch(
    "ingestion.gcs_to_bq_util.load_csv_as_df",
    return_value=pd.read_csv(os.path.join(DATA_DIR, "census_pop_estimates.csv"), dtype={"STATE": str}),
)
@mock.patch("ingestion.gcs_to_bq_util.add_df_to_bq", return_value=None)
def testWriteToBq(mock_bq: mock.MagicMock, mock_csv: mock.MagicMock):
    censusPopEstimates = CensusPopEstimates()
    censusPopEstimates.write_to_bq(
        "dataset", "gcs_bucket", filename="test_file.csv", metadata_table_id="test_metadata", table_name="output_table"
    )

    assert mock_csv.call_count == 1
    assert mock_bq.call_count == 1

    actual_df, _, table_name = mock_bq.call_args_list[0].args
    # Note: the datasource logic internally determines the table name suffix
    assert table_name == "race_and_ethnicity"
    expected_df = load_golden_df(GOLDEN_DIR, "race_ethnicity_age_state", {"state_fips": str})
    assert_frame_equal(actual_df, expected_df, check_like=True)


def testGenerateNationalPopData():
    state_df = load_golden_df(GOLDEN_DIR, "race_ethnicity_age_state", {"state_fips": str})
    national_df = load_golden_df(GOLDEN_DIR, "race_ethnicity_age_national", {"state_fips": str})

    states_to_include = state_df[std_col.STATE_FIPS_COL].drop_duplicates().to_list()
    df = generate_national_pop_data(state_df, states_to_include)
    assert_frame_equal(df, national_df, check_like=True)
