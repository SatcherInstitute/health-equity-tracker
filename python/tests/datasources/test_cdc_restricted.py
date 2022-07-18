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

GOLDEN_DATA_BY_SEX_NATIONAL = os.path.join(
    TEST_DIR, 'golden_data', 'by_sex_national.json')


def get_fips_and_county_names_as_df(*args, **kwargs):
    if args[1] == 'fips_codes_all':
        return pd.read_csv(os.path.join(TEST_DIR, 'county_names.csv'), dtype=str)
    else:
        return get_state_fips_codes_as_df()


def get_pop_numbers_as_df(*args, **kwargs):
    demo = ''
    if 'race' in args[1]:
        demo = 'race'
    elif 'age' in args[1]:
        demo = 'age'
    elif 'sex' in args[1]:
        demo = 'sex'

    loc = ''
    if 'county' in args[1]:
        loc = 'county'
    elif 'state' in args[1]:
        loc = 'state'
    elif 'national' in args[1]:
        loc = 'national'

    if args[0] == 'acs_2010_population':
        return pd.read_csv(os.path.join(TEST_DIR, f'population_2010_{demo}.csv'),
                           dtype={'state_fips': str,
                                  'county_fips': str,
                                  })
    else:
        return pd.read_csv(os.path.join(TEST_DIR, f'population_by_{demo}_{loc}.csv'),
                           dtype={'state_fips': str,
                                  'county_fips': str,
                                  })


