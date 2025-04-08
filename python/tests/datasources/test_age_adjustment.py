# pylint: disable=unused-argument
from unittest import mock
import os
import pandas as pd
from pandas._testing import assert_frame_equal

import datasources.age_adjust_cdc_restricted as age_adjust

from datasources.age_adjust_cdc_restricted import AgeAdjustCDCRestricted

# Current working directory.
THIS_DIR = os.path.dirname(os.path.abspath(__file__))
TEST_DIR = os.path.join(THIS_DIR, os.pardir, "data", "cdc_restricted_age_adjustment")

COVID_DATA_SIMPLE = os.path.join(TEST_DIR, "unit_tests", "race_age_state_simple.json")
COVID_DATA_SIMPLE_TIME_SERIES = os.path.join(TEST_DIR, "unit_tests", "race_age_state_time_series_simple.json")

EXPECTED_DEATHS_JSON = os.path.join(TEST_DIR, "unit_tests", "expected_deaths.json")
EXPECTED_DEATHS_TIME_SERIES_JSON = os.path.join(TEST_DIR, "unit_tests", "expected_deaths_time_series.json")

AGE_ADJUST_JSON = os.path.join(TEST_DIR, "unit_tests", "age_adjusted.json")
AGE_ADJUST_TIME_SERIES_JSON = os.path.join(TEST_DIR, "unit_tests", "age_adjusted_time_series.json")

GOLDEN_INTEGRATION_DATA_STATE = os.path.join(
    TEST_DIR, "cdc_restricted-race_and_ethnicity_state_cumulative-with_age_adjust.json"
)
GOLDEN_INTEGRATION_DATA_NATIONAL = os.path.join(
    TEST_DIR, "cdc_restricted-race_and_ethnicity_national_cumulative-with_age_adjust.json"
)

GOLDEN_INTEGRATION_DATA_STATE_TIME_SERIES = os.path.join(
    TEST_DIR, "cdc_restricted-race_and_ethnicity_state_historical-with_age_adjust.json"
)
GOLDEN_INTEGRATION_DATA_NATIONAL_TIME_SERIES = os.path.join(
    TEST_DIR, "cdc_restricted-race_and_ethnicity_national_historical-with_age_adjust.json"
)


def get_census_pop_estimates_as_df():
    return pd.read_csv(os.path.join(TEST_DIR, "census_pop_estimates.csv"), dtype={"state_fips": str})


def get_mock_df_from_bq_as_df(*args, **kwargs):
    if args[0] == "census_pop_estimates":
        return pd.read_csv(os.path.join(TEST_DIR, "census_pop_estimates.csv"), dtype={"state_fips": str})
    elif args[1] == "race_and_ethnicity_state_cumulative":
        return pd.read_json(
            os.path.join(TEST_DIR, "cdc_restricted-race_and_ethnicity_state_cumulative.json"), dtype={"state_fips": str}
        )
    elif args[1] == "race_and_ethnicity_national_cumulative":
        return pd.read_json(
            os.path.join(TEST_DIR, "cdc_restricted-race_and_ethnicity_national_cumulative.json"),
            dtype={"state_fips": str},
        )
    elif args[1] == "multi_race_age_state":
        return pd.read_json(
            os.path.join(TEST_DIR, "cdc_restricted-multi_race_age_state.json"), dtype={"state_fips": str}
        )
    elif args[1] == "race_and_ethnicity_state_historical":
        return pd.read_json(
            os.path.join(TEST_DIR, "cdc_restricted-race_and_ethnicity_state_historical.json"), dtype={"state_fips": str}
        )
    elif args[1] == "race_and_ethnicity_national_historical":
        return pd.read_json(
            os.path.join(TEST_DIR, "cdc_restricted-race_and_ethnicity_national_historical.json"),
            dtype={"state_fips": str},
        )
    raise ValueError("No dataset for these args")


# "Unit" tests
def testExpectedDeathsAndHospitalizations():
    covid_data = pd.read_json(COVID_DATA_SIMPLE, dtype={"state_fips": str})
    pop_data = get_census_pop_estimates_as_df()

    df = age_adjust.get_expected_col(covid_data, pop_data, "expected_deaths", "death_y")
    df = age_adjust.get_expected_col(df, pop_data, "expected_hosps", "hosp_y")
    expected_df = pd.read_json(EXPECTED_DEATHS_JSON, dtype={"state_fips": str})

    sortby_cols = list(df.columns)
    assert_frame_equal(
        df.sort_values(sortby_cols).reset_index(drop=True),
        expected_df.sort_values(sortby_cols).reset_index(drop=True),
        check_like=True,
    )


def testExpectedDeathsAndHospitalizationsTimeSeries():
    covid_data = pd.read_json(COVID_DATA_SIMPLE_TIME_SERIES, dtype={"state_fips": str})
    pop_data = get_census_pop_estimates_as_df()

    df = age_adjust.get_expected_col(covid_data, pop_data, "expected_deaths", "death_y")
    df = age_adjust.get_expected_col(df, pop_data, "expected_hosps", "hosp_y")
    expected_df = pd.read_json(EXPECTED_DEATHS_TIME_SERIES_JSON, dtype={"state_fips": str})

    sortby_cols = list(df.columns)
    assert_frame_equal(
        df.sort_values(sortby_cols).reset_index(drop=True),
        expected_df.sort_values(sortby_cols).reset_index(drop=True),
        check_like=True,
    )


