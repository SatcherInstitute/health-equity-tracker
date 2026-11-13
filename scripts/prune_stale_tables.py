#!/usr/bin/env python3
"""Drop BigQuery tables that the latest successful DAG run for a dataset did not write.

When a datasource renames a table, the old one stays in the dataset and the exporter
keeps exporting it. Run this after the renamed datasource's DAG has rerun:

    python scripts/prune_stale_tables.py acs_population --project het-infra-test-05
    python scripts/prune_stale_tables.py acs_population --project het-infra-prod-f6

A table is stale when it was last modified before the start of the latest successful
run of every DAG that writes its dataset. Elapsed time alone is not a signal: annual
sources sit idle for months, but each successful run rewrites all of its tables.

Datasets with several writer DAGs (e.g. graphql_ahr_data) use the earliest of the
writers' latest run starts, which can miss an orphan but never flags a live table.

Uses Application Default Credentials for BigQuery and the gh CLI for workflow runs.
Dropped tables stay recoverable for 7 days via BigQuery time travel.
"""

import argparse
import json
import re
import subprocess
import sys
from datetime import datetime
from pathlib import Path

from google.cloud import bigquery

REPO_ROOT = Path(__file__).resolve().parent.parent
WORKFLOWS_DIR = REPO_ROOT / ".github" / "workflows"
PROD_PROJECT = "het-infra-prod-f6"
DEV_REPO = "SatcherInstitute/health-equity-tracker"
PROD_REPO = "SatcherInstitute/health-equity-tracker-prod"
WRITE_ACTION = "runSourceToBqPipeline"


def writer_workflows(dataset: str) -> list[str]:
    """DAG workflow files that write BigQuery tables into `dataset`."""
    writers = []
    for path in sorted(WORKFLOWS_DIR.glob("dag*.yml")):
        text = path.read_text()
        match = re.search(r'DATASET_NAME:\s*"?([A-Za-z0-9_]+)"?', text)
        if match and match.group(1) == dataset and WRITE_ACTION in text:
            writers.append(path.name)
    return writers


def latest_successful_run_created(repo: str, workflow: str) -> datetime:
    """Creation time of the workflow's latest successful run.

    Uses createdAt, not startedAt: a "re-run failed jobs" attempt gets a new start
    time, but the jobs that passed on the first attempt wrote their tables earlier.
    """
    result = subprocess.run(
        [
            "gh",
            "run",
            "list",
            "-R",
            repo,
            "--workflow",
            workflow,
            "--status",
            "success",
            "--limit",
            "1",
            "--json",
            "createdAt,url",
        ],
        capture_output=True,
        text=True,
        check=True,
    )
    runs = json.loads(result.stdout)
    if not runs:
        sys.exit(f"No successful run of {workflow} in {repo}; nothing can be judged stale.")
    print(f"  {workflow}: latest successful run created {runs[0]['createdAt']}  {runs[0]['url']}")
    return datetime.fromisoformat(runs[0]["createdAt"].replace("Z", "+00:00"))


def frontend_references(dataset: str, table_id: str) -> bool:
    """Whether the frontend still requests this table's export by dataset ID."""
    result = subprocess.run(
        ["git", "grep", "-q", "-F", f"{dataset}-{table_id}", "--", "frontend/src"],
        cwd=REPO_ROOT,
        check=False,
    )
    return result.returncode == 0


def main():
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("dataset", help="BigQuery dataset, e.g. acs_population")
    parser.add_argument("--project", required=True, help="het-infra-test-05 or het-infra-prod-f6")
    args = parser.parse_args()

    writers = writer_workflows(args.dataset)
    if not writers:
        sys.exit(f"No dag*.yml writes dataset {args.dataset}.")

    repo = PROD_REPO if args.project == PROD_PROJECT else DEV_REPO
    print(f"Writer DAGs for {args.dataset} in {repo}:")
    cutoff = min(latest_successful_run_created(repo, w) for w in writers)

    client = bigquery.Client(project=args.project)
    tables = [client.get_table(t.reference) for t in client.list_tables(f"{args.project}.{args.dataset}")]
    stale = [t for t in tables if t.modified < cutoff]

    print(f"\n{len(tables)} tables in {args.project}.{args.dataset}; {len(stale)} not written since {cutoff}.")
    if not stale:
        return

    referenced = [t for t in stale if frontend_references(args.dataset, t.table_id)]

    print(f"\n{'stale table':<55} {'last modified':<12} {'rows':>12}")
    for t in sorted(stale, key=lambda t: t.table_id):
        flag = "  ** referenced in frontend/src **" if t in referenced else ""
        print(f"{t.table_id:<55} {t.modified.date().isoformat():<12} " f"{t.num_rows:>12,}{flag}")

    if referenced:
        print(
            f"\n{len(referenced)} stale table(s) are still referenced by the frontend. "
            "Update the frontend first, or rerun the DAG if these tables should still exist."
        )

    if input(f"\nDrop these {len(stale)} tables? Type 'drop' to confirm: ").strip() != "drop":
        print("Cancelled; nothing dropped.")
        return
    for t in stale:
        # A writer DAG may have rewritten the table while the prompt was waiting.
        if client.get_table(t.reference).modified >= cutoff:
            print(f"Skipped {t.full_table_id}; written since the cutoff.")
            continue
        client.delete_table(t.reference)
        print(f"Dropped {t.full_table_id}")


if __name__ == "__main__":
    main()
