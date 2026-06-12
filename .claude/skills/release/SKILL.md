---
name: release
description: Cut a new production release — pre-flight checks, auto-increment tag, publish GitHub release, monitor prod deploy, verify prod loads, targeted Playwright smoke tests, then trigger nightly E2E. Use when the user wants to ship a release or run /release.
---

# /release

Cut a new production release of Health Equity Tracker: verify dev is healthy, create the next incremental release tag with auto-generated GitHub release notes, wait for the prod deploy to complete, verify the production site, and kick off the nightly E2E suite.

---

## Step 1 — Pre-flight: branch and CI sanity

Confirm local main is up to date with origin:

```bash
git fetch origin main
git status
```

If the local branch is not `main` or is behind `origin/main`, print a warning and ask the user to confirm before continuing.

Check that all CI checks on the latest commit to `main` passed:

```bash
gh run list --branch main --limit 8 --json name,status,conclusion,createdAt \
  --jq '.[] | "\(.conclusion // .status) \(.name)"'
```

If any run shows `failure` or `cancelled` (ignore `in_progress` for the nightly cron):
- Print which workflow failed
- Stop and ask the user whether to proceed anyway

Check the most recent dev E2E run:

```bash
gh run list --workflow=e2eDev.yml --branch main --limit 3 \
  --json status,conclusion,createdAt,url \
  --jq '.[0] | "status=\(.status) conclusion=\(.conclusion // "pending") url=\(.url)"'
```

If conclusion is `failure`: stop and report. If `in_progress`: note it and ask the user whether to proceed.

---

## Step 2 — Determine next release tag

Fetch all tags and find the latest `ReleaseVX.XX` tag (exclude `-test` suffixes):

```bash
git fetch --tags origin
git tag --sort=-version:refname | grep -E '^ReleaseV[0-9]+\.[0-9]+$' | head -1
```

Parse the version number (e.g. `ReleaseV4.029` -> major=4, minor=29). Increment the minor by 1. Zero-pad the minor to match the existing width (e.g. `029` -> `030`). Construct the new tag: `ReleaseV4.030`.

Print the previous tag and the new tag, then ask the user to confirm:
> "Previous release: ReleaseV4.029. New tag will be: ReleaseV4.030. Proceed?"

Wait for confirmation before continuing.

---

## Step 3 — Quick Playwright smoke check against dev

Run a lightweight smoke check against `dev.healthequitytracker.org` to confirm the site is up and serving real content before cutting the release.

Write a temp test file at `frontend/playwright-tests/_release_dev_smoke.spec.ts`:

```ts
import { test, expect } from './utils/fixtures'

const BASE = 'https://dev.healthequitytracker.org'

test('dev: homepage loads with nav', async ({ page }) => {
  await page.goto(BASE)
  await expect(page.getByRole('navigation')).toBeVisible({ timeout: 15000 })
})

test('dev: explore data page renders a chart', async ({ page }) => {
  await page.goto(`${BASE}/exploredata?mls=1.diabetes-0.00&mlp=disparity&mlt=per100k`)
  await expect(page.locator('[data-testid="rate-chart"], svg.vx-bar-group, .recharts-wrapper, canvas').first()).toBeVisible({ timeout: 20000 })
})
```

Run it:

```bash
cd frontend
npx playwright install chromium 2>/dev/null
E2E_BASE_URL=https://dev.healthequitytracker.org npx playwright test \
  playwright-tests/_release_dev_smoke.spec.ts \
  --project=E2E_NIGHTLY --reporter=line 2>&1
```

Clean up:

```bash
rm frontend/playwright-tests/_release_dev_smoke.spec.ts
```

If either test fails: stop and report. Do not cut the release against a broken dev site.

---

## Step 4 — Publish the GitHub release

Create the release using GitHub's built-in note generation (compares commits between the previous tag and HEAD):

```bash
NEW_TAG="<new tag from Step 2>"
PREV_TAG="<prev tag from Step 2>"

gh release create "$NEW_TAG" \
  --title "$NEW_TAG" \
  --generate-notes \
  --notes-start-tag "$PREV_TAG" \
  --latest
```

This publishes the release immediately and automatically triggers `triggerRelease.yml`, which dispatches a `release-triggered` event to the production repo to begin the prod deploy.

Print the release URL returned by `gh release create`.

---

## Step 5 — Monitor the production deploy

Fetch the workflow run in the prod repo that was triggered by the release event. It may take 1-2 minutes to appear:

```bash
PROD_REPO="SatcherInstitute/health-equity-tracker-prod"

# Poll until the release-triggered run appears (up to 3 minutes)
for i in $(seq 1 18); do
  RUN=$(gh run list --repo "$PROD_REPO" --limit 5 \
    --json name,status,conclusion,url,databaseId \
    --jq '[.[] | select(.name | test("release"; "i"))] | first | select(. != null) | "\(.databaseId) \(.status) \(.conclusion // "pending") \(.url)"' 2>/dev/null)
  echo "[$i/18] $RUN"
  echo "$RUN" | awk '{print $2}' | grep -qE "^completed" && break
  echo "$RUN" | awk '{print $2}' | grep -qE "^in_progress|^queued|^waiting" && sleep 10 && continue
  # Not found yet
  sleep 10
done
```

