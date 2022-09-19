from unittest import mock
import os
from io import StringIO
import pandas as pd
from pandas._testing import assert_frame_equal
from ingestion.dataset_utils import ensure_leading_zeros

from datasources.vera_incarceration_county import (
    VeraIncarcerationCounty,
    VERA_COL_TYPES,
    JAIL,
    PRISON,
    CHILDREN,
    split_df_by_data_type,
    generate_partial_breakdown,
)

# Current working directory.
THIS_DIR = os.path.dirname(os.path.abspath(__file__))
TEST_DIR = os.path.join(THIS_DIR, os.pardir, "data",
                        "vera_incarceration_county")


FAKE_SPLIT_DF_DATA = {
    PRISON: os.path.join(TEST_DIR, 'test_input_prison_df.csv'),
    JAIL: os.path.join(TEST_DIR, 'test_input_jail_df.csv'),
    CHILDREN: os.path.join(TEST_DIR, 'test_input_children_df.csv'),
}

GOLDEN_DATA = {
    'prison_race_county': os.path.join(TEST_DIR, 'vera_incarceration_data-prison_race_and_ethnicity_county.json'),
    'prison_age_county': os.path.join(TEST_DIR, 'vera_incarceration_data-prison_age_county.json'),
    'prison_sex_county': os.path.join(TEST_DIR, 'vera_incarceration_data-prison_sex_county.json'),
    'jail_race_county': os.path.join(TEST_DIR, 'vera_incarceration_data-jail_race_and_ethnicity_county.json'),
    'jail_age_county': os.path.join(TEST_DIR, 'vera_incarceration_data-jail_age_county.json'),
    'jail_sex_county': os.path.join(TEST_DIR, 'vera_incarceration_data-jail_sex_county.json'),
}


def get_mocked_data_as_df():
    df = pd.read_csv(os.path.join(TEST_DIR,
                                  'vera_incarceration_county_test_input.csv'),
                     dtype=VERA_COL_TYPES)
    return df


def get_mocked_county_names_as_df():
    df = pd.read_csv(os.path.join(TEST_DIR,
                                  'test_input_county_names.csv'),
                     dtype=str)
    return df


@ mock.patch('ingestion.gcs_to_bq_util.load_public_dataset_from_bigquery_as_df',
             return_value=get_mocked_county_names_as_df())
@ mock.patch('ingestion.gcs_to_bq_util.load_csv_as_df_from_web',
             return_value=get_mocked_data_as_df())
@ mock.patch('ingestion.gcs_to_bq_util.add_df_to_bq',
             return_value=None)
def testWriteToBq(
    mock_bq: mock.MagicMock,
    mock_csv: mock.MagicMock,
    mock_counties: mock.MagicMock
):

    veraIncarcerationCounty = VeraIncarcerationCounty()

    kwargs = {'filename': 'test_file.csv',
              'metadata_table_id': 'test_metadata',
              'table_name': 'output_table'}

    kwargs["demographic"] = "race_and_ethnicity"
    veraIncarcerationCounty.write_to_bq('dataset', 'gcs_bucket', **kwargs)

    kwargs["demographic"] = "sex"
    veraIncarcerationCounty.write_to_bq('dataset', 'gcs_bucket', **kwargs)

    kwargs["demographic"] = "age"
    veraIncarcerationCounty.write_to_bq('dataset', 'gcs_bucket', **kwargs)

    assert mock_bq.call_count == 6
    assert mock_bq.call_args_list[0].args[2] == 'prison_race_and_ethnicity_county'
    assert mock_bq.call_args_list[1].args[2] == 'jail_race_and_ethnicity_county'
    assert mock_bq.call_args_list[2].args[2] == 'prison_sex_county'
    assert mock_bq.call_args_list[3].args[2] == 'jail_sex_county'
    assert mock_bq.call_args_list[4].args[2] == 'prison_age_county'
    assert mock_bq.call_args_list[5].args[2] == 'jail_age_county'
    assert mock_csv.call_count == 3
    assert mock_counties.call_count == 3


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
    **fake_geo_pop_dtype,  # type: ignore
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
    **fake_geo_pop_dtype,  # type: ignore
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

fake_children_dtype = {
    "county_fips": str,
    "county_name": str,
    "female_juvenile_jail_pop": float,
    "male_juvenile_jail_pop": float
}

_fake_prison_df = pd.read_csv(
    FAKE_SPLIT_DF_DATA[PRISON], dtype=fake_prison_dtype)

_fake_jail_df = pd.read_csv(
    FAKE_SPLIT_DF_DATA[JAIL], dtype=fake_jail_dtype)

