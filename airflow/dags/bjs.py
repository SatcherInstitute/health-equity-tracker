# Ignore the Airflow module, it is installed in both dev and prod
from airflow import DAG  # type: ignore
from airflow.utils.dates import days_ago  # type: ignore

import util

_BJS_WORKFLOW_ID = 'BJS_DATA'
_BJS_DATASET_NAME = 'bjs_data'

default_args = {
    'start_date': days_ago(0),
}

data_ingestion_dag = DAG(
    'bjs_ingestion_dag',
    default_args=default_args,
    schedule_interval=None,
    description='Ingestion configuration for BJS')

bjs_bq_payload = util.generate_bq_payload(
    _BJS_WORKFLOW_ID, _BJS_DATASET_NAME)
bjs_bq_operator = util.create_bq_ingest_operator(
    'bjs_to_bq', bjs_bq_payload, data_ingestion_dag)

bjs_aggregator_payload = {
    'dataset_name': _BJS_DATASET_NAME}
bjs_aggregator_operator = util.create_aggregator_operator(
    'bjs_aggregator', bjs_aggregator_payload, data_ingestion_dag)

bjs_exporter_payload = {
    'dataset_name': _BJS_DATASET_NAME}
bjs_exporter_operator = util.create_exporter_operator(
    'bjs_exporter', bjs_exporter_payload, data_ingestion_dag)

# Ingestion DAG
bjs_bq_operator >> bjs_aggregator_operator >> bjs_exporter_operator
