from ingestion.standardized_columns import extract_prefix  # pylint: disable=no-name-in-module
import pytest


def test_extract_prefix():

    with pytest.raises(ValueError):
        extract_prefix('')

    with pytest.raises(ValueError):
        extract_prefix('something_without_any_known_suffix')

    assert extract_prefix('specific_disease_per_100k') == 'specific_disease'
    assert extract_prefix('some_prefix_estimate_totals') == 'some_prefix'
