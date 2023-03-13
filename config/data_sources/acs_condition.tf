# Create a BigQuery dataset for acs condition information
resource "google_bigquery_dataset" "acs_condition" {
  dataset_id = "acs_condition"
  location   = "US"
}
