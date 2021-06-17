# Resources and routines for CDC restricted data ingestion.

# Create a BigQuery dataset for CDC restricted data.
resource "google_bigquery_dataset" "uhc" {
  dataset_id = "uhc_data"
  location   = "US"
}
