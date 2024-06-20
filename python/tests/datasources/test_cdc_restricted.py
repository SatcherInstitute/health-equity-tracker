from unittest import mock
import os
import pandas as pd
from pandas._testing import assert_frame_equal
from datasources.cdc_restricted import CDCRestrictedData  # type: ignore

# Current working directory.
THIS_DIR = os.path.dirname(os.path.abspath(__file__))
TEST_DIR = os.path.join(THIS_DIR, os.pardir, "data", "cdc_restricted")

GOLDEN_DATA_BY_SEX_STATE_TIME_SERIES = os.path.join(TEST_DIR, 'golden_data', 'by_sex_state_time_series.json')
GOLDEN_DATA_BY_SEX_COUNTY_TIME_SERIES = os.path.join(TEST_DIR, 'golden_data', 'by_sex_county_time_series.json')
GOLDEN_DATA_BY_SEX_NATIONAL_TIME_SERIES = os.path.join(TEST_DIR, 'golden_data', 'by_sex_national_time_series.json')
GOLDEN_DATA_BY_SEX_STATE_CUMULATIVE = os.path.join(TEST_DIR, 'golden_data', 'by_sex_state_cumulative.json')
GOLDEN_DATA_BY_SEX_COUNTY_CUMULATIVE = os.path.join(TEST_DIR, 'golden_data', 'by_sex_county_cumulative.json')
GOLDEN_DATA_BY_SEX_NATIONAL_CUMULATIVE = os.path.join(TEST_DIR, 'golden_data', 'by_sex_national_cumulative.json')


def get_cdc_numbers_as_df(*args):

    if args[1] == 'cdc_restricted_by_race_and_age_state.csv':
        # We dont test this, just need to return something here
        return pd.read_csv(
            os.path.join(TEST_DIR, 'cdc_restricted_by_sex_state.csv'),
            dtype={
                'state_fips': str,
            },
        )

    return pd.read_csv(
        os.path.join(TEST_DIR, args[1]),
        dtype={
            'state_fips': str,
            'county_fips': str,
        },
    )


def get_cdc_restricted_by_sex_state_as_df():
    return pd.read_csv(
        os.path.join(TEST_DIR, 'cdc_restricted_by_sex_state.csv'),
        dtype={
            'state_fips': str,
        },
    )


def get_cdc_restricted_by_sex_county_as_df():
    return pd.read_csv(
        os.path.join(TEST_DIR, 'cdc_restricted_by_sex_county.csv'),
        dtype={
            'state_fips': str,
            'county_fips': str,
        },
    )


def testGenerateBreakdownSexStateTimeSeries():
    cdc_restricted = CDCRestrictedData()

    df = cdc_restricted.generate_breakdown(get_cdc_restricted_by_sex_state_as_df(), 'sex', 'state', True)
    # pylint: disable=no-member
    expected_df = pd.read_json(
        GOLDEN_DATA_BY_SEX_STATE_TIME_SERIES,
        dtype={
            'state_fips': str,
            'covid_cases_share': float,
            'covid_hosp_share': float,
            'covid_deaths_share': float,
        },
    )

    sortby_cols = list(df.columns)

    assert_frame_equal(
        df.sort_values(by=sortby_cols).reset_index(drop=True),
        expected_df.sort_values(by=sortby_cols).reset_index(drop=True),
        check_like=True,
    )


def testGenerateBreakdownSexCountyTimeSeries():
    cdc_restricted = CDCRestrictedData()

    df = cdc_restricted.generate_breakdown(get_cdc_restricted_by_sex_county_as_df(), 'sex', 'county', True)

    # pylint: disable=no-member
    expected_df = pd.read_json(
        GOLDEN_DATA_BY_SEX_COUNTY_TIME_SERIES,
        dtype={
            'state_fips': str,
            'county_fips': str,
            'covid_cases_share': float,
            'covid_hosp_share': float,
            'covid_deaths_share': float,
        },
    )

    sortby_cols = list(df.columns)

    assert_frame_equal(
        df.sort_values(by=sortby_cols).reset_index(drop=True),
        expected_df.sort_values(by=sortby_cols).reset_index(drop=True),
        check_like=True,
    )


