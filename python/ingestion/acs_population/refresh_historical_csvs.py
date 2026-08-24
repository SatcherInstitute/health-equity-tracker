"""Regenerates the committed acs_population/*.csv snapshots from BigQuery.

merge_utils._merge_pop() reads these CSVs directly at runtime as the population
denominator for every datasource that merges population (CAWP, AHR, etc). They
are static snapshots, not produced by this repo's write_to_bq path, so nothing
regenerates them automatically when a new ACS vintage lands in BigQuery.

Whoever bumps ACS_CURRENT_YEAR in ingestion/merge_utils.py must re-run this
script and commit the resulting diff before the new vintage is actually usable
as a population denominator.

Defaults to reading from the dev project (DEV_PROJECT below). To refresh from
prod instead, pass both --project <prod-project-id> and --prod: requiring both
flags together guards against accidentally targeting prod with a bare
--project typo or copy-paste.

Usage (from repo root, after dagAcsPopulation.yml has finished for the target
project):

    source .venv/bin/activate
    pip install python/ingestion/
    python python/ingestion/acs_population/refresh_historical_csvs.py
    python python/ingestion/acs_population/refresh_historical_csvs.py --project <prod-id> --prod

If a regenerated table exceeds GitHub's 100MB commit limit, add its unused
columns to COLUMNS_TO_DROP below — but confirm via merge_utils.py that nothing
actually reads them first (e.g. by grepping for the table's CSV filename and
tracing which columns the caller keeps).
"""

import os
import glob
import argparse

from ingestion.gcs_to_bq_util import load_df_from_bigquery

DATASET = "acs_population"
ACS_MERGE_DATA_DIR = os.path.dirname(os.path.abspath(__file__))
DEV_PROJECT = "het-infra-test-05"

# merge_utils._merge_intersectional_pop() never reads county_name from this table
# (it only needs the fips codes plus the demographic/population columns), and at
# ~3,143 counties x every age/sex/race combo, the repeated full county name text
# alone pushes this file over GitHub's 100MB pre-commit limit. Drop it on write.
COLUMNS_TO_DROP = {
    "multi_sex_age_race_county_current": ["county_name"],
}


def _parse_args():
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument(
        "--project",
        default=DEV_PROJECT,
        help=f"GCP project to read BigQuery tables from (default: {DEV_PROJECT})",
    )
    parser.add_argument(
        "--prod",
        action="store_true",
        help="Required alongside --project when targeting a project other than the dev default, "
        "as an explicit confirmation this is intentionally reading from prod.",
    )
    return parser.parse_args()


def _table_names():
    csv_paths = glob.glob(os.path.join(ACS_MERGE_DATA_DIR, "*.csv"))
    return sorted(os.path.splitext(os.path.basename(p))[0] for p in csv_paths)


def main():
    args = _parse_args()
    if args.project != DEV_PROJECT and not args.prod:
        raise SystemExit(
            f"Refusing to refresh from '{args.project}' without --prod. "
            f"Omit --project for the default dev refresh ({DEV_PROJECT}), "
            "or add --prod to confirm a non-dev target."
        )
    os.environ["GOOGLE_CLOUD_PROJECT"] = args.project

    for table_name in _table_names():
        df = load_df_from_bigquery(DATASET, table_name)
        df = df.drop(columns=COLUMNS_TO_DROP.get(table_name, []))
        out_path = os.path.join(ACS_MERGE_DATA_DIR, f"{table_name}.csv")
        df.to_csv(out_path, index=False)
        print(f"wrote {len(df)} rows to {out_path}")


if __name__ == "__main__":
    main()
