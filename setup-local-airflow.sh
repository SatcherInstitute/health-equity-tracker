#!/bin/bash

# Set variables
IMAGE_VERSION="composer-2.8.7-airflow-2.7.3"
LOCAL_ENV_NAME="local-data-ingestion-environment"
PROJECT_ID=$(gcloud config get-value project)
LOCATION="us-central1"
DAG_PATH="../airflow/dags"
PORT="8080"

echo "Authenticating with Google Cloud..."
gcloud auth application-default login
gcloud auth login

echo "Installing Composer Local Development CLI tool..."
if ! command -v composer-dev &> /dev/null; then
    git clone https://github.com/GoogleCloudPlatform/composer-local-dev.git
    cd composer-local-dev || exit
    pip install .
    cd ..
else
    echo "Composer Local Development CLI tool already installed."
fi

echo "Checking if the local Airflow environment '$LOCAL_ENV_NAME' exists..."
if composer-dev list 2>/dev/null | grep -q "$LOCAL_ENV_NAME"; then
    echo "Local Airflow environment '$LOCAL_ENV_NAME' already exists."
else
    echo "Creating local Airflow environment '$LOCAL_ENV_NAME'..."
    cd composer-local-dev || exit
    composer-dev create \
        --from-image-version "$IMAGE_VERSION" \
        --project "$PROJECT_ID" \
        --port "$PORT" \
        --dags-path "$DAG_PATH" \
        "$LOCAL_ENV_NAME"
    echo "Local Airflow environment setup complete!"
fi

echo "Updating environment variables..."
ENV_FILE="composer/$LOCAL_ENV_NAME/variables.env"
if [ -f "$ENV_FILE" ]; then
    echo "Writing variables to variables.env..."
    ingestion_url=$(gcloud run services list --platform managed --filter ingestion-service --format 'value(status.url)')
    gcs_to_bq_url=$(gcloud run services list --platform managed --filter gcs-to-bq-service --format 'value(status.url)')
    exporter_url=$(gcloud run services list --platform managed --filter exporter-service --format 'value(status.url)')
    landing_bucket=$(gsutil ls | grep -o ".*landing.*" | cut -d "/" -f 3)
    manual_bucket=$(gsutil ls | grep -o ".*manual.*" | cut -d "/" -f 3)
        
        cat <<EOT > "${ENV_FILE}"
AIRFLOW_VAR_INGEST_TO_GCS_SERVICE_ENDPOINT=${ingestion_url}
AIRFLOW_VAR_GCS_TO_BQ_SERVICE_ENDPOINT=${gcs_to_bq_url}
AIRFLOW_VAR_EXPORTER_SERVICE_ENDPOINT=${exporter_url}
AIRFLOW_VAR_GCS_LANDING_BUCKET=${landing_bucket}
AIRFLOW_VAR_GCS_MANUAL_UPLOADS_BUCKET=${manual_bucket}
ENV=local
EOT

else
    echo "Environment file '$ENV_FILE' not found!"
    exit 1
fi
