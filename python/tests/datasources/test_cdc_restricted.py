from unittest import mock
import os

import pandas as pd  # type: ignore
from pandas._testing import assert_frame_equal  # type: ignore

from test_utils import get_state_fips_codes_as_df
from datasources.cdc_restricted import CDCRestrictedData  # type: ignore

# Current working directory.
THIS_DIR = os.path.dirname(os.path.abspath(__file__))
TEST_DIR = os.path.join(THIS_DIR, os.pardir, "data", "cdc_restricted")

GOLDEN_DATA_BY_SEX_STATE = os.path.join(
    TEST_DIR, 'golden_data', 'by_state_sex.json')

GOLDEN_DATA_BY_SEX_COUNTY = os.path.join(
    TEST_DIR, 'golden_data', 'by_sex_county.json')


def get_fips_and_county_names_as_df(*args, **kwargs):
    if args[1] == 'fips_codes_all':
        return pd.read_csv(os.path.join(TEST_DIR, 'county_names.csv'), dtype=str)
    else:
        return get_state_fips_codes_as_df()


def get_population_by_sex_state_as_df():
    return pd.read_csv(os.path.join(TEST_DIR, 'population_by_sex_state.csv'), dtype={
        'state_fips': str,
    })


def get_population_by_sex_county_as_df():
    return pd.read_csv(os.path.join(TEST_DIR, 'population_by_sex_county.csv'), dtype={
        'state_fips': str,
        'county_fips': str,
    })


def get_population_by_age_state_as_df():
    return pd.read_csv(os.path.join(TEST_DIR, 'population_by_age_state.csv'), dtype={
        'state_fips': str,
    })


def get_population_by_age_county_as_df():
    return pd.read_csv(os.path.join(TEST_DIR, 'population_by_age_county.csv'), dtype={
        'state_fips': str,
        'county_fips': str,
    })


def get_population_by_race_state_as_df():
    return pd.read_csv(os.path.join(TEST_DIR, 'population_by_race_state.csv'), dtype={
        'state_fips': str,
    })


def get_population_by_race_county_as_df():
    return pd.read_csv(os.path.join(TEST_DIR, 'population_by_race_county.csv'), dtype={
        'state_fips': str,
        'county_fips': str,
    })


def get_population_by_sex_territory_as_df():
    return pd.read_csv(os.path.join(TEST_DIR, 'population_2010_sex.csv'), dtype={
        'state_fips': str,
    })


def get_population_by_age_territory_as_df():
    return pd.read_csv(os.path.join(TEST_DIR, 'population_2010_age.csv'), dtype={
        'state_fips': str,
    })


def get_population_by_race_territory_as_df():
    return pd.read_csv(os.path.join(TEST_DIR, 'population_2010_race.csv'), dtype={
        'state_fips': str,
    })


def get_cdc_restricted_by_sex_state_as_df():
    return pd.read_csv(os.path.join(TEST_DIR, 'cdc_restricted_by_sex_state.csv'), dtype={
        'state_fips': str,
    })


def get_cdc_restricted_by_sex_county_as_df():
    return pd.read_csv(os.path.join(TEST_DIR, 'cdc_restricted_by_sex_county.csv'), dtype={
        'state_fips': str,
        'county_fips': str,
    })


def get_cdc_restricted_by_race_state_as_df():
    return pd.read_csv(os.path.join(TEST_DIR, 'cdc_restricted_by_race_state.csv'), dtype={
        'state_fips': str,
    })


def get_cdc_restricted_by_race_county_as_df():
    return pd.read_csv(os.path.join(TEST_DIR, 'cdc_restricted_by_race_county.csv'), dtype={
        'state_fips': str,
        'county_fips': str,
    })


def get_cdc_restricted_by_age_state_as_df():
    return pd.read_csv(os.path.join(TEST_DIR, 'cdc_restricted_by_age_state.csv'), dtype={
        'state_fips': str,
    })


def get_cdc_restricted_by_age_county_as_df():
    return pd.read_csv(os.path.join(TEST_DIR, 'cdc_restricted_by_age_county.csv'), dtype={
        'state_fips': str,
        'county_fips': str,
    })


def get_doesnt_matter_as_df():
    return pd.read_csv(os.path.join(TEST_DIR, 'cdc_restricted_by_age_county.csv'), dtype={
        'state_fips': str,
        'county_fips': str,
    })


@mock.patch('ingestion.gcs_to_bq_util.load_df_from_bigquery')
@mock.patch('ingestion.gcs_to_bq_util.load_public_dataset_from_bigquery_as_df',
            return_value=get_state_fips_codes_as_df())
def testGenerateBreakdownSexState(mock_fips: mock.MagicMock, mock_pop: mock.MagicMock):
    mock_pop.side_effect = [
        get_population_by_sex_state_as_df(),
        get_population_by_sex_territory_as_df(),
    ]
    cdc_restricted = CDCRestrictedData()

    df = cdc_restricted.generate_breakdown(get_cdc_restricted_by_sex_state_as_df(), 'sex', 'state')
    expected_df = pd.read_json(GOLDEN_DATA_BY_SEX_STATE, dtype={
        'state_fips': str,
        'covid_cases_share': float,
        'covid_hosp_share': float,
        'covid_deaths_share': float,
    })

    assert_frame_equal(df, expected_df, check_like=True)


@mock.patch('ingestion.gcs_to_bq_util.load_df_from_bigquery',
            return_value=get_population_by_sex_county_as_df())
@mock.patch('ingestion.gcs_to_bq_util.load_public_dataset_from_bigquery_as_df',
            side_effect=get_fips_and_county_names_as_df)
