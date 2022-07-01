# Ignore the Airflow module, it is installed in both dev and prod
from airflow import DAG  # type: ignore
from airflow.utils.dates import days_ago  # type: ignore

import util

_VERA_WORKFLOW_ID = 'VERA_INCARCERATION_COUNTY'
_VERA_DATASET_NAME = 'vera_incarceration_county'

default_args = {
    'start_date': days_ago(0),
}

data_ingestion_dag = DAG(
    'vera_incarceration_county_ingestion_dag',
    default_args=default_args,
    schedule_interval=None,
    description='Ingestion configuration for VERA')

vera_bq_payload = util.generate_bq_payload(
    _VERA_WORKFLOW_ID, _VERA_DATASET_NAME)
vera_bq_operator = util.create_bq_ingest_operator(
    'vera_incarceration_county_to_bq', vera_bq_payload, data_ingestion_dag)

vera_aggregator_payload = {
    'dataset_name': _VERA_DATASET_NAME}
vera_aggregator_operator = util.create_aggregator_operator(
    'vera_incarceration_county_aggregator', vera_aggregator_payload, data_ingestion_dag)

vera_exporter_payload = {
    'dataset_name': _VERA_DATASET_NAME}
vera_exporter_operator = util.create_exporter_operator(
    'vera_incarceration_county_exporter', vera_exporter_payload, data_ingestion_dag)

# Ingestion DAG
vera_bq_operator >> vera_aggregator_operator >> vera_exporter_operator
