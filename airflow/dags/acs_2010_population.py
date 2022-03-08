from airflow import DAG
from airflow.models import Variable
from airflow.utils.dates import days_ago

import util

_ACS_2010_POPULATION_GCS_FILENAMES = (
    'acs_2010_population-by_race_and_ethnicity_territory.json,'
    'acs_2010_population-by_sex_territory.json,'
    'acs_2010_population-by_age_territory.json'
)
_ACS_2010_POPULATION_WORKFLOW_ID = 'ACS_2010_POPULATION'
_ACS_2010_POPULATION_DATASET = 'acs_2010_population'

default_args = {'start_date': days_ago(0)}

data_ingestion_dag = DAG(
    'acs_2010_population_dag',
    default_args=default_args,
    schedule_interval=None,
    description='Ingestion configuration for ACS 2010 Population Data')

acs_2010_bq_payload = util.generate_bq_payload(
    _ACS_2010_POPULATION_WORKFLOW_ID,
    _ACS_2010_POPULATION_DATASET,
    gcs_bucket=Variable.get('GCS_MANUAL_UPLOADS_BUCKET'),
    filename=_ACS_2010_POPULATION_GCS_FILENAMES)
acs_2010_bq_op = util.create_bq_ingest_operator(
    'acs_2010_gcs_to_bq', acs_2010_bq_payload, data_ingestion_dag)

acs_2010_aggregator_payload = {'dataset_name': _ACS_2010_POPULATION_DATASET}
acs_2010_aggregator_operator = util.create_aggregator_operator(
    'acs_2010_aggregator', acs_2010_aggregator_payload,
    data_ingestion_dag)

acs_2010_exporter_payload = {'dataset_name': _ACS_2010_POPULATION_DATASET}
acs_2010_exporter_operator = util.create_exporter_operator(
    'acs_2010_exporter', acs_2010_exporter_payload,
    data_ingestion_dag)

# CDC Restricted Data Ingestion DAG
acs_2010_bq_op >> acs_2010_aggregator_operator >> acs_2010_exporter_operator
