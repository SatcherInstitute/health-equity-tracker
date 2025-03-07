# TODO: Rename our airflow/ as it tries to import from that and not the pip airflow
# pylint: disable=no-name-in-module
from airflow import DAG  # type: ignore
from airflow.utils.dates import days_ago  # type: ignore
from datetime import timedelta
import util

# NEW FLOW - TIME SERIES for US CONGRESS

_CAWP_WORKFLOW_ID = "CAWP_DATA"
_CAWP_DATASET_NAME = "cawp_data"

default_args = {
    "start_date": days_ago(0),
    "execution_timeout": timedelta(minutes=15),
}

data_ingestion_dag = DAG(
    "cawp_ingestion_dag",
    default_args=default_args,
    schedule_interval=None,
    description="Ingestion configuration for CAWP",
)

cawp_bq_payload = util.generate_bq_payload(_CAWP_WORKFLOW_ID, _CAWP_DATASET_NAME)
cawp_pop_bq_operator = util.create_bq_ingest_operator("cawp_to_bq", cawp_bq_payload, data_ingestion_dag)

cawp_exporter_payload_race = {
    "dataset_name": _CAWP_DATASET_NAME,
    "demographic": "race_and_ethnicity",
    "should_export_as_alls": True,
}
cawp_exporter_operator_race = util.create_exporter_operator(
    "cawp_exporter_race", cawp_exporter_payload_race, data_ingestion_dag
)


# Ingestion DAG
(cawp_pop_bq_operator >> cawp_exporter_operator_race)
