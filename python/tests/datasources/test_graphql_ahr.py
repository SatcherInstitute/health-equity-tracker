import json
import os
import pandas as pd
import pytest
from datasources.graphql_ahr import GraphQlAHRData, ADULT_AGE_GROUPS_18PLUS, parse_raw_data
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


@mock.patch("ingestion.gcs_to_bq_util.add_df_to_bq", return_value=None)
@mock.patch("datasources.graphql_ahr.fetch_ahr_data_from_graphql")
def test_smm_write_to_bq_race_state(mock_fetch: mock.MagicMock, _mock_add: mock.MagicMock):
    """End-to-end write_to_bq for SMM: the per-100k column must appear in the
    current race/state table with the x10 conversion applied. Uses a minimal
    inline AHR-style response rather than the full golden fixture."""

    def _resp(_demographic: str, _geo: str, _category: str):
        def rows(name, al, ca):
            return {
                "data": [
                    {"endDate": "2021-01-01T00:00:00.000Z", "state": "AL", "value": al, "measure": {"name": name}},
                    {"endDate": "2021-01-01T00:00:00.000Z", "state": "CA", "value": ca, "measure": {"name": name}},
                ]
            }

        return [
            rows("Severe Maternal Morbidity", 90.0, 80.0),
            rows("Severe Maternal Morbidity - Black", 140.0, 130.0),
            rows("Severe Maternal Morbidity - White", 70.0, 65.0),
        ]

    mock_fetch.side_effect = _resp
    datasource = GraphQlAHRData()
    datasource.write_to_bq(
        "dataset", "gcs_bucket", demographic="race_and_ethnicity", geographic="state", category="non-behavioral_health"
    )

    current_df, _, table_name = _mock_add.call_args_list[0][0]
    assert table_name == "non-behavioral_health_race_and_ethnicity_state_current"

    rate_col = "severe_maternal_morbidity_per_100k"
    assert rate_col in current_df.columns
    # every input value converted per-10k -> per-100k (x10): {90,80,140,130,70,65} -> x10
    got = sorted(v for v in current_df[rate_col].dropna().tolist())
    assert got == [650.0, 700.0, 800.0, 900.0, 1300.0, 1400.0]


def test_smm_age_buckets_standardize():
    """The reproductive-age SMM buckets must survive name extraction and map to the
    tracker's standard age labels, including the under-20 bucket that AHR names
    "Age >20"."""
    df = pd.DataFrame(
        [
            _smm_row("Severe Maternal Morbidity - Age >20", 90.0),
            _smm_row("Severe Maternal Morbidity - Ages 25-29", 75.0),
            _smm_row("Severe Maternal Morbidity - Age 35+", 120.0),
        ]
    )
    out = parse_raw_data(df, std_col.AGE_COL)

    rate_col = "severe_maternal_morbidity_per_100k"
    by_age = dict(zip(out[std_col.AGE_COL], out[rate_col]))
    assert by_age["<20"] == 900.0
    assert by_age["25-29"] == 750.0
    assert by_age["35+"] == 1200.0


def test_birth_outcomes_parse_and_unit_conversion():
    """Infant mortality is reported per 1,000 live births and must be multiplied by
    100 to reach per 100k. Low birth weight and low-risk cesarean are already
    percentages and must pass through unchanged."""
    df = pd.DataFrame(
        [
            _smm_row("Infant Mortality", 5.6),
            _smm_row("Infant Mortality - Black", 10.9),
            _smm_row("Low Birth Weight", 8.5),
            _smm_row("Low Birth Weight - Black", 14.7),
            _smm_row("Low-Risk Cesarean Delivery", 26.3),
            _smm_row("Low-Risk Cesarean Delivery - Hispanic", 25.1),
        ]
    )
    out = parse_raw_data(df, std_col.RACE_OR_HISPANIC_COL)
    out = out.set_index(std_col.RACE_OR_HISPANIC_COL)

    assert out.loc[std_col.ALL_VALUE, "infant_mortality_per_100k"] == pytest.approx(560.0)
    assert out.loc["Black", "infant_mortality_per_100k"] == pytest.approx(1090.0)
    assert out.loc[std_col.ALL_VALUE, "low_birthweight_pct_rate"] == 8.5
    assert out.loc["Black", "low_birthweight_pct_rate"] == 14.7
    assert out.loc[std_col.ALL_VALUE, "low_risk_cesarean_pct_rate"] == 26.3
    assert out.loc["Hispanic", "low_risk_cesarean_pct_rate"] == 25.1


