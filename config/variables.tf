# General
variable "project_id" {
  description = "Google Project ID"
  type        = string
}

variable "manual_uploads_project_id" {
  description = "The project ID for manual data uploads"
  type        = string
}

variable "gcp_credentials" {
  description = "Credentials for calling GCP services"
  type        = string
}

variable "compute_region" {
  description = "Region for Compute Resources"
  type        = string
  default     = "us-central1"
}

variable "gcs_region" {
  description = "Region for Google Cloud Storage"
  type        = string
  default     = "US"
}

variable "gcs_landing_bucket" {
  description = "Name of the landing GCS bucket"
  type        = string
}

variable "export_bucket" {
  description = "Name of the bucket where exported BQ tables are stored"
  type        = string
}

variable "gcs_manual_bucket" {
  description = "Name of the GCS bucket for manual data uploads"
  type        = string
}

variable "bq_dataset_name" {
  description = "BigQuery Main Dataset"
  type        = string
}

variable "bq_manual_dataset_name" {
  description = "BigQuery dataset for manual uploads"
  type        = string
}

# Ingestion Cloud Run Service vars
variable "ingestion_service_name" {
  description = "Name of the Cloud Run service for data ingestion"
  type        = string
}

variable "ingestion_image_name" {
  description = "Name of container image for the Cloud Run ingestion service"
  type        = string
}

variable "ingestion_image_digest" {
  description = "Digest of container image for the Cloud Run ingestion service"
  type        = string
}

variable "ingestion_runner_identity_id" {
  description = "Account id of the service account used when running the data ingestion service"
  type        = string
}

variable "ingestion_runner_role_id" {
  description = "Id of custom role given to the ingestion runner service account"
  type        = string
}

# GCS to BQ Cloud Run Service Vars
variable "gcs_to_bq_service_name" {
  description = "Name of the Cloud Run service for loading GCS data into BigQuery"
  type        = string
}

variable "gcs_to_bq_image_name" {
  description = "Name of container image for the Cloud Run GCS-to-BQ service"
  type        = string
}

variable "gcs_to_bq_image_digest" {
  description = "Digest of container image for the Cloud Run GCS-to-BQ service"
  type        = string
}

variable "gcs_to_bq_runner_identity_id" {
  description = "Account id of the service account used when running the GCS-to-BQ service"
  type        = string
}

variable "gcs_to_bq_runner_role_id" {
  description = "Id of custom role given to the gcs_to_bq runner service account"
  type        = string
}

# TEMPORARY (prod cutover): legacy Data Server Cloud Run Service vars — remove with the
# legacy services once the prod domain mapping points at server-service.
variable "data_server_service_name" {
  description = "Name of the Cloud Run service for serving data to client frontends"
  type        = string
}

variable "data_server_image_name" {
  description = "Name of container image for the Cloud Run data server service"
  type        = string
}

variable "data_server_image_digest" {
  description = "Digest of container image for the Cloud Run data server service"
  type        = string
}

# Data Server Service Account Vars (SA reused by the Go server)
variable "data_server_runner_identity_id" {
  description = "Account id of the service account used when running the data server service"
  type        = string
}

variable "data_server_runner_role_id" {
  description = "Id of custom role given to the data server runner service account"
  type        = string
}

# Exporter Cloud Run Service Vars
variable "exporter_service_name" {
  description = "Name of the Cloud Run service for exporting tables from BQ to GCS"
  type        = string
}

variable "exporter_image_name" {
  description = "Name of container image for the Cloud Run exporter service"
  type        = string
}

variable "exporter_image_digest" {
  description = "Digest of container image for the Cloud Run exporter service"
  type        = string
}

variable "exporter_runner_identity_id" {
  description = "Account id of the service account used when running the exporter service"
  type        = string
}

variable "exporter_runner_role_id" {
  description = "Id of custom role given to the exporter runner service account"
  type        = string
}

# TEMPORARY (prod cutover): legacy Frontend Cloud Run Service vars — remove with the
# legacy services once the prod domain mapping points at server-service.
variable "frontend_service_name" {
  description = "Name of the Cloud Run service that serves the frontend"
  type        = string
}

variable "frontend_image_name" {
  description = "Name of container image for the Cloud Run frontend service"
  type        = string
}

variable "frontend_image_digest" {
  description = "Digest of container image for the Cloud Run frontend service"
  type        = string
}

variable "frontend_runner_identity_id" {
  description = "Account id of the service account used when running the frontend service"
  type        = string
}

# Combined Go Server Cloud Run Service Vars
variable "server_service_name" {
  description = "Name of the Cloud Run service that serves the frontend and data APIs"
  type        = string
}

variable "server_image_name" {
  description = "Name of container image for the Go combined server service"
  type        = string
}

variable "server_image_digest" {
  description = "Digest of container image for the Go combined server service"
  type        = string
}

variable "metadata_filename" {
  description = "GCS object name of the metadata NDJSON file"
  type        = string
}

variable "insights_cache_writer_role_id" {
  description = "Role id of the custom IAM role granting read/write access to the AI insights cache bucket"
  type        = string
}

variable "flagged_insights_writer_role_id" {
  description = "Role id of the custom IAM role granting read/write access to the flagged insights bucket"
  type        = string
}

variable "insights_cache_bucket" {
  description = "Name of the GCS bucket for caching AI-generated insights"
  type        = string
}

variable "flagged_insights_bucket" {
  description = "Name of the GCS bucket storing user-flagged insights (no TTL — curated archive)"
  type        = string
}

variable "pr_screenshots_bucket" {
  description = "Name of the GCS bucket for PR screenshot images (public read, team-write, 90-day TTL). Leave empty to skip creation."
  type        = string
  default     = ""
}

variable "pr_screenshots_deployer_sa" {
  description = "Email of the service account used by CI to delete PR screenshot folders on PR close."
  type        = string
  default     = ""
}
