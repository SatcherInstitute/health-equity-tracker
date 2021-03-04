#!/usr/bin/env bash
echo Input ingestion service url?
read ingestionUrl

echo Input dedupe service url?
read dedupeUrl

echo Input gcs to bq service url?
read gcsToBqServiceUrl

echo Input exporter service url?
read exporterServiceUrl

echo Input aggregator service url?
read aggegatorServiceUrl

echo Input landing bucket?
read landingBucket

echo Input manual upload bucket?
read manualUploadBucket

gcloud composer environments update data-ingestion-environment \
--update-env-variables=AIRFLOW_VAR_INGEST_TO_GCS_SERVICE_ENDPOINT=${ingestionUrl} \
--update-env-variables=AIRFLOW_VAR_DEDUPE_SERVICE_ENDPOINT=${dedupeUrl} \
--update-env-variables=AIRFLOW_VAR_GCS_TO_BQ_SERVICE_ENDPOINT=${gcsToBqServiceUrl} \
--update-env-variables=AIRFLOW_VAR_EXPORTER_SERVICE_ENDPOINT=${exporterServiceUrl} \
--update-env-variables=AIRFLOW_VAR_AGGREGATOR_SERVICE_ENDPOINT=${aggegatorServiceUrl} \
--update-env-variables=AIRFLOW_VAR_GCS_LANDING_BUCKET=${landingBucket} \
--update-env-variables=AIRFLOW_VAR_GCS_MANUAL_UPLOADS_BUCKET=${manualUploadBucket} \
--location=us-central1
