/* [BEGIN] Cloud Run Setup */

# Cloud Run service for uploading data to gcs.
resource "google_cloud_run_service" "ingestion_service" {
  name     = var.ingestion_service_name
  location = var.compute_region
  project  = var.project_id

  template {
    spec {
      timeout_seconds = 600
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
    spec {
      timeout_seconds = 600
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

        resources {
          limits = {
            memory = "8Gi"
            cpu = 4
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

# Cloud Run service that serves data to client frontends.
resource "google_cloud_run_service" "data_server_service" {
  name     = var.data_server_service_name
  location = var.compute_region
  project  = var.project_id

  template {
    spec {
      containers {
        image = format("gcr.io/%s/%s@%s", var.project_id, var.data_server_image_name, var.data_server_image_digest)
        env {
          # GCS bucket from where the data tables are read.
          name  = "GCS_BUCKET"
          value = var.export_bucket
        }

        resources {
          limits = {
            memory = "8Gi"
            cpu = 4
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
    spec {
      containers {
        image = format("gcr.io/%s/%s@%s", var.project_id, var.exporter_image_name, var.exporter_image_digest)
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

# Cloud Run service for running aggregation queries on BQ datasets.
resource "google_cloud_run_service" "aggregator_service" {
  name     = var.aggregator_service_name
  location = var.compute_region
  project  = var.project_id

  template {
    spec {
      containers {
        image = format("gcr.io/%s/%s@%s", var.project_id, var.aggregator_image_name, var.aggregator_image_digest)
        env {
          # GCP project that contains the dataset we are querying.
          name  = "PROJECT_ID"
          value = var.project_id
        }
      }
      service_account_name = google_service_account.aggregator_runner_identity.email
    }
  }

  traffic {
    percent         = 100
    latest_revision = true
  }
  autogenerate_revision_name = true
}

# Cloud Run service that serves the frontend
resource "google_cloud_run_service" "frontend_service" {
  name     = var.frontend_service_name
  location = var.compute_region
  project  = var.project_id

  template {
    spec {
      containers {
        image = format("gcr.io/%s/%s@%s", var.project_id, var.frontend_image_name, var.frontend_image_digest)
        env {
          # URL of the Data Server Cloud Run service.
          name  = "DATA_SERVER_URL"
          value = google_cloud_run_service.data_server_service.status.0.url
        }

        resources {
          limits = {
            memory = "8Gi"
            cpu = 4
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

# Output the URL of the data server and frontend for use in e2e tests.
output "data_server_url" {
  value = google_cloud_run_service.data_server_service.status.0.url
}

output "frontend_url" {
  value = google_cloud_run_service.frontend_service.status.0.url
}

# Output the URLs of the pipeline services for use in Airflow.
output "ingestion_url" {
  value = google_cloud_run_service.ingestion_service.status.0.url
}

output "gcs_to_bq_url" {
  value = google_cloud_run_service.gcs_to_bq_service.status.0.url
}

output "exporter_url" {
  value = google_cloud_run_service.exporter_service.status.0.url
}

output "aggregator_url" {
  value = google_cloud_run_service.aggregator_service.status.0.url
}

/* [END] Cloud Run Setup */
