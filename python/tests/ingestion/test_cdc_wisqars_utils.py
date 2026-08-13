from unittest import mock

from ingestion.cdc_wisqars_utils import (
    clean_numeric,
    contains_unknown,
    convert_columns_to_numeric,
    generate_cols_map,
    condense_age_groups,
    load_wisqars_as_df_from_data_dir,
    merge_wisqars_topic_df,
    WISQARS_IS_SUPPRESSED,
)
from ingestion import standardized_columns as std_col
from ingestion.het_types import RATE_CALC_COLS_TYPE
import pandas as pd
from pandas.testing import assert_frame_equal


def test_clean_numeric():

    # double asterisk and commas removed
    assert clean_numeric("10**") == "10"
    assert clean_numeric("1,000") == "1000"
    assert clean_numeric("1,000**") == "1000"

    # non-strings pass through
    assert clean_numeric(1000) == 1000
    assert clean_numeric(False) is False

    # other strings pass through
    assert clean_numeric("test") == "test"


def test_contains_unknown():

    assert contains_unknown("unknown") is True
    assert contains_unknown("Unknown") is True
    assert contains_unknown("") is False
    assert contains_unknown("known") is False


def test_convert_columns_to_numeric():

    fake_data_with_string_numbers = [
        {
            "year": "2018",
            "some_topic_estimated_total": "94.0",
        },
        {
            "year": "2018",
            "some_topic_estimated_total": "99",
        },
        {
            "year": "2018",
            "some_topic_estimated_total": None,
        },
    ]

    expected_data_with_float_numbers = [
        {
            "year": "2018",
            "some_topic_estimated_total": 94.0,
        },
        {
            "year": "2018",
            "some_topic_estimated_total": 99.0,
        },
        {
            "year": "2018",
            "some_topic_estimated_total": None,
        },
    ]

    df = pd.DataFrame(fake_data_with_string_numbers)
    expected_df = pd.DataFrame(expected_data_with_float_numbers)

    cols_to_convert = ["some_topic_estimated_total"]

    convert_columns_to_numeric(df, cols_to_convert)

    for column in cols_to_convert:
        assert df[column].dtype == "float64"

    assert_frame_equal(df, expected_df)


def test_generate_cols_map():

    count_cols = ["cat_estimated_total", "dog_estimated_total"]
    suffix = "per_100k"
    generated_map = generate_cols_map(count_cols, suffix)

    expected_map = {"cat_estimated_total": "cat_per_100k", "dog_estimated_total": "dog_per_100k"}

    assert generated_map == expected_map


def test_generate_cols_map_empty():

    count_cols = []
    suffix = "per_100k"
    expected_map = {}
    assert generate_cols_map(count_cols, suffix) == expected_map


def test_generate_cols_map_bad_count_cols():

    count_cols = ["cat_estimated_total", "dog_estimated_total", "bird"]
    suffix = "per_100k"

    assert generate_cols_map(count_cols, suffix) == {
        "cat_estimated_total": "cat_per_100k",
        "dog_estimated_total": "dog_per_100k",
        "bird": "bird_per_100k",
    }


FAKE_STATE_ROWS = [
    {"State": "California", "Year": "2020", "Deaths": "100", "Crude Rate": "2.5", "Population": "4000000"},
    {"State": "Texas", "Year": "2020", "Deaths": "--", "Crude Rate": "--", "Population": "3000000"},
]


@mock.patch("ingestion.cdc_wisqars_utils.gcs_to_bq_util.load_csv_as_df_from_data_dir")
def test_load_wisqars_as_df_from_data_dir_detect_suppression_true(mock_load_csv):
    mock_load_csv.return_value = pd.DataFrame(FAKE_STATE_ROWS)

    df = load_wisqars_as_df_from_data_dir("gun_violence_all_intents", "state", "sex", detect_suppression=True)

    # tri-state: NaN (not True/False) means "real data, suppression doesn't apply"
    assert pd.isna(df[WISQARS_IS_SUPPRESSED].iloc[0])
    assert df[WISQARS_IS_SUPPRESSED].iloc[1] is True
    # the suppressed row's raw values are coerced to NaN by convert_columns_to_numeric
    assert df["Deaths"].isna().tolist() == [False, True]
    assert df["Crude Rate"].isna().tolist() == [False, True]


