# Create a BigQuery dataset for cdc covid deaths
resource "google_bigquery_dataset" "health_insurance_dataset" {
  dataset_id = "health_insurance_dataset"
  location   = "US"
}
