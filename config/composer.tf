variable "include_composer" {
  default = true
}

resource "google_composer_environment" "composer-env" {
  count  = var.include_composer ? 1 : 0
  name   = "data-ingestion-environment"
  region = var.compute_region

  storage_config {
    # Generate a stable bucket name based on the project ID
    bucket = "us-central1-data-ingestion-bucket-${var.project_id}"
  }
}
