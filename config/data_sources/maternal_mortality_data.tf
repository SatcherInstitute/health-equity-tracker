# Resources and routines for MATERNAL MORTALITY Data ingestion.

# Create a BigQuery dataset for MATERNAL MORTALITY data.
resource "google_bigquery_dataset" "maternal_mortality" {
  dataset_id = "maternal_mortality_data"
  location   = "US"
}