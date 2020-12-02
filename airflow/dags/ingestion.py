'''Data ingestion DAG'''
import requests
import copy
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
    # TODO(https://github.com/SatcherInstitute/health-equity-tracker/issues/30)
    # schedule_interval='@daily',  # Run once a day at midnight
    description='The data ingestion pipeline.')


def create_gcs_ingest_operator(task_id: str, payload: dict) -> PythonOperator:
    return create_request_operator(task_id, Variable.get('INGEST_TO_GCS_SERVICE_ENDPOINT'), payload)


def create_bq_ingest_operator(task_id: str, payload: dict) -> PythonOperator:
    return create_request_operator(task_id, Variable.get('GCS_TO_BQ_SERVICE_ENDPOINT'), payload)


def create_exporter_operator(task_id: str, payload: dict) -> PythonOperator:
    return create_request_operator(task_id, Variable.get('EXPORTER_SERVICE_ENDPOINT'), payload)


def create_request_operator(task_id: str, url: str, payload: dict) -> PythonOperator:
    return PythonOperator(
        task_id=task_id,
        python_callable=service_request,
        op_kwargs={'url': url, 'data': payload},
        dag=data_ingestion_dag,
    )


def service_request(url: str, data: dict):
    try:
        resp = requests.post(url, json=data)
        resp.raise_for_status()
    except requests.exceptions.HTTPError as err:
        raise Exception('Failed response code: {}'.format(err))


# CDC Covid Deaths
cdc_dataset_name = 'cdc_covid_deaths'
cdc_covid_deaths_bq_payload = {'message': {'is_airflow_run': True,
                                           'filename': 'cdc_deaths',
                                           'gcs_bucket': Variable.get('GCS_LANDING_BUCKET'),
                                           'id': 'CDC_COVID_DEATHS'}}
cdc_covid_deaths_gcs_payload = copy.deepcopy(cdc_covid_deaths_bq_payload)
cdc_covid_deaths_gcs_payload['message']['url'] = 'https://data.cdc.gov/api/views/k8wy-p9cg/rows.csv?accessType=DOWNLOAD'
cdc_covid_deaths_gcs_operator = create_gcs_ingest_operator(
    'cdc_covid_deaths_to_gcs', cdc_covid_deaths_gcs_payload)
cdc_covid_deaths_bq_payload['message']['dataset'] = cdc_dataset_name
cdc_covid_deaths_bq_operator = create_bq_ingest_operator(
    'cdc_covid_deaths_to_bq', cdc_covid_deaths_bq_payload)
cdc_covid_deaths_exporter_payload = {'dataset_name': cdc_dataset_name}
cdc_covid_deaths_exporter_operator = create_exporter_operator(
    'cdc_covid_deaths_exporter', cdc_covid_deaths_exporter_payload)

# Ingestion DAG
cdc_covid_deaths_gcs_operator >> cdc_covid_deaths_bq_operator >> cdc_covid_deaths_exporter_operator
