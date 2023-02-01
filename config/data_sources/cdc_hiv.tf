resource "google_bigquery_dataset" "cdc_hiv" {
  dataset_id = "cdc_hiv"
  location   = "US"
}
