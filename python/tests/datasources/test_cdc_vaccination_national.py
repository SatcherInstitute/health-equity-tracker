from unittest import mock
import os

import pandas as pd
from pandas._testing import assert_frame_equal

from datasources.cdc_vaccination_national import CDCVaccinationNational

# Current working directory.
THIS_DIR = os.path.dirname(os.path.abspath(__file__))
TEST_DIR = os.path.join(THIS_DIR, os.pardir, "data",
                        "cdc_vaccination_national")

GOLDEN_DATA = {
    'race': os.path.join(TEST_DIR, 'cdc_vaccination_national_by_race_and_ethnicity.csv'),
    'sex': os.path.join(TEST_DIR, 'cdc_vaccination_national_by_sex.csv'),
    'age': os.path.join(TEST_DIR, 'cdc_vaccination_national_by_age.csv'),
}


def get_state_test_data_as_df():
    return pd.read_json(
        os.path.join(TEST_DIR, 'cdc_vaccination_national_test.json'),
        dtype={'state_fips': str, 'administered_dose1_pct': float},
    )


def get_pop_numbers_as_df(*args):
    if 'race' in args[1]:
        return pd.read_csv(os.path.join(TEST_DIR, 'population_race.csv'), dtype={'state_fips': str})
    elif 'sex' in args[1]:
        return pd.read_csv(os.path.join(TEST_DIR, 'population_sex.csv'), dtype={'state_fips': str})


@mock.patch('ingestion.gcs_to_bq_util.load_json_as_df_from_web',
            return_value=get_state_test_data_as_df())
@mock.patch('ingestion.gcs_to_bq_util.load_df_from_bigquery',
            side_effect=get_pop_numbers_as_df)
@mock.patch('ingestion.gcs_to_bq_util.add_df_to_bq',
            return_value=None)
def testWriteToBqRace(mock_bq: mock.MagicMock, mock_pop: mock.MagicMock, mock_csv: mock.MagicMock):
    cdcVaccination = CDCVaccinationNational()

    kwargs = {'filename': 'test_file.csv',
              'metadata_table_id': 'test_metadata',
              'table_name': 'output_table'}

    cdcVaccination.write_to_bq('dataset', 'gcs_bucket', **kwargs)
    assert mock_bq.call_count == 3

    expected_df = pd.read_csv(GOLDEN_DATA['race'], dtype={
        'population_pct': str,
        'state_fips': str
    })

    df = mock_bq.call_args_list[0].args[0]
    sort_cols = list(df.columns)

    assert_frame_equal(
        df.sort_values(by=sort_cols).reset_index(drop=True),
        expected_df.sort_values(by=sort_cols).reset_index(drop=True),
        check_like=True)


@mock.patch('ingestion.gcs_to_bq_util.load_json_as_df_from_web',
            return_value=get_state_test_data_as_df())
@mock.patch('ingestion.gcs_to_bq_util.load_df_from_bigquery',
            side_effect=get_pop_numbers_as_df)
@mock.patch('ingestion.gcs_to_bq_util.add_df_to_bq',
            return_value=None)
def testWriteToBqSex(mock_bq: mock.MagicMock, mock_pop: mock.MagicMock, mock_csv: mock.MagicMock):
    cdcVaccination = CDCVaccinationNational()

    kwargs = {'filename': 'test_file.csv',
              'metadata_table_id': 'test_metadata',
              'table_name': 'output_table'}

    cdcVaccination.write_to_bq('dataset', 'gcs_bucket', **kwargs)
    assert mock_bq.call_count == 3

    expected_df = pd.read_csv(GOLDEN_DATA['sex'], dtype={
        'population_pct': str,
        'state_fips': str
    })

    df = mock_bq.call_args_list[1].args[0]
    sort_cols = list(df.columns)

    assert_frame_equal(
        df.sort_values(by=sort_cols).reset_index(drop=True),
        expected_df.sort_values(by=sort_cols).reset_index(drop=True),
        check_like=True)


@mock.patch('ingestion.gcs_to_bq_util.load_json_as_df_from_web',
            return_value=get_state_test_data_as_df())
@mock.patch('ingestion.gcs_to_bq_util.load_df_from_bigquery',
            side_effect=get_pop_numbers_as_df)
@mock.patch('ingestion.gcs_to_bq_util.add_df_to_bq',
            return_value=None)
def testWriteToBqAge(mock_bq: mock.MagicMock, mock_pop: mock.MagicMock, mock_csv: mock.MagicMock):
    cdcVaccination = CDCVaccinationNational()

    kwargs = {'filename': 'test_file.csv',
              'metadata_table_id': 'test_metadata',
              'table_name': 'output_table'}

    cdcVaccination.write_to_bq('dataset', 'gcs_bucket', **kwargs)
    assert mock_bq.call_count == 3

    expected_df = pd.read_csv(GOLDEN_DATA['age'], dtype={
        'vaccinated_pop_pct': str,
        'state_fips': str
    })

    df = mock_bq.call_args_list[2].args[0]
    sort_cols = list(df.columns)

    assert_frame_equal(
        df.sort_values(by=sort_cols).reset_index(drop=True),
        expected_df.sort_values(by=sort_cols).reset_index(drop=True),
        check_like=True)
