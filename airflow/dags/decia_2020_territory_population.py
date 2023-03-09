# Ignore the Airflow module, it is installed in both dev and prod
from airflow import DAG  # type: ignore
from airflow.utils.dates import days_ago  # type: ignore

import util

_DECIA_2020_TERRITORY_POPULATION_WORKFLOW_ID = 'DECIA_2020_TERRITORY_POPULATION_DATA'
_DECIA_2020_TERRITORY_POPULATION_DATASET_NAME = 'decia_2020_population_data_data'

default_args = {
    'start_date': days_ago(0),
}

data_ingestion_dag = DAG(
    'decia_2020_population_data_ingestion_dag',
    default_args=default_args,
    schedule_interval=None,
    description='Ingestion configuration for Island Areas population data')

decia_2020_population_data_bq_payload = util.generate_bq_payload(
    _DECIA_2020_TERRITORY_POPULATION_WORKFLOW_ID, _DECIA_2020_TERRITORY_POPULATION_DATASET_NAME)
decia_2020_population_data_bq_operator = util.create_bq_ingest_operator(
    'decia_2020_population_data_to_bq', decia_2020_population_data_bq_payload, data_ingestion_dag)

payload_race = {
    'dataset_name': _DECIA_2020_TERRITORY_POPULATION_DATASET_NAME,
    'demographic': "race_and_ethnicity"
}
decia_2020_population_data_exporter_operator_race = util.create_exporter_operator(
    'decia_2020_population_data_exporter_race', payload_race, data_ingestion_dag)

payload_age = {
    'dataset_name': _DECIA_2020_TERRITORY_POPULATION_DATASET_NAME,
    'demographic': "age"
}
decia_2020_population_data_exporter_operator_age = util.create_exporter_operator(
    'decia_2020_population_data_exporter_age', payload_age, data_ingestion_dag)


payload_sex = {
    'dataset_name': _DECIA_2020_TERRITORY_POPULATION_DATASET_NAME,
    'demographic': "sex"
}
decia_2020_population_data_exporter_operator_sex = util.create_exporter_operator(
    'decia_2020_population_data_exporter_sex', payload_sex, data_ingestion_dag)

# Ingestion DAG
(
    decia_2020_population_data_bq_operator >> [
        decia_2020_population_data_exporter_operator_race,
        decia_2020_population_data_exporter_operator_age,
        decia_2020_population_data_exporter_operator_sex,
    ]
)
