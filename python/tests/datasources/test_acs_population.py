import os
import json
import pandas as pd
from unittest import mock
from pandas._testing import assert_frame_equal
import pytest

from datasources.acs_population import (  # type: ignore
    ACSPopulationIngester,
    GENERATE_NATIONAL_DATASET,
    extract_year)
from ingestion import gcs_to_bq_util


def testWorkingExtractYear():
    assert extract_year("https://api.census.gov/data/2019/acs/acs5") == "2019"


def testBadUrlStartExtractYear():
    with pytest.raises(ValueError):
        extract_year("https://someWrongSite/2019/acs/acs5")


def testBadUrlEndExtractYear():
    with pytest.raises(ValueError):
        extract_year("https://api.census.gov/data/2019/acs/acs5/WrongRoute")


# Current working directory.
THIS_DIR = os.path.dirname(os.path.abspath(__file__))
TEST_DIR = os.path.join(THIS_DIR, os.pardir, "data", "acs_population")
GOLDEN_DIR = os.path.join(THIS_DIR, os.pardir, "data",
                          "acs_population", "golden_data")
MOCK_CACHE_DIR = os.path.join(
    THIS_DIR, os.pardir, "data", "acs_population", "mock_cache")

# single year golden data
GOLDEN_DATA_RACE = os.path.join(GOLDEN_DIR, 'table_by_race_state.csv')
GOLDEN_DATA_SEX_AGE_RACE = os.path.join(
    GOLDEN_DIR, 'table_by_sex_age_race_state.csv')
GOLDEN_DATA_SEX_AGE = os.path.join(GOLDEN_DIR, 'table_by_sex_age.csv')
GOLDEN_DATA_AGE = os.path.join(GOLDEN_DIR, 'table_by_age.csv')
GOLDEN_DATA_SEX = os.path.join(GOLDEN_DIR, 'table_by_sex.csv')
GOLDEN_DATA_SEX_NATIONAL = os.path.join(
    GOLDEN_DIR, 'table_by_sex_national.csv')
GOLDEN_DATA_AGE_NATIONAL = os.path.join(
    GOLDEN_DIR, 'table_by_age_national.csv')
GOLDEN_DATA_RACE_NATIONAL = os.path.join(
    GOLDEN_DIR, 'table_by_race_national.csv')
GOLDEN_DATA_AGE_COUNTY = os.path.join(
    GOLDEN_DIR, 'table_by_age_county.csv')

# time series golden data initial year OVERWRITES
GOLDEN_DATA_RACE_TIME_SERIES_OVERWRITE = os.path.join(
    GOLDEN_DIR, 'time_series_overwrites', 'table_by_race_state_time_series.csv')
GOLDEN_DATA_SEX_AGE_RACE_TIME_SERIES_OVERWRITES = os.path.join(
    GOLDEN_DIR, 'time_series_overwrites', 'table_by_sex_age_race_state_time_series.csv')
GOLDEN_DATA_SEX_AGE_TIME_SERIES_OVERWRITES = os.path.join(
    GOLDEN_DIR, 'time_series_overwrites', 'table_by_sex_age_time_series.csv')
GOLDEN_DATA_AGE_TIME_SERIES_OVERWRITES = os.path.join(
    GOLDEN_DIR, 'time_series_overwrites', 'table_by_age_time_series.csv')
GOLDEN_DATA_SEX_TIME_SERIES_OVERWRITES = os.path.join(
    GOLDEN_DIR, 'time_series_overwrites', 'table_by_sex_time_series.csv')
GOLDEN_DATA_SEX_NATIONAL_TIME_SERIES_OVERWRITES = os.path.join(
    GOLDEN_DIR, 'time_series_overwrites', 'table_by_sex_national_time_series.csv')
GOLDEN_DATA_AGE_NATIONAL_TIME_SERIES_OVERWRITES = os.path.join(
    GOLDEN_DIR, 'time_series_overwrites', 'table_by_age_national_time_series.csv')
GOLDEN_DATA_RACE_NATIONAL_TIME_SERIES_OVERWRITES = os.path.join(
    GOLDEN_DIR, 'time_series_overwrites', 'table_by_race_national_time_series.csv')
