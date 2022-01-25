from airflow import DAG
from airflow.models import Variable
from airflow.utils.dates import days_ago

import util

_CDC_RESTRICTED_GCS_FILENAMES = (
    'cdc_restricted_by_race_county.csv,'
    'cdc_restricted_by_race_state.csv,'
    'cdc_restricted_by_age_county.csv,'
    'cdc_restricted_by_age_state.csv,'
    'cdc_restricted_by_sex_county.csv,'
    'cdc_restricted_by_sex_state.csv,'
    'cdc_restricted_by_race_and_age_state.csv'
)
_CDC_RESTRICTED_WORKFLOW_ID = 'CDC_RESTRICTED_DATA'
_AGE_ADJUST_WORKFLOW_ID = 'AGE_ADJUST_CDC_RESTRICTED'
_CDC_RESTRICTED_DATASET = 'cdc_restricted_data'

default_args = {'start_date': days_ago(0)}

data_ingestion_dag = DAG(
    'cdc_restricted_data_dag',
    default_args=default_args,
    schedule_interval=None,
    description='Ingestion configuration for CDC Restricted Data')

# Standardize the CDC restricted data
cdc_bq_payload = util.generate_bq_payload(
    _CDC_RESTRICTED_WORKFLOW_ID,
    _CDC_RESTRICTED_DATASET,
    gcs_bucket=Variable.get('GCS_MANUAL_UPLOADS_BUCKET'),
    filename=_CDC_RESTRICTED_GCS_FILENAMES)
cdc_restricted_bq_op = util.create_bq_ingest_operator(
    'cdc_restricted_gcs_to_bq', cdc_bq_payload, data_ingestion_dag)

cdc_restricted_aggregator_payload = {'dataset_name': _CDC_RESTRICTED_DATASET}
cdc_restricted_aggregator_operator = util.create_aggregator_operator(
    'cdc_restricted_aggregator', cdc_restricted_aggregator_payload,
    data_ingestion_dag)

cdc_age_adjust_payload = util.generate_bq_payload(
    _AGE_ADJUST_WORKFLOW_ID,
    _CDC_RESTRICTED_DATASET,
)
cdc_restricted_age_adjust_op = util.create_bq_ingest_operator(
    'cdc_restricted_age_adjust', cdc_age_adjust_payload, data_ingestion_dag)

cdc_restricted_exporter_payload = {'dataset_name': _CDC_RESTRICTED_DATASET}
cdc_restricted_exporter_operator = util.create_exporter_operator(
    'cdc_restricted_exporter', cdc_restricted_exporter_payload,
    data_ingestion_dag)

# CDC Restricted Data Ingestion DAG
(cdc_restricted_bq_op >> cdc_restricted_aggregator_operator >>
    cdc_restricted_age_adjust_op >> cdc_restricted_exporter_operator)
