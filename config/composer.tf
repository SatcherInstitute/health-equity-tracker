variable "include_composer" {
  default = true
}

resource "google_composer_environment_v3" "composer-env" {
  count  = var.include_composer ? 1 : 0
  name   = "data-ingestion-environment"
  region = var.compute_region

  environment_config {
    software_config {
      image_version = "composer-3-airflow-2.9.1"
    }
    storage_config {
      # Generate a stable bucket name based on the project ID
      bucket = "us-central1-data-ingestion-bucket-${var.project_id}"
    }
    node_config {
      service_account = "test-auto-deployer@het-infra-test-05.iam.gserviceaccount.com"
    }
  }
}
