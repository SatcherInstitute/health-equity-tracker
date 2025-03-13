#!/bin/bash

# Script to delete JSON files in a GCS bucket that start with a specific dataset name
# Usage: ./delete_gcs_files.sh -d DATASET_NAME [-p PROJECT_ID] [-b BUCKET_NAME]

# Default values
DEFAULT_PROJECT_ID="het-infra-test-05"
DEFAULT_BUCKET_NAME="het-data-tables"

# Display help message
function show_help {
    echo "Usage: $0 -d DATASET_NAME [-p PROJECT_ID] [-b BUCKET_NAME]"
    echo ""
    echo "Delete JSON files in a GCS bucket that start with a specific dataset name"
    echo ""
    echo "Required arguments:"
    echo "  -d DATASET_NAME   The dataset name prefix for files to delete"
    echo ""
    echo "Optional arguments:"
    echo "  -p PROJECT_ID     The Google Cloud project ID (default: $DEFAULT_PROJECT_ID)"
    echo "  -b BUCKET_NAME    The GCS bucket name (default: $DEFAULT_BUCKET_NAME)"
    echo "  -h                Display this help message"
    exit 1
}

# Parse command-line arguments
while getopts "d:p:b:h" opt; do
    case $opt in
        d) DATASET_NAME=$OPTARG ;;
        p) PROJECT_ID=$OPTARG ;;
        b) BUCKET_NAME=$OPTARG ;;
        h) show_help ;;
        *) show_help ;;
    esac
done

# Check if dataset name is provided
if [ -z "$DATASET_NAME" ]; then
    echo "Error: Dataset name is required"
    show_help
fi

# Use default project ID if not specified
if [ -z "$PROJECT_ID" ]; then
    PROJECT_ID="$DEFAULT_PROJECT_ID"
    echo "Using default project ID: $PROJECT_ID"
else
    echo "Using project ID: $PROJECT_ID"
fi

# Use default bucket name if not specified
if [ -z "$BUCKET_NAME" ]; then
    BUCKET_NAME="$DEFAULT_BUCKET_NAME"
    echo "Using default bucket name: $BUCKET_NAME"
else
    echo "Using bucket name: $BUCKET_NAME"
fi

echo "Target dataset prefix: $DATASET_NAME"

# Check if the bucket exists
if ! gsutil ls -p "$PROJECT_ID" "gs://$BUCKET_NAME" &>/dev/null; then
    echo "Error: Bucket $BUCKET_NAME does not exist in project $PROJECT_ID"
    exit 1
fi

# List all JSON files in the bucket that start with the dataset name
echo "Listing JSON files that start with '$DATASET_NAME' in bucket '$BUCKET_NAME':"
FILES=$(gsutil ls -p "$PROJECT_ID" "gs://$BUCKET_NAME/$DATASET_NAME*.json" 2>/dev/null)

if [ -z "$FILES" ]; then
    echo "No JSON files found with prefix $DATASET_NAME"
    exit 0
fi

echo "$FILES"

# Count the number of files
FILE_COUNT=$(echo "$FILES" | wc -l)
echo "Found $FILE_COUNT files to delete"

# Confirmation prompt
read -p "Are you sure you want to delete all these files? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    # Delete all matching files
    echo "Deleting files..."
    gsutil -m rm -a "gs://$BUCKET_NAME/$DATASET_NAME*.json"

    echo "All matching JSON files deleted successfully from bucket '$BUCKET_NAME'."
else
    echo "Operation cancelled."
fi