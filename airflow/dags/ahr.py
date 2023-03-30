# Ignore the Airflow module, it is installed in both dev and prod
from airflow import DAG  # type: ignore
from airflow.utils.dates import days_ago  # type: ignore

import util

_AHR_WORKFLOW_ID = 'AHR_DATA'
_AHR_DATASET_NAME = 'ahr_data'

default_args = {
    'start_date': days_ago(0),
}

data_ingestion_dag = DAG(
    'ahr_ingestion_dag',
    default_args=default_args,
    schedule_interval=None,
    description='Ingestion configuration for AHR')

ahr_bq_payload = util.generate_bq_payload(
    _AHR_WORKFLOW_ID, _AHR_DATASET_NAME)
ahr_pop_bq_operator = util.create_bq_ingest_operator(
    'ahr_to_bq', ahr_bq_payload, data_ingestion_dag)

ahr_exporter_payload_race = {
    'dataset_name': _AHR_DATASET_NAME,
    'demographic': "race_and_ethnicity"
}
ahr_exporter_operator_race = util.create_exporter_operator(
    'ahr_exporter_race', ahr_exporter_payload_race, data_ingestion_dag)

ahr_exporter_payload_age = {
    'dataset_name': _AHR_DATASET_NAME,
    'demographic': "age"
}
ahr_exporter_operator_age = util.create_exporter_operator(
    'ahr_exporter_age', ahr_exporter_payload_age, data_ingestion_dag)

ahr_exporter_payload_sex = {
    'dataset_name': _AHR_DATASET_NAME,
    'demographic': "sex"
}
ahr_exporter_operator_sex = util.create_exporter_operator(
    'ahr_exporter_sex', ahr_exporter_payload_sex, data_ingestion_dag)

# Ingestion DAG
(
    ahr_pop_bq_operator >> [
        ahr_exporter_operator_race,
        ahr_exporter_operator_age,
        ahr_exporter_operator_sex,
    ]
)
