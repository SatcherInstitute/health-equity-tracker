"""Regenerates the committed acs_population/*.csv snapshots from BigQuery.

merge_utils._merge_pop() reads these CSVs directly at runtime as the population
denominator for every datasource that merges population (CAWP, AHR, etc). They
are static snapshots, not produced by this repo's write_to_bq path, so nothing
regenerates them automatically when a new ACS vintage lands in BigQuery.

Whoever bumps ACS_CURRENT_YEAR in ingestion/merge_utils.py must re-run this
script (against the project holding the finished acs_population DAG run,
typically prod) and commit the resulting diff before the new vintage is
actually usable as a population denominator.

Usage (from repo root, with ADC/GOOGLE_CLOUD_PROJECT pointed at the target
BigQuery project, after dagAcsPopulation.yml has finished for that project):

    source .venv/bin/activate
    pip install python/ingestion/
    python python/ingestion/acs_population/refresh_historical_csvs.py
"""

import os
import glob

from ingestion.gcs_to_bq_util import load_df_from_bigquery

DATASET = "acs_population"
ACS_MERGE_DATA_DIR = os.path.dirname(os.path.abspath(__file__))


def _table_names():
    csv_paths = glob.glob(os.path.join(ACS_MERGE_DATA_DIR, "*.csv"))
    return sorted(os.path.splitext(os.path.basename(p))[0] for p in csv_paths)


def main():
    for table_name in _table_names():
        df = load_df_from_bigquery(DATASET, table_name)
        out_path = os.path.join(ACS_MERGE_DATA_DIR, f"{table_name}.csv")
        df.to_csv(out_path, index=False)
        print(f"wrote {len(df)} rows to {out_path}")


if __name__ == "__main__":
    main()
