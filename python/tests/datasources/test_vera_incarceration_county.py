from unittest import mock
import os

import pandas as pd
from pandas._testing import assert_frame_equal

from datasources.vera_incarceration_county import VeraIncarcerationCounty, VERA_COL_TYPES

# Current working directory.
THIS_DIR = os.path.dirname(os.path.abspath(__file__))
TEST_DIR = os.path.join(THIS_DIR, os.pardir, "data",
                        "vera_incarceration_county")


FAKE_SPLIT_DF_DATA = {
    'prison': os.path.join(TEST_DIR, 'test_input_prison_df.csv'),
    'jail': os.path.join(TEST_DIR, 'test_input_jail_df.csv'),
}

GOLDEN_DATA = {
    'prison_race_county': os.path.join(TEST_DIR, 'vera_incarceration_county-prison_race_and_ethnicity.json'),
    'prison_age_county': os.path.join(TEST_DIR, 'vera_incarceration_county-prison_age.json'),
    'prison_sex_county': os.path.join(TEST_DIR, 'vera_incarceration_county-prison_sex.json'),
    'jail_race_county': os.path.join(TEST_DIR, 'vera_incarceration_county-jail_race_and_ethnicity.json'),
    'jail_age_county': os.path.join(TEST_DIR, 'vera_incarceration_county-jail_age.json'),
    'jail_sex_county': os.path.join(TEST_DIR, 'vera_incarceration_county-jail_sex.json'),
}


def get_mocked_data_as_df():
    df = pd.read_csv(os.path.join(
        TEST_DIR, 'vera_incarceration_county_test_input.csv'), dtype=VERA_COL_TYPES,)
    return df


@mock.patch('ingestion.gcs_to_bq_util.load_csv_as_df_from_web',
            return_value=get_mocked_data_as_df())
@mock.patch('ingestion.gcs_to_bq_util.add_df_to_bq',
            return_value=None)
def testWriteToBq(
    mock_bq: mock.MagicMock,
    mock_csv: mock.MagicMock
):

    veraIncarcerationCounty = VeraIncarcerationCounty()

    kwargs = {'filename': 'test_file.csv',
              'metadata_table_id': 'test_metadata',
              'table_name': 'output_table'}

    veraIncarcerationCounty.write_to_bq('dataset', 'gcs_bucket', **kwargs)

    mock_csv.assert_called_once()

    assert mock_bq.call_count == 6
    assert mock_bq.call_args_list[0].args[2] == 'prison_race_and_ethnicity'
    assert mock_bq.call_args_list[1].args[2] == 'prison_sex'
    assert mock_bq.call_args_list[2].args[2] == 'prison_age'
    assert mock_bq.call_args_list[3].args[2] == 'jail_race_and_ethnicity'
    assert mock_bq.call_args_list[4].args[2] == 'jail_sex'
    assert mock_bq.call_args_list[5].args[2] == 'jail_age'

    # for call_arg in mock_bq.call_args_list:
    #     mock_df, _, bq_table_name = call_arg[0]
    #     print("\n\n")
    #     print(bq_table_name)
    #     print(mock_df)
    #     mock_df.to_json(
    #         f'vera_incarceration_county-{bq_table_name}.json', orient="records")


fake_geo_pop_dtype = {
    "county_fips": str,
    "county_name": str,
    "total_pop_15to64": float,
    "aapi_pop_15to64": float,
    "black_pop_15to64": float,
    "latinx_pop_15to64": float,
    "native_pop_15to64": float,
    "white_pop_15to64": float,
    "female_pop_15to64": float,
    "male_pop_15to64": float,
}


