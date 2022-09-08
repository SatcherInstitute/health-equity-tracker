# Ignore the Airflow module, it is installed in both dev and prod
from airflow import DAG  # type: ignore
from airflow.utils.dates import days_ago  # type: ignore

import util

_SVI_WORKFLOW_ID = 'CDC_SVI_COUNTY'
_SVI_DATASET_NAME = 'cdc_svi_county'

default_args = {
    'start_date': days_ago(0),
}

data_ingestion_dag = DAG(
    'svi_ingestion_dag',
    default_args=default_args,
    schedule_interval=None,
    description='Ingestion configuration for SVI')

svi_bq_payload = util.generate_bq_payload(
    _SVI_WORKFLOW_ID, _SVI_DATASET_NAME)
svi_pop_bq_operator = util.create_bq_ingest_operator(
    'svi_to_bq', svi_bq_payload, data_ingestion_dag)

svi_exporter_payload = {'dataset_name': _SVI_DATASET_NAME}
svi_exporter_operator = util.create_exporter_operator(
    'svi_exporter', svi_exporter_payload, data_ingestion_dag)

# Ingestion DAG
svi_pop_bq_operator >> svi_exporter_operator
