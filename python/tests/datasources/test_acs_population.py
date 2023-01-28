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

# single year golden data
GOLDEN_DATA_RACE = os.path.join(TEST_DIR, 'table_by_race_state.csv')
GOLDEN_DATA_SEX_AGE_RACE = os.path.join(
    TEST_DIR, 'table_by_sex_age_race_state.csv')
GOLDEN_DATA_SEX_AGE = os.path.join(TEST_DIR, 'table_by_sex_age.csv')
GOLDEN_DATA_AGE = os.path.join(TEST_DIR, 'table_by_age.csv')
GOLDEN_DATA_SEX = os.path.join(TEST_DIR, 'table_by_sex.csv')
GOLDEN_DATA_SEX_NATIONAL = os.path.join(TEST_DIR, 'table_by_sex_national.csv')
GOLDEN_DATA_AGE_NATIONAL = os.path.join(TEST_DIR, 'table_by_age_national.csv')
GOLDEN_DATA_RACE_NATIONAL = os.path.join(
    TEST_DIR, 'table_by_race_national.csv')
GOLDEN_DATA_AGE_COUNTY = os.path.join(
    TEST_DIR, 'table_by_age_county.csv')

# time series golden data
GOLDEN_DATA_RACE_TIME_SERIES = os.path.join(
    TEST_DIR, 'table_by_race_state_time_series.csv')
GOLDEN_DATA_SEX_AGE_RACE_TIME_SERIES = os.path.join(
    TEST_DIR, 'table_by_sex_age_race_state_time_series.csv')
GOLDEN_DATA_SEX_AGE_TIME_SERIES = os.path.join(
    TEST_DIR, 'table_by_sex_age_time_series.csv')
GOLDEN_DATA_AGE_TIME_SERIES = os.path.join(
    TEST_DIR, 'table_by_age_time_series.csv')
GOLDEN_DATA_SEX_TIME_SERIES = os.path.join(
    TEST_DIR, 'table_by_sex_time_series.csv')
GOLDEN_DATA_SEX_NATIONAL_TIME_SERIES = os.path.join(
    TEST_DIR, 'table_by_sex_national_time_series.csv')
GOLDEN_DATA_AGE_NATIONAL_TIME_SERIES = os.path.join(
    TEST_DIR, 'table_by_age_national_time_series.csv')
GOLDEN_DATA_RACE_NATIONAL_TIME_SERIES = os.path.join(
    TEST_DIR, 'table_by_race_national_time_series.csv')
GOLDEN_DATA_AGE_COUNTY_TIME_SERIES = os.path.join(
    TEST_DIR, 'table_by_age_county_time_series.csv')


def get_acs_metadata_as_json():
    print("mocking meta data from GCS")
    with open(os.path.join(TEST_DIR, 'metadata.json')) as f:
        return json.load(f)


def _load_values_as_df(*args, **kwargs):
    """ mock out the retrieval of cached ACS tables from our
    GCS landing bucket, and instead return the equivalent test csv"""
    dataset, filename = args
    dtype = {'county_fips': str} if "county" in filename else {
        'state_fips': str}
    print("mocking load of GCS cached file:", filename)
    df = gcs_to_bq_util.values_json_to_df(
        os.path.join(TEST_DIR, filename), dtype=dtype).reset_index(drop=True)
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


@mock.patch('ingestion.census.fetch_acs_metadata',
            return_value=get_acs_metadata_as_json())
@mock.patch('ingestion.gcs_to_bq_util.load_values_as_df',
            side_effect=_load_values_as_df)
@mock.patch('ingestion.gcs_to_bq_util.add_df_to_bq',
            return_value=None)
def testWriteToBqRace(mock_bq: mock.MagicMock, mock_csv: mock.MagicMock, mock_json: mock.MagicMock):
    acsPopulationIngester = ACSPopulationIngester(
        False, ["https://api.census.gov/data/2018/acs/acs5", "https://api.census.gov/data/2019/acs/acs5"])

    acsPopulationIngester.write_to_bq('dataset', 'gcs_bucket')
    assert mock_bq.call_count == 16

    called_table_names = [
        # default single year HET BigQuery tables
        "by_race_state",
        "by_sex_age_race_state",
        "by_sex_age_state",
        "by_age_state",
        "by_sex_state",
        "by_age_national",
        "by_race_national",
        "by_sex_national",
        # multi year HET BigQuery tables
        "by_race_state_time_series",
        "by_sex_age_race_state_time_series",
        "by_sex_age_state_time_series",
        "by_age_state_time_series",
        "by_sex_state_time_series",
        "by_age_national_time_series",
        "by_race_national_time_series",
        "by_sex_national_time_series"
    ]

    for i, call in enumerate(mock_bq.call_args_list):
        assert call[0][2] == called_table_names[i]

    expected_df = pd.read_csv(GOLDEN_DATA_RACE, dtype={
        'county_fips': str,
        'state_fips': str,
    })

    assert_frame_equal(
        mock_bq.call_args_list[0].args[0], expected_df, check_like=True)

    expected_df_time_series = pd.read_csv(GOLDEN_DATA_RACE_TIME_SERIES, dtype={
        'county_fips': str,
        'state_fips': str,
        'time_period': str,
    })

    assert_frame_equal(
        mock_bq.call_args_list[8].args[0], expected_df_time_series, check_like=True)


