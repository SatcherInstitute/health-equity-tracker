#!/usr/bin/env bash

echo Input ingestion service url?
read ingestionUrl

echo Input gcs to bq service url?
read gcsToBqServiceUrl

echo Input exporter service url?
read exporterServiceUrl

echo Input aggregator service url?
read aggegatorServiceUrl

gcloud composer environments update data-ingestion-environment --update-env-variables=AIRFLOW_VAR_INGEST_TO_GCS_SERVICE_ENDPOINT=${ingestionUrl} --update-env-variables=AIRFLOW_VAR_GCS_TO_BQ_SERVICE_ENDPOINT=${gcsToBqServiceUrl} --update-env-variables=AIRFLOW_VAR_EXPORTER_SERVICE_ENDPOINT=${exporterServiceUrl} --update-env-variables=AIRFLOW_VAR_AGGREGATOR_SERVICE_ENDPOINT=${aggegatorServiceUrl} --update-env-variables=AIRFLOW_VAR_GCS_LANDING_BUCKET=msm-test-landing-bucket --update-env-variables=AIRFLOW_VAR_GCS_MANUAL_UPLOADS_BUCKET=msm-test-manual-data-bucket --location=us-central1

for filename in dags/*; do
  echo "Uploading Dag: ${filename}"
    gcloud composer environments storage dags import --environment data-ingestion-environment --source $filename --location=us-central1
done