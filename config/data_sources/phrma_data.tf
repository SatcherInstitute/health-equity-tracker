# Resources and routines for PHRMA Data ingestion.

# Create a BigQuery dataset for PHRMA data.
resource "google_bigquery_dataset" "phrma" {
  dataset_id = "phrma_data"
  location   = "US"
}