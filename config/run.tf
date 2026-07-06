/* [BEGIN] Cloud Run Setup */

# Cloud Run service for uploading data to gcs.
resource "google_cloud_run_service" "ingestion_service" {
  name     = var.ingestion_service_name
  location = var.compute_region
  project  = var.project_id

  template {
    metadata {
      annotations = {
        "autoscaling.knative.dev/maxScale" = "10" # Handle parallel DAG steps
      }
    }
    spec {
      timeout_seconds = 60 * 60
      containers {
        image = format("gcr.io/%s/%s@%s", var.project_id, var.ingestion_image_name, var.ingestion_image_digest)

        resources {
          limits = {
            memory = "4G"
          }
        }
      }
      service_account_name = google_service_account.ingestion_runner_identity.email
    }
  }

  traffic {
    percent         = 100
    latest_revision = true
  }
  autogenerate_revision_name = true
}

# Cloud Run service for loading GCS buckets into Bigquery.
resource "google_cloud_run_service" "gcs_to_bq_service" {
  name     = var.gcs_to_bq_service_name
  location = var.compute_region
  project  = var.project_id

  template {
    metadata {
      annotations = {
        "autoscaling.knative.dev/maxScale" = "10" # Handle parallel DAG steps
      }
    }
    spec {
      timeout_seconds = 60 * 60 // timeout at 60 minutes; wasn't finishing ACS CONDITION with only 30 minutes
      containers {
        image = format("gcr.io/%s/%s@%s", var.project_id, var.gcs_to_bq_image_name, var.gcs_to_bq_image_digest)
        env {
          # Name of BQ dataset that we will add the tables to. This currently points to the main BQ dataset.
          name  = "DATASET_NAME"
          value = var.bq_dataset_name
        }
        env {
          # Name of the BQ dataset that will contain manually uploaded data tables.
          name  = "MANUAL_UPLOADS_DATASET"
          value = var.bq_manual_dataset_name
        }
        env {
          name  = "MANUAL_UPLOADS_PROJECT"
          value = var.manual_uploads_project_id
        }
        env {
          name  = "AHR_API_KEY"
          value = var.ahr_api_key
        }

        resources {
          limits = {
            memory = "16Gi"
            cpu    = 4
          }
        }
      }
      service_account_name = google_service_account.gcs_to_bq_runner_identity.email
    }
  }

  traffic {
    percent         = 100
    latest_revision = true
  }
  autogenerate_revision_name = true
}

# Combined Go server: serves the React frontend and all data/AI/news APIs.
resource "google_cloud_run_service" "server_service" {
  name     = var.server_service_name
  location = var.compute_region
  project  = var.project_id

  template {
    metadata {
      annotations = {
        "autoscaling.knative.dev/maxScale" = "50" # User-facing can scale to handle many requests
      }
    }
    spec {
      containers {
        image = format("gcr.io/%s/%s@%s", var.project_id, var.server_image_name, var.server_image_digest)
        env {
          name  = "GCS_BUCKET"
          value = var.export_bucket
        }
        env {
          name  = "METADATA_FILENAME"
          value = var.metadata_filename
        }
        env {
          name  = "INSIGHTS_CACHE_BUCKET"
          value = var.insights_cache_bucket
        }
        env {
          name  = "FLAGGED_INSIGHTS_BUCKET"
          value = var.flagged_insights_bucket
        }
        env {
          name  = "ANTHROPIC_API_KEY"
          value = var.anthropic_api_key
        }
        env {
          name  = "WEBFLOW_API_TOKEN"
          value = var.webflow_api_token
        }
        env {
          name  = "INSIGHT_NEGATIVE_EXAMPLES_ENABLED"
          value = "true"
        }

        resources {
          limits = {
            memory = "512Mi"
            cpu    = 1
          }
        }
      }
      service_account_name = google_service_account.data_server_runner_identity.email
    }
  }

  traffic {
    percent         = 100
    latest_revision = true
  }
  autogenerate_revision_name = true
}

# Cloud Run service for exporting BQ tables to a GCS bucket.
resource "google_cloud_run_service" "exporter_service" {
  name     = var.exporter_service_name
  location = var.compute_region
  project  = var.project_id

  template {
    metadata {
      annotations = {
        "autoscaling.knative.dev/maxScale" = "10" # Handle parallel DAG steps
      }
    }
    spec {
      timeout_seconds = 60 * 45
      containers {
        image = format("gcr.io/%s/%s@%s", var.project_id, var.exporter_image_name, var.exporter_image_digest)

        resources {
          limits = {
            memory = "8Gi"
            cpu    = 4
          }
        }
        env {
          # GCP project that contains the dataset we are exporting from.
          name  = "PROJECT_ID"
          value = var.project_id
        }
        env {
          # GCS bucket to where the tables are exported.
          name  = "EXPORT_BUCKET"
          value = var.export_bucket
        }
      }
      service_account_name = google_service_account.exporter_runner_identity.email
    }
  }

  traffic {
    percent         = 100
    latest_revision = true
  }
  autogenerate_revision_name = true
}


# Domain mapping for the custom domain is managed manually, not via Terraform.
# Cloud Run domain mappings require the caller to have verified domain ownership in Search Console.
# The CI service account does not have that verification, so Terraform apply would fail with
# "Caller is not authorized to administer the domain."
# To create or update the mapping, run as an authorized user:
#   gcloud beta run domain-mappings create --service=server-service \
#     --domain=<domain> --project=<project> --region=us-central1

# Output the URL of the server for use in e2e tests and the buildAllAndDeploy action.
# frontend_url kept for backward compatibility with callers that reference this output.
output "frontend_url" {
  value = google_cloud_run_service.server_service.status.0.url
}

# Output the URLs of the pipeline services (previously used for DAGs)
output "ingestion_url" {
  value = google_cloud_run_service.ingestion_service.status.0.url
}

output "gcs_to_bq_url" {
  value = google_cloud_run_service.gcs_to_bq_service.status.0.url
}

output "exporter_url" {
  value = google_cloud_run_service.exporter_service.status.0.url
}

/* [END] Cloud Run Setup */
