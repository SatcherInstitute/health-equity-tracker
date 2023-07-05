# Ignore the Airflow module, it is installed in both dev and prod
from airflow import DAG  # type: ignore
from airflow.utils.dates import days_ago  # type: ignore
from airflow.operators.dummy_operator import DummyOperator  # type: ignore

import util

_CDC_HIV_WORKFLOW_ID = 'CDC_HIV_DATA'
_CDC_HIV_DATASET_NAME = 'cdc_hiv_data'

default_args = {
    'start_date': days_ago(0),
}

data_ingestion_dag = DAG(
    'cdc_hiv_ingestion_dag',
    default_args=default_args,
    schedule_interval=None,
    description='Ingestion configuration for HIV')

cdc_hiv_bq_payload_national = util.generate_bq_payload(
    _CDC_HIV_WORKFLOW_ID,
    _CDC_HIV_DATASET_NAME,
    geographic='national'
)
cdc_hiv_bq_operator_national = util.create_bq_ingest_operator(
    'cdc_hiv_to_bq_national', cdc_hiv_bq_payload_national, data_ingestion_dag)

cdc_hiv_bq_payload_state = util.generate_bq_payload(
    _CDC_HIV_WORKFLOW_ID,
    _CDC_HIV_DATASET_NAME,
    geographic='state'
)
cdc_hiv_bq_operator_state = util.create_bq_ingest_operator(
    'cdc_hiv_to_bq_state', cdc_hiv_bq_payload_state, data_ingestion_dag)

cdc_hiv_bq_payload_county = util.generate_bq_payload(
    _CDC_HIV_WORKFLOW_ID,
    _CDC_HIV_DATASET_NAME,
    geographic='county'
)
cdc_hiv_bq_operator_county = util.create_bq_ingest_operator(
    'cdc_hiv_to_bq_county', cdc_hiv_bq_payload_county, data_ingestion_dag)

payload_race = {
    'dataset_name': _CDC_HIV_DATASET_NAME,
    'demographic': "race_and_ethnicity"
}
cdc_hiv_exporter_operator_race = util.create_exporter_operator(
    'cdc_hiv_exporter_race', payload_race, data_ingestion_dag)

payload_age = {
    'dataset_name': _CDC_HIV_DATASET_NAME,
    'demographic': "age"
}
cdc_hiv_exporter_operator_age = util.create_exporter_operator(
    'cdc_hiv_exporter_age', payload_age, data_ingestion_dag)


payload_sex = {
    'dataset_name': _CDC_HIV_DATASET_NAME,
    'demographic': "sex"
}
cdc_hiv_exporter_operator_sex = util.create_exporter_operator(
    'cdc_hiv_exporter_sex', payload_sex, data_ingestion_dag)

payload_black_women = {
    'dataset_name': _CDC_HIV_DATASET_NAME,
    'demographic': "black_women"
}
cdc_hiv_exporter_operator_black_women = util.create_exporter_operator(
    'cdc_hiv_exporter_black_women', payload_black_women, data_ingestion_dag)


connector = DummyOperator(
    default_args=default_args,
    dag=data_ingestion_dag,
    task_id='connector'
)

# Ingestion DAG
(
    [
        cdc_hiv_bq_operator_national,
        cdc_hiv_bq_operator_state,
        cdc_hiv_bq_operator_county
    ] >> connector >> [
        cdc_hiv_exporter_operator_race,
        cdc_hiv_exporter_operator_age,
        cdc_hiv_exporter_operator_sex,
        cdc_hiv_exporter_operator_black_women,
    ]
)
