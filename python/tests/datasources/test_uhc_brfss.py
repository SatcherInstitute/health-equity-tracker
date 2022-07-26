from unittest import mock
import os
import pandas as pd  # type: ignore
from pandas._testing import assert_frame_equal  # type: ignore
from test_utils import get_state_fips_codes_as_df
from datasources.uhc import UHCData, UHC_REPORT_URLS  # type: ignore

# Current working directory.
THIS_DIR = os.path.dirname(os.path.abspath(__file__))
TEST_DIR = os.path.join(THIS_DIR, os.pardir, "data", "uhc_brfss")

GOLDEN_DATA_RACE = os.path.join(
    TEST_DIR, 'uhc_test_output_race_and_ethnicity.json')
GOLDEN_DATA_AGE = os.path.join(TEST_DIR, 'uhc_test_output_age.json')
GOLDEN_DATA_SEX = os.path.join(TEST_DIR, 'uhc_test_output_sex.json')

EXPECTED_DTYPE = {
    'state_name': str,
    'state_fips': str,
    'time_period': str,
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
    "voter_participation_per_100k": float,
    'brfss_population_pct': float,
}


def get_test_data_as_df(*args):

    url_to_mock = args[0]

    print("\t> mocking a call to AHR annual report URL:", url_to_mock)

    url_test_input = {
        "https://www.americashealthrankings.org/api/v1/downloads/251": "uhc_test_input-2021.csv",
        "https://www.americashealthrankings.org/api/v1/downloads/210": "uhc_test_input-2020.csv",
        "https://www.americashealthrankings.org/api/v1/downloads/201": "uhc_test_input-2019.csv",
        "https://www.americashealthrankings.org/api/v1/downloads/182": "uhc_test_input-2018.csv",
        "https://www.americashealthrankings.org/api/v1/downloads/144": "uhc_test_input-2017.csv",
        "https://www.americashealthrankings.org/api/v1/downloads/144": "uhc_test_input-2016.csv",
        "https://www.americashealthrankings.org/api/v1/downloads/59": "uhc_test_input-2015.csv"
    }

    df = pd.read_csv(os.path.join(TEST_DIR, url_test_input[url_to_mock]),
                     dtype={"State Name": str,
                            "Measure Name": str,
                            "Value": float})

    df_national = df.copy().reset_index(drop=True)
    df_national['State Name'] = 'United States'

    return pd.concat([df, df_national]).reset_index(drop=True)


def mocked_generate_multiyear_breakdown(*args):
    geo, demo, ahr_tables = args
    print(f'\t> mocking generate multiyear breakdown for {geo}-{demo}')
    if demo == "race_and_ethnicity":
        return pd.read_json(GOLDEN_DATA_RACE, dtype=EXPECTED_DTYPE.copy())
    if demo == "age":
        return pd.read_json(GOLDEN_DATA_AGE, dtype=EXPECTED_DTYPE.copy())
    if demo == "sex":
        return pd.read_json(GOLDEN_DATA_SEX, dtype=EXPECTED_DTYPE.copy())


def get_pop_data_as_df(*args):

    datasource_name, dataset_name, dtype = args

    mock_table_lookup = {
        "by_race_state_std": 'population_race.csv',
        "by_race_national": 'population_race.csv',
        "by_sex_state": 'population_sex.csv',
        "by_sex_national": 'population_sex.csv',
        "by_age_state": 'population_age.csv',
        "by_age_national": 'population_age.csv',
        "by_race_and_ethnicity_territory": "population_2010_race.csv",
        "by_age_territory": "population_2010_age.csv",
        "by_sex_territory": "population_2010_sex.csv"
    }

    print("\t> mocking a call to our population tables")
    print("\t> ", datasource_name, dataset_name)
    return pd.read_csv(os.path.join(TEST_DIR, mock_table_lookup[dataset_name]), dtype=str)


# def get_race_pop_data_as_df_national():
#     df = pd.read_csv(os.path.join(TEST_DIR, 'population_race.csv'), dtype=str)
#     df[std_col.STATE_FIPS_COL] = '00'
#     df[std_col.STATE_NAME_COL] = 'United States'
#     return df


