from unittest import mock
import os
import pandas as pd
from pandas._testing import assert_frame_equal
from datasources.kff_vaccination import KFFVaccination, get_data_url
from test_utils import load_golden_df

# Path Setup
THIS_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(THIS_DIR, os.pardir, "data", "kff_vaccination")
GOLDEN_DIR = os.path.join(DATA_DIR, "golden_data")

EXP_DTYPE = {
    "state_fips": str,
    "vaccinated_pct_share": float,
    "vaccinated_population_pct": float,
    "acs_vaccinated_pop_pct": float,
}


def get_github_file_list_as_df():
    return pd.read_json(os.path.join(DATA_DIR, "github_file_list.json"))


def get_percentage_of_race_test_data_as_df():
    return pd.read_csv(os.path.join(DATA_DIR, "kff_vaccination_percentage_of_race_test.csv"))


def get_pct_share_race_test_data_as_df():
    return pd.read_csv(os.path.join(DATA_DIR, "kff_vaccination_pct_share_race_test.csv"))


def get_state_totals_test_data_as_df():
    return pd.read_csv(
        os.path.join(DATA_DIR, "kff_vaccination_state_totals_test.csv"),
        dtype={"one_dose": str},
    )


def get_kff_population_numbers_as_df():
    return pd.read_csv(os.path.join(DATA_DIR, "kff_vaccination_population.csv"), dtype=str)


@mock.patch(
    "ingestion.gcs_to_bq_util.load_json_as_df_from_web_based_on_key",
    return_value=get_github_file_list_as_df(),
)
def testGetDataUrlPctTotal(mock_json: mock.MagicMock):
    # KFF utility calls this internally to find URLs
    assert mock_json.call_count == 0
    assert get_data_url("pct_total") == "some-up-to-date-url"


@mock.patch(
    "ingestion.gcs_to_bq_util.load_json_as_df_from_web_based_on_key",
    return_value=get_github_file_list_as_df(),
)
def testGetDataUrlPctShare(mock_json: mock.MagicMock):
    assert mock_json.call_count == 0
    assert get_data_url("pct_share") == "some-other-up-to-date-url"


@mock.patch(
    "ingestion.gcs_to_bq_util.load_json_as_df_from_web_based_on_key",
    return_value=get_github_file_list_as_df(),
)
@mock.patch(
    "ingestion.gcs_to_bq_util.load_csv_as_df_from_web",
    return_value=get_state_totals_test_data_as_df(),
)
@mock.patch("ingestion.github_util.decode_json_from_url_into_df")
@mock.patch("ingestion.gcs_to_bq_util.add_df_to_bq", return_value=None)
def testWriteToBq(
    mock_bq: mock.MagicMock,
    mock_decode_github: mock.MagicMock,
    mock_csv_web: mock.MagicMock,
    mock_json_web: mock.MagicMock,
):
    # Set up the side effect for the various CSV loads KFF performs
    mock_decode_github.side_effect = [
        get_percentage_of_race_test_data_as_df(),
        get_pct_share_race_test_data_as_df(),
        get_kff_population_numbers_as_df(),
    ]

    kffVaccination = KFFVaccination()

    kwargs = {
        "filename": "test_file.csv",
        "metadata_table_id": "test_metadata",
        "table_name": "output_table",
    }

    kffVaccination.write_to_bq("dataset", "gcs_bucket", **kwargs)

    # Check mock call counts
    assert mock_json_web.call_count == 3
    assert mock_csv_web.call_count == 1
    assert mock_bq.call_count == 1

    # Extract and assert table name from BQ call
    actual_df, _dataset, table_name = mock_bq.call_args_list[0].args
    assert table_name == "race_and_ethnicity_state_current"

    # Load golden data using the asserted table name
    expected_df = load_golden_df(GOLDEN_DIR, table_name, EXP_DTYPE)

    assert_frame_equal(actual_df, expected_df, check_like=True)
