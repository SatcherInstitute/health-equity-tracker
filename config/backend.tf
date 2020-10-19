terraform {
  backend "gcs" {
    bucket  = var.remote_backend_bucket
    prefix  = "state"
  }
}