# pylint: disable=no-name-in-module
from airflow import DAG  # type: ignore
from airflow.utils.dates import days_ago  # type: ignore
import util
from datetime import timedelta

_CDC_WISQARS_BLACK_MEN_WORKFLOW_ID = "CDC_WISQARS_BLACK_MEN_DATA"
_CDC_WISQARS_BLACK_MEN_DATASET_NAME = "cdc_wisqars_black_men_data"

default_args = {
    "start_date": days_ago(0),
    "execution_timeout": timedelta(minutes=15),
}

data_ingestion_dag = DAG(
    "cdc_wisqars_black_men_ingestion_dag",
    default_args=default_args,
    schedule_interval=None,
    description="Ingestion configuration for CDC_WISQARS Black Men",
)

# URBANICITY NATIONAL
cdc_wisqars_black_men_bq_payload_urbanicity_national = util.generate_bq_payload(
    _CDC_WISQARS_BLACK_MEN_WORKFLOW_ID,
    _CDC_WISQARS_BLACK_MEN_DATASET_NAME,
    demographic="urbanicity",
    geographic="national",
)
cdc_wisqars_black_men_bq_operator_urbanicity_national = util.create_bq_ingest_operator(
    "cdc_wisqars_black_men_to_bq_urbanicity_national",
    cdc_wisqars_black_men_bq_payload_urbanicity_national,
    data_ingestion_dag,
)

# URBANICITY STATE
cdc_wisqars_black_men_bq_payload_urbanicity_state = util.generate_bq_payload(
    _CDC_WISQARS_BLACK_MEN_WORKFLOW_ID,
    _CDC_WISQARS_BLACK_MEN_DATASET_NAME,
    demographic="urbanicity",
    geographic="state",
)
cdc_wisqars_black_men_bq_operator_urbanicity_state = util.create_bq_ingest_operator(
    "cdc_wisqars_black_men_to_bq_urbanicity_state",
    cdc_wisqars_black_men_bq_payload_urbanicity_state,
    data_ingestion_dag,
)

# AGE NATIONAL
cdc_wisqars_black_men_bq_payload_age_national = util.generate_bq_payload(
    _CDC_WISQARS_BLACK_MEN_WORKFLOW_ID,
    _CDC_WISQARS_BLACK_MEN_DATASET_NAME,
    demographic="age",
    geographic="national",
)
cdc_wisqars_black_men_bq_operator_age_national = util.create_bq_ingest_operator(
    "cdc_wisqars_black_men_to_bq_age_national",
    cdc_wisqars_black_men_bq_payload_age_national,
    data_ingestion_dag,
)

# AGE STATE
cdc_wisqars_black_men_bq_payload_age_state = util.generate_bq_payload(
    _CDC_WISQARS_BLACK_MEN_WORKFLOW_ID,
    _CDC_WISQARS_BLACK_MEN_DATASET_NAME,
    demographic="age",
    geographic="state",
)
cdc_wisqars_black_men_bq_operator_age_state = util.create_bq_ingest_operator(
    "cdc_wisqars_black_men_to_bq_age_state",
    cdc_wisqars_black_men_bq_payload_age_state,
    data_ingestion_dag,
)

# Exporters
payload_urbanicity = {
    "dataset_name": _CDC_WISQARS_BLACK_MEN_DATASET_NAME,
    "demographic": "urbanicity",
    "should_export_as_alls": True,
}
cdc_wisqars_black_men_exporter_operator_urbanicity = util.create_exporter_operator(
    "cdc_wisqars_black_men_exporter_urbanicity", payload_urbanicity, data_ingestion_dag
)

payload_age = {
    "dataset_name": _CDC_WISQARS_BLACK_MEN_DATASET_NAME,
    "demographic": "age",
}
cdc_wisqars_black_men_exporter_operator_age = util.create_exporter_operator(
    "cdc_wisqars_black_men_exporter_age", payload_age, data_ingestion_dag
)

# Ingestion DAG
(
    cdc_wisqars_black_men_bq_operator_urbanicity_national
    >> cdc_wisqars_black_men_bq_operator_urbanicity_state
    >> cdc_wisqars_black_men_bq_operator_age_national
    >> cdc_wisqars_black_men_bq_operator_age_state
    >> cdc_wisqars_black_men_exporter_operator_urbanicity
    >> cdc_wisqars_black_men_exporter_operator_age
)
