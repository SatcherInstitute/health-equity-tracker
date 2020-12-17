'''Collection of shared Airflow functionality.'''
import os
import requests
# Ignore the Airflow module, it is installed in both our dev and prod environments
from airflow import DAG  # type: ignore
from airflow.models import Variable  # type: ignore
from airflow.operators.python_operator import PythonOperator  # type: ignore


def generate_gcs_payload(filename: str, workflow_id: str, url: str,
                         gcs_bucket: str = None) -> dict:
    """Creates the payload object required for the GCS ingestion operator.

    filename: Name of gcs file to store the data in.
    workflow_id: ID of the datasource workflow. Should match ID defined in
                 DATA_SOURCES_DICT.
    url: URL where the data lives.
    gcs_bucket: GCS bucket to write to. Defaults to the GCS_LANDING_BUCKET env
                var."""
    if gcs_bucket is None:
        gcs_bucket = Variable.get('GCS_LANDING_BUCKET')
    return {'message': {'is_airflow_run': True,
                        'filename': filename,
                        'gcs_bucket': gcs_bucket,
                        'id': workflow_id,
                        'url': url}}


def generate_bq_payload(filename: str, workflow_id: str, dataset: str,
                        gcs_bucket: str = None) -> dict:
    """Creates the payload object required for the BQ ingestion operator.

    filename: Name of gcs file to get the data from.
    workflow_id: ID of the datasource workflow. Should match ID defined in
                 DATA_SOURCES_DICT.
    dataset: Name of the BQ dataset to write the data to.
    gcs_bucket: GCS bucket to write to. Defaults to the GCS_LANDING_BUCKET env
                var."""
    if gcs_bucket is None:
        gcs_bucket = Variable.get('GCS_LANDING_BUCKET')
    return {'message': {'is_airflow_run': True,
                        'filename': filename,
                        'gcs_bucket': gcs_bucket,
                        'id': workflow_id,
                        'dataset': dataset}}


def create_gcs_ingest_operator(task_id: str, payload: dict, dag: DAG) -> PythonOperator:
    return create_request_operator(task_id, Variable.get('INGEST_TO_GCS_SERVICE_ENDPOINT'), payload, dag)


def create_bq_ingest_operator(task_id: str, payload: dict, dag: DAG) -> PythonOperator:
    return create_request_operator(task_id, Variable.get('GCS_TO_BQ_SERVICE_ENDPOINT'), payload, dag)


def create_exporter_operator(task_id: str, payload: dict, dag: DAG) -> PythonOperator:
    return create_request_operator(task_id, Variable.get('EXPORTER_SERVICE_ENDPOINT'), payload, dag)


def service_request(url: str, data: dict):
    receiving_service_headers = {}
    if (os.getenv('ENV') != 'dev'):
        # Set up metadata server request
        # See https://cloud.google.com/compute/docs/instances/verifying-instance-identity#request_signature
        token_url = 'http://metadata/computeMetadata/v1/instance/service-accounts/default/identity?audience='

        token_request_url = token_url + url
        token_request_headers = {'Metadata-Flavor': 'Google'}

        # Fetch the token for the default compute service account
        token_response = requests.get(
            token_request_url, headers=token_request_headers)
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
