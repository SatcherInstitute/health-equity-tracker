# Resources and routines for Covid Tracking Project ingestion.

# Create a BigQuery dataset for Covid Tracking Project race data
resource "google_bigquery_dataset" "bq_covid_tracking_project" {
  dataset_id = "covid_tracking_project"
  location   = "US"
}
