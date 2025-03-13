#!/bin/bash

# Script to delete all tables in a BigQuery dataset
# Usage: ./delete_bq_tables.sh -d DATASET_ID [-p PROJECT_ID]

# Default project ID
DEFAULT_PROJECT_ID="het-infra-test-05"
# PROD "het-infra-prod-f6"

# Display help message
function show_help {
    echo "Usage: $0 -d DATASET_ID [-p PROJECT_ID]"
    echo ""
    echo "Delete all tables in a BigQuery dataset"
    echo ""
    echo "Required arguments:"
    echo "  -d DATASET_ID     The BigQuery dataset ID"
    echo ""
    echo "Optional arguments:"
    echo "  -p PROJECT_ID     The Google Cloud project ID (default: het-infra-test-05)"
    echo "  -h                Display this help message"
    exit 1
}

# Parse command-line arguments
while getopts "d:p:h" opt; do
    case $opt in
        d) DATASET_ID=$OPTARG ;;
        p) PROJECT_ID=$OPTARG ;;
        h) show_help ;;
        *) show_help ;;
    esac
done

# Check if dataset ID is provided
if [ -z "$DATASET_ID" ]; then
    echo "Error: Dataset ID is required"
    show_help
fi

# Use default project ID if not specified
if [ -z "$PROJECT_ID" ]; then
    PROJECT_ID="$DEFAULT_PROJECT_ID"
    echo "Using default project ID: $PROJECT_ID"
else
    echo "Using project ID: $PROJECT_ID"
fi

echo "Target dataset: $DATASET_ID"

# Check if the dataset exists
if ! bq ls "$PROJECT_ID:$DATASET_ID" &>/dev/null; then
    echo "Error: Dataset $DATASET_ID does not exist in project $PROJECT_ID"
    exit 1
fi

# List all tables in the dataset
echo "Tables that will be deleted:"
TABLES=$(bq ls --format=sparse "${PROJECT_ID}:${DATASET_ID}" | tail -n +3 | awk '{print $1}')

if [ -z "$TABLES" ]; then
    echo "No tables found in dataset $DATASET_ID"
    exit 0
fi

echo "$TABLES"

# Confirmation prompt
read -p "Are you sure you want to delete all these tables? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    # Delete all tables
    echo "$TABLES" | xargs -I {} sh -c 'echo "Deleting '"$PROJECT_ID"':'"$DATASET_ID"'.{}" && bq rm -f "'"$PROJECT_ID"':'"$DATASET_ID"'.{}"'

    echo "All tables deleted successfully. The dataset '$DATASET_ID' remains intact."
else
    echo "Operation cancelled."
fi