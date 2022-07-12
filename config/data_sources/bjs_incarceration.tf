# Resources and routines for BJS Incarceration Data ingestion.

# Create a BigQuery dataset for BJS Incarceration data.
resource "google_bigquery_dataset" "bjs_incarceration" {
  dataset_id = "bjs_incarceration_data"
  location   = "US"
}
