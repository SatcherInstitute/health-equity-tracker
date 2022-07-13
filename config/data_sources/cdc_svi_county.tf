resource "google_bigquery_dataset" "cdc_svi_county" {
  dataset_id = "cdc_svi_county"
  location   = "US"
}
