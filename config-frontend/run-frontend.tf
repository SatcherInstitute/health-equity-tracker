
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

# Output the URL of the data server and frontend for use in e2e tests.
output "data_server_url" {
  value = google_cloud_run_service.data_server_service.status.0.url
}

output "frontend_url" {
  value = google_cloud_run_service.frontend_service.status.0.url
}