_fake_children_df = pd.read_csv(
    FAKE_SPLIT_DF_DATA[CHILDREN], dtype=fake_children_dtype)


def test_split_df_by_data_type():
    """
    Checks that splitting the sample CSV file generates the same
    Jail/Prison/Children dfs used in our other tests
    """

    mocked_df = get_mocked_data_as_df()
    mocked_df = ensure_leading_zeros(mocked_df, "county_fips", 5)
    split_results = split_df_by_data_type(mocked_df)

    assert_frame_equal(
        split_results[PRISON], _fake_prison_df, check_like=True)
    assert_frame_equal(
        split_results[JAIL], _fake_jail_df, check_like=True)
    assert_frame_equal(
        split_results[CHILDREN], _fake_children_df, check_like=True)


def test_generate_partial_breakdown():

    _partial_sex_jail_rate = generate_partial_breakdown(
        _fake_jail_df, "sex", JAIL, "rate")

    _expected_sex_jail_rate_data = StringIO("""county_fips,county_name,sex,jail_per_100k
01001,Autauga County,All,454.81
37119,Mecklenburg County,All,206.55
56045,Weston County,All,115.37
01001,Autauga County,Female,134.73
37119,Mecklenburg County,Female,37.90
56045,Weston County,Female,306.59
01001,Autauga County,Male,716.54
37119,Mecklenburg County,Male,386.58
56045,Weston County,Male,1177.96""")

    _expected_partial_sex_jail_rate = pd.read_csv(
        _expected_sex_jail_rate_data, sep=",", dtype={"county_fips": str})

    assert_frame_equal(
        _partial_sex_jail_rate, _expected_partial_sex_jail_rate, check_like=True)


expected_dtype = {
    "county_fips": str,
    "population_pct_share": float,
    "jail_pct_share": float,
    "prison_pct_share": float,
    "jail_per_100k": float,
    "prison_per_100k": float,
    "race_includes_hispanic": object,
    "total_confined_children": float
}


vera = VeraIncarcerationCounty()

_fake_children_df_race = _fake_children_df.copy()
_fake_children_df_race["race_category_id"] = "ALL"
_fake_children_df_sex = _fake_children_df.copy()
_fake_children_df_sex["sex"] = "All"
_fake_children_df_age = _fake_children_df.copy()
_fake_children_df_age["age"] = "All"


def testCountyPrisonRace():

    _generated_df = vera.generate_for_bq(
        _fake_prison_df, PRISON, "race_and_ethnicity", _fake_children_df_race)

    _expected_df_prison_race = pd.read_json(
        GOLDEN_DATA['prison_race_county'], dtype=expected_dtype)

    assert_frame_equal(
        _generated_df, _expected_df_prison_race, check_like=True)


def testCountyJailRace():

    _generated_df = vera.generate_for_bq(
        _fake_jail_df, JAIL, "race_and_ethnicity", _fake_children_df_race)

    _expected_df_jail_race = pd.read_json(
        GOLDEN_DATA['jail_race_county'], dtype=expected_dtype)

    assert_frame_equal(
        _generated_df, _expected_df_jail_race, check_like=True)


def testCountyPrisonBySex():

    _generated_df = vera.generate_for_bq(
        _fake_prison_df, PRISON, "sex", _fake_children_df_sex)

    _expected_df_prison_sex = pd.read_json(
        GOLDEN_DATA['prison_sex_county'], dtype=expected_dtype)

    assert_frame_equal(
        _generated_df, _expected_df_prison_sex, check_like=True)


def testCountyJailBySex():

    _generated_df = vera.generate_for_bq(
        _fake_jail_df, JAIL, "sex", _fake_children_df_sex)

    _expected_df_jail_sex = pd.read_json(
        GOLDEN_DATA['jail_sex_county'], dtype=expected_dtype)

    assert_frame_equal(
        _generated_df, _expected_df_jail_sex, check_like=True)


def testCountyPrisonByAge():

    _generated_df = vera.generate_for_bq(
        _fake_prison_df, PRISON, "age", _fake_children_df_age)

    _expected_df_prison_age = pd.read_json(
        GOLDEN_DATA['prison_age_county'], dtype=expected_dtype)

    assert_frame_equal(
        _generated_df, _expected_df_prison_age, check_like=True)


def testCountyJailByAge():

    _generated_df = vera.generate_for_bq(
        _fake_jail_df, JAIL, "age", _fake_children_df_age)

    _expected_df_jail_age = pd.read_json(
        GOLDEN_DATA['jail_age_county'], dtype=expected_dtype)

    assert_frame_equal(
        _generated_df, _expected_df_jail_age, check_like=True)
