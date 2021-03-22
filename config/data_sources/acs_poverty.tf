# Create a BigQuery dataset for acs poverty information
resource "google_bigquery_dataset" "acs_poverty_dataset" {
  dataset_id = "acs_poverty_dataset"
  location   = "US"
}
