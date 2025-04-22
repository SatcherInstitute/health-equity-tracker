#!/bin/bash

# Script to delete all tables in a BigQuery dataset
# Usage: ./delete_bq_tables.sh -d DATASET_ID [-p PROJECT_ID] [-x PREFIX] [-s SKIP_SUBSTRING]

# Default project ID
DEFAULT_PROJECT_ID="het-infra-test-05"
# PROD "het-infra-prod-f6"

# Display help message
function show_help {
    echo "Usage: $0 -d DATASET_ID [-p PROJECT_ID] [-x PREFIX] [-s SKIP_SUBSTRING]"
    echo ""
    echo "Delete all tables in a BigQuery dataset"
    echo ""
    echo "Required arguments:"
    echo "  -d DATASET_ID     The BigQuery dataset ID"
    echo ""
    echo "Optional arguments:"
    echo "  -p PROJECT_ID     The Google Cloud project ID (default: het-infra-test-05)"
    echo "  -x PREFIX         Only delete tables starting with this prefix"
    echo "  -s SKIP_SUBSTRING Skip tables containing this substring"
    echo "  -h                Display this help message"
    exit 1
}

# Parse command-line arguments
while getopts "d:p:x:s:h" opt; do
    case $opt in
        d) DATASET_ID=$OPTARG ;;
        p) PROJECT_ID=$OPTARG ;;
        x) PREFIX=$OPTARG ;;
        s) SKIP_SUBSTRING=$OPTARG ;;
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
echo "Listing tables..."
TABLES=$(bq ls --format=sparse "${PROJECT_ID}:${DATASET_ID}" | tail -n +3 | awk '{print $1}')

if [ -z "$TABLES" ]; then
    echo "No tables found in dataset $DATASET_ID"
    exit 0
fi

# Filter tables by prefix if provided
if [ -n "$PREFIX" ]; then
    echo "Filtering tables by prefix: $PREFIX"
    FILTERED_TABLES=$(echo "$TABLES" | grep "^$PREFIX")

    if [ -z "$FILTERED_TABLES" ]; then
        echo "No tables found with prefix '$PREFIX' in dataset $DATASET_ID"
        exit 0
    fi

    TABLES="$FILTERED_TABLES"
fi

# Skip tables containing the specified substring
if [ -n "$SKIP_SUBSTRING" ]; then
    echo "Skipping tables containing: $SKIP_SUBSTRING"
    FILTERED_TABLES=$(echo "$TABLES" | grep -v "$SKIP_SUBSTRING")

    if [ -z "$FILTERED_TABLES" ]; then
        echo "No tables left after applying skip filter in dataset $DATASET_ID"
        exit 0
    fi

    TABLES="$FILTERED_TABLES"
fi

echo "Tables that will be deleted:"
echo "$TABLES"

# Confirmation prompt with -r flag to handle backslashes properly
read -r -p "Are you sure you want to delete all these tables? (y/n) " -n 1 REPLY
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    # Delete all tables
    echo "$TABLES" | xargs -I {} sh -c 'echo "Deleting '"$PROJECT_ID"':'"$DATASET_ID"'.{}" && bq rm -f "'"$PROJECT_ID"':'"$DATASET_ID"'.{}"'

    echo "Selected tables deleted successfully. The dataset '$DATASET_ID' remains intact."
else
    echo "Operation cancelled."
fi