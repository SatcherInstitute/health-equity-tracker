# Resources and routines for NCI Cancer ingestion.

# Create a BigQuery dataset for NCI Cancer data.
resource "google_bigquery_dataset" "nci_cancer" {
  dataset_id = "nci_cancer"
  location   = "US"
}