# Create a BigQuery dataset for acs health insurance information
resource "google_bigquery_dataset" "acs_health_insurance" {
  dataset_id = "acs_health_insurance"
  location   = "US"
}
