from unittest import mock
import os
import pandas as pd
from pandas._testing import assert_frame_equal
import json
from test_utils import get_state_fips_codes_as_df
from datasources.cawp_time import (
    CAWPTimeData,
    US_CONGRESS_HISTORICAL_URL,
    US_CONGRESS_CURRENT_URL,
    CAWP_LINE_ITEMS_FILE,
    get_postal_from_cawp_phrase,
    get_consecutive_time_periods,
    get_state_leg_totals_df,
    FIPS_TO_STATE_TABLE_MAP
)

print("\n\n")

# UNIT TESTS


# def testPostalFromCAWPPhrase():
#     assert get_postal_from_cawp_phrase("American Samoa - AS") == "AS"
#     assert get_postal_from_cawp_phrase("American Samoa - AM") == "AS"
#     assert get_postal_from_cawp_phrase("Anything At All - XX") == "XX"


# def test_get_consecutive_time_periods():
#     assert get_consecutive_time_periods(2020, 2022) == ["2020", "2021", "2022"]
#     default_time_periods = get_consecutive_time_periods()
#     assert default_time_periods[0] == "1915"
#     assert default_time_periods[-1] == "2022"

# INTEGRATION TEST SETUP


# Current working directory.
THIS_DIR = os.path.dirname(os.path.abspath(__file__))
TEST_DIR = os.path.join(THIS_DIR, os.pardir, "data", "cawp_time")
GOLDEN_DATA_DIR = os.path.join(TEST_DIR, "golden_data")


def _get_consecutive_time_periods(*args, **kwargs):
    # for testing, we only want to look at 2018-2022 as the data time periods,
    # but we still want to restrict the pop_merge years to 2019-2022
    if len(kwargs) != 0:
        return get_consecutive_time_periods(first_year=kwargs["first_year"], last_year=kwargs["last_year"])

    return get_consecutive_time_periods(first_year=2018, last_year=2022)


def _fetch_json_from_web(*args):
    [url] = args
    if url == US_CONGRESS_HISTORICAL_URL:
        file_name = "test_legislators-historical.json"
    elif url == US_CONGRESS_CURRENT_URL:
        file_name = "test_legislators-current.json"
    # print(f'reading mock US CONGRESS: {file_name}')
    with open(os.path.join(TEST_DIR, file_name)) as file:
        return json.load(file)


def _get_test_line_items_csv_as_df(*args):
    # print("reading mock CAWP line items")
    [_folder, filename] = args
    test_input_data_types = {
        "id": str,
        "year": str,
        "first_name": str,
        "middle_name": str,
        "last_name": str,
        "party": str,
        "level": str,
        "position": str,
        "state": str,
        "district": str,
        "race_ethnicity": str
    }
    test_input_filename = f'test_input_{filename}'
    return pd.read_csv(os.path.join(TEST_DIR, test_input_filename),
                       dtype=test_input_data_types)


def _get_full_test_line_items_csv_as_df(*args):
    print("reading mock CAWP FULL FILE line items")
    [_folder, filename] = args
    test_input_data_types = {
        "id": str,
        "year": str,
        "first_name": str,
        "middle_name": str,
        "last_name": str,
        "party": str,
        "level": str,
        "position": str,
        "state": str,
        "district": str,
        "race_ethnicity": str
    }
    test_input_filename = f'{filename}'
    return pd.read_csv(os.path.join(TEST_DIR, test_input_filename),
                       dtype=test_input_data_types, index_col=False)


def _load_csv_as_df_from_web(*args):
    url = args[0]
    fips = [
        i for i in FIPS_TO_STATE_TABLE_MAP if FIPS_TO_STATE_TABLE_MAP[i] in url][0]
    # print('read mock CAWP state leg. table:', fips, url)

    return pd.read_csv(os.path.join(TEST_DIR, "mock_cawp_state_leg_tables", f'cawp_state_leg_{fips}.csv')
                       )


def _merge_current_pop_numbers(*args):
    print(f'reading mock POPULATION: {args[2]}')
    return pd.read_csv(os.path.join(TEST_DIR, "mock_acs_merge_responses", f'{args[2]}.csv'),
                       dtype={'state_fips': str, "time_period": str})


def _generate_base_df(*args):
    print("mocking the base df gen function")
    return pd.DataFrame({
        "fake_col1": [0, 1, 2],
        "fake_col2": ["a", "b", "c"]
    })


