# Specify the provider, here
provider "google" {
  project     = var.project_id
  region      = var.compute_region
  credentials = var.gcp_credentials
}
