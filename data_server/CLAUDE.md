# Data Server

Python Flask server that responds to data requests by serving pre-exported JSON files from GCS.

## Commands

```bash
# Run locally (from repo root with venv active)
pip install python/data_server/ && python data_server/main.py
```

## How it works

Reads JSON files from a GCS bucket (or local `frontend/public/tmp/` during development). Each endpoint maps to a file exported by the `exporter/` service. The frontend sets `VITE_BASE_API_URL` to point at whichever data server environment to use.
