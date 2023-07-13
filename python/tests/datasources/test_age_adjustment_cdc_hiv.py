from unittest import mock
import os
import pandas as pd
from pandas._testing import assert_frame_equal

import datasources.age_adjust_cdc_hiv as age_adjust

from datasources.age_adjust_cdc_hiv import AgeAdjustCDCHiv

# Current working directory.
THIS_DIR = os.path.dirname(os.path.abspath(__file__))
TEST_DIR = os.path.join(THIS_DIR, os.pardir, 'data', 'cdc_hiv_age_adjustment')


def _load_df_from_bigquery(*args, **kwargs):
    dataset, table_name = args
    print("mocking read from BQ table:", f'{dataset}-{table_name}')

    dtype = kwargs["dtype"]
    print("dtype", dtype)

    race_age_df = pd.read_csv(os.path.join(TEST_DIR, f'{table_name}.csv'))

    print("loaded race age df")
    print(race_age_df)

    return race_age_df


# Integration tests
@mock.patch('ingestion.gcs_to_bq_util.add_df_to_bq',
            return_value=None)
@mock.patch('ingestion.gcs_to_bq_util.load_df_from_bigquery',
            side_effect=_load_df_from_bigquery)
def testWriteToBqNational(
    mock_race_age: mock.MagicMock,
    mock_bq: mock.MagicMock,
):
    adjust = AgeAdjustCDCHiv()

    kwargs = {'filename': 'test_file.csv',
              'metadata_table_id': 'test_metadata',
              'table_name': 'output_table'}

    # adjust.write_to_bq('dataset', 'gcs_bucket', **kwargs)
    # assert mock_bq.call_count == 4

    # expected_df = pd.read_json(GOLDEN_INTEGRATION_DATA_STATE, dtype={
    #     'state_fips': str,
    #     'death_ratio_age_adjusted': float,
    # })

    # assert_frame_equal(
    #     mock_bq.call_args_list[0].args[0], expected_df, check_like=True)
