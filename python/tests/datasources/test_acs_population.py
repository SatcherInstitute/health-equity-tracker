import os
import pandas as pd
from unittest import mock
from pandas._testing import assert_frame_equal

from datasources.acs_population import (  # type: ignore
    ACSPopulationIngester, SEX_BY_AGE_CONCEPTS_TO_RACE, GENERATE_NATIONAL_DATASET)
from ingestion import gcs_to_bq_util
from test_utils import get_acs_metadata_as_json

# Current working directory.
THIS_DIR = os.path.dirname(os.path.abspath(__file__))
TEST_DIR = os.path.join(THIS_DIR, os.pardir, 'data', 'acs_population')

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

GOLDEN_DATA_AGE_COUNTY = os.path.join(TEST_DIR, 'table_by_age_county.csv')


def get_hispanic_or_latino_values_by_race_state_as_df():
    return gcs_to_bq_util.values_json_to_df(
        os.path.join(
            TEST_DIR,
            'HISPANIC_OR_LATINO_ORIGIN_BY_RACE_state.json'
        ), dtype={'state_fips': str}).reset_index(drop=True)


def get_hispanic_or_latino_values_by_race_county_as_df():
    return gcs_to_bq_util.values_json_to_df(
        os.path.join(
            TEST_DIR,
            'HISPANIC_OR_LATINO_ORIGIN_BY_RACE_county.json'),
        dtype={'state_fips': str}).reset_index(drop=True)


def get_sex_by_age_value_as_df(concept):
    filename = '%s_state.json' % concept.replace(' ', '_')
    return gcs_to_bq_util.values_json_to_df(
        os.path.join(TEST_DIR, filename), dtype={'state_fips': str}).reset_index(drop=True)


def get_sex_by_age_county_value_as_df(concept):
    filename = '%s_county.json' % concept.replace(' ', '_')
    return gcs_to_bq_util.values_json_to_df(
        os.path.join(TEST_DIR, filename), dtype={'county_fips': str}).reset_index(drop=True)


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
            return_value=get_hispanic_or_latino_values_by_race_state_as_df())
@mock.patch('ingestion.gcs_to_bq_util.add_df_to_bq',
            return_value=None)
def testWriteToBqRace(mock_bq: mock.MagicMock, mock_csv: mock.MagicMock, mock_json: mock.MagicMock):
    acsPopulationIngester = ACSPopulationIngester(False, "https://SOME-URL")

    acsPopulationIngester.write_to_bq('dataset', 'gcs_bucket')
    assert mock_bq.call_count == 8

    expected_df = pd.read_csv(GOLDEN_DATA_RACE, dtype={
        'county_fips': str,
        'state_fips': str,
    })

    assert_frame_equal(
        mock_bq.call_args_list[0].args[0], expected_df, check_like=True)


@mock.patch('ingestion.census.fetch_acs_metadata',
            return_value=get_acs_metadata_as_json())
@mock.patch('ingestion.gcs_to_bq_util.load_values_as_df')
@mock.patch('ingestion.gcs_to_bq_util.add_df_to_bq',
            return_value=None)
def testWriteToBqSexAgeRace(mock_bq: mock.MagicMock, mock_csv: mock.MagicMock, mock_json: mock.MagicMock):
    side_effects = [get_hispanic_or_latino_values_by_race_state_as_df()]
    for concept in SEX_BY_AGE_CONCEPTS_TO_RACE:
        side_effects.append(get_sex_by_age_value_as_df(concept))
    mock_csv.side_effect = side_effects

    acsPopulationIngester = ACSPopulationIngester(False, "https://SOME-URL")

    acsPopulationIngester.write_to_bq('dataset', 'gcs_bucket')
    assert mock_bq.call_count == 8

    expected_df = pd.read_csv(GOLDEN_DATA_SEX_AGE_RACE, dtype={
        'state_fips': str,
    })

    assert_frame_equal(
        mock_bq.call_args_list[1].args[0], expected_df, check_like=True)


@mock.patch('ingestion.census.fetch_acs_metadata',
            return_value=get_acs_metadata_as_json())
