'''Data ingestion DAG.'''
# Ignore the Airflow module, it is installed in both our dev and prod environments
from airflow import DAG  # type: ignore
from airflow.utils.dates import days_ago  # type: ignore

import util

_CDC_COVID_DEATHS_DOWNLOAD_URL = 'https://data.cdc.gov/api/views/k8wy-p9cg/rows.csv?accessType=DOWNLOAD'
_CDC_DATASET_NAME = 'cdc_covid_deaths'
_CDC_GCS_FILENAME = 'cdc_deaths'
_CDC_WORKFLOW_ID = 'CDC_COVID_DEATHS'

default_args = {
    'start_date': days_ago(0),
}

data_ingestion_dag = DAG(
    'data_ingestion_dag',
    default_args=default_args,
    # TODO(https://github.com/SatcherInstitute/health-equity-tracker/issues/30)
    # schedule_interval='@daily',  # Run once a day at midnight
    description='The data ingestion pipeline.')


# CDC Covid Deaths
cdc_covid_deaths_gcs_payload = util.generate_gcs_payload(
    _CDC_WORKFLOW_ID, filename=_CDC_GCS_FILENAME, url=_CDC_COVID_DEATHS_DOWNLOAD_URL)
cdc_covid_deaths_gcs_operator = util.create_gcs_ingest_operator(
    'cdc_covid_deaths_to_gcs', cdc_covid_deaths_gcs_payload, data_ingestion_dag)
cdc_covid_deaths_bq_payload = util.generate_bq_payload(
    _CDC_WORKFLOW_ID, _CDC_DATASET_NAME, filename=_CDC_GCS_FILENAME)
cdc_covid_deaths_bq_operator = util.create_bq_ingest_operator(
    'cdc_covid_deaths_to_bq', cdc_covid_deaths_bq_payload, data_ingestion_dag)
cdc_covid_deaths_exporter_payload = {'dataset_name': _CDC_DATASET_NAME}
cdc_covid_deaths_exporter_operator = util.create_exporter_operator(
    'cdc_covid_deaths_exporter', cdc_covid_deaths_exporter_payload,
    data_ingestion_dag)

# Ingestion DAG
(cdc_covid_deaths_gcs_operator >> cdc_covid_deaths_bq_operator >>
 cdc_covid_deaths_exporter_operator)
