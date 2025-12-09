# Resources and routines for CDC HIV Black Women Data ingestion.

# Create a BigQuery dataset for CDC HIV Black Women data.
resource "google_bigquery_dataset" "cdc_hiv_black_women" {
  dataset_id = "cdc_hiv_black_women_data"
  location   = "US"
}