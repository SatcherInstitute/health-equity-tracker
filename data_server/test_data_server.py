import os
from unittest import mock

import google.cloud.exceptions
import pytest
from flask.testing import FlaskClient

from data_server.dataset_cache import DatasetCache
from main import app, cache

os.environ['GCS_BUCKET'] = 'test'
os.environ['METADATA_FILENAME'] = 'test_data.ndjson'

test_data = b"""
{"label1":"value1","label2":["value2a","value2b","value2c"],"label3":"value3"}
{"label1":"value2","label2":["value3a","value2b","value2c"],"label3":"value6"}
{"label1":"value3","label2":["value4a","value2b","value2c"],"label3":"value9"}
{"label1":"value4","label2":["value5a","value2b","value2c"],"label3":"value12"}
{"label1":"value5","label2":["value6a","value2b","value2c"],"label3":"value15"}
{"label1":"value6","label2":["value7a","value2b","value2c"],"label3":"value18"}
"""


def get_test_data(gcs_bucket: str, filename: str):
    """Returns the contents of filename as a bytes object. Meant to be used to
    patch gcs_utils.download_blob_as_bytes."""
    return test_data


@pytest.fixture(autouse=True)
def reset_cache():
    """Clears the global cache before every test is run."""
    cache.clear()


@pytest.fixture
def client():
    """Creates a Flask test client for each test."""
    app.config['TESTING'] = True
    with app.test_client() as app_client:
        yield app_client


def testGetProgramName(client: FlaskClient):
    response = client.get('/')
    assert b'Running data server.' in response.data


@mock.patch('data_server.gcs_utils.download_blob_as_bytes',
            side_effect=get_test_data)
def testGetMetadata(mock_func: mock.MagicMock, client: FlaskClient):
    response = client.get('/metadata')
    mock_func.assert_called_once_with('test', 'test_data.ndjson')
    assert response.status_code == 200
    assert (response.headers.get('Content-Disposition') ==
            'attachment; filename=test_data.ndjson')
    assert response.data == test_data


@mock.patch('data_server.gcs_utils.download_blob_as_bytes',
            side_effect=get_test_data)
def testGetMetadata_FromCache(mock_func: mock.MagicMock, client: FlaskClient):
    # Make the first request, which will incur an API call.
    response = client.get('/metadata')
    mock_func.assert_called_once_with('test', 'test_data.ndjson')
    assert response.status_code == 200

    # Make the second request, which should not incur an API call.
    response = client.get('/metadata')
    assert response.status_code == 200
    mock_func.assert_called_once()


@mock.patch.object(DatasetCache, 'getDataset')
def testGetMetadata_InternalError(mock_func: mock.MagicMock,
                                  client: FlaskClient):
    mock_func.side_effect = google.cloud.exceptions.NotFound('File not found')

    response = client.get('/metadata')
    assert response.status_code == 500
    assert b'Internal server error: 404 File not found' in response.data
