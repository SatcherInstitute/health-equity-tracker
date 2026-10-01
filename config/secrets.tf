/* [BEGIN] Secret Manager Setup */

# Runtime secrets (AHR_API_KEY, GEMINI_API_KEY, WEBFLOW_API_TOKEN) live entirely
# inside Google Cloud Secret Manager. The secret *values* are created and rotated
# MANUALLY (out-of-band) in each target GCP project — they are intentionally NOT
# managed by Terraform and NOT passed through GitHub Actions. This keeps the whole
# secret lifecycle contained in GCP instead of spreading plaintext across GitHub
# secrets, Terraform variables, and Terraform state.
#
# Cloud Run reads these at runtime via value_from.secret_key_ref (see run.tf), always
# pinned to the "latest" version, so rotating a secret in Secret Manager and deploying
# a new revision is all that's required.
#
# --- One-time manual setup per GCP project (test AND prod) ---
# Secret containers and their values are still created manually:
#
#   gcloud secrets create ahr-api-key --replication-policy=automatic --project=$PROJECT_ID
#   printf '%s' "$AHR_API_KEY_VALUE" | gcloud secrets versions add ahr-api-key --data-file=- --project=$PROJECT_ID
#
# IAM bindings (who may read each secret) are managed below by Terraform.
# The import blocks below handle the first-apply migration automatically (TF 1.9+).
#
# The deploy service account (auto-deployer@$PROJECT_ID) must hold
# roles/secretmanager.admin before the first apply that touches these bindings,
# or `terraform apply` fails with 403 secretmanager.secrets.* PERMISSION_DENIED.
# This is a one-time out-of-band bootstrap per project (like creating the secret
# containers above): the SA that RUNS Terraform cannot grant itself the permission
# it needs to run Terraform. Grant once:
#
#   gcloud projects add-iam-policy-binding $PROJECT_ID \
#     --member="serviceAccount:auto-deployer@$PROJECT_ID.iam.gserviceaccount.com" \
#     --role="roles/secretmanager.admin"
#
# (prod lacked this grant and failed the ReleaseV4.048 deploy; test already had it.)
#
# Secrets and their consumers:
#   ahr-api-key           -> gcs_to_bq runner  (America's Health Rankings ingestion)
#   census-api-key        -> gcs_to_bq runner AND ingestion runner  (US Census Bureau ACS API)
#   gemini-api-key        -> data-server-runner SA / Go server  (AI insight generation)
#   webflow-api-token     -> data-server-runner SA / Go server  (CMS blog read access)
#   sentry-auth-token     -> auto-deployer SA (via GitHub Actions build arg, not Secret Manager IAM)
#
# gemini-api-key is issued from a separate GCP project dedicated to the Generative
# Language API, and is API-restricted to that one API. It is server-side only and is
# never shipped to the browser.
#
# Test and prod are issued from DIFFERENT Generative Language projects on purpose.
# Free-tier quota is granted per project per model, so a shared project would let
# internal testing spend the public site's daily allowance. Keep them separate when
# rotating either key.
#
# census-api-key is required for Census Bureau API requests (free registration). It is read
# via os.getenv("CENSUS_API_KEY") by BOTH Cloud Run services, so BOTH runtime service
# accounts need the accessor role in every project (see run.tf): the ingestion runner
# (run_ingestion/main.py) and the gcs_to_bq runner (acs_population.py, acs_condition.py).
# Granting only one of them lets terraform apply succeed in one project and fail in another.

# Import blocks run on first apply to bring existing bindings under Terraform management.
# Idempotent: if the resource is already in state, the block is a no-op on subsequent applies.
# Requires TF 1.9+ (variable interpolation in import id).

import {
  to = google_secret_manager_secret_iam_binding.ahr_api_key_accessor
  id = "projects/${var.project_id}/secrets/ahr-api-key roles/secretmanager.secretAccessor"
}

import {
  to = google_secret_manager_secret_iam_binding.census_api_key_accessor
  id = "projects/${var.project_id}/secrets/census-api-key roles/secretmanager.secretAccessor"
}

import {
  to = google_secret_manager_secret_iam_binding.gemini_api_key_accessor
  id = "projects/${var.project_id}/secrets/gemini-api-key roles/secretmanager.secretAccessor"
}

import {
  to = google_secret_manager_secret_iam_binding.webflow_api_token_accessor
  id = "projects/${var.project_id}/secrets/webflow-api-token roles/secretmanager.secretAccessor"
}

# IAM bindings — _iam_binding is authoritative: it guarantees exactly these members
# have the accessor role and actively corrects out-of-band additions on the next apply.
# This is intentional: catching silent drift is the whole point of this migration.
#
# secret_id is the bare literal (provider resolves it against the provider project).
# We intentionally do NOT use a data "google_secret_manager_secret" lookup: that read
# requires secretmanager.secrets.get at plan time, which failed the prod deploy of
# ReleaseV4.048 when the prod auto-deployer SA lacked it. Managing only the IAM policy
# (getIamPolicy/setIamPolicy) keeps the required permission surface minimal.

resource "google_secret_manager_secret_iam_binding" "ahr_api_key_accessor" {
  secret_id = "ahr-api-key"
  role      = "roles/secretmanager.secretAccessor"
  members = [
    "serviceAccount:${google_service_account.gcs_to_bq_runner_identity.email}",
  ]
}

resource "google_secret_manager_secret_iam_binding" "census_api_key_accessor" {
  secret_id = "census-api-key"
  role      = "roles/secretmanager.secretAccessor"
  members = [
    "serviceAccount:${google_service_account.gcs_to_bq_runner_identity.email}",
    "serviceAccount:${google_service_account.ingestion_runner_identity.email}",
  ]
}

resource "google_secret_manager_secret_iam_binding" "gemini_api_key_accessor" {
  secret_id = "gemini-api-key"
  role      = "roles/secretmanager.secretAccessor"
  members = [
    "serviceAccount:${google_service_account.data_server_runner_identity.email}",
  ]
}

resource "google_secret_manager_secret_iam_binding" "webflow_api_token_accessor" {
  secret_id = "webflow-api-token"
  role      = "roles/secretmanager.secretAccessor"
  members = [
    "serviceAccount:${google_service_account.data_server_runner_identity.email}",
  ]
}

/* [END] Secret Manager Setup */
