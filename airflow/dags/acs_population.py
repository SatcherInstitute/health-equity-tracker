# Ignore the Airflow module, it is installed in both dev and prod
from airflow import DAG  # type: ignore
from airflow.operators.dummy_operator import DummyOperator  # type: ignore
from airflow.utils.dates import days_ago  # type: ignore

import util

_ACS_WORKFLOW_ID = 'ACS_POPULATION'
_ACS_DATASET_NAME = 'acs_population'

default_args = {
    'start_date': days_ago(0),
}

data_ingestion_dag = DAG(
    'acs_population_ingestion_dag',
    default_args=default_args,
    schedule_interval='@yearly',
    description='Ingestion configuration for ACS Population')


acs_pop_gcs_payload = util.generate_gcs_payload(
    _ACS_WORKFLOW_ID)
acs_pop_gcs_operator = util.create_gcs_ingest_operator(
    'acs_population_to_gcs', acs_pop_gcs_payload, data_ingestion_dag)


acs_pop_bq_payload_2009 = util.generate_bq_payload(
    _ACS_WORKFLOW_ID, _ACS_DATASET_NAME, year='2009')
acs_pop_bq_operator_2009 = util.create_bq_ingest_operator(
    'acs_population_to_bq_2009', acs_pop_bq_payload_2009, data_ingestion_dag)

acs_pop_bq_payload_2010 = util.generate_bq_payload(
    _ACS_WORKFLOW_ID, _ACS_DATASET_NAME, year='2010')
acs_pop_bq_operator_2010 = util.create_bq_ingest_operator(
    'acs_population_to_bq_2010', acs_pop_bq_payload_2010, data_ingestion_dag)

acs_pop_bq_payload_2011 = util.generate_bq_payload(
    _ACS_WORKFLOW_ID, _ACS_DATASET_NAME, year='2011')
acs_pop_bq_operator_2011 = util.create_bq_ingest_operator(
    'acs_population_to_bq_2011', acs_pop_bq_payload_2011, data_ingestion_dag)

acs_pop_bq_payload_2012 = util.generate_bq_payload(
    _ACS_WORKFLOW_ID, _ACS_DATASET_NAME, year='2012')
acs_pop_bq_operator_2012 = util.create_bq_ingest_operator(
    'acs_population_to_bq_2012', acs_pop_bq_payload_2012, data_ingestion_dag)

acs_pop_bq_payload_2013 = util.generate_bq_payload(
    _ACS_WORKFLOW_ID, _ACS_DATASET_NAME, year='2013')
acs_pop_bq_operator_2013 = util.create_bq_ingest_operator(
    'acs_population_to_bq_2013', acs_pop_bq_payload_2013, data_ingestion_dag)

acs_pop_bq_payload_2014 = util.generate_bq_payload(
    _ACS_WORKFLOW_ID, _ACS_DATASET_NAME, year='2014')
acs_pop_bq_operator_2014 = util.create_bq_ingest_operator(
    'acs_population_to_bq_2014', acs_pop_bq_payload_2014, data_ingestion_dag)

acs_pop_bq_payload_2015 = util.generate_bq_payload(
    _ACS_WORKFLOW_ID, _ACS_DATASET_NAME, year='2015')
acs_pop_bq_operator_2015 = util.create_bq_ingest_operator(
    'acs_population_to_bq_2015', acs_pop_bq_payload_2015, data_ingestion_dag)

acs_pop_bq_payload_2016 = util.generate_bq_payload(
    _ACS_WORKFLOW_ID, _ACS_DATASET_NAME, year='2016')
acs_pop_bq_operator_2016 = util.create_bq_ingest_operator(
    'acs_population_to_bq_2016', acs_pop_bq_payload_2016, data_ingestion_dag)

acs_pop_bq_payload_2017 = util.generate_bq_payload(
    _ACS_WORKFLOW_ID, _ACS_DATASET_NAME, year='2017')
acs_pop_bq_operator_2017 = util.create_bq_ingest_operator(
    'acs_population_to_bq_2017', acs_pop_bq_payload_2017, data_ingestion_dag)

acs_pop_bq_payload_2018 = util.generate_bq_payload(
    _ACS_WORKFLOW_ID, _ACS_DATASET_NAME, year='2018')
acs_pop_bq_operator_2018 = util.create_bq_ingest_operator(
    'acs_population_to_bq_2018', acs_pop_bq_payload_2018, data_ingestion_dag)

acs_pop_bq_payload_2019 = util.generate_bq_payload(
    _ACS_WORKFLOW_ID, _ACS_DATASET_NAME, year='2019')
acs_pop_bq_operator_2019 = util.create_bq_ingest_operator(
    'acs_population_to_bq_2019', acs_pop_bq_payload_2019, data_ingestion_dag)

acs_pop_bq_payload_2020 = util.generate_bq_payload(
    _ACS_WORKFLOW_ID, _ACS_DATASET_NAME, year='2020')
acs_pop_bq_operator_2020 = util.create_bq_ingest_operator(
    'acs_population_to_bq_2020', acs_pop_bq_payload_2020, data_ingestion_dag)

acs_pop_bq_payload_2021 = util.generate_bq_payload(
    _ACS_WORKFLOW_ID, _ACS_DATASET_NAME, year='2021')
acs_pop_bq_operator_2021 = util.create_bq_ingest_operator(
    'acs_population_to_bq_2021', acs_pop_bq_payload_2021, data_ingestion_dag)


acs_pop_exporter_payload_race = {
    'dataset_name': _ACS_DATASET_NAME,
    'demographic': "by_race"
}
acs_pop_exporter_operator_race = util.create_exporter_operator(
    'acs_population_exporter_race', acs_pop_exporter_payload_race, data_ingestion_dag)

acs_pop_exporter_payload_age = {
    'dataset_name': _ACS_DATASET_NAME,
    'demographic': "by_age"
}
acs_pop_exporter_operator_age = util.create_exporter_operator(
    'acs_population_exporter_age', acs_pop_exporter_payload_age, data_ingestion_dag)

acs_pop_exporter_payload_sex = {
    'dataset_name': _ACS_DATASET_NAME,
    'demographic': "by_sex"
}
acs_pop_exporter_operator_sex = util.create_exporter_operator(
    'acs_population_exporter_sex',
    acs_pop_exporter_payload_sex,
    data_ingestion_dag
)

connector = DummyOperator(
    default_args=default_args,
    dag=data_ingestion_dag,
    task_id='connector'
)


# ensure CACHING step runs, then 2009 to make new BQ tables
# then run the rest of the years in parallel chunks
# need to restrict number of concurrent runs to get under mem limit
(
    acs_pop_gcs_operator >>
    acs_pop_bq_operator_2009 >> [
        acs_pop_bq_operator_2010,
        acs_pop_bq_operator_2011,
        acs_pop_bq_operator_2012,
        acs_pop_bq_operator_2013,
        acs_pop_bq_operator_2014,
        acs_pop_bq_operator_2015,
        acs_pop_bq_operator_2016,
        acs_pop_bq_operator_2017,
        acs_pop_bq_operator_2018,
        acs_pop_bq_operator_2019,
        acs_pop_bq_operator_2020,
        acs_pop_bq_operator_2021
    ] >>
    connector >> [
        acs_pop_exporter_operator_race,
        acs_pop_exporter_operator_age,
        acs_pop_exporter_operator_sex]
)
