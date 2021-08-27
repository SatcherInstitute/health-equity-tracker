# Resources and routines for UHC Data ingestion.

# Create a BigQuery dataset for UHC data.
resource "google_bigquery_dataset" "uhc" {
  dataset_id = "uhc_data"
  location   = "US"
}

resource "google_bigquery_routine" "bq_agg_uhc" {
  dataset_id = google_bigquery_dataset.uhc.dataset_id
  routine_id = "AGG_uhc"
  routine_type = "PROCEDURE"
  language = "SQL"
  definition_body = file("${path.module}/AGG_uhc.sql")
}
