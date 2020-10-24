/* [BEGIN] Cloud Run Setup */

# Create a Pub/Sub topic to trigger the ingestion service.
resource "google_pubsub_topic" "upload_to_gcs" {
  name = var.upload_to_gcs_topic_name
}

# Create a Pub/Sub topic to trigger the GCS-to-BQ service.
resource "google_pubsub_topic" "notify_data_ingested" {
  name = var.notify_data_ingested_topic
}

# Push subscription for upload_to_gcs topic that invokes the run service.
resource "google_pubsub_subscription" "ingestion_subscription" {
  name  = var.ingestion_subscription_name
  topic = google_pubsub_topic.upload_to_gcs.name

  ack_deadline_seconds = 60

  push_config {
    # Due to Terraform config language restrictions, index the first status element in a list of one.
    push_endpoint = google_cloud_run_service.ingestion_service.status.0.url
    oidc_token {
      service_account_email = google_service_account.ingestion_invoker_identity.email
    }
  }
}

# Cloud Run service for uploading data to gcs.
resource "google_cloud_run_service" "ingestion_service" {
  name     = var.ingestion_service_name
  location = var.compute_region
  project  = var.project_id

  template {
    spec {
      containers {
        image = format("gcr.io/%s/%s@%s", var.project_id, var.ingestion_image_name, var.ingestion_image_digest)
        env {
          name  = "PROJECT_ID"
          value = var.project_id
        }
        env {
          name  = "NOTIFY_DATA_INGESTED_TOPIC"
          value = var.notify_data_ingested_topic
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

# Push subscription for notify_data_ingested topic that invokes the run service.
resource "google_pubsub_subscription" "notify_data_ingested_subscription" {
  name  = var.notify_data_ingested_subscription_name
  topic = google_pubsub_topic.notify_data_ingested.name

  ack_deadline_seconds = 60

  retry_policy {
    minimum_backoff = "30s"
  }

  push_config {
    # Due to Terraform config language restrictions, index the first status element in a list of one.
    push_endpoint = google_cloud_run_service.gcs_to_bq_service.status.0.url
    oidc_token {
      service_account_email = google_service_account.gcs_to_bq_invoker_identity.email
    }
  }
}

# Cloud Run service for loading GCS buckets into Bigquery.
resource "google_cloud_run_service" "gcs_to_bq_service" {
  name     = var.gcs_to_bq_service_name
  location = var.compute_region
  project  = var.project_id

  template {
    spec {
      containers {
        image = format("gcr.io/%s/%s@%s", var.project_id, var.gcs_to_bq_image_name, var.gcs_to_bq_image_digest)
        env {
          # Name of BQ dataset that we will add the tables to. This currently points to the main BQ dataset.
          name  = "DATASET_NAME"
          value = var.bq_dataset_name
        }

        resources {
          limits = {
            memory = "2G"
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

/* [END] Cloud Run Setup */