fake_prison_dtype = {
    **fake_geo_pop_dtype,
    "total_prison_pop": float,
    "total_prison_pop_rate": float,
    "aapi_prison_pop": float,
    "black_prison_pop": float,
    "latinx_prison_pop": float,
    "native_prison_pop": float,
    "other_race_prison_pop": float,
    "white_prison_pop": float,
    "female_prison_pop": float,
    "male_prison_pop": float,
    "aapi_prison_pop_rate": float,
    "black_prison_pop_rate": float,
    "latinx_prison_pop_rate": float,
    "native_prison_pop_rate": float,
    "white_prison_pop_rate": float,
    "female_prison_pop_rate": float,
    "male_prison_pop_rate": float
}

fake_jail_dtype = {
    **fake_geo_pop_dtype,
    "total_jail_pop": float,
    "total_jail_pop_rate": float,
    "aapi_jail_pop": float,
    "black_jail_pop": float,
    "latinx_jail_pop": float,
    "native_jail_pop": float,
    "other_race_jail_pop": float,
    "white_jail_pop": float,
    "female_jail_pop": float,
    "male_jail_pop": float,
    "aapi_jail_pop_rate": float,
    "black_jail_pop_rate": float,
    "latinx_jail_pop_rate": float,
    "native_jail_pop_rate": float,
    "white_jail_pop_rate": float,
    "female_jail_pop_rate": float,
    "male_jail_pop_rate": float
}

_fake_prison_df = pd.read_csv(
    FAKE_SPLIT_DF_DATA['prison'], dtype=fake_prison_dtype)

_fake_jail_df = pd.read_csv(
    FAKE_SPLIT_DF_DATA['jail'], dtype=fake_jail_dtype)


expected_dtype = {
    "county_fips": str,
    "population_pct_share": float,
    "jail_pct_share": float,
    "prison_pct_share": float,
    "jail_per_100k": int,
    "prison_per_100k": int,
    "race_includes_hispanic": object,
}

vera = VeraIncarcerationCounty()


def testCountyPrisonRace():

    _generated_df = vera.generate_for_bq(
        _fake_prison_df, "prison", "race_and_ethnicity")

    _expected_df_prison_race = pd.read_json(
        GOLDEN_DATA['prison_race_county'], dtype=expected_dtype)

    assert_frame_equal(
        _generated_df, _expected_df_prison_race, check_like=True)


def testCountyJailRace():

    _generated_df = vera.generate_for_bq(
        _fake_jail_df, "jail", "race_and_ethnicity")

    _expected_df_jail_race = pd.read_json(
        GOLDEN_DATA['jail_race_county'], dtype=expected_dtype)

    assert_frame_equal(
        _generated_df, _expected_df_jail_race, check_like=True)


def testCountyPrisonBySex():

    _generated_df = vera.generate_for_bq(
        _fake_prison_df, "prison", "sex")

    _expected_df_prison_sex = pd.read_json(
        GOLDEN_DATA['prison_sex_county'], dtype=expected_dtype)

    assert_frame_equal(
        _generated_df, _expected_df_prison_sex, check_like=True)


def testCountyJailBySex():

    _generated_df = vera.generate_for_bq(
        _fake_jail_df, "jail", "sex")

    _expected_df_jail_sex = pd.read_json(
        GOLDEN_DATA['jail_sex_county'], dtype=expected_dtype)

    assert_frame_equal(
        _generated_df, _expected_df_jail_sex, check_like=True)


def testCountyPrisonByAge():

    _generated_df = vera.generate_for_bq(
        _fake_prison_df, "prison", "age")

    _expected_df_prison_age = pd.read_json(
        GOLDEN_DATA['prison_age_county'], dtype=expected_dtype)

    assert_frame_equal(
        _generated_df, _expected_df_prison_age, check_like=True)


def testCountyJailByAge():

    _generated_df = vera.generate_for_bq(
        _fake_jail_df, "jail", "age")

    _expected_df_jail_age = pd.read_json(
        GOLDEN_DATA['jail_age_county'], dtype=expected_dtype)

    assert_frame_equal(
        _generated_df, _expected_df_jail_age, check_like=True)
