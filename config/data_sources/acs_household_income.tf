# Create a BigQuery dataset for acs_household_income
resource "google_bigquery_dataset" "acs_household_income" {
  dataset_id = "acs_household_income"
  location   = "US"
}
