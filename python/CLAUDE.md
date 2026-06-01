# Python Data Pipeline

Shared modules for data ingestion, transformation, and loading to BigQuery.

## Commands

```bash
# From repo root with venv active
source .venv/bin/activate
pip install python/data_server/ python/datasources/ python/ingestion/ && pytest python/tests/

# Single datasource test
pip install python/datasources/ && pytest python/tests/datasources/test_cdc_hiv.py -s
```

## Structure

```
datasources/   DataSource subclasses — one per data source (e.g. CdcHiv, Phrma)
ingestion/     Shared utilities: gcs_to_bq_util.py, het_types.py, BQ/GCS helpers
tests/         Integration tests — many load real fixture CSVs from repo-root data/
```

## Adding a new data source

1. Create `python/datasources/<source>.py` extending `DataSource`, implement `write_to_bq()`
2. Register in `python/datasources/data_sources.py`
3. Add DAG workflow `.github/workflows/dag<Source>.yml`

## Key files

| Purpose | Path |
|---|---|
| DataSource base class | `datasources/data_source.py` |
| BigQuery/GCS utilities | `ingestion/gcs_to_bq_util.py` |
| Shared type definitions | `ingestion/het_types.py` |
