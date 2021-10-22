import os
import json

import pandas as pd

from unittest import mock
from pandas._testing import assert_frame_equal

from datasources.acs_population import ACSPopulationIngester, SEX_BY_AGE_CONCEPTS_TO_RACE
from ingestion import gcs_to_bq_util

# Current working directory.
THIS_DIR = os.path.dirname(os.path.abspath(__file__))
TEST_DIR = os.path.join(THIS_DIR, os.pardir, "data", "acs_population")

GOLDEN_DATA_RACE = os.path.join(TEST_DIR, 'table_by_race_state_std.csv')
GOLDEN_DATA_SEX_AGE_RACE = os.path.join(TEST_DIR, 'table_by_sex_age_race_state_std.csv')
GOLDEN_DATA_SEX_AGE = os.path.join(TEST_DIR, 'table_by_sex_age.csv')
GOLDEN_DATA_AGE = os.path.join(TEST_DIR, 'table_by_age.csv')
GOLDEN_DATA_SEX = os.path.join(TEST_DIR, 'table_by_sex.csv')

GOLDEN_DATA_AGE_COUNTY = os.path.join(TEST_DIR, 'table_by_age_county.csv')


def get_acs_metadata_as_json():
    with open(os.path.join(TEST_DIR, 'metadata.json')) as f:
        return json.load(f)


def get_hispanic_or_latino_values_by_race_state_as_df():
    return gcs_to_bq_util.values_json_to_dataframe(
            os.path.join(TEST_DIR, 'HISPANIC_OR_LATINO_ORIGIN_BY_RACE_state.json')).reset_index(drop=True)


def get_hispanic_or_latino_values_by_race_county_as_df():
    return gcs_to_bq_util.values_json_to_dataframe(
            os.path.join(TEST_DIR, 'HISPANIC_OR_LATINO_ORIGIN_BY_RACE_county.json')).reset_index(drop=True)


def get_sex_by_age_value_as_df(concept):
    filename = '%s_state.json' % concept.replace(' ', '_')
    return gcs_to_bq_util.values_json_to_dataframe(
            os.path.join(TEST_DIR, filename)).reset_index(drop=True)


def get_sex_by_age_county_value_as_df(concept):
    filename = '%s_county.json' % concept.replace(' ', '_')
    return gcs_to_bq_util.values_json_to_dataframe(
            os.path.join(TEST_DIR, filename)).reset_index(drop=True)


@mock.patch('ingestion.census.fetch_acs_metadata',
            return_value=get_acs_metadata_as_json())
@mock.patch('ingestion.gcs_to_bq_util.load_values_as_dataframe',
            return_value=get_hispanic_or_latino_values_by_race_state_as_df())
@mock.patch('ingestion.gcs_to_bq_util.add_dataframe_to_bq',
            return_value=None)
def testWriteToBqRace(mock_bq: mock.MagicMock, mock_csv: mock.MagicMock, mock_json: mock.MagicMock):
    acsPopulationIngester = ACSPopulationIngester(False, "https://SOME-URL")

    acsPopulationIngester.write_to_bq('dataset', 'gcs_bucket')
    assert mock_bq.call_count == 5

    expected_df = pd.read_csv(GOLDEN_DATA_RACE, dtype={
        'state_fips': str,
    })
    assert_frame_equal(mock_bq.call_args_list[0].args[0], expected_df, check_like=True)


@mock.patch('ingestion.census.fetch_acs_metadata',
            return_value=get_acs_metadata_as_json())
@mock.patch('ingestion.gcs_to_bq_util.load_values_as_dataframe')
@mock.patch('ingestion.gcs_to_bq_util.add_dataframe_to_bq',
            return_value=None)
def testWriteToBqSexAgeRace(mock_bq: mock.MagicMock, mock_csv: mock.MagicMock, mock_json: mock.MagicMock):
    side_effects = [get_hispanic_or_latino_values_by_race_state_as_df()]
    for concept in SEX_BY_AGE_CONCEPTS_TO_RACE:
        side_effects.append(get_sex_by_age_value_as_df(concept))
    mock_csv.side_effect = side_effects

    acsPopulationIngester = ACSPopulationIngester(False, "https://SOME-URL")

    acsPopulationIngester.write_to_bq('dataset', 'gcs_bucket')
    assert mock_bq.call_count == 5

    expected_df = pd.read_csv(GOLDEN_DATA_SEX_AGE_RACE, dtype={
        'state_fips': str,
    })
    assert_frame_equal(mock_bq.call_args_list[1].args[0], expected_df, check_like=True)


