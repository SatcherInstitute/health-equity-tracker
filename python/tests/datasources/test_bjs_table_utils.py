from unittest import mock
import os
import pandas as pd
from pandas._testing import assert_frame_equal
import ingestion.standardized_columns as std_col
from test_utils import get_state_fips_codes_as_df
from datasources.bjs import (BJSData)
from datasources.bjs_table_utils import (
    missing_data_to_none,
    swap_race_col_names_to_codes,
    filter_cols,
    set_state_col,
    bjs_prisoners_tables,
    keep_only_states,
    keep_only_national,
    strip_footnote_refs_from_df,
    cols_to_rows,
)


# UNIT TESTS

def test_set_state_col():

    _fake_df = pd.DataFrame({
        'Jurisdiction': ["Federal", None, None],
        'Unnamed: 1': [None, "Georgia", "Alaska"],
        'ignored_values': [1.0, 1.0, 1.0]
    })
    _expected_df_set_state_cols = pd.DataFrame({
        std_col.STATE_NAME_COL: ["Federal", "Georgia", "Alaska"],
        'Jurisdiction': ["Federal", None, None],
        'Unnamed: 1': [None, "Georgia", "Alaska"],
        'ignored_values': [1.0, 1.0, 1.0]
    })

    assert_frame_equal(
        set_state_col(_fake_df),
        _expected_df_set_state_cols,
        check_like=True)


def test_filter_cols():

    _fake_by_sex_df = pd.DataFrame({
        std_col.STATE_NAME_COL: ["U.S. total", "Maine", "Florida", ],
        'Male': [2.0, 4.0, 6.0],
        'Female': [1.0, 3.0, 5.0],
        'ignored_values': [1.0, 1.0, 1.0]
    })

    _expected_by_sex_filtered_cols = pd.DataFrame({
        std_col.STATE_NAME_COL: ["U.S. total", "Maine", "Florida", ],
        'Male': [2.0, 4.0, 6.0],
        'Female': [1.0, 3.0, 5.0],
    })

    assert_frame_equal(
        filter_cols(_fake_by_sex_df, std_col.SEX_COL),
        _expected_by_sex_filtered_cols,
        check_like=True)


_fake_by_race_df = pd.DataFrame({
    std_col.STATE_NAME_COL: ["U.S. total", "Maine", "Florida", ],
    'Asian': [1_000_000, "~", 1000],
    'Black': [1_000_000, 100, "/"]
})

_expected_by_race_df_missing_to_none = pd.DataFrame({
    std_col.STATE_NAME_COL: ["U.S. total", "Maine", "Florida"],
    'Asian': [1_000_000, None, 1000],
    'Black': [1_000_000, 100, None]
})

_expected_by_race_df_only_states = pd.DataFrame({
    std_col.STATE_NAME_COL: ["Maine", "Florida"],
    'Asian': ["~", 1000],
    'Black': [100, "/"]
})


def test_missing_data_to_none():
    assert missing_data_to_none(
        _fake_by_race_df).equals(_expected_by_race_df_missing_to_none)


def test_keep_only_states():
    assert keep_only_states(
        _fake_by_race_df).reset_index(drop=True).equals(
            _expected_by_race_df_only_states.reset_index(drop=True))


def test_keep_only_national():
    _fake_by_age_df_with_total = pd.DataFrame({
        std_col.STATE_NAME_COL: ["Federal", "Maine", "Florida", ],
        'Female': [1000, 100, 10],
        'Male': [1_000_000, 100_000, 10_000]
    })

    _fake_by_age_df_without_total = pd.DataFrame({
        std_col.STATE_NAME_COL: ["U.S. total", "Maine", "Florida", ],
        'Female': [1110, 100, 10],
        'Male': [1_110_000, 100_000, 10_000]
    })

    _expected_by_age_df_only_national = pd.DataFrame({
        std_col.STATE_NAME_COL: ["United States", ],
        'Female': [1110],
        'Male': [1_110_000]
    })

    assert_frame_equal(
        keep_only_national(_fake_by_age_df_with_total,
                           ["Female", "Male"]),
        _expected_by_age_df_only_national,
        check_like=True)

    assert_frame_equal(
        keep_only_national(_fake_by_age_df_without_total,
                           ["Female",
                            "Male"]),
        _expected_by_age_df_only_national,
        check_like=True)


def test_cols_to_rows():

    _fake_bjs_table_df = pd.DataFrame({
        std_col.STATE_NAME_COL: ["Maine", "Florida", ],
        'Asian': [100, 200],
        'Black': [1000, 2000]
    })

    _expected_bjs_table_df_flipped_cols_to_rows = pd.DataFrame({
        std_col.STATE_NAME_COL: ["Maine", "Florida", "Maine", "Florida", ],
        'race': ["Asian", "Asian", "Black", "Black"],
        'some_value': [100, 200, 1000, 2000]
    })

    assert_frame_equal(
        cols_to_rows(_fake_bjs_table_df, [
            "Asian", "Black"], "race", "some_value"),
        _expected_bjs_table_df_flipped_cols_to_rows,
        check_like=True)


def test_strip_footnote_refs():
    _fake_df_with_footnote_refs = pd.DataFrame({
        std_col.STATE_NAME_COL: ["U.S. total/a", "Maine/b,c", "Florida", ],
        'Asian/e': [1, 2, 3],
        'Black': [4, 5, 6]
    })

    _expected_df_stripped_of_footnote_refs = pd.DataFrame({
        std_col.STATE_NAME_COL: ["U.S. total", "Maine", "Florida", ],
        'Asian': [1, 2, 3],
        'Black': [4, 5, 6]
    })

    assert_frame_equal(
        strip_footnote_refs_from_df(_fake_df_with_footnote_refs),
        _expected_df_stripped_of_footnote_refs,
        check_like=True)


def test_swap_race_col_names_to_codes():

    _fake_df = pd.DataFrame({
        std_col.STATE_NAME_COL: ["U.S. total", "Maine", "Florida", ],
        'American Indian/Alaska Native': [1, 2, 3],
        'Total': [4, 5, 6]
    })

    _expected_df_swapped_cols = pd.DataFrame({
        std_col.STATE_NAME_COL: ["U.S. total", "Maine", "Florida", ],
        'AIAN_NH': [1, 2, 3],
        'ALL': [4, 5, 6]
    })

    assert_frame_equal(
        swap_race_col_names_to_codes(_fake_df),
        _expected_df_swapped_cols,
        check_like=True)
