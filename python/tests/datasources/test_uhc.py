from unittest import mock
import os

import pandas as pd

from datasources.uhc import UHCData

# Current working directory.
THIS_DIR = os.path.dirname(os.path.abspath(__file__))
TEST_DIR = os.path.join(THIS_DIR, os.pardir, "data")


def get_state_test_data_as_df():
    return pd.read_csv(os.path.join(TEST_DIR, 'uhc_test_state.csv'), dtype={'state_fips': str})


@mock.patch('ingestion.gcs_to_bq_util.load_csv_as_dataframe_from_web',
            return_value=get_state_test_data_as_df())
@mock.patch('ingestion.gcs_to_bq_util.add_dataframe_to_bq',
            return_value=None)
def testWriteToBq(mock_bq: mock.MagicMock, mock_csv: mock.MagicMock):
    uhc = UHCData()
    kwargs = {'filename': 'test_file.csv',
              'metadata_table_id': 'test_metadata',
              'table_name': 'output_table'}

    uhc.write_to_bq('dataset', 'gcs_bucket', **kwargs)
    assert mock_bq.call_count == 3

    expected_len = {
        'race_and_ethnicity': 9,
        'age': 4,
        'sex': 3,
    }

    demos = ['race_and_ethnicity', 'age', 'sex']
    for i in range(len(demos)):
        exptected_cols = [
            'state_name',
            'copd_pct',
            'diabetes_pct',
            demos[i],
        ]

        if demos[i] == 'race_and_ethnicity':
            exptected_cols.append('race')
            exptected_cols.append('race_includes_hispanic')
            exptected_cols.append('race_category_id')

        output = mock_bq.call_args_list[i].args[0]
        assert set(output.columns) == set(exptected_cols)
        assert output.shape == (expected_len[demos[i]], len(exptected_cols))
