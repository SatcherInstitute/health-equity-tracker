# Resources and routines for handling duplicate data.
variable "project_id" {
  description = "Google Project ID"
  type        = string
}
# Create a BigQuery dataset for dedupe procedures
resource "google_bigquery_dataset" "bq_dedupe" {
  dataset_id = "het_dedupe"
  project    = var.project_id
  location   = "US"
}

resource "google_bigquery_routine" "dedupe_routine" {
  project         = var.project_id
  dataset_id      = google_bigquery_dataset.bq_dedupe.dataset_id
  routine_id      = "dedupe"
  routine_type    = "PROCEDURE"
  language        = "SQL"
  definition_body = file("${path.module}/dedupe.sql")
  arguments {
    name      = "ingest_table"
    data_type = "{\"typeKind\" :  \"STRING\"}"
  }
  arguments {
    name      = "target_table"
    data_type = "{\"typeKind\" :  \"STRING\"}"
  }
  arguments {
    name      = "order_column"
    data_type = "{\"typeKind\" :  \"STRING\"}"
  }
  arguments {
    name      = "latest_flag"
    data_type = "{\"typeKind\" :  \"STRING\"}"
  }
  arguments {
    name      = "unique_columns"
    data_type = "{\"typeKind\" :  \"ARRAY\",\"arrayElementType\" :  {\"typeKind\" :  \"STRING\"}}"
  }
  arguments {
    name      = "measurement_columns"
    data_type = "{\"typeKind\" :  \"ARRAY\",\"arrayElementType\" :  {\"typeKind\" :  \"STRING\"}}"
  }
}
