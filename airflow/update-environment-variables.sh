#!/usr/bin/env bash
echo Input ingestion service url?
INGESTION_URL=$(gcloud run services list --platform managed --filter ingestion-service | grep -o "https:.*\.app")
echo "Using Fetched Data: ${INGESTION_URL}"

echo Input dedupe service url?
DEDUPE_URL=$(gcloud run services list --platform managed --filter dedupe-service | grep -o "https:.*\.app")
echo "Using Fetched Data: ${DEDUPE_URL}"

echo Input gcs to bq service url?
GCS_TO_BQ_URL=$(gcloud run services list --platform managed --filter gcs-to-bq-service | grep -o "https:.*\.app")
echo "Using Fetched Data: ${GCS_TO_BQ_URL}"

echo Input exporter service url?
EXPORTER_URL=$(gcloud run services list --platform managed --filter exporter-service | grep -o "https:.*\.app")
echo "Using Fetched Data: ${EXPORTER_URL}"

echo Input aggregator service url?
AGGREGATOR_URL=$(gcloud run services list --platform managed --filter aggregator-service | grep -o "https:.*\.app")
echo "Using Fetched Data: ${AGGREGATOR_URL}"

echo Input landing bucket?
LANDING_BUCKET=$(gsutil ls | grep -oP ".*landing.*")
LANDING_BUCKET=${LANDING_BUCKET:5:-1}
echo $LANDING_BUCKET

echo Input manual upload bucket?
MANUAL_BUCKET=$(gsutil ls | grep -oP ".*landing.*")
MANUAL_BUCKET=${MANUAL_BUCKET:5:-1}
echo $MANUAL_BUCKET

gcloud composer environments update data-ingestion-environment \
--update-env-variables=AIRFLOW_VAR_INGEST_TO_GCS_SERVICE_ENDPOINT=${INGESTION_URL} \
--update-env-variables=AIRFLOW_VAR_DEDUPE_SERVICE_ENDPOINT=${DEDUPE_URL} \
--update-env-variables=AIRFLOW_VAR_GCS_TO_BQ_SERVICE_ENDPOINT=${GCS_TO_BQ_URL} \
--update-env-variables=AIRFLOW_VAR_EXPORTER_SERVICE_ENDPOINT=${AGGREGATOR_URL} \
--update-env-variables=AIRFLOW_VAR_AGGREGATOR_SERVICE_ENDPOINT=${aggegatorServiceUrl} \
--update-env-variables=AIRFLOW_VAR_GCS_LANDING_BUCKET=${LANDING_BUCKET} \
--update-env-variables=AIRFLOW_VAR_GCS_MANUAL_UPLOADS_BUCKET=${MANUAL_BUCKET} \
--location=us-central1
