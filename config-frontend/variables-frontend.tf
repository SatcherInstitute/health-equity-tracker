# General
variable "project_id" {
  description = "Google Project ID"
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
