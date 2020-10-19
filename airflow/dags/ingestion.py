"""Data ingestion DAG"""
import requests
# Ingore the Airflow module, it is installed in both our dev and prod environments
from airflow.models import Variable  # type: ignore
from airflow import DAG  # type: ignore
from airflow.utils.dates import days_ago  # type: ignore
from airflow.operators.python_operator import PythonOperator  # type: ignore

default_args = {
    'start_date': days_ago(0),
}

data_ingestion_dag = DAG(
    'data_ingestion_dag',
    default_args=default_args,
    description='The data ingestion pipeline.')


def ingest_data_to_gcs(url: str, data: dict):
    resp = requests.post(url, data)
    if resp.status_code != 200:
        raise Exception('Failed response code: {}'.format(resp.status_code))


ingest_to_gcs_data_task = PythonOperator(
    task_id='ingest_to_gcs',
    python_callable=ingest_data_to_gcs,
    op_kwargs={'url': Variable.get("INGEST_TO_GCS_SERVICE_ENDPOINT"), 'data': {
        'hello': 'world'}},
    dag=data_ingestion_dag,
)
