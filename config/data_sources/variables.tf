# Variables for the data_sources module should be defined in this file.

# Covid Tracking Project vars
variable "project_id_var" {
  description = "Project ID of the Google Cloud Project"
}

variable "gcs_to_bq_runner_email" {
  description = "Email of the GCS to BQ runner service account, used to grant access to the Covid Tracking Project metadata table"
}
