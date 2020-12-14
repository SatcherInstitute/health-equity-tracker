from unittest.mock import Mock, patch

import google.cloud.exceptions
import pytest
import os

from flask.testing import FlaskClient
from google.cloud import bigquery

from main import app

test_routines = [bigquery.Routine("my-project.my-dataset.AGG_r1"),
                 bigquery.Routine("my-project.my-dataset.r2"),
                 bigquery.Routine("my-project.my-dataset.AGG_r3")]

os.environ['PROJECT_ID'] = 'my-project'


@pytest.fixture
def client():
    """Creates a Flask test client for each test."""
    app.config['TESTING'] = True
    with app.test_client() as app_client:
        yield app_client


def testRunAggregationQueries(client: FlaskClient):
    with patch('google.cloud.bigquery.Client') as mock_bq_client:
        # Set up mocks
        mock_bq_instance = mock_bq_client.return_value
        mock_bq_instance.list_routines.return_value = test_routines

        dataset_name = {'dataset_name': 'my-dataset'}
        response = client.post('/', json=dataset_name)

        assert response.status_code == 204
        assert mock_bq_instance.query.call_count == 2


def testRunAggregationQueries_InvalidInput(client: FlaskClient):
    response = client.post('/', json={})
    assert response.status_code == 400


def testRunAggregationQueries_QueryFailure(client: FlaskClient):
    with patch('google.cloud.bigquery.Client') as mock_bq_client:
        # Set up mocks
        mock_bq_instance = mock_bq_client.return_value
        mock_bq_instance.list_routines.return_value = test_routines
        mock_query_job = Mock()
        mock_bq_instance.query.return_value = mock_query_job
        mock_query_job.result.side_effect = google.cloud.exceptions.InternalServerError('Internal')

        dataset_name = {'dataset_name': 'my-dataset'}
        response = client.post('/', json=dataset_name)

        assert response.status_code == 500
