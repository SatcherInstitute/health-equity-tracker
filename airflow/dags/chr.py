# TODO: Rename our airflow/ as it tries to import from that and not the pip airflow
# pylint: disable=no-name-in-module
from airflow import DAG  # type: ignore
from airflow.utils.dates import days_ago  # type: ignore
from datetime import timedelta
import util

_CHR_WORKFLOW_ID = 'CHR_DATA'
_CHR_DATASET_NAME = 'chr_data'

default_args = {
    'start_date': days_ago(0),
    'execution_timeout': timedelta(minutes=15),
}

data_ingestion_dag = DAG(
    'chr_ingestion_dag',
    default_args=default_args,
    schedule_interval=None,
    description='Ingestion configuration for CHR',
)

chr_bq_payload_race = util.generate_bq_payload(_CHR_WORKFLOW_ID, _CHR_DATASET_NAME, demographic='race')
chr_pop_bq_operator_race = util.create_bq_ingest_operator('chr_to_bq', chr_bq_payload_race, data_ingestion_dag)

chr_exporter_payload_race = {
    'dataset_name': _CHR_DATASET_NAME,
    'demographic': "race_and_ethnicity",
    'should_export_as_alls': True,
}
chr_exporter_operator_race = util.create_exporter_operator(
    'chr_exporter', chr_exporter_payload_race, data_ingestion_dag
)

# Ingestion DAG
(chr_pop_bq_operator_race >> chr_exporter_operator_race)
