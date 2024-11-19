# TODO: Rename our airflow/ as it tries to import from that and not the pip airflow
# pylint: disable=no-name-in-module
from airflow import DAG  # type: ignore
from airflow.utils.dates import days_ago  # type: ignore
import util

_MM_WORKFLOW_ID = 'MATERNAL_MORTALITY_DATA'
_MM_DATASET_NAME = 'maternal_mortality_data'
default_args = {
    'start_date': days_ago(0),
}
data_ingestion_dag = DAG(
    'maternal_mortality_ingestion_dag',
    default_args=default_args,
    schedule_interval=None,
    description='Ingestion configuration for MATERNAL_MORTALITY',
)
maternal_mortality_bq_payload = util.generate_bq_payload(_MM_WORKFLOW_ID, _MM_DATASET_NAME, demographic='race')
maternal_mortality_bq_operator = util.create_bq_ingest_operator(
    'maternal_mortality_to_bq', maternal_mortality_bq_payload, data_ingestion_dag
)
maternal_mortality_exporter_payload_race = {
    'dataset_name': _MM_DATASET_NAME,
    'demographic': 'race',
    'should_export_as_alls': True,
}
maternal_mortality_exporter_operator_race = util.create_exporter_operator(
    'maternal_mortality_exporter_race', maternal_mortality_exporter_payload_race, data_ingestion_dag
)
# Ingestion DAG
(maternal_mortality_bq_operator >> maternal_mortality_exporter_operator_race)
