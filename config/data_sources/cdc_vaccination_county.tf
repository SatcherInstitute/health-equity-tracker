# Create a BigQuery dataset for cdc vaccination county information
resource "google_bigquery_dataset" "cdc_vaccination_county" {
  dataset_id = "cdc_vaccination_county"
  location   = "US"
}

resource "google_bigquery_routine" "bq_agg_cdc_vaccination_county" {
  dataset_id = google_bigquery_dataset.cdc_vaccination_county.dataset_id
  routine_id = "AGG_cdc_vaccination_county"
  routine_type = "PROCEDURE"
  language = "SQL"
  definition_body = file("${path.module}/AGG_cdc_vaccination_county.sql")
}
