# Resources and routines for Census pop estimates ingestion.

# Create a BigQuery dataset for Census pop estimates data.
resource "google_bigquery_dataset" "bq_census_pop_estimates" {
  dataset_id = "census_pop_estimates"
  location   = "US"
}
