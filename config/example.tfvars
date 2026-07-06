# General
project_id                = "$YOUR_PROJECT_ID"
manual_uploads_project_id = "$YOUR_PROJECT_ID"
gcs_landing_bucket        = "$USERNAME-dev-landing-bucket"
gcs_manual_bucket         = "$USERNAME-dev-manual-bucket"
export_bucket             = "$USERNAME-dev-export"
bq_dataset_name           = "msm_dataset"

# This is optional (leaving it out means you credential as yourself)
# gcp_credentials = "$PATH_TO_CREDENTIALS_JSON"

# Ingestion Cloud Run Service vars
ingestion_service_name       = "ingestion-service"
ingestion_image_name         = "ingestion-service"
ingestion_runner_identity_id = "ingestion-runner"
ingestion_runner_role_id     = "ingestion_runner_role2"

# GCS to BQ Cloud Run Service vars
gcs_to_bq_service_name       = "gcs-to-bq-service"
gcs_to_bq_image_name         = "gcs-to-bq-service"
gcs_to_bq_runner_identity_id = "gcs-to-bq-runner"
gcs_to_bq_runner_role_id     = "gcs_to_bq_runner_role2"

# Data server Service Account vars (SA reused by the Go server)
data_server_runner_identity_id = "data-server-runner"
data_server_runner_role_id     = "data_server_runner_role"

# Exporter Cloud Run vars
exporter_service_name       = "exporter-service"
exporter_image_name         = "exporter-service"
exporter_runner_identity_id = "exporter-runner"
exporter_runner_role_id     = "exporter_runner_role"

# Combined Go server Cloud Run vars
server_service_name = "server-service"
server_image_name   = "server"
metadata_filename   = "all_metadata.ndjson"

# Custom IAM role granting read/write on the AI insights cache bucket (bound to the data server SA).
insights_cache_writer_role_id = "insights_cache_writer_role"

# Bucket storing user-flagged insights (curated archive, no TTL) and its writer role.
flagged_insights_bucket         = "$USERNAME-flagged-insights"
flagged_insights_writer_role_id = "flagged_insights_writer_role"
