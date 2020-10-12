# General
variable "project_id" {
  description = "Google Project ID"
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

variable "bq_dataset_name" {
  description = "BigQuery Main Dataset"
  type        = string
}

# Pub/Sub topics
variable "upload_to_gcs_topic_name" {
  description = "Name of the Pub/Sub topic used to trigger uploading files to GCS"
  type        = string
}

variable "notify_data_ingested_topic" {
  description = "The name of the topic that gets notified when the data is uploaded to GCS"
  type        = string
}

# Cloud Scheduler vars
variable "household_income_scheduler_name" {
  description = "Name of the Cloud Scheduler job for downloading household income data"
  type        = string
}

variable "state_names_scheduler_name" {
  description = "Name of the Cloud Scheduler job for downloading state name data"
  type        = string
}

variable "county_names_scheduler_name" {
  description = "Name of the Cloud Scheduler job for downloading county name data"
  type        = string
}

variable "county_adjacency_scheduler_name" {
  description = "Name of the Cloud Scheduler job for downloading county adjacency data"
  type        = string
}

variable "population_by_race_scheduler_name" {
  description = "Name of the Cloud Scheduler job for downloading population by race data"
  type        = string
}

variable "primary_care_access_scheduler_name" {
  description   = "Name of the Cloud Scheduler job for downloading primary care access data"
  type          = string
}

# Ingestion Cloud Run Service vars
variable "run_ingestion_service_name" {
  description = "Name of the Cloud Run service for data ingestion"
  type        = string
}

variable "ingestion_image_name" {
  description = "Name of container image for the Cloud Run ingestion service"
  type        = string
}

variable "ingestion_subscription_name" {
  description = "Name of push subscription that invokes the ingestion service"
  type        = string
}

variable "ingestion_invoker_identity_id" {
  description = "Account id of the service account used to trigger data ingestion"
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
variable "run_gcs_to_bq_service_name" {
  description = "Name of the Cloud Run service for loading GCS data into BigQuery"
  type        = string
}

variable "gcs_to_bq_image_name" {
  description = "Name of container image for the Cloud Run GCS-to-BQ service"
  type        = string
}

variable "notify_data_ingested_subscription_name" {
  description = "Name of push subscription that invokes the GCS-to-BQ service"
  type        = string
}

variable "gcs_to_bq_invoker_identity_id" {
  description = "Account id of the service account used to trigger loading from GCS to BQ"
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
