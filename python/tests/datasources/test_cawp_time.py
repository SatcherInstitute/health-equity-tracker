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
    FIPS_TO_STATE_TABLE_MAP
)

FIPS_TO_TEST = ["02", "60"]

# UNIT TESTS


def testPostalFromCAWPPhrase():
    assert get_postal_from_cawp_phrase("American Samoa - AS") == "AS"
    assert get_postal_from_cawp_phrase("American Samoa - AM") == "AS"
    assert get_postal_from_cawp_phrase("Anything At All - XX") == "XX"


def test_get_consecutive_time_periods():
    assert get_consecutive_time_periods(2020, 2022) == ["2020", "2021", "2022"]
    default_time_periods = get_consecutive_time_periods()
    assert default_time_periods[0] == "1915"
    assert default_time_periods[-1] == "2022"

# INTEGRATION TEST SETUP


# Current working directory.
THIS_DIR = os.path.dirname(os.path.abspath(__file__))
TEST_DIR = os.path.join(THIS_DIR, os.pardir, "data", "cawp_time")
GOLDEN_DATA_DIR = os.path.join(TEST_DIR, "golden_data")


def _get_consecutive_time_periods(*args, **kwargs):
    print("mocking with reduced years")
    if len(kwargs) == 1:
        return get_consecutive_time_periods(first_year=2018)
    return get_consecutive_time_periods(first_year=2018, last_year=2022)


def _fetch_json_from_web(*args):
    [url] = args
    if url == US_CONGRESS_HISTORICAL_URL:
        file_name = "test_legislators-historical.json"
    elif url == US_CONGRESS_CURRENT_URL:
        file_name = "test_legislators-current.json"
    print(f'reading mock US CONGRESS: {file_name}')
    with open(os.path.join(TEST_DIR, file_name)) as file:
        return json.load(file)


def _merge_yearly_pop_numbers(*args):
    print(f'reading mock yearly pop merge: {args[2]}')
    return pd.read_csv(os.path.join(TEST_DIR, "mock_acs_merge_responses", f'{args[2]}.csv'),
                       dtype={'state_fips': str, "time_period": str})


def _generate_base_df(*args):
    print("mocking the base df gen function")
    return pd.DataFrame({
        "time_period": ["1999", "2000", "2001"],
        "state_fips": ["01", "01", "01"],
        "state_name": ["SomeState", "SomeState", "SomeState"],
        "race_category_id": ["ALL", "ALL", "ALL"],
        "race_and_ethnicity": ["All", "All", "All"],
        "total_us_congress_names": ["Amelia Airheart", "Betsy Ross", "Cecilia Charles"],
        "women_this_race_us_congress_names": ["Amelia Airheart", "Betsy Ross", "Cecilia Charles"],
        "women_this_race_state_leg_names": ["Amelia Airheart", "Betsy Ross", "Cecilia Charles"],
        "fake_col1": [0, 1, 2],
        "fake_col2": ["a", "b", "c"]
    })


def _generate_breakdown(*args):
    print("mocking the breakdown calc function")
    return [pd.DataFrame({
        "time_period": ["1999", "2000", "2001"],
        "state_fips": ["01", "01", "01"],
        "state_name": ["SomeState", "SomeState", "SomeState"],
        "race_category_id": ["ALL", "ALL", "ALL"],
        "race_and_ethnicity": ["All", "All", "All"],
        "fake_col1": [0, 1, 2],
        "fake_col2": ["a", "b", "c"]
    }), "mock_table_name"]


def _generate_names_breakdown(*args):
    print("mocking the names breakdown function")
    return pd.DataFrame({
        "time_period": ["1999", "2000", "2001"],
        "state_fips": ["01", "01", "01"],
        "state_name": ["SomeState", "SomeState", "SomeState"],
        "race_category_id": ["ALL", "ALL", "ALL"],
        "race_and_ethnicity": ["All", "All", "All"],
        "total_us_congress_names": ["Amelia Airheart", "Betsy Ross", "Cecilia Charles"],
        "women_this_race_us_congress_names": ["Amelia Airheart", "Betsy Ross", "Cecilia Charles"],
        "women_this_race_state_leg_names": ["Amelia Airheart", "Betsy Ross", "Cecilia Charles"],
    })


