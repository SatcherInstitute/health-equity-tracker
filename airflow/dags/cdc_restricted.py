from airflow import DAG  # type: ignore
from airflow.models import Variable  # type: ignore
from airflow.utils.dates import days_ago  # type: ignore

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

# COUNTY
cdc_bq_payload_race_county = util.generate_bq_payload(
    _CDC_RESTRICTED_WORKFLOW_ID,
    _CDC_RESTRICTED_DATASET,
    gcs_bucket=Variable.get('GCS_MANUAL_UPLOADS_BUCKET'),
    geographic='county',
    demographic='race')
cdc_restricted_bq_op_race_county = util.create_bq_ingest_operator(
    'cdc_restricted_race_county_gcs_to_bq', cdc_bq_payload_race_county, data_ingestion_dag)

cdc_bq_payload_sex_county = util.generate_bq_payload(
    _CDC_RESTRICTED_WORKFLOW_ID,
    _CDC_RESTRICTED_DATASET,
    gcs_bucket=Variable.get('GCS_MANUAL_UPLOADS_BUCKET'),
    geographic='county',
    demographic='sex')
cdc_restricted_bq_op_sex_county = util.create_bq_ingest_operator(
    'cdc_restricted_sex_county_gcs_to_bq', cdc_bq_payload_sex_county, data_ingestion_dag)

cdc_bq_payload_age_county = util.generate_bq_payload(
    _CDC_RESTRICTED_WORKFLOW_ID,
    _CDC_RESTRICTED_DATASET,
    gcs_bucket=Variable.get('GCS_MANUAL_UPLOADS_BUCKET'),
    geographic='county',
    demographic='age')
cdc_restricted_bq_op_age_county = util.create_bq_ingest_operator(
    'cdc_restricted_age_county_gcs_to_bq', cdc_bq_payload_age_county, data_ingestion_dag)

# STATE
cdc_bq_payload_race_state = util.generate_bq_payload(
    _CDC_RESTRICTED_WORKFLOW_ID,
    _CDC_RESTRICTED_DATASET,
    gcs_bucket=Variable.get('GCS_MANUAL_UPLOADS_BUCKET'),
    geographic='state',
    demographic='race')
cdc_restricted_bq_op_race_state = util.create_bq_ingest_operator(
    'cdc_restricted_race_state_gcs_to_bq', cdc_bq_payload_race_state, data_ingestion_dag)

cdc_bq_payload_sex_state = util.generate_bq_payload(
    _CDC_RESTRICTED_WORKFLOW_ID,
    _CDC_RESTRICTED_DATASET,
    gcs_bucket=Variable.get('GCS_MANUAL_UPLOADS_BUCKET'),
    geographic='state',
    demographic='sex')
cdc_restricted_bq_op_sex_state = util.create_bq_ingest_operator(
    'cdc_restricted_sex_state_gcs_to_bq', cdc_bq_payload_sex_state, data_ingestion_dag)

cdc_bq_payload_age_state = util.generate_bq_payload(
    _CDC_RESTRICTED_WORKFLOW_ID,
    _CDC_RESTRICTED_DATASET,
    gcs_bucket=Variable.get('GCS_MANUAL_UPLOADS_BUCKET'),
    geographic='state',
    demographic='age')
cdc_restricted_bq_op_age_state = util.create_bq_ingest_operator(
    'cdc_restricted_age_state_gcs_to_bq', cdc_bq_payload_age_state, data_ingestion_dag)

# NATIONAL
cdc_bq_payload_race_national = util.generate_bq_payload(
    _CDC_RESTRICTED_WORKFLOW_ID,
    _CDC_RESTRICTED_DATASET,
    gcs_bucket=Variable.get('GCS_MANUAL_UPLOADS_BUCKET'),
    geographic='national',
    demographic='race')
cdc_restricted_bq_op_race_national = util.create_bq_ingest_operator(
    'cdc_restricted_race_national_gcs_to_bq', cdc_bq_payload_race_national, data_ingestion_dag)

cdc_bq_payload_sex_national = util.generate_bq_payload(
    _CDC_RESTRICTED_WORKFLOW_ID,
    _CDC_RESTRICTED_DATASET,
    gcs_bucket=Variable.get('GCS_MANUAL_UPLOADS_BUCKET'),
    geographic='national',
    demographic='sex')
cdc_restricted_bq_op_sex_national = util.create_bq_ingest_operator(
    'cdc_restricted_sex_national_gcs_to_bq', cdc_bq_payload_sex_national, data_ingestion_dag)

cdc_bq_payload_age_national = util.generate_bq_payload(
    _CDC_RESTRICTED_WORKFLOW_ID,
    _CDC_RESTRICTED_DATASET,
    gcs_bucket=Variable.get('GCS_MANUAL_UPLOADS_BUCKET'),
    geographic='national',
    demographic='age')
cdc_restricted_bq_op_age_national = util.create_bq_ingest_operator(
    'cdc_restricted_age_national_gcs_to_bq', cdc_bq_payload_age_national, data_ingestion_dag)


cdc_age_adjust_payload = util.generate_bq_payload(
    _AGE_ADJUST_WORKFLOW_ID,
    _CDC_RESTRICTED_DATASET,
)

cdc_restricted_age_adjust_op = util.create_bq_ingest_operator(
    'cdc_restricted_age_adjust', cdc_age_adjust_payload, data_ingestion_dag)

sanity_check = util.sanity_check_operator(
    'sanity_check', _CDC_RESTRICTED_DATASET, data_ingestion_dag)

cdc_restricted_exporter_payload_race = {
    'dataset_name': _CDC_RESTRICTED_DATASET,
    'demographic': "by_race"
}
cdc_restricted_exporter_operator_race = util.create_exporter_operator(
    'cdc_restricted_exporter_race', cdc_restricted_exporter_payload_race,
    data_ingestion_dag)


cdc_restricted_exporter_payload_age = {
    'dataset_name': _CDC_RESTRICTED_DATASET,
    'demographic': "by_age"
}
cdc_restricted_exporter_operator_age = util.create_exporter_operator(
    'cdc_restricted_exporter_age', cdc_restricted_exporter_payload_age,
    data_ingestion_dag)


cdc_restricted_exporter_payload_sex = {
    'dataset_name': _CDC_RESTRICTED_DATASET,
    'demographic': "by_sex"
}
cdc_restricted_exporter_operator_sex = util.create_exporter_operator(
    'cdc_restricted_exporter_sex', cdc_restricted_exporter_payload_sex,
    data_ingestion_dag)

# CDC Restricted Data Ingestion DAG
(
    cdc_restricted_bq_op_sex_county >>
    cdc_restricted_bq_op_age_county >> [
        cdc_restricted_bq_op_race_state,
        cdc_restricted_bq_op_sex_state,
        cdc_restricted_bq_op_age_state
    ] >> cdc_restricted_bq_op_race_county >> [
        cdc_restricted_bq_op_race_national,
        cdc_restricted_bq_op_sex_national,
        cdc_restricted_bq_op_age_national
    ] >> cdc_restricted_age_adjust_op >>
    sanity_check >> [
        cdc_restricted_exporter_operator_race,
        cdc_restricted_exporter_operator_age,
        cdc_restricted_exporter_operator_sex,
    ]
)