def _generate_breakdown(*args):
    print("mocking the breakdown calc function")
    return [pd.DataFrame({
        "fake_col1": [0, 1, 2],
        "fake_col2": ["a", "b", "c"]
    }), "mock_table_name"]


# # TODO: Delete this DEV TEST RUNNER
# @ mock.patch('datasources.cawp_time.load_csv_as_df_from_web', side_effect=_load_csv_as_df_from_web)
# def test_fetch_cawp_state_total_tables(
#     mock_stateleg_tables: mock.MagicMock
# ):
#     get_state_leg_totals_df()

@ mock.patch('datasources.cawp_time.load_csv_as_df_from_web', side_effect=_load_csv_as_df_from_web)
@ mock.patch('ingestion.gcs_to_bq_util.add_df_to_bq',
             return_value=None)
@ mock.patch('ingestion.gcs_to_bq_util.load_csv_as_df_from_data_dir',
             side_effect=_get_full_test_line_items_csv_as_df)
@ mock.patch('datasources.cawp_time.get_consecutive_time_periods',
             side_effect=_get_consecutive_time_periods)
def testRun(
    mock_years: mock.MagicMock,
    mock_data_dir_csv: mock.MagicMock,
    mock_bq: mock.MagicMock,
    mock_stateleg_tables: mock.MagicMock

):
    kwargs_for_bq = {'filename': 'test_file.csv',
                     'metadata_table_id': 'test_metadata',
                     'table_name': 'output_table'}
    cawp_data = CAWPTimeData()
    cawp_data.write_to_bq('dataset', 'gcs_bucket', **kwargs_for_bq)


# TEST OUTGOING SIDE OF BIGQUERY INTERACTION


# @ mock.patch('ingestion.gcs_to_bq_util.add_df_to_bq',
#              return_value=None)
# @ mock.patch('datasources.cawp_time.CAWPTimeData.generate_breakdown',
#              side_effect=_generate_breakdown)
# @ mock.patch('datasources.cawp_time.CAWPTimeData.generate_base_df',
#              side_effect=_generate_base_df)
# def testWriteToBq(
#     mock_base: mock.MagicMock,
#     mock_breakdown: mock.MagicMock,
#     mock_bq: mock.MagicMock
# ):
#     """ Ensures the correct structure and arguments were
#     generated to be written to BigQuery """
#     print("testWriteToBq()")

#     kwargs_for_bq = {'filename': 'test_file.csv',
#                      'metadata_table_id': 'test_metadata',
#                      'table_name': 'output_table'}
#     cawp_data = CAWPTimeData()
#     cawp_data.write_to_bq('dataset', 'gcs_bucket', **kwargs_for_bq)
#     assert mock_base.call_count == 1
#     assert mock_breakdown.call_count == 2
#     assert mock_bq.call_count == 2
#     for call in mock_bq.call_args_list:
#         assert call[1]["column_types"] == {
#             'fake_col1': 'STRING',
#             'fake_col2': 'STRING',
#             'total_us_congress_count': 'FLOAT',
#             'women_all_races_us_congress_count': 'FLOAT',
#             'women_this_race_us_congress_count': 'FLOAT',
#             'pct_share_of_us_congress': 'FLOAT',
#             'pct_share_of_women_us_congress': 'FLOAT',
#             'population': 'FLOAT',
#             'population_pct': 'FLOAT',
#             'women_us_congress_pct_relative_inequity': 'FLOAT'
#         }


# # # # TEST GENERATION OF BASE DF
# @ mock.patch('datasources.cawp_time.get_state_level_fips',
#              return_value=["02", "60"])
# @ mock.patch('datasources.cawp_time.get_consecutive_time_periods',
#              side_effect=_get_consecutive_time_periods)
# @ mock.patch('ingestion.gcs_to_bq_util.load_csv_as_df_from_data_dir',
#              side_effect=_get_test_line_items_csv_as_df)
# @ mock.patch('ingestion.gcs_to_bq_util.load_public_dataset_from_bigquery_as_df',
#              return_value=get_state_fips_codes_as_df())
# @ mock.patch('ingestion.gcs_to_bq_util.fetch_json_from_web',
#              side_effect=_fetch_json_from_web)
# def testGenerateBase(
#     mock_web_json: mock.MagicMock,
#     mock_fips: mock.MagicMock,
#     mock_data_dir_csv: mock.MagicMock,
#     mock_years: mock.MagicMock,
#     mock_starter_fips: mock.MagicMock
# ):
#     """ Tests the generate_base_df() in isolation, mocking the input files
#     to only consider data from 2019-2022 in Alaska and American Samoa """
#     print("testGenerateBase()")

