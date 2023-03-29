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

variable "bq_cdc_covid_deaths_dataset_name" {
  description = "BigQuery dataset for CDC covid death data"
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

# Data Server Cloud Run Service Vars
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

# Frontend Cloud Run Service Vars
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