def _load_csv_as_df_from_data_dir(*args, **kwargs):
    # mocked and reduced files for testing

    [_folder, filename] = args

    if filename == "cawp-by_race_and_ethnicity_time_series.csv":
        # READ IN CAWP DB (numerators)
        print("reading mock CAWP FULL FILE line items")
        test_input_data_types = {"id": str, "year": str, "first_name": str,
                                 "middle_name": str, "last_name": str,
                                 "party": str, "level": str, "position": str,
                                 "state": str, "district": str, "race_ethnicity": str}
        return pd.read_csv(os.path.join(TEST_DIR, filename),
                           dtype=test_input_data_types, index_col=False)
    else:
        # READ IN MANUAL TERRITORY STATELEG TOTAL TABLES
        if filename == "cawp_state_leg_60.csv":
            print("reading mock territory stateleg total tables")
        else:
            filename = "cawp_state_leg_ZZ_territory.csv"
        test_input_data_types = {"state_fips": str, "time_period": str}
        return pd.read_csv(os.path.join(TEST_DIR, "mock_territory_leg_tables", filename),
                           dtype=test_input_data_types, index_col=False)


def _load_csv_as_df_from_web(*args):
    # mocked and reduced files for testing
    url = args[0]
    # reverse lookup the FIPS based on the incoming url string arg
    fips = [
        i for i in FIPS_TO_STATE_TABLE_MAP if FIPS_TO_STATE_TABLE_MAP[i] in url][0]

    # mock out a placeholder file for all FIPS not included in our test files
    if fips in FIPS_TO_TEST:
        print("\t\tread mock stleg table by fips:", fips)
    else:
        fips = "XX"

    return pd.read_csv(os.path.join(TEST_DIR, "mock_cawp_state_leg_tables", f'cawp_state_leg_{fips}.csv')
                       )


# @ mock.patch('ingestion.gcs_to_bq_util.load_csv_as_df_from_data_dir',
#              side_effect=_load_csv_as_df_from_data_dir)
# @ mock.patch('ingestion.gcs_to_bq_util.add_df_to_bq',
#              return_value=None)
# def testRun(
#     mock_bq: mock.MagicMock,
#     mock_data: mock.MagicMock
# ):
#     kwargs_for_bq = {'filename': 'test_file.csv',
#                      'metadata_table_id': 'test_metadata',
#                      'table_name': 'output_table'}
#     cawp_data = CAWPTimeData()
#     cawp_data.write_to_bq('dataset', 'gcs_bucket', **kwargs_for_bq)


# # # TEST OUTGOING SIDE OF BIGQUERY INTERACTION


@ mock.patch('ingestion.gcs_to_bq_util.add_df_to_bq',
             return_value=None)
@ mock.patch('datasources.cawp_time.CAWPTimeData.generate_names_breakdown',
             side_effect=_generate_names_breakdown)
@ mock.patch('datasources.cawp_time.CAWPTimeData.generate_breakdown',
             side_effect=_generate_breakdown)
@ mock.patch('datasources.cawp_time.CAWPTimeData.generate_base_df',
             side_effect=_generate_base_df)
def testWriteToBq(
    mock_base: mock.MagicMock,
    mock_breakdown: mock.MagicMock,
    mock_names: mock.MagicMock,
    mock_bq: mock.MagicMock
):
    """ Ensures the correct structure and arguments were
    generated to be written to BigQuery """
    print("testWriteToBq()")

    kwargs_for_bq = {'filename': 'test_file.csv',
                     'metadata_table_id': 'test_metadata',
                     'table_name': 'output_table'}
    cawp_data = CAWPTimeData()
    cawp_data.write_to_bq('dataset', 'gcs_bucket', **kwargs_for_bq)
    assert mock_base.call_count == 1
    assert mock_breakdown.call_count == 2
    assert mock_names.call_count == 1
    assert mock_bq.call_count == 3


