# Resources and routines for Census pop estimates SC ingestion.

# Create a BigQuery dataset for Census pop estimates SC data.
resource "google_bigquery_dataset" "bq_census_pop_estimates_sc" {
  dataset_id = "census_pop_estimates_sc"
  location   = "US"
}
