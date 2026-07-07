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
          name = "AHR_API_KEY"
          value_from {
            secret_key_ref {
              # Secret is created/rotated manually in Secret Manager (see secrets.tf).
              name = "ahr-api-key"
              key  = "latest"
            }
          }
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

# TEMPORARY (prod cutover): the legacy data_server_service and frontend_service below
# run in parallel with the new server_service so the prod domain mapping can be
# repointed to server-service with zero downtime and an instant rollback path.
# Remove both legacy services (and their SA/bindings/vars/image builds) once the
# prod cutover is verified.
resource "google_cloud_run_service" "data_server_service" {
  name     = var.data_server_service_name
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
        image = format("gcr.io/%s/%s@%s", var.project_id, var.data_server_image_name, var.data_server_image_digest)
        env {
          # GCS bucket from where the data tables are read.
          name  = "GCS_BUCKET"
          value = var.export_bucket
        }
        env {
          # GCS bucket for the AI insights cache (read/write).
          name  = "INSIGHTS_CACHE_BUCKET"
          value = var.insights_cache_bucket
        }
        env {
          # GCS bucket for user-flagged insights (read/write/list).
          name  = "FLAGGED_INSIGHTS_BUCKET"
          value = var.flagged_insights_bucket
        }

        resources {
          limits = {
            memory = "8Gi"
            cpu    = 4
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

# TEMPORARY (prod cutover): see comment on data_server_service above.
resource "google_cloud_run_service" "frontend_service" {
  name     = var.frontend_service_name
  location = var.compute_region
  project  = var.project_id

  # The secret accessor grants must exist before Cloud Run validates the
  # revision's secret references at deploy time.
  depends_on = [
    google_secret_manager_secret_iam_member.frontend_runner_anthropic_accessor,
    google_secret_manager_secret_iam_member.frontend_runner_webflow_accessor,
  ]

  template {
    metadata {
      annotations = {
        "autoscaling.knative.dev/maxScale" = "50" # User-facing can scale to handle many requests
      }
    }
    spec {
      containers {
        image = format("gcr.io/%s/%s@%s", var.project_id, var.frontend_image_name, var.frontend_image_digest)
        env {
          # URL of the Data Server Cloud Run service.
          name  = "DATA_SERVER_URL"
          value = google_cloud_run_service.data_server_service.status.0.url
        }
        env {
          name = "ANTHROPIC_API_KEY"
          value_from {
            secret_key_ref {
              # Secret is created/rotated manually in Secret Manager (see secrets.tf).
              name = "anthropic-api-key"
              key  = "latest"
            }
          }
        }
        env {
          name = "WEBFLOW_API_TOKEN"
          value_from {
            secret_key_ref {
              # Secret is created/rotated manually in Secret Manager (see secrets.tf).
              name = "webflow-api-token"
              key  = "latest"
            }
          }
        }
        env {
          # Feeds flagged insights back into the generation prompt as negative examples
          # so regenerated insights steer away from previously flagged content.
          name  = "INSIGHT_NEGATIVE_EXAMPLES_ENABLED"
          value = "true"
        }

        resources {
          limits = {
            memory = "8Gi"
            cpu    = 4
          }
        }

      }
      service_account_name = google_service_account.frontend_runner_identity.email
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
          name = "ANTHROPIC_API_KEY"
          value_from {
            secret_key_ref {
              # Secret is created/rotated manually in Secret Manager (see secrets.tf).
              name = "anthropic-api-key"
              key  = "latest"
            }
          }
        }
        env {
          name = "WEBFLOW_API_TOKEN"
          value_from {
            secret_key_ref {
              # Secret is created/rotated manually in Secret Manager (see secrets.tf).
              name = "webflow-api-token"
              key  = "latest"
            }
          }
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
