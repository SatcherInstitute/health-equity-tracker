# Resources and routines for BJS Data ingestion.

# Create a BigQuery dataset for BJS data.
resource "google_bigquery_dataset" "bjs" {
  dataset_id = "bjs_data"
  location   = "US"
}
