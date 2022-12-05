# Resources and routines for CAWP TIME Data ingestion.

# Create a BigQuery dataset for CAWP TIME data.
resource "google_bigquery_dataset" "cawp_time" {
  dataset_id = "cawp_time_data"
  location   = "US"
}
