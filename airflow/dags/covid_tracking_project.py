# Ignore the Airflow module, it is installed in both dev and prod
from airflow import DAG  # type: ignore
from airflow.utils.dates import days_ago  # type: ignore

import util

_CTP_DOWNLOAD_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vS8SzaERcKJOD_EzrtCDK1dX1zkoMochlA9iHoHg_RSw3V8bkpfk1mpw4pfL5RdtSOyx_oScsUtyXyk/pub?gid=43720681&single=true&output=csv'
_CTP_GCS_FILENAME = 'covid_tracking_project'
_CTP_WORKFLOW_ID = 'COVID_TRACKING_PROJECT'

default_args = {
    'start_date': days_ago(0),
}

data_ingestion_dag = DAG(
    'covid_tracking_project_ingestion_dag',
    default_args=default_args,
    schedule_interval='@daily',  # Run once a day at midnight
    description='Ingestion configuration for Covid Tracking Project')

# Covid Tracking Project
ctp_gcs_payload = util.generate_gcs_payload(
    _CTP_WORKFLOW_ID, filename=_CTP_GCS_FILENAME, url=_CTP_DOWNLOAD_URL)
ctp_gcs_operator = util.create_gcs_ingest_operator(
    'covid_tracking_project_to_gcs', ctp_gcs_payload, data_ingestion_dag)

# Covid Tracking Project Ingestion DAG
# TODO(jenniebrown): Add the rest of the steps
ctp_gcs_operator
