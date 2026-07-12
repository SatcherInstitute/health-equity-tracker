# Exporter

Splits BigQuery query results into per-state JSON files and uploads them to GCS for the data server to serve.

## Commands

```bash
# Run locally (from repo root with venv active)
pip install python/ingestion/ && python exporter/main.py
```

## How it works

Triggered by Cloud Run after `run_gcs_to_bq/` completes. Reads from BigQuery, splits results by state/territory, and writes JSON files to the GCS bucket that `server/` serves.
