# Create a BigQuery dataset for kff vaccination information
resource "google_bigquery_dataset" "kff_vaccination" {
  dataset_id = "kff_vaccination"
  location   = "US"
}

resource "google_bigquery_routine" "bq_agg_kff_vaccination" {
  dataset_id = google_bigquery_dataset.kff_vaccination.dataset_id
  routine_id = "AGG_kff_vaccination"
  routine_type = "PROCEDURE"
  language = "SQL"
  definition_body = file("${path.module}/AGG_kff_vaccination.sql")
}
