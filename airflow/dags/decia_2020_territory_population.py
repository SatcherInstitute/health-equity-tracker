# Ignore the Airflow module, it is installed in both dev and prod
from airflow import DAG  # type: ignore
from airflow.utils.dates import days_ago  # type: ignore
from airflow.operators.dummy_operator import DummyOperator  # type: ignore

import util

_DECIA_2020_TERRITORY_POPULATION_WORKFLOW_ID = 'DECIA_2020_TERRITORY_POPULATION_DATA'
_DECIA_2020_TERRITORY_POPULATION_DATASET_NAME = 'decia_2020_population_data'

default_args = {
    'start_date': days_ago(0),
}

data_ingestion_dag = DAG(
    'decia_2020_population_data_ingestion_dag',
    default_args=default_args,
    schedule_interval=None,
    description='Ingestion configuration for Island Areas 2020 population data')


# 6 ingest operators: 3 demographics X 2 geographics
bq_payload_race_state = util.generate_bq_payload(
    _DECIA_2020_TERRITORY_POPULATION_WORKFLOW_ID, _DECIA_2020_TERRITORY_POPULATION_DATASET_NAME,
    demographic="race_and_ethnicity",
    geographic="state")
decia_2020_bq_ingest_race_state = util.create_bq_ingest_operator(
    'decia_2020_pop_to_bq_race_state', bq_payload_race_state, data_ingestion_dag)

bq_payload_age_state = util.generate_bq_payload(
    _DECIA_2020_TERRITORY_POPULATION_WORKFLOW_ID, _DECIA_2020_TERRITORY_POPULATION_DATASET_NAME,
    demographic="age",
    geographic="state")
decia_2020_bq_ingest_age_state = util.create_bq_ingest_operator(
    'decia_2020_pop_to_bq_age_state', bq_payload_age_state, data_ingestion_dag)

bq_payload_sex_state = util.generate_bq_payload(
    _DECIA_2020_TERRITORY_POPULATION_WORKFLOW_ID, _DECIA_2020_TERRITORY_POPULATION_DATASET_NAME,
    demographic="sex",
    geographic="state")
decia_2020_bq_ingest_sex_state = util.create_bq_ingest_operator(
    'decia_2020_pop_to_bq_sex_state', bq_payload_sex_state, data_ingestion_dag)

bq_payload_race_county = util.generate_bq_payload(
    _DECIA_2020_TERRITORY_POPULATION_WORKFLOW_ID, _DECIA_2020_TERRITORY_POPULATION_DATASET_NAME,
    demographic="race_and_ethnicity",
    geographic="county"
)
decia_2020_bq_ingest_race_county = util.create_bq_ingest_operator(
    'decia_2020_pop_to_bq_race_county', bq_payload_race_county, data_ingestion_dag)

bq_payload_age_county = util.generate_bq_payload(
    _DECIA_2020_TERRITORY_POPULATION_WORKFLOW_ID, _DECIA_2020_TERRITORY_POPULATION_DATASET_NAME,
    demographic="age",
    geographic="county"
)
decia_2020_bq_ingest_age_county = util.create_bq_ingest_operator(
    'decia_2020_pop_to_bq_age_county', bq_payload_age_county, data_ingestion_dag)

bq_payload_sex_county = util.generate_bq_payload(
    _DECIA_2020_TERRITORY_POPULATION_WORKFLOW_ID, _DECIA_2020_TERRITORY_POPULATION_DATASET_NAME,
    demographic="sex",
    geographic="county"
)
decia_2020_bq_ingest_sex_county = util.create_bq_ingest_operator(
    'decia_2020_pop_to_bq_sex_county', bq_payload_sex_county, data_ingestion_dag)

exporter_payload_race = {
    'dataset_name': _DECIA_2020_TERRITORY_POPULATION_DATASET_NAME,
    'demographic': "race_and_ethnicity"
}
decia_2020_population_data_exporter_operator_race = util.create_exporter_operator(
    'decia_2020_population_data_exporter_race', exporter_payload_race, data_ingestion_dag)

exporter_payload_age = {
    'dataset_name': _DECIA_2020_TERRITORY_POPULATION_DATASET_NAME,
    'demographic': "age"
}
decia_2020_population_data_exporter_operator_age = util.create_exporter_operator(
    'decia_2020_population_data_exporter_age', exporter_payload_age, data_ingestion_dag)


exporter_payload_sex = {
    'dataset_name': _DECIA_2020_TERRITORY_POPULATION_DATASET_NAME,
    'demographic': "sex"
}
decia_2020_population_data_exporter_operator_sex = util.create_exporter_operator(
    'decia_2020_population_data_exporter_sex', exporter_payload_sex, data_ingestion_dag)

connector = DummyOperator(
    default_args=default_args,
    dag=data_ingestion_dag,
    task_id='connector'
)

# Ingestion DAG
(
    [
        decia_2020_bq_ingest_race_state,
        decia_2020_bq_ingest_age_state,
        decia_2020_bq_ingest_sex_state,
        decia_2020_bq_ingest_race_county,
        decia_2020_bq_ingest_age_county,
        decia_2020_bq_ingest_sex_county,
    ] >>
    connector >> [
        decia_2020_population_data_exporter_operator_race,
        decia_2020_population_data_exporter_operator_age,
        decia_2020_population_data_exporter_operator_sex,
    ]
)
