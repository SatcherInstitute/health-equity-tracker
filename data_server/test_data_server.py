import json
import os
from unittest import mock

import google.cloud.exceptions
import pytest
from flask.testing import FlaskClient

from data_server.dataset_cache import DatasetCache
from main import cache, create_app

os.environ['GCS_BUCKET'] = 'test'
os.environ['METADATA_FILENAME'] = 'test_data.ndjson'

test_data = (
    b'{"label1":"value1","label2":["value2a","value2b"],"label3":"value3"}\n'
    b'{"label1":"value2","label2":["value3a","value2b"],"label3":"value6"}\n'
    b'{"label1":"value3","label2":["value4a","value2b"],"label3":"value9"}\n'
    b'{"label1":"value4","label2":["value5a","value2b"],"label3":"value12"}\n'
    b'{"label1":"value5","label2":["value6a","value2b"],"label3":"value15"}\n'
    b'{"label1":"value6","label2":["value7a","value2b"],"label3":"value18"}\n'
)

test_data_json = (
    b'[{"label1":"value1","label2":["value2a","value2b"],"label3":"value3"},'
    b'{"label1":"value2","label2":["value3a","value2b"],"label3":"value6"},'
    b'{"label1":"value3","label2":["value4a","value2b"],"label3":"value9"},'
    b'{"label1":"value4","label2":["value5a","value2b"],"label3":"value12"},'
    b'{"label1":"value5","label2":["value6a","value2b"],"label3":"value15"},'
    b'{"label1":"value6","label2":["value7a","value2b"],"label3":"value18"}]'
)

test_data_csv = b'label1,label2,label3\nvalueA,valueB,valueC\nvalueD,valueE,valueF\n'


def get_test_data(_gcs_bucket: str, _filename: str):
    """Returns the contents of filename as a bytes object. Meant to be used to
    patch gcs_utils.download_blob_as_bytes."""
    return test_data


def get_test_data_csv(_gcs_bucket: str, _filename: str):
    """Returns the contents of filename.csv as a bytes object. Meant to be used to
    patch gcs_utils.download_blob_as_bytes."""
    return test_data_csv


@pytest.fixture
def app():
    """Creates a Flask app for testing"""
    app = create_app(testing=True)
    return app


@pytest.fixture
def client(app):
    """Creates a Flask test client for each test"""
    return app.test_client()


@pytest.fixture(autouse=True)
def reset_cache():
    """Clears the global cache before every test is run"""
    cache.clear()


def testGetProgramName(client: FlaskClient):
    response = client.get('/')
    assert b'Running data server.' in response.data


@mock.patch('data_server.gcs_utils.download_blob_as_bytes', side_effect=get_test_data)
def testGetMetadata(mock_func: mock.MagicMock, client: FlaskClient):
    response = client.get('/metadata')
    mock_func.assert_called_once_with('test', 'test_data.ndjson')
    assert response.status_code == 200
    assert response.headers.get('Content-Disposition') == 'attachment; filename=test_data.ndjson'
    assert response.headers.get('Access-Control-Allow-Origin') == '*'
    assert response.headers.get('Vary') == 'Accept-Encoding'
    assert response.data == test_data_json
    # Make sure that the response is valid json
    try:
        json.loads(response.data)
    except json.decoder.JSONDecodeError as err:
        pytest.fail(err.msg)


@mock.patch('data_server.gcs_utils.download_blob_as_bytes', side_effect=get_test_data)
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
def testGetMetadata_InternalError(mock_func: mock.MagicMock, client: FlaskClient):
    mock_func.side_effect = google.cloud.exceptions.NotFound('File not found')

    response = client.get('/metadata')
    assert response.status_code == 500
    assert b'Internal server error: 404 File not found' in response.data


@mock.patch('data_server.gcs_utils.download_blob_as_bytes', side_effect=get_test_data)
def testGetDataset_DataExists(mock_func: mock.MagicMock, client: FlaskClient):
    response = client.get('/dataset?name=test_dataset')
    mock_func.assert_called_once_with('test', 'test_dataset')
    assert response.status_code == 200
    assert response.headers.get('Content-Disposition') == 'attachment; filename=test_dataset'
    assert response.headers.get('Access-Control-Allow-Origin') == '*'
    assert response.headers.get('Vary') == 'Accept-Encoding'
    assert response.data == test_data_json
    # Make sure that the response is valid json
    try:
        json.loads(response.data)
    except json.decoder.JSONDecodeError as err:
        pytest.fail(err.msg)


@mock.patch(
    'data_server.gcs_utils.download_blob_as_bytes', side_effect=google.cloud.exceptions.NotFound('File not found')
)
def testGetDataset_DatasetNotFound(mock_func: mock.MagicMock, client: FlaskClient):
    response = client.get('/dataset?name=not_found')
    mock_func.assert_called_once_with('test', 'not_found')
    assert response.headers.get('Access-Control-Allow-Origin') == '*'
    assert response.status_code == 500
    assert b'Internal server error: 404 File not found' in response.data


def testGetDataset_UrlParamMissing(client: FlaskClient):
    response = client.get('/dataset')
    assert response.status_code == 400
    assert b'Request missing required url param \'name\'' in response.data

    response = client.get('/dataset?random_param=stuff')
    assert response.status_code == 400
    assert b'Request missing required url param \'name\'' in response.data


@mock.patch('data_server.gcs_utils.download_blob_as_bytes', side_effect=get_test_data_csv)
def testGetDataset_csvType(mock_func: mock.MagicMock, client: FlaskClient):
    response = client.get('/dataset?name=test_dataset.csv')
    mock_func.assert_called_once_with('test', 'test_dataset.csv')
    assert response.status_code == 200
    assert response.mimetype == 'text/csv'
    assert response.headers.get('Content-Disposition') == 'attachment; filename=test_dataset.csv'
    # Make sure that the response hasn't changed
    assert response.data == test_data_csv