def get_cdc_numbers_as_df(*args, **kwargs):
    if args[1] == 'cdc_restricted_by_race_and_age_state.csv':
        # We dont test this, just need to return something here
        return pd.read_csv(os.path.join(TEST_DIR, 'cdc_restricted_by_sex_state.csv'), dtype={
            'state_fips': str,
        })

    return pd.read_csv(os.path.join(TEST_DIR, args[1]), dtype={
        'state_fips': str,
        'county_fips': str,
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


@mock.patch('ingestion.gcs_to_bq_util.load_df_from_bigquery',
            side_effect=get_pop_numbers_as_df)
@mock.patch('ingestion.gcs_to_bq_util.load_public_dataset_from_bigquery_as_df',
            return_value=get_state_fips_codes_as_df())
def testGenerateBreakdownSexState(mock_fips: mock.MagicMock, mock_pop: mock.MagicMock):
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
            side_effect=get_pop_numbers_as_df)
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


@mock.patch('ingestion.gcs_to_bq_util.load_df_from_bigquery',
            side_effect=get_pop_numbers_as_df)
@mock.patch('ingestion.gcs_to_bq_util.load_public_dataset_from_bigquery_as_df',
            side_effect=get_fips_and_county_names_as_df)
def testGenerateBreakdownSexNational(mock_fips: mock.MagicMock, mock_pop: mock.MagicMock):
    cdc_restricted = CDCRestrictedData()

    df = cdc_restricted.generate_breakdown(get_cdc_restricted_by_sex_state_as_df(), 'sex', 'national')
    expected_df = pd.read_json(GOLDEN_DATA_BY_SEX_NATIONAL, dtype={
        'state_fips': str,
        'covid_cases_share': float,
        'covid_hosp_share': float,
        'covid_deaths_share': float,
    })

    assert_frame_equal(df, expected_df, check_like=True)


# @mock.patch('ingestion.gcs_to_bq_util.load_df_from_bigquery',
#             side_effect=get_pop_numbers_as_df)
# @mock.patch('ingestion.gcs_to_bq_util.load_public_dataset_from_bigquery_as_df',
#             side_effect=get_fips_and_county_names_as_df)
# @mock.patch('ingestion.gcs_to_bq_util.load_csv_as_df',
#             side_effect=get_cdc_numbers_as_df)
# @mock.patch('ingestion.gcs_to_bq_util.add_df_to_bq',
#             return_value=None)
# def testWriteToBq(
#         mock_bq: mock.MagicMock,
#         mock_csv: mock.MagicMock,
#         mock_fips: mock.MagicMock,
#         mock_pop: mock.MagicMock):

#     cdc_restricted = CDCRestrictedData()

#     kwargs = {'filename': 'test_file.csv',
#               'metadata_table_id': 'test_metadata',
#               'table_name': 'output_table'}
#     cdc_restricted.write_to_bq('dataset', 'gcs_bucket', **kwargs)

#     assert mock_csv.call_count == 10
#     assert mock_csv.call_args_list[0].args[1] == 'cdc_restricted_by_sex_state.csv'
#     assert mock_csv.call_args_list[1].args[1] == 'cdc_restricted_by_race_state.csv'
#     assert mock_csv.call_args_list[2].args[1] == 'cdc_restricted_by_age_state.csv'
#     assert mock_csv.call_args_list[3].args[1] == 'cdc_restricted_by_sex_state.csv'
#     assert mock_csv.call_args_list[4].args[1] == 'cdc_restricted_by_race_state.csv'
#     assert mock_csv.call_args_list[5].args[1] == 'cdc_restricted_by_age_state.csv'
#     assert mock_csv.call_args_list[6].args[1] == 'cdc_restricted_by_sex_county.csv'
#     assert mock_csv.call_args_list[7].args[1] == 'cdc_restricted_by_race_county.csv'
#     assert mock_csv.call_args_list[8].args[1] == 'cdc_restricted_by_age_county.csv'
#     assert mock_csv.call_args_list[9].args[1] == 'cdc_restricted_by_race_and_age_state.csv'

#     assert mock_pop.call_count == 18
#     assert mock_pop.call_args_list[0].args[1] == 'by_sex_state'
#     assert mock_pop.call_args_list[1].args[1] == 'by_sex_territory'
#     assert mock_pop.call_args_list[2].args[1] == 'by_sex_national'
#     assert mock_pop.call_args_list[3].args[1] == 'by_race_state_std'
#     assert mock_pop.call_args_list[4].args[1] == 'by_race_and_ethnicity_territory'
#     assert mock_pop.call_args_list[5].args[1] == 'by_race_national'
#     assert mock_pop.call_args_list[6].args[1] == 'by_age_state'
#     assert mock_pop.call_args_list[7].args[1] == 'by_age_territory'
#     assert mock_pop.call_args_list[8].args[1] == 'by_age_national'
#     assert mock_pop.call_args_list[9].args[1] == 'by_sex_state'
#     assert mock_pop.call_args_list[10].args[1] == 'by_sex_territory'
#     assert mock_pop.call_args_list[11].args[1] == 'by_race_state_std'
#     assert mock_pop.call_args_list[12].args[1] == 'by_race_and_ethnicity_territory'
#     assert mock_pop.call_args_list[13].args[1] == 'by_age_state'
#     assert mock_pop.call_args_list[14].args[1] == 'by_age_territory'
#     assert mock_pop.call_args_list[15].args[1] == 'by_sex_county'
#     assert mock_pop.call_args_list[16].args[1] == 'by_race_county_std'
#     assert mock_pop.call_args_list[17].args[1] == 'by_age_county'

#     assert mock_bq.call_count == 10
#     assert mock_bq.call_args_list[0].args[2] == 'by_sex_national_processed'
#     assert mock_bq.call_args_list[1].args[2] == 'by_race_national_processed'
#     assert mock_bq.call_args_list[2].args[2] == 'by_age_national_processed'
#     assert mock_bq.call_args_list[3].args[2] == 'by_sex_state_processed'
#     assert mock_bq.call_args_list[4].args[2] == 'by_race_state_processed'
#     assert mock_bq.call_args_list[5].args[2] == 'by_age_state_processed'
#     assert mock_bq.call_args_list[6].args[2] == 'by_sex_county_processed'
#     assert mock_bq.call_args_list[7].args[2] == 'by_race_county_processed'
#     assert mock_bq.call_args_list[8].args[2] == 'by_age_county_processed'
#     assert mock_bq.call_args_list[9].args[2] == 'by_race_age_state'
