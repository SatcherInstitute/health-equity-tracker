import os
import json
import pandas as pd
from unittest import mock
from pandas._testing import assert_frame_equal

from datasources.acs_population import (  # type: ignore
    ACSPopulation, ACSPopulationIngester, SEX_BY_AGE_CONCEPTS_TO_RACE, GENERATE_NATIONAL_DATASET)
from ingestion import gcs_to_bq_util

# Current working directory.
THIS_DIR = os.path.dirname(os.path.abspath(__file__))
TEST_DIR = os.path.join(THIS_DIR, os.pardir, "data", "acs_population")

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

GOLDEN_DATA_RACE_ALT_YEAR = os.path.join(
    TEST_DIR, 'table_by_race_state_alt_year.csv')


def get_acs_metadata_as_json():
    with open(os.path.join(TEST_DIR, 'metadata.json')) as f:
        return json.load(f)


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


def _load_values_as_df(*args, **kwargs):
    print("mocking a call for load_values_as_df()")
    for arg in args:
        print("-")
        print(arg)
    for kwarg in kwargs:
        print("--")
        print(kwarg)

    url, filename = args

    if filename == "2019_HISPANIC_OR_LATINO_ORIGIN_BY_RACE_county.json":
        return get_hispanic_or_latino_values_by_race_county_as_df()
    if filename == "2019_SEX_BY_AGE_county.json":
        return get_sex_by_age_county_value_as_df("SEX BY AGE")
    if filename == "2019_SEX_BY_AGE_(WHITE_ALONE)_county.json":
        return get_sex_by_age_county_value_as_df("SEX BY AGE (WHITE ALONE)")
    if filename == "2019_SEX_BY_AGE_(BLACK_OR_AFRICAN_AMERICAN_ALONE)_county.json":
        return get_sex_by_age_county_value_as_df("SEX BY AGE (BLACK OR AFRICAN AMERICAN ALONE)")
    if filename == "2019_SEX_BY_AGE_(AMERICAN_INDIAN_AND_ALASKA_NATIVE_ALONE)_county.json":
        return get_sex_by_age_county_value_as_df("SEX BY AGE (AMERICAN INDIAN AND ALASKA NATIVE ALONE)")
    if filename == "2019_SEX_BY_AGE_(ASIAN_ALONE)_county.json":
        return get_sex_by_age_county_value_as_df("SEX BY AGE (ASIAN ALONE)")
    if filename == "2019_SEX_BY_AGE_(NATIVE_HAWAIIAN_AND_OTHER_PACIFIC_ISLANDER_ALONE)_county.json":
        return get_sex_by_age_county_value_as_df("SEX BY AGE (NATIVE HAWAIIAN AND OTHER PACIFIC ISLANDER ALONE)")
    if filename == "2019_SEX_BY_AGE_(SOME_OTHER_RACE_ALONE)_county.json":
        return get_sex_by_age_county_value_as_df("SEX BY AGE (SOME OTHER RACE ALONE)")
    if filename == "2019_SEX_BY_AGE_(TWO_OR_MORE_RACES)_county.json":
        return get_sex_by_age_county_value_as_df("SEX BY AGE (TWO OR MORE RACES)")
    if filename == "2019_SEX_BY_AGE_(HISPANIC_OR_LATINO)_county.json":
        return get_sex_by_age_county_value_as_df("SEX BY AGE (HISPANIC OR LATINO)")
    if filename == "2019_SEX_BY_AGE_(WHITE_ALONE,_NOT_HISPANIC_OR_LATINO)_county.json":
        return get_sex_by_age_county_value_as_df("SEX BY AGE (WHITE ALONE, NOT HISPANIC OR LATINO)")

    if filename == "2009_HISPANIC_OR_LATINO_ORIGIN_BY_RACE_county.json":
        return get_hispanic_or_latino_values_by_race_county_as_df()
    if filename == "2009_SEX_BY_AGE_county.json":
        return get_sex_by_age_county_value_as_df("SEX BY AGE")
    if filename == "2009_SEX_BY_AGE_(WHITE_ALONE)_county.json":
        return get_sex_by_age_county_value_as_df("SEX BY AGE (WHITE ALONE)")
    if filename == "2009_SEX_BY_AGE_(BLACK_OR_AFRICAN_AMERICAN_ALONE)_county.json":
        return get_sex_by_age_county_value_as_df("SEX BY AGE (BLACK OR AFRICAN AMERICAN ALONE)")
    if filename == "2009_SEX_BY_AGE_(AMERICAN_INDIAN_AND_ALASKA_NATIVE_ALONE)_county.json":
        return get_sex_by_age_county_value_as_df("SEX BY AGE (AMERICAN INDIAN AND ALASKA NATIVE ALONE)")
    if filename == "2009_SEX_BY_AGE_(ASIAN_ALONE)_county.json":
        return get_sex_by_age_county_value_as_df("SEX BY AGE (ASIAN ALONE)")
    if filename == "2009_SEX_BY_AGE_(NATIVE_HAWAIIAN_AND_OTHER_PACIFIC_ISLANDER_ALONE)_county.json":
        return get_sex_by_age_county_value_as_df("SEX BY AGE (NATIVE HAWAIIAN AND OTHER PACIFIC ISLANDER ALONE)")
    if filename == "2009_SEX_BY_AGE_(SOME_OTHER_RACE_ALONE)_county.json":
        return get_sex_by_age_county_value_as_df("SEX BY AGE (SOME OTHER RACE ALONE)")
    if filename == "2009_SEX_BY_AGE_(TWO_OR_MORE_RACES)_county.json":
        return get_sex_by_age_county_value_as_df("SEX BY AGE (TWO OR MORE RACES)")
    if filename == "2009_SEX_BY_AGE_(HISPANIC_OR_LATINO)_county.json":
        return get_sex_by_age_county_value_as_df("SEX BY AGE (HISPANIC OR LATINO)")
    if filename == "2009_SEX_BY_AGE_(WHITE_ALONE,_NOT_HISPANIC_OR_LATINO)_county.json":
        return get_sex_by_age_county_value_as_df("SEX BY AGE (WHITE ALONE, NOT HISPANIC OR LATINO)")

    print("oops, requested a GCS file that's not yet mocked")


