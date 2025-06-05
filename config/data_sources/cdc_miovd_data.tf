# Resources and routines for CDC Mapping Injury, Overdose, and Violence Dashboard ingestion.

# Create a BigQuery dataset for CDC MIOVD data.
resource "google_bigquery_dataset" "cdc_miovd" {
  dataset_id = "cdc_miovd_data"
  location   = "US"
}