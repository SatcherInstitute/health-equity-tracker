from airflow import DAG
from airflow.utils.dates import days_ago

import util

_CTP_DOWNLOAD_URL = ('https://docs.google.com/spreadsheets/d/e/'
                     '2PACX-1vS8SzaERcKJOD_EzrtCDK1dX1zkoMochlA9iHoHg_RSw3V8bkpfk1mpw4pfL5RdtSOyx_oScsUtyXyk/'
                     'pub?gid=43720681&single=true&output=csv')
_CTP_GCS_FILENAME = 'covid_tracking_project'
_CTP_WORKFLOW_ID = 'COVID_TRACKING_PROJECT'
_CTP_DATASET = 'covid_tracking_project'

default_args = {
    'start_date': days_ago(0),
}

data_ingestion_dag = DAG(
    'covid_tracking_project_ingestion_dag',
    default_args=default_args,
    description='Ingestion configuration for Covid Tracking Project')

# Ingest to GCS
ctp_gcs_task_id = 'covid_tracking_project_to_gcs'
ctp_gcs_payload = util.generate_gcs_payload(
    _CTP_WORKFLOW_ID, filename=_CTP_GCS_FILENAME, url=_CTP_DOWNLOAD_URL)
ctp_gcs_operator = util.create_gcs_ingest_operator(
    ctp_gcs_task_id, ctp_gcs_payload, data_ingestion_dag)
ctp_gcs_short_op = util.create_gcs_short_circuit_operator(
    'did_ctp_files_download', ctp_gcs_task_id, data_ingestion_dag)

# Standardize and write to BQ
ctp_bq_payload = util.generate_bq_payload(
    _CTP_WORKFLOW_ID, _CTP_DATASET, filename=_CTP_GCS_FILENAME)
ctp_bq_op = util.create_bq_ingest_operator(
    'ctp_standardize', ctp_bq_payload, data_ingestion_dag)

# Covid Tracking Project Ingestion DAG
# TODO(jenniebrown): Add the rest of the steps
(ctp_gcs_operator >> ctp_gcs_short_op >> ctp_bq_op)
