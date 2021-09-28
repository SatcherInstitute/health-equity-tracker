import os
import pandas as pd
from pandas._testing import assert_frame_equal

import datasources.age_adjust as age_adjust

# TO UPDATE THE GOLDEN DATA FOR THIS TEST PLEASE RUN THE FOLLOWING:
# python cdc_restricted_local.py --dir="../tests/data" --prefix="COVID_Cases_Restricted_Detailed_04302021"

# Current working directory.
THIS_DIR = os.path.dirname(os.path.abspath(__file__))
TEST_DIR = os.path.join(THIS_DIR, os.pardir, "data", "age_adjustment")


def get_population_data_as_df():
    return pd.read_csv(os.path.join(TEST_DIR, "acs_population-by_age_race_county_decade_buckets.csv"))


def get_race_and_age_data_as_df():
    return pd.read_csv(os.path.join(TEST_DIR, "cdc_restricted_by_race_county.csv"))


# TODO: This test should really be many smaller test functions/methods with
# their own test data, rather than being a monolith.
def testAgeAdjust():
    # Process raw test data.
    df = age_adjust.age_adjust(
        )

    # Build map of expected dfs from golden data.
    expected_dfs = {}
    for key, val in GOLDEN_DATA.items():
        # Set keep_default_na=False so that empty strings are not read as NaN.
        expected_dfs[key] = pd.read_csv(val, dtype=str, keep_default_na=False)

    # Test that the maps' keys are the same.
    keys = sorted(list(dfs.keys()))
    expected_keys = sorted(list(expected_dfs.keys()))
    assert keys == expected_keys

    # Test that the values are the same.
    for key in keys:
        assert_frame_equal(dfs[key], expected_dfs[key], check_like=True)
