import os
import pandas as pd
from unittest import mock
from pandas._testing import assert_frame_equal
from ingestion import gcs_to_bq_util

from datasources.acs_health_insurance import AcsHealthInsuranceRaceIngester

from test_utils import get_acs_metadata_as_json

# Current working directory.
THIS_DIR = os.path.dirname(os.path.abspath(__file__))
TEST_DIR = os.path.join(THIS_DIR, os.pardir, 'data', 'acs_health_insurance')


def _get_by_race_as_df(*args):
    _, filename = args
    return gcs_to_bq_util.values_json_to_df(
        os.path.join(TEST_DIR, filename), dtype={'county_fips': str}).reset_index(drop=True)


@mock.patch('ingestion.census.fetch_acs_metadata',
            return_value=get_acs_metadata_as_json())
@mock.patch('ingestion.gcs_to_bq_util.load_values_as_df',
            side_effect=_get_by_race_as_df)
@mock.patch('ingestion.gcs_to_bq_util.add_df_to_bq',
            return_value=None)
def testWriteToBqRace(mock_bq: mock.MagicMock, mock_csv: mock.MagicMock, mock_json: mock.MagicMock):
    acsHealthInsuranceRaceInestor = AcsHealthInsuranceRaceIngester("https://SOME-URL")

    acsHealthInsuranceRaceInestor.write_to_bq('dataset', 'gcs_bucket')
    assert mock_bq.call_count == 8

    # expected_df = pd.read_csv(GOLDEN_DATA_RACE, dtype={
    #     'county_fips': str,
    #     'state_fips': str,
    # })

    # assert_frame_equal(
    #     mock_bq.call_args_list[0].args[0], expected_df, check_like=True)
