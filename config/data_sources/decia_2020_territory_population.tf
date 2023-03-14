# Resources and routines for Census 2020 Decennial Island Areas population ingestion.

# Create a BigQuery dataset for Decennial 2020 population data.
resource "google_bigquery_dataset" "bq_decia_2020_territory_population" {
  dataset_id = "decia_2020_territory_population"
  location   = "US"
}
