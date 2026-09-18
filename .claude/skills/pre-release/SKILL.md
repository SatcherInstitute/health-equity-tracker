---
name: pre-release
description: Summarize what's new on dev since the last release and investigate for footguns — config/infra changes, breaking changes, anything that could bring down production. Use before cutting a release, or run /pre-release.
---

# /pre-release

Audit the unreleased diff on `main` and surface anything that could cause a bad deploy or break prod.

---

## Step 1 — Establish the diff base

Find the last release tag and the commits since it:

```bash
git fetch --tags origin
LAST_TAG=$(git tag --sort=-version:refname | grep -E '^ReleaseV[0-9]+\.[0-9]+$' | head -1)
echo "Last tag: $LAST_TAG"
git log "$LAST_TAG"..HEAD --oneline
```

Store `$LAST_TAG` for all subsequent steps.

---

## Step 2 — Categorize commits

The authoritative deploy path list comes from `deployInfraTest.yml`'s `paths:` filter:

```
config/  data/  server/  server_smoke_tests/
exporter/  python/  requirements/
run_gcs_to_bq/  run_ingestion/  frontend/
```

A commit is **deployed** (reaches prod via release) only if any of its changed files fall under those paths. Everything else is already live on merge.

Separate unreleased commits into:

1. **App/user-facing** — changed files under the deploy paths above (these ship at release time)
2. **Pipeline/data** — subset of the above touching `python/datasources/`, `python/ingestion/`, `run_ingestion/`, `run_gcs_to_bq/`
3. **Live on merge already** — changed files entirely outside the deploy paths (`.claude/`, `CLAUDE.md`, `.github/workflows/`, root docs, etc.); omit from the release changelog

To categorize each commit, check its diff paths:

```bash
git log "$LAST_TAG"..HEAD --oneline | while read sha rest; do
  paths=$(git diff-tree --no-commit-id -r --name-only "$sha")
  deployed=$(echo "$paths" | grep -E '^(config|data|server|server_smoke_tests|exporter|python|requirements|run_gcs_to_bq|run_ingestion|frontend)/')
  if [ -z "$deployed" ]; then
    echo "LIVE-ON-MERGE $sha $rest"
  else
    echo "DEPLOYED      $sha $rest"
  fi
done
```

Print a grouped summary. Be explicit that live-on-merge commits are already in effect and do not appear in a GitHub release's user-facing changelog.

---

## Step 3 — Footgun investigation

For each category, run targeted checks. Run all of these in parallel:

### 3a — New environment variables or secrets

```bash
git diff "$LAST_TAG"..HEAD -- '*.env*' '*variables.tf' 'server/*.go' 'server/**/*.go' \
  | grep -E '^\+.*[A-Z_]{4,}\s*[=:]' | grep -v '^+++' | head -40
```

Also scan for new `os.Getenv`, `os.LookupEnv`, or `viper.GetString` calls added since the last tag:

```bash
git diff "$LAST_TAG"..HEAD -- '*.go' | grep -E '^\+.*(os\.Getenv|os\.LookupEnv|viper\.Get)' | grep -v '^+++' | head -20
```

Flag any new env var that is not already set in the prod Cloud Run service. Do NOT try to read `variables.tf` as the source of truth — it drifts from live config. Instead note these as "verify in prod Cloud Run before releasing."

### 3b — Infrastructure / Terraform changes

```bash
git diff "$LAST_TAG"..HEAD --name-only | grep -E 'terraform/|\.tf$'
git diff "$LAST_TAG"..HEAD -- '*.tf' | head -80
```

If any `.tf` files changed: summarize what resources are affected (Cloud Run, IAM, secrets, buckets, etc.). The release workflow applies Terraform to prod — any new resource or permission added here will be created during the deploy. Flag if any Terraform change creates a net-new resource, modifies IAM bindings, or touches secrets.

### 3c — Go server startup / routing changes

```bash
git diff "$LAST_TAG"..HEAD --name-only | grep -E '^server/'
git diff "$LAST_TAG"..HEAD -- 'server/' | grep -E '^\+(.*route|.*handler|.*middleware|.*port|.*addr|.*Listen|.*Serve)' | grep -v '^+++' | head -30
```

Flag any new route registrations, changed ports, or middleware ordering changes.

### 3d — Dependency changes

```bash
git diff "$LAST_TAG"..HEAD -- 'go.mod' 'go.sum' 'frontend/package.json' 'frontend/package-lock.json' 'python/requirements*.txt' 'pyproject.toml' \
  | grep -E '^\+' | grep -v '^+++' | head -40
```

Flag major version bumps or new dependencies that have no lock-file entry (could indicate a manual edit without running the package manager).

### 3e — DAG / pipeline changes that require a rerun

```bash
git diff "$LAST_TAG"..HEAD --name-only | grep -E '^python/(datasources|ingestion)/|^\.github/workflows/dag'
```

For each changed datasource file, identify its matching `dag*.yml`. Note: merging the code does NOT reprocess data — the DAG must be triggered separately after deploy.

### 3f — Breaking API or data contract changes

```bash
git diff "$LAST_TAG"..HEAD -- 'server/' 'exporter/' | grep -E '^\+(.*json:",|.*Column|.*TableID|.*DatasetID)' | grep -v '^+++' | head -30
```

Look for renamed JSON fields, removed columns, or changed BigQuery table/dataset IDs that could break the frontend if the data and frontend code ship out of order.

### 3g — CI workflow changes

```bash
git diff "$LAST_TAG"..HEAD --name-only | grep -E '^\.github/workflows/' | grep -v '^dag'
git diff "$LAST_TAG"..HEAD -- '.github/workflows/' | grep -v '^dag' | head -60
```

Flag any changes to release, deploy, or e2e workflows — these could affect the release process itself.

---

## Step 4 — Risk summary

After running all checks, produce a structured risk summary:

```
Pre-release audit: $LAST_TAG → HEAD ($N commits)

USER-FACING CHANGES
  feat: <list>
  fix: <list>

PIPELINE/DATA CHANGES
  <list — reminder: these require DAG reruns after deploy>

TOOLING ONLY (does not ship to users)
  <list>

RISK FLAGS  [if none, say "None found"]
  [ENV] New env vars requiring prod Cloud Run config: <list or "none">
  [INFRA] Terraform changes: <summary or "none">
  [SERVER] Go routing/startup changes: <summary or "none">
  [DEPS] Dependency changes: <summary or "none">
  [PIPELINE] DAGs to rerun post-deploy: <list or "none">
  [CONTRACT] Potential API/data contract breaks: <summary or "none">
  [CI] Workflow changes: <summary or "none">

RECOMMENDATION
  <one sentence: safe to release / release with caution / hold — and why>
```

If any `[ENV]`, `[INFRA]`, or `[CONTRACT]` flags are non-empty, the recommendation should be "release with caution" or "hold" with a specific action item. Otherwise "safe to release" is appropriate.

---

## Notes

- Tooling-only commits (`.claude/`, `CLAUDE.md`) do not affect the deployed application. Never list them as user-facing changes.
- The release workflow applies Terraform to prod as part of the deploy — new secrets must exist in prod Secret Manager before the deploy begins, or it will fail.
- Pipeline code changes only take effect when the matching DAG workflow is re-triggered. Flag every changed datasource.
- Prod Cloud Run config is the source of truth for live env vars, not `variables.tf`.
