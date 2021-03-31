# Create a BigQuery dataset for acs_household_income_dataset
resource "google_bigquery_dataset" "acs_household_income_dataset" {
  dataset_id = "acs_household_income_dataset"
  location   = "US"
}