###
# ACSPopulation Tests
###
@mock.patch('ingestion.gcs_to_bq_util.load_values_as_df', side_effect=_load_values_as_df)
@mock.patch('ingestion.gcs_to_bq_util.add_df_to_bq',
            return_value=None)
def test_write_to_bq(
    mock_bq: mock.MagicMock,
    mock_cached_gcs: mock.MagicMock
):
    """ ACSPopulation.write_to_bq() is responsible for iterating over
    all cached geo/demo/year files from ACS, combining the years into
    a single geo/demo table, and then writing to BigQuery   """

    acs = ACSPopulation()

    acs.write_to_bq("some_dataset", "https://SOME-URL")

    assert mock_bq.call_count == 9


###
# ACSPopulationIngester Tests
###


# @mock.patch('ingestion.census.fetch_acs_metadata',
#             return_value=get_acs_metadata_as_json())
# @mock.patch('ingestion.gcs_to_bq_util.load_values_as_df',
#             return_value=get_hispanic_or_latino_values_by_race_state_as_df())
# def testWriteToBqRace(mock_csv: mock.MagicMock, mock_json: mock.MagicMock):
#     acsPopulationIngester = ACSPopulationIngester(False, "https://SOME-URL")

#     (df, table_name) = acsPopulationIngester.generate_yearly_table_tuple('gcs_bucket')

#     expected_df = pd.read_csv(GOLDEN_DATA_RACE, dtype={
#         'county_fips': str,
#         'state_fips': str,
#     })

#     assert_frame_equal(
#         df, expected_df, check_like=True)


# @mock.patch('ingestion.census.fetch_acs_metadata',
#             return_value=get_acs_metadata_as_json())
# @mock.patch('ingestion.gcs_to_bq_util.load_values_as_df')
# def testWriteToBqSexAgeRace(mock_csv: mock.MagicMock, mock_json: mock.MagicMock):
#     side_effects = [get_hispanic_or_latino_values_by_race_state_as_df()]
#     for concept in SEX_BY_AGE_CONCEPTS_TO_RACE:
#         side_effects.append(get_sex_by_age_value_as_df(concept))
#     mock_csv.side_effect = side_effects

#     acsPopulationIngester = ACSPopulationIngester(False, "https://SOME-URL")

#     (df, table_name) = acsPopulationIngester.generate_yearly_table_tuple(
#         'gcs_bucket')

#     expected_df = pd.read_csv(GOLDEN_DATA_SEX_AGE_RACE, dtype={
#         'state_fips': str,
#     })

#     print("table_name", table_name)
#     print(df.columns)
#     print(df)
#     print(expected_df.columns)
#     print(expected_df)
#     assert_frame_equal(
#         df, expected_df, check_like=True)


