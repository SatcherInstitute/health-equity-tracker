# Specify the provider, here
provider "google" {
  project     = var.project_id
  region      = var.compute_region
  credentials = var.gcp_credentials
}


/* [BEGIN] GCS Resources */

# Raw data landing zone for data ingestion
resource "google_storage_bucket" "gcs_data_ingestion_landing_bucket" {
  name          = var.gcs_landing_bucket
  location      = var.gcs_region
  force_destroy = true # This forces deletion of objects created in bucket post provisioning
  # https://www.terraform.io/docs/providers/google/r/storage_bucket.html#force_destroy
}

/* [END] GCS Resources */


/* [BEGIN] BigQuery Setup */

# Create a BigQuery dataset
resource "google_bigquery_dataset" "bq_dataset" {
  dataset_id = var.bq_dataset_name
  location   = "US"
}

/* [END] BigQuery Setup */