# # # # TEST GENERATION OF BASE DF
@ mock.patch('datasources.cawp_time.get_state_level_fips',
             return_value=FIPS_TO_TEST)
@ mock.patch('datasources.cawp_time.get_consecutive_time_periods',
             side_effect=_get_consecutive_time_periods)
@ mock.patch('ingestion.gcs_to_bq_util.load_csv_as_df_from_web', side_effect=_load_csv_as_df_from_web)
@ mock.patch('ingestion.gcs_to_bq_util.load_csv_as_df_from_data_dir',
             side_effect=_load_csv_as_df_from_data_dir)
@ mock.patch('ingestion.gcs_to_bq_util.load_public_dataset_from_bigquery_as_df',
             return_value=get_state_fips_codes_as_df())
@ mock.patch('ingestion.gcs_to_bq_util.fetch_json_from_web',
             side_effect=_fetch_json_from_web)
def testGenerateBase(
    mock_web_json: mock.MagicMock,
    mock_fips: mock.MagicMock,
    mock_data_dir_csv: mock.MagicMock,
    mock_stateleg_tables: mock.MagicMock,
    mock_years: mock.MagicMock,
    mock_starter_fips: mock.MagicMock
):
    """ Tests the generate_base_df() in isolation, mocking the input files
    to only consider data from 2019-2022 in Alaska and American Samoa """
    print("testGenerateBase()")

    cawp_data = CAWPTimeData()
    base_df = cawp_data.generate_base_df()
    expected_base_df = pd.read_csv(os.path.join(
        TEST_DIR, "test_expected_base_df.csv"),
        dtype={"state_fips": str, "time_period": str})

    # issues comparing names cols since writing the test csv
    # adds unwanted single quotes
    names_cols = ["total_us_congress_names",
                  "women_this_race_us_congress_names",
                  "women_this_race_state_leg_names"]
    expected_base_df = expected_base_df.drop(
        columns=names_cols)
    base_df = base_df.drop(
        columns=names_cols)

    assert_frame_equal(base_df,
                       expected_base_df,
                       check_like=True,
                       check_dtype=False)
    # fetches for HISTORICAL and CURRENT
    assert mock_web_json.call_count == 2
    assert mock_web_json.call_args_list[0][0][0] == US_CONGRESS_HISTORICAL_URL
    assert mock_web_json.call_args_list[1][0][0] == US_CONGRESS_CURRENT_URL
    # 2 in STATE+NATIONAL CONGRESS
    # 2 in STATE+NATIONAL ST_LEG
    # scaffolds and 1 when merging TOTALS columns
    assert mock_fips.call_count == 5
    # single fetch to /data for manually downloaded CAWP numerators
    # plus fetches to /data for each territory state leg table
    assert mock_data_dir_csv.call_count == 7
    assert mock_data_dir_csv.call_args_list[0][0][1] == CAWP_LINE_ITEMS_FILE
    # in scaffold ALL + EACH RACE X CONGRESS + STATELEG
    # and in combine AIAN_API and get_congress_totals
    assert mock_years.call_count == 6
    # once per state
    assert mock_stateleg_tables.call_count == 50
    # in scaffold ALL + scaffold EACH RACE X CONGRESS + STATELEG
    assert mock_starter_fips.call_count == 4


# # # # TEST GENERATION OF NAMES BREAKDOWN
@ mock.patch('datasources.cawp_time.get_state_level_fips',
             return_value=FIPS_TO_TEST)
@ mock.patch('datasources.cawp_time.get_consecutive_time_periods',
             side_effect=_get_consecutive_time_periods)