GOLDEN_DATA_AGE_COUNTY_TIME_SERIES_OVERWRITES = os.path.join(
    GOLDEN_DIR, 'time_series_overwrites', 'table_by_age_county_time_series.csv')

# time series golden data subsequent year APPENDS
GOLDEN_DATA_RACE_TIME_SERIES_APPEND = os.path.join(
    GOLDEN_DIR, 'time_series_appends', 'table_by_race_state_time_series.csv')
GOLDEN_DATA_SEX_AGE_RACE_TIME_SERIES_APPEND = os.path.join(
    GOLDEN_DIR, 'time_series_appends', 'table_by_sex_age_race_state_time_series.csv')
GOLDEN_DATA_SEX_AGE_TIME_SERIES_APPEND = os.path.join(
    GOLDEN_DIR, 'time_series_appends', 'table_by_sex_age_time_series.csv')
GOLDEN_DATA_AGE_TIME_SERIES_APPEND = os.path.join(
    GOLDEN_DIR, 'time_series_appends', 'table_by_age_time_series.csv')
GOLDEN_DATA_SEX_TIME_SERIES_APPEND = os.path.join(
    GOLDEN_DIR, 'time_series_appends', 'table_by_sex_time_series.csv')
GOLDEN_DATA_SEX_NATIONAL_TIME_SERIES_APPEND = os.path.join(
    GOLDEN_DIR, 'time_series_appends', 'table_by_sex_national_time_series.csv')
GOLDEN_DATA_AGE_NATIONAL_TIME_SERIES_APPEND = os.path.join(
    GOLDEN_DIR, 'time_series_appends', 'table_by_age_national_time_series.csv')
GOLDEN_DATA_RACE_NATIONAL_TIME_SERIES_APPEND = os.path.join(
    GOLDEN_DIR, 'time_series_appends', 'table_by_race_national_time_series.csv')
GOLDEN_DATA_AGE_COUNTY_TIME_SERIES_APPEND = os.path.join(
    GOLDEN_DIR, 'time_series_appends', 'table_by_age_county_time_series.csv')


def get_acs_metadata_as_json():
    # print("mocking meta data from GCS")
    with open(os.path.join(TEST_DIR, 'metadata.json')) as f:
        return json.load(f)


def _load_values_as_df(*args, **kwargs):
    """ mock out the retrieval of cached ACS tables from our
    GCS landing bucket, and instead return the equivalent test csv"""
    dataset, filename = args
    dtype = {'county_fips': str} if "county" in filename else {
        'state_fips': str}
    # print("mock GCS cache:", filename)
    df = gcs_to_bq_util.values_json_to_df(
        os.path.join(MOCK_CACHE_DIR, filename), dtype=dtype).reset_index(drop=True)
    return df


# We export this function for use in other packages so it needs its own tests
def testGenerateNationalDatasetRace():
    state_df = pd.read_csv(os.path.join(
        TEST_DIR, 'national', 'state_by_race.csv'), dtype={'state_fips': str})
    expected_df = pd.read_csv(os.path.join(
        TEST_DIR, 'national', 'national_by_race.csv'), dtype={'state_fips': str})
    states_to_include = {'01', '06'}

    national_df = GENERATE_NATIONAL_DATASET(
        state_df, states_to_include, 'race')
    assert_frame_equal(national_df, expected_df, check_like=True)


def testGenerateNationalDatasetSex():
    state_df = pd.read_csv(os.path.join(
        TEST_DIR, 'national', 'state_by_sex.csv'), dtype={'state_fips': str})
    expected_df = pd.read_csv(os.path.join(
        TEST_DIR, 'national', 'national_by_sex.csv'), dtype={'state_fips': str})
    states_to_include = {'01', '06'}

    national_df = GENERATE_NATIONAL_DATASET(state_df, states_to_include, 'sex')
    assert_frame_equal(national_df, expected_df, check_like=True)


