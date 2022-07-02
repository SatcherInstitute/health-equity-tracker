# Resources and routines for CAWP Data ingestion.

# Create a BigQuery dataset for CAWP data.
resource "google_bigquery_dataset" "cawp" {
  dataset_id = "cawp_data"
  location   = "US"
}
