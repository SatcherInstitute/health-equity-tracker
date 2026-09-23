from unittest import mock
import os
import pandas as pd
from pandas._testing import assert_frame_equal
from datasources.cdc_restricted import CDCRestrictedData  # type: ignore

# Current working directory.
THIS_DIR = os.path.dirname(os.path.abspath(__file__))
TEST_DIR = os.path.join(THIS_DIR, os.pardir, "data", "cdc_restricted")

GOLDEN_DATA_BY_SEX_STATE_HISTORICAL = os.path.join(TEST_DIR, "golden_data", "sex_state_historical.json")
GOLDEN_DATA_BY_SEX_COUNTY_HISTORICAL = os.path.join(TEST_DIR, "golden_data", "sex_county_historical.json")
GOLDEN_DATA_BY_SEX_NATIONAL_HISTORICAL = os.path.join(TEST_DIR, "golden_data", "sex_national_historical.json")
GOLDEN_DATA_BY_SEX_STATE_CUMULATIVE = os.path.join(TEST_DIR, "golden_data", "sex_state_cumulative.json")
GOLDEN_DATA_BY_SEX_COUNTY_CUMULATIVE = os.path.join(TEST_DIR, "golden_data", "sex_county_cumulative.json")
GOLDEN_DATA_BY_SEX_NATIONAL_CUMULATIVE = os.path.join(TEST_DIR, "golden_data", "sex_national_cumulative.json")


def get_cdc_numbers_as_df(*args, **kwargs):

    print("KWARGS: ", kwargs)

    if args[1] == "cdc_restricted_by_race_and_age_state.csv":
        # We dont test this, just need to return something here
        return pd.read_csv(
            os.path.join(TEST_DIR, "cdc_restricted_by_sex_state.csv"),
            dtype={
                "state_fips": str,
            },
        )

    return pd.read_csv(
        os.path.join(TEST_DIR, args[1]),
        dtype={
            "state_fips": str,
            "county_fips": str,
        },
    )


def get_cdc_restricted_by_sex_state_as_df():
    return pd.read_csv(
        os.path.join(TEST_DIR, "cdc_restricted_by_sex_state.csv"),
        dtype={
            "state_fips": str,
        },
    )


def get_cdc_restricted_by_sex_county_as_df():
    return pd.read_csv(
        os.path.join(TEST_DIR, "cdc_restricted_by_sex_county.csv"),
        dtype={
            "state_fips": str,
            "county_fips": str,
        },
    )


def testGenerateBreakdownDropsPartialMonth():
    cdc_restricted = CDCRestrictedData()

    sex_vals = ["All", "Male", "Female", "Unknown"]
    months = ["2020-01", "2021-01", "2022-01"]
    rows = []
    for month in months:
        for sex in sex_vals:
            rows.append(
                {
                    "state_postal": "CA",
                    "time_period": month,
                    "sex": sex,
                    "cases": 10,
                    "hosp_y": 1,
                    "hosp_n": 5,
                    "hosp_unknown": 0,
                    "death_y": 0,
                    "death_n": 5,
                    "death_unknown": 0,
                }
            )
    three_months = pd.DataFrame(rows)

    df = cdc_restricted.generate_breakdown(three_months, "sex", "state", True)

    assert "2022-01" not in df["time_period"].values, "Most recent (partial) month should be dropped"
    assert "2020-01" in df["time_period"].values, "Earlier months should be preserved"
    assert "2021-01" in df["time_period"].values, "Earlier months should be preserved"

    # Cumulative (non-time-series) does not have a time_period column — no drop applied
    df_cumulative = cdc_restricted.generate_breakdown(three_months, "sex", "state", False)
    assert "time_period" not in df_cumulative.columns, "Cumulative output should not have time_period column"


def testGenerateBreakdownSexStateTimeSeries():
    cdc_restricted = CDCRestrictedData()

    df = cdc_restricted.generate_breakdown(get_cdc_restricted_by_sex_state_as_df(), "sex", "state", True)
    # pylint: disable=no-member
    expected_df = pd.read_json(
        GOLDEN_DATA_BY_SEX_STATE_HISTORICAL,
        dtype={
            "state_fips": str,
            "covid_cases_share": float,
            "covid_hosp_share": float,
            "covid_deaths_share": float,
        },
    )

    sortby_cols = list(df.columns)

    # df.to_json(GOLDEN_DATA_BY_SEX_STATE_HISTORICAL, orient="records")
    assert_frame_equal(
        df.sort_values(by=sortby_cols).reset_index(drop=True),
        expected_df.sort_values(by=sortby_cols).reset_index(drop=True),
        check_like=True,
    )


