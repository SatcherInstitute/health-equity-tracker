'''Manual data ingestion DAG.'''
from util import create_bq_ingest_operator
# Ingore the Airflow module, it is installed in both our dev and prod environments
from airflow.models import Variable  # type: ignore
from airflow import DAG  # type: ignore
from airflow.utils.dates import days_ago  # type: ignore

default_args = {
    'start_date': days_ago(0),
}

manual_ingestion_dag = DAG(
    'manual_ingestion_dag',
    default_args=default_args,
    schedule_interval=None,
    description='Triggering for manual uploads.')

# Manual Uplaods
manual_uploads_payload = {'message': {'is_airflow_run': True,
                                      'gcs_bucket': Variable.get('GCS_MANUAL_UPLOADS_BUCKET'),
                                      'id': 'MANUAL_UPLOADS'}}
manual_uploads_bq_operator = create_bq_ingest_operator(
    'manual_uploads_task', manual_uploads_payload, manual_ingestion_dag)
