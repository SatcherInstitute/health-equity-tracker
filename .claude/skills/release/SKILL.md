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

## Step 2 — Determine next release tag and changelog base

Fetch all tags and find the latest `ReleaseVX.XX` tag (exclude `-test` suffixes):

```bash
git fetch --tags origin
git tag --sort=-version:refname | grep -E '^ReleaseV[0-9]+\.[0-9]+$' | head -3
```

Parse the version number of the highest tag (e.g. `ReleaseV4.030` -> major=4, minor=30). Increment the minor by 1. Zero-pad to match the existing width. Construct `NEW_TAG` (e.g. `ReleaseV4.031`).

**Then check whether the highest existing tag actually deployed successfully to prod.** A tag that was published but whose prod deploy failed is still the correct base for incrementing the version number -- but NOT the correct base for the changelog diff. Shipping a new tag without including those changes in the diff means the release notes will be incomplete and the user won't know what they're actually shipping.

Check the prod repo for the most recent release workflow run:

```bash
PROD_REPO="SatcherInstitute/health-equity-tracker-prod"
gh run list --repo "$PROD_REPO" --limit 10 \
  --json name,status,conclusion,url,createdAt \
  --jq '[.[] | select(.name | test("release"; "i"))] | .[0:3] | .[] | "\(.conclusion // .status) \(.createdAt) \(.url)"'
```

Find the most recent run with `conclusion == "success"`. Then find which release tag triggered it by correlating timestamps. Use `git for-each-ref` (not `git tag`) because it includes tagger dates:

```bash
git for-each-ref --sort=-version:refname \
  --format='%(refname:short) %(taggerdate:iso8601)' \
  'refs/tags/ReleaseV*' | grep -v '\-test' | head -5
```

Compare each tag's date against the successful workflow run's `createdAt` to find the tag that triggered it.

Set two variables:
- `PREV_TAG`: the highest existing tag (used for version increment only)
- `DIFF_BASE`: the last tag whose prod deploy succeeded (used for changelog diff)

If `DIFF_BASE != PREV_TAG`, there are one or more tags whose deploys failed. Print a clear warning:

```
WARNING: $PREV_TAG was tagged but its prod deploy failed (or is unverified).
New tag will be $NEW_TAG.
Changelog will diff from $DIFF_BASE (last confirmed successful deploy) — this includes all changes from $DIFF_BASE through HEAD, across $N failed/skipped releases.
Never re-run a failed deploy. Always cut a new tag so the release history stays accurate.
```

If all recent tags deployed successfully, `DIFF_BASE == PREV_TAG` and there is nothing special to note.

Store `PREV_TAG`, `DIFF_BASE`, and `NEW_TAG` for use in later steps. Do not ask for confirmation here -- the single consent gate in Step 4 covers both the tag and the changelog.

---

## Step 3 — Quick Playwright smoke check against dev

Run a lightweight smoke check against `dev.healthequitytracker.org` to confirm the site is up and serving real content before cutting the release.

Write a temp test file at `frontend/playwright-tests/_release_dev_smoke.spec.ts`:

```ts
import { test, expect } from './utils/fixtures'

const BASE = 'https://dev.healthequitytracker.org'

test('dev: homepage loads with nav', async ({ page }) => {
  await page.goto(BASE)
  await expect(page.getByRole('navigation').first()).toBeVisible({ timeout: 15000 })
})

test('dev: explore data page renders a chart', async ({ page }) => {
  await page.goto(`${BASE}/exploredata?mls=1.diabetes-3.00&group1=All`)
  await expect(page.locator('#rate-chart')).toBeVisible({ timeout: 30000 })
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

## Step 4 — Release summary and consent

All pre-checks have passed. Before publishing, show the user exactly what is about to ship.

Fetch the commits between `DIFF_BASE` and HEAD:

```bash
git log "$DIFF_BASE"..HEAD --oneline --no-merges
```

Group them by prefix (`feat`, `fix`, `chore`, `docs`, `refactor`, etc.) and print a short summary:

```
Ready to publish $NEW_TAG  (previous tag: $PREV_TAG, changelog from: $DIFF_BASE)

