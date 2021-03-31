# Create a BigQuery dataset for acs health insurance information
resource "google_bigquery_dataset" "health_insurance_dataset" {
  dataset_id = "health_insurance_dataset"
  location   = "US"
}
