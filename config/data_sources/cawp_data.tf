# Resources and routines for CAWP Data ingestion.

# Create a BigQuery dataset for CAWP data.
resource "google_bigquery_dataset" "cawp" {
  dataset_id = "cawp_data"
  location   = "US"
}

resource "google_bigquery_routine" "bq_agg_cawp" {
  dataset_id = google_bigquery_dataset.cawp.dataset_id
  routine_id = "AGG_cawp"
  routine_type = "PROCEDURE"
  language = "SQL"
  definition_body = file("${path.module}/AGG_cawp.sql")
}
