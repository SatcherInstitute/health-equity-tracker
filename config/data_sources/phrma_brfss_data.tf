# Resources and routines for PHRMA Brfss Data ingestion.

# Create a BigQuery dataset for PHRMA Brfss data.
resource "google_bigquery_dataset" "phrma_brfss" {
  dataset_id = "phrma_brfss_data"
  location   = "US"
}
