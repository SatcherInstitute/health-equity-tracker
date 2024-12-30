from ingestion.cdc_wisqars_utils import clean_numeric, contains_unknown, convert_columns_to_numeric, generate_cols_map
import numpy as np
import pandas as pd
from pandas.testing import assert_frame_equal


def test_clean_numeric():

    # double asterisk results in NaN
    assert np.isnan(clean_numeric("1000**"))
    assert np.isnan(clean_numeric("1,000**"))

    # non-strings pass through
    assert clean_numeric(1000) == 1000
    assert clean_numeric(False) is False

    # other strings pass through
    # commas are removed (allowing use of thousands separators)
    assert clean_numeric("1,000") == "1000"
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
