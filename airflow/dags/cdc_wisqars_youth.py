# Ignore the Airflow module, it is installed in both dev and prod
from airflow import DAG  # pylint: disable=no-name-in-module
from airflow.utils.dates import days_ago  # pylint: disable=no-name-in-module
import util

_CDC_WISQARS_YOUTH_WORKFLOW_ID = "CDC_WISQARS_YOUTH_DATA"
_CDC_WISQARS_YOUTH_DATASET_NAME = "cdc_wisqars_youth_data"

default_args = {
    'start_date': days_ago(0),
}

data_ingestion_dag = DAG(
    'cdc_wisqars_youth_ingestion_dag',
    default_args=default_args,
    schedule_interval=None,
    description='Ingestion configuration for CDC_WISQARS Youth',
)

# RACE NATIONAL
cdc_wisqars_youth_bq_payload_race_national = util.generate_bq_payload(
    _CDC_WISQARS_YOUTH_WORKFLOW_ID,
    _CDC_WISQARS_YOUTH_DATASET_NAME,
    demographic='race_and_ethnicity',
    geographic='national',
)
cdc_wisqars_youth_bq_operator_race_national = util.create_bq_ingest_operator(
    'cdc_wisqars_youth_to_bq_race_national',
    cdc_wisqars_youth_bq_payload_race_national,
    data_ingestion_dag,
)

# RACE STATE
cdc_wisqars_youth_bq_payload_race_state = util.generate_bq_payload(
    _CDC_WISQARS_YOUTH_WORKFLOW_ID,
    _CDC_WISQARS_YOUTH_DATASET_NAME,
    demographic='race_and_ethnicity',
    geographic='state',
)
cdc_wisqars_youth_bq_operator_race_state = util.create_bq_ingest_operator(
    'cdc_wisqars_youth_to_bq_race_state',
    cdc_wisqars_youth_bq_payload_race_state,
    data_ingestion_dag,
)

# Exporters
payload_race = {
    'dataset_name': _CDC_WISQARS_YOUTH_DATASET_NAME,
    'demographic': "race_and_ethnicity",
}
cdc_wisqars_youth_exporter_operator_race = util.create_exporter_operator(
    'cdc_wisqars_youth_exporter_race', payload_race, data_ingestion_dag
)

# Ingestion DAG
(
    cdc_wisqars_youth_bq_operator_race_national
    >> cdc_wisqars_youth_bq_operator_race_state
    >> cdc_wisqars_youth_exporter_operator_race
)
