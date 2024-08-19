variable "include_composer" {
  default = true
}

resource "google_composer_environment" "composer-env" {
  count  = var.include_composer ? 1 : 0
  name   = "data-ingestion-environment"
  region = var.compute_region

  config {
    software_config {
      image_version = "composer-3-airflow-2.9.1"
    }

  }

  # TODO: upgrade terraform locally to suppress this warning
  storage_config {
    # Generate a stable bucket name based on the project ID
    bucket = "us-central1-data-ingestion-bucket-${var.project_id}"
  }
}
