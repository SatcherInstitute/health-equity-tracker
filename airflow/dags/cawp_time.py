# Ignore the Airflow module, it is installed in both dev and prod
from airflow import DAG  # type: ignore
from airflow.utils.dates import days_ago  # type: ignore

import util

# NEW FLOW - TIME SERIES for US CONGRESS

_CAWP_TIME_WORKFLOW_ID = 'CAWP_TIME_DATA'
_CAWP_TIME_DATASET_NAME = 'cawp_time_data'

default_args = {
    'start_date': days_ago(0),
}

data_ingestion_dag = DAG(
    'cawp_time_ingestion_dag',
    default_args=default_args,
    schedule_interval=None,
    description='Ingestion configuration for CAWP_TIME')

cawp_time_bq_payload = util.generate_bq_payload(
    _CAWP_TIME_WORKFLOW_ID, _CAWP_TIME_DATASET_NAME)
cawp_time_pop_bq_operator = util.create_bq_ingest_operator(
    'cawp_time_to_bq', cawp_time_bq_payload, data_ingestion_dag)

cawp_time_exporter_payload_race = {
    'dataset_name': _CAWP_TIME_DATASET_NAME,
    'demographic': "race_and_ethnicity"
}
cawp_time_exporter_operator_race = util.create_exporter_operator(
    'cawp_time_exporter_race', cawp_time_exporter_payload_race, data_ingestion_dag)


# Ingestion DAG
(
    cawp_time_pop_bq_operator >>
    cawp_time_exporter_operator_race
)
