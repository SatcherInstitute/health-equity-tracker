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
    try:
        resp = requests.post(url, json=data)
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
