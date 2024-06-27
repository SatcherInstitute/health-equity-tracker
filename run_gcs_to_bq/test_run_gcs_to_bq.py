import pytest
from unittest import mock
import main


@pytest.fixture
def client():
    main.app.config['TESTING'] = True
    with main.app.test_client() as client:
        yield client


def test_ingest_bucket_to_bq_no_json(client):
    response = client.post('/', content_type='application/json')
    assert response.status_code == 400


def test_ingest_bucket_to_bq_invalid_format(client):
    response = client.post('/', json={})
    assert response.status_code == 400


def test_ingest_bucket_to_bq_with_exception(client):
    with mock.patch('main.do_ingestion') as mock_do_ingestion:
        mock_do_ingestion.side_effect = Exception('Something went wrong')
        response = client.post('/', json={'message': {}})
        assert response.status_code == 400


def test_do_ingestion_missing_attributes():
    mock_event = {'is_airflow_run': False}
    with pytest.raises(RuntimeError):
        main.do_ingestion(mock_event)


def test_do_ingestion_missing_id_and_gcs_bucket():
    mock_event = {'is_airflow_run': False, 'attributes': {}}
    with pytest.raises(RuntimeError):
        main.do_ingestion(mock_event)


def test_do_ingestion_missing_dataset_env_variable(monkeypatch):
    mock_event = {'is_airflow_run': False, 'attributes': {'id': '123', 'gcs_bucket': 'bucket'}}
    monkeypatch.delenv('DATASET_NAME', raising=False)
    with pytest.raises(RuntimeError):
        main.do_ingestion(mock_event)


# Additional tests for missing 'id' and 'gcs_bucket'
def test_do_ingestion_missing_id():
    mock_event = {'is_airflow_run': False, 'attributes': {'gcs_bucket': 'bucket'}}
    with pytest.raises(RuntimeError):
        main.do_ingestion(mock_event)


def test_do_ingestion_missing_gcs_bucket():
    mock_event = {'is_airflow_run': False, 'attributes': {'id': '123'}}
    with pytest.raises(RuntimeError):
        main.do_ingestion(mock_event)