Once found, poll until it completes (Cloud Run deploys can take 5-15 minutes if Terraform resources changed):

```bash
RUN_ID=$(echo "$RUN" | awk '{print $1}')
gh run watch "$RUN_ID" --repo "$PROD_REPO" --exit-status
```

If the deploy fails: print the URL and stop. Do not proceed to prod verification.

If the deploy workflow is not found after 3 minutes: warn the user and ask whether to continue manually.

---

## Step 6 — Parse release notes for smoke test targets

Fetch the generated release notes to identify which features landed:

```bash
gh release view "$NEW_TAG" --json body -q .body
```

Scan the release notes for commits that include `feat(`, `fix(`, or other notable changes. Extract up to 5 of the most significant ones (prefer `feat` over `fix`, prefer frontend over backend). These will inform the targeted Playwright assertions in Step 7.

Also extract the full What's Changed list to include in the final summary.

---

## Step 7 — Playwright smoke against production

Write a temp test file at `frontend/playwright-tests/_release_prod_smoke.spec.ts`.

Always include these baseline assertions:

```ts
import { test, expect } from './utils/fixtures'

const BASE = 'https://healthequitytracker.org'

test('prod: homepage loads with nav', async ({ page }) => {
  await page.goto(BASE)
  await expect(page.getByRole('navigation')).toBeVisible({ timeout: 15000 })
  await expect(page).toHaveTitle(/Health Equity Tracker/i)
})

test('prod: explore data page renders', async ({ page }) => {
  await page.goto(`${BASE}/exploredata?mls=1.diabetes-0.00&mlp=disparity&mlt=per100k`)
  await expect(page.locator('[data-testid="rate-chart"], svg.vx-bar-group, .recharts-wrapper, canvas').first()).toBeVisible({ timeout: 20000 })
})
```

Then add one targeted assertion per notable `feat` commit from Step 6. Base each on what the commit description implies changed. For example:
- A tooltip feature -> assert a tooltip appears on chart hover
- A geo-selector feature -> assert the geo picker renders
- A landing page change -> assert specific content on the home page

Keep assertions shallow: a visible element or URL param is sufficient. This is a smoke check, not a regression suite.

Run against prod:

```bash
cd frontend
E2E_BASE_URL=https://healthequitytracker.org npx playwright test \
  playwright-tests/_release_prod_smoke.spec.ts \
  --project=E2E_NIGHTLY --reporter=line 2>&1
```

Clean up:

```bash
rm frontend/playwright-tests/_release_prod_smoke.spec.ts
```

Report pass/fail per test. Failures are warnings, not blockers (the release is already live) -- but call them out clearly so a human can investigate.

---

## Step 8 — Trigger the nightly prod E2E

Dispatch the scheduled nightly E2E workflow to run immediately against prod:

```bash
gh workflow run e2eScheduled.yml --repo SatcherInstitute/health-equity-tracker --ref main
```

Then fetch the newly triggered run ID and print its URL:

```bash
sleep 5
gh run list --workflow=e2eScheduled.yml --limit 3 \
  --json status,url,createdAt \
  --jq '.[0] | "status=\(.status) url=\(.url)"'
```

---

## Step 9 — Final summary

Print a release summary:

```
Release: <tag>
GitHub release: <url>
Prod deploy: completed
Prod smoke tests: <X passed, Y failed>
Nightly E2E: triggered — <run url>

What's Changed:
<paste the What's Changed block from the release notes>
```

If any backend pipeline changes shipped in this release (any commit touching `python/`, `run_ingestion/`, `run_gcs_to_bq/`, or `.github/workflows/dag*.yml`): print a reminder:

> "Backend pipeline changes detected. If any data sources changed, rerun the affected DAG workflows from the production repo's GitHub Actions tab."

---

## Notes

- Never push feature branches to `origin`. Tags and releases go directly to `origin` (SatcherInstitute) -- that is correct and intentional for releases.
- The `--generate-notes` flag uses GitHub's comparison between `--notes-start-tag` and HEAD to build the changelog automatically. Do not manually craft release notes.
- Only `Set as the latest release` should be set (no pre-release flag). `--latest` in the CLI maps to this.
- The prod deploy is in a private repo (`health-equity-tracker-prod`). Access via `gh run list --repo SatcherInstitute/health-equity-tracker-prod` works as long as the user has access to that repo.
- Playwright failures in Step 7 are warnings only -- the release is already published and the prod deploy has completed. Surface them clearly but do not imply the release can be rolled back automatically.
