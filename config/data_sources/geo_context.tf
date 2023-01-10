resource "google_bigquery_dataset" "geo_context" {
  dataset_id = "geo_context"
  location   = "US"
}
