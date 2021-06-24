# Resources and routines for UHC Data ingestion.

# Create a BigQuery dataset for UHC data.
resource "google_bigquery_dataset" "uhc" {
  dataset_id = "uhc_data"
  location   = "US"
}