# def get_age_pop_data_as_df_national():
#     df = pd.read_csv(os.path.join(TEST_DIR, 'population_age.csv'), dtype=str)
#     df[std_col.STATE_FIPS_COL] = '00'
#     df[std_col.STATE_NAME_COL] = 'United States'
#     return df


# def get_sex_pop_data_as_df_national():
#     df = pd.read_csv(os.path.join(TEST_DIR, 'population_sex.csv'), dtype=str)
#     df[std_col.STATE_FIPS_COL] = '00'
#     df[std_col.STATE_NAME_COL] = 'United States'
#     return df


# OVERALL TEST TO CONFIRM CORRECT TABLES WOULD BE WRITTEN TO BQ

# @ mock.patch('ingestion.gcs_to_bq_util.load_csv_as_df_from_web',
#              side_effect=get_test_data_as_df)
# @mock.patch('datasources.uhc.UHCData.generate_multiyear_breakdown',
#             side_effect=mocked_generate_multiyear_breakdown)
# @mock.patch('ingestion.gcs_to_bq_util.add_df_to_bq',
#             return_value=None)
# def testWriteToBq(
#         mock_bq: mock.MagicMock,
#         mock_gen_breakdown: mock.MagicMock,
#         mock_csv: mock.MagicMock,
# ):
#     print("****")
#     print("testWriteToBq")
#     print("****")
#     uhc_data = UHCData()

#     # pretend arguments required by bigQuery
#     kwargs = {'filename': 'test_file.csv',
#               'metadata_table_id': 'test_metadata',
#               'table_name': 'output_table'}

#     uhc_data.write_to_bq('dataset', 'gcs_bucket', **kwargs)

#     assert mock_bq.call_count == 6
#     assert mock_gen_breakdown.call_count == 6

#     assert mock_gen_breakdown.call_args_list[0].args[0] == 'state'
#     assert mock_gen_breakdown.call_args_list[0].args[1] == 'race_and_ethnicity'

#     assert mock_gen_breakdown.call_args_list[1].args[0] == 'state'
#     assert mock_gen_breakdown.call_args_list[1].args[1] == 'age'

#     assert mock_gen_breakdown.call_args_list[2].args[0] == 'state'
#     assert mock_gen_breakdown.call_args_list[2].args[1] == 'sex'

#     assert mock_gen_breakdown.call_args_list[3].args[0] == 'national'
#     assert mock_gen_breakdown.call_args_list[3].args[1] == 'race_and_ethnicity'

#     assert mock_gen_breakdown.call_args_list[4].args[0] == 'national'
#     assert mock_gen_breakdown.call_args_list[4].args[1] == 'age'

#     assert mock_gen_breakdown.call_args_list[5].args[0] == 'national'
#     assert mock_gen_breakdown.call_args_list[5].args[1] == 'sex'

#     assert mock_csv.call_count == 7


# SETUP TO TEST INDIVIDUAL MULTIYEAR BREAKDOWNS

uhc = UHCData()

_fake_loaded_report_dfs = {}

for year, url in UHC_REPORT_URLS.items():
    _fake_loaded_report_dfs[year] = get_test_data_as_df(url)


@mock.patch('ingestion.gcs_to_bq_util.load_public_dataset_from_bigquery_as_df',
            return_value=get_state_fips_codes_as_df())
@mock.patch('ingestion.gcs_to_bq_util.load_df_from_bigquery',
            side_effect=get_pop_data_as_df)
def testStateRace(
        mock_pop: mock.MagicMock,
        mock_fips: mock.MagicMock,
):

    print("****")
    print("testStateRace")
    print("****")
    _generated_df = uhc.generate_multiyear_breakdown(
        "state", "race_and_ethnicity", _fake_loaded_report_dfs)

    assert mock_pop.call_count == 14
    assert mock_fips.call_count == 7

    _expected_df = pd.read_json(
        GOLDEN_DATA_RACE, dtype=EXPECTED_DTYPE.copy())

    # assert_frame_equal(
    #     _generated_df, _expected_df, check_like=True)
