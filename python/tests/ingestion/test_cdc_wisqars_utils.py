from ingestion.cdc_wisqars_utils import clean_numeric
import numpy as np

# UNIT TESTS


def test_clean_numeric():

    # double asterisk reuslts in NaN
    assert np.isnan(clean_numeric("1000**"))
    assert np.isnan(clean_numeric("1,000**"))

    # non-strings pass through
    assert clean_numeric(1000) == 1000
    assert clean_numeric(False) is False

    # other strings pass through
    # commas are removed (allowing use of thousands separators)
    assert clean_numeric("1,000") == "1000"
    assert clean_numeric("test") == "test"