# @mock.patch('ingestion.census.fetch_acs_metadata',
#             return_value=get_acs_metadata_as_json())
# @mock.patch('ingestion.gcs_to_bq_util.load_values_as_df')
# def testWriteToBqSexAge(mock_csv: mock.MagicMock, mock_json: mock.MagicMock):
#     side_effects = [get_hispanic_or_latino_values_by_race_state_as_df()]
#     for concept in SEX_BY_AGE_CONCEPTS_TO_RACE:
#         side_effects.append(get_sex_by_age_value_as_df(concept))
#     mock_csv.side_effect = side_effects

#     acsPopulationIngester = ACSPopulationIngester(False, "https://SOME-URL")

#     (df, table_name) = acsPopulationIngester.generate_yearly_table_tuple(
#         'gcs_bucket')

#     expected_df = pd.read_csv(GOLDEN_DATA_SEX_AGE, dtype={
#         'state_fips': str,
#     })
#     assert_frame_equal(
#         df, expected_df, check_like=True)


# @mock.patch('ingestion.census.fetch_acs_metadata',
#             return_value=get_acs_metadata_as_json())
# @mock.patch('ingestion.gcs_to_bq_util.load_values_as_df')
# def testWriteToBqAge(mock_csv: mock.MagicMock, mock_json: mock.MagicMock):
#     side_effects = [get_hispanic_or_latino_values_by_race_state_as_df()]
#     for concept in SEX_BY_AGE_CONCEPTS_TO_RACE:
#         side_effects.append(get_sex_by_age_value_as_df(concept))
#     mock_csv.side_effect = side_effects

#     acsPopulationIngester = ACSPopulationIngester(
#         False, "https://SOME-URL", "2019")

#     (df, table_name) = acsPopulationIngester.generate_yearly_table_tuple(
#         'gcs_bucket')

#     expected_df = pd.read_csv(GOLDEN_DATA_AGE, dtype={
#         'state_fips': str,
#     })

#     print(table_name)
#     print(df.to_string())
#     print(expected_df.to_string())

#     assert_frame_equal(
#         df, expected_df, check_like=True)


# @mock.patch('ingestion.census.fetch_acs_metadata',
#             return_value=get_acs_metadata_as_json())
# @mock.patch('ingestion.gcs_to_bq_util.load_values_as_df')
# def testWriteToBqSex(mock_csv: mock.MagicMock, mock_json: mock.MagicMock):
#     side_effects = [get_hispanic_or_latino_values_by_race_state_as_df()]
#     for concept in SEX_BY_AGE_CONCEPTS_TO_RACE:
#         side_effects.append(get_sex_by_age_value_as_df(concept))
#     mock_csv.side_effect = side_effects

#     acsPopulationIngester = ACSPopulationIngester(False, "https://SOME-URL")

#     (df, table_name) = acsPopulationIngester.generate_yearly_table_tuple(
#         'gcs_bucket')

#     expected_df = pd.read_csv(GOLDEN_DATA_SEX, dtype={
#         'state_fips': str,
#     })
#     assert_frame_equal(
#         df, expected_df, check_like=True)


# @mock.patch('ingestion.census.fetch_acs_metadata',
#             return_value=get_acs_metadata_as_json())
# @mock.patch('ingestion.gcs_to_bq_util.load_values_as_df')
# def testWriteToBqAgeNational(mock_csv: mock.MagicMock, mock_json: mock.MagicMock):
#     side_effects = [get_hispanic_or_latino_values_by_race_state_as_df()]
#     for concept in SEX_BY_AGE_CONCEPTS_TO_RACE:
#         side_effects.append(get_sex_by_age_value_as_df(concept))
#     mock_csv.side_effect = side_effects

#     acsPopulationIngester = ACSPopulationIngester(False, "https://SOME-URL")

#     (df, table_name) = acsPopulationIngester.generate_yearly_table_tuple(
#         'gcs_bucket')

#     expected_df = pd.read_csv(GOLDEN_DATA_AGE_NATIONAL, dtype={
#         'state_fips': str,
#     })

#     assert_frame_equal(
#         df, expected_df, check_like=True)


# @mock.patch('ingestion.census.fetch_acs_metadata',
#             return_value=get_acs_metadata_as_json())
# @mock.patch('ingestion.gcs_to_bq_util.load_values_as_df')
# def testWriteToBqRaceNational(mock_csv: mock.MagicMock, mock_json: mock.MagicMock):
#     side_effects = [get_hispanic_or_latino_values_by_race_state_as_df()]
#     for concept in SEX_BY_AGE_CONCEPTS_TO_RACE:
#         side_effects.append(get_sex_by_age_value_as_df(concept))
#     mock_csv.side_effect = side_effects