[if DIFF_BASE != PREV_TAG]
NOTE: $PREV_TAG deploy failed — this release includes all changes since $DIFF_BASE.

Features
  - <commit subject>

Fixes
  - <commit subject>

Other (chore/docs/refactor/etc.)
  - <commit subject>

$N commits since $DIFF_BASE
Dev smoke: passed
CI: all green
```

Omit any group that has no commits. Keep subjects to one line each -- truncate at 80 chars if needed.

Then ask:
> "Publish $NEW_TAG to production? (yes/no)"

Wait for an explicit "yes" before continuing. Any other answer stops the skill.

---

## Step 5 — Publish the GitHub release

Create the release using GitHub's built-in note generation (compares commits between the previous tag and HEAD):

```bash
NEW_TAG="<new tag from Step 2>"
DIFF_BASE="<diff base from Step 2>"

gh release create "$NEW_TAG" \
  --title "$NEW_TAG" \
  --generate-notes \
  --notes-start-tag "$DIFF_BASE" \
  --latest
```

If `DIFF_BASE != PREV_TAG`, the generated notes will correctly span all commits since the last successful deploy -- not just since the failed tag.

This publishes the release immediately and automatically triggers `triggerRelease.yml`, which dispatches a `release-triggered` event to the production repo to begin the prod deploy.

Print the release URL returned by `gh release create`.

---

## Step 5b — Annotate any failed-deploy tags

If `DIFF_BASE != PREV_TAG`, there are one or more tags between `DIFF_BASE` and `PREV_TAG` (inclusive of `PREV_TAG`, exclusive of `DIFF_BASE`) whose deploys failed. Annotate each one so the release history is self-documenting.

For each failed tag, fetch its current release notes and prepend a warning block:

```bash
FAILED_TAG="<each tag between DIFF_BASE and PREV_TAG>"

CURRENT_BODY=$(gh release view "$FAILED_TAG" --json body -q .body)

HEADER="> [!WARNING]
> **Deploy failed.** This tag was published but never successfully deployed to production. Its changes shipped in $NEW_TAG."

gh release edit "$FAILED_TAG" --notes "${HEADER}

${CURRENT_BODY}"
```

Run this for every failed tag (there may be more than one if multiple tags piled up). Do not alter the title or latest flag on the failed tags -- just prepend the warning to the body.

---

## Step 6 — Monitor the production deploy

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

## Step 7 — Parse release notes for smoke test targets

Fetch the generated release notes to identify which features landed:

```bash
gh release view "$NEW_TAG" --json body -q .body
```

Scan the release notes for commits that include `feat(`, `fix(`, or other notable changes. Extract up to 5 of the most significant ones (prefer `feat` over `fix`, prefer frontend over backend). These will inform the targeted Playwright assertions in Step 7.

Also extract the full What's Changed list to include in the final summary.

---

## Step 8 — Playwright smoke against production

Write a temp test file at `frontend/playwright-tests/_release_prod_smoke.spec.ts`.

Always include these baseline assertions:

```ts
import { test, expect } from './utils/fixtures'

const BASE = 'https://healthequitytracker.org'

test('prod: homepage loads with nav', async ({ page }) => {
  await page.goto(BASE)
  await expect(page.getByRole('navigation').first()).toBeVisible({ timeout: 15000 })
  await expect(page).toHaveTitle(/Health Equity Tracker/i)
})

test('prod: explore data page renders', async ({ page }) => {
  await page.goto(`${BASE}/exploredata?mls=1.diabetes-3.00&group1=All`)
  await expect(page.locator('#rate-chart')).toBeVisible({ timeout: 30000 })
})
```

Then add one targeted assertion per notable `feat` commit from Step 7. Base each on what the commit description implies changed. For example:
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

## Step 9 — Trigger the nightly prod E2E

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

## Step 10 — Final summary

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
- Playwright failures in Step 8 are warnings only -- the release is already published and the prod deploy has completed. Surface them clearly but do not imply the release can be rolled back automatically.
