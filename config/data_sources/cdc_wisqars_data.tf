# Resources and routines for CDC WISQARS Data ingestion.

# Create a BigQuery dataset for CDC WISQARS data.
resource "google_bigquery_dataset" "cdc_wisqars" {
  dataset_id = "cdc_wisqars_data"
  location   = "US"
}