#     cawp_data = CAWPTimeData()
#     base_df = cawp_data.generate_base_df()
#     expected_base_df = pd.read_csv(os.path.join(
#         TEST_DIR, "test_expected_base_df.csv"),
#         dtype={"state_fips": str, "time_period": str})

#     assert_frame_equal(base_df,
#                        expected_base_df,
#                        check_like=True,
#                        check_dtype=False)
#     # fetches for HISTORICAL and CURRENT
#     assert mock_web_json.call_count == 2
#     assert mock_web_json.call_args_list[0][0][0] == US_CONGRESS_HISTORICAL_URL
#     assert mock_web_json.call_args_list[1][0][0] == US_CONGRESS_CURRENT_URL
#     # 2 in STATE+NATIONAL scaffolds and 1 when merging US CONGRESS TOTALS columns
#     assert mock_fips.call_count == 3
#     # single fetch to /data for manually downloaded CAWP numerators
#     assert mock_data_dir_csv.call_count == 1
#     assert mock_data_dir_csv.call_args_list[0][0][1] == CAWP_LINE_ITEMS_FILE
#     # in scaffold ALL, scaffold EACH RACE, combine AIAN_API, and get_congress_totals
#     assert mock_years.call_count == 4
#     # in scaffold ALL, scaffold EACH RACE
#     assert mock_starter_fips.call_count == 2


# # # TEST GENERATION OF STATE LEVEL BREAKDOWN
# @mock.patch('ingestion.merge_utils.merge_current_pop_numbers',
#             side_effect=_merge_current_pop_numbers)
# @ mock.patch('datasources.cawp_time.get_consecutive_time_periods',
#              side_effect=_get_consecutive_time_periods)
# def testGenerateStateBreakdown(
#     mock_years: mock.MagicMock,
#     mock_merge_pop: mock.MagicMock
# ):
#     """ Tests the generate_breakdown() function at the state
#     level using the mock base_df which only has mock data from
#     2017-2022, in Alaska and American Samoa """
#     print("testGenerateStateBreakdown()")

#     base_df = pd.read_csv(os.path.join(
#         TEST_DIR, "test_expected_base_df.csv"),
#         dtype={"state_fips": str, "time_period": str})

#     cawp_data = CAWPTimeData()
#     state_breakdown_df, state_table_name = cawp_data.generate_breakdown(
#         base_df, "state")
#     assert state_table_name == "race_and_ethnicity_state_time_series"
#     assert mock_merge_pop.call_count == 1
#     assert mock_years.call_count == 1

#     expected_state_breakdown_df = pd.read_csv(os.path.join(
#         GOLDEN_DATA_DIR, "race_and_ethnicity_state_time_series.csv"),
#         dtype={"state_fips": str, "time_period": str})

#     assert_frame_equal(state_breakdown_df,
#                        expected_state_breakdown_df,
#                        check_like=True,
#                        check_dtype=False)


# # # TEST GENERATION OF NATIONAL BREAKDOWN

# @mock.patch('ingestion.merge_utils.merge_current_pop_numbers',
#             side_effect=_merge_current_pop_numbers)
# @ mock.patch('datasources.cawp_time.get_consecutive_time_periods',
#              side_effect=_get_consecutive_time_periods)
# def testGenerateNationalBreakdown(
#     mock_years: mock.MagicMock,
#     mock_merge_pop: mock.MagicMock
# ):
#     """ Tests the generate_breakdown() function at the national
#     level using the mock base_df which only has mock data from
#     2017-2022, in Alaska and American Samoa """
#     print("testGenerateNationalBreakdown()")

#     base_df = pd.read_csv(os.path.join(
#         TEST_DIR, "test_expected_base_df.csv"),
#         dtype={"state_fips": str, "time_period": str})
#     cawp_data = CAWPTimeData()
#     national_breakdown_df, national_table_name = cawp_data.generate_breakdown(
#         base_df, "national")
#     assert national_table_name == "race_and_ethnicity_national_time_series"
#     assert mock_merge_pop.call_count == 1
#     assert mock_years.call_count == 1
#     expected_national_breakdown_df = pd.read_csv(os.path.join(
#         GOLDEN_DATA_DIR, "race_and_ethnicity_national_time_series.csv"),
#         dtype={"state_fips": str, "time_period": str})

#     assert_frame_equal(national_breakdown_df,
#                        expected_national_breakdown_df,
#                        check_like=True,
#                        check_dtype=False)