def testGenerateNationalDatasetAge():
    state_df = pd.read_csv(os.path.join(
        TEST_DIR, 'national', 'state_by_age.csv'), dtype={'state_fips': str})
    expected_df = pd.read_csv(os.path.join(
        TEST_DIR, 'national', 'national_by_age.csv'), dtype={'state_fips': str})
    states_to_include = {'01', '06'}

    national_df = GENERATE_NATIONAL_DATASET(state_df, states_to_include, 'age')
    assert_frame_equal(national_df, expected_df, check_like=True)


DTYPE = {
    'county_fips': str,
    'state_fips': str,
    'time_period': str,
}


@mock.patch('ingestion.census.fetch_acs_metadata',
            return_value=get_acs_metadata_as_json())
@mock.patch('ingestion.gcs_to_bq_util.load_values_as_df',
            side_effect=_load_values_as_df)
@mock.patch('ingestion.gcs_to_bq_util.add_df_to_bq',
            return_value=None)
def testWriteToBqStateNationalCalls2021(
    mock_bq: mock.MagicMock,
    mock_cache: mock.MagicMock,
    mock_json: mock.MagicMock
):
    """ Test the overall function structure for a state (and national) level ingester,
    based on the order and structure of the mocked calls to ACS, our cache of ACS, and our BQ"""

    acsPopulationIngester = ACSPopulationIngester(
        False, "https://api.census.gov/data/2021/acs/acs5")

    acsPopulationIngester.write_to_bq('dataset', 'gcs_bucket')

    # meta data
    assert mock_json.call_args_list[0][0][0] == "https://api.census.gov/data/2021/acs/acs5"

    # our GCS caching of ACS raw tables
    assert mock_cache.call_count == 11
    called_cached_gcs_names_in_order = [
        call[0][1] for call in mock_cache.call_args_list]
    assert called_cached_gcs_names_in_order == [
        '2021-HISPANIC_OR_LATINO_ORIGIN_BY_RACE_state.json',
        '2021-SEX_BY_AGE_state.json',
        '2021-SEX_BY_AGE_(WHITE_ALONE)_state.json',
        '2021-SEX_BY_AGE_(BLACK_OR_AFRICAN_AMERICAN_ALONE)_state.json',
        '2021-SEX_BY_AGE_(AMERICAN_INDIAN_AND_ALASKA_NATIVE_ALONE)_state.json',
        '2021-SEX_BY_AGE_(ASIAN_ALONE)_state.json',
        '2021-SEX_BY_AGE_(NATIVE_HAWAIIAN_AND_OTHER_PACIFIC_ISLANDER_ALONE)_state.json',
        '2021-SEX_BY_AGE_(SOME_OTHER_RACE_ALONE)_state.json',
        '2021-SEX_BY_AGE_(TWO_OR_MORE_RACES)_state.json',
        '2021-SEX_BY_AGE_(HISPANIC_OR_LATINO)_state.json',
        '2021-SEX_BY_AGE_(WHITE_ALONE,_NOT_HISPANIC_OR_LATINO)_state.json'
    ]

    table_names_for_bq = [call[0][2] for call in mock_bq.call_args_list]
    assert table_names_for_bq == [
        # 2021 should only write to the time_series tables
        'by_race_state_time_series',
        'by_sex_age_race_state_time_series',
        'by_sex_age_state_time_series',
        'by_age_state_time_series',
        'by_sex_state_time_series',
        'by_age_national_time_series',
        'by_race_national_time_series',
        'by_sex_national_time_series'
    ]


@mock.patch('ingestion.census.fetch_acs_metadata',
            return_value=get_acs_metadata_as_json())
@mock.patch('ingestion.gcs_to_bq_util.load_values_as_df',
            side_effect=_load_values_as_df)
@mock.patch('ingestion.gcs_to_bq_util.add_df_to_bq',
            return_value=None)
