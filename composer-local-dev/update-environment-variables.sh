#!/usr/bin/env bash

INGESTION_URL=$(gcloud run services list --platform managed --filter ingestion-service --format 'value(status.url)')
echo "Using Fetched Data: ${INGESTION_URL}"

GCS_TO_BQ_URL=$(gcloud run services list --platform managed --filter gcs-to-bq-service --format 'value(status.url)')
echo "Using Fetched Data: ${GCS_TO_BQ_URL}"

EXPORTER_URL=$(gcloud run services list --platform managed --filter exporter-service --format 'value(status.url)')
echo "Using Fetched Data: ${EXPORTER_URL}"

LANDING_BUCKET=$(gsutil ls | grep -o ".*landing.*" | cut -d "/" -f 3)
echo "Using Landing Bucket: $LANDING_BUCKET"

MANUAL_BUCKET=$(gsutil ls | grep -o ".*manual.*" | cut -d "/" -f 3)
echo "Using Manual Bucket: $MANUAL_BUCKET"

gcloud composer environments update data-ingestion-environment \
--update-env-variables=AIRFLOW_VAR_INGEST_TO_GCS_SERVICE_ENDPOINT=${INGESTION_URL} \
--update-env-variables=AIRFLOW_VAR_GCS_TO_BQ_SERVICE_ENDPOINT=${GCS_TO_BQ_URL} \
--update-env-variables=AIRFLOW_VAR_EXPORTER_SERVICE_ENDPOINT=${EXPORTER_URL} \
--update-env-variables=AIRFLOW_VAR_GCS_LANDING_BUCKET=${LANDING_BUCKET} \
--update-env-variables=AIRFLOW_VAR_GCS_MANUAL_UPLOADS_BUCKET=${MANUAL_BUCKET} \
--location=us-central1