def testGenerateBreakdownSexCountyTimeSeries():
    cdc_restricted = CDCRestrictedData()

    df = cdc_restricted.generate_breakdown(get_cdc_restricted_by_sex_county_as_df(), "sex", "county", True)

    # pylint: disable=no-member
    expected_df = pd.read_json(
        GOLDEN_DATA_BY_SEX_COUNTY_HISTORICAL,
        dtype={
            "state_fips": str,
            "county_fips": str,
            "covid_cases_share": float,
            "covid_hosp_share": float,
            "covid_deaths_share": float,
        },
    )

    sortby_cols = list(df.columns)

    # df.to_json(GOLDEN_DATA_BY_SEX_COUNTY_HISTORICAL, orient="records")
    assert_frame_equal(
        df.sort_values(by=sortby_cols).reset_index(drop=True),
        expected_df.sort_values(by=sortby_cols).reset_index(drop=True),
        check_like=True,
    )


def testGenerateBreakdownSexNationalTimeSeries():
    cdc_restricted = CDCRestrictedData()

    df = cdc_restricted.generate_breakdown(get_cdc_restricted_by_sex_state_as_df(), "sex", "national", True)

    # pylint: disable=no-member
    expected_df = pd.read_json(
        GOLDEN_DATA_BY_SEX_NATIONAL_HISTORICAL,
        dtype={
            "state_fips": str,
            "covid_cases_share": float,
            "covid_hosp_share": float,
            "covid_deaths_share": float,
        },
    )

    sortby_cols = list(df.columns)

    # df.to_json(GOLDEN_DATA_BY_SEX_NATIONAL_HISTORICAL, orient="records")
    assert_frame_equal(
        df.sort_values(by=sortby_cols).reset_index(drop=True),
        expected_df.sort_values(by=sortby_cols).reset_index(drop=True),
        check_like=True,
    )


def testGenerateBreakdownSexStateCumulative():
    cdc_restricted = CDCRestrictedData()

    df = cdc_restricted.generate_breakdown(get_cdc_restricted_by_sex_state_as_df(), "sex", "state", False)

    # pylint: disable=no-member
    expected_df = pd.read_json(
        GOLDEN_DATA_BY_SEX_STATE_CUMULATIVE,
        dtype={
            "state_fips": str,
            "covid_cases_share": float,
            "covid_hosp_share": float,
            "covid_deaths_share": float,
        },
    )

    sortby_cols = list(df.columns)

    assert_frame_equal(
        df.sort_values(by=sortby_cols).reset_index(drop=True),
        expected_df.sort_values(by=sortby_cols).reset_index(drop=True),
        check_like=True,
    )


def testGenerateBreakdownSexNationalCumulative():
    cdc_restricted = CDCRestrictedData()

    df = cdc_restricted.generate_breakdown(get_cdc_restricted_by_sex_state_as_df(), "sex", "national", False)

    # pylint: disable=no-member
    expected_df = pd.read_json(
        GOLDEN_DATA_BY_SEX_NATIONAL_CUMULATIVE,
        dtype={
            "state_fips": str,
            "covid_cases_share": float,
            "covid_hosp_share": float,
            "covid_deaths_share": float,
        },
    )

    sortby_cols = list(df.columns)

    assert_frame_equal(
        df.sort_values(by=sortby_cols).reset_index(drop=True),
        expected_df.sort_values(by=sortby_cols).reset_index(drop=True),
        check_like=True,
    )


def testGenerateBreakdownSexCountyCumulative():
    cdc_restricted = CDCRestrictedData()

    df = cdc_restricted.generate_breakdown(get_cdc_restricted_by_sex_county_as_df(), "sex", "county", False)

    # pylint: disable=no-member
    expected_df = pd.read_json(
        GOLDEN_DATA_BY_SEX_COUNTY_CUMULATIVE,
        dtype={
            "state_fips": str,
            "county_fips": str,
            "covid_cases_share": float,
            "covid_hosp_share": float,
            "covid_deaths_share": float,
        },
    )

    sortby_cols = list(df.columns)

    assert_frame_equal(
        df.sort_values(by=sortby_cols).reset_index(drop=True),
        expected_df.sort_values(by=sortby_cols).reset_index(drop=True),
        check_like=True,
    )


@mock.patch("ingestion.gcs_to_bq_util.load_csv_as_df", side_effect=get_cdc_numbers_as_df)
@mock.patch("ingestion.gcs_to_bq_util.add_df_to_bq", return_value=None)
def testWriteToBqAgeNational(mock_bq: mock.MagicMock, mock_csv: mock.MagicMock):
    cdc_restricted = CDCRestrictedData()

    kwargs = {
        "filename": "test_file.csv",
        "metadata_table_id": "test_metadata",
        "table_name": "output_table",
        "demographic": "age",
        "geographic": "national",
    }
    cdc_restricted.write_to_bq("dataset", "gcs_bucket", **kwargs)

    assert mock_csv.call_count == 1
    assert mock_csv.call_args_list[0].args[1] == "cdc_restricted_by_age_state.csv"

    assert mock_bq.call_count == 2
    assert mock_bq.call_args_list[0].args[2] == "age_national_cumulative"
    assert mock_bq.call_args_list[1].args[2] == "age_national_historical"


