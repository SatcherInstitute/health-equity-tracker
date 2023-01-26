from airflow import DAG  # type: ignore
from airflow.utils.dates import days_ago  # type: ignore

import util

_CDC_HIV_DIAGNOSES_WORKFLOW_ID = 'CDC_HIV_DIAGNOSES_DATA'
_CDC_HIV_DIAGNOSES_DATASET_NAME = 'cdc_hiv_diagnoses_data'


default_args = {
    'state_date': days_ago(0)
}
data_ingestion_dag = DAG(
    'cdc_hiv_diagnoses_ingestion_dag',
    default_args=default_args,
    schedule_interval=None,
    description='Ingestion configuration for HIV Diagnoses'
)

# create payloads
payload_race = {
    'dataset_name': _CDC_HIV_DIAGNOSES_DATASET_NAME,
    'demographic': 'race_and_ethnicity'
}
payload_age = {
    'dataset_name': _CDC_HIV_DIAGNOSES_DATASET_NAME,
    'demographic': 'age'
}
payload_sex = {
    'dataset_name': _CDC_HIV_DIAGNOSES_DATASET_NAME,
    'demographic': 'sex'
}

# create exporters
cdc_hiv_diagnoses_exporter_operator_race = util.create_exporter_operator(
    'cdc_hiv_diagnoses_exporter_race', payload_race, data_ingestion_dag
)
cdc_hiv_diagnoses_exporter_operator_age = util.create_exporter_operator(
    'cdc_hiv_diagnoses_exporter_age', payload_age, data_ingestion_dag
)
cdc_hiv_diagnoses_exporter_operator_sex = util.create_exporter_operator(
    'cdc_hiv_diagnoses_exporter_sex', payload_sex, data_ingestion_dag
)

# create task
cdc_hiv_diagnoses_bq_payload = util.generate_bq_payload(
    _CDC_HIV_DIAGNOSES_WORKFLOW_ID, _CDC_HIV_DIAGNOSES_DATASET_NAME
)
cdc_hiv_diagnoses_bq_operator = util.create_bq_ingest_operator(
    'cdc_hiv_diagnoses_to_bq', cdc_hiv_diagnoses_bq_payload, data_ingestion_dag
)

# ingestion DAG
(
    cdc_hiv_diagnoses_bq_operator >> [
        cdc_hiv_diagnoses_exporter_operator_race,
        cdc_hiv_diagnoses_exporter_operator_age,
        cdc_hiv_diagnoses_exporter_operator_sex
    ]
)