def testWriteToBqCountyCalls2019(
    mock_bq: mock.MagicMock,
    mock_cache: mock.MagicMock,
    mock_json: mock.MagicMock
):
    """ Test the overall function structure for a county level ingester,
    based on the order and structure of the mocked calls to ACS, our cache of ACS, and our BQ"""
    # print("** Testing County Calls")

    # instantiate with only 2 years to test
    acsPopulationIngester = ACSPopulationIngester(
        True, "https://api.census.gov/data/2019/acs/acs5")

    acsPopulationIngester.write_to_bq('dataset', 'gcs_bucket')

    # meta data
    assert mock_json.call_args_list[0][0][0] == "https://api.census.gov/data/2019/acs/acs5"

    # our GCS caching of ACS raw tables
    assert mock_cache.call_count == 11
    called_cached_gcs_names_in_order = [
        call[0][1] for call in mock_cache.call_args_list]
    assert called_cached_gcs_names_in_order == [
        '2019-HISPANIC_OR_LATINO_ORIGIN_BY_RACE_county.json',
        '2019-SEX_BY_AGE_county.json',
        '2019-SEX_BY_AGE_(WHITE_ALONE)_county.json',
        '2019-SEX_BY_AGE_(BLACK_OR_AFRICAN_AMERICAN_ALONE)_county.json',
        '2019-SEX_BY_AGE_(AMERICAN_INDIAN_AND_ALASKA_NATIVE_ALONE)_county.json',
        '2019-SEX_BY_AGE_(ASIAN_ALONE)_county.json',
        '2019-SEX_BY_AGE_(NATIVE_HAWAIIAN_AND_OTHER_PACIFIC_ISLANDER_ALONE)_county.json',
        '2019-SEX_BY_AGE_(SOME_OTHER_RACE_ALONE)_county.json',
        '2019-SEX_BY_AGE_(TWO_OR_MORE_RACES)_county.json',
        '2019-SEX_BY_AGE_(HISPANIC_OR_LATINO)_county.json',
        '2019-SEX_BY_AGE_(WHITE_ALONE,_NOT_HISPANIC_OR_LATINO)_county.json']

    table_names_for_bq = [
        call[0][2] for call in mock_bq.call_args_list
    ]

    assert table_names_for_bq == [
        # 2019 should write to both SINGLE YEAR and TIME SERIES tables
        'by_race_county',
        'by_race_county_time_series',
        'by_sex_age_race_county',
        'by_sex_age_race_county_time_series',
        'by_sex_age_county',
        'by_sex_age_county_time_series',
        'by_age_county',
        'by_age_county_time_series',
        'by_sex_county',
        'by_sex_county_time_series'
    ]


@mock.patch('ingestion.census.fetch_acs_metadata',
            return_value=get_acs_metadata_as_json())
@mock.patch('ingestion.gcs_to_bq_util.load_values_as_df',
            side_effect=_load_values_as_df)
@mock.patch('ingestion.gcs_to_bq_util.add_df_to_bq',
            return_value=None)
def testWriteToBqRace2019(
    mock_bq: mock.MagicMock,
    mock_cache: mock.MagicMock,
    mock_json: mock.MagicMock
):

    acsPopulationIngester = ACSPopulationIngester(
        False, "https://api.census.gov/data/2019/acs/acs5")
    acsPopulationIngester.write_to_bq('dataset', 'gcs_bucket')

    # 2019 should send a SINGLE YEAR table
    single_year_df = mock_bq.call_args_list[0][0][0]
    expected_single_year_df = pd.read_csv(GOLDEN_DATA_RACE, dtype=DTYPE)
    assert_frame_equal(
        single_year_df, expected_single_year_df, check_like=True)

    # 2019 should only APPEND to an existing time_series table
    assert mock_bq.call_args_list[1][1]['overwrite'] is False
    time_series_append_df = mock_bq.call_args_list[1][0][0]
    expected_time_series_append_df = pd.read_csv(
        GOLDEN_DATA_RACE_TIME_SERIES_APPEND, dtype=DTYPE)
    assert_frame_equal(
        time_series_append_df, expected_time_series_append_df, check_like=True)


@mock.patch('ingestion.census.fetch_acs_metadata',
            return_value=get_acs_metadata_as_json())
@mock.patch('ingestion.gcs_to_bq_util.load_values_as_df',
            side_effect=_load_values_as_df)
@mock.patch('ingestion.gcs_to_bq_util.add_df_to_bq',
            return_value=None)