#     acsPopulationIngester = ACSPopulationIngester(False, "https://SOME-URL")

#     (df, table_name) = acsPopulationIngester.generate_yearly_table_tuple(
#         'gcs_bucket')

#     expected_df = pd.read_csv(GOLDEN_DATA_RACE_NATIONAL, dtype={
#         'state_fips': str,
#     })
#     assert_frame_equal(
#         df, expected_df, check_like=True)


# @mock.patch('ingestion.census.fetch_acs_metadata',
#             return_value=get_acs_metadata_as_json())
# @mock.patch('ingestion.gcs_to_bq_util.load_values_as_df')
# def testWriteToBqSexNational(mock_csv: mock.MagicMock, mock_json: mock.MagicMock):
#     side_effects = [get_hispanic_or_latino_values_by_race_state_as_df()]
#     for concept in SEX_BY_AGE_CONCEPTS_TO_RACE:
#         side_effects.append(get_sex_by_age_value_as_df(concept))
#     mock_csv.side_effect = side_effects

#     acsPopulationIngester = ACSPopulationIngester(False, "https://SOME-URL")

#     (df, table_name) = acsPopulationIngester.generate_yearly_table_tuple(
#         'gcs_bucket')

#     expected_df = pd.read_csv(GOLDEN_DATA_SEX_NATIONAL, dtype={
#         'state_fips': str,
#     })
#     assert_frame_equal(
#         df, expected_df, check_like=True)


# # Do one County level test to make sure our logic there is correct
# @mock.patch('ingestion.census.fetch_acs_metadata',
#             return_value=get_acs_metadata_as_json())
# @mock.patch('ingestion.gcs_to_bq_util.load_values_as_df')
# def testWriteToBqAgeCounty(mock_csv: mock.MagicMock, mock_json: mock.MagicMock):
#     side_effects = [get_hispanic_or_latino_values_by_race_county_as_df()]
#     for concept in SEX_BY_AGE_CONCEPTS_TO_RACE:
#         side_effects.append(get_sex_by_age_county_value_as_df(concept))
#     mock_csv.side_effect = side_effects

#     acsPopulationIngester = ACSPopulationIngester(True, "https://SOME-URL")

#     (df, table_name) = acsPopulationIngester.generate_yearly_table_tuple(
#         'gcs_bucket')

#     expected_df = pd.read_csv(GOLDEN_DATA_AGE_COUNTY, dtype={
#         'state_fips': str,
#         'county_fips': str,
#     })

#     assert_frame_equal(
#         df, expected_df, check_like=True)


# # test generation of alternate year table
# @mock.patch('ingestion.census.fetch_acs_metadata',
#             return_value=get_acs_metadata_as_json())
# @mock.patch('ingestion.gcs_to_bq_util.load_values_as_df',
#             return_value=get_hispanic_or_latino_values_by_race_state_as_df())
# def testWriteAltYearToBqRace(
#     mock_bq: mock.MagicMock,
#     mock_csv: mock.MagicMock,
#     mock_json: mock.MagicMock
# ):
#     acsPopulationIngester = ACSPopulationIngester(
#         False, "FAKE://URL", "2009")

#     (df, table_name) = acsPopulationIngester.generate_yearly_table_tuple(
#         'gcs_bucket')

#     # all generated table names end with the specified year
#     assert mock_bq.call_args_list[0][0][2] == "by_race_state_2009"
#     assert mock_bq.call_args_list[1][0][2] == "by_sex_age_race_state_2009"
#     assert mock_bq.call_args_list[2][0][2] == "by_sex_age_state_2009"
#     assert mock_bq.call_args_list[3][0][2] == "by_age_state_2009"
#     assert mock_bq.call_args_list[4][0][2] == "by_sex_state_2009"
#     assert mock_bq.call_args_list[5][0][2] == "by_age_national_2009"
#     assert mock_bq.call_args_list[6][0][2] == "by_race_national_2009"
#     assert mock_bq.call_args_list[7][0][2] == "by_sex_national_2009"

#     # the generated df should contain the time_period col with year
#     expected_df = pd.read_csv(GOLDEN_DATA_RACE_ALT_YEAR, dtype={
#         'state_fips': str,
#         'time_period': str,
#     })

#     assert_frame_equal(
#         mock_bq.call_args_list[0].args[0], expected_df, check_like=True, check_dtype=False)
