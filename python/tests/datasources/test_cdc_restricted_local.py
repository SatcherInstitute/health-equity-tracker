import os
import pandas as pd
from pandas._testing import assert_frame_equal

import datasources.cdc_restricted_local as cdc

# TO UPDATE THE GOLDEN DATA FOR THIS TEST PLEASE RUN THE FOLLOWING:
# python cdc_restricted_local.py --dir="../tests/data" --prefix="COVID_Cases_Restricted_Detailed_04302021"

# Current working directory.
THIS_DIR = os.path.dirname(os.path.abspath(__file__))

# The raw test data in the data/ directory is available for easier updating in
# spreadsheet form here:
# https://docs.google.com/spreadsheets/d/1idct5vIDleqqQdXZxoyDfr5ymbxr91wRJ0oUBIx2XPU/edit?usp=sharing&resourcekey=0-BkvgsgfjcC8eEYE2tc8WVA
TEST_DIR = os.path.join(THIS_DIR, os.pardir, "data", "cdc_restricted")
TEST_DATA = [
    "COVID_Cases_Restricted_Detailed_04302021_Part_1.csv",
    "COVID_Cases_Restricted_Detailed_04302021_Part_2.csv",
]

# Map from geography and demographic to the golden data file.
GOLDEN_DATA = {
    ("state", "race"): os.path.join(TEST_DIR, "cdc_restricted_by_race_state.csv"),
    ("county", "race"): os.path.join(TEST_DIR, "cdc_restricted_by_race_county.csv"),
    ("state", "age"): os.path.join(TEST_DIR, "cdc_restricted_by_age_state.csv"),
    ("county", "age"): os.path.join(TEST_DIR, "cdc_restricted_by_age_county.csv"),
    ("state", "sex"): os.path.join(TEST_DIR, "cdc_restricted_by_sex_state.csv"),
    ("county", "sex"): os.path.join(TEST_DIR, "cdc_restricted_by_sex_county.csv"),
}


# TODO: This test should really be many smaller test functions/methods with
# their own test data, rather than being a monolith.
def testProcessData():
    # Process raw test data.
    dfs = cdc.process_data(TEST_DIR, TEST_DATA)

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
