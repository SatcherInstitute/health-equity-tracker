'''Collection of shared Airflow functionality.'''
import requests
# Ingore the Airflow module, it is installed in both our dev and prod environments
from airflow.models import Variable  # type: ignore
from airflow import DAG  # type: ignore
from airflow.operators.python_operator import PythonOperator  # type: ignore


def create_gcs_ingest_operator(task_id: str, payload: dict, dag: DAG) -> PythonOperator:
    return create_request_operator(task_id, Variable.get('INGEST_TO_GCS_SERVICE_ENDPOINT'), payload, dag)


def create_bq_ingest_operator(task_id: str, payload: dict, dag: DAG) -> PythonOperator:
    return create_request_operator(task_id, Variable.get('GCS_TO_BQ_SERVICE_ENDPOINT'), payload, dag)


def create_exporter_operator(task_id: str, payload: dict, dag: DAG) -> PythonOperator:
    return create_request_operator(task_id, Variable.get('EXPORTER_SERVICE_ENDPOINT'), payload, dag)


def service_request(url: str, data: dict):
    # Set up metadata server request
    # See https://cloud.google.com/compute/docs/instances/verifying-instance-identity#request_signature
    token_url = 'http://metadata/computeMetadata/v1/instance/service-accounts/default/identity?audience='

    token_request_url = token_url + url
    token_request_headers = {'Metadata-Flavor': 'Google'}

    # Fetch the token for the default compute service account
    token_response = requests.get(token_request_url, headers=token_request_headers)
    jwt = token_response.content.decode("utf-8")

    # Provide the token in the request to the receiving service
    receiving_service_headers = {'Authorization': f'bearer {jwt}'}

    try:
        resp = requests.post(url, json=data, headers=receiving_service_headers)
        resp.raise_for_status()
    except requests.exceptions.HTTPError as err:
        raise Exception('Failed response code: {}'.format(err))


def create_request_operator(task_id: str, url: str, payload: dict, dag: DAG) -> PythonOperator:
    return PythonOperator(
        task_id=task_id,
        python_callable=service_request,
        op_kwargs={'url': url, 'data': payload},
        dag=dag,
    )
