/* [BEGIN] Secret Manager Setup */

# Runtime secrets (AHR_API_KEY, ANTHROPIC_API_KEY, WEBFLOW_API_TOKEN) live entirely
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
# For each secret below, create the secret container, add a version with the value,
# and grant the consuming runtime service account the accessor role. Example:
#
#   gcloud secrets create ahr-api-key --replication-policy=automatic --project=$PROJECT_ID
#   printf '%s' "$AHR_API_KEY_VALUE" | gcloud secrets versions add ahr-api-key --data-file=- --project=$PROJECT_ID
#   gcloud secrets add-iam-policy-binding ahr-api-key \
#     --member="serviceAccount:$GCS_TO_BQ_RUNNER_SA" \
#     --role="roles/secretmanager.secretAccessor" --project=$PROJECT_ID
#
# Secrets and their consumers:
#   ahr-api-key        -> gcs_to_bq runner  (America's Health Rankings ingestion)
#   anthropic-api-key  -> data-server-runner SA / Go server  (AI insight generation)
#   webflow-api-token  -> data-server-runner SA / Go server  (CMS blog read access)

/* [END] Secret Manager Setup */
