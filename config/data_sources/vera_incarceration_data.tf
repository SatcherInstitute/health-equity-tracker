# Resources and routines for VERA Incarceration Data ingestion.

# Create a BigQuery dataset for VERA Incarceration data.
resource "google_bigquery_dataset" "vera_incarceration" {
  dataset_id = "vera_incarceration_data"
  location   = "US"
}
