from unittest import mock
import os

import pandas as pd
from pandas._testing import assert_frame_equal

from datasources.uhc import UHCData

# Current working directory.
THIS_DIR = os.path.dirname(os.path.abspath(__file__))
TEST_DIR = os.path.join(THIS_DIR, os.pardir, "data", "uhc_brfss")

GOLDEN_DATA = {
    'race_and_ethnicity': os.path.join(TEST_DIR, 'uhc_test_output_race_and_ethnicity.json'),
    'sex': os.path.join(TEST_DIR, 'uhc_test_output_sex.json'),
    'age': os.path.join(TEST_DIR, 'uhc_test_output_age.json')}


def get_test_data_as_df():
    return pd.read_csv(os.path.join(TEST_DIR, 'uhc_test_input.csv'),
                       dtype={"State Name": str,
                              "Measure Name": str,
                              "Value": float,
                              })


@mock.patch('ingestion.gcs_to_bq_util.load_csv_as_df_from_web',
            return_value=get_test_data_as_df())
@mock.patch('ingestion.gcs_to_bq_util.add_df_to_bq',
            return_value=None)
def testWriteToBq(mock_bq: mock.MagicMock, mock_csv: mock.MagicMock):

    uhc_data = UHCData()

    # pretend arguments required by bigQuery
    kwargs = {'filename': 'test_file.csv',
              'metadata_table_id': 'test_metadata',
              'table_name': 'output_table'}

    uhc_data.write_to_bq('dataset', 'gcs_bucket', **kwargs)

    assert mock_bq.call_count == 3

    expected_dtype = {
        'state_name': str,
        "diabetes_per_100k": float,
        "copd_per_100k": float,
        "frequent_mental_distress_per_100k": float,
        "depression_per_100k": float,
        "suicide_per_100k": float,
        "illicit_opioid_use_per_100k": float,
        "non_medical_rx_opioid_use_per_100k": float,
        "non_medical_drug_use_per_100k": float,
        "excessive_drinking_per_100k": float,
        "preventable_hospitalizations_per_100k": float,
        "avoided_care_per_100k": float,
        "chronic_kidney_disease_per_100k": float,
        "cardiovascular_diseases_per_100k": float,
        "asthma_per_100k": float,
        "voter_participation_per_100k": float
    }

    demographics = ['race_and_ethnicity', 'age', 'sex']

    for i in range(len(demographics)):

        # TODO! confirm column names are the same
        # assert set(mock_bq.call_args_list[i].args[0].columns) == set(expected_df.columns)

        # add column type for each demographic file
        expected_dtype[demographics[i]] = str

        # by race gets some extra columns
        if demographics[i] == 'race_and_ethnicity':
            expected_dtype['race'] = str
            expected_dtype['race_includes_hispanic'] = object
            expected_dtype['race_category_id'] = str

        # read in the test output file as a dataframe with expected columns/types
        expected_df = pd.read_json(
            GOLDEN_DATA[demographics[i]], dtype=expected_dtype)

        # output created in mocked load_csv_as_df_from_web() should be the same as the expected df
        assert_frame_equal(
            mock_bq.call_args_list[i].args[0], expected_df, check_like=True)
