# Resources and routines for CDC WISQARS Black Men Data ingestion.

# Create a BigQuery dataset for CDC WISQARS Black Men data.
resource "google_bigquery_dataset" "cdc_wisqars_black_men" {
  dataset_id = "cdc_wisqars_black_men_data"
  location   = "US"
}
