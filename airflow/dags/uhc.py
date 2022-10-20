# Ignore the Airflow module, it is installed in both dev and prod
from airflow import DAG  # type: ignore
from airflow.utils.dates import days_ago  # type: ignore

import util

_UHC_WORKFLOW_ID = 'UHC_DATA'
_UHC_DATASET_NAME = 'uhc_data'

default_args = {
    'start_date': days_ago(0),
}

data_ingestion_dag = DAG(
    'uhc_ingestion_dag',
    default_args=default_args,
    schedule_interval=None,
    description='Ingestion configuration for UHC')

uhc_bq_payload = util.generate_bq_payload(
    _UHC_WORKFLOW_ID, _UHC_DATASET_NAME)
uhc_pop_bq_operator = util.create_bq_ingest_operator(
    'uhc_to_bq', uhc_bq_payload, data_ingestion_dag)

uhc_exporter_payload_race = {
    'dataset_name': _UHC_DATASET_NAME,
    'demographic': "race_and_ethnicity"
}
uhc_exporter_operator_race = util.create_exporter_operator(
    'uhc_exporter_race', uhc_exporter_payload_race, data_ingestion_dag)


uhc_exporter_payload_age = {
    'dataset_name': _UHC_DATASET_NAME,
    'demographic': "age"
}
uhc_exporter_operator_age = util.create_exporter_operator(
    'uhc_exporter_age', uhc_exporter_payload_age, data_ingestion_dag)


uhc_exporter_payload_sex = {
    'dataset_name': _UHC_DATASET_NAME,
    'demographic': "sex"
}
uhc_exporter_operator_sex = util.create_exporter_operator(
    'uhc_exporter_sex', uhc_exporter_payload_sex, data_ingestion_dag)

# Ingestion DAG
(
    uhc_pop_bq_operator >> [
        uhc_exporter_operator_race,
        uhc_exporter_operator_age,
        uhc_exporter_operator_sex,
    ]
)
