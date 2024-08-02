#!/usr/bin/env bash

# This script manages environment variables for the Composer local data ingestion environment.
# It supports commands to start, stop, and restart the environment by setting or clearing the variables file.

# Constants
THIS_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
VARIABLES_FILE="${THIS_DIR}/../../composer/local-data-ingestion-environment/variables.env"

# Function to retrieve service URLs and bucket names
retrieve_variables() {
    echo "Retrieving variables..."

    ingestion_url=$(gcloud run services list --platform managed --filter ingestion-service --format 'value(status.url)')
    gcs_to_bq_url=$(gcloud run services list --platform managed --filter gcs-to-bq-service --format 'value(status.url)')
    exporter_url=$(gcloud run services list --platform managed --filter exporter-service --format 'value(status.url)')
    landing_bucket=$(gsutil ls | grep -o ".*landing.*" | cut -d "/" -f 3)
    manual_bucket=$(gsutil ls | grep -o ".*manual.*" | cut -d "/" -f 3)

    export INGESTION_URL="$ingestion_url"
    export GCS_TO_BQ_URL="$gcs_to_bq_url"
    export EXPORTER_URL="$exporter_url"
    export LANDING_BUCKET="$landing_bucket"
    export MANUAL_BUCKET="$manual_bucket"

    # Output fetched data for debugging
    echo "Fetched URLs and Buckets:"
    echo "  INGESTION_URL: ${INGESTION_URL}"
    echo "  GCS_TO_BQ_URL: ${GCS_TO_BQ_URL}"
    echo "  EXPORTER_URL: ${EXPORTER_URL}"
    echo "  LANDING_BUCKET: ${LANDING_BUCKET}"
    echo "  MANUAL_BUCKET: ${MANUAL_BUCKET}"
}

# Function to insert variables into the variables.env file
insert_variables() {
    echo "Inserting variables into variable.env..."

    # Write environment variables to the file
    cat <<EOT > "${VARIABLES_FILE}"
AIRFLOW_VAR_INGEST_TO_GCS_SERVICE_ENDPOINT=${INGESTION_URL}
AIRFLOW_VAR_GCS_TO_BQ_SERVICE_ENDPOINT=${GCS_TO_BQ_URL}
AIRFLOW_VAR_EXPORTER_SERVICE_ENDPOINT=${EXPORTER_URL}
AIRFLOW_VAR_GCS_LANDING_BUCKET=${LANDING_BUCKET}
AIRFLOW_VAR_GCS_MANUAL_UPLOADS_BUCKET=${MANUAL_BUCKET}
ENV=local
EOT

    echo "Environment variables have been written to ${VARIABLES_FILE}."
}

# Function to clear variables from the variables.env file
clear_variables() {
    > "${VARIABLES_FILE}"
    echo "Cleared variables.env file."
}

# Main script logic for handling command-line arguments
main() {
    case "$1" in
        start|restart)
            retrieve_variables
            insert_variables
            ;;
        stop)
            clear_variables
            ;;
        *)
            echo "Usage: $0 {start|stop|restart}"
            exit 1
            ;;
    esac
}

# Execute the main function with command-line arguments
main "$@"