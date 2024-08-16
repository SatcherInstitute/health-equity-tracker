# variable "include_composer" {
#   default = true
# }

# resource "google_composer_environment" "composer-env" {
#   count  = var.include_composer ? 1 : 0
#   name   = "data-ingestion-environment"
#   region = var.compute_region

#   storage_config {
#     # Generate a stable bucket name based on the project ID
#     bucket = "us-central1-data-ingestion-bucket-${var.project_id}"
#   }
# }

variable "include_composer" {
  default = true
}

resource "google_composer_environment_v3" "composer-env" {
  count              = var.include_composer ? 1 : 0
  name               = "data-ingestion-environment"
  region             = var.compute_region

  environment_config {
    image_version = "composer-3.0.0-airflow-2.4.4"
  }

  storage_config {
    # Generate a stable bucket name based on the project ID
    bucket = "us-central1-data-ingestion-bucket-${var.project_id}"
  }
}