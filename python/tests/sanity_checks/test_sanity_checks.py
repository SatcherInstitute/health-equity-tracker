import os
import pandas as pd
from pandas._testing import assert_frame_equal
from sanity_checks.sanity_checks import check_pct_values


THIS_DIR = os.path.dirname(os.path.abspath(__file__))
TEST_DIR = os.path.join(THIS_DIR, os.pardir, "data", "sanity_checks")

CDC_DATA_RESTRICTED_GOOD = os.path.join(TEST_DIR, 'cdc_restricted_good.json')


def testGeneratePercentFixDataset():
    df = pd.read_json(
        CDC_DATA_RESTRICTED_GOOD, dtype={'state_fips': str})

    testing = check_pct_values(df)
    print("/n")
    print(testing.to_string())

    # assert_frame_equal()
