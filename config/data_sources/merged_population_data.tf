# Resources and routines for a merged population table

# Create a BigQuery dataset for ACS population data.
resource "google_bigquery_dataset" "merged_population_data" {
  dataset_id = "merged_population_data"
  location   = "US"
}
