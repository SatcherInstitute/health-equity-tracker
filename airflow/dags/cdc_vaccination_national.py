# Ignore the Airflow module, it is installed in both dev & prod
# pylint: disable=no-name-in-module
from airflow import DAG  # type: ignore
from airflow.utils.dates import days_ago  # type: ignore
from datetime import timedelta
import util

_CDC_VACCINATION_NATIONAL_WORKFLOW_ID = "CDC_VACCINATION_NATIONAL"
_CDC_VACCINATION_NATIONAL_DATASET_NAME = "cdc_vaccination_national"

default_args = {
    "start_date": days_ago(0),
    "execution_timeout": timedelta(minutes=15),
}

data_ingestion_dag = DAG(
    "cdc_vaccination_national_ingestion_dag",
    default_args=default_args,
    schedule_interval=None,
    description="Ingestion configuration for CDC Vaccination National",
)

cdc_vaccination_national_bq_payload = util.generate_bq_payload(
    _CDC_VACCINATION_NATIONAL_WORKFLOW_ID, _CDC_VACCINATION_NATIONAL_DATASET_NAME
)
cdc_vaccination_national_bq_operator = util.create_bq_ingest_operator(
    "cdc_vaccination_national_to_bq", cdc_vaccination_national_bq_payload, data_ingestion_dag
)

cdc_vaccination_national_exporter_payload_race = {
    "dataset_name": _CDC_VACCINATION_NATIONAL_DATASET_NAME,
    "should_export_as_alls": True,
    "demographic": "race",
}
cdc_vaccination_national_exporter_operator_race = util.create_exporter_operator(
    "cdc_vaccination_national_exporter_race", cdc_vaccination_national_exporter_payload_race, data_ingestion_dag
)

cdc_vaccination_national_exporter_payload_age = {
    "dataset_name": _CDC_VACCINATION_NATIONAL_DATASET_NAME,
    "demographic": "age",
}
cdc_vaccination_national_exporter_operator_age = util.create_exporter_operator(
    "cdc_vaccination_national_exporter_age", cdc_vaccination_national_exporter_payload_age, data_ingestion_dag
)


cdc_vaccination_national_exporter_payload_sex = {
    "dataset_name": _CDC_VACCINATION_NATIONAL_DATASET_NAME,
    "demographic": "sex",
}
cdc_vaccination_national_exporter_operator_sex = util.create_exporter_operator(
    "cdc_vaccination_national_exporter_sex", cdc_vaccination_national_exporter_payload_sex, data_ingestion_dag
)


# Ingestion DAG
(
    cdc_vaccination_national_bq_operator
    >> [
        cdc_vaccination_national_exporter_operator_race,
        cdc_vaccination_national_exporter_operator_age,
        cdc_vaccination_national_exporter_operator_sex,
    ]
)
