from unittest import mock
import os

import pandas as pd
from pandas._testing import assert_frame_equal

from datasources.uhc import UHCData

# Current working directory.
THIS_DIR = os.path.dirname(os.path.abspath(__file__))
TEST_DIR = os.path.join(THIS_DIR, os.pardir, "data", "uhc_brfss")

GOLDEN_DATA = {
    'race_and_ethnicity': os.path.join(TEST_DIR, 'uhc_test_output_race_and_ethnicity.csv'),
    'sex': os.path.join(TEST_DIR, 'uhc_test_output_sex.csv'),
    'age': os.path.join(TEST_DIR, 'uhc_test_output_age.csv')}


def get_test_data_as_df():
    return pd.read_csv(os.path.join(TEST_DIR, 'uhc_test_input.csv'),
                       dtype={"state_fips": str,
                              "state_name": str,
                              "copd_pct": str,
                              "diabetes_pct": str,
                              "frequent_mental_distr,ess_pct": str,
                              "depression_pct": str,
                              "suicide_pct": str,
                              "illicit_opioid_use_pct": str,
                              "non_medical_drug_use_pct": str,
                              "excessive_drinking_pct": str,
                              "age": str,
                              "sex": str,
                              "race_category_id": str})


# def get_test_data_by_sex_as_df():
#     return pd.read_csv(os.path.join(TEST_DIR, 'uhc_test_input.csv'),
#                        dtype={"state_fips": str,
#                               "state_name": str,
#                               "copd_pct": str,
#                               "diabetes_pct": str,
#                               "frequent_mental_distr,ess_pct": str,
#                               "depression_pct": str,
#                               "suicide_pct": str,
#                               "illicit_opioid_use_pct": str,
#                               "non_medical_drug_use_pct": str,
#                               "excessive_drinking_pct": str,
#                               "sex": str})


# def get_test_data_by_race_and_ethnicity_as_df():
#     return pd.read_csv(os.path.join(TEST_DIR, 'uhc_test_input.csv'),
#                        dtype={"state_fips": str,
#                               "state_name": str,
#                               "copd_pct": str,
#                               "diabetes_pct": str,
#                               "frequent_mental_distr,ess_pct": str,
#                               "depression_pct": str,
#                               "suicide_pct": str,
#                               "illicit_opioid_use_pct": str,
#                               "non_medical_drug_use_pct": str,
#                               "excessive_drinking_pct": str,
#                               "race_category_id": str})


@mock.patch('ingestion.gcs_to_bq_util.load_json_as_df_from_web',
            return_value=get_test_data_as_df())
@mock.patch('ingestion.gcs_to_bq_util.add_dataframe_to_bq',
            return_value=None)
def testWriteToBq(mock_bq: mock.MagicMock, mock_csv: mock.MagicMock):
    uhc_data = UHCData()

    kwargs = {'filename': 'test_file.csv',
              'metadata_table_id': 'test_metadata',
              'table_name': 'output_table'}

    uhc_data.write_to_bq('dataset', 'gcs_bucket', **kwargs)
    assert mock_bq.call_count == 3

    demos = ['race_and_ethnicity', 'sex', 'age']

    expected_dfs = {}
    for key, val in GOLDEN_DATA.items():
        # Set keep_default_na=False so that empty strings are not read as NaN.
        expected_dfs[key] = pd.read_csv(val, dtype={
            # 'population_pct': str,
            'state_fips': str
        })

    for i in range(len(demos)):
        print(mock_bq.call_args_list[i].args[0].columns)
        print(expected_dfs[demos[i]].columns)

        assert_frame_equal(
            mock_bq.call_args_list[i].args[0], expected_dfs[demos[i]], check_like=True)