def testAgeAdjust():
    expected_deaths_df = pd.read_json(EXPECTED_DEATHS_JSON, dtype={"state_fips": str})

    df = age_adjust.age_adjust_from_expected(expected_deaths_df, False)
    expected_df = pd.read_json(AGE_ADJUST_JSON, dtype={"state_fips": str})

    assert_frame_equal(df, expected_df, check_like=True)


def testAgeAdjustTimeSeries():
    expected_deaths_df = pd.read_json(EXPECTED_DEATHS_TIME_SERIES_JSON, dtype={"state_fips": str})

    df = age_adjust.age_adjust_from_expected(expected_deaths_df, True)

    expected_df = pd.read_json(AGE_ADJUST_TIME_SERIES_JSON, dtype={"state_fips": str})

    sortby_cols = list(df.columns)
    assert_frame_equal(
        df.sort_values(by=sortby_cols).reset_index(drop=True),
        expected_df.sort_values(by=sortby_cols).reset_index(drop=True),
        check_like=True,
    )


# Integration tests
@mock.patch("ingestion.gcs_to_bq_util.load_df_from_bigquery", side_effect=get_mock_df_from_bq_as_df)
@mock.patch("ingestion.gcs_to_bq_util.add_df_to_bq", return_value=None)
def testWriteToBqState(mock_bq: mock.MagicMock, mock_df: mock.MagicMock):
    adjust = AgeAdjustCDCRestricted()

    kwargs = {"filename": "test_file.csv", "metadata_table_id": "test_metadata", "table_name": "output_table"}

    adjust.write_to_bq("dataset", "gcs_bucket", **kwargs)
    assert mock_bq.call_count == 4

    expected_df = pd.read_json(
        GOLDEN_INTEGRATION_DATA_STATE,
        dtype={
            "state_fips": str,
            "death_ratio_age_adjusted": float,
        },
    )

    assert_frame_equal(mock_bq.call_args_list[0].args[0], expected_df, check_like=True)


@mock.patch("ingestion.gcs_to_bq_util.load_df_from_bigquery", side_effect=get_mock_df_from_bq_as_df)
@mock.patch("ingestion.gcs_to_bq_util.add_df_to_bq", return_value=None)
def testWriteToBqStateTimeSeries(mock_bq: mock.MagicMock, mock_df: mock.MagicMock):
    adjust = AgeAdjustCDCRestricted()

    kwargs = {"filename": "test_file.csv", "metadata_table_id": "test_metadata", "table_name": "output_table"}

    adjust.write_to_bq("dataset", "gcs_bucket", **kwargs)
    assert mock_bq.call_count == 4

    expected_df = pd.read_json(
        GOLDEN_INTEGRATION_DATA_NATIONAL,
        dtype={
            "state_fips": str,
            "death_ratio_age_adjusted": float,
        },
    )

    assert_frame_equal(mock_bq.call_args_list[1].args[0], expected_df, check_like=True)


@mock.patch("ingestion.gcs_to_bq_util.load_df_from_bigquery", side_effect=get_mock_df_from_bq_as_df)
@mock.patch("ingestion.gcs_to_bq_util.add_df_to_bq", return_value=None)
def testWriteToBqNational(mock_bq: mock.MagicMock, mock_df: mock.MagicMock):
    adjust = AgeAdjustCDCRestricted()

    kwargs = {"filename": "test_file.csv", "metadata_table_id": "test_metadata", "table_name": "output_table"}

    adjust.write_to_bq("dataset", "gcs_bucket", **kwargs)
    assert mock_bq.call_count == 4

    expected_df = pd.read_json(
        GOLDEN_INTEGRATION_DATA_STATE_TIME_SERIES,
        dtype={
            "state_fips": str,
        },
    )

    sortby_cols = list(expected_df.columns)

    assert_frame_equal(
        mock_bq.call_args_list[2].args[0].sort_values(sortby_cols).reset_index(drop=True),
        expected_df.sort_values(sortby_cols).reset_index(drop=True),
        check_like=True,
    )


@mock.patch("ingestion.gcs_to_bq_util.load_df_from_bigquery", side_effect=get_mock_df_from_bq_as_df)
@mock.patch("ingestion.gcs_to_bq_util.add_df_to_bq", return_value=None)
def testWriteToBqNationalTimeSeries(mock_bq: mock.MagicMock, mock_df: mock.MagicMock):
    adjust = AgeAdjustCDCRestricted()

    kwargs = {"filename": "test_file.csv", "metadata_table_id": "test_metadata", "table_name": "output_table"}

    adjust.write_to_bq("dataset", "gcs_bucket", **kwargs)
    assert mock_bq.call_count == 4

    expected_df = pd.read_json(
        GOLDEN_INTEGRATION_DATA_NATIONAL_TIME_SERIES,
        dtype={
            "state_fips": str,
        },
    )

    sortby_cols = list(expected_df.columns)

    assert_frame_equal(
        mock_bq.call_args_list[3].args[0].sort_values(sortby_cols).reset_index(drop=True),
        expected_df.sort_values(sortby_cols).reset_index(drop=True),
        check_like=True,
    )
