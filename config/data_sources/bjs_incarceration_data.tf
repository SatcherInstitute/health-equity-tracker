# Resources and routines for BJS_INCARCERATION Data ingestion.

# Create a BigQuery dataset for BJS_INCARCERATION data.
resource "google_bigquery_dataset" "bjs_incarceration" {
  dataset_id = "bjs_incarceration_data"
  location   = "US"
}
