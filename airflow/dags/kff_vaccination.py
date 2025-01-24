# TODO: Rename our airflow/ as it tries to import from that and not the pip airflow
# pylint: disable=no-name-in-module
from airflow import DAG  # type: ignore
from airflow.utils.dates import days_ago  # type: ignore
from datetime import timedelta


import util

_KFF_VACCINATION_WORKFLOW_ID = "KFF_VACCINATION"
_KFF_VACCINATION_DATASET_NAME = "kff_vaccination"

default_args = {
    "start_date": days_ago(0),
    "execution_timeout": timedelta(minutes=15),
}

data_ingestion_dag = DAG(
    "kff_vaccination_ingestion_dag",
    default_args=default_args,
    schedule_interval=None,
    description="Ingestion configuration for CDC Vaccination National",
)

kff_vaccination_bq_payload = util.generate_bq_payload(_KFF_VACCINATION_WORKFLOW_ID, _KFF_VACCINATION_DATASET_NAME)
kff_vaccination_bq_operator = util.create_bq_ingest_operator(
    "kff_vaccination_to_bq", kff_vaccination_bq_payload, data_ingestion_dag
)

kff_vaccination_exporter_payload_race = {
    "dataset_name": _KFF_VACCINATION_DATASET_NAME,
    "should_export_as_alls": True,
    "demographic": "race_and_ethnicity",
}
kff_vaccination_exporter_operator_race = util.create_exporter_operator(
    "kff_vaccination_exporter_race", kff_vaccination_exporter_payload_race, data_ingestion_dag
)


# Ingestion DAG
(kff_vaccination_bq_operator >> kff_vaccination_exporter_operator_race)
