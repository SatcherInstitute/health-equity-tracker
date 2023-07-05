# Ignore the Airflow module, it is installed in both dev and prod
from airflow import DAG  # type: ignore
from airflow.utils.dates import days_ago  # type: ignore

import util

_PHRMA_WORKFLOW_ID = 'PHRMA_DATA'
_PHRMA_DATASET_NAME = 'phrma_data'

default_args = {
    'start_date': days_ago(0),
}

data_ingestion_dag = DAG(
    'phrma_ingestion_dag',
    default_args=default_args,
    schedule_interval=None,
    description='Ingestion configuration for Phrma')

phrma_bq_payload = util.generate_bq_payload(
    _PHRMA_WORKFLOW_ID, _PHRMA_DATASET_NAME)
phrma_bq_operator = util.create_bq_ingest_operator(
    'phrma_to_bq', phrma_bq_payload, data_ingestion_dag)

payload_race = {
    'dataset_name': _PHRMA_DATASET_NAME,
    'demographic': "race_and_ethnicity"
}
phrma_exporter_operator_race = util.create_exporter_operator(
    'phrma_exporter_race', payload_race, data_ingestion_dag)

payload_age = {
    'dataset_name': _PHRMA_DATASET_NAME,
    'demographic': "age"
}
phrma_exporter_operator_age = util.create_exporter_operator(
    'phrma_exporter_age', payload_age, data_ingestion_dag)


payload_sex = {
    'dataset_name': _PHRMA_DATASET_NAME,
    'demographic': "sex"
}
phrma_exporter_operator_sex = util.create_exporter_operator(
    'phrma_exporter_sex', payload_sex, data_ingestion_dag)


payload_lis = {
    'dataset_name': _PHRMA_DATASET_NAME,
    'demographic': "lis"
}
phrma_exporter_operator_lis = util.create_exporter_operator(
    'phrma_exporter_lis', payload_lis, data_ingestion_dag)


payload_eligibility = {
    'dataset_name': _PHRMA_DATASET_NAME,
    'demographic': "eligibility"
}
phrma_exporter_operator_eligibility = util.create_exporter_operator(
    'phrma_exporter_eligibility', payload_eligibility, data_ingestion_dag)
# Ingestion DAG
(
    phrma_bq_operator >> [
        phrma_exporter_operator_race,
        phrma_exporter_operator_age,
        phrma_exporter_operator_sex,
        phrma_exporter_operator_lis,
        phrma_exporter_operator_eligibility,
    ]
)
