---
name: infra-test
description: Force-push the current branch to infra-test to trigger a GCP deploy, wait for it to complete, then run each associated DAG pipeline one at a time and wait for each to finish. On full success, updates the PR description with a checklist confirming real GCP infra-test results. Use when the user wants to verify backend changes on the test environment before merging, or run /infra-test.
---

# /infra-test

Deploy the current branch to the GCP infra-test environment, run all associated DAG pipelines, and update the PR with verified results.

The user may pass a PR number as an argument (e.g. `/infra-test 4854`). If none is given, detect the open PR from the current branch.

---

## Step 1 — Identify PR and current branch

```bash
gh pr view [<number>] --json number,title,body,headRefName,baseRefName
REPO=$(gh repo view --json nameWithOwner -q .nameWithOwner)
GH_USER=$(gh api user -q .login)
FORK_REMOTE=$(git remote -v | grep -i "github.com[/:]${GH_USER}/" | head -1 | awk '{print $1}')
```

Confirm the PR base is `main`. If the PR is already merged or closed, print an error and stop.

---

## Step 2 — Force-push to infra-test

```bash
git push origin HEAD:infra-test -f
```

This triggers the `testBackendChangesInfraTest.yml` workflow. Immediately capture the run ID:

```bash
sleep 10
RUN_ID=$(gh run list --repo $REPO --workflow=testBackendChangesInfraTest.yml --limit 1 \
  --json databaseId --jq '.[0].databaseId')
echo "Infra-test deploy run: https://github.com/$REPO/actions/runs/$RUN_ID"
```

---

## Step 3 — Wait for the deploy to complete

Poll every 60 seconds. The deploy typically takes 15-25 minutes:

```bash
while true; do
  STATUS=$(gh run view $RUN_ID --repo $REPO --json status,conclusion \
    --jq '{status: .status, conclusion: .conclusion}')
  echo "[$(date +%H:%M)] Deploy status: $STATUS"
  DONE=$(echo $STATUS | python3 -c "import sys,json; d=json.load(sys.stdin); print(d['status'] == 'completed')")
  if [ "$DONE" = "True" ]; then break; fi
  sleep 60
done

CONCLUSION=$(gh run view $RUN_ID --repo $REPO --json conclusion --jq '.conclusion')
if [ "$CONCLUSION" != "success" ]; then
  echo "Deploy failed (conclusion: $CONCLUSION). Stopping."
  echo "Logs: https://github.com/$REPO/actions/runs/$RUN_ID"
  exit 1
fi
echo "Deploy succeeded."
```

If the deploy fails: print the logs URL and stop. Do not run DAG pipelines against a failed deploy.

---

## Step 4 — Identify associated DAG workflows

Look at the files changed in this PR to determine which DAG workflows are relevant:

```bash
git diff origin/main --name-only
```

Map changed paths to DAG workflows:

| Changed path pattern | DAG workflow file |
|---|---|
| `python/datasources/cawp.py`, `data/cawp/` | `dagCawp.yml` |
| `python/datasources/acs_*.py` | `dagAcsCondition.yml`, `dagAcsPopulation.yml` |
| `python/datasources/cdc_hiv*.py` | `dagCdcHiv.yml` |
| `python/datasources/phrma*.py` | `dagPhrma.yml` |
| `python/datasources/maternal*.py` | `dagMaternalMortality.yml` |
| `python/datasources/bjs*.py` | `dagBjsIncarceration.yml` |
| `python/datasources/graphql_ahr*.py` | `dagGraphQlAhr.yml` |
| `python/datasources/chr*.py` | `dagChr.yml` |
| `python/datasources/cdc_wisqars*.py` | `dagCdcWisqars.yml` |
| `python/datasources/vera*.py` | `dagVera.yml` |
| `python/datasources/kff*.py` | `dagKffVaccination.yml` |
| `python/datasources/cdc_vaccination*.py` | `dagCdcVaccinationCounty.yml`, `dagCdcVaccinationNational.yml` |
| `python/ingestion/`, `run_gcs_to_bq/`, `run_ingestion/` | all DAGs that touch changed datasources |

If no DAG workflows are clearly associated (e.g. pure frontend or config change), print a note and skip Steps 5-6.

You can also inspect the DAG workflow files directly to confirm the `WORKFLOW_ID` env var matches the changed datasource class name:

```bash
grep -l "WORKFLOW_ID" .github/workflows/dag*.yml | xargs grep -l "<datasource_id>"
```

---

## Step 5 — Run each DAG workflow one at a time

For each associated DAG workflow, trigger it targeting the infra-test environment and wait for completion before starting the next one.

**Trigger:**
```bash
gh workflow run <workflow-file> --repo $REPO
sleep 15
DAG_RUN_ID=$(gh run list --repo $REPO --workflow=<workflow-file> --limit 1 \
  --json databaseId --jq '.[0].databaseId')
echo "DAG run: https://github.com/$REPO/actions/runs/$DAG_RUN_ID"
```

**Wait (poll every 60 seconds):**
```bash
while true; do
  STATUS=$(gh run view $DAG_RUN_ID --repo $REPO --json status,conclusion \
    --jq '{status: .status, conclusion: .conclusion}')
  echo "[$(date +%H:%M)] $WORKFLOW_NAME status: $STATUS"
  DONE=$(echo $STATUS | python3 -c "import sys,json; d=json.load(sys.stdin); print(d['status'] == 'completed')")
  if [ "$DONE" = "True" ]; then break; fi
  sleep 60
done

CONCLUSION=$(gh run view $DAG_RUN_ID --repo $REPO --json conclusion --jq '.conclusion')
echo "$WORKFLOW_NAME: $CONCLUSION"
```

If a DAG fails: print the logs URL, mark it failed in your results list, and continue with the remaining DAGs. Report all results at the end before updating the PR.

---

## Step 6 — Update the PR description with verified results

Read the current PR body:

```bash
gh pr view <number> --repo $REPO --json body --jq '.body'
```

Append an infra-test results section **above** the `🤖 Generated with Claude Code` footer (preserve all existing content including bot-generated blocks):

```markdown
## Infra-test results

Deploy: [run #NNNN](https://github.com/REPO/actions/runs/NNNN) — success

DAG pipelines:
- [x] DAG - CAWP_DATA: [run #NNNN](https://github.com/REPO/actions/runs/NNNN) — success
- [ ] DAG - SOME_OTHER: [run #NNNN](https://github.com/REPO/actions/runs/NNNN) — failed (see logs)
```

Use `- [x]` for success, `- [ ]` for failure or not run. Always link the run ID so a reviewer can drill in.

Write the updated body to `/tmp/pr-body-infra.md` and apply:

```bash
gh pr edit <number> --repo $REPO --body-file /tmp/pr-body-infra.md
```

---

## Notes

- Never push directly to `origin/main`. The infra-test push goes to `origin/infra-test` only.
- DAG workflows run against the infra-test GCP project (`het-infra-test`), not production.
- The `testBackendChangesInfraTest.yml` deploy must succeed before running any DAGs — a failed deploy means the code under test was never deployed.
- If the PR is purely a frontend or config change with no Python datasource changes, the deploy is still useful to verify the build, but DAG steps can be skipped.
- DAG runs triggered by `gh workflow run` always use the `main` ref for the workflow definition but the deployed infra-test code for execution — this is the correct behavior.