def testGenerateBreakdownSexNationalTimeSeries():
    cdc_restricted = CDCRestrictedData()

    df = cdc_restricted.generate_breakdown(get_cdc_restricted_by_sex_state_as_df(), 'sex', 'national', True)

    # pylint: disable=no-member
    expected_df = pd.read_json(
        GOLDEN_DATA_BY_SEX_NATIONAL_TIME_SERIES,
        dtype={
            'state_fips': str,
            'covid_cases_share': float,
            'covid_hosp_share': float,
            'covid_deaths_share': float,
        },
    )

    sortby_cols = list(df.columns)

    assert_frame_equal(
        df.sort_values(by=sortby_cols).reset_index(drop=True),
        expected_df.sort_values(by=sortby_cols).reset_index(drop=True),
        check_like=True,
    )


def testGenerateBreakdownSexStateCumulative():
    cdc_restricted = CDCRestrictedData()

    df = cdc_restricted.generate_breakdown(get_cdc_restricted_by_sex_state_as_df(), 'sex', 'state', False)

    # pylint: disable=no-member
    expected_df = pd.read_json(
        GOLDEN_DATA_BY_SEX_STATE_CUMULATIVE,
        dtype={
            'state_fips': str,
            'covid_cases_share': float,
            'covid_hosp_share': float,
            'covid_deaths_share': float,
        },
    )

    sortby_cols = list(df.columns)

    assert_frame_equal(
        df.sort_values(by=sortby_cols).reset_index(drop=True),
        expected_df.sort_values(by=sortby_cols).reset_index(drop=True),
        check_like=True,
    )


def testGenerateBreakdownSexNationalCumulative():
    cdc_restricted = CDCRestrictedData()

    df = cdc_restricted.generate_breakdown(get_cdc_restricted_by_sex_state_as_df(), 'sex', 'national', False)

    # pylint: disable=no-member
    expected_df = pd.read_json(
        GOLDEN_DATA_BY_SEX_NATIONAL_CUMULATIVE,
        dtype={
            'state_fips': str,
            'covid_cases_share': float,
            'covid_hosp_share': float,
            'covid_deaths_share': float,
        },
    )

    sortby_cols = list(df.columns)

    assert_frame_equal(
        df.sort_values(by=sortby_cols).reset_index(drop=True),
        expected_df.sort_values(by=sortby_cols).reset_index(drop=True),
        check_like=True,
    )


def testGenerateBreakdownSexCountyCumulative():
    cdc_restricted = CDCRestrictedData()

    df = cdc_restricted.generate_breakdown(get_cdc_restricted_by_sex_county_as_df(), 'sex', 'county', False)

    # pylint: disable=no-member
    expected_df = pd.read_json(
        GOLDEN_DATA_BY_SEX_COUNTY_CUMULATIVE,
        dtype={
            'state_fips': str,
            'county_fips': str,
            'covid_cases_share': float,
            'covid_hosp_share': float,
            'covid_deaths_share': float,
        },
    )

    sortby_cols = list(df.columns)

    assert_frame_equal(
        df.sort_values(by=sortby_cols).reset_index(drop=True),
        expected_df.sort_values(by=sortby_cols).reset_index(drop=True),
        check_like=True,
    )


@mock.patch('ingestion.gcs_to_bq_util.load_csv_as_df', side_effect=get_cdc_numbers_as_df)
@mock.patch('ingestion.gcs_to_bq_util.add_df_to_bq', return_value=None)
def testWriteToBqAgeNational(mock_bq: mock.MagicMock, mock_csv: mock.MagicMock):
    cdc_restricted = CDCRestrictedData()

    kwargs = {
        'filename': 'test_file.csv',
        'metadata_table_id': 'test_metadata',
        'table_name': 'output_table',
        'demographic': 'age',
        'geographic': 'national',
    }
    cdc_restricted.write_to_bq('dataset', 'gcs_bucket', **kwargs)

    assert mock_csv.call_count == 1
    assert mock_csv.call_args_list[0].args[1] == 'cdc_restricted_by_age_state.csv'

    assert mock_bq.call_count == 2
    assert mock_bq.call_args_list[0].args[2] == 'by_age_national_processed'
    assert mock_bq.call_args_list[1].args[2] == 'by_age_national_processed_time_series'


