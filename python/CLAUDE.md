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

## Regenerating golden test data

When a change legitimately alters `write_to_bq()` output, regenerate the golden instead of hand-editing it. Uncomment the write line above the assertion, run the test, re-comment before committing:

```python
# python/tests/datasources/test_cawp.py
# df_state_historical.to_csv(os.path.join(GOLDEN_DIR, table_name + ".csv"), index=False)
assert_frame_equal(df_state_historical, load_golden_df(GOLDEN_DIR, table_name, FIPS_TIME_DTYPE), check_like=True)
```

If a test has no such line, copy one from a neighboring test file (`test_cawp.py`, `test_chr.py`, `test_age_adjustment_cdc_hiv.py`) and adjust the frame and path variables.

Match the golden's existing format: most are `.csv`, but `cdc_restricted` and `bjs_incarceration` are `.json` and need `to_json(path, orient="records")`. Writing the wrong format corrupts the file silently.

Review the diff. Regeneration records whatever the code emits, so a bug regenerates as cleanly as a fix.

## Bumping the ACS vintage year

When a new ACS vintage lands in BigQuery and is ready for use, follow these steps in order:

1. **Update `ACS_CURRENT_YEAR`** in `python/ingestion/merge_utils.py` (line 9). This constant is the upper bound of ACS coverage for every datasource that calls `_merge_pop()` (CAWP, AHR, etc.): rows within `ACS_EARLIEST_YEAR`–`ACS_CURRENT_YEAR` merge against their own year, and rows after it are clamped down to `ACS_CURRENT_YEAR`. Both paths read the `_historical` population table, so bumping the constant is what lets a newer vintage be used at all.

2. **Refresh the ACS source cache, then rebuild the BigQuery tables.** Run `dagAcsPopulationPreCache.yml` first — `dagAcsPopulation.yml` reads pre-cached ACS responses out of the GCS landing bucket rather than fetching them, so on a vintage bump those cached files are stale by definition and skipping the pre-cache either fails the run or silently reprocesses the old vintage. Only once the pre-cache finishes, run `dagAcsPopulation.yml`. (The pre-cache repeats a Census API ingestion across every year, so expect it to be slow and watch for rate limiting.)

3. **Regenerate the committed population CSVs.** `merge_utils._merge_pop()` reads `python/ingestion/acs_population/*.csv` directly at runtime as static snapshots. Nothing regenerates them automatically. After the `dagAcsPopulation.yml` run completes for the target project, re-run:

   ```bash
   source .venv/bin/activate
   pip install python/ingestion/
   # dev project (het-infra-test-05):
   python python/ingestion/acs_population/refresh_historical_csvs.py
   # prod project (requires both flags):
   python python/ingestion/acs_population/refresh_historical_csvs.py --project <prod-project-id> --prod
   ```

   Commit the resulting CSV diff alongside the `ACS_CURRENT_YEAR` bump. Until this diff is committed, the new vintage year is not usable as a population denominator even if the BigQuery tables are current.

   Two gotchas. The script defaults to the **dev** project, so refreshing without `--project <prod-project-id> --prod` silently snapshots dev's tables — and if dev's `dagAcsPopulation.yml` has not itself been re-run since the `ACS_CURRENT_YEAR` bump, the resulting CSVs still hold the old vintage while appearing to have been refreshed. Also, BigQuery row order is nondeterministic, so a refresh produces a huge order-only diff on tables whose values did not change; compare sorted content before assuming a file is genuinely different.

4. **Regenerate the golden test data.** A vintage bump changes every merged population denominator at once, so dozens of golden expectations under `python/tests/data/` fail together. Regenerate them using the pattern in **Regenerating golden test data** above, then hand-edit the few expectations that are inline Python literals rather than files (e.g. `python/tests/ingestion/test_merge_utils.py`).

   Review the resulting diff rather than trusting it — regeneration records whatever the code emits, including a bug. Confirm row counts are unchanged and that only population-derived columns (`population`, `population_pct`, `*_pct_share`, `*_pct_relative_inequity`, rates) moved. Anything else means the refresh broke a join instead of just shifting a denominator.

5. **Re-run affected DAGs.** Datasources that merge population (e.g. AHR, CAWP) must be re-ingested after the CSV refresh so their BigQuery/GCS outputs reflect the updated denominators. Note this requires a **release** first for prod: the containers read the committed CSVs at runtime, so a prod DAG rerun before the CSV diff ships still uses the old snapshots.

## Key files

| Purpose | Path |
|---|---|
| DataSource base class | `datasources/data_source.py` |
| BigQuery/GCS utilities | `ingestion/gcs_to_bq_util.py` |
| Shared data transforms | `ingestion/dataset_utils.py` |
| Shared type definitions | `ingestion/het_types.py` |
| ACS population CSV snapshots | `ingestion/acs_population/*.csv` |
| ACS population CSV refresh script | `ingestion/acs_population/refresh_historical_csvs.py` |
