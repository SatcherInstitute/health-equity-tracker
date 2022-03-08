# Ignore the Airflow module, it is installed in both dev and prod
from airflow import DAG  # type: ignore
from airflow.utils.dates import days_ago  # type: ignore

import util

_UHC_WORKFLOW_ID = 'UHC_DATA'
_UHC_DATASET_NAME = 'uhc_data'

default_args = {
    'start_date': days_ago(0),
}

data_ingestion_dag = DAG(
    'uhc_ingestion_dag',
    default_args=default_args,
    schedule_interval=None,
    description='Ingestion configuration for UHC')

uhc_bq_payload = util.generate_bq_payload(
    _UHC_WORKFLOW_ID, _UHC_DATASET_NAME)
uhc_pop_bq_operator = util.create_bq_ingest_operator(
    'uhc_to_bq', uhc_bq_payload, data_ingestion_dag)

uhc_aggregator_payload = {'dataset_name': _UHC_DATASET_NAME}
uhc_aggregator_operator = util.create_aggregator_operator(
    'uhc_aggregator', uhc_aggregator_payload, data_ingestion_dag)

uhc_exporter_payload = {'dataset_name': _UHC_DATASET_NAME}
uhc_exporter_operator = util.create_exporter_operator(
    'uhc_exporter', uhc_exporter_payload, data_ingestion_dag)

# Ingestion DAG
uhc_pop_bq_operator >> uhc_aggregator_operator >> uhc_exporter_operator
