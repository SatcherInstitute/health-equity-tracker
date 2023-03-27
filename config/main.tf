# Specify the provider, here
provider "google" {
  project     = var.project_id
  region      = var.compute_region
  credentials = var.gcp_credentials
}

# Import data sources config
module "data_sources" {
  source                  = "./data_sources"
  gcs_to_bq_runner_email  = google_service_account.gcs_to_bq_runner_identity.email
  project_id_var          = var.project_id
}

/* [BEGIN] GCS Resources */

# Raw data landing zone for data ingestion
resource "google_storage_bucket" "gcs_data_ingestion_landing_bucket" {
  name          = var.gcs_landing_bucket
  location      = var.gcs_region
  force_destroy = true # This forces deletion of objects created in bucket post provisioning
  # https://www.terraform.io/docs/providers/google/r/storage_bucket.html#force_destroy
}

resource "google_storage_bucket" "gcs_export_bucket" {
  name     = var.export_bucket
  location = var.gcs_region
}

# Landing zone for manual data ingestion
resource "google_storage_bucket" "gcs_manual_ingestion_landing_bucket" {
  name     = var.gcs_manual_bucket
  location = var.gcs_region
}

/* [END] GCS Resources */


/* [BEGIN] BigQuery Setup */

# Create a BigQuery dataset
resource "google_bigquery_dataset" "bq_dataset" {
  dataset_id = var.bq_dataset_name
  location   = "US"
}

# Create a BigQuery dataset for manually uploaded data
resource "google_bigquery_dataset" "bq_manual_dataset" {
  dataset_id = var.bq_manual_dataset_name
  location   = "US"
}

# Create a BigQuery dataset for cdc covid deaths
resource "google_bigquery_dataset" "bq_cdc_covid_deaths_dataset" {
  dataset_id = var.bq_cdc_covid_deaths_dataset_name
  location   = "US"
}

/* [END] BigQuery Setup */
