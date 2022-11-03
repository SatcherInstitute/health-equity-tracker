from unittest import mock
import os
import pandas as pd
from pandas._testing import assert_frame_equal

from datasources.census_pop_estimates_sc import CensusPopEstimatesSC, generate_pop_data_18plus

# Current working directory.
THIS_DIR = os.path.dirname(os.path.abspath(__file__))
TEST_DIR = os.path.join(THIS_DIR, os.pardir, "data", "census_pop_estimates_sc")

STATE_POP_RACE_DATA = os.path.join(
    TEST_DIR, 'census_pop_estimates_sc-race_ethnicity_age_state.csv')
NATIONAL_POP_RACE_DATA = os.path.join(
    TEST_DIR, 'census_pop_estimates_sc-race_ethnicity_age_national.csv')

STATE_POP_SEX_DATA = os.path.join(
    TEST_DIR, 'census_pop_estimates_sc-sex_age_state.csv')
NATIONAL_POP_SEX_DATA = os.path.join(
    TEST_DIR, 'census_pop_estimates_sc-sex_age_national.csv')


def get_pop_estimates_as_df():
    print("MOCK FILE READ OF sc-est2021-alldata6.csv")
    return pd.read_csv(os.path.join(TEST_DIR, 'sc-est2021-alldata6.csv'), dtype={
        'STATE': str,
        'STNAME': str,
    })


def get_breakdown_df():
    return pd.DataFrame({
        "col1": [0, 1, 2],
        "col2": ["a", "b", "c"]
    })


# TEST OVERALL WRITE TO BQ

@mock.patch('datasources.census_pop_estimates_sc.generate_pop_data_18plus',
            return_value=get_breakdown_df())
@mock.patch('ingestion.gcs_to_bq_util.load_csv_as_df_from_web',
            return_value=get_pop_estimates_as_df())
@mock.patch('ingestion.gcs_to_bq_util.add_df_to_bq',
            return_value=None)
def testWriteToBq(
    mock_bq: mock.MagicMock,
    mock_csv: mock.MagicMock,
    mock_gen: mock.MagicMock
):

    censusPopEstimatesSC = CensusPopEstimatesSC()

    kwargs = {'filename': 'test_file.csv',
              'metadata_table_id': 'test_metadata',
              'table_name': 'output_table'}

    censusPopEstimatesSC.write_to_bq('dataset', 'gcs_bucket', **kwargs)
    assert mock_csv.call_count == 1

    # 4 = 2 demographic breakdowns X 2 geographic breakdowns
    assert mock_bq.call_count == 4
    assert mock_gen.call_count == 4

# TEST INNER FUNCTION - RACE BY STATE


def test18PlusByRace():

    mock_csv_as_df = get_pop_estimates_as_df()
    df = generate_pop_data_18plus(
        mock_csv_as_df, "race_category_id", "state")

    expected_race_df = pd.read_csv(STATE_POP_RACE_DATA, dtype={
        'state_fips': str,
        'time_period': str
    })

    assert_frame_equal(
        df, expected_race_df, check_like=True)

# TEST INNER FUNCTION - SEX BY STATE


def test18PlusBySex():

    mock_csv_as_df = get_pop_estimates_as_df()
    df = generate_pop_data_18plus(
        mock_csv_as_df, "sex", "state")

    # df.to_csv('test18PlusBySex.csv', index=False)
    expected_sex_df = pd.read_csv(STATE_POP_SEX_DATA, dtype={
        'state_fips': str,
        'time_period': str
    })

    assert_frame_equal(
        df, expected_sex_df, check_like=True)

# # TEST INNER FUNCTION - RACE NATIONAL


def test18PlusByRaceNational():

    mock_csv_as_df = get_pop_estimates_as_df()
    df = generate_pop_data_18plus(
        mock_csv_as_df, "race_category_id", "national")

    # df.to_csv('test18PlusByRaceNational.csv', index=False)
    expected_race_df = pd.read_csv(NATIONAL_POP_RACE_DATA, dtype={
        'state_fips': str,
        'time_period': str
    })

    assert_frame_equal(
        df, expected_race_df, check_like=True)

# # TEST INNER FUNCTION - SEX NATIONAL


def test18PlusBySexNational():

    mock_csv_as_df = get_pop_estimates_as_df()
    df = generate_pop_data_18plus(
        mock_csv_as_df, "sex", "national")

    # df.to_csv('test18PlusBySexNational.csv', index=False)
    expected_sex_df = pd.read_csv(NATIONAL_POP_SEX_DATA, dtype={
        'state_fips': str,
        'time_period': str
    })

    assert_frame_equal(
        df, expected_sex_df, check_like=True)
