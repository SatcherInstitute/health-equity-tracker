# Exporter

Splits BigQuery query results into per-state JSON files and uploads them to GCS for the data server to serve.

## Commands

```bash
# Run locally (from repo root with venv active)
pip install python/ingestion/ && python exporter/main.py
```

## How it works

Triggered by Cloud Run after `run_gcs_to_bq/` completes. Reads from BigQuery, splits results by state/territory, and writes JSON files to the GCS bucket that `server/` serves.

## GCS file naming

Output files follow the pattern `{dataset_name}-{table_id}.json`, e.g. `acs_population-race_state_current.json`. County-level tables are also split by state FIPS: `acs_population-race_county_current-06.json`.

The `demographic=multi` export path (cross-stratified tables) was removed — those BigQuery tables are consumed internally by the pipeline and are not exported to GCS.
