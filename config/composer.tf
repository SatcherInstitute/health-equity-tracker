resource "google_composer_environment" "composer-env" {
  name   = "data-ingestion-environment"
  region = var.compute_region
}
