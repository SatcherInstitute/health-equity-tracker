from unittest import mock
from unittest.mock import Mock
import pytest
import os
import google.cloud.exceptions
from flask.testing import FlaskClient
from google.cloud import bigquery  # type: ignore
import pandas as pd

from main import app, STATE_LEVEL_FIPS_TO_NAME_MAP, get_table_name

NUM_STATES_AND_TERRITORIES = len(STATE_LEVEL_FIPS_TO_NAME_MAP.keys())

test_tables = [bigquery.Table("my-project.my-dataset.t1"),
               bigquery.Table("my-project.my-dataset.t2_std"),
               bigquery.Table("my-project.my-dataset.t3"),
               bigquery.Table("my-project.my-county-dataset.t4"),
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
    mock_bq_instance.list_tables.return_value = test_tables

    dataset_name = {'dataset_name': 'my-dataset'}
    response = client.post('/', json=dataset_name)

    assert response.status_code == 204
    # called once per table plus additional time for _std files
    assert mock_bq_instance.extract_table.call_count == 5
    # called once per table, only continues for county level files
    assert mock_split_county.call_count == 4


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

    dataset_name = {'dataset_name': 'my-dataset'}
    response = client.post('/', json=dataset_name)

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
    mock_bq_instance.list_tables.return_value = test_tables
    mock_extract_job = Mock()
    mock_bq_instance.extract_table.return_value = mock_extract_job
    mock_extract_job.result.side_effect = google.cloud.exceptions.InternalServerError(
        'Internal')

    dataset_name = {'dataset_name': 'my-dataset'}
    response = client.post('/', json=dataset_name)

    assert response.status_code == 500
    assert mock_split_county.call_count == 1

#
#
#


# TEST ADDITIONAL COUNTY-LEVEL DATASET SPLIT FUNCTIONS
_test_query_results_df = pd.DataFrame({
    'county_fips': ["01001", "01002", "01003"],
    'some_condition_per_100k': [None, 1, 2],
})


def _get_query_results_as_df(*args):

    # ensure only county level test filename is in query
    mocked_bq, query_string = args
    table_names = [get_table_name(x) for x in test_tables]
    assert table_names[0] not in query_string
    assert table_names[1] not in query_string
    assert table_names[2] not in query_string
    assert table_names[3] in query_string

    # return fake_df for subsequent tests
    return _test_query_results_df


def _prepare_blob(*args):
    # ensure blob prepared only for county level file
    bucket_name, state_file_name = args
    assert bucket_name == os.environ['EXPORT_BUCKET']
    assert "county" in state_file_name
    return None


def _export_nd_json_to_blob(*args):
    _blob, nd_json = args
    # ensure string for bq.storage matches expected ndjson
    assert nd_json == _test_query_results_df.to_json(orient="records",
                                                     lines=True)
    return None


@mock.patch('main.export_nd_json_to_blob', side_effect=_export_nd_json_to_blob)
@mock.patch('main.prepare_blob', side_effect=_prepare_blob)
@mock.patch('main.get_query_results_as_df', side_effect=_get_query_results_as_df)
@mock.patch('google.cloud.bigquery.Client')
def testExportSplitCountyTables(
        mock_bq_client: mock.MagicMock,
        mock_query_df: mock.MagicMock,
        mock_prepare_blob: mock.MagicMock,
        mock_export: mock.MagicMock,
        client: FlaskClient
):

    mock_bq_instance = mock_bq_client.return_value
    mock_bq_instance.list_tables.return_value = test_tables

    dataset_name = {'dataset_name': 'my-dataset'}
    client.post('/', json=dataset_name)

    assert mock_bq_client.call_count == 1
    assert mock_query_df.call_count == NUM_STATES_AND_TERRITORIES
    assert mock_prepare_blob.call_count == NUM_STATES_AND_TERRITORIES
    assert mock_export.call_count == NUM_STATES_AND_TERRITORIES