@mock.patch("ingestion.gcs_to_bq_util.add_df_to_bq", return_value=None)
@mock.patch("datasources.graphql_ahr.fetch_ahr_data_from_graphql")
def test_maternal_age_buckets_write_to_bq_age_national(mock_fetch: mock.MagicMock, mock_add: mock.MagicMock):
    """The birth-outcome age breakdowns are the mother's age, and AHR spells them two
    ways ("Mother Age 15-19" for infant mortality, "Mother Ages 15-19" for low birth
    weight). Both must land on the same standard bucket, and SMM's under-20 bucket,
    which AHR names "Age >20", must become "<20". All three topics are rate-only."""

    def _resp(_demographic: str, _geo: str, _category: str):
        def rows(name, value):
            return {
                "data": [
                    {"endDate": "2021-01-01T00:00:00.000Z", "state": "ALL", "value": value, "measure": {"name": name}}
                ]
            }

        return [
            rows("Infant Mortality", 5.5),
            rows("Infant Mortality - Mother Age 15-19", 8.9),
            rows("Infant Mortality - Mother Age 40-44", 6.9),
            rows("Low Birth Weight", 8.5),
            rows("Low Birth Weight - Mother Ages 15-19", 10.3),
            rows("Low Birth Weight - Mother Ages 40-44", 12.1),
            rows("Severe Maternal Morbidity", 90.0),
            rows("Severe Maternal Morbidity - Age >20", 85.0),
        ]

    mock_fetch.side_effect = _resp
    GraphQlAHRData().write_to_bq(
        "dataset", "gcs_bucket", demographic="age", geographic="national", category="non-behavioral_health"
    )

    current_df, _, table_name = mock_add.call_args_list[0][0]
    assert table_name == "non-behavioral_health_age_national_current"
    by_age = current_df.set_index(std_col.AGE_COL)

    assert set(by_age.index) == {std_col.ALL_VALUE, "15-19", "40-44", "<20"}
    assert by_age.loc["15-19", "infant_mortality_per_100k"] == pytest.approx(890.0)
    assert by_age.loc["40-44", "infant_mortality_per_100k"] == pytest.approx(690.0)
    assert by_age.loc["15-19", "low_birthweight_pct_rate"] == 10.3
    assert by_age.loc["40-44", "low_birthweight_pct_rate"] == 12.1
    assert by_age.loc["<20", "severe_maternal_morbidity_per_100k"] == 850.0

    for prefix in ["infant_mortality", "low_birthweight", "low_risk_cesarean", "severe_maternal_morbidity"]:
        assert not any(
            col.startswith(prefix) and col.endswith(("_estimated_total", "_pct_share", "_pct_relative_inequity"))
            for col in current_df.columns
        )


@mock.patch("ingestion.gcs_to_bq_util.add_df_to_bq", return_value=None)
@mock.patch("datasources.graphql_ahr.fetch_ahr_data_from_graphql")
def test_infant_mortality_write_to_bq_sex_state(mock_fetch: mock.MagicMock, mock_add: mock.MagicMock):
    """Infant mortality is the only birth-outcome measure AHR breaks down by sex (the
    infant's sex); its rows must reach the sex table converted to per 100k."""

    def _resp(_demographic: str, _geo: str, _category: str):
        def rows(name, al, ca):
            return {
                "data": [
                    {"endDate": "2022-01-01T00:00:00.000Z", "state": "AL", "value": al, "measure": {"name": name}},
                    {"endDate": "2022-01-01T00:00:00.000Z", "state": "CA", "value": ca, "measure": {"name": name}},
                ]
            }

        return [
            rows("Infant Mortality", 7.4, 4.2),
            rows("Infant Mortality - Female", 6.8, 3.9),
            rows("Infant Mortality - Male", 8.0, 4.5),
        ]

    mock_fetch.side_effect = _resp
    GraphQlAHRData().write_to_bq(
        "dataset", "gcs_bucket", demographic="sex", geographic="state", category="non-behavioral_health"
    )

    current_df, _, table_name = mock_add.call_args_list[0][0]
    assert table_name == "non-behavioral_health_sex_state_current"
    assert set(current_df[std_col.SEX_COL]) == {std_col.ALL_VALUE, "Female", "Male"}
    got = sorted(current_df["infant_mortality_per_100k"].tolist())
    assert got == pytest.approx([390.0, 420.0, 450.0, 680.0, 740.0, 800.0])


