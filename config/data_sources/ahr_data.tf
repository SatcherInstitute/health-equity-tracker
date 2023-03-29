# Resources and routines for AHR Data ingestion.

# Create a BigQuery dataset for AHR data.
resource "google_bigquery_dataset" "ahr" {
  dataset_id = "ahr_data"
  location   = "US"
}
