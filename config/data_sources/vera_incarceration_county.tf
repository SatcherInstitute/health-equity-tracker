# Resources and routines for VERA Incarceration Data ingestion.

# Create a BigQuery dataset for VERA Incarceration data.
resource "google_bigquery_dataset" "vera_incarceration_county" {
  dataset_id = "vera_incarceration_county"
  location   = "US"
}