@mock.patch("ingestion.cdc_wisqars_utils.gcs_to_bq_util.load_csv_as_df_from_data_dir")
def test_load_wisqars_as_df_from_data_dir_detect_suppression_false_by_default(mock_load_csv):
    mock_load_csv.return_value = pd.DataFrame(FAKE_STATE_ROWS)

    df = load_wisqars_as_df_from_data_dir("gun_violence_all_intents", "state", "sex")

    assert WISQARS_IS_SUPPRESSED not in df.columns


NUMERATOR_COL = "count_estimated_total"
DENOMINATOR_COL = "population"
RATE_COL = "count_per_100k"
SUPPRESSED_COL = f"{RATE_COL}_{std_col.IS_SUPPRESSED_SUFFIX}"

COL_DICTS: list[RATE_CALC_COLS_TYPE] = [
    {"numerator_col": NUMERATOR_COL, "denominator_col": DENOMINATOR_COL, "rate_col": RATE_COL}
]


def test_condense_age_groups_marks_combined_bucket_suppressed_if_any_sub_bucket_suppressed():
    df = pd.DataFrame(
        [
            {
                std_col.TIME_PERIOD_COL: "2020",
                std_col.STATE_NAME_COL: "California",
                std_col.AGE_COL: "35-39",
                NUMERATOR_COL: 10,
                DENOMINATOR_COL: 1000,
                RATE_COL: 1000.0,
                SUPPRESSED_COL: False,
            },
            {
                std_col.TIME_PERIOD_COL: "2020",
                std_col.STATE_NAME_COL: "California",
                std_col.AGE_COL: "40-44",
                NUMERATOR_COL: 5,
                DENOMINATOR_COL: 500,
                RATE_COL: 1000.0,
                SUPPRESSED_COL: True,
            },
        ]
    )

    condensed = condense_age_groups(df, COL_DICTS)
    combined_row = condensed[condensed[std_col.AGE_COL] == "35-44"].iloc[0]

    # a partial sum across a suppressed sub-bucket can't be trusted as a complete count/rate
    assert combined_row[SUPPRESSED_COL] is True
    assert pd.isna(combined_row[NUMERATOR_COL])
    assert pd.isna(combined_row[RATE_COL])


def test_condense_age_groups_combines_normally_when_no_sub_bucket_suppressed():
    df = pd.DataFrame(
        [
            {
                std_col.TIME_PERIOD_COL: "2020",
                std_col.STATE_NAME_COL: "California",
                std_col.AGE_COL: "35-39",
                NUMERATOR_COL: 10,
                DENOMINATOR_COL: 1000,
                RATE_COL: 1000.0,
                SUPPRESSED_COL: False,
            },
            {
                std_col.TIME_PERIOD_COL: "2020",
                std_col.STATE_NAME_COL: "California",
                std_col.AGE_COL: "40-44",
                NUMERATOR_COL: 5,
                DENOMINATOR_COL: 500,
                RATE_COL: 1000.0,
                SUPPRESSED_COL: False,
            },
        ]
    )

    condensed = condense_age_groups(df, COL_DICTS)
    combined_row = condensed[condensed[std_col.AGE_COL] == "35-44"].iloc[0]

    # NaN here means "suppression doesn't apply" (a real rate was computed), per the tri-state
    # convention: True = suppressed, False = known-missing-but-not-suppressed, NaN = real data.
    assert pd.isna(combined_row[SUPPRESSED_COL])
    assert combined_row[NUMERATOR_COL] == 15
    assert combined_row[DENOMINATOR_COL] == 1500
    assert combined_row[RATE_COL] == 1000.0


