# Resources and routines for CDC HIV Data ingestion.

# Create a BigQuery dataset for CDC HIV data.
resource "google_bigquery_dataset" "cdc_hiv" {
  dataset_id = "cdc_hiv_data"
  location   = "US"
}