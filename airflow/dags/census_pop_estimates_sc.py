# Ignore the Airflow module, it is installed in both dev and prod
from airflow import DAG  # type: ignore
from airflow.utils.dates import days_ago  # type: ignore

import util

_CENSUS_POP_ESTIMATES_SC_WORKFLOW_ID = 'CENSUS_POP_ESTIMATES_SC'
_CENSUS_POP_ESTIMATES_SC_DATASET_NAME = 'census_pop_estimates_sc'

default_args = {
    'start_date': days_ago(0),
}

data_ingestion_dag = DAG(
    'census_pop_estimates_sc_ingestion_dag',
    default_args=default_args,
    schedule_interval=None,
    description='Ingestion configuration for Census Population Estimates SC')

census_pop_estimates_sc_bq_payload = util.generate_bq_payload(
    _CENSUS_POP_ESTIMATES_SC_WORKFLOW_ID, _CENSUS_POP_ESTIMATES_SC_DATASET_NAME)
census_pop_estimates_sc_bq_operator = util.create_bq_ingest_operator(
    'census_pop_estimates_sc_to_bq', census_pop_estimates_sc_bq_payload, data_ingestion_dag)

census_pop_estimates_sc_exporter_payload = {
    'dataset_name': _CENSUS_POP_ESTIMATES_SC_DATASET_NAME,
    'demographic': "race"
}
census_pop_estimates_sc_exporter_operator = util.create_exporter_operator(
    'census_pop_estimates_sc_exporter', census_pop_estimates_sc_exporter_payload, data_ingestion_dag)

# Ingestion DAG
(
    census_pop_estimates_sc_bq_operator >>
    census_pop_estimates_sc_exporter_operator
)
