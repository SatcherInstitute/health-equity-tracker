from unittest import mock
import os

import pandas as pd
from pandas._testing import assert_frame_equal

from datasources.vera_incarceration_county import VeraIncarcerationCounty

# Current working directory.
THIS_DIR = os.path.dirname(os.path.abspath(__file__))
TEST_DIR = os.path.join(THIS_DIR, os.pardir, "data",
                        "vera_incarceration_county")

GOLDEN_DATA = os.path.join(
    TEST_DIR, 'vera_incarceration_county-race_and_ethnicity.csv')


def get_mocked_data_as_df():
    return pd.read_csv(os.path.join(TEST_DIR, 'vera_incarceration_county_input.csv'), dtype=str)


@mock.patch('ingestion.gcs_to_bq_util.load_csv_as_df_from_web',
            return_value=get_mocked_data_as_df())
@mock.patch('ingestion.gcs_to_bq_util.add_df_to_bq',
            return_value=None)
def testWriteToBq(mock_bq: mock.MagicMock, mock_csv: mock.MagicMock):
    veraIncarcerationCounty = VeraIncarcerationCounty()

    kwargs = {'filename': 'test_file.csv',
              'metadata_table_id': 'test_metadata',
              'table_name': 'output_table'}

    veraIncarcerationCounty.write_to_bq('dataset', 'gcs_bucket', **kwargs)
    assert mock_bq.call_count == 1

    expected_df = pd.read_csv(GOLDEN_DATA, dtype={
        'county_fips': str,
        'jail_per_100k': float,
        'prison_per_100k': float,
        'jail_pct_share': float,
        'prison_pct_share': float,
        'population_pct_share': float,
        'race_includes_hispanic': str,
    })
    assert_frame_equal(
        mock_bq.call_args_list[0].args[0], expected_df, check_like=True)