@mock.patch('ingestion.gcs_to_bq_util.load_csv_as_df', side_effect=get_cdc_numbers_as_df)
@mock.patch('ingestion.gcs_to_bq_util.add_df_to_bq', return_value=None)
def testWriteToBqAgeState(mock_bq: mock.MagicMock, mock_csv: mock.MagicMock):
    cdc_restricted = CDCRestrictedData()

    kwargs = {
        'filename': 'test_file.csv',
        'metadata_table_id': 'test_metadata',
        'table_name': 'output_table',
        'demographic': 'age',
        'geographic': 'state',
    }
    cdc_restricted.write_to_bq('dataset', 'gcs_bucket', **kwargs)

    assert mock_csv.call_count == 1
    assert mock_csv.call_args_list[0].args[1] == 'cdc_restricted_by_age_state.csv'

    assert mock_bq.call_count == 2
    assert mock_bq.call_args_list[0].args[2] == 'by_age_state_processed'
    assert mock_bq.call_args_list[1].args[2] == 'by_age_state_processed_time_series'


@mock.patch('ingestion.gcs_to_bq_util.load_csv_as_df', side_effect=get_cdc_numbers_as_df)
@mock.patch('ingestion.gcs_to_bq_util.add_df_to_bq', return_value=None)
def testWriteToBqAgeCounty(mock_bq: mock.MagicMock, mock_csv: mock.MagicMock):
    cdc_restricted = CDCRestrictedData()

    kwargs = {
        'filename': 'test_file.csv',
        'metadata_table_id': 'test_metadata',
        'table_name': 'output_table',
        'demographic': 'age',
        'geographic': 'county',
    }
    cdc_restricted.write_to_bq('dataset', 'gcs_bucket', **kwargs)

    assert mock_csv.call_count == 1
    assert mock_csv.call_args_list[0].args[1] == 'cdc_restricted_by_age_county.csv'

    assert mock_bq.call_count == 2
    assert mock_bq.call_args_list[0].args[2] == 'by_age_county_processed'
    assert mock_bq.call_args_list[1].args[2] == 'by_age_county_processed_time_series'


@mock.patch('ingestion.gcs_to_bq_util.load_csv_as_df', side_effect=get_cdc_numbers_as_df)
@mock.patch('ingestion.gcs_to_bq_util.add_df_to_bq', return_value=None)
def testWriteToBqSexCounty(mock_bq: mock.MagicMock, mock_csv: mock.MagicMock):
    cdc_restricted = CDCRestrictedData()

    kwargs = {
        'filename': 'test_file.csv',
        'metadata_table_id': 'test_metadata',
        'table_name': 'output_table',
        'demographic': 'sex',
        'geographic': 'county',
    }
    cdc_restricted.write_to_bq('dataset', 'gcs_bucket', **kwargs)

    assert mock_csv.call_count == 1
    assert mock_csv.call_args_list[0].args[1] == 'cdc_restricted_by_sex_county.csv'

    assert mock_bq.call_count == 2
    assert mock_bq.call_args_list[0].args[2] == 'by_sex_county_processed'
    assert mock_bq.call_args_list[1].args[2] == 'by_sex_county_processed_time_series'


@mock.patch('ingestion.gcs_to_bq_util.load_csv_as_df', side_effect=get_cdc_numbers_as_df)
@mock.patch('ingestion.gcs_to_bq_util.add_df_to_bq', return_value=None)
def testWriteToBqRaceNational(mock_bq: mock.MagicMock, mock_csv: mock.MagicMock):
    cdc_restricted = CDCRestrictedData()

    kwargs = {
        'filename': 'test_file.csv',
        'metadata_table_id': 'test_metadata',
        'table_name': 'output_table',
        'demographic': 'race',
        'geographic': 'national',
    }
    cdc_restricted.write_to_bq('dataset', 'gcs_bucket', **kwargs)

    assert mock_csv.call_count == 2
    assert mock_csv.call_args_list[0].args[1] == 'cdc_restricted_by_race_state.csv'
    assert mock_csv.call_args_list[1].args[1] == 'cdc_restricted_by_race_and_age_state.csv'

    assert mock_bq.call_count == 3
    assert mock_bq.call_args_list[0].args[2] == 'by_race_national_processed'
    assert mock_bq.call_args_list[1].args[2] == 'by_race_national_processed_time_series'
    assert mock_bq.call_args_list[2].args[2] == 'by_race_age_state'
