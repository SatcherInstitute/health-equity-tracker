from airflow import DAG
from airflow.models import Variable  # type: ignore
from airflow.utils.dates import days_ago  # type: ignore

import util

_DECIA_2010_POPULATION_GCS_FILENAMES = (
    'decia_2010_territory_population-by_race_and_ethnicity_territory.json,'
    'decia_2010_territory_population-by_sex_territory.json,'
    'decia_2010_territory_population-by_age_territory.json'
)
_DECIA_2010_POPULATION_WORKFLOW_ID = 'DECIA_2010_POPULATION'
_DECIA_2010_POPULATION_DATASET = 'decia_2010_territory_population'

default_args = {'start_date': days_ago(0)}

data_ingestion_dag = DAG(
    'decia_2010_territory_population_dag',
    default_args=default_args,
    schedule_interval=None,
    description='Ingestion configuration for ACS 2010 Population Data')

decia_2010_bq_payload = util.generate_bq_payload(
    _DECIA_2010_POPULATION_WORKFLOW_ID,
    _DECIA_2010_POPULATION_DATASET,
    gcs_bucket=Variable.get('GCS_MANUAL_UPLOADS_BUCKET'),
    filename=_DECIA_2010_POPULATION_GCS_FILENAMES)
decia_2010_bq_op = util.create_bq_ingest_operator(
    'decia_2010_gcs_to_bq', decia_2010_bq_payload, data_ingestion_dag)

decia_2010_exporter_payload_race = {
    'dataset_name': _DECIA_2010_POPULATION_DATASET,
    'demographic': "race"
}
decia_2010_exporter_operator_race = util.create_exporter_operator(
    'decia_2010_exporter_race', decia_2010_exporter_payload_race,
    data_ingestion_dag)

decia_2010_exporter_payload_age = {
    'dataset_name': _DECIA_2010_POPULATION_DATASET,
    'demographic': "age"
}
decia_2010_exporter_operator_age = util.create_exporter_operator(
    'decia_2010_exporter_age', decia_2010_exporter_payload_age,
    data_ingestion_dag)


decia_2010_exporter_payload_sex = {
    'dataset_name': _DECIA_2010_POPULATION_DATASET,
    'demographic': "sex"
}
decia_2010_exporter_operator_sex = util.create_exporter_operator(
    'decia_2010_exporter_sex', decia_2010_exporter_payload_sex,
    data_ingestion_dag)

# Data Ingestion DAG
(
    decia_2010_bq_op >> [
        decia_2010_exporter_operator_race,
        decia_2010_exporter_operator_age,
        decia_2010_exporter_operator_sex,
    ]
)
