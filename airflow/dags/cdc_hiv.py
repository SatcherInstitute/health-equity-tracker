# Ignore the Airflow module, it is installed in both dev and prod
from airflow import DAG  # type: ignore
from airflow.utils.dates import days_ago  # type: ignore

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

cdc_hiv_bq_payload = util.generate_bq_payload(
    _CDC_HIV_WORKFLOW_ID, _CDC_HIV_DATASET_NAME)
cdc_hiv_bq_operator = util.create_bq_ingest_operator(
    'cdc_hiv_to_bq', cdc_hiv_bq_payload, data_ingestion_dag)

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
    'cdc_hiv_exporter_age', payload_race, data_ingestion_dag)


payload_sex = {
    'dataset_name': _CDC_HIV_DATASET_NAME,
    'demographic': "sex"
}
cdc_hiv_exporter_operator_sex = util.create_exporter_operator(
    'cdc_hiv_exporter_sex', payload_sex, data_ingestion_dag)

# Ingestion DAG
(
    cdc_hiv_bq_operator >> [
        cdc_hiv_exporter_operator_race,
        cdc_hiv_exporter_operator_age,
        cdc_hiv_exporter_operator_sex,
    ]
)
