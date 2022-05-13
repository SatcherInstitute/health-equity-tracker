from unittest import mock
import os
from zipfile import ZipFile
import pandas as pd
from pandas._testing import assert_frame_equal
import ingestion.standardized_columns as std_col
from test_utils import get_state_fips_codes_as_df
from datasources.bjs import (BJSData,
                             keep_only_states,
                             #  keep_only_national,
                             #  strip_footnote_refs_from_df,
                             )
from datasources.bjs_prisoners_tables_utils import (
    missing_data_to_none,
)

# UNIT TESTS

_fake_by_race_df = pd.DataFrame({
    std_col.STATE_NAME_COL: ["U.S. total", "Maine", "Florida", ],
    'Asian': [1_000_000, "~", 1000],
    'Black': [1_000_000, 100, "/"]
})

_expected_by_race_df_missing_to_none = pd.DataFrame({
    std_col.STATE_NAME_COL: ["U.S. total", "Maine", "Florida"],
    'Asian': [1_000_000, None, 1000],
    'Black': [1_000_000, 100, None]
})

_expected_by_race_df_only_states = pd.DataFrame({
    std_col.STATE_NAME_COL: ["Maine", "Florida"],
    'Asian': ["~", 1000],
    'Black': [100, "/"]
})


def test_missing_data_to_none():
    assert missing_data_to_none(
        _fake_by_race_df).equals(_expected_by_race_df_missing_to_none)


def test_keep_only_states():
    assert keep_only_states(
        _fake_by_race_df).reset_index(drop=True).equals(
            _expected_by_race_df_only_states.reset_index(drop=True))


# def test_keep_only_national():


# def test_strip_footnote_refs():


# MOCKS FOR READING IN TABLES


def get_test_zip_as_files():
    files = ZipFile(os.path.join(TEST_DIR, 'p20st.zip'))
    return files


def get_race_pop_data_as_df_state():

    df = pd.read_json(os.path.join(
        TEST_DIR, 'acs_population', 'by_race_state_std.json'),
        dtype={'state_fips': str})

    return df


def get_age_pop_data_as_df_state():

    df = pd.read_json(os.path.join(
        TEST_DIR, 'acs_population', 'by_age_state.json'),
        dtype={'state_fips': str})

    return df


def get_sex_pop_data_as_df_state():

    df = pd.read_json(os.path.join(
        TEST_DIR, 'acs_population', 'by_sex_state.json'),
        dtype={'state_fips': str})

    return df


def get_race_pop_data_as_df_territory():

    df = pd.read_json(os.path.join(
        TEST_DIR, 'acs_2010_population', 'by_race_and_ethnicity_territory.json'),
        dtype={'state_fips': str})

    return df


def get_age_pop_data_as_df_territory():

    df = pd.read_json(os.path.join(
        TEST_DIR, 'acs_2010_population', 'by_age_territory.json'),
        dtype={'state_fips': str})

    return df


def get_sex_pop_data_as_df_territory():

    df = pd.read_json(os.path.join(
        TEST_DIR, 'acs_2010_population', 'by_sex_territory.json'),
        dtype={'state_fips': str})

    return df


def get_race_pop_data_as_df_national():

    df = pd.read_json(os.path.join(TEST_DIR, 'acs_population',
                                   'by_race_national.json'),
                      dtype={'state_fips': str})
    df[std_col.STATE_FIPS_COL] = '00'
    df[std_col.STATE_NAME_COL] = 'United States'

    return df


def get_age_pop_data_as_df_national():

    df = pd.read_json(os.path.join(TEST_DIR, 'acs_population',
                                   'by_age_national.json'),
                      dtype={'state_fips': str})
    df[std_col.STATE_FIPS_COL] = '00'
    df[std_col.STATE_NAME_COL] = 'United States'

    return df


def get_sex_pop_data_as_df_national():

    df = pd.read_json(os.path.join(TEST_DIR, 'acs_population',
                                   'by_sex_national.json'),
                      dtype={'state_fips': str})
    df[std_col.STATE_FIPS_COL] = '00'
    df[std_col.STATE_NAME_COL] = 'United States'

    return df


# INTEGRATION TEST SETUP
# Current working directory.
THIS_DIR = os.path.dirname(os.path.abspath(__file__))
TEST_DIR = os.path.join(THIS_DIR, os.pardir, "data", "bjs_corrections")

GOLDEN_DATA = {
    'race_and_ethnicity_national': os.path.join(TEST_DIR, 'bjs_test_output_race_and_ethnicity_national.json'),
    'race_national': os.path.join(TEST_DIR, 'bjs_test_output_race_and_ethnicity_national.json'),
    'race_and_ethnicity_state': os.path.join(TEST_DIR, 'bjs_test_output_race_and_ethnicity_state.json'),
    'race_state': os.path.join(TEST_DIR, 'bjs_test_output_race_and_ethnicity_state.json'),
    'age_national': os.path.join(TEST_DIR, 'bjs_test_output_age_national.json'),
    'age_state': os.path.join(TEST_DIR, 'bjs_test_output_age_state.json'),
    'sex_national': os.path.join(TEST_DIR, 'bjs_test_output_sex_national.json'),
    'sex_state': os.path.join(TEST_DIR, 'bjs_test_output_sex_state.json'),
}


# RUN INTEGRATION TESTS ON NATIONAL LEVEL

