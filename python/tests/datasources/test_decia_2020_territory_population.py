from unittest import mock
from pandas._testing import assert_frame_equal
from datasources.decia_2020_territory_population import Decia2020TerritoryPopulationData
import pandas as pd
import os
from test_utils import load_golden_df

THIS_DIR = os.path.dirname(os.path.abspath(__file__))
TEST_DIR = os.path.join(THIS_DIR, os.pardir, "data")
GOLDEN_DIR = os.path.join(TEST_DIR, "decia_2020_territory_population", "golden_data")

EXP_DTYPE = {"state_fips": str, "county_fips": str}


def _load_csv_as_df_from_data_dir(*args, **_kwargs):
    directory, filename = args
    return pd.read_csv(os.path.join(TEST_DIR, directory, filename))


datasource = Decia2020TerritoryPopulationData()
kwargs = {"filename": "test_file.csv", "metadata_table_id": "test_metadata", "table_name": "output_table"}


@mock.patch("ingestion.gcs_to_bq_util.add_df_to_bq", return_value=None)
@mock.patch("ingestion.gcs_to_bq_util.load_csv_as_df_from_data_dir", side_effect=_load_csv_as_df_from_data_dir)
def testGenerateAgeTerritory(mock_data_dir: mock.MagicMock, mock_bq: mock.MagicMock):
    kwargs["demographic"] = "age"
    kwargs["geographic"] = "state"
    datasource.write_to_bq("dataset", "gcs_bucket", **kwargs)

    assert mock_data_dir.call_count == 4
    actual_df, _, table_name = mock_bq.call_args_list[0][0]

    assert table_name == "age_state_current"
    expected_df = load_golden_df(GOLDEN_DIR, table_name, EXP_DTYPE)

    assert_frame_equal(actual_df, expected_df, check_dtype=False)


@mock.patch("ingestion.gcs_to_bq_util.add_df_to_bq", return_value=None)
@mock.patch("ingestion.gcs_to_bq_util.load_csv_as_df_from_data_dir", side_effect=_load_csv_as_df_from_data_dir)
def testGenerateRaceTerritory(mock_data_dir: mock.MagicMock, mock_bq: mock.MagicMock):
    kwargs["demographic"] = "race_and_ethnicity"
    kwargs["geographic"] = "state"
    datasource.write_to_bq("dataset", "gcs_bucket", **kwargs)

    assert mock_data_dir.call_count == 4
    actual_df, _, table_name = mock_bq.call_args_list[0][0]

    assert table_name == "race_and_ethnicity_state_current"
    expected_df = load_golden_df(GOLDEN_DIR, table_name, EXP_DTYPE)

    actual_df = actual_df.sort_values(by=["state_fips", "race_category_id"]).reset_index(drop=True)
    expected_df = expected_df.sort_values(by=["state_fips", "race_category_id"]).reset_index(drop=True)

    assert_frame_equal(actual_df, expected_df, check_dtype=False, check_like=True)


@mock.patch("ingestion.gcs_to_bq_util.add_df_to_bq", return_value=None)
@mock.patch("ingestion.gcs_to_bq_util.load_csv_as_df_from_data_dir", side_effect=_load_csv_as_df_from_data_dir)
def testGenerateSexTerritoryCountyEquivalent(mock_data_dir: mock.MagicMock, mock_bq: mock.MagicMock):
    kwargs["demographic"] = "sex"
    kwargs["geographic"] = "county"
    datasource.write_to_bq("dataset", "gcs_bucket", **kwargs)

    assert mock_data_dir.call_count == 4
    actual_df, _, table_name = mock_bq.call_args_list[0][0]

    assert table_name == "sex_county_current"
    expected_df = load_golden_df(GOLDEN_DIR, table_name, EXP_DTYPE)

    assert_frame_equal(actual_df, expected_df, check_dtype=False)
