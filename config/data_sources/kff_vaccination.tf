# Create a BigQuery dataset for kff vaccination information
resource "google_bigquery_dataset" "kff_vaccination" {
  dataset_id = "kff_vaccination"
  location   = "US"
}
