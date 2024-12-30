from ingestion.standardized_columns import (
    extract_prefix,
    ends_with_suffix_from_list,
)  # pylint: disable=no-name-in-module
import pytest


def test_extract_prefix():

    with pytest.raises(ValueError):
        extract_prefix("")

    with pytest.raises(ValueError):
        extract_prefix("something_without_any_known_suffix")

    assert extract_prefix("specific_disease_per_100k") == "specific_disease"
    assert extract_prefix("some_prefix_estimated_total") == "some_prefix"


def test_ends_with_suffix_from_list():
    # Test case: Column name ends with one of the suffixes
    col = "population_per_100k"
    suffixes = ["per_100k", "pct_rate", "index"]
    assert ends_with_suffix_from_list(col, suffixes) is True

    # Test case: Column name does not end with any of the suffixes
    col = "population_growth"
    suffixes = ["per_100k", "pct_rate", "index"]
    assert ends_with_suffix_from_list(col, suffixes) is False

    # Test case: Column name is exactly one of the suffixes
    col = "pct_rate"
    suffixes = ["per_100k", "pct_rate", "index"]
    assert ends_with_suffix_from_list(col, suffixes) is True

    # Test case: Column name is empty string
    col = ""
    suffixes = ["per_100k", "pct_rate", "index"]
    assert ends_with_suffix_from_list(col, suffixes) is False

    # Test case: Suffixes list is empty
    col = "population_per_100k"
    suffixes = []
    assert ends_with_suffix_from_list(col, suffixes) is False

    # Test case: Both column name and suffixes list are empty
    col = ""
    suffixes = []
    assert ends_with_suffix_from_list(col, suffixes) is False

    # Test case: Column name ends with one of the suffixes (multiple occurrences)
    col = "population_per_100k_per_100k"
    suffixes = ["per_100k", "pct_rate", "index"]
    assert ends_with_suffix_from_list(col, suffixes) is True

    # Test case: Column name ends with suffix that is a substring of a larger suffix
    col = "population_rate"
    suffixes = ["rate", "pct_rate", "index"]
    assert ends_with_suffix_from_list(col, suffixes) is True
