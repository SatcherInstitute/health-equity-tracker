# Resources and routines for CDC HIV Data ingestion.

# Create a BigQuery dataset for CDC HIV data.
resource "google_bigquery_dataset" "cdc_wisqars" {
  dataset_id = "cdc_wisqars_data"
  location   = "US"
}