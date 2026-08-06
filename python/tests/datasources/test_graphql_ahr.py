import json
import os
import pandas as pd
import pytest
from datasources.graphql_ahr import GraphQlAHRData, ADULT_AGE_GROUPS_18PLUS, parse_raw_data, AGE_GROUPS_TO_STANDARD
from ingestion import standardized_columns as std_col
from ingestion.constants import ALL_VALUE
from ingestion.standardized_columns import STATE_FIPS_COL
from pandas._testing import assert_frame_equal
from unittest import mock
from test_utils import load_golden_df

# Path Setup
THIS_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(THIS_DIR, os.pardir, "data", "graphql_ahr")
GOLDEN_DIR = os.path.join(DATA_DIR, "golden_data")

EXP_DTYPE = {STATE_FIPS_COL: str, "time_period": str}


def _fetch_ahr_data_from_graphql(demographic: str, geo_level: str, category: str):
    """Mocks the GraphQL API response by loading local JSON files."""
    file_path = os.path.join(DATA_DIR, f"{category}_{demographic}_{geo_level}_response.json")
    with open(file_path, "r", encoding="utf-8") as file:
        return json.load(file)


@mock.patch("ingestion.gcs_to_bq_util.add_df_to_bq", return_value=None)
@mock.patch("datasources.graphql_ahr.fetch_ahr_data_from_graphql", side_effect=_fetch_ahr_data_from_graphql)
def testWriteToBqBehavioralHealthAgeNational(_mock_fetch: mock.MagicMock, mock_add_df_to_bq: mock.MagicMock):
    datasource = GraphQlAHRData()
    datasource.write_to_bq(
        "dataset", "gcs_bucket", demographic="age", geographic="national", category="behavioral_health"
    )

    assert mock_add_df_to_bq.call_count == 2

    # Verify Current Table
    actual_df, _, table_name = mock_add_df_to_bq.call_args_list[0][0]
    assert table_name == "behavioral_health_age_national_current"
    expected_df = load_golden_df(GOLDEN_DIR, table_name, EXP_DTYPE)
    assert_frame_equal(actual_df, expected_df, check_like=True)

    # Verify Historical Table
    actual_df, _, table_name = mock_add_df_to_bq.call_args_list[1][0]
    assert table_name == "behavioral_health_age_national_historical"
    expected_df = load_golden_df(GOLDEN_DIR, table_name, EXP_DTYPE)
    assert_frame_equal(actual_df, expected_df, check_like=True)


@mock.patch("ingestion.gcs_to_bq_util.add_df_to_bq", return_value=None)
@mock.patch("datasources.graphql_ahr.fetch_ahr_data_from_graphql", side_effect=_fetch_ahr_data_from_graphql)
def testWriteToBqNonBehavioralHealthAgeNational(_mock_fetch: mock.MagicMock, mock_add_df_to_bq: mock.MagicMock):
    datasource = GraphQlAHRData()
    datasource.write_to_bq(
        "dataset", "gcs_bucket", demographic="age", geographic="national", category="non-behavioral_health"
    )

    assert mock_add_df_to_bq.call_count == 2

    actual_df, _, table_name = mock_add_df_to_bq.call_args_list[0][0]
    assert table_name == "non-behavioral_health_age_national_current"
    expected_df = load_golden_df(GOLDEN_DIR, table_name, EXP_DTYPE)
    assert_frame_equal(actual_df, expected_df, check_like=True)

    actual_df, _, table_name = mock_add_df_to_bq.call_args_list[1][0]
    assert table_name == "non-behavioral_health_age_national_historical"
    expected_df = load_golden_df(GOLDEN_DIR, table_name, EXP_DTYPE)
    assert_frame_equal(actual_df, expected_df, check_like=True)


@mock.patch("ingestion.gcs_to_bq_util.add_df_to_bq", return_value=None)
@mock.patch("datasources.graphql_ahr.fetch_ahr_data_from_graphql", side_effect=_fetch_ahr_data_from_graphql)
def testWriteToBqBehavioralHealthRaceState(_mock_fetch: mock.MagicMock, mock_add_df_to_bq: mock.MagicMock):
    datasource = GraphQlAHRData()
    datasource.write_to_bq(
        "dataset", "gcs_bucket", demographic="race_and_ethnicity", geographic="state", category="behavioral_health"
    )

    assert mock_add_df_to_bq.call_count == 2

    actual_df, _, table_name = mock_add_df_to_bq.call_args_list[0][0]
    assert table_name == "behavioral_health_race_and_ethnicity_state_current"
    expected_df = load_golden_df(GOLDEN_DIR, table_name, EXP_DTYPE)
    assert_frame_equal(actual_df, expected_df, check_like=True)

    actual_df, _, table_name = mock_add_df_to_bq.call_args_list[1][0]
    assert table_name == "behavioral_health_race_and_ethnicity_state_historical"
    expected_df = load_golden_df(GOLDEN_DIR, table_name, EXP_DTYPE)
    assert_frame_equal(actual_df, expected_df, check_like=True)


@mock.patch("ingestion.gcs_to_bq_util.add_df_to_bq", return_value=None)
@mock.patch("datasources.graphql_ahr.fetch_ahr_data_from_graphql", side_effect=_fetch_ahr_data_from_graphql)
def testWriteToBqNonBehavioralHealthRaceState(_mock_fetch: mock.MagicMock, mock_add_df_to_bq: mock.MagicMock):
    datasource = GraphQlAHRData()
    datasource.write_to_bq(
        "dataset", "gcs_bucket", demographic="race_and_ethnicity", geographic="state", category="non-behavioral_health"
    )

    assert mock_add_df_to_bq.call_count == 2

    actual_df, _, table_name = mock_add_df_to_bq.call_args_list[0][0]
    assert table_name == "non-behavioral_health_race_and_ethnicity_state_current"
    expected_df = load_golden_df(GOLDEN_DIR, table_name, EXP_DTYPE)
    assert_frame_equal(actual_df, expected_df, check_like=True)

    actual_df, _, table_name = mock_add_df_to_bq.call_args_list[1][0]
    assert table_name == "non-behavioral_health_race_and_ethnicity_state_historical"
    expected_df = load_golden_df(GOLDEN_DIR, table_name, EXP_DTYPE)
    assert_frame_equal(actual_df, expected_df, check_like=True)


@mock.patch("ingestion.gcs_to_bq_util.add_df_to_bq", return_value=None)
@mock.patch("datasources.graphql_ahr.fetch_ahr_data_from_graphql", side_effect=_fetch_ahr_data_from_graphql)
def testWriteToBqBehavioralHealthSexNational(_mock_fetch: mock.MagicMock, mock_add_df_to_bq: mock.MagicMock):
    datasource = GraphQlAHRData()
    datasource.write_to_bq(
        "dataset", "gcs_bucket", demographic="sex", geographic="national", category="behavioral_health"
    )

    assert mock_add_df_to_bq.call_count == 2

    actual_df, _, table_name = mock_add_df_to_bq.call_args_list[0][0]
    assert table_name == "behavioral_health_sex_national_current"
    expected_df = load_golden_df(GOLDEN_DIR, table_name, EXP_DTYPE)
    assert_frame_equal(actual_df, expected_df, check_like=True)

    actual_df, _, table_name = mock_add_df_to_bq.call_args_list[1][0]
    assert table_name == "behavioral_health_sex_national_historical"
    expected_df = load_golden_df(GOLDEN_DIR, table_name, EXP_DTYPE)
    assert_frame_equal(actual_df, expected_df, check_like=True)


@mock.patch("ingestion.gcs_to_bq_util.add_df_to_bq", return_value=None)
@mock.patch("datasources.graphql_ahr.fetch_ahr_data_from_graphql", side_effect=_fetch_ahr_data_from_graphql)
def testWriteToBqNonBehavioralHealthSexNational(_mock_fetch: mock.MagicMock, mock_add_df_to_bq: mock.MagicMock):
    datasource = GraphQlAHRData()
    datasource.write_to_bq(
        "dataset", "gcs_bucket", demographic="sex", geographic="national", category="non-behavioral_health"
    )

    assert mock_add_df_to_bq.call_count == 2

    actual_df, _, table_name = mock_add_df_to_bq.call_args_list[0][0]
    assert table_name == "non-behavioral_health_sex_national_current"
    expected_df = load_golden_df(GOLDEN_DIR, table_name, EXP_DTYPE)
    assert_frame_equal(actual_df, expected_df, check_like=True)

    actual_df, _, table_name = mock_add_df_to_bq.call_args_list[1][0]
    assert table_name == "non-behavioral_health_sex_national_historical"
    expected_df = load_golden_df(GOLDEN_DIR, table_name, EXP_DTYPE)
    assert_frame_equal(actual_df, expected_df, check_like=True)


