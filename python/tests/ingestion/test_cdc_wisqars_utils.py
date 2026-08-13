from ingestion.cdc_wisqars_utils import (
    clean_numeric,
    contains_unknown,
    convert_columns_to_numeric,
    generate_cols_map,
    merge_wisqars_topic_df,
)
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
