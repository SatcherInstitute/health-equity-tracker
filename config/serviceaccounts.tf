# Service account whose identity is used when running the ingestion service.
resource "google_service_account" "ingestion_runner_identity" {
  # The account id that is used to generate the service account email. Must be 6-30 characters long and
  # match the regex [a-z]([-a-z0-9]*[a-z0-9]).
  account_id = var.ingestion_runner_identity_id
}

# Give the ingestion runner service account permissions it needs (e.g. GCS bucket access). Add to the permissions list
# here if the ingestion runner needs access to other GCP resources.
resource "google_project_iam_custom_role" "ingestion_runner_role" {
  role_id     = var.ingestion_runner_role_id
  title       = "Ingestion Runner"
  description = "Allows data upload to GCS bucket and pubsub publish to notify completion"
  permissions = ["storage.objects.create", "storage.objects.delete", "storage.objects.get", "storage.objects.list",
  "storage.objects.update", "storage.buckets.get", "pubsub.topics.publish"]
}

resource "google_project_iam_member" "ingestion_runner_binding" {
  project = var.project_id
  role    = google_project_iam_custom_role.ingestion_runner_role.id
  member  = format("serviceAccount:%s", google_service_account.ingestion_runner_identity.email)
}

# Service account whose identity is used when running the GCS-to-BQ service.
resource "google_service_account" "gcs_to_bq_runner_identity" {
  # The account id that is used to generate the service account email. Must be 6-30 characters long and
  # match the regex [a-z]([-a-z0-9]*[a-z0-9]).
  account_id = var.gcs_to_bq_runner_identity_id
}

# Give the GCS-to-BQ runner service account permissions it needs (e.g. GCS bucket access). Add to the permissions list
# here if the GCS-to-BQ runner needs access to other GCP resources.
resource "google_project_iam_custom_role" "gcs_to_bq_runner_role" {
  role_id     = var.gcs_to_bq_runner_role_id
  title       = "GCS-to-BQ Runner"
  description = "Allows reading data from GCS bucket and writing and reading BQ datasets."
  permissions = ["storage.objects.get", "storage.objects.list", "storage.buckets.get",
    "bigquery.datasets.get", "bigquery.tables.create", "bigquery.tables.delete",
    "bigquery.tables.get", "bigquery.tables.getData", "bigquery.tables.list",
    "bigquery.tables.update", "bigquery.tables.updateData", "bigquery.jobs.create"]
}

resource "google_project_iam_member" "gcs_to_bq_runner_binding" {
  project = var.project_id
  role    = google_project_iam_custom_role.gcs_to_bq_runner_role.id
  member  = format("serviceAccount:%s", google_service_account.gcs_to_bq_runner_identity.email)
}

# Service account whose identity is used when running the data server service.
resource "google_service_account" "data_server_runner_identity" {
  # The account id that is used to generate the service account email. Must be 6-30 characters long and
  # match the regex [a-z]([-a-z0-9]*[a-z0-9]).
  account_id = var.data_server_runner_identity_id
}

# Give the data server runner service account permissions it needs (e.g. GCS bucket access). Add to the permissions list
# here if the data server runner needs access to other GCP resources.
resource "google_project_iam_custom_role" "data_server_runner_role" {
  role_id     = var.data_server_runner_role_id
  title       = "Data Server Runner"
  description = "Allows reading data from GCS buckets."
  permissions = ["storage.objects.get", "storage.objects.list", "storage.buckets.get"]
}

resource "google_project_iam_member" "data_server_runner_binding" {
  project = var.project_id
  role    = google_project_iam_custom_role.data_server_runner_role.id
  member  = format("serviceAccount:%s", google_service_account.data_server_runner_identity.email)
}

# Service account whose identity is used when running the exporter service.
resource "google_service_account" "exporter_runner_identity" {
  # The account id that is used to generate the service account email. Must be 6-30 characters long and
  # match the regex [a-z]([-a-z0-9]*[a-z0-9]).
  account_id = var.exporter_runner_identity_id
}

# Give the exporter runner service account permissions it needs (e.g. GCS bucket and BQ access). Add to the permissions list
# here if the exporter runner needs access to other GCP resources.
resource "google_project_iam_custom_role" "exporter_runner_role" {
  role_id     = var.exporter_runner_role_id
  title       = "Exporter Runner"
  description = "Allows reading from BQ and writing to GCS buckets."
  permissions = ["storage.objects.create", "storage.objects.delete", "storage.objects.get", "storage.objects.list",
    "storage.objects.update", "storage.buckets.get", "bigquery.jobs.create", "bigquery.tables.export",
  "bigquery.datasets.get", "bigquery.tables.list", "bigquery.tables.getData", "bigquery.tables.get", "bigquery.readsessions.create", "bigquery.readsessions.getData"]
}

resource "google_project_iam_member" "exporter_runner_binding" {
  project = var.project_id
  role    = google_project_iam_custom_role.exporter_runner_role.id
  member  = format("serviceAccount:%s", google_service_account.exporter_runner_identity.email)
}

# Service account whose identity is used when running the frontend service.
# The frontend service does not currently need a custom role because it doesn't
# require any permissions. If this changes, we will add a new
# google_project_iam_custom_role similar to the other services.
resource "google_service_account" "frontend_runner_identity" {
  # The account id that is used to generate the service account email. Must be 6-30 characters long and
  # match the regex [a-z]([-a-z0-9]*[a-z0-9]).
  account_id = var.frontend_runner_identity_id
}

# Allow the frontend service to make calls to the data server
resource "google_cloud_run_service_iam_member" "data_server_invoker_binding" {
  location = google_cloud_run_service.data_server_service.location
  project  = google_cloud_run_service.data_server_service.project
  service  = google_cloud_run_service.data_server_service.name
  role     = "roles/run.invoker"
  member   = format("serviceAccount:%s", google_service_account.frontend_runner_identity.email)
}

# Make the frontend service public
resource "google_cloud_run_service_iam_member" "frontend_invoker_binding" {
  location = google_cloud_run_service.frontend_service.location
  project = google_cloud_run_service.frontend_service.project
  service = google_cloud_run_service.frontend_service.name
  role = "roles/run.invoker"
  member = "allUsers"
}