def test_merge_wisqars_topic_df_does_not_key_on_shared_value_col_names():
    # Simulates the youth.py/black_men.py loop: `output_df` accumulates one topic's df per
    # iteration. Both topics here produce an `is_suppressed` column (unprefixed, as the source
    # loader emits it) with different True/False values per state - if `is_suppressed` were ever
    # treated as an implicit join key, California's rows (True vs False) wouldn't match and the
    # merge would corrupt/duplicate rows instead of joining cleanly on year/state.
    output_df = pd.DataFrame(columns=["year", "state"])

    topic_a_df = pd.DataFrame(
        [
            {"year": "2020", "state": "California", "topic_a_estimated_total": 10, "is_suppressed": True},
            {"year": "2020", "state": "Texas", "topic_a_estimated_total": 20, "is_suppressed": False},
        ]
    )
    output_df = merge_wisqars_topic_df(output_df, topic_a_df)

    topic_b_df = pd.DataFrame(
        [
            {"year": "2020", "state": "California", "topic_b_estimated_total": 30, "is_suppressed": False},
            {"year": "2020", "state": "Texas", "topic_b_estimated_total": 40, "is_suppressed": True},
        ]
    )
    output_df = merge_wisqars_topic_df(output_df, topic_b_df)

    # exactly one row per state, not a cross-product/NaN-riddled mismatch from a bad join key
    assert len(output_df) == 2
    assert set(output_df["state"]) == {"California", "Texas"}

    ca_row = output_df[output_df["state"] == "California"].iloc[0]
    assert ca_row["topic_a_estimated_total"] == 10
    assert ca_row["topic_b_estimated_total"] == 30


def test_merge_wisqars_topic_df_does_not_key_on_shared_prefixed_value_col_names():
    # Same scenario as above, but for a prefixed value column (e.g. two topics that both happen to
    # be named "shared_per_100k") rather than the unprefixed `is_suppressed` case - proves the
    # suffix-matching rule in `_is_wisqars_value_col`, not just the exact-match `is_suppressed` case.
    output_df = pd.DataFrame(columns=["year", "state"])

    topic_a_df = pd.DataFrame(
        [
            {"year": "2020", "state": "California", "shared_per_100k": 1.5},
            {"year": "2020", "state": "Texas", "shared_per_100k": 2.5},
        ]
    )
    output_df = merge_wisqars_topic_df(output_df, topic_a_df)

    topic_b_df = pd.DataFrame(
        [
            {"year": "2020", "state": "California", "shared_per_100k": 3.5},
            {"year": "2020", "state": "Texas", "shared_per_100k": 4.5},
        ]
    )
    output_df = merge_wisqars_topic_df(output_df, topic_b_df)

    assert len(output_df) == 2
    assert set(output_df["state"]) == {"California", "Texas"}


def test_merge_wisqars_topic_df_does_not_key_on_shared_pct_share_col_names():
    # `_pct_share`/`_pct_rate`/`_pct_relative_inequity` columns are typically computed after the
    # per-topic merge (in generate_breakdown_df), not before it - but `_is_wisqars_value_col`
    # excludes them too, so a topic that computes its share early is still safe to merge.
    output_df = pd.DataFrame(columns=["year", "state"])

    topic_a_df = pd.DataFrame(
        [
            {"year": "2020", "state": "California", "topic_a_estimated_total": 10, "shared_pct_share": 40.0},
            {"year": "2020", "state": "Texas", "topic_a_estimated_total": 20, "shared_pct_share": 60.0},
        ]
    )
    output_df = merge_wisqars_topic_df(output_df, topic_a_df)

    topic_b_df = pd.DataFrame(
        [
            {"year": "2020", "state": "California", "topic_b_estimated_total": 30, "shared_pct_share": 55.0},
            {"year": "2020", "state": "Texas", "topic_b_estimated_total": 40, "shared_pct_share": 45.0},
        ]
    )
    output_df = merge_wisqars_topic_df(output_df, topic_b_df)

    assert len(output_df) == 2
    assert set(output_df["state"]) == {"California", "Texas"}