def testWriteToBqSexAgeRace2021(
    mock_bq: mock.MagicMock,
    mock_cache: mock.MagicMock,
    mock_json: mock.MagicMock
):

    acsPopulationIngester = ACSPopulationIngester(
        False, "https://api.census.gov/data/2021/acs/acs5")
    acsPopulationIngester.write_to_bq('dataset', 'gcs_bucket')

    # 2021 should NOT send a SINGLE YEAR table
    # 2021 should only OVERWRITE an existing time_series table (starting it fresh)
    assert mock_bq.call_args_list[1][1]['overwrite'] is True
    time_series_overwrite_df = mock_bq.call_args_list[1][0][0]
    expected_time_series_overwrite_df = pd.read_csv(
        GOLDEN_DATA_SEX_AGE_RACE_TIME_SERIES_OVERWRITES, dtype=DTYPE)
    assert_frame_equal(
        time_series_overwrite_df, expected_time_series_overwrite_df, check_like=True)


@mock.patch('ingestion.census.fetch_acs_metadata',
            return_value=get_acs_metadata_as_json())
@mock.patch('ingestion.gcs_to_bq_util.load_values_as_df',
            side_effect=_load_values_as_df)
@mock.patch('ingestion.gcs_to_bq_util.add_df_to_bq',
            return_value=None)
def testWriteToBqSexAge2019(
    mock_bq: mock.MagicMock,
    mock_cache: mock.MagicMock,
    mock_json: mock.MagicMock
):

    acsPopulationIngester = ACSPopulationIngester(
        False, "https://api.census.gov/data/2019/acs/acs5")

    acsPopulationIngester.write_to_bq('dataset', 'gcs_bucket')

    # 2019 should send a SINGLE YEAR table
    single_year_df = mock_bq.call_args_list[4][0][0]
    expected_single_year_df = pd.read_csv(GOLDEN_DATA_SEX_AGE, dtype=DTYPE)
    assert_frame_equal(
        single_year_df, expected_single_year_df, check_like=True)

    # 2019 should only APPEND to an existing time_series table
    assert mock_bq.call_args_list[5][1]['overwrite'] is False
    time_series_append_df = mock_bq.call_args_list[5][0][0]
    expected_time_series_append_df = pd.read_csv(
        GOLDEN_DATA_SEX_AGE_TIME_SERIES_APPEND, dtype=DTYPE)
    assert_frame_equal(
        time_series_append_df, expected_time_series_append_df, check_like=True)


@mock.patch('ingestion.census.fetch_acs_metadata',
            return_value=get_acs_metadata_as_json())
@mock.patch('ingestion.gcs_to_bq_util.load_values_as_df',
            side_effect=_load_values_as_df)
@mock.patch('ingestion.gcs_to_bq_util.add_df_to_bq',
            return_value=None)
def testWriteToBqSex(
    mock_bq: mock.MagicMock,
    mock_cache: mock.MagicMock,
    mock_json: mock.MagicMock
):

    acsPopulationIngester = ACSPopulationIngester(
        False, "https://api.census.gov/data/2019/acs/acs5")

    acsPopulationIngester.write_to_bq('dataset', 'gcs_bucket')

    # 2019 should send a SINGLE YEAR table
    single_year_df = mock_bq.call_args_list[8][0][0]
    expected_single_year_df = pd.read_csv(GOLDEN_DATA_SEX, dtype=DTYPE)
    assert_frame_equal(
        single_year_df, expected_single_year_df, check_like=True)

    # 2019 should only APPEND to an existing time_series table
    assert mock_bq.call_args_list[9][1]['overwrite'] is False
    time_series_append_df = mock_bq.call_args_list[9][0][0]
    expected_time_series_append_df = pd.read_csv(
        GOLDEN_DATA_SEX_TIME_SERIES_APPEND, dtype=DTYPE)
    assert_frame_equal(
        time_series_append_df, expected_time_series_append_df, check_like=True)


@mock.patch('ingestion.census.fetch_acs_metadata',
            return_value=get_acs_metadata_as_json())
@mock.patch('ingestion.gcs_to_bq_util.load_values_as_df',
            side_effect=_load_values_as_df)
@mock.patch('ingestion.gcs_to_bq_util.add_df_to_bq',
            return_value=None)
