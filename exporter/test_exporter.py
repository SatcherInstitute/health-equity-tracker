from unittest.mock import Mock, patch

import google.cloud.exceptions
import pytest
import os

from flask.testing import FlaskClient
from google.cloud import bigquery

from main import app

test_tables = [bigquery.Table("my-project.my-dataset.t1"),
               bigquery.Table("my-project.my-dataset.t2_std"),
               bigquery.Table("my-project.my-dataset.t3")]

os.environ['PROJECT_ID'] = 'my-project'
os.environ['EXPORT_BUCKET'] = 'my-bucket'


@pytest.fixture
def client():
    """Creates a Flask test client for each test."""
    app.config['TESTING'] = True
    with app.test_client() as app_client:
        yield app_client


def testExportDatasetTables(client: FlaskClient):
    with patch('google.cloud.bigquery.Client') as mock_bq_client:
        # Set up mocks
        mock_bq_instance = mock_bq_client.return_value
        mock_bq_instance.list_tables.return_value = test_tables

        dataset_name = {'dataset_name': 'my-dataset'}
        response = client.post('/', json=dataset_name)

        assert response.status_code == 204
        assert mock_bq_instance.extract_table.call_count == 4


def testExportDatasetTables_InvalidInput(client: FlaskClient):
    response = client.post('/', json={})
    assert response.status_code == 400


def testExportDatasetTables_NoTables(client: FlaskClient):
    with patch('google.cloud.bigquery.Client') as mock_bq_client:
        # Set up mocks
        mock_bq_instance = mock_bq_client.return_value
        mock_bq_instance.list_tables.return_value = iter(())

        dataset_name = {'dataset_name': 'my-dataset'}
        response = client.post('/', json=dataset_name)

        assert response.status_code == 500


def testExportDatasetTables_ExtractJobFailure(client: FlaskClient):
    with patch('google.cloud.bigquery.Client') as mock_bq_client:
        # Set up mocks
        mock_bq_instance = mock_bq_client.return_value
        mock_bq_instance.list_tables.return_value = test_tables
        mock_extract_job = Mock()
        mock_bq_instance.extract_table.return_value = mock_extract_job
        mock_extract_job.result.side_effect = google.cloud.exceptions.InternalServerError('Internal')

        dataset_name = {'dataset_name': 'my-dataset'}
        response = client.post('/', json=dataset_name)

        assert response.status_code == 500
