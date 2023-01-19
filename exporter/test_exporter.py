from unittest import mock
from unittest.mock import Mock
import pytest
import os
import google.cloud.exceptions
from flask.testing import FlaskClient
from google.cloud import bigquery  # type: ignore
import pandas as pd

from main import app, STATE_LEVEL_FIPS_LIST, get_table_name

NUM_STATES_AND_TERRITORIES = len(STATE_LEVEL_FIPS_LIST)

TEST_TABLES = [bigquery.Table("my-project.my-dataset.t1-sex"),
               bigquery.Table("my-project.my-dataset.t2-age"),
               bigquery.Table("my-project.my-dataset.t3-age"),
               bigquery.Table("my-project.my-county-dataset.t4-age"),
               ]

os.environ['PROJECT_ID'] = 'my-project'
os.environ['EXPORT_BUCKET'] = 'my-bucket'


@pytest.fixture
def client():
    """Creates a Flask test client for each test."""
    app.config['TESTING'] = True
    with app.test_client() as app_client:
        yield app_client


# TEST FULL FILE EXTRACT CALLS

@mock.patch('main.export_split_county_tables')
@mock.patch('google.cloud.bigquery.Client')
def testExportDatasetTables(
    mock_bq_client: mock.MagicMock,
    mock_split_county: mock.MagicMock,
    client: FlaskClient
):
    # Set up mocks
    mock_bq_instance = mock_bq_client.return_value
    mock_bq_instance.list_tables.return_value = TEST_TABLES

    payload = {
        'dataset_name': 'my-dataset',
        'demographic': 'age'
    }
    response = client.post('/', json=payload)

    assert response.status_code == 204
    # called once per "age" table
    assert mock_bq_instance.extract_table.call_count == 3
    # called once per "age" table, only continues for county level files
    assert mock_split_county.call_count == 3


@mock.patch('main.export_split_county_tables')
@mock.patch('google.cloud.bigquery.Client')
def testExportDatasetTables_InvalidInput(
    mock_bq_client: mock.MagicMock,
    mock_split_county: mock.MagicMock,
    client: FlaskClient
):
    response = client.post('/', json={})
    assert response.status_code == 400
    assert mock_split_county.call_count == 0


@mock.patch('main.export_split_county_tables')
@mock.patch('google.cloud.bigquery.Client')
def testExportDatasetTables_NoTables(
    mock_bq_client: mock.MagicMock,
    mock_split_county: mock.MagicMock,
    client: FlaskClient
):
    # Set up mocks
    mock_bq_instance = mock_bq_client.return_value
    mock_bq_instance.list_tables.return_value = iter(())

    payload = {
        'dataset_name': 'my-dataset',
        'demographic': 'age'
    }
    response = client.post('/', json=payload)

    assert response.status_code == 500
    assert mock_split_county.call_count == 0


@mock.patch('main.export_split_county_tables')
@mock.patch('google.cloud.bigquery.Client')
def testExportDatasetTables_ExtractJobFailure(
    mock_bq_client: mock.MagicMock,
    mock_split_county: mock.MagicMock,
    client: FlaskClient
):
    # Set up mocks
    mock_bq_instance = mock_bq_client.return_value
    mock_bq_instance.list_tables.return_value = TEST_TABLES
    mock_extract_job = Mock()
    mock_bq_instance.extract_table.return_value = mock_extract_job
    mock_extract_job.result.side_effect = google.cloud.exceptions.InternalServerError(
        'Internal')

    payload = {
        'dataset_name': 'my-dataset',
        'demographic': 'age'
    }
    response = client.post('/', json=payload)

    assert response.status_code == 500
    assert mock_split_county.call_count == 1


# TEST ADDITIONAL COUNTY-LEVEL DATASET SPLIT FUNCTIONS

_test_query_results_df = pd.DataFrame({
    'county_fips': ["01001", "01002", "01003"],
    'some_condition_per_100k': [None, 1, 2],
})


@mock.patch('main.export_nd_json_to_blob')
@mock.patch('main.prepare_blob')
@mock.patch('main.prepare_bucket')
@mock.patch('main.get_query_results_as_df', return_value=_test_query_results_df)
@mock.patch('google.cloud.bigquery.Client')
def testExportSplitCountyTables(
        mock_bq_client: mock.MagicMock,
        mock_query_df: mock.MagicMock,
        mock_prepare_bucket: mock.MagicMock,
        mock_prepare_blob: mock.MagicMock,
        mock_export: mock.MagicMock,
        client: FlaskClient
):

    mock_bq_instance = mock_bq_client.return_value
    mock_bq_instance.list_tables.return_value = TEST_TABLES

    payload = {
        'dataset_name': 'my-dataset',
        'demographic': 'age'
    }
    client.post('/', json=payload)

    # ensure initial call to bq client and county-level calls per state/terr
    assert mock_bq_client.call_count == 1
    assert mock_query_df.call_count == NUM_STATES_AND_TERRITORIES
    assert mock_prepare_blob.call_count == NUM_STATES_AND_TERRITORIES
    assert mock_export.call_count == NUM_STATES_AND_TERRITORIES

    # ensure generated ndjson for bq.storage matches expected ndjson
    generated_nd_json = mock_export.call_args[0][1]
    assert (sorted(generated_nd_json) ==
            sorted(_test_query_results_df.to_json(orient="records",
                                                  lines=True)))

    bucket_name = mock_prepare_bucket.call_args[0][0]
    assert bucket_name == os.environ['EXPORT_BUCKET']

    # for each state/terr
    for i, fips in enumerate(STATE_LEVEL_FIPS_LIST):

        generated_query_string = mock_query_df.call_args_list[i][0][1]

        table_names = [get_table_name(x) for x in TEST_TABLES]
        expected_query_string = f"""
            SELECT *
            FROM {table_names[3]}
            WHERE county_fips LIKE '{fips}___'
            """

        # ensure query string is generated correctly only for county dataset
        assert generated_query_string == expected_query_string

        # ensure county level files are named as expected
        state_file_name = mock_prepare_blob.call_args_list[i][0][1]
        table = TEST_TABLES[3]
        expected_file_name = f'{table.dataset_id}-{table.table_id}-{fips}.json'
        assert state_file_name == expected_file_name
