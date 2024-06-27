from http import HTTPStatus
import pytest
from unittest.mock import patch
import main  # Importing main module directly


@pytest.fixture
def client():
    main.app.config['TESTING'] = True
    with main.app.test_client() as client:
        yield client


def test_ingest_data_no_json(client):
    response = client.post('/', content_type='application/json')
    assert response.status_code == HTTPStatus.BAD_REQUEST


def test_ingest_data_invalid_format(client):
    response = client.post('/', json={})
    assert response.status_code == HTTPStatus.BAD_REQUEST


def test_ingest_data_with_exception(client):
    with patch('main.ingest_data_to_gcs') as mock_ingest_data_to_gcs:
        mock_ingest_data_to_gcs.side_effect = Exception('Something went wrong')
        response = client.post('/', json={'message': {}})
        assert response.status_code == HTTPStatus.BAD_REQUEST
