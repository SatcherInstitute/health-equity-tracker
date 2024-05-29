# Resources and routines for CHR Data ingestion.

# Create a BigQuery dataset for CHR data.
resource "google_bigquery_dataset" "chr" {
  dataset_id = "chr_data"
  location   = "US"
}
