# Python Data Pipeline

Shared modules for data ingestion, transformation, and loading to BigQuery.

## Commands

```bash
# From repo root with venv active
source .venv/bin/activate
pip install python/datasources/ python/ingestion/ && pytest python/tests/

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

**Changing an existing data source's output?** Editing `write_to_bq()` or a shared `ingestion/` helper does not regenerate any data by itself — the matching `dag<Source>.yml` workflow must be run (`gh workflow run dag<Source>.yml --ref infra-test` for testing, or against `main` post-merge) before the change reaches BigQuery/GCS. See root `CLAUDE.md` → Backend Data Pipeline.

## Bumping the ACS vintage year

When a new ACS vintage lands in BigQuery and is ready for use, follow these steps in order:

1. **Update `ACS_CURRENT_YEAR`** in `python/ingestion/merge_utils.py` (line 9). This constant controls which year's population table is used as the denominator for every datasource that calls `_merge_pop()` (CAWP, AHR, etc.).

2. **Regenerate the committed population CSVs.** `merge_utils._merge_pop()` reads `python/ingestion/acs_population/*.csv` directly at runtime as static snapshots. Nothing regenerates them automatically. After the `dagAcsPopulation.yml` DAG run completes for the target project, re-run:

   ```bash
   source .venv/bin/activate
   pip install python/ingestion/
   # dev project (het-infra-test-05):
   python python/ingestion/acs_population/refresh_historical_csvs.py
   # prod project (requires both flags):
   python python/ingestion/acs_population/refresh_historical_csvs.py --project <prod-project-id> --prod
   ```

   Commit the resulting CSV diff alongside the `ACS_CURRENT_YEAR` bump. Until this diff is committed, the new vintage year is not usable as a population denominator even if the BigQuery tables are current.

3. **Re-run affected DAGs.** Datasources that merge population (e.g. AHR, CAWP) must be re-ingested after the CSV refresh so their BigQuery/GCS outputs reflect the updated denominators.

## Key files

| Purpose | Path |
|---|---|
| DataSource base class | `datasources/data_source.py` |
| BigQuery/GCS utilities | `ingestion/gcs_to_bq_util.py` |
| Shared data transforms | `ingestion/dataset_utils.py` |
| Shared type definitions | `ingestion/het_types.py` |
| ACS population CSV snapshots | `ingestion/acs_population/*.csv` |
| ACS population CSV refresh script | `ingestion/acs_population/refresh_historical_csvs.py` |