@mock.patch('ingestion.census.fetch_acs_metadata',
            return_value=get_acs_metadata_as_json())
@mock.patch('ingestion.gcs_to_bq_util.load_values_as_dataframe')
@mock.patch('ingestion.gcs_to_bq_util.add_dataframe_to_bq',
            return_value=None)
def testWriteToBqSexAge(mock_bq: mock.MagicMock, mock_csv: mock.MagicMock, mock_json: mock.MagicMock):
    side_effects = [get_hispanic_or_latino_values_by_race_state_as_df()]
    for concept in SEX_BY_AGE_CONCEPTS_TO_RACE:
        side_effects.append(get_sex_by_age_value_as_df(concept))
    mock_csv.side_effect = side_effects

    acsPopulationIngester = ACSPopulationIngester(False, "https://SOME-URL")

    acsPopulationIngester.write_to_bq('dataset', 'gcs_bucket')
    assert mock_bq.call_count == 5

    expected_df = pd.read_csv(GOLDEN_DATA_SEX_AGE, dtype={
        'state_fips': str,
    })
    assert_frame_equal(mock_bq.call_args_list[2].args[0], expected_df, check_like=True)


@mock.patch('ingestion.census.fetch_acs_metadata',
            return_value=get_acs_metadata_as_json())
@mock.patch('ingestion.gcs_to_bq_util.load_values_as_dataframe')
@mock.patch('ingestion.gcs_to_bq_util.add_dataframe_to_bq',
            return_value=None)
def testWriteToBqAge(mock_bq: mock.MagicMock, mock_csv: mock.MagicMock, mock_json: mock.MagicMock):
    side_effects = [get_hispanic_or_latino_values_by_race_state_as_df()]
    for concept in SEX_BY_AGE_CONCEPTS_TO_RACE:
        side_effects.append(get_sex_by_age_value_as_df(concept))
    mock_csv.side_effect = side_effects

    acsPopulationIngester = ACSPopulationIngester(False, "https://SOME-URL")

    acsPopulationIngester.write_to_bq('dataset', 'gcs_bucket')
    assert mock_bq.call_count == 5

    expected_df = pd.read_csv(GOLDEN_DATA_AGE, dtype={
        'state_fips': str,
    })
    assert_frame_equal(mock_bq.call_args_list[3].args[0], expected_df, check_like=True)


@mock.patch('ingestion.census.fetch_acs_metadata',
            return_value=get_acs_metadata_as_json())
@mock.patch('ingestion.gcs_to_bq_util.load_values_as_dataframe')
@mock.patch('ingestion.gcs_to_bq_util.add_dataframe_to_bq',
            return_value=None)
def testWriteToBqSex(mock_bq: mock.MagicMock, mock_csv: mock.MagicMock, mock_json: mock.MagicMock):
    side_effects = [get_hispanic_or_latino_values_by_race_state_as_df()]
    for concept in SEX_BY_AGE_CONCEPTS_TO_RACE:
        side_effects.append(get_sex_by_age_value_as_df(concept))
    mock_csv.side_effect = side_effects

    acsPopulationIngester = ACSPopulationIngester(False, "https://SOME-URL")

    acsPopulationIngester.write_to_bq('dataset', 'gcs_bucket')
    assert mock_bq.call_count == 5

    expected_df = pd.read_csv(GOLDEN_DATA_SEX, dtype={
        'state_fips': str,
    })
    assert_frame_equal(mock_bq.call_args_list[4].args[0], expected_df, check_like=True)


# Do one County level test to make sure our logic there is correct
@mock.patch('ingestion.census.fetch_acs_metadata',
            return_value=get_acs_metadata_as_json())
@mock.patch('ingestion.gcs_to_bq_util.load_values_as_dataframe')
@mock.patch('ingestion.gcs_to_bq_util.add_dataframe_to_bq',
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
    assert_frame_equal(mock_bq.call_args_list[3].args[0], expected_df, check_like=True)
