

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
  project  = google_cloud_run_service.frontend_service.project
  service  = google_cloud_run_service.frontend_service.name
  role     = "roles/run.invoker"
  member   = "allUsers"
}
