# pylint: disable=no-name-in-module
from airflow import DAG  # type: ignore
from airflow.utils.dates import days_ago  # type: ignore
import util

_CDC_WONDER_WORKFLOW_ID = 'CDC_WONDER_DATA'
_CDC_WONDER_DATASET_NAME = 'cdc_wonder_data'

default_args = {
    'start_date': days_ago(0),
}

data_ingestion_dag = DAG(
    'cdc_wonder_ingestion_dag',
    default_args=default_args,
    schedule_interval=None,
    description='Ingestion configuration for CDC Wonder Data',
)

# INGEST BY GEO / DEMO

# race_national
cdc_wonder_bq_payload_race_national = util.generate_bq_payload(
    _CDC_WONDER_WORKFLOW_ID,
    _CDC_WONDER_DATASET_NAME,
    demographic='race_and_ethnicity',
    geographic='national',
)
cdc_wonder_bq_operator_race_national = util.create_bq_ingest_operator(
    'cdc_wonder_to_bq_race_national', cdc_wonder_bq_payload_race_national, data_ingestion_dag
)

# age_national
cdc_wonder_bq_payload_age_national = util.generate_bq_payload(
    _CDC_WONDER_WORKFLOW_ID,
    _CDC_WONDER_DATASET_NAME,
    demographic='age',
    geographic='national',
)
cdc_wonder_bq_operator_age_national = util.create_bq_ingest_operator(
    'cdc_wonder_to_bq_age_national', cdc_wonder_bq_payload_age_national, data_ingestion_dag
)

# sex_national
cdc_wonder_bq_payload_sex_national = util.generate_bq_payload(
    _CDC_WONDER_WORKFLOW_ID,
    _CDC_WONDER_DATASET_NAME,
    demographic='sex',
    geographic='national',
)
cdc_wonder_bq_operator_sex_national = util.create_bq_ingest_operator(
    'cdc_wonder_to_bq_sex_national', cdc_wonder_bq_payload_sex_national, data_ingestion_dag
)

# race_state
cdc_wonder_bq_payload_race_state = util.generate_bq_payload(
    _CDC_WONDER_WORKFLOW_ID,
    _CDC_WONDER_DATASET_NAME,
    demographic='race_and_ethnicity',
    geographic='state',
)
cdc_wonder_bq_operator_race_state = util.create_bq_ingest_operator(
    'cdc_wonder_to_bq_race_state', cdc_wonder_bq_payload_race_state, data_ingestion_dag
)

# age_state
cdc_wonder_bq_payload_age_state = util.generate_bq_payload(
    _CDC_WONDER_WORKFLOW_ID,
    _CDC_WONDER_DATASET_NAME,
    demographic='age',
    geographic='state',
)
cdc_wonder_bq_operator_age_state = util.create_bq_ingest_operator(
    'cdc_wonder_to_bq_age_state', cdc_wonder_bq_payload_age_state, data_ingestion_dag
)

# sex_state
cdc_wonder_bq_payload_sex_state = util.generate_bq_payload(
    _CDC_WONDER_WORKFLOW_ID,
    _CDC_WONDER_DATASET_NAME,
    demographic='sex',
    geographic='state',
)
cdc_wonder_bq_operator_sex_state = util.create_bq_ingest_operator(
    'cdc_wonder_to_bq_sex_state', cdc_wonder_bq_payload_sex_state, data_ingestion_dag
)

# EXPORT BY DEMOGRAPHIC

payload_race = {
    'dataset_name': _CDC_WONDER_DATASET_NAME,
    'demographic': "race_and_ethnicity",
}
cdc_wonder_exporter_operator_race = util.create_exporter_operator(
    'cdc_wonder_exporter_race', payload_race, data_ingestion_dag
)

payload_age = {'dataset_name': _CDC_WONDER_DATASET_NAME, 'demographic': "age"}
cdc_wonder_exporter_operator_age = util.create_exporter_operator(
    'cdc_wonder_exporter_age', payload_age, data_ingestion_dag
)

payload_sex = {'dataset_name': _CDC_WONDER_DATASET_NAME, 'demographic': "sex", 'should_export_as_alls': True}
cdc_wonder_exporter_operator_sex = util.create_exporter_operator(
    'cdc_wonder_exporter_sex', payload_sex, data_ingestion_dag
)

# Ingestion DAG
(
    cdc_wonder_bq_operator_race_national
    >> [
        cdc_wonder_bq_operator_age_national,
        cdc_wonder_bq_operator_sex_national,
    ]
    >> cdc_wonder_bq_operator_race_state
    >> [
        cdc_wonder_bq_operator_age_state,
        cdc_wonder_bq_operator_sex_state,
    ]
    >> cdc_wonder_exporter_operator_race
    >> cdc_wonder_exporter_operator_age
    >> cdc_wonder_exporter_operator_sex
)
