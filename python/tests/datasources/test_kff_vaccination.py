from unittest import mock
import os

import pandas as pd
from pandas._testing import assert_frame_equal

from datasources.kff_vaccination import KFFVaccination
from datasources.kff_vaccination import get_data_url

# Current working directory.
THIS_DIR = os.path.dirname(os.path.abspath(__file__))
TEST_DIR = os.path.join(THIS_DIR, os.pardir, "data", "kff_vaccination")

GOLDEN_DATA = os.path.join(
    TEST_DIR, 'kff_vaccination_by_race_and_ethnicity.csv')


def get_github_file_list_as_df():
    return pd.read_json(os.path.join(TEST_DIR, 'github_file_list.json'))


def get_percentage_of_race_test_data_as_df():
    return pd.read_csv(os.path.join(TEST_DIR, 'kff_vaccination_percentage_of_race_test.csv'))


def get_pct_share_race_test_data_as_df():
    return pd.read_csv(os.path.join(TEST_DIR, 'kff_vaccination_pct_share_race_test.csv'))


def get_state_totals_test_data_as_df():
    return pd.read_csv(os.path.join(TEST_DIR, 'kff_vaccination_state_totals_test.csv'),
                       dtype={'one_dose': str})


def get_population_numbers_as_df():
    return pd.read_csv(os.path.join(TEST_DIR, 'kff_vaccination_population.csv'), dtype=str)


@mock.patch('ingestion.gcs_to_bq_util.load_json_as_df_from_web_based_on_key',
            return_value=get_github_file_list_as_df())
def testGetDataUrlPctTotal(mock_json: mock.MagicMock):
    assert get_data_url('pct_total') == "some-up-to-date-url"


@mock.patch('ingestion.gcs_to_bq_util.load_json_as_df_from_web_based_on_key',
            return_value=get_github_file_list_as_df())
def testGetDataUrlPctShare(mock_json: mock.MagicMock):
    assert get_data_url('pct_share') == "some-other-up-to-date-url"


@mock.patch('ingestion.gcs_to_bq_util.load_json_as_df_from_web_based_on_key',
            return_value=get_github_file_list_as_df())
@mock.patch('ingestion.gcs_to_bq_util.load_csv_as_df_from_web',
            return_value=get_state_totals_test_data_as_df())
@mock.patch('ingestion.github_util.decode_json_from_url_into_df')
@mock.patch('ingestion.gcs_to_bq_util.add_df_to_bq',
            return_value=None)
def testWriteToBq(
        mock_bq: mock.MagicMock,
        mock_csv: mock.MagicMock,
        mock_csv_web: mock.MagicMock,
        mock_json: mock.MagicMock
):
    mock_csv.side_effect = [
        get_percentage_of_race_test_data_as_df(),
        get_pct_share_race_test_data_as_df(),
        get_population_numbers_as_df(),
    ]
    kffVaccination = KFFVaccination()

    kwargs = {'filename': 'test_file.csv',
              'metadata_table_id': 'test_metadata',
              'table_name': 'output_table'}

    kffVaccination.write_to_bq('dataset', 'gcs_bucket', **kwargs)
    assert mock_bq.call_count == 1

    expected_df = pd.read_csv(GOLDEN_DATA, dtype={
        'state_fips': str,
    })

    # print("/n")
    # print(expected_df)

    assert_frame_equal(
        mock_bq.call_args_list[0].args[0], expected_df, check_like=True)
