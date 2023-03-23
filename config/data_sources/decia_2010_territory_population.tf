# Resources and routines for ACS population ingestion.

# Create a BigQuery dataset for ACS population data.
resource "google_bigquery_dataset" "bq_decia_2010_territory_population" {
  dataset_id = "decia_2010_territory_population"
  location   = "US"
}
