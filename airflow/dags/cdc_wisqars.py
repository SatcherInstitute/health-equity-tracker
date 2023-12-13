# Ignore the Airflow module, it is installed in both dev and prod
from airflow import DAG  # type: ignore
from airflow.utils.dates import days_ago  # type: ignore
import util

_CDC_WISQARS_WORKFLOW_ID = 'CDC_WISQARS_DATA'
_CDC_WISQARS_DATASET_NAME = 'cdc_wisqars_data'

default_args = {
    'start_date': days_ago(0),
}

data_ingestion_dag = DAG(
    'cdc_wisqars_ingestion_dag',
    default_args=default_args,
    schedule_interval=None,
    description='Ingestion configuration for CDC_WISQARS',
)

cdc_wisqars_bq_payload = util.generate_bq_payload(
    _CDC_WISQARS_WORKFLOW_ID, _CDC_WISQARS_DATASET_NAME
)
cdc_wisqars_bq_operator = util.create_bq_ingest_operator(
    'cdc_wisqars_to_bq',
    cdc_wisqars_bq_payload,
    data_ingestion_dag,
)

cdc_wisqars_national_exporter_payload_age = {
    'dataset_name': _CDC_WISQARS_DATASET_NAME,
    'demographic': "age",
}
cdc_wisqars_national_exporter_operator_age = util.create_exporter_operator(
    'cdc_wisqars_national_exporter_age',
    cdc_wisqars_national_exporter_payload_age,
    data_ingestion_dag,
)


cdc_wisqars_national_exporter_payload_sex = {
    'dataset_name': _CDC_WISQARS_DATASET_NAME,
    'demographic': "sex",
}
cdc_wisqars_national_exporter_operator_sex = util.create_exporter_operator(
    'cdc_wisqars_national_exporter_sex',
    cdc_wisqars_national_exporter_payload_sex,
    data_ingestion_dag,
)

# Ingestion DAG
(
    cdc_wisqars_bq_operator
    >> [
        cdc_wisqars_national_exporter_operator_age,
        cdc_wisqars_national_exporter_operator_sex,
    ]
)
