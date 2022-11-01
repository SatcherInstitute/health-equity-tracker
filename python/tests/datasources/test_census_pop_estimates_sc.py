from unittest import mock
import os

import pandas as pd
from pandas._testing import assert_frame_equal

from datasources.census_pop_estimates_sc import CensusPopEstimatesSC
import ingestion.standardized_columns as std_col

# Current working directory.
THIS_DIR = os.path.dirname(os.path.abspath(__file__))
TEST_DIR = os.path.join(THIS_DIR, os.pardir, "data", "census_pop_estimates_sc")

STATE_POP_DATA = os.path.join(
    TEST_DIR, 'census_pop_estimates_sc-race_ethnicity_age_state.csv')
NATIONAL_POP_DATA = os.path.join(
    TEST_DIR, 'census_pop_estimates_sc-race_ethnicity_age_national.csv')


def get_pop_estimates_as_df():
    print("MOCK FILE READ OF sc-est2021-alldata6.csv")
    return pd.read_csv(os.path.join(TEST_DIR, 'sc-est2021-alldata6.csv'), dtype={
        'STATE': str,
        'STNAME': str,
    })


@mock.patch('ingestion.gcs_to_bq_util.load_csv_as_df_from_web',
            return_value=get_pop_estimates_as_df())
@mock.patch('ingestion.gcs_to_bq_util.add_df_to_bq',
            return_value=None)
def testWriteToBq(
    mock_bq: mock.MagicMock,
    mock_csv: mock.MagicMock
):

    censusPopEstimatesSC = CensusPopEstimatesSC()

    kwargs = {'filename': 'test_file.csv',
              'metadata_table_id': 'test_metadata',
              'table_name': 'output_table'}

    censusPopEstimatesSC.write_to_bq('dataset', 'gcs_bucket', **kwargs)
    assert mock_csv.call_count == 1
    assert mock_bq.call_count == 1

    print("test results")
    print(mock_bq.call_args_list[0].args[0])

    expected_df = pd.read_csv(STATE_POP_DATA, dtype={
        'state_fips': str,
    })

    print("expected")
    print(expected_df)

    assert_frame_equal(
        mock_bq.call_args_list[0].args[0], expected_df, check_like=True)
