import os
import pandas as pd

# Current working directory.
THIS_DIR = os.path.dirname(os.path.abspath(__file__))
TEST_DIR = os.path.join(THIS_DIR, os.pardir, "data", "utils")


def get_state_fips_codes_as_df():
    return pd.read_json(os.path.join(TEST_DIR, 'state_fips.json'), dtype=str)