@mock.patch('ingestion.gcs_to_bq_util.load_values_as_df')
@mock.patch('ingestion.gcs_to_bq_util.add_df_to_bq',
            return_value=None)
def testWriteToBqSexAge(mock_bq: mock.MagicMock, mock_csv: mock.MagicMock, mock_json: mock.MagicMock):
    side_effects = [get_hispanic_or_latino_values_by_race_state_as_df()]
    for concept in SEX_BY_AGE_CONCEPTS_TO_RACE:
        side_effects.append(get_sex_by_age_value_as_df(concept))
    mock_csv.side_effect = side_effects

    acsPopulationIngester = ACSPopulationIngester(False, "https://SOME-URL")

    acsPopulationIngester.write_to_bq('dataset', 'gcs_bucket')
    assert mock_bq.call_count == 8

    expected_df = pd.read_csv(GOLDEN_DATA_SEX_AGE, dtype={
        'state_fips': str,
    })
    assert_frame_equal(
        mock_bq.call_args_list[2].args[0], expected_df, check_like=True)


@mock.patch('ingestion.census.fetch_acs_metadata',
            return_value=get_acs_metadata_as_json())
@mock.patch('ingestion.gcs_to_bq_util.load_values_as_df')
@mock.patch('ingestion.gcs_to_bq_util.add_df_to_bq',
            return_value=None)
def testWriteToBqAge(mock_bq: mock.MagicMock, mock_csv: mock.MagicMock, mock_json: mock.MagicMock):
    side_effects = [get_hispanic_or_latino_values_by_race_state_as_df()]
    for concept in SEX_BY_AGE_CONCEPTS_TO_RACE:
        side_effects.append(get_sex_by_age_value_as_df(concept))
    mock_csv.side_effect = side_effects

    acsPopulationIngester = ACSPopulationIngester(False, "https://SOME-URL")

    acsPopulationIngester.write_to_bq('dataset', 'gcs_bucket')
    assert mock_bq.call_count == 8

    expected_df = pd.read_csv(GOLDEN_DATA_AGE, dtype={
        'state_fips': str,
    })

    # # save results to file
    # mock_bq.call_args_list[3].args[0].to_csv(
    #     "acs-run-results-state.csv")

    assert_frame_equal(
        mock_bq.call_args_list[3].args[0], expected_df, check_like=True)


@mock.patch('ingestion.census.fetch_acs_metadata',
            return_value=get_acs_metadata_as_json())
@mock.patch('ingestion.gcs_to_bq_util.load_values_as_df')
@mock.patch('ingestion.gcs_to_bq_util.add_df_to_bq',
            return_value=None)
def testWriteToBqSex(mock_bq: mock.MagicMock, mock_csv: mock.MagicMock, mock_json: mock.MagicMock):
    side_effects = [get_hispanic_or_latino_values_by_race_state_as_df()]
    for concept in SEX_BY_AGE_CONCEPTS_TO_RACE:
        side_effects.append(get_sex_by_age_value_as_df(concept))
    mock_csv.side_effect = side_effects

    acsPopulationIngester = ACSPopulationIngester(False, "https://SOME-URL")

    acsPopulationIngester.write_to_bq('dataset', 'gcs_bucket')
    assert mock_bq.call_count == 8

    expected_df = pd.read_csv(GOLDEN_DATA_SEX, dtype={
        'state_fips': str,
    })
    assert_frame_equal(
        mock_bq.call_args_list[4].args[0], expected_df, check_like=True)


@mock.patch('ingestion.census.fetch_acs_metadata',
            return_value=get_acs_metadata_as_json())
@mock.patch('ingestion.gcs_to_bq_util.load_values_as_df')
@mock.patch('ingestion.gcs_to_bq_util.add_df_to_bq',
            return_value=None)