@mock.patch('ingestion.census.fetch_acs_metadata',
            return_value=get_acs_metadata_as_json())
@mock.patch('ingestion.gcs_to_bq_util.load_values_as_df',
            side_effect=_load_values_as_df)
@mock.patch('ingestion.gcs_to_bq_util.add_df_to_bq',
            return_value=None)
def testWriteToBqSexAgeRace(mock_bq: mock.MagicMock, mock_csv: mock.MagicMock, mock_json: mock.MagicMock):

    acsPopulationIngester = ACSPopulationIngester(
        False, ["https://api.census.gov/data/2018/acs/acs5", "https://api.census.gov/data/2019/acs/acs5"])

    acsPopulationIngester.write_to_bq('dataset', 'gcs_bucket')
    assert mock_bq.call_count == 16

    expected_df = pd.read_csv(GOLDEN_DATA_SEX_AGE_RACE, dtype={
        'state_fips': str,
        'time_period': str,
    })

    assert_frame_equal(
        mock_bq.call_args_list[1].args[0], expected_df, check_like=True)


@mock.patch('ingestion.census.fetch_acs_metadata',
            return_value=get_acs_metadata_as_json())
@mock.patch('ingestion.gcs_to_bq_util.load_values_as_df',
            side_effect=_load_values_as_df)
@mock.patch('ingestion.gcs_to_bq_util.add_df_to_bq',
            return_value=None)
def testWriteToBqSexAge(mock_bq: mock.MagicMock, mock_csv: mock.MagicMock, mock_json: mock.MagicMock):

    acsPopulationIngester = ACSPopulationIngester(
        False, ["https://api.census.gov/data/2018/acs/acs5", "https://api.census.gov/data/2019/acs/acs5"])

    acsPopulationIngester.write_to_bq('dataset', 'gcs_bucket')
    assert mock_bq.call_count == 16

    expected_df = pd.read_csv(GOLDEN_DATA_SEX_AGE, dtype={
        'state_fips': str,
        'time_period': str,
    })
    assert_frame_equal(
        mock_bq.call_args_list[2].args[0], expected_df, check_like=True)


@mock.patch('ingestion.census.fetch_acs_metadata',
            return_value=get_acs_metadata_as_json())
@mock.patch('ingestion.gcs_to_bq_util.load_values_as_df',
            side_effect=_load_values_as_df)
@mock.patch('ingestion.gcs_to_bq_util.add_df_to_bq',
            return_value=None)
def testWriteToBqAge(mock_bq: mock.MagicMock, mock_csv: mock.MagicMock, mock_json: mock.MagicMock):

    acsPopulationIngester = ACSPopulationIngester(
        False, ["https://api.census.gov/data/2018/acs/acs5", "https://api.census.gov/data/2019/acs/acs5"])

    acsPopulationIngester.write_to_bq('dataset', 'gcs_bucket')
    assert mock_bq.call_count == 16

    expected_df = pd.read_csv(GOLDEN_DATA_AGE, dtype={
        'state_fips': str,
        'time_period': str,
    })

    assert_frame_equal(
        mock_bq.call_args_list[3].args[0], expected_df, check_like=True)


@mock.patch('ingestion.census.fetch_acs_metadata',
            return_value=get_acs_metadata_as_json())
@mock.patch('ingestion.gcs_to_bq_util.load_values_as_df',
            side_effect=_load_values_as_df)
@mock.patch('ingestion.gcs_to_bq_util.add_df_to_bq',
            return_value=None)
def testWriteToBqSex(mock_bq: mock.MagicMock, mock_csv: mock.MagicMock, mock_json: mock.MagicMock):

    acsPopulationIngester = ACSPopulationIngester(
        False, ["https://api.census.gov/data/2018/acs/acs5", "https://api.census.gov/data/2019/acs/acs5"])

    acsPopulationIngester.write_to_bq('dataset', 'gcs_bucket')
    assert mock_bq.call_count == 16

    expected_df = pd.read_csv(GOLDEN_DATA_SEX, dtype={
        'state_fips': str,
        'time_period': str,
    })
    assert_frame_equal(
        mock_bq.call_args_list[4].args[0], expected_df, check_like=True)


@mock.patch('ingestion.census.fetch_acs_metadata',
            return_value=get_acs_metadata_as_json())
@mock.patch('ingestion.gcs_to_bq_util.load_values_as_df',
            side_effect=_load_values_as_df)
