from airflow import DAG
from airflow.models import Variable
from airflow.utils.dates import days_ago

import util

_CTP_METADATA_GCS_FILENAME = 'covid_tracking_project_metadata.csv'
_CTP_METADATA_WORKFLOW_ID = 'COVID_TRACKING_PROJECT_METADATA'
_CTP_METADATA_DATASET = 'covid_tracking_project'

default_args = {
    'start_date': days_ago(0),
}

data_ingestion_dag = DAG(
    'covid_tracking_project_metadata_dag',
    default_args=default_args,
    schedule_interval=None,
    description='Ingestion configuration for Covid Tracking Project Metadata')

# Standardize CTP Metadata
ctp_bq_payload = util.generate_bq_payload(
    _CTP_METADATA_WORKFLOW_ID, _CTP_METADATA_DATASET,
    gcs_bucket=Variable.get('GCS_MANUAL_UPLOADS_BUCKET'),
    filename=_CTP_METADATA_GCS_FILENAME
)
ctp_metadata_bq_op = util.create_bq_ingest_operator(
    'ctp_metadata_standardize', ctp_bq_payload, data_ingestion_dag
)

# Covid Tracking Project Metadata Ingestion DAG
ctp_metadata_bq_op