@mock.patch('ingestion.gcs_to_bq_util.load_df_from_bigquery')
@mock.patch('ingestion.gcs_to_bq_util.load_public_dataset_from_bigquery_as_df',
            return_value=get_state_fips_codes_as_df())
@ mock.patch('datasources.bjs.fetch_zip_as_files',
             return_value=get_test_zip_as_files())
@ mock.patch('ingestion.gcs_to_bq_util.add_df_to_bq',
             return_value=None)
def testWriteNationalLevelToBq(mock_bq: mock.MagicMock,
                               mock_zip: mock.MagicMock,
                               mock_fips: mock.MagicMock,
                               mock_pop: mock.MagicMock
                               ):

    # run these in order as replacements for the
    # actual calls to load_csv_as_df_from_web()
    mock_pop.side_effect = [
        get_age_pop_data_as_df_national(),  # extra initial pop merge for ADULT table
        # another pop merge for entire table with JUVENILE
        get_age_pop_data_as_df_national(),
        get_race_pop_data_as_df_national(),
        get_sex_pop_data_as_df_national(),
        get_age_pop_data_as_df_state(),
        get_age_pop_data_as_df_territory(),
        get_race_pop_data_as_df_state(),
        get_race_pop_data_as_df_territory(),
        get_sex_pop_data_as_df_state(),
        get_sex_pop_data_as_df_territory(),
    ]

    bjs_data = BJSData()

    # required by bigQuery
    kwargs = {'filename': 'test_file.csv',
              'metadata_table_id': 'test_metadata',
              'table_name': 'output_table'}

    bjs_data.write_to_bq('dataset', 'gcs_bucket', **kwargs)

    expected_dtype = {
        'state_name': str,
        'state_fips': str,
        "prison_per_100k": float,
        "prison_pct_share": float,
        "population": object,
        "population_pct": float,
    }
    expected_dtype_age = {
        **expected_dtype,
        'age': str,
    }
    expected_dtype_race = {
        **expected_dtype,
        'race_and_ethnicity': str,
        'race': str,
        'race_includes_hispanic': object,
        'race_category_id': str,
    }

    expected_dtype_sex = {
        **expected_dtype,
        'sex': str,
    }

    # read test OUTPUT file
    expected_df_age_national = pd.read_json(
        GOLDEN_DATA['age_national'], dtype=expected_dtype_age)

    expected_df_race_national = pd.read_json(
        GOLDEN_DATA['race_and_ethnicity_national'], dtype=expected_dtype_race)

    expected_df_sex_national = pd.read_json(
        GOLDEN_DATA['sex_national'], dtype=expected_dtype_sex)

    expected_df_age_state = pd.read_json(
        GOLDEN_DATA['age_state'], dtype=expected_dtype_age)

    expected_df_race_state = pd.read_json(
        GOLDEN_DATA['race_state'], dtype=expected_dtype_race)

    expected_df_sex_state = pd.read_json(
        GOLDEN_DATA['sex_state'], dtype=expected_dtype_sex)

    # unpack the data from the mocked calls
    # mock_tuple, mock_dtypes = args[i]
    # mock_df, _dataset, _gcs_bucket = mock_tuple
    args = mock_bq.call_args_list

    mock_df_national_age = args[0][0][0]
    mock_df_national_race = args[1][0][0]
    mock_df_national_sex = args[2][0][0]
    mock_df_state_age = args[3][0][0]
    mock_df_state_race = args[4][0][0]
    mock_df_state_sex = args[5][0][0]

    # save NATIONAL results to file
    mock_df_national_age.to_json(
        "bjs_data-age_national.json", orient="records")
    mock_df_national_race.to_json(
        "bjs_data-race_and_ethnicity_national.json", orient="records")
    mock_df_national_sex.to_json(
        "bjs_data-sex_national.json", orient="records")

    # # save STATE/TERRITORY results to file
    mock_df_state_age.to_json(
        "bjs_data-age_state.json", orient="records")
    mock_df_state_race.to_json(
        "bjs_data-race_and_ethnicity_state.json", orient="records")
    mock_df_state_sex.to_json(
        "bjs_data-sex_state.json", orient="records")

    # output created in mocked load_csv_as_df_from_web() should be the same as the expected df

    assert set(mock_df_national_race.columns) == set(
        expected_df_race_national.columns)
    assert_frame_equal(
        mock_df_national_race, expected_df_race_national, check_like=True)

    assert set(mock_df_national_sex.columns) == set(
        expected_df_sex_national.columns)
    assert_frame_equal(
        mock_df_national_sex, expected_df_sex_national, check_like=True)

    assert set(mock_df_national_age.columns) == set(
        expected_df_age_national.columns)
    assert_frame_equal(
        mock_df_national_age, expected_df_age_national, check_like=True)

    assert set(mock_df_state_race.columns) == set(
        expected_df_race_state.columns)
    assert_frame_equal(
        mock_df_state_race, expected_df_race_state, check_like=True)

    assert set(mock_df_state_sex.columns) == set(
        expected_df_sex_state.columns)
    assert_frame_equal(
        mock_df_state_sex, expected_df_sex_state, check_like=True)

    assert set(mock_df_state_age.columns) == set(
        expected_df_age_state.columns)
    assert_frame_equal(
        mock_df_state_age, expected_df_age_state, check_like=True)
