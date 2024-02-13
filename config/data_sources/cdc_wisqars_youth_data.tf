# Resources and routines for CDC WISQARS Youth Data ingestion.

# Create a BigQuery dataset for CDC WISQARS Youth data.
resource "google_bigquery_dataset" "cdc_wisqars_youth" {
  dataset_id = "cdc_wisqars_youth_data"
  location   = "US"
}