# Resources and routines for ACS population ingestion.

# Create a BigQuery dataset for ACS population data.
resource "google_bigquery_dataset" "bq_acs_population" {
  dataset_id = "acs_population"
  location   = "US"
}

resource "google_bigquery_routine" "bq_agg_acs_population" {
  dataset_id = google_bigquery_dataset.bq_acs_population.dataset_id
  routine_id = "AGG_acs_population"
  routine_type = "PROCEDURE"
  language = "SQL"
  definition_body = file("${path.module}/AGG_acs_population.sql")
}
