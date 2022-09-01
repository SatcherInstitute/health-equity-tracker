from unittest import mock
from unittest.mock import Mock, patch

import google.cloud.exceptions
import pytest
import os

from flask.testing import FlaskClient
from google.cloud import bigquery

from main import app, export_split_county_tables

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


def testExportDatasetTables(client: FlaskClient):
    with patch('google.cloud.bigquery.Client') as mock_bq_client:
        # Set up mocks
        mock_bq_instance = mock_bq_client.return_value
        mock_bq_instance.list_tables.return_value = test_tables

        dataset_name = {'dataset_name': 'my-dataset'}
        response = client.post('/', json=dataset_name)

        assert response.status_code == 204
        assert mock_bq_instance.extract_table.call_count == 5  # t1+t2+t2+t3+t4
        assert mock_bq_instance.query.call_count == 1  # t4


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
        mock_extract_job.result.side_effect = google.cloud.exceptions.InternalServerError(
            'Internal')

        dataset_name = {'dataset_name': 'my-dataset'}
        response = client.post('/', json=dataset_name)

        assert response.status_code == 500


def _fake_query_to_df(*args):
    print("!!!")


class Fake_Table:
    def __init__(self):
        self.project = "fake_project",
        self.dataset_id = "fake_dataset_id",
        self.table_id = "fake_table_id"


_a_fake_table = Fake_Table()


@ mock.patch('google.cloud.storage.Client')
@ mock.patch('google.cloud.bigquery.job.QueryJob.to_dataframe', side_effect=_fake_query_to_df)
@ mock.patch('google.cloud.bigquery.Client.query')
def testExportSplitCountyTables(
    mock_bq_query: mock.MagicMock,
    mock_df: mock.MagicMock,
    mock_storage: mock.MagicMock
):
    # mock_bq_instance = mock_bq_client.return_value
    # mock_bq_instance.list_tables.return_value = test_tables

    export_split_county_tables(None, _a_fake_table, "test_export_bucket")

    print(mock_storage.call_count)
