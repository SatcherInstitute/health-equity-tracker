'''Data ingestion DAG.'''
import copy
from util import create_gcs_ingest_operator, create_bq_ingest_operator, create_exporter_operator
# Ingore the Airflow module, it is installed in both our dev and prod environments
from airflow.models import Variable  # type: ignore
from airflow import DAG  # type: ignore
from airflow.utils.dates import days_ago  # type: ignore

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
cdc_dataset_name = 'cdc_covid_deaths'
cdc_covid_deaths_bq_payload = {'message': {'is_airflow_run': True,
                                           'filename': 'cdc_deaths',
                                           'gcs_bucket': Variable.get('GCS_LANDING_BUCKET'),
                                           'id': 'CDC_COVID_DEATHS'}}
cdc_covid_deaths_gcs_payload = copy.deepcopy(cdc_covid_deaths_bq_payload)
cdc_covid_deaths_gcs_payload['message']['url'] = 'https://data.cdc.gov/api/views/k8wy-p9cg/rows.csv?accessType=DOWNLOAD'
cdc_covid_deaths_gcs_operator = create_gcs_ingest_operator(
    'cdc_covid_deaths_to_gcs', cdc_covid_deaths_gcs_payload, data_ingestion_dag)
cdc_covid_deaths_bq_payload['message']['dataset'] = cdc_dataset_name
cdc_covid_deaths_bq_operator = create_bq_ingest_operator(
    'cdc_covid_deaths_to_bq', cdc_covid_deaths_bq_payload, data_ingestion_dag)
cdc_covid_deaths_exporter_payload = {'dataset_name': cdc_dataset_name}
cdc_covid_deaths_exporter_operator = create_exporter_operator(
    'cdc_covid_deaths_exporter', cdc_covid_deaths_exporter_payload, data_ingestion_dag)

# Ingestion DAG
cdc_covid_deaths_gcs_operator >> cdc_covid_deaths_bq_operator >> cdc_covid_deaths_exporter_operator
