# Ignore the Airflow module, it is installed in both dev and prod
from airflow import DAG  # type: ignore
from airflow.utils.dates import days_ago  # type: ignore

import util

_GEO_CONTEXT_WORKFLOW_ID = 'GEO_CONTEXT'
_GEO_CONTEXT_DATASET_NAME = 'geo_context'

default_args = {
    'start_date': days_ago(0),
}

data_ingestion_dag = DAG(
    'geo_context_ingestion_dag',
    default_args=default_args,
    schedule_interval=None,
    description='Ingestion configuration for GEO CONTEXT')

geo_context_bq_payload = util.generate_bq_payload(
    _GEO_CONTEXT_WORKFLOW_ID, _GEO_CONTEXT_DATASET_NAME)
geo_context_pop_bq_operator = util.create_bq_ingest_operator(
    'geo_context_to_bq', geo_context_bq_payload, data_ingestion_dag)

geo_context_exporter_payload = {'dataset_name': _GEO_CONTEXT_DATASET_NAME}
geo_context_exporter_operator = util.create_exporter_operator(
    'geo_context_exporter', geo_context_exporter_payload, data_ingestion_dag)

# Ingestion DAG
(
    geo_context_pop_bq_operator >>
    geo_context_exporter_operator
)