@mock.patch("ingestion.gcs_to_bq_util.add_df_to_bq", return_value=None)
@mock.patch("datasources.graphql_ahr.fetch_ahr_data_from_graphql")
def test_birth_outcome_only_groups_leave_adult_pop_shares_unchanged(
    mock_fetch: mock.MagicMock, mock_add: mock.MagicMock
):
    """AHR reports birth outcomes for race groups that no adult measure covers (here
    Multiracial). Those group rows must not join the 18+ population summed across groups,
    or every other group's adult population share, and the inequity of the adult topics
    compared against it, would shift just because a birth-outcome topic was added."""

    def rows(name, value):
        return {
            "data": [{"endDate": "2021-01-01T00:00:00.000Z", "state": "AL", "value": value, "measure": {"name": name}}]
        }

    adult_only = [
        rows("Asthma", 10.0),
        rows("Asthma - Black", 12.0),
        rows("Asthma - White", 9.0),
    ]
    with_birth_outcomes = adult_only + [
        rows("Infant Mortality", 7.0),
        rows("Infant Mortality - Black", 12.0),
        rows("Infant Mortality - Multiracial", 6.0),
    ]

    def run(response):
        mock_fetch.side_effect = lambda *_args: response
        mock_add.reset_mock()
        GraphQlAHRData().write_to_bq(
            "dataset",
            "gcs_bucket",
            demographic="race_and_ethnicity",
            geographic="state",
            category="non-behavioral_health",
        )
        (current_df, _, current_table), (historical_df, _, historical_table) = [
            call[0] for call in mock_add.call_args_list
        ]
        assert current_table == "non-behavioral_health_race_and_ethnicity_state_current"
        assert historical_table == "non-behavioral_health_race_and_ethnicity_state_historical"
        by_group = std_col.RACE_OR_HISPANIC_COL
        return current_df.set_index(by_group), historical_df.set_index(by_group)

    current_before, historical_before = run(adult_only)
    current_after, historical_after = run(with_birth_outcomes)

    multiracial = std_col.Race.MULTI_NH.race_and_ethnicity
    assert current_after.loc[multiracial, "infant_mortality_per_100k"] == 600.0
    assert pd.isna(current_after.loc[multiracial, std_col.AHR_18PLUS_POPULATION_PCT])
    for group in current_before.index:
        assert (
            current_after.loc[group, std_col.AHR_18PLUS_POPULATION_PCT]
            == current_before.loc[group, std_col.AHR_18PLUS_POPULATION_PCT]
        )
        assert (
            historical_after.loc[group, "asthma_pct_relative_inequity"]
            == historical_before.loc[group, "asthma_pct_relative_inequity"]
        )


def test_infant_mortality_zero_is_treated_as_suppressed():
    """AHR's 2013-2014 infant mortality window reports suppressed values as 0 instead of
    null; those must become missing rather than a published rate of zero deaths."""
    df = pd.DataFrame(
        [
            {**_smm_row("Infant Mortality - Mother Age 40-44", 0), std_col.TIME_PERIOD_COL: "2014"},
            {**_smm_row("Infant Mortality - Mother Age 25-29", 5.2), std_col.TIME_PERIOD_COL: "2014"},
            {**_smm_row("Low Birth Weight - Mother Ages 40-44", 11.0), std_col.TIME_PERIOD_COL: "2014"},
        ]
    )
    out = parse_raw_data(df, std_col.AGE_COL).set_index(std_col.AGE_COL)

    assert pd.isna(out.loc["40-44", "infant_mortality_per_100k"])
    assert out.loc["40-44", "low_birthweight_pct_rate"] == 11.0
    assert out.loc["25-29", "infant_mortality_per_100k"] == pytest.approx(520.0)
