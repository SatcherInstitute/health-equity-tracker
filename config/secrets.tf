/* [BEGIN] Secret Manager Setup */

# Runtime secrets are stored in Google Cloud Secret Manager so they are encrypted at
# rest and access-audited, instead of living as plain-text Cloud Run environment
# variables (which are visible to anyone with Console access to the revision). The
# secret *values* still originate from GitHub Actions secrets passed in as Terraform
# variables; this only changes where Cloud Run reads them from at runtime — see the
# value_from.secret_key_ref blocks in run.tf.

# disable_on_destroy = false so tearing down infra-test (runDestroyInfraTest.yml) does
# not disable the API for any other resources in the project.
resource "google_project_service" "secret_manager" {
  project            = var.project_id
  service            = "secretmanager.googleapis.com"
  disable_on_destroy = false
}

# --- AHR_API_KEY: read by the gcs_to_bq service during America's Health Rankings ingestion ---
resource "google_secret_manager_secret" "ahr_api_key" {
  secret_id = "ahr-api-key"
  project   = var.project_id

  replication {
    auto {}
  }

  depends_on = [google_project_service.secret_manager]
}

resource "google_secret_manager_secret_version" "ahr_api_key" {
  secret      = google_secret_manager_secret.ahr_api_key.id
  secret_data = var.ahr_api_key
}

resource "google_secret_manager_secret_iam_member" "gcs_to_bq_ahr_api_key_accessor" {
  secret_id = google_secret_manager_secret.ahr_api_key.secret_id
  project   = var.project_id
  role      = "roles/secretmanager.secretAccessor"
  member    = format("serviceAccount:%s", google_service_account.gcs_to_bq_runner_identity.email)
}

# --- ANTHROPIC_API_KEY: read by the frontend service for AI insight generation ---
resource "google_secret_manager_secret" "anthropic_api_key" {
  secret_id = "anthropic-api-key"
  project   = var.project_id

  replication {
    auto {}
  }

  depends_on = [google_project_service.secret_manager]
}

resource "google_secret_manager_secret_version" "anthropic_api_key" {
  secret      = google_secret_manager_secret.anthropic_api_key.id
  secret_data = var.anthropic_api_key
}

resource "google_secret_manager_secret_iam_member" "frontend_anthropic_api_key_accessor" {
  secret_id = google_secret_manager_secret.anthropic_api_key.secret_id
  project   = var.project_id
  role      = "roles/secretmanager.secretAccessor"
  member    = format("serviceAccount:%s", google_service_account.frontend_runner_identity.email)
}

# --- WEBFLOW_API_TOKEN: read by the frontend service for CMS blog read access ---
resource "google_secret_manager_secret" "webflow_api_token" {
  secret_id = "webflow-api-token"
  project   = var.project_id

  replication {
    auto {}
  }

  depends_on = [google_project_service.secret_manager]
}

resource "google_secret_manager_secret_version" "webflow_api_token" {
  secret      = google_secret_manager_secret.webflow_api_token.id
  secret_data = var.webflow_api_token
}

resource "google_secret_manager_secret_iam_member" "frontend_webflow_api_token_accessor" {
  secret_id = google_secret_manager_secret.webflow_api_token.secret_id
  project   = var.project_id
  role      = "roles/secretmanager.secretAccessor"
  member    = format("serviceAccount:%s", google_service_account.frontend_runner_identity.email)
}

/* [END] Secret Manager Setup */