@ mock.patch('ingestion.gcs_to_bq_util.load_csv_as_df_from_web', side_effect=_load_csv_as_df_from_web)
def testGenerateNamesBreakdown(
        mock_stateleg_tables: mock.MagicMock,
        mock_years: mock.MagicMock,
        mock_starter_fips: mock.MagicMock
):
    """ Tests the generate_names_breakdown() function
    using the mock base_df which only has mock data from
    2017-2022, in Alaska and American Samoa """
    print("testGenerateNamesBreakdown()")

    base_df = pd.read_csv(os.path.join(
        TEST_DIR, "test_expected_base_df.csv"),
        dtype={
            "state_fips": str,
            "time_period": str,
            "total_us_congress_names": str,
            "women_this_race_us_congress_names": str,
            "women_this_race_state_leg_names": str,
    },

    ).fillna('')

    cawp_data = CAWPTimeData()
    names_breakdown_df = cawp_data.generate_names_breakdown(
        base_df)

    expected_names_breakdown_df = pd.read_csv(os.path.join(
        TEST_DIR, "test_expected_names_df.csv"),
        dtype={
            'state_fips': str,
            'time_period': str,
            'total_us_congress_names': str,
            'women_this_race_us_congress_names': str,
            'women_this_race_state_leg_names': str
    }).fillna('')

    assert_frame_equal(names_breakdown_df,
                       expected_names_breakdown_df,
                       check_like=True,
                       check_dtype=False)


# # # # TEST GENERATION OF STATE LEVEL BREAKDOWN


@mock.patch('ingestion.merge_utils.merge_yearly_pop_numbers',
            side_effect=_merge_yearly_pop_numbers)
def testGenerateStateBreakdown(
    mock_merge_pop: mock.MagicMock
):
    """ Tests the generate_breakdown() function at the state
    # level using the mock base_df which only has mock data from
    2017-2022, in Alaska and American Samoa """
    print("testGenerateStateBreakdown()")

    base_df = pd.read_csv(os.path.join(
        TEST_DIR, "test_expected_base_df.csv"),
        dtype={"state_fips": str, "time_period": str})

    cawp_data = CAWPTimeData()
    state_breakdown_df, state_table_name = cawp_data.generate_breakdown(
        base_df, "state")
    assert state_table_name == "race_and_ethnicity_state_time_series"
    assert mock_merge_pop.call_count == 1

    expected_state_breakdown_df = pd.read_csv(os.path.join(
        GOLDEN_DATA_DIR, "race_and_ethnicity_state_time_series.csv"),
        dtype={"state_fips": str, "time_period": str})

    assert_frame_equal(state_breakdown_df,
                       expected_state_breakdown_df,
                       check_like=True,
                       check_dtype=False)


# # # TEST GENERATION OF NATIONAL BREAKDOWN

@mock.patch('ingestion.merge_utils.merge_yearly_pop_numbers',
            side_effect=_merge_yearly_pop_numbers)
def testGenerateNationalBreakdown(
    mock_merge_pop: mock.MagicMock
):
    """ Tests the generate_breakdown() function at the national
    level using the mock base_df which only has mock data from
    2017-2022, in Alaska and American Samoa """
    print("testGenerateNationalBreakdown()")

    base_df = pd.read_csv(os.path.join(
        TEST_DIR, "test_expected_base_df.csv"),
        dtype={"state_fips": str, "time_period": str})
    cawp_data = CAWPTimeData()
    national_breakdown_df, national_table_name = cawp_data.generate_breakdown(
        base_df, "national")
    assert national_table_name == "race_and_ethnicity_national_time_series"
    assert mock_merge_pop.call_count == 1
    expected_national_breakdown_df = pd.read_csv(os.path.join(
        GOLDEN_DATA_DIR, "race_and_ethnicity_national_time_series.csv"),
        dtype={"state_fips": str, "time_period": str})

    assert_frame_equal(national_breakdown_df,
                       expected_national_breakdown_df,
                       check_like=True,
                       check_dtype=False)
