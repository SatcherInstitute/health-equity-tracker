#!/usr/bin/env bash
for filename in dags/*; do
  echo "Uploading Dag: ${filename}"
    gcloud composer environments storage dags import --environment data-ingestion-environment --source $filename --location=us-central1
done