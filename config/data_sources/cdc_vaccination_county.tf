# Create a BigQuery dataset for cdc vaccination county information
resource "google_bigquery_dataset" "cdc_vaccination_county" {
  dataset_id = "cdc_vaccination_county"
  location   = "US"
}
