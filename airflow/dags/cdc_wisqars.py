# TODO: Rename our airflow/ as it tries to import from that and not the pip airflow
# pylint: disable=no-name-in-module
from airflow import DAG  # type: ignore
from airflow.utils.dates import days_ago  # type: ignore
import util

_CDC_WISQARS_WORKFLOW_ID = 'CDC_WISQARS_DATA'
_CDC_WISQARS_DATASET_NAME = 'cdc_wisqars_data'

default_args = {
    'start_date': days_ago(0),
}

data_ingestion_dag = DAG(
    'cdc_wisqars_ingestion_dag',
    default_args=default_args,
    schedule_interval=None,
    description='Ingestion configuration for CDC_WISQARS',
)

# AGE NATIONAL
cdc_wisqars_bq_payload_age_national = util.generate_bq_payload(
    _CDC_WISQARS_WORKFLOW_ID,
    _CDC_WISQARS_DATASET_NAME,
    demographic='age',
    geographic='national',
)
cdc_wisqars_bq_operator_age_national = util.create_bq_ingest_operator(
    'cdc_wisqars_to_bq_age_national',
    cdc_wisqars_bq_payload_age_national,
    data_ingestion_dag,
)

# AGE STATE
cdc_wisqars_bq_payload_age_state = util.generate_bq_payload(
    _CDC_WISQARS_WORKFLOW_ID,
    _CDC_WISQARS_DATASET_NAME,
    demographic='age',
    geographic='state',
)
cdc_wisqars_bq_operator_age_state = util.create_bq_ingest_operator(
    'cdc_wisqars_to_bq_age_state',
    cdc_wisqars_bq_payload_age_state,
    data_ingestion_dag,
)

# RACE NATIONAL
cdc_wisqars_bq_payload_race_national = util.generate_bq_payload(
    _CDC_WISQARS_WORKFLOW_ID,
    _CDC_WISQARS_DATASET_NAME,
    demographic='race_and_ethnicity',
    geographic='national',
)
cdc_wisqars_bq_operator_race_national = util.create_bq_ingest_operator(
    'cdc_wisqars_to_bq_race_national',
    cdc_wisqars_bq_payload_race_national,
    data_ingestion_dag,
)

# RACE STATE
cdc_wisqars_bq_payload_race_state = util.generate_bq_payload(
    _CDC_WISQARS_WORKFLOW_ID,
    _CDC_WISQARS_DATASET_NAME,
    demographic='race_and_ethnicity',
    geographic='state',
)
cdc_wisqars_bq_operator_race_state = util.create_bq_ingest_operator(
    'cdc_wisqars_to_bq_race_state',
    cdc_wisqars_bq_payload_race_state,
    data_ingestion_dag,
)

# SEX NATIONAL
cdc_wisqars_bq_payload_sex_national = util.generate_bq_payload(
    _CDC_WISQARS_WORKFLOW_ID,
    _CDC_WISQARS_DATASET_NAME,
    demographic='sex',
    geographic='national',
)
cdc_wisqars_bq_operator_sex_national = util.create_bq_ingest_operator(
    'cdc_wisqars_to_bq_sex_national',
    cdc_wisqars_bq_payload_sex_national,
    data_ingestion_dag,
)

# SEX STATE
cdc_wisqars_bq_payload_sex_state = util.generate_bq_payload(
    _CDC_WISQARS_WORKFLOW_ID,
    _CDC_WISQARS_DATASET_NAME,
    demographic='sex',
    geographic='state',
)
cdc_wisqars_bq_operator_sex_state = util.create_bq_ingest_operator(
    'cdc_wisqars_to_bq_sex_state',
    cdc_wisqars_bq_payload_sex_state,
    data_ingestion_dag,
)

# EXPORTERS
payload_age = {'dataset_name': _CDC_WISQARS_DATASET_NAME, 'demographic': "age"}
cdc_wisqars_exporter_operator_age = util.create_exporter_operator(
    'cdc_wisqars_exporter_age', payload_age, data_ingestion_dag
)

payload_race = {
    'dataset_name': _CDC_WISQARS_DATASET_NAME,
    'demographic': "race_and_ethnicity",
}
cdc_wisqars_exporter_operator_race = util.create_exporter_operator(
    'cdc_wisqars_exporter_race', payload_race, data_ingestion_dag
)

payload_sex = {'dataset_name': _CDC_WISQARS_DATASET_NAME, 'demographic': "sex"}
cdc_wisqars_exporter_operator_sex = util.create_exporter_operator(
    'cdc_wisqars_exporter_sex', payload_sex, data_ingestion_dag
)

# Ingestion DAG
(
    cdc_wisqars_bq_operator_age_national
    >> cdc_wisqars_bq_operator_age_state
    >> cdc_wisqars_bq_operator_race_national
    >> cdc_wisqars_bq_operator_race_state
    >> cdc_wisqars_bq_operator_sex_national
    >> cdc_wisqars_bq_operator_sex_state
    >> [
        cdc_wisqars_exporter_operator_age,
        cdc_wisqars_exporter_operator_race,
        cdc_wisqars_exporter_operator_sex,
    ]
)