@mock.patch('ingestion.gcs_to_bq_util.add_df_to_bq',
            return_value=None)
def testWriteToBqAgeNational(mock_bq: mock.MagicMock, mock_csv: mock.MagicMock, mock_json: mock.MagicMock):

    acsPopulationIngester = ACSPopulationIngester(
        False, ["https://api.census.gov/data/2018/acs/acs5", "https://api.census.gov/data/2019/acs/acs5"])

    acsPopulationIngester.write_to_bq('dataset', 'gcs_bucket')
    assert mock_bq.call_count == 16

    expected_df = pd.read_csv(GOLDEN_DATA_AGE_NATIONAL, dtype={
        'state_fips': str,
        'time_period': str,
    })

    assert_frame_equal(
        mock_bq.call_args_list[5].args[0], expected_df, check_like=True)


@mock.patch('ingestion.census.fetch_acs_metadata',
            return_value=get_acs_metadata_as_json())
@mock.patch('ingestion.gcs_to_bq_util.load_values_as_df',
            side_effect=_load_values_as_df)
@mock.patch('ingestion.gcs_to_bq_util.add_df_to_bq',
            return_value=None)
def testWriteToBqRaceNational(mock_bq: mock.MagicMock, mock_csv: mock.MagicMock, mock_json: mock.MagicMock):

    acsPopulationIngester = ACSPopulationIngester(
        False, ["https://api.census.gov/data/2018/acs/acs5", "https://api.census.gov/data/2019/acs/acs5"])

    acsPopulationIngester.write_to_bq('dataset', 'gcs_bucket')
    assert mock_bq.call_count == 16

    expected_df = pd.read_csv(GOLDEN_DATA_RACE_NATIONAL, dtype={
        'state_fips': str,
        'time_period': str,
    })
    assert_frame_equal(
        mock_bq.call_args_list[6].args[0], expected_df, check_like=True)


@mock.patch('ingestion.census.fetch_acs_metadata',
            return_value=get_acs_metadata_as_json())
@mock.patch('ingestion.gcs_to_bq_util.load_values_as_df',
            side_effect=_load_values_as_df)
@mock.patch('ingestion.gcs_to_bq_util.add_df_to_bq',
            return_value=None)
def testWriteToBqSexNational(mock_bq: mock.MagicMock, mock_csv: mock.MagicMock, mock_json: mock.MagicMock):

    acsPopulationIngester = ACSPopulationIngester(
        False, ["https://api.census.gov/data/2018/acs/acs5", "https://api.census.gov/data/2019/acs/acs5"])

    acsPopulationIngester.write_to_bq('dataset', 'gcs_bucket')
    assert mock_bq.call_count == 16

    expected_df = pd.read_csv(GOLDEN_DATA_SEX_NATIONAL, dtype={
        'state_fips': str,
        'time_period': str,
    })
    assert_frame_equal(
        mock_bq.call_args_list[7].args[0], expected_df, check_like=True)


# Do one County level test to make sure our logic there is correct
@mock.patch('ingestion.census.fetch_acs_metadata',
            return_value=get_acs_metadata_as_json())
@mock.patch('ingestion.gcs_to_bq_util.load_values_as_df',
            side_effect=_load_values_as_df)
@mock.patch('ingestion.gcs_to_bq_util.add_df_to_bq',
            return_value=None)
def testWriteToBqAgeCounty(mock_bq: mock.MagicMock, mock_csv: mock.MagicMock, mock_json: mock.MagicMock):

    acsPopulationIngester = ACSPopulationIngester(
        True, ["https://api.census.gov/data/2018/acs/acs5", "https://api.census.gov/data/2019/acs/acs5"])

    acsPopulationIngester.write_to_bq('dataset', 'gcs_bucket')
    assert mock_bq.call_count == 10

    called_table_names = [
        "by_race_county",
        "by_sex_age_race_county",
        "by_sex_age_county",
        "by_age_county",
        "by_sex_county",
        "by_race_county_time_series",
        "by_sex_age_race_county_time_series",
        "by_sex_age_county_time_series",
        "by_age_county_time_series",
        "by_sex_county_time_series"
    ]
    for i, call in enumerate(mock_bq.call_args_list):
        call[0][2] == called_table_names[i]

    expected_df = pd.read_csv(GOLDEN_DATA_AGE_COUNTY, dtype={
        'state_fips': str,
        'county_fips': str,
    })

    assert_frame_equal(
        mock_bq.call_args_list[3].args[0], expected_df, check_like=True)

    expected_df_time_series = pd.read_csv(GOLDEN_DATA_AGE_COUNTY_TIME_SERIES, dtype={
        'state_fips': str,
        'county_fips': str,
        'time_period': str,
    })

    assert_frame_equal(
        mock_bq.call_args_list[8].args[0], expected_df_time_series, check_like=True)
