from unittest import mock
import os
import pandas as pd
from pandas._testing import assert_frame_equal
from test_utils import _load_df_from_bigquery
from datasources.ahr import AHRData

THIS_DIR = os.path.dirname(os.path.abspath(__file__))
TEST_DIR = os.path.join(THIS_DIR, os.pardir, "data", "ahr")
GOLDEN_DIR = os.path.join(TEST_DIR, 'golden_data')

GOLDEN_DATA_RACE = os.path.join(GOLDEN_DIR, 'ahr_test_output_race_and_ethnicity.json')
GOLDEN_DATA_AGE = os.path.join(GOLDEN_DIR, 'ahr_test_output_age.json')
GOLDEN_DATA_SEX = os.path.join(GOLDEN_DIR, 'ahr_test_output_sex.json')


def get_test_data_as_df():
    df = pd.read_csv(
        os.path.join(TEST_DIR, 'ahr_test_input.csv'),
        dtype={'StateCode': str, "Measure": str, "Value": float},
    )
    df_national = df.copy().reset_index(drop=True)
    df_national['StateCode'] = 'ALL'
    df = pd.concat([df, df_national]).reset_index(drop=True)

    return df


EXPECTED_DTYPE = {
    'state_name': str,
    'state_fips': str,
    "diabetes_per_100k": float,
    "copd_per_100k": float,
    "frequent_mental_distress_per_100k": float,
    "depression_per_100k": float,
    "suicide_per_100k": float,
    "non_medical_drug_use_per_100k": float,
    "excessive_drinking_per_100k": float,
    "preventable_hospitalizations_per_100k": float,
    "avoided_care_pct_rate": float,
    "chronic_kidney_disease_per_100k": float,
    "cardiovascular_diseases_per_100k": float,
    "asthma_per_100k": float,
    "voter_participation_pct_rate": float,
    'ahr_population_pct': float,
}


@mock.patch(
    'ingestion.gcs_to_bq_util.load_df_from_bigquery',
    side_effect=_load_df_from_bigquery,
)
@mock.patch(
    'ingestion.gcs_to_bq_util.load_csv_as_df_from_data_dir',
    return_value=get_test_data_as_df(),
)
@mock.patch('ingestion.gcs_to_bq_util.add_df_to_bq', return_value=None)
def testWriteToBqRaceState(
    mock_bq: mock.MagicMock,
    mock_data_dir_df: mock.MagicMock,
    mock_pop: mock.MagicMock,
):
    expected_dtype = EXPECTED_DTYPE.copy()

    datasource = AHRData()
    kwargs = {
        'filename': 'test_file.csv',
        'metadata_table_id': 'test_metadata',
        'table_name': 'output_table',
    }
    datasource.write_to_bq('dataset', 'gcs_bucket', **kwargs)

    assert mock_bq.call_count == 6
    assert mock_pop.call_count == 9
    assert mock_pop.call_args_list[0].args[1] == 'by_race_state'

    # add column type for each demographic file
    expected_dtype['race_and_ethnicity'] = str
    expected_dtype['race_category_id'] = str

    expected_df = pd.read_json(GOLDEN_DATA_RACE, dtype=expected_dtype)

    assert_frame_equal(mock_bq.call_args_list[0].args[0], expected_df, check_like=True)


@mock.patch('ingestion.gcs_to_bq_util.load_df_from_bigquery', side_effect=_load_df_from_bigquery)
@mock.patch(
    'ingestion.gcs_to_bq_util.load_csv_as_df_from_data_dir',
    return_value=get_test_data_as_df(),
)
@mock.patch('ingestion.gcs_to_bq_util.add_df_to_bq', return_value=None)
def testWriteToBqAgeState(
    mock_bq: mock.MagicMock,
    mock_csv: mock.MagicMock,
    mock_pop: mock.MagicMock,
):
    datasource = AHRData()

    expected_dtype = EXPECTED_DTYPE.copy()
    kwargs = {
        'filename': 'test_file.csv',
        'metadata_table_id': 'test_metadata',
        'table_name': 'output_table',
    }

    datasource.write_to_bq('dataset', 'gcs_bucket', **kwargs)

    assert mock_bq.call_count == 6
    assert mock_pop.call_count == 9
    assert mock_pop.call_args_list[2].args[1] == 'by_age_state'

    expected_dtype['age'] = str

    expected_df = pd.read_json(GOLDEN_DATA_AGE, dtype=expected_dtype)

    assert_frame_equal(mock_bq.call_args_list[1].args[0], expected_df, check_like=True)


