#!/usr/bin/env python3
"""List abandoned BigQuery tables and export JSON, and print the commands to delete them.

Read-only: nothing is deleted. Review the output, then run the printed commands yourself.

    python scripts/find_abandoned.py --env test
    python scripts/find_abandoned.py --env prod
    python scripts/find_abandoned.py --env prod --dataset acs_population

Abandoned means:

- Table: last modified before the latest successful run of every DAG that writes its
  dataset. Each successful run rewrites all of its tables, so a table it didn't touch is
  one the current code no longer produces (e.g. the old name after a rename). Datasets
  whose DAGs have no successful run on record are skipped.
- JSON: an export object whose source table is abandoned or no longer exists. County
  splits (`-NN.json`) and `alls_*` files (derived from a demographic table) are matched
  back to their source table.

Uses Application Default Credentials for BigQuery/GCS and the gh CLI for workflow runs.
"""

import argparse
import json
import re
import shlex
import subprocess
import sys
from datetime import datetime
from pathlib import Path

from google.cloud import bigquery, storage
from google.api_core.exceptions import NotFound

REPO_ROOT = Path(__file__).resolve().parent.parent
WORKFLOWS_DIR = REPO_ROOT / ".github" / "workflows"
WRITE_ACTION = "runSourceToBqPipeline"
ENVS = {
    "test": {
        "project": "het-infra-test-05",
        "bucket": "het-data-tables",
        "repo": "SatcherInstitute/health-equity-tracker",
    },
    "prod": {
        "project": "het-infra-prod-f6",
        "bucket": "prod-data-tables",
        "repo": "SatcherInstitute/health-equity-tracker-prod",
    },
}


def writers_by_dataset() -> dict[str, list[str]]:
    """Map each dataset to the DAG workflow files that write BigQuery tables into it."""
    writers: dict[str, list[str]] = {}
    for path in sorted(WORKFLOWS_DIR.glob("dag*.yml")):
        text = path.read_text()
        match = re.search(r'DATASET_NAME:\s*"?([A-Za-z0-9_]+)"?', text)
        if match and WRITE_ACTION in text:
            writers.setdefault(match.group(1), []).append(path.name)
    return writers


def latest_successful_run_created(repo: str, workflow: str) -> datetime | None:
    """Creation time of the workflow's latest successful run, or None if there isn't one.

    Uses createdAt, not startedAt: a "re-run failed jobs" attempt gets a new start
    time, but the jobs that passed on the first attempt wrote their tables earlier.
    """
    result = subprocess.run(
        ["gh", "run", "list", "-R", repo, "--workflow", workflow, "--status", "success"]
        + ["--limit", "1", "--json", "createdAt"],
        capture_output=True,
        text=True,
        check=True,
    )
    runs = json.loads(result.stdout)
    return datetime.fromisoformat(runs[0]["createdAt"].replace("Z", "+00:00")) if runs else None


def source_table(object_name: str) -> tuple[str, str] | None:
    """(dataset, table) an export object was written from, or None if not an export."""
    match = re.fullmatch(r"([a-z0-9_]+)-(.+?)(-\d{2})?\.json", object_name)
    return (match.group(1), match.group(2)) if match else None


def is_backed(table: str, live: set[str]) -> bool:
    """Whether a live table produces this export.

    The exporter derives `alls` files by replacing the demographic in a table name
    (e.g. `black_women_by_age_*` -> `black_women_by_alls_*`), so match "alls" as a wildcard.
    """
    if table in live:
        return True
    if "alls" not in table:
        return False
    pattern = ".+".join(re.escape(part) for part in table.split("alls"))
    return any(re.fullmatch(pattern, t) for t in live)


def frontend_dataset_ids() -> set[str]:
    """Every `<dataset>-<table>` string in frontend/src; anything listed here is still read."""
    result = subprocess.run(
        ["git", "grep", "-ohE", r"[a-z0-9_]+-[A-Za-z0-9_-]+", "--", "frontend/src"],
        cwd=REPO_ROOT,
        capture_output=True,
        text=True,
        check=True,
    )
    return set(result.stdout.split())


def main():
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--env", choices=ENVS, required=True)
    parser.add_argument("--dataset", help="Check one dataset instead of all DAG datasets")
    args = parser.parse_args()
    env = ENVS[args.env]

    writers = writers_by_dataset()
    datasets = [args.dataset] if args.dataset else sorted(writers)
    bq = bigquery.Client(project=env["project"])
    blobs = list(storage.Client(project=env["project"]).list_blobs(env["bucket"]))

    frontend_ids = frontend_dataset_ids()
    table_cmds, json_cmds, still_read = [], [], []
    for dataset in datasets:
        if dataset not in writers:
            sys.exit(f"No dag*.yml writes dataset {dataset}.")
        runs = [latest_successful_run_created(env["repo"], w) for w in writers[dataset]]
        if None in runs:
            print(f"{dataset}: skipped, a writer DAG has no successful run in {env['repo']}")
            continue
        cutoff = min(runs)
        try:
            tables = [bq.get_table(t.reference) for t in bq.list_tables(f"{env['project']}.{dataset}")]
        except NotFound:
            # A deleted dataset leaves all of its exports abandoned.
            tables = []

        abandoned = sorted((t for t in tables if t.modified < cutoff), key=lambda t: t.table_id)
        live = {t.table_id for t in tables if t.modified >= cutoff}
        objects = [b.name for b in blobs if (src := source_table(b.name)) and src[0] == dataset]
        abandoned_json = [o for o in objects if not is_backed(source_table(o)[1], live)]
        if not abandoned and not abandoned_json:
            continue

        print(f"\n{dataset} (live = written since {cutoff:%Y-%m-%d}):")
        for t in abandoned:
            print(f"  table  {t.table_id:<55} last written {t.modified:%Y-%m-%d}  {t.num_rows:>10,} rows")
            if f"{dataset}-{t.table_id}" in frontend_ids:
                still_read.append(f"{dataset}-{t.table_id}")
            else:
                table_cmds.append(f"bq rm -f -t {env['project']}:{dataset}.{t.table_id}")
        by_table: dict[str, list[str]] = {}
        for o in abandoned_json:
            by_table.setdefault(source_table(o)[1], []).append(o)
        for table, objs in sorted(by_table.items()):
            print(f"  json   {dataset}-{table} ({len(objs)} file{'s' if len(objs) > 1 else ''})")
            if f"{dataset}-{table}" in frontend_ids:
                still_read.append(f"{dataset}-{table}")
                continue
            json_cmds.append(
                "gcloud storage rm " + " ".join(shlex.quote(f"gs://{env['bucket']}/{o}") for o in sorted(objs))
            )

    if still_read:
        print(
            "\n# Still read by frontend/src, so excluded from the commands below. The frontend is likely "
            "pointing at a renamed or moved dataset and serving frozen data; fix the frontend first:"
        )
        print("\n".join(f"#   {i}" for i in sorted(set(still_read))))
    if not table_cmds and not json_cmds:
        print(f"\nNothing abandoned in {args.env}.")
        return
    print("\n# Delete commands (review first; tables stay recoverable for 7 days via time travel):")
    print("\n".join(table_cmds + json_cmds))


if __name__ == "__main__":
    main()
