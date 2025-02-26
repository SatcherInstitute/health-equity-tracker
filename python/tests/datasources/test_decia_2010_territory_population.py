from unittest import mock
from pandas._testing import assert_frame_equal
from datasources.decia_2010_territory_population import Decia2010TerritoryPopulationData
import pandas as pd
import os
import json  # Import the json module

THIS_DIR = os.path.dirname(os.path.abspath(__file__))
TEST_DIR = os.path.join(os.getcwd(), "data")  # TEST_DIR relative to test file
GOLDEN_DIR = os.path.join(TEST_DIR, "decia_2010_territory_population", "golden_data")


def _load_json_as_df_from_data_dir(directory, filename, dtype_dict, **kwargs):  # Mock to load JSON
    print(f"Current working directory (inside mock): {os.getcwd()}")  # Debug print CWD
    file_path = os.path.join(TEST_DIR, directory, filename)  # Construct file_path using TEST_DIR
    print(f"TEST_DIR (absolute): {TEST_DIR}")  # Debug print TEST_DIR
    print(f"Loading JSON file from: {file_path}")  # Debug print loading path
    try:
        with open(file_path, "r") as f:
            json_data = json.load(f)
        df = pd.DataFrame(json_data)
        return df
    except FileNotFoundError:
        print(f"FileNotFoundError: Could not find file at: {file_path}")  # Explicitly print FileNotFoundError path
        raise


# INTEGRATION TESTS
datasource = Decia2010TerritoryPopulationData()
dtypes = {"state_fips": str, "county_fips": str}
# Base kwargs (most are the same for all tests)
base_kwargs = {
    "metadata_table_id": "test_metadata",
    "table_name": "output_table",
}


# @mock.patch("ingestion.gcs_to_bq_util.add_df_to_bq", return_value=None)
# @mock.patch(
#     "ingestion.gcs_to_bq_util.load_json_as_df_from_data_dir", side_effect=_load_json_as_df_from_data_dir
# )  # Mock load_json_as_df_from_data_dir
# def testGenerateAgeTerritory(
#     mock_data_dir: mock.MagicMock,
#     mock_bq: mock.MagicMock,
# ):
#     kwargs = base_kwargs.copy()  # Start with base kwargs
#     kwargs["demographic"] = "age"
#     kwargs["geographic"] = "state"
#     kwargs["filename"] = "decia 2010 territory population-by age territory.json,"  # Comma added here
#     print(f"Current working directory (before write_to_bq): {os.getcwd()}")  # Debug print CWD before write_to_bq
#     datasource.write_to_bq("dataset", "gcs_bucket", **kwargs)
#
#     # loads in 1 file for age
#     assert mock_data_dir.call_count == 1  # Now loading only one file per test
#
#     df, _dataset, table_name = mock_bq.call_args_list[0][0]
#     assert table_name == "age_state_current"
#     golden_file = os.path.join(GOLDEN_DIR, f"{table_name}.csv")
#
#     # Golden data file presence and validity checks:
#     assert os.path.exists(golden_file), f"Golden data file not found: {golden_file}"
#     assert os.path.getsize(golden_file) > 0, f"Golden data file is empty: {golden_file}"
#     try:
#         expected_df = pd.read_csv(golden_file, index_col=False, dtype=dtypes)
#     except Exception as e:
#         raise AssertionError(f"Failed to load golden data file as CSV: {golden_file}. Error: {e}") from e
#
#     assert_frame_equal(df, expected_df, check_dtype=False)
#     df.to_csv(os.path.join(GOLDEN_DIR, f"{table_name}.csv"), index=False)  # for generating golden data
#
#
# @mock.patch("ingestion.gcs_to_bq_util.add_df_to_bq", return_value=None)
# @mock.patch(
#     "ingestion.gcs_to_bq_util.load_json_as_df_from_data_dir", side_effect=_load_json_as_df_from_data_dir
# )  # Mock load_json_as_df_from_data_dir
# def testGenerateRaceTerritory(
#     mock_data_dir: mock.MagicMock,
#     mock_bq: mock.MagicMock,
# ):
#     kwargs = base_kwargs.copy()  # Start with base kwargs
#     kwargs["demographic"] = "race_and_ethnicity"
#     kwargs["geographic"] = "state"
#     kwargs["filename"] = "decia 2010 territory population-by race and ethnicity territory.json,"  # Comma added here
#     print(f"Current working directory (before write_to_bq): {os.getcwd()}")  # Debug print CWD before write_to_bq
#     datasource.write_to_bq("dataset", "gcs_bucket", **kwargs)
#
#     # loads in 1 file for race
#     assert mock_data_dir.call_count == 1  # Now loading only one file per test
#
#     df, _dataset, table_name = mock_bq.call_args_list[0][0]
#     assert table_name == "race_and_ethnicity_state_current"
#     golden_file = os.path.join(GOLDEN_DIR, f"{table_name}.csv")
#
#     # Golden data file presence and validity checks:
#     assert os.path.exists(golden_file), f"Golden data file not found: {golden_file}"
#     assert os.path.getsize(golden_file) > 0, f"Golden data file is empty: {golden_file}"
#     try:
#         expected_df = pd.read_csv(golden_file, index_col=False, dtype=dtypes)
#     except Exception as e:
#         raise AssertionError(f"Failed to load golden data file as CSV: {golden_file}. Error: {e}") from e
#
#     df = df.sort_values(by=["state_fips", "race_category_id"]).reset_index(drop=True)
#     expected_df = expected_df.sort_values(by=["state_fips", "race_category_id"]).reset_index(drop=True)
#
#     assert_frame_equal(df, expected_df, check_dtype=False, check_like=True)
#     df.to_csv(os.path.join(GOLDEN_DIR, f"{table_name}.csv"), index=False)  # for generating golden data
#