@mock.patch('ingestion.gcs_to_bq_util.load_df_from_bigquery', side_effect=_load_df_from_bigquery)
@mock.patch(
    'ingestion.gcs_to_bq_util.load_csv_as_df_from_data_dir',
    return_value=get_test_data_as_df(),
)
@mock.patch('ingestion.gcs_to_bq_util.add_df_to_bq', return_value=None)
def testWriteToBqSexState(
    mock_bq: mock.MagicMock,
    mock_csv: mock.MagicMock,
    mock_pop: mock.MagicMock,
):
    datasource = AHRData()

    expected_dtype = EXPECTED_DTYPE.copy()
    kwargs = {
        'filename': 'test_file.csv',
        'metadata_table_id': 'test_metadata',
        'table_name': 'output_table',
    }

    datasource.write_to_bq('dataset', 'gcs_bucket', **kwargs)

    assert mock_bq.call_count == 6
    assert mock_pop.call_count == 9
    assert mock_pop.call_args_list[4].args[1] == 'by_sex_state'

    expected_dtype['sex'] = str

    expected_df = pd.read_json(GOLDEN_DATA_SEX, dtype=expected_dtype)

    assert_frame_equal(mock_bq.call_args_list[2].args[0], expected_df, check_like=True)


# For the national level we only need to make sure that we are making the
# correct call to bigquery to get population data, so that is all we need to
# test. There is no need to maintain GOLDEN files for this, as there is no
# special parsing logic for national data.
@mock.patch('ingestion.gcs_to_bq_util.load_df_from_bigquery', side_effect=_load_df_from_bigquery)
@mock.patch(
    'ingestion.gcs_to_bq_util.load_csv_as_df_from_data_dir',
    return_value=get_test_data_as_df(),
)
@mock.patch('ingestion.gcs_to_bq_util.add_df_to_bq', return_value=None)
def testWriteToBqRaceNational(
    mock_bq: mock.MagicMock,
    mock_csv: mock.MagicMock,
    mock_pop: mock.MagicMock,
):
    datasource = AHRData()

    kwargs = {
        'filename': 'test_file.csv',
        'metadata_table_id': 'test_metadata',
        'table_name': 'output_table',
    }

    datasource.write_to_bq('dataset', 'gcs_bucket', **kwargs)

    assert mock_bq.call_count == 6

    assert mock_pop.call_count == 9
    assert mock_pop.call_args_list[6].args[1] == 'by_race_national'


@mock.patch('ingestion.gcs_to_bq_util.load_df_from_bigquery', side_effect=_load_df_from_bigquery)
@mock.patch(
    'ingestion.gcs_to_bq_util.load_csv_as_df_from_data_dir',
    return_value=get_test_data_as_df(),
)
@mock.patch('ingestion.gcs_to_bq_util.add_df_to_bq', return_value=None)
def testWriteToBqAgeNational(
    mock_bq: mock.MagicMock,
    mock_csv: mock.MagicMock,
    mock_pop: mock.MagicMock,
):
    datasource = AHRData()

    kwargs = {
        'filename': 'test_file.csv',
        'metadata_table_id': 'test_metadata',
        'table_name': 'output_table',
    }

    datasource.write_to_bq('dataset', 'gcs_bucket', **kwargs)

    assert mock_bq.call_count == 6

    assert mock_pop.call_count == 9
    assert mock_pop.call_args_list[7].args[1] == 'by_age_national'


@mock.patch('ingestion.gcs_to_bq_util.load_df_from_bigquery', side_effect=_load_df_from_bigquery)
@mock.patch(
    'ingestion.gcs_to_bq_util.load_csv_as_df_from_data_dir',
    return_value=get_test_data_as_df(),
)
@mock.patch('ingestion.gcs_to_bq_util.add_df_to_bq', return_value=None)
def testWriteToBqSexNational(
    mock_bq: mock.MagicMock,
    mock_csv: mock.MagicMock,
    mock_pop: mock.MagicMock,
):
    datasource = AHRData()

    kwargs = {
        'filename': 'test_file.csv',
        'metadata_table_id': 'test_metadata',
        'table_name': 'output_table',
    }

    datasource.write_to_bq('dataset', 'gcs_bucket', **kwargs)

    assert mock_bq.call_count == 6

    assert mock_pop.call_count == 9
    assert mock_pop.call_args_list[8].args[1] == 'by_sex_national'
