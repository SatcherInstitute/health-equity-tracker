# Create a BigQuery dataset for acs health insurance information
resource "google_bigquery_dataset" "acs_condition" {
  dataset_id = "acs_condition"
  location   = "US"
}
