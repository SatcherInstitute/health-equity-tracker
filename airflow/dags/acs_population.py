# Ignore the Airflow module, it is installed in both dev and prod
from airflow import DAG  # type: ignore
from airflow.utils.dates import days_ago  # type: ignore

import util

_ACS_BASE_URL = 'https://api.census.gov/data/2019/acs/acs5'
_ACS_BASE_URL_2009 = 'https://api.census.gov/data/2019/acs/acs5'
_ACS_WORKFLOW_ID = 'ACS_POPULATION'
_ACS_DATASET_NAME = 'acs_population'

default_args = {
    'start_date': days_ago(0),
}

data_ingestion_dag = DAG(
    'acs_population_ingestion_dag',
    default_args=default_args,
    schedule_interval='@yearly',
    description='Ingestion configuration for ACS Population')

acs_pop_gcs_task_id = 'acs_population_to_gcs'
acs_pop_gcs_payload = util.generate_gcs_payload(
    _ACS_WORKFLOW_ID, url=_ACS_BASE_URL)
acs_pop_gcs_operator = util.create_gcs_ingest_operator(
    acs_pop_gcs_task_id, acs_pop_gcs_payload, data_ingestion_dag)

acs_pop_bq_payload = util.generate_bq_payload(
    _ACS_WORKFLOW_ID, _ACS_DATASET_NAME, url=_ACS_BASE_URL)
acs_pop_bq_operator = util.create_bq_ingest_operator(
    'acs_population_to_bq', acs_pop_bq_payload, data_ingestion_dag)

acs_pop_exporter_payload_race = {
    'dataset_name': _ACS_DATASET_NAME,
    'demographic': "by_race"
}
acs_pop_exporter_operator_race = util.create_exporter_operator(
    'acs_population_exporter_race', acs_pop_exporter_payload_race, data_ingestion_dag)

acs_pop_exporter_payload_age = {
    'dataset_name': _ACS_DATASET_NAME,
    'demographic': "by_age"
}
acs_pop_exporter_operator_age = util.create_exporter_operator(
    'acs_population_exporter_age', acs_pop_exporter_payload_age, data_ingestion_dag)

acs_pop_exporter_payload_sex = {
    'dataset_name': _ACS_DATASET_NAME,
    'demographic': "by_sex"
}
acs_pop_exporter_operator_sex = util.create_exporter_operator(
    'acs_population_exporter_sex', acs_pop_exporter_payload_sex, data_ingestion_dag)
# Ingestion DAG
(
    acs_pop_gcs_operator >>
    acs_pop_bq_operator >> [
        acs_pop_exporter_operator_race,
        acs_pop_exporter_operator_age,
        acs_pop_exporter_operator_sex,
    ]
)
