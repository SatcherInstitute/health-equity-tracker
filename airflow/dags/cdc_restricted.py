from airflow import DAG
from airflow.models import Variable
from airflow.utils.dates import days_ago

import util

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
cdc_bq_payload_cumulative = util.generate_bq_payload(
    _CDC_RESTRICTED_WORKFLOW_ID,
    _CDC_RESTRICTED_DATASET,
    gcs_bucket=Variable.get('GCS_MANUAL_UPLOADS_BUCKET'),
    cumulative=True)

cdc_restricted_bq_op_cumulative = util.create_bq_ingest_operator(
    'cdc_restricted_cumulative_gcs_to_bq', cdc_bq_payload_cumulative, data_ingestion_dag)

cdc_bq_payload_non_cumulative = util.generate_bq_payload(
    _CDC_RESTRICTED_WORKFLOW_ID,
    _CDC_RESTRICTED_DATASET,
    gcs_bucket=Variable.get('GCS_MANUAL_UPLOADS_BUCKET'),
    cumulative=False)

cdc_restricted_bq_op_non_cumulative = util.create_bq_ingest_operator(
    'cdc_restricted_non_cumulative_gcs_to_bq', cdc_bq_payload_non_cumulative, data_ingestion_dag)

cdc_age_adjust_payload = util.generate_bq_payload(
    _AGE_ADJUST_WORKFLOW_ID,
    _CDC_RESTRICTED_DATASET,
)
cdc_restricted_age_adjust_op = util.create_bq_ingest_operator(
    'cdc_restricted_age_adjust', cdc_age_adjust_payload, data_ingestion_dag)

cdc_restricted_exporter_payload_race = {
    'dataset_name': _CDC_RESTRICTED_DATASET,
    'demo_breakdown': "by_race"
}
cdc_restricted_exporter_operator_race = util.create_exporter_operator(
    'cdc_restricted_exporter_race', cdc_restricted_exporter_payload_race,
    data_ingestion_dag)


cdc_restricted_exporter_payload_age = {
    'dataset_name': _CDC_RESTRICTED_DATASET,
    'demo_breakdown': "by_age"
}
cdc_restricted_exporter_operator_age = util.create_exporter_operator(
    'cdc_restricted_exporter_age', cdc_restricted_exporter_payload_age,
    data_ingestion_dag)


cdc_restricted_exporter_payload_sex = {
    'dataset_name': _CDC_RESTRICTED_DATASET,
    'demo_breakdown': "by_sex"
}
cdc_restricted_exporter_operator_sex = util.create_exporter_operator(
    'cdc_restricted_exporter_sex', cdc_restricted_exporter_payload_sex,
    data_ingestion_dag)

# CDC Restricted Data Ingestion DAG
(
    cdc_restricted_bq_op_cumulative >>
    cdc_restricted_bq_op_non_cumulative >>
    cdc_restricted_age_adjust_op >>
    cdc_restricted_exporter_operator_race >>
    cdc_restricted_exporter_operator_age >>
    cdc_restricted_exporter_operator_sex
)
