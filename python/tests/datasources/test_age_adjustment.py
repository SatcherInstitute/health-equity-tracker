import os
import pandas as pd
from pandas._testing import assert_frame_equal

import datasources.age_adjust as age_adjust

# TO UPDATE THE GOLDEN DATA FOR THIS TEST PLEASE RUN THE FOLLOWING:
# python cdc_restricted_local.py --dir="../tests/data" --prefix="COVID_Cases_Restricted_Detailed_04302021"

# Current working directory.
THIS_DIR = os.path.dirname(os.path.abspath(__file__))
TEST_DIR = os.path.join(THIS_DIR, os.pardir, "data", "age_adjustment")
GOLDEN_DATA = os.path.join(TEST_DIR, "cdc_restricted_by_race_county_age_adjusted.csv")


def get_population_data_as_df():
    return pd.read_csv(os.path.join(TEST_DIR, "acs_population-by_age_race_county_decade_buckets.csv"))


def get_race_and_age_data_as_df():
    return pd.read_csv(os.path.join(TEST_DIR, "cdc_restricted_by_race_age_county.csv"))


def testAgeAdjust():
    # Process raw test data.
    df = age_adjust.age_adjust(get_race_and_age_data_as_df(), get_population_data_as_df(), "county")
    expected_df = pd.read_csv(GOLDEN_DATA)

    assert_frame_equal(df, expected_df, check_like=True)
