variable "include_composer" {
  default = true
}
resource "google_composer_environment" "composer-env" {
  count  = var.include_composer ? 1 : 0
  name   = "data-ingestion-environment"
  region = var.compute_region
}
