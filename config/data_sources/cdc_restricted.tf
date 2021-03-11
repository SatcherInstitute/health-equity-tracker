# Resources and routines for CDC restricted data ingestion.

# Create a BigQuery dataset for CDC restricted data.
resource "google_bigquery_dataset" "bq_cdc_restricted" {
  dataset_id = "cdc_restricted_data"
  location   = "US"
}
