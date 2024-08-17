variable "include_composer" {
  default = true
}
resource "google_composer_environment" "composer_env" {
  name   = "data-ingestion-environment"
  region = "us-central1"

  config {
    software_config {
      image_version = "composer-3-airflow-2.9.1"
    }

  }
}
