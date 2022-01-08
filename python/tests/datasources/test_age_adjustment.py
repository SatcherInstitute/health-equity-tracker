import os
import pandas as pd
from pandas._testing import assert_frame_equal

import datasources.age_adjust as age_adjust

# Current working directory.
THIS_DIR = os.path.dirname(os.path.abspath(__file__))
TEST_DIR = os.path.join(THIS_DIR, os.pardir, "data", "age_adjustment")

EXPECTED_DEATHS_JSON = os.path.join(TEST_DIR, "expected_deaths.json")
AGE_ADJUST_JSON = os.path.join(TEST_DIR, "age_adjusted.json")


def get_population_data_as_df():
    return pd.read_csv(os.path.join(TEST_DIR, "census_pop_estimates.csv"))


def get_race_and_age_data_as_df():
    return pd.read_json(os.path.join(TEST_DIR, "cdc_restricted-race_age_state.json"))


def testExpectedDeaths():
    covid_data = get_race_and_age_data_as_df()
    pop_data = get_population_data_as_df()

    df = age_adjust.get_expected_deaths(covid_data, pop_data)
    expected_df = pd.read_json(EXPECTED_DEATHS_JSON)

    assert_frame_equal(df, expected_df, check_like=True)


def testAgeAdjust():
    expected_deaths_df = pd.read_json(EXPECTED_DEATHS_JSON)
    pop_data = get_population_data_as_df()

    df = age_adjust.age_adjust(expected_deaths_df, pop_data)
    expected_df = pd.read_json(AGE_ADJUST_JSON)

    assert_frame_equal(df, expected_df, check_like=True)