def testWriteToBqRaceNational(
    mock_bq: mock.MagicMock,
    mock_cache: mock.MagicMock,
    mock_json: mock.MagicMock
):

    acsPopulationIngester = ACSPopulationIngester(
        False, "https://api.census.gov/data/2019/acs/acs5")

    acsPopulationIngester.write_to_bq('dataset', 'gcs_bucket')

    # 2019 should send a SINGLE YEAR table
    single_year_df = mock_bq.call_args_list[12][0][0]
    expected_single_year_df = pd.read_csv(
        GOLDEN_DATA_RACE_NATIONAL, dtype=DTYPE)
    assert_frame_equal(
        single_year_df, expected_single_year_df, check_like=True)

    # 2019 should only APPEND to an existing time_series table
    assert mock_bq.call_args_list[13][1]['overwrite'] is False
    time_series_append_df = mock_bq.call_args_list[13][0][0]
    expected_time_series_append_df = pd.read_csv(
        GOLDEN_DATA_RACE_NATIONAL_TIME_SERIES_APPEND, dtype=DTYPE)
    assert_frame_equal(
        time_series_append_df, expected_time_series_append_df, check_like=True)


@mock.patch('ingestion.census.fetch_acs_metadata',
            return_value=get_acs_metadata_as_json())
@mock.patch('ingestion.gcs_to_bq_util.load_values_as_df',
            side_effect=_load_values_as_df)
@mock.patch('ingestion.gcs_to_bq_util.add_df_to_bq',
            return_value=None)
def testWriteToBqSexNational(
    mock_bq: mock.MagicMock,
    mock_cache: mock.MagicMock,
    mock_json: mock.MagicMock
):

    acsPopulationIngester = ACSPopulationIngester(
        False, "https://api.census.gov/data/2019/acs/acs5")

    acsPopulationIngester.write_to_bq('dataset', 'gcs_bucket')

    # 2019 should send a SINGLE YEAR table
    single_year_df = mock_bq.call_args_list[14][0][0]
    expected_single_year_df = pd.read_csv(
        GOLDEN_DATA_SEX_NATIONAL, dtype=DTYPE)
    assert_frame_equal(
        single_year_df, expected_single_year_df, check_like=True)

    # 2019 should only APPEND to an existing time_series table
    assert mock_bq.call_args_list[15][1]['overwrite'] is False
    time_series_append_df = mock_bq.call_args_list[15][0][0]
    expected_time_series_append_df = pd.read_csv(
        GOLDEN_DATA_SEX_NATIONAL_TIME_SERIES_APPEND, dtype=DTYPE)
    assert_frame_equal(
        time_series_append_df, expected_time_series_append_df, check_like=True)


# # Do one County level test to make sure our logic there is correct
@mock.patch('ingestion.census.fetch_acs_metadata',
            return_value=get_acs_metadata_as_json())
@mock.patch('ingestion.gcs_to_bq_util.load_values_as_df',
            side_effect=_load_values_as_df)
@mock.patch('ingestion.gcs_to_bq_util.add_df_to_bq',
            return_value=None)
def testWriteToBqAgeCounty(
    mock_bq: mock.MagicMock,
    mock_cache: mock.MagicMock,
    mock_json: mock.MagicMock
):

    acsPopulationIngester = ACSPopulationIngester(
        True, "https://api.census.gov/data/2019/acs/acs5")

    acsPopulationIngester.write_to_bq('dataset', 'gcs_bucket')

    single_year_df = mock_bq.call_args_list[6][0][0]
    expected_single_year_df = pd.read_csv(
        GOLDEN_DATA_AGE_COUNTY, dtype=DTYPE)
    assert_frame_equal(
        single_year_df, expected_single_year_df, check_like=True)

    time_series_append_df = mock_bq.call_args_list[7][0][0]
    expected_time_series_append_df = pd.read_csv(
        GOLDEN_DATA_AGE_COUNTY_TIME_SERIES_APPEND, dtype=DTYPE)
    assert_frame_equal(
        time_series_append_df, expected_time_series_append_df, check_like=True)
    assert mock_bq.call_args_list[7][1]['overwrite'] is False
