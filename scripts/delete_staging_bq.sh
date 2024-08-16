#!/bin/bash

# Project ID
PROJECT_ID="het-infra-test-05"

# List all datasets
DATASETS=$(bq ls --format=prettyjson --project_id="$PROJECT_ID" | jq -r '.[].datasetReference.datasetId')

# Iterate over each dataset
for DATASET in $DATASETS; do
    echo "Deleting dataset: $DATASET"
    bq rm -r -d "$PROJECT_ID:$DATASET"
done

echo "All datasets deleted from the project."
