# Resources and routines for CDC restricted data ingestion.

# Create a BigQuery dataset for CDC restricted data.
resource "google_bigquery_dataset" "bq_cdc_restricted" {
  dataset_id = "cdc_restricted_data"
  location   = "US"
}

resource "google_bigquery_routine" "bq_agg_cdc_restricted" {
  dataset_id = google_bigquery_dataset.bq_cdc_restricted.dataset_id
  routine_id = "AGG_cdc_restricted"
  routine_type = "PROCEDURE"
  language = "SQL"
  definition_body = file("${path.module}/AGG_cdc_restricted.sql")
}
