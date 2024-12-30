# TODO: Rename our airflow/ as it tries to import from that and not the pip airflow
# pylint: disable=no-name-in-module
from airflow import DAG  # type: ignore
from airflow.utils.dates import days_ago  # type: ignore
from datetime import timedelta
import util

_CDC_VACCINATION_COUNTY_WORKFLOW_ID = "CDC_VACCINATION_COUNTY"
_CDC_VACCINATION_COUNTY_DATASET_NAME = "cdc_vaccination_county"

default_args = {
    "start_date": days_ago(0),
    "execution_timeout": timedelta(minutes=15),
}

data_ingestion_dag = DAG(
    "cdc_vaccination_county_ingestion_dag",
    default_args=default_args,
    schedule_interval=None,
    description="Ingestion configuration for CDC Vaccination County",
)

cdc_vaccination_county_bq_payload = util.generate_bq_payload(
    _CDC_VACCINATION_COUNTY_WORKFLOW_ID, _CDC_VACCINATION_COUNTY_DATASET_NAME
)
cdc_vaccination_county_bq_operator = util.create_bq_ingest_operator(
    "cdc_vaccination_county_to_bq", cdc_vaccination_county_bq_payload, data_ingestion_dag
)

cdc_vaccination_county_exporter_payload_alls = {
    "dataset_name": _CDC_VACCINATION_COUNTY_DATASET_NAME,
    "demographic": "alls",
}
cdc_vaccination_county_exporter_operator_alls = util.create_exporter_operator(
    "cdc_vaccination_county_exporter_alls", cdc_vaccination_county_exporter_payload_alls, data_ingestion_dag
)

# Ingestion DAG
(cdc_vaccination_county_bq_operator >> cdc_vaccination_county_exporter_operator_alls)
