# Resources and routines for Covid Tracking Project ingestion.

# Create a BigQuery dataset for Covid Tracking Project race data
resource "google_bigquery_dataset" "bq_covid_tracking_project" {
  dataset_id = "covid_tracking_project"
  location   = "US"
}

# We need to define the metadata table in Terraform so that we can grant
# access to the gcs_to_bq runner to make queries to it.
resource "google_bigquery_table" "covid_tracking_project_metadata" {
  dataset_id = google_bigquery_dataset.bq_covid_tracking_project.dataset_id
  table_id = var.ctp_metadata_table_name
}

resource "google_bigquery_table_iam_binding" "covid_tracking_project_metadata_iam_binding" {
  project = var.project_id_var
  dataset_id = google_bigquery_dataset.bq_covid_tracking_project.dataset_id
  table_id = google_bigquery_table.covid_tracking_project_metadata.table_id
  role = "roles/bigquery.dataViewer"
  members = [
    format("serviceAccount:%s", var.gcs_to_bq_runner_email),
  ]
}