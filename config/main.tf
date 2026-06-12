# Specify the provider, here
provider "google" {
  project     = var.project_id
  region      = var.compute_region
  credentials = var.gcp_credentials
}

# Import data sources config
module "data_sources" {
  source                 = "./data_sources"
  gcs_to_bq_runner_email = google_service_account.gcs_to_bq_runner_identity.email
  project_id_var         = var.project_id
}

/* [BEGIN] GCS Resources */

# Raw data landing zone for data ingestion
resource "google_storage_bucket" "gcs_data_ingestion_landing_bucket" {
  name          = var.gcs_landing_bucket
  location      = var.gcs_region
  force_destroy = true # This forces deletion of objects created in bucket post provisioning
  # https://www.terraform.io/docs/providers/google/r/storage_bucket.html#force_destroy
}

resource "google_storage_bucket" "gcs_export_bucket" {
  name     = var.export_bucket
  location = var.gcs_region
}

# Landing zone for manual data ingestion
resource "google_storage_bucket" "gcs_manual_ingestion_landing_bucket" {
  name     = var.gcs_manual_bucket
  location = var.gcs_region
}

# Bucket for caching AI-generated insights (used by the frontend server)
resource "google_storage_bucket" "insights_cache_bucket" {
  name     = var.insights_cache_bucket
  location = var.gcs_region

  lifecycle_rule {
    condition {
      age = 210 # Delete cached entries older than 7 months (TTL is 6 months)
    }
    action {
      type = "Delete"
    }
  }
}

# Bucket for user-flagged insights. Intentionally has NO delete lifecycle rule — this is a
# curated archive the team reviews periodically, kept separate from the cache (which can be
# regenerated at any time and is subject to a delete lifecycle rule).
resource "google_storage_bucket" "flagged_insights_bucket" {
  name     = var.flagged_insights_bucket
  location = var.gcs_region

  # Manage access exclusively via IAM (no legacy object ACLs) so this sensitive,
  # user-flagged content can't be accidentally exposed through a stray ACL.
  uniform_bucket_level_access = true
}

# Public bucket for PR screenshot images uploaded by the /screenshot-pr Claude Code skill.
# Write access is restricted to msm.edu domain accounts (objectCreator) and the CI deployer SA
# (objectAdmin for cleanup). allUsers gets objectViewer only — public read, no public write.
resource "google_storage_bucket" "pr_screenshots_bucket" {
  count                       = var.pr_screenshots_bucket != "" ? 1 : 0
  name                        = var.pr_screenshots_bucket
  location                    = var.gcs_region
  uniform_bucket_level_access = true

  lifecycle_rule {
    condition {
      age = 90
    }
    action {
      type = "Delete"
    }
  }
}

resource "google_storage_bucket_iam_member" "pr_screenshots_public_read" {
  count  = var.pr_screenshots_bucket != "" ? 1 : 0
  bucket = google_storage_bucket.pr_screenshots_bucket[0].name
  role   = "roles/storage.objectViewer"
  member = "allUsers"
}

resource "google_storage_bucket_iam_member" "pr_screenshots_team_write" {
  count  = var.pr_screenshots_bucket != "" ? 1 : 0
  bucket = google_storage_bucket.pr_screenshots_bucket[0].name
  role   = "roles/storage.objectAdmin"
  member = "domain:msm.edu"
}

resource "google_storage_bucket_iam_member" "pr_screenshots_deployer_admin" {
  count  = var.pr_screenshots_bucket != "" && var.pr_screenshots_deployer_sa != "" ? 1 : 0
  bucket = google_storage_bucket.pr_screenshots_bucket[0].name
  role   = "roles/storage.objectAdmin"
  member = "serviceAccount:${var.pr_screenshots_deployer_sa}"
}

/* [END] GCS Resources */


/* [BEGIN] BigQuery Setup */

# Create a BigQuery dataset
resource "google_bigquery_dataset" "bq_dataset" {
  dataset_id = var.bq_dataset_name
  location   = "US"
}

# Create a BigQuery dataset for manually uploaded data
resource "google_bigquery_dataset" "bq_manual_dataset" {
  dataset_id = var.bq_manual_dataset_name
  location   = "US"
}


/* [END] BigQuery Setup */