@mock.patch("ingestion.gcs_to_bq_util.add_df_to_bq", return_value=None)
@mock.patch(
    "ingestion.gcs_to_bq_util.load_json_as_df_from_data_dir",
    side_effect=lambda directory, filename, dtype_dict, **kwargs: _load_json_as_df_from_data_dir(
        directory, [f.strip() for f in filename.split(",") if f.strip()][0], dtype_dict, **kwargs
    ),
)  # Mock load_json_as_df_from_data_dir with filtering empty filenames
def testGenerateSexTerritory(
    mock_data_dir: mock.MagicMock,
    mock_bq: mock.MagicMock,
):
    kwargs = base_kwargs.copy()  # Start with base kwargs
    kwargs["demographic"] = "sex"
    kwargs["geographic"] = "state"
    # ✅ Keep the trailing comma for write_to_bq
    kwargs["filename"] = "decia_2010_territory_population-by_sex_territory.json,"
    print(f"Current working directory (before write_to_bq): {os.getcwd()}")  # Debug print CWD before write_to_bq
    datasource.write_to_bq("dataset", "gcs_bucket", **kwargs)

    # loads in 1 file for sex
    assert mock_data_dir.call_count == 1  # Now loading only one file per test

    df, _dataset, table_name = mock_bq.call_args_list[0][0]
    assert table_name == "sex_state_current"
    df.to_csv(os.path.join(GOLDEN_DIR, f"{table_name}.csv"), index=False)  # for generating golden data
    golden_file = os.path.join(GOLDEN_DIR, f"{table_name}.csv")

    # Golden data file presence and validity checks:
    assert os.path.exists(golden_file), f"Golden data file not found: {golden_file}"
    assert os.path.getsize(golden_file) > 0, f"Golden data file is empty: {golden_file}"
    try:
        expected_df = pd.read_csv(golden_file, index_col=False, dtype=dtypes)
    except Exception as e:
        raise AssertionError(f"Failed to load golden data file as CSV: {golden_file}. Error: {e}") from e

    assert_frame_equal(df, expected_df, check_dtype=False)
