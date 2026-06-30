/* [BEGIN] Secret Manager Setup */

# Runtime secrets are stored in Google Cloud Secret Manager so they are encrypted at
# rest and access-audited, instead of living as plain-text Cloud Run environment
# variables (which are visible to anyone with Console access to the revision). The
# secret *values* still originate from GitHub Actions secrets passed in as Terraform
# variables; this only changes where Cloud Run reads them from at runtime — see the
# value_from.secret_key_ref blocks in run.tf.
#
# NOTE: the Secret Manager API (secretmanager.googleapis.com) must be enabled once in
# each target GCP project before deploying. We intentionally do NOT manage API
# enablement in Terraform — consistent with the rest of this config (Cloud Run,
# BigQuery, etc. are all enabled manually) — because the deployer service account
# cannot enable APIs (the Service Usage API is disabled in these projects).

# --- AHR_API_KEY: read by the gcs_to_bq service during America's Health Rankings ingestion ---
resource "google_secret_manager_secret" "ahr_api_key" {
  secret_id = "ahr-api-key"
  project   = var.project_id

  replication {
    auto {}
  }
}

# secret_data_wo is a write-only argument: the value is sent to the Secret Manager
# API but is NEVER persisted to Terraform state (unlike secret_data, which would store
# the plaintext token in the GCS-backed state file). Keeping the tokens out of state is
# the whole point of this migration, so we use the write-only form for all three secrets.
#
# ROTATION: because Terraform cannot read a write-only value, it only pushes a new secret
# version when secret_data_wo_version changes. To rotate a token, update the upstream
# GitHub Actions secret AND bump the matching integer below (e.g. 1 -> 2). Bumping it
# creates a new Secret Manager version whose new version number flows into the Cloud Run
# secret_key_ref (see run.tf) and forces a fresh revision.
resource "google_secret_manager_secret_version" "ahr_api_key" {
  secret                 = google_secret_manager_secret.ahr_api_key.id
  secret_data_wo         = var.ahr_api_key
  secret_data_wo_version = 1
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
}

# Write-only secret data (see rotation note above the ahr_api_key version resource).
resource "google_secret_manager_secret_version" "anthropic_api_key" {
  secret                 = google_secret_manager_secret.anthropic_api_key.id
  secret_data_wo         = var.anthropic_api_key
  secret_data_wo_version = 1
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
}

# Write-only secret data (see rotation note above the ahr_api_key version resource).
resource "google_secret_manager_secret_version" "webflow_api_token" {
  secret                 = google_secret_manager_secret.webflow_api_token.id
  secret_data_wo         = var.webflow_api_token
  secret_data_wo_version = 1
}

resource "google_secret_manager_secret_iam_member" "frontend_webflow_api_token_accessor" {
  secret_id = google_secret_manager_secret.webflow_api_token.secret_id
  project   = var.project_id
  role      = "roles/secretmanager.secretAccessor"
  member    = format("serviceAccount:%s", google_service_account.frontend_runner_identity.email)
}

/* [END] Secret Manager Setup */
