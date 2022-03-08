# Ignore the Airflow module, it is installed in both dev and prod
from airflow import DAG  # type: ignore
from airflow.utils.dates import days_ago  # type: ignore

import util

_CDC_VACCINATION_NATIONAL_WORKFLOW_ID = 'CDC_VACCINATION_NATIONAL'
_CDC_VACCINATION_NATIONAL_DATASET_NAME = 'cdc_vaccination_national'

default_args = {
    'start_date': days_ago(0),
}

data_ingestion_dag = DAG(
    'cdc_vaccination_national_ingestion_dag',
    default_args=default_args,
    schedule_interval=None,
    description='Ingestion configuration for CDC Vaccination National')

cdc_vaccination_national_bq_payload = util.generate_bq_payload(
    _CDC_VACCINATION_NATIONAL_WORKFLOW_ID, _CDC_VACCINATION_NATIONAL_DATASET_NAME)
cdc_vaccination_national_bq_operator = util.create_bq_ingest_operator(
    'cdc_vaccination_national_to_bq', cdc_vaccination_national_bq_payload, data_ingestion_dag)

cdc_vaccination_national_aggregator_payload = {'dataset_name': _CDC_VACCINATION_NATIONAL_DATASET_NAME}
cdc_vaccination_national_aggregator_operator = util.create_aggregator_operator(
    'cdc_vaccination_national_aggregator', cdc_vaccination_national_aggregator_payload, data_ingestion_dag)

cdc_vaccination_national_exporter_payload = {'dataset_name': _CDC_VACCINATION_NATIONAL_DATASET_NAME}
cdc_vaccination_national_exporter_operator = util.create_exporter_operator(
    'cdc_vaccination_national_exporter', cdc_vaccination_national_exporter_payload, data_ingestion_dag)

# Ingestion DAG
(cdc_vaccination_national_bq_operator >> cdc_vaccination_national_aggregator_operator >>
    cdc_vaccination_national_exporter_operator)
