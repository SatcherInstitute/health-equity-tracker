from unittest import mock
import os

import pandas as pd
from pandas._testing import assert_frame_equal

from test_utils import get_state_fips_codes_as_df
from datasources.uhc import UHCData

# Current working directory.
THIS_DIR = os.path.dirname(os.path.abspath(__file__))
TEST_DIR = os.path.join(THIS_DIR, os.pardir, "data", "uhc_brfss")

GOLDEN_DATA_RACE = os.path.join(TEST_DIR, 'uhc_test_output_race_and_ethnicity.json')
GOLDEN_DATA_AGE = os.path.join(TEST_DIR, 'uhc_test_output_age.json')
GOLDEN_DATA_SEX = os.path.join(TEST_DIR, 'uhc_test_output_sex.json')


def get_test_data_as_df():
    return pd.read_csv(os.path.join(TEST_DIR, 'uhc_test_input.csv'),
                       dtype={"State Name": str,
                              "Measure Name": str,
                              "Value": float,
                              })


EXPECTED_DTYPE = {
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


@mock.patch('ingestion.gcs_to_bq_util.load_public_dataset_from_bigquery_as_df',
            return_value=get_state_fips_codes_as_df())
@mock.patch('ingestion.gcs_to_bq_util.load_csv_as_df_from_web',
            return_value=get_test_data_as_df())
@mock.patch('ingestion.gcs_to_bq_util.add_df_to_bq',
            return_value=None)
def testWriteToBqRace(mock_bq: mock.MagicMock, mock_csv: mock.MagicMock, mock_fips: mock.MagicMock):
    uhc_data = UHCData()

    expected_dtype = EXPECTED_DTYPE.copy()
    # pretend arguments required by bigQuery
    kwargs = {'filename': 'test_file.csv',
              'metadata_table_id': 'test_metadata',
              'table_name': 'output_table'}

    uhc_data.write_to_bq('dataset', 'gcs_bucket', **kwargs)

    assert mock_bq.call_count == 3

    # add column type for each demographic file
    expected_dtype['race_and_ethnicity'] = str
    expected_dtype['race'] = str
    expected_dtype['race_includes_hispanic'] = object
    expected_dtype['race_category_id'] = str

    expected_df = pd.read_json(
        GOLDEN_DATA_RACE, dtype=expected_dtype)

    assert_frame_equal(
        mock_bq.call_args_list[0].args[0], expected_df, check_like=True)


# @mock.patch('ingestion.gcs_to_bq_util.load_csv_as_df_from_web',
#             return_value=get_test_data_as_df())
# @mock.patch('ingestion.gcs_to_bq_util.add_df_to_bq',
#             return_value=None)
# def testWriteToBqAge(mock_bq: mock.MagicMock, mock_csv: mock.MagicMock):
#     uhc_data = UHCData()

#     expected_dtype = EXPECTED_DTYPE.copy()
#     # pretend arguments required by bigQuery
#     kwargs = {'filename': 'test_file.csv',
#               'metadata_table_id': 'test_metadata',
#               'table_name': 'output_table'}

#     uhc_data.write_to_bq('dataset', 'gcs_bucket', **kwargs)

#     assert mock_bq.call_count == 3

#     expected_dtype['age'] = str

#     expected_df = pd.read_json(
#         GOLDEN_DATA_AGE, dtype=expected_dtype)

#     assert_frame_equal(
#         mock_bq.call_args_list[1].args[0], expected_df, check_like=True)


# @mock.patch('ingestion.gcs_to_bq_util.load_csv_as_df_from_web',
#             return_value=get_test_data_as_df())
# @mock.patch('ingestion.gcs_to_bq_util.add_df_to_bq',
#             return_value=None)
# def testWriteToBqSex(mock_bq: mock.MagicMock, mock_csv: mock.MagicMock):
#     uhc_data = UHCData()

#     expected_dtype = EXPECTED_DTYPE.copy()
#     # pretend arguments required by bigQuery
#     kwargs = {'filename': 'test_file.csv',
#               'metadata_table_id': 'test_metadata',
#               'table_name': 'output_table'}

#     uhc_data.write_to_bq('dataset', 'gcs_bucket', **kwargs)

#     assert mock_bq.call_count == 3

#     expected_dtype['sex'] = str

#     expected_df = pd.read_json(
#         GOLDEN_DATA_SEX, dtype=expected_dtype)

#     assert_frame_equal(
#         mock_bq.call_args_list[2].args[0], expected_df, check_like=True)
