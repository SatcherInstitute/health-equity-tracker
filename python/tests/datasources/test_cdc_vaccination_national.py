from unittest import mock
import os
import pandas as pd
from pandas._testing import assert_frame_equal
from datasources.cdc_vaccination_national import CDCVaccinationNational

# Current working directory.
THIS_DIR = os.path.dirname(os.path.abspath(__file__))
TEST_DIR = os.path.join(THIS_DIR, os.pardir, "data", "cdc_vaccination_national")
GOLDEN_DIR = os.path.join(TEST_DIR, "golden_data")

GOLDEN_DATA = {
    "race": os.path.join(GOLDEN_DIR, "race_and_ethnicity_national_current.csv"),
    "sex": os.path.join(GOLDEN_DIR, "sex_national_current.csv"),
    "age": os.path.join(GOLDEN_DIR, "age_national_current.csv"),
}


def get_state_test_data_as_df():
    return pd.read_json(
        os.path.join(TEST_DIR, "cdc_vaccination_national_test.json"),
        dtype={"state_fips": str, "administered_dose1_pct": float, "administered_dose1": float},
    )


@mock.patch(
    "ingestion.gcs_to_bq_util.load_json_as_df_from_web",
    return_value=get_state_test_data_as_df(),
)
@mock.patch("ingestion.gcs_to_bq_util.add_df_to_bq", return_value=None)
def testWriteToBqRace(mock_bq: mock.MagicMock, mock_csv: mock.MagicMock):
    cdcVaccination = CDCVaccinationNational()

    kwargs = {
        "filename": "test_file.csv",
        "metadata_table_id": "test_metadata",
        "table_name": "output_table",
    }

    cdcVaccination.write_to_bq("dataset", "gcs_bucket", **kwargs)

    assert mock_csv.call_count == 1
    assert mock_bq.call_count == 3

    expected_df = pd.read_csv(GOLDEN_DATA["race"], dtype={"population_pct": str, "state_fips": str})

    df, _, table_name = mock_bq.call_args_list[0][0]
    assert table_name == "race_national_current"

    assert_frame_equal(
        df,
        expected_df,
        check_like=True,
    )


@mock.patch(
    "ingestion.gcs_to_bq_util.load_json_as_df_from_web",
    return_value=get_state_test_data_as_df(),
)
@mock.patch("ingestion.gcs_to_bq_util.add_df_to_bq", return_value=None)
def testWriteToBqSex(mock_bq: mock.MagicMock, mock_csv: mock.MagicMock):
    cdcVaccination = CDCVaccinationNational()

    kwargs = {
        "filename": "test_file.csv",
        "metadata_table_id": "test_metadata",
        "table_name": "output_table",
    }

    cdcVaccination.write_to_bq("dataset", "gcs_bucket", **kwargs)
    assert mock_csv.call_count == 1
    assert mock_bq.call_count == 3

    expected_df = pd.read_csv(GOLDEN_DATA["sex"], dtype={"population_pct": str, "state_fips": str})

    df, _, table_name = mock_bq.call_args_list[1][0]
    assert table_name == "sex_national_current"

    assert_frame_equal(
        df,
        expected_df,
        check_like=True,
    )


@mock.patch(
    "ingestion.gcs_to_bq_util.load_json_as_df_from_web",
    return_value=get_state_test_data_as_df(),
)
@mock.patch("ingestion.gcs_to_bq_util.add_df_to_bq", return_value=None)
def testWriteToBqAge(mock_bq: mock.MagicMock, mock_csv: mock.MagicMock):
    cdcVaccination = CDCVaccinationNational()

    kwargs = {
        "filename": "test_file.csv",
        "metadata_table_id": "test_metadata",
        "table_name": "output_table",
    }

    cdcVaccination.write_to_bq("dataset", "gcs_bucket", **kwargs)
    assert mock_csv.call_count == 1
    assert mock_bq.call_count == 3

    expected_df = pd.read_csv(GOLDEN_DATA["age"], dtype={"vaccinated_pop_pct": str, "state_fips": str})

    df, _, table_name = mock_bq.call_args_list[2][0]
    assert table_name == "age_national_current"

    assert_frame_equal(
        df,
        expected_df,
        check_like=True,
    )