def testGenerateBreakdownSexCounty(mock_fips: mock.MagicMock, mock_pop: mock.MagicMock):
    cdc_restricted = CDCRestrictedData()

    df = cdc_restricted.generate_breakdown(get_cdc_restricted_by_sex_county_as_df(), 'sex', 'county')
    expected_df = pd.read_json(GOLDEN_DATA_BY_SEX_COUNTY, dtype={
        'state_fips': str,
        'county_fips': str,
        'covid_cases_share': float,
        'covid_hosp_share': float,
        'covid_deaths_share': float,
    })

    assert_frame_equal(df, expected_df, check_like=True)


@mock.patch('ingestion.gcs_to_bq_util.load_df_from_bigquery')
@mock.patch('ingestion.gcs_to_bq_util.load_public_dataset_from_bigquery_as_df',
            side_effect=get_fips_and_county_names_as_df)
@mock.patch('ingestion.gcs_to_bq_util.load_csv_as_df')
@mock.patch('ingestion.gcs_to_bq_util.add_df_to_bq',
            return_value=None)
def testWriteToBq(
        mock_bq: mock.MagicMock,
        mock_csv: mock.MagicMock,
        mock_fips: mock.MagicMock,
        mock_pop: mock.MagicMock):

    mock_pop.side_effect = [
        get_population_by_sex_state_as_df(),
        get_population_by_sex_territory_as_df(),

        get_population_by_race_state_as_df(),
        get_population_by_race_territory_as_df(),

        get_population_by_age_state_as_df(),
        get_population_by_age_territory_as_df(),

        get_population_by_sex_county_as_df(),
        get_population_by_race_county_as_df(),
        get_population_by_age_county_as_df(),
    ]

    mock_csv.side_effect = [
        get_cdc_restricted_by_sex_state_as_df(),
        get_cdc_restricted_by_race_state_as_df(),
        get_cdc_restricted_by_age_state_as_df(),

        get_cdc_restricted_by_sex_county_as_df(),
        get_cdc_restricted_by_race_county_as_df(),
        get_cdc_restricted_by_age_county_as_df(),

        # We just upload this file as is so it doesnt
        # matter what is in it.
        get_doesnt_matter_as_df(),
        get_doesnt_matter_as_df(),
        get_doesnt_matter_as_df(),
        get_doesnt_matter_as_df(),
    ]

    cdc_restricted = CDCRestrictedData()

    kwargs = {'filename': 'test_file.csv',
              'metadata_table_id': 'test_metadata',
              'table_name': 'output_table'}

    cdc_restricted.write_to_bq('dataset', 'gcs_bucket', **kwargs)

    assert mock_csv.call_count == 10
    assert mock_csv.call_args_list[0].args[1] == 'cdc_restricted_by_sex_state.csv'
    assert mock_csv.call_args_list[1].args[1] == 'cdc_restricted_by_race_state.csv'
    assert mock_csv.call_args_list[2].args[1] == 'cdc_restricted_by_age_state.csv'
    assert mock_csv.call_args_list[3].args[1] == 'cdc_restricted_by_sex_county.csv'
    assert mock_csv.call_args_list[4].args[1] == 'cdc_restricted_by_race_county.csv'
    assert mock_csv.call_args_list[5].args[1] == 'cdc_restricted_by_age_county.csv'
    assert mock_csv.call_args_list[6].args[1] == 'cdc_restricted_by_race_and_age_state.csv'
    assert mock_csv.call_args_list[7].args[1] == 'cdc_restricted_by_race_state.csv'
    assert mock_csv.call_args_list[8].args[1] == 'cdc_restricted_by_age_state.csv'
    assert mock_csv.call_args_list[9].args[1] == 'cdc_restricted_by_sex_state.csv'

    assert mock_pop.call_count == 9
    assert mock_pop.call_args_list[0].args[1] == 'by_sex_state'
    assert mock_pop.call_args_list[1].args[1] == 'by_sex_territory'
    assert mock_pop.call_args_list[2].args[1] == 'by_race_state_std'
    assert mock_pop.call_args_list[3].args[1] == 'by_race_and_ethnicity_territory'
    assert mock_pop.call_args_list[4].args[1] == 'by_age_state'
    assert mock_pop.call_args_list[5].args[1] == 'by_age_territory'
    assert mock_pop.call_args_list[6].args[1] == 'by_sex_county'
    assert mock_pop.call_args_list[7].args[1] == 'by_race_county_std'
    assert mock_pop.call_args_list[8].args[1] == 'by_age_county'

    assert mock_bq.call_count == 10
    assert mock_bq.call_args_list[0].args[2] == 'by_sex_state_processed'
    assert mock_bq.call_args_list[1].args[2] == 'by_race_state_processed'
    assert mock_bq.call_args_list[2].args[2] == 'by_age_state_processed'
    assert mock_bq.call_args_list[3].args[2] == 'by_sex_county_processed'
    assert mock_bq.call_args_list[4].args[2] == 'by_race_county_processed'
    assert mock_bq.call_args_list[5].args[2] == 'by_age_county_processed'
    assert mock_bq.call_args_list[6].args[2] == 'cdc_restricted_by_race_and_age_state'
    assert mock_bq.call_args_list[7].args[2] == 'cdc_restricted_by_race_state'
    assert mock_bq.call_args_list[8].args[2] == 'cdc_restricted_by_age_state'
    assert mock_bq.call_args_list[9].args[2] == 'cdc_restricted_by_sex_state'