@pytest.mark.parametrize("category", ["behavioral_health", "non-behavioral_health"])
@mock.patch("ingestion.gcs_to_bq_util.add_df_to_bq", return_value=None)
@mock.patch("datasources.graphql_ahr.fetch_ahr_data_from_graphql", side_effect=_fetch_ahr_data_from_graphql)
def testAdultPopSharesByAgeSumTo100(_mock_fetch: mock.MagicMock, mock_add_df_to_bq: mock.MagicMock, category: str):
    """The 18+ population share must be spread across only the non-overlapping adult
    buckets. Summing every age row would double count the finer groups nested inside
    them and silently deflate each group's share."""
    datasource = GraphQlAHRData()
    datasource.write_to_bq("dataset", "gcs_bucket", demographic="age", geographic="national", category=category)

    df, _, table_name = mock_add_df_to_bq.call_args_list[0][0]
    assert table_name == f"{category}_age_national_current"

    adult_rows = df[df[std_col.AGE_COL].isin(ADULT_AGE_GROUPS_18PLUS)]
    assert not adult_rows[std_col.AHR_18PLUS_POPULATION_PCT].isna().any()
    assert adult_rows[std_col.AHR_18PLUS_POPULATION_PCT].sum() == pytest.approx(100, abs=0.1)

    # groups that nest inside an adult bucket, or that span minors, carry no 18+ share
    other_rows = df[~df[std_col.AGE_COL].isin([*ADULT_AGE_GROUPS_18PLUS, ALL_VALUE])]
    assert not other_rows.empty
    assert other_rows[std_col.AHR_18PLUS_POPULATION_PCT].isna().all()

    all_row = df[df[std_col.AGE_COL] == ALL_VALUE]
    assert all_row[std_col.AHR_18PLUS_POPULATION_RAW].iloc[0] == adult_rows[std_col.AHR_POPULATION_RAW].sum()


def _smm_row(measure: str, value: float):
    return {
        std_col.TIME_PERIOD_COL: "2021",
        "measure": measure,
        std_col.STATE_POSTAL_COL: "US",
        "value": value,
    }


def test_smm_race_parse_and_per_10k_conversion():
    """Severe maternal morbidity is reported per 10,000 deliveries; parse_raw_data
    must multiply by 10 to reach per 100k, extract the race group from the measure
    name, and map the bare 'Severe Maternal Morbidity' row to ALL."""
    df = pd.DataFrame(
        [
            _smm_row("Severe Maternal Morbidity", 80.0),
            _smm_row("Severe Maternal Morbidity - Black", 140.0),
            _smm_row("Severe Maternal Morbidity - White", 70.0),
            _smm_row("Severe Maternal Morbidity - Asian/Pacific Islander", 60.0),
        ]
    )
    out = parse_raw_data(df, std_col.RACE_OR_HISPANIC_COL)

    rate_col = "severe_maternal_morbidity_per_100k"
    by_group = dict(zip(out[std_col.RACE_OR_HISPANIC_COL], out[rate_col]))
    assert by_group[std_col.ALL_VALUE] == 800.0
    assert by_group["Black"] == 1400.0
    assert by_group["White"] == 700.0
    assert by_group["Asian/Pacific Islander"] == 600.0


def test_smm_age_buckets_standardize():
    """The reproductive-age SMM buckets must survive name extraction and map to the
    tracker's standard age labels."""
    df = pd.DataFrame(
        [
            _smm_row("Severe Maternal Morbidity - Age Less Than 20 Years", 90.0),
            _smm_row("Severe Maternal Morbidity - Ages 25-29", 75.0),
            _smm_row("Severe Maternal Morbidity - Age 35+", 120.0),
        ]
    )
    out = parse_raw_data(df, std_col.AGE_COL)
    out[std_col.AGE_COL] = out[std_col.AGE_COL].replace(AGE_GROUPS_TO_STANDARD)

    rate_col = "severe_maternal_morbidity_per_100k"
    by_age = dict(zip(out[std_col.AGE_COL], out[rate_col]))
    assert by_age["<20"] == 900.0
    assert by_age["25-29"] == 750.0
    assert by_age["35+"] == 1200.0
