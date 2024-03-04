# Resources and routines for AHR Data ingestion.

# Create a BigQuery dataset for GraphQL AHR data.
resource "google_bigquery_dataset" "graphql ahr" {
  dataset_id = "graphql_ahr_data"
  location   = "US"
}
