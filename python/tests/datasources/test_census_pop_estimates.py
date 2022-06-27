from unittest import mock
import os
import pandas as pd
from pandas._testing import assert_frame_equal

from datasources.census_pop_estimates import CensusPopEstimates
from datasources.census_pop_estimates import (
    total_race,
    total_race_combo,
    generate_national_pop_data,
    generate_state_pop_data,
    BJS_PRISON_RACES_MAP,
    BJS_PRISON_AGES_MAP,
    CDC_COVID_RACES_MAP,
    CDC_COVID_AGES_MAP)
import ingestion.standardized_columns as std_col


# UNIT TESTS


test_row = {
    'H_MALE': 10,
    'H_FEMALE': 10,
    'XYZ_MALE': 100,
    'XYZ_FEMALE': 100,
    'TOT_POP': 1000
}

expected_total_hispanic = 20
expected_total_combo_hispanic_and_xyz = 220
expected_all = 1000


def test_total_race():

    hispanic_both_sexes = total_race(test_row, 'H')
    hispanic_and_xyz_both_sexes = total_race_combo(test_row, ['H', 'XYZ'])
    all_races = total_race(test_row, 'ALL')

    assert hispanic_both_sexes == expected_total_hispanic
    assert hispanic_and_xyz_both_sexes == expected_total_combo_hispanic_and_xyz
    assert all_races == expected_all


# Current working directory.
THIS_DIR = os.path.dirname(os.path.abspath(__file__))
TEST_DIR = os.path.join(THIS_DIR, os.pardir, "data", "census_pop_estimates")

STATE_POP_DATA_CDC = os.path.join(
    TEST_DIR, 'census_pop_estimates-race_ethnicity_age_state.csv')
NATIONAL_POP_DATA_CDC = os.path.join(
    TEST_DIR, 'census_pop_estimates-race_ethnicity_age_national.csv')

STATE_POP_DATA_BJS = os.path.join(
    TEST_DIR, 'census_pop_estimates_bjs-race_ethnicity_age_state.csv')
NATIONAL_POP_DATA_BJS = os.path.join(
    TEST_DIR, 'census_pop_estimates_bjs-race_ethnicity_age_national.csv')


def get_pop_estimates_as_df():
    """
    load a mocked version of the full census population csv
    """
    return pd.read_csv(os.path.join(TEST_DIR, 'census_pop_estimates.csv'), dtype={
        'STATE': str,
        'STNAME': str,
    })

# TEST OVERALL CALL ARG ORDER AND STRUCTURE


@mock.patch('ingestion.gcs_to_bq_util.load_csv_as_df_from_web',
            return_value=get_pop_estimates_as_df())
@mock.patch('ingestion.gcs_to_bq_util.add_df_to_bq',
            return_value=None)
def testWriteToBq(mock_bq: mock.MagicMock, mock_csv: mock.MagicMock):
    censusPopEstimates = CensusPopEstimates()

    kwargs = {'filename': 'test_file.csv',
              'metadata_table_id': 'test_metadata',
              'table_name': 'output_table'}

    censusPopEstimates.write_to_bq('dataset', 'gcs_bucket', **kwargs)
    assert mock_bq.call_count == 2
    assert mock_csv.call_count == 1

    df_bjs = mock_bq.call_args_list[1].args[0]
    df_cdc = mock_bq.call_args_list[0].args[0]

    expected_df_cdc = pd.read_csv(STATE_POP_DATA_CDC, dtype={
        'state_fips': str,
    })

    assert_frame_equal(
        df_cdc, expected_df_cdc, check_like=True)

    expected_df_bjs = pd.read_csv(STATE_POP_DATA_BJS, dtype={
        'state_fips': str,
    })

    assert_frame_equal(
        df_bjs, expected_df_bjs, check_like=True)


# TEST EACH TYPE OF GENERATED STATE LEVEL TABLE


df_census = get_pop_estimates_as_df()


def testStateLevelCdc():

    df_cdc_state = generate_state_pop_data(
        df_census, CDC_COVID_RACES_MAP, CDC_COVID_AGES_MAP)

    expected_df_cdc_state = pd.read_csv(STATE_POP_DATA_CDC, dtype={
        'state_fips': str,
    })

    assert_frame_equal(
        df_cdc_state, expected_df_cdc_state, check_like=True)


def testStateLevelBjs():

    df_bjs_state = generate_state_pop_data(
        df_census, BJS_PRISON_RACES_MAP, BJS_PRISON_AGES_MAP)

    expected_df_bjs_state = pd.read_csv(STATE_POP_DATA_BJS, dtype={
        'state_fips': str,
    })

    assert_frame_equal(
        df_bjs_state, expected_df_bjs_state, check_like=True)


# TEST STATE SUMMED TO NATIONAL FN

def testGenerateCdcNationalPopData():
    state_df = pd.read_csv(STATE_POP_DATA_CDC, dtype={
        'state_fips': str,
    })

    national_df = pd.read_csv(NATIONAL_POP_DATA_CDC, dtype={
        'state_fips': str,
    })

    states_to_include = state_df[std_col.STATE_FIPS_COL].drop_duplicates(
    ).to_list()
    df = generate_national_pop_data(state_df, states_to_include)

    assert_frame_equal(df, national_df, check_like=True)


def testGenerateBjsNationalPopData():
    state_df = pd.read_csv(STATE_POP_DATA_BJS, dtype={
        'state_fips': str,
    })

    expected_national_bjs_df = pd.read_csv(NATIONAL_POP_DATA_BJS, dtype={
        'state_fips': str,
    })

    states_to_include = state_df[std_col.STATE_FIPS_COL].drop_duplicates(
    ).to_list()

    df = generate_national_pop_data(state_df, states_to_include)

    assert_frame_equal(df, expected_national_bjs_df, check_like=True)
