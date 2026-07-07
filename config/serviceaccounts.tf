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

# Bucket-scoped role that lets the data server read/write the AI insights cache bucket.
# Kept separate from data_server_runner_role (which is read-only and project-wide) so
# the data server only gains write permission on this specific bucket.
resource "google_project_iam_custom_role" "insights_cache_writer_role" {
  role_id     = var.insights_cache_writer_role_id
  title       = "Insights Cache Writer"
  description = "Allows reading, writing, and deleting objects in the AI insights cache bucket."
  # delete is needed so flagging/re-enabling an insight can remove its stale cached copy.
  permissions = ["storage.objects.create", "storage.objects.delete", "storage.objects.get", "storage.objects.update", "storage.buckets.get"]
}

resource "google_storage_bucket_iam_member" "data_server_insights_cache_binding" {
  bucket = google_storage_bucket.insights_cache_bucket.name
  role   = google_project_iam_custom_role.insights_cache_writer_role.id
  member = format("serviceAccount:%s", google_service_account.data_server_runner_identity.email)
}

# Bucket-scoped role for the flagged-insights bucket. Needs list (to enumerate flags for
# review and negative-example prompts) and delete (to update flag records).
resource "google_project_iam_custom_role" "flagged_insights_writer_role" {
  role_id     = var.flagged_insights_writer_role_id
  title       = "Flagged Insights Writer"
  description = "Allows reading, writing, listing, and deleting objects in the flagged insights bucket."
  permissions = ["storage.objects.create", "storage.objects.delete", "storage.objects.get", "storage.objects.list", "storage.objects.update", "storage.buckets.get"]
}

resource "google_storage_bucket_iam_member" "data_server_flagged_insights_binding" {
  bucket = google_storage_bucket.flagged_insights_bucket.name
  role   = google_project_iam_custom_role.flagged_insights_writer_role.id
  member = format("serviceAccount:%s", google_service_account.data_server_runner_identity.email)
}

# Make the combined server service public
resource "google_cloud_run_service_iam_member" "server_invoker_binding" {
  location = google_cloud_run_service.server_service.location
  project  = google_cloud_run_service.server_service.project
  service  = google_cloud_run_service.server_service.name
  role     = "roles/run.invoker"
  member   = "allUsers"
}

# TEMPORARY (prod cutover): the resources below support the legacy frontend_service +
# data_server_service that run in parallel with server_service until the prod domain
# mapping is repointed. Remove together with the legacy services in run.tf.

# Service account whose identity is used when running the legacy frontend service.
resource "google_service_account" "frontend_runner_identity" {
  # The account id that is used to generate the service account email. Must be 6-30 characters long and
  # match the regex [a-z]([-a-z0-9]*[a-z0-9]).
  account_id = var.frontend_runner_identity_id
}

# Allow the legacy frontend service to make calls to the legacy data server
resource "google_cloud_run_service_iam_member" "data_server_invoker_binding" {
  location = google_cloud_run_service.data_server_service.location
  project  = google_cloud_run_service.data_server_service.project
  service  = google_cloud_run_service.data_server_service.name
  role     = "roles/run.invoker"
  member   = format("serviceAccount:%s", google_service_account.frontend_runner_identity.email)
}

# Make the legacy frontend service public
resource "google_cloud_run_service_iam_member" "frontend_invoker_binding" {
  location = google_cloud_run_service.frontend_service.location
  project  = google_cloud_run_service.frontend_service.project
  service  = google_cloud_run_service.frontend_service.name
  role     = "roles/run.invoker"
  member   = "allUsers"
}

# The secrets themselves are created manually (see secrets.tf), but the accessor grants
# for the Terraform-managed frontend SA are managed here so a fresh apply (test project)
# can bring up the legacy frontend service without a manual IAM step.
resource "google_secret_manager_secret_iam_member" "frontend_runner_anthropic_accessor" {
  project   = var.project_id
  secret_id = "anthropic-api-key"
  role      = "roles/secretmanager.secretAccessor"
  member    = format("serviceAccount:%s", google_service_account.frontend_runner_identity.email)
}

resource "google_secret_manager_secret_iam_member" "frontend_runner_webflow_accessor" {
  project   = var.project_id
  secret_id = "webflow-api-token"
  role      = "roles/secretmanager.secretAccessor"
  member    = format("serviceAccount:%s", google_service_account.frontend_runner_identity.email)
}
