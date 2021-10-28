# Create a BigQuery dataset for cdc vaccination national information
resource "google_bigquery_dataset" "cdc_vaccination_national" {
  dataset_id = "cdc_vaccination_national"
  location   = "US"
}