def testWriteToBqAgeNational(mock_bq: mock.MagicMock, mock_csv: mock.MagicMock, mock_json: mock.MagicMock):
    side_effects = [get_hispanic_or_latino_values_by_race_state_as_df()]
    for concept in SEX_BY_AGE_CONCEPTS_TO_RACE:
        side_effects.append(get_sex_by_age_value_as_df(concept))
    mock_csv.side_effect = side_effects

    acsPopulationIngester = ACSPopulationIngester(False, "https://SOME-URL")

    acsPopulationIngester.write_to_bq('dataset', 'gcs_bucket')
    assert mock_bq.call_count == 8

    expected_df = pd.read_csv(GOLDEN_DATA_AGE_NATIONAL, dtype={
        'state_fips': str,
    })

    assert_frame_equal(
        mock_bq.call_args_list[5].args[0], expected_df, check_like=True)


@mock.patch('ingestion.census.fetch_acs_metadata',
            return_value=get_acs_metadata_as_json())
@mock.patch('ingestion.gcs_to_bq_util.load_values_as_df')
@mock.patch('ingestion.gcs_to_bq_util.add_df_to_bq',
            return_value=None)
def testWriteToBqRaceNational(mock_bq: mock.MagicMock, mock_csv: mock.MagicMock, mock_json: mock.MagicMock):
    side_effects = [get_hispanic_or_latino_values_by_race_state_as_df()]
    for concept in SEX_BY_AGE_CONCEPTS_TO_RACE:
        side_effects.append(get_sex_by_age_value_as_df(concept))
    mock_csv.side_effect = side_effects

    acsPopulationIngester = ACSPopulationIngester(False, "https://SOME-URL")

    acsPopulationIngester.write_to_bq('dataset', 'gcs_bucket')
    assert mock_bq.call_count == 8

    expected_df = pd.read_csv(GOLDEN_DATA_RACE_NATIONAL, dtype={
        'state_fips': str,
    })
    assert_frame_equal(
        mock_bq.call_args_list[6].args[0], expected_df, check_like=True)


@mock.patch('ingestion.census.fetch_acs_metadata',
            return_value=get_acs_metadata_as_json())
@mock.patch('ingestion.gcs_to_bq_util.load_values_as_df')
@mock.patch('ingestion.gcs_to_bq_util.add_df_to_bq',
            return_value=None)
def testWriteToBqSexNational(mock_bq: mock.MagicMock, mock_csv: mock.MagicMock, mock_json: mock.MagicMock):
    side_effects = [get_hispanic_or_latino_values_by_race_state_as_df()]
    for concept in SEX_BY_AGE_CONCEPTS_TO_RACE:
        side_effects.append(get_sex_by_age_value_as_df(concept))
    mock_csv.side_effect = side_effects

    acsPopulationIngester = ACSPopulationIngester(False, "https://SOME-URL")

    acsPopulationIngester.write_to_bq('dataset', 'gcs_bucket')
    assert mock_bq.call_count == 8

    expected_df = pd.read_csv(GOLDEN_DATA_SEX_NATIONAL, dtype={
        'state_fips': str,
    })
    assert_frame_equal(
        mock_bq.call_args_list[7].args[0], expected_df, check_like=True)


# Do one County level test to make sure our logic there is correct
@mock.patch('ingestion.census.fetch_acs_metadata',
            return_value=get_acs_metadata_as_json())
@mock.patch('ingestion.gcs_to_bq_util.load_values_as_df')
@mock.patch('ingestion.gcs_to_bq_util.add_df_to_bq',
            return_value=None)
def testWriteToBqAgeCounty(mock_bq: mock.MagicMock, mock_csv: mock.MagicMock, mock_json: mock.MagicMock):
    side_effects = [get_hispanic_or_latino_values_by_race_county_as_df()]
    for concept in SEX_BY_AGE_CONCEPTS_TO_RACE:
        side_effects.append(get_sex_by_age_county_value_as_df(concept))
    mock_csv.side_effect = side_effects

    acsPopulationIngester = ACSPopulationIngester(True, "https://SOME-URL")

    acsPopulationIngester.write_to_bq('dataset', 'gcs_bucket')
    assert mock_bq.call_count == 5

    expected_df = pd.read_csv(GOLDEN_DATA_AGE_COUNTY, dtype={
        'state_fips': str,
        'county_fips': str,
    })

    assert_frame_equal(
        mock_bq.call_args_list[3].args[0], expected_df, check_like=True)
