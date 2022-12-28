from unittest import mock
import os

import pandas as pd
from pandas._testing import assert_frame_equal

from datasources.cdc_vaccination_national import CDCVaccinationNational

# Current working directory.
THIS_DIR = os.path.dirname(os.path.abspath(__file__))
TEST_DIR = os.path.join(THIS_DIR, os.pardir, "data",
                        "cdc_vaccination_national")

GOLDEN_DATA = {
    'race_and_ethnicity': os.path.join(TEST_DIR, 'cdc_vaccination_national_by_race_and_ethnicity.csv'),
    'sex': os.path.join(TEST_DIR, 'cdc_vaccination_national_by_sex.csv'),
    'age': os.path.join(TEST_DIR, 'cdc_vaccination_national_by_age.csv'),
}


def get_state_test_data_as_df():
    return pd.read_json(
        os.path.join(TEST_DIR, 'cdc_vaccination_national_test.json'),
        dtype={'state_fips': str, 'administered_dose1_pct': float},
    )


@mock.patch('ingestion.gcs_to_bq_util.load_json_as_df_from_web',
            return_value=get_state_test_data_as_df())
@mock.patch('ingestion.gcs_to_bq_util.add_df_to_bq',
            return_value=None)
def testWriteToBq(mock_bq: mock.MagicMock, mock_csv: mock.MagicMock):
    cdcVaccination = CDCVaccinationNational()

    kwargs = {'filename': 'test_file.csv',
              'metadata_table_id': 'test_metadata',
              'table_name': 'output_table'}

    cdcVaccination.write_to_bq('dataset', 'gcs_bucket', **kwargs)
    assert mock_bq.call_count == 3

    demos = ['race_and_ethnicity', 'sex', 'age']

    expected_dfs = {}
    for key, val in GOLDEN_DATA.items():
        # Set keep_default_na=False so that empty strings are not read as NaN.
        expected_dfs[key] = pd.read_csv(val, dtype={
            'population_pct': str,
            'state_fips': str
        })

    for i in range(len(demos)):
        assert_frame_equal(
            mock_bq.call_args_list[i].args[0], expected_dfs[demos[i]], check_like=True)