@mock.patch("ingestion.gcs_to_bq_util.load_csv_as_df", side_effect=get_cdc_numbers_as_df)
@mock.patch("ingestion.gcs_to_bq_util.add_df_to_bq", return_value=None)
def testWriteToBqAgeState(mock_bq: mock.MagicMock, mock_csv: mock.MagicMock):
    cdc_restricted = CDCRestrictedData()

    kwargs = {
        "filename": "test_file.csv",
        "metadata_table_id": "test_metadata",
        "table_name": "output_table",
        "demographic": "age",
        "geographic": "state",
    }
    cdc_restricted.write_to_bq("dataset", "gcs_bucket", **kwargs)

    assert mock_csv.call_count == 1
    assert mock_csv.call_args_list[0].args[1] == "cdc_restricted_by_age_state.csv"

    assert mock_bq.call_count == 2
    assert mock_bq.call_args_list[0].args[2] == "age_state_cumulative"
    assert mock_bq.call_args_list[1].args[2] == "age_state_historical"


@mock.patch("ingestion.gcs_to_bq_util.load_csv_as_df", side_effect=get_cdc_numbers_as_df)
@mock.patch("ingestion.gcs_to_bq_util.add_df_to_bq", return_value=None)
def testWriteToBqAgeCounty(mock_bq: mock.MagicMock, mock_csv: mock.MagicMock):
    cdc_restricted = CDCRestrictedData()

    kwargs = {
        "filename": "test_file.csv",
        "metadata_table_id": "test_metadata",
        "table_name": "output_table",
        "demographic": "age",
        "geographic": "county",
    }
    cdc_restricted.write_to_bq("dataset", "gcs_bucket", **kwargs)

    assert mock_csv.call_count == 1
    assert mock_csv.call_args_list[0].args[1] == "cdc_restricted_by_age_county.csv"

    assert mock_bq.call_count == 2
    assert mock_bq.call_args_list[0].args[2] == "age_county_cumulative"
    assert mock_bq.call_args_list[1].args[2] == "age_county_historical"


@mock.patch("ingestion.gcs_to_bq_util.load_csv_as_df", side_effect=get_cdc_numbers_as_df)
@mock.patch("ingestion.gcs_to_bq_util.add_df_to_bq", return_value=None)
def testWriteToBqSexCounty(mock_bq: mock.MagicMock, mock_csv: mock.MagicMock):
    cdc_restricted = CDCRestrictedData()

    kwargs = {
        "filename": "test_file.csv",
        "metadata_table_id": "test_metadata",
        "table_name": "output_table",
        "demographic": "sex",
        "geographic": "county",
    }
    cdc_restricted.write_to_bq("dataset", "gcs_bucket", **kwargs)

    assert mock_csv.call_count == 1
    assert mock_csv.call_args_list[0].args[1] == "cdc_restricted_by_sex_county.csv"

    assert mock_bq.call_count == 2
    assert mock_bq.call_args_list[0].args[2] == "sex_county_cumulative"
    assert mock_bq.call_args_list[1].args[2] == "sex_county_historical"


@mock.patch("ingestion.gcs_to_bq_util.load_csv_as_df", side_effect=get_cdc_numbers_as_df)
@mock.patch("ingestion.gcs_to_bq_util.add_df_to_bq", return_value=None)
def testWriteToBqRaceNational(mock_bq: mock.MagicMock, mock_csv: mock.MagicMock):
    cdc_restricted = CDCRestrictedData()

    kwargs = {
        "filename": "test_file.csv",
        "metadata_table_id": "test_metadata",
        "table_name": "output_table",
        "demographic": "race_and_ethnicity",
        "geographic": "national",
    }
    cdc_restricted.write_to_bq("dataset", "gcs_bucket", **kwargs)

    assert mock_csv.call_count == 2
    assert mock_csv.call_args_list[0].args[1] == "cdc_restricted_by_race_state.csv"
    assert mock_csv.call_args_list[1].args[1] == "cdc_restricted_by_race_and_age_state.csv"

    assert mock_bq.call_count == 3
    assert mock_bq.call_args_list[0].args[2] == "race_and_ethnicity_national_cumulative"
    assert mock_bq.call_args_list[1].args[2] == "race_and_ethnicity_national_historical"
    assert mock_bq.call_args_list[2].args[2] == "multi_race_age_state"
