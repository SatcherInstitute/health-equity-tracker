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
    print("reading: ", os.path.join(TEST_DIR, 'uhc_test_input.csv'))
    return pd.read_csv(os.path.join(TEST_DIR, 'uhc_test_input.csv'),
                       dtype={"State Name": str,
                              "Measure Name": str,
                              "Value": float,
                              })


@mock.patch('ingestion.gcs_to_bq_util.load_csv_as_dataframe_from_web',
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

    # TEST BY AGE

    expected_df_age = pd.read_json(GOLDEN_DATA["age"], dtype={
        'state_name': str,
        "diabetes_pct": float,
        "copd_pct": float,
        "frequent_mental_distress_pct": float,
        "depression_pct": float,
        "suicide_pct": float,
        "illicit_opioid_use_pct": float,
        "non_medical_drug_use_pct": float,
        "excessive_drinking_pct": float,
        "age": str
    }
    )

    print("MOCK OUTPUT---")
    print(mock_bq.call_args_list[1].args[0].to_string())
    print("EXPECTED---")
    print(expected_df_age.to_string())
    assert_frame_equal(
        mock_bq.call_args_list[1].args[0], expected_df_age, check_like=True)

    # # TEST BY SEX

    # expected_df_age = pd.read_json(GOLDEN_DATA["sex"], dtype={
    #     'state_name': str,
    #     "copd_pct": str,
    #     "diabetes_pct": str,
    #     "frequent_mental_distress_pct": str,
    #     "depression_pct": str,
    #     "suicide_pct": str,
    #     "illicit_opioid_use_pct": str,
    #     "non_medical_drug_use_pct": str,
    #     "excessive_drinking_pct": str,
    #     "sex": str
    # }
    # )

    # print("MOCK OUTPUT---")

    # print("EXPECTED---")

    # assert_frame_equal(
    #     mock_bq.call_args_list[2].args[0], expected_df_sex, check_like=True)

    # # TEST BY RACE

    # expected_df_race_and_ethnicity = pd.read_json(GOLDEN_DATA["race_and_ethnicity"], dtype={
    #     'state_name': str,
    #     "copd_pct": str,
    #     "diabetes_pct": str,
    #     "frequent_mental_distress_pct": str,
    #     "depression_pct": str,
    #     "suicide_pct": str,
    #     "illicit_opioid_use_pct": str,
    #     "non_medical_drug_use_pct": str,
    #     "excessive_drinking_pct": str,
    #     'race_category_id': str,
    #     'race': str,
    #     'race_includes_hispanic': bool,
    #     'race_and_ethnicity': str
    # }
    # )

    # print("MOCK OUTPUT---")

    # print("EXPECTED---")

    # assert_frame_equal(
    #     mock_bq.call_args_list[0].args[0], expected_df_race_and_ethnicity, check_like=True)
