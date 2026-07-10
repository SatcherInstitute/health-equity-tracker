# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

The [Health Equity Tracker](https://healthequitytracker.org/) aggregates demographic health data by race, ethnicity, sex, and socioeconomic status across the US. It consists of a React frontend, a combined Go server that serves the app and its data APIs, and a GCP-hosted data pipeline.

> **Service-specific guidance:** See each service's own `CLAUDE.md` for details.
> `frontend/` · `server/` · `exporter/` · `python/`
> (Legacy `frontend_server/` and `data_server/` are deprecated and slated for removal; see #4902.)

## Architecture

### Serving Architecture

Since the 2026-07 production cutover (#4901), a single combined Go server is the live serving path for both dev and prod, handling the frontend and all data APIs:

```plaintext
frontend/  React app (TypeScript, Vite, MUI, Tailwind, D3, Jotai)
server/    Combined Go server: the live serving path for dev and prod. One
           ~15 MB binary (static files + GCS data + Anthropic + Webflow) that
           replaces frontend_server and data_server.
```

The two original services are deprecated and pending removal (#4902); do not build new functionality on them:

```plaintext
frontend_server/  (legacy) Node server that served React static files and proxied data requests
data_server/      (legacy) Python Flask server that served JSON/CSV files exported from BigQuery
```

### Backend Data Pipeline

```plaintext
run_ingestion/  →  GCS bucket  →  run_gcs_to_bq/  →  BigQuery  →  exporter/  →  GCS JSON  →  server/
(fetch raw data)                  (runs DataSource                  (splits county
                                   modules in /python)               files by state)
```

Each backend microservice is a Docker container triggered by Cloud Run. GitHub Actions workflows in `.github/workflows/dag*.yml` orchestrate the pipeline runs (one DAG per data source).

**Testing backend changes:** Push your branch to the shared `infra-test` branch to trigger a GCP deployment:

```bash
git push origin HEAD:infra-test -f
```

Then run the relevant DAG workflow from GitHub Actions against the test project.

## Git Workflow

This repo uses a **fork-based PR model**. `origin` points to the upstream
`SatcherInstitute/health-equity-tracker`. Each contributor has their own fork
added as a personal remote. Push feature branches to your fork, then open a PR
from there against `origin/main`.

```bash
# Check your remotes — your fork should be listed alongside origin
git remote -v

# Push a feature branch to your fork (sets upstream for subsequent git push/pull)
git push -u <your-remote-name> <branch-name>

# Open a PR from the GitHub URL printed in the push output, or via gh:
gh pr create --base main --head <your-github-username>:<branch-name>
```

**Never push feature branches directly to `origin`** (`SatcherInstitute`). The one
exception is the shared backend test branch:

```bash
git push origin HEAD:infra-test -f   # backend GCP deploy only
```

See `README.md` for full fork setup steps including how to add your fork as a remote.

**PR title convention:** Never put an issue number in the PR title (no `(#1234)` suffix). It is visually indistinguishable from a PR number at a glance. Use `Closes #NNNN` in the PR body instead.

## Work Tracking

Ideas progress through GitHub tools in stages — don't skip them:

- **Discussions** — unformed ideas; debate whether to build it and refine what it looks like
- **Issues** — concrete work; problem and intended solution are known, timeline is open
- **Milestones** — related issues grouped into a major prioritized push

Promote a discussion to issue(s) only once the solution is refined; create a milestone only when a group of issues becomes the team's next big push.

## Commands

Frontend commands run from `frontend/` — see `frontend/CLAUDE.md`.

Python tests run from the repo root with the venv activated:

```bash
source .venv/bin/activate
pip install python/data_server/ python/datasources/ python/ingestion/ && pytest python/tests/
pip install python/datasources/ && pytest python/tests/datasources/test_cdc_hiv.py -s
```

> **Note:** Many Python tests load real fixture CSVs from `data/` (555 files tracked in git). The CI sparse-checkout includes `data/` for this reason.

## Adding a New Health Topic

Both frontend and backend changes are required.

**Frontend** (see `frontend/CLAUDE.md` for file locations):

1. Create `MetricConfig<Topic>.ts` — define `MetricId`s, `DataTypeId`s, and chart configs
2. Register the new `DropdownVarId` in `DropDownIds.ts`
3. Create `DatasetMetadata<Topic>.ts` — list dataset IDs consumed
4. Create `<Topic>Provider.ts` — extends `VariableProvider`, maps metrics to dataset files
5. Register provider in `VariableProviderMap.ts`

**Backend:**

1. Create `python/datasources/<source>.py` — extends `DataSource`, implements `write_to_bq()`
2. Register in `python/datasources/data_sources.py`
3. Add a DAG GitHub Actions workflow `.github/workflows/dag<Source>.yml`

## Pre-Commit Hooks

All of the following run automatically on `git commit`:

- **cspell** — spell-checks staged `.md`, `.html`, `.tsx`, `.ts`, `.py`, `.yaml` files
- **biome** — formats and lints JS/TS/JSON (`npm run cleanup` in `frontend/`)
- **tsc** — TypeScript type check (no emit)
- **black** — formats Python
- **pylint** — lints Python
- **dotenv-linter** — lints `.env` files

## Key File Locations

| Purpose | Path |
|---|---|
| Python DataSource base class | `python/datasources/data_source.py` |
| Python BQ/GCS utilities | `python/ingestion/gcs_to_bq_util.py` |
| Python type definitions | `python/ingestion/het_types.py` |
| GCP pipeline DAG workflows | `.github/workflows/dag*.yml` |
| Frontend key files | See `frontend/CLAUDE.md` |
