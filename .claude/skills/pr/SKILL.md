---
name: pr
model: haiku
description: Polish an open PR for review. Classify the diff by bucket (frontend / python / go) and run only the relevant checks — Biome+tsc+Playwright for frontend, black+pylint+pytest for python, build+test for go. Address open review comments, update CLAUDE.md docs if stale, rewrite the PR title and description, then watch CI until all checks pass (diagnosing and reporting any failures). Use when the user wants to close out a PR, verify it's ready for review, or run /pr.
---

# /pr

Polish the open PR so it's ready for human review: auto-fix formatting, address review comments, update docs, verify tests, rewrite the PR description, then wait for all CI checks to pass and report the result.

The user may pass a PR number as an argument (e.g. `/pr 4764`). If none is given, detect the open PR from the current branch.

---

## Step 1 — Identify the PR, check out its branch, and derive context

Pass the PR number through when one was given (`gh pr view <number> ...`); omit it to detect the PR from the current branch.

```bash
gh pr view <number> --json number,title,body,headRefName,baseRefName
```

If no open PR is found: print an error and stop.

**Check out the PR's branch before doing anything else.** When a PR number is passed, the working tree is often still on `main` (or another branch). Every later step — Biome, tsc, the behind-main merge check, review fixes — must run against the PR's own branch, so switch to it now:

```bash
gh pr checkout <number>
```

`gh pr checkout` fetches the head branch from a fork if it isn't local yet, sets up tracking, and checks it out — a raw `git checkout <headRefName>` would fail for a not-yet-fetched fork branch, which is the norm in this repo's fork-based workflow. Skip this when no PR number was given (you are already on the branch).

If the working tree is dirty and the checkout fails, stop and ask the user to commit or stash first — do not discard changes.

**Ensure the person running this skill is assigned.** A PR opened ad hoc (not through this skill) often has no assignee. `@me` resolves to whoever is authenticated via `gh`, not a hardcoded name, so this stays correct if someone else runs the skill. Add one unconditionally — `--add-assignee` is a no-op if already set:

```bash
gh pr edit <number> --add-assignee @me
```

Then gather everything the rest of the skill needs. **This is one call, not six.** Each of these is independent, so splitting them across turns pays a full context re-read per line for a few hundred tokens of output:

```bash
REPO=$(gh repo view --json nameWithOwner -q .nameWithOwner)
GH_USER=$(gh api user -q .login)
FORK_REMOTE=$(git remote -v | grep -i "github.com[/:]${GH_USER}/" | head -1 | awk '{print $1}')
git fetch origin main --quiet
echo "REPO=$REPO FORK=$FORK_REMOTE"
echo "=== changed files ==="; git diff origin/main --name-only
echo "=== behind main? (lines with < are missing commits) ==="; git log --oneline --left-right origin/main...HEAD
echo "=== commits on branch ==="; git log origin/main..HEAD --oneline
```

If `FORK_REMOTE` is empty, print a warning and ask the user to identify their fork remote with `git remote -v`, then continue using that name.

That single block covers the fork remote, the file classification in Step 1b, the behind-main check in Step 2c, and the commit list Step 6 needs. Do not re-run any of them later; reuse this output.

---

## Step 1b — Classify the PR by changed files

Not every step applies to every PR. The frontend steps (Biome/tsc, Netlify preview, Playwright) waste time on a backend PR, and the backend checks (pytest, `go test`) are pointless on a frontend PR. Use the changed-file list already printed in Step 1; do not run `git diff --name-only` again.

Bucket the changed paths:

- **frontend** — any path under `frontend/`
- **python** — any path under `python/` or `exporter/`
- **go** — any path under `server/` (ignore the embedded frontend build output)
- **infra/docs** — only `.github/`, `*.md`, or config files changed

A PR can land in more than one bucket (a new health topic touches both `frontend/` and `python/`); run every matching bucket's checks. Each check step below is tagged with the bucket(s) it belongs to — **skip a step whose bucket the PR doesn't touch** and note the skip briefly. Steps with no bucket tag (behind-main, review feedback, doc freshness, PR description, CI watch) always run.

---

## Step 2 — Frontend static checks: Biome auto-fix and type check — *frontend bucket only*

Biome, tsc, and Vitest all run in CI. Run Biome and tsc locally anyway to catch issues before the push — but **do not add these to the test plan checklist**; they are CI's job, not the human reviewer's.

```bash
cd frontend
npm run cleanup
npx tsc --noEmit
```

If cleanup modifies any files, stage and commit them before the tsc run:

```bash
git add -p
git commit -m "style: biome auto-fix"
```

If tsc exits non-zero: fix all errors before continuing.

```bash
git push $FORK_REMOTE HEAD
```

---

## Step 2-py — Python checks: format, lint, and scoped tests — *python bucket only*

Backend PRs have no browser preview and no Playwright step, so `pytest` **is** the behavioral verification here — the equivalent of what Playwright does for the frontend. Run it locally (scoped to the affected package) rather than leaving it entirely to CI. Unlike the large Vitest suite, a single Python package's tests run in ~1s and are deterministic.

`black` and `pylint` are the static-check parallel to Biome/tsc; the pre-commit hook already ran them, but run them here too so a hook that was skipped or an unstaged file can't slip through.

```bash
# Return to repo root first — Step 2 (frontend) may have left us in frontend/
cd "$(git rev-parse --show-toplevel)" && source .venv/bin/activate
black --check python/ exporter/
pylint <changed-package>            # e.g. exporter or python/datasources
```

Then run the tests for the package(s) this PR touched:

```bash
# Exporter changes
python -m pytest exporter/test_exporter.py -q

# python/ datasource or ingestion changes — scope to the touched module(s).
# Editable installs (-e) so a mid-run code fix is reflected without reinstalling.
pip install -e python/datasources/ -e python/ingestion/ && pytest python/tests/<touched_test>.py -q
```

If `black` reformats or `pylint` flags anything: fix, stage explicitly, commit, and push. If any test fails: fix it before continuing — a red test here is a red DAG later. Record the passing test command and count; it becomes the test plan checklist in Step 6.

```bash
git push $FORK_REMOTE HEAD
```

---

## Step 2-go — Go checks: build and test — *go bucket only*

`server/` is the combined Go binary. Build and test the affected packages locally; `go test` is the behavioral verification for Go changes, the same role `pytest` plays for Python.

```bash
# Subshell keeps the working dir clean for later steps that expect repo root
(cd server && go build ./... && go test ./...)   # or scope: (cd server && go test ./pkg/...)
```

Fix any build or test failure before continuing. Record the passing `go test` command for the Step 6 test plan.

```bash
git push $FORK_REMOTE HEAD
```

---

## Step 2b — Derive Netlify deploy preview URL — *frontend bucket only*

The preview URL is deterministic from the PR number — no need to fetch a comment:

```
https://deploy-preview-{number}--health-equity-tracker.netlify.app
```

Identify the single most useful deep-link route that shows the core feature. Append URL params so the reviewer lands directly on the changed UI — including any param that opens the specific card, panel, or modal the PR touches (`report-insight`, `topic-info`, `multiple-maps`, a `#card-id` hash), so the reviewer never has to click their way there.

**Never guess route strings.** All app routes are defined as constants in `frontend/src/utils/internalRoutes.ts`. Look up the correct path there before constructing the URL:

```bash
grep -n "PAGE_LINK\|_PATH\|_ROUTE" frontend/src/utils/internalRoutes.ts
```

**Write the URL to a file immediately.** Holding it only in your head is how it goes missing from the final body — the Step 6 template gets filled in from scratch and the Preview line silently disappears:

```bash
echo "<full deep link>" > /tmp/pr-preview-url.txt
```

Step 6 reads this file rather than reconstructing the URL. If the file is missing when Step 6 runs, that is a bug in this run — go back and build it.

---

## Step 2c — Check if branch is behind main

Read this off the Step 1 output; the fetch and the `left-right` log already ran there.

Parse the output for lines starting with `<` (commits on `origin/main` not on this branch). If any exist, merge immediately without asking:

```bash
git merge origin/main --no-edit
git push $FORK_REMOTE HEAD
```

If the merge produces conflicts: stop, print the conflicting files, and ask the user to resolve them manually before continuing.

**If up to date:** Note "Branch is up to date with origin/main" and continue.

---

## Step 3 — Evaluate and address code review feedback

**This step is never skipped, and never skipped because the PR looks small or the flagged code was written minutes ago.** Bot reviewers post asynchronously, so a PR that had no comments when the run started often has them by now. Step 6 will not let the body be written while a thread is still unresolved.

Fetch all reviews and inline comments on the PR:

One call, and fetch the thread IDs at the same time so resolving later needs no extra round trip:

```bash
echo "=== reviews ==="
gh api repos/$REPO/pulls/<number>/reviews \
  --jq '[.[] | {user: .user.login, state: .state, body: .body}]'
echo "=== inline comments ==="
gh api repos/$REPO/pulls/<number>/comments \
  --jq '[.[] | {user: .user.login, path: .path, line: .line, body: .body, id: .id}]'
echo "=== thread ids (map databaseId -> PRRT_ id for resolving) ==="
gh api graphql -f query='{ repository(owner: "SatcherInstitute", name: "health-equity-tracker") { pullRequest(number: <number>) { reviewThreads(first: 50) { nodes { id isResolved comments(first: 1) { nodes { databaseId } } } } } } }' \
  --jq '.data.repository.pullRequest.reviewThreads.nodes[] | select(.isResolved | not) | {thread: .id, comment: .comments.nodes[0].databaseId}'
```

For each review or inline comment, work through three questions before touching any code:

**1. Is the concern actually valid?**
Read the flagged code in context. Check whether the reviewer's premise is correct — automated reviewers (Gemini, CodeRabbit, etc.) frequently misread control flow, miss surrounding context, or flag patterns that are intentional. If the concern is based on a misunderstanding, it is not valid regardless of who raised it.

**2. Is it worth addressing?**
A valid concern still may not warrant a change. Consider: is this a real bug or a hypothetical edge case that can't happen? Does it conflict with an existing project convention? Is the suggested change more complex than the problem it solves? Cosmetic style suggestions that contradict the project's existing patterns are generally not worth addressing.

**3. If worth addressing — what is the right fix for *this* codebase?**
Do not copy the reviewer's proposed solution verbatim. Read the surrounding code, check how similar patterns are handled elsewhere in the project, and implement the fix in a way that matches the codebase's conventions. The reviewer's suggestion is a starting point for understanding the problem, not a diff to apply.

Then act:

- **Address it**: implement the fix your way, commit, and push:
  ```bash
  git add <files>
  git commit -m "address review: <short description>"
  git push $FORK_REMOTE HEAD
  ```
  Reply and resolve in the same call. The mutation needs the **thread's** node ID (`PRRT_...`), not the comment's (`PRRC_...`); Step 3's first block already printed the mapping, so look it up there rather than re-querying:
  ```bash
  gh api repos/$REPO/pulls/<number>/comments/<comment_id>/replies \
    -f body="Fixed — <one line>." >/dev/null && \
  gh api graphql -f query='mutation { resolveReviewThread(input: {threadId: "<PRRT_id>"}) { thread { isResolved } } }'
  ```
  When several threads are addressed by the same commit, put every reply-and-resolve pair in one call.
- **Decline it**: reply with one sentence explaining why, then leave the thread open:
  ```bash
  gh api repos/$REPO/pulls/<number>/comments/<comment_id>/replies \
    -f body="Not changing — <one line reason>."
  ```

If there are no unresolved reviews or comments, note that and continue.

---

## Step 4 — Assess doc freshness

Identify which docs cover the code this PR touches: the service-level `CLAUDE.md` nearest the changed files (`frontend/CLAUDE.md`, `server/CLAUDE.md`, `python/CLAUDE.md`, `exporter/CLAUDE.md`), plus the root `CLAUDE.md` and `README.md`. Read the relevant ones in full, issuing all the `Read` calls in a single message.

Compare against the full PR diff. The file list came from Step 1, so only the diff body is still needed:

```bash
git diff origin/main
```

Ask two questions, and treat both as first-class:

1. **Staleness:** does anything this PR changed contradict something the docs already say? Any section counts: commands, key file tables, architecture descriptions, invariants, conventions, workflows, environment setup. If the docs describe behavior or structure this PR altered, update them.
2. **Missing coverage:** does this PR introduce something a new contributor (human or LLM) would need for onboarding that is as important as what the docs already cover? New patterns, new invariants, new commands or scripts, new key files worth adding to the tables. If yes, add it, matching the style and brevity of the surrounding doc.

Only write durable invariants, never ephemeral task details, and no commentary about the PR itself (that belongs in the PR description, not the docs).

If updates are needed: edit the relevant docs, then commit:

```bash
git add frontend/CLAUDE.md CLAUDE.md README.md   # only files actually changed
git commit -m "docs: update CLAUDE.md to reflect <what changed>"
git push $FORK_REMOTE HEAD
```

---

## Step 5 — Audit and verify the test plan

The test plan checklist is **only for behavioral tests that verify the change actually works** — not static tooling. Never list TypeScript, Biome, or Vitest results; those are CI's job.

What counts as behavioral verification depends on the bucket:

- **frontend** — a browser interaction a human reviewer or Playwright test can confirm (URL params, navigation, UI state, link resolution). Verify these with Playwright in **Step 5a**.
- **python / go** — the scoped `pytest` / `go test` run from Step 2-py / Step 2-go. Backend has no browser, so these tests *are* the behavioral verification; list the passing command and count (e.g. `pytest exporter/test_exporter.py` — 9 passed) as checked items. **Skip Step 5a** (no dev server, no Playwright) for a backend-only PR.

Read the current PR body. Extract all `- [ ]` and `- [x]` checklist items. Remove any that reference static tooling (tsc, Biome, lint). Remove or rewrite items that refer to code that was removed or refactored.

### 5-0 — Regression-check existing E2E specs for changed features — *frontend bucket only*

**Critical context:** CI runs two Playwright projects with different scopes:

- `E2E_CI` (`*.ci.spec.ts`) — runs on every PR push via `runFrontendTests.yml` against a local `vite preview` build
- `E2E_NIGHTLY` (`*.spec.ts` without `.ci.`) — runs only after merging to main and deploying the dev site (`e2eDev.yml`)

Most existing topic/feature specs (e.g. `drinking.spec.ts`, `hiv.spec.ts`) are nightly-only. If a PR changes how one of those features renders (column headers, chart titles, metric type switches like `per_100k` → `pct_rate`), CI shows green on the PR but the nightly spec fails post-merge. This step catches those regressions locally before they land.

Any PR that changes how a metric is labeled, typed, or displayed (column headers, chart titles, aria-labels, short labels, metric type switches like `per_100k` → `pct_rate`) can silently break an existing spec that expects the old wording.

**Identify affected spec files:**

```bash
# See what source files changed
git diff origin/main --name-only -- frontend/src/
```

For each changed config or component file, extract candidate selector strings from the diff — any quoted string in a `columnTitleHeader`, `chartTitle`, `fullDisplayName`, `shortLabel`, or aria-label field is likely used as a locator in a spec:

```bash
git diff origin/main -- frontend/src/ | grep -E '^\+.*"[A-Z][^"]{5,}"' | head -30
```

Then grep the spec directory for files that reference the changed feature name or any of those strings:

```bash
# Example: if excessive_drinking changed
grep -rl "excessive.drinking\|Excessive drinking" frontend/playwright-tests/*.spec.ts

# Also check for the old string directly — if it no longer exists in the UI, specs using it will fail
git diff origin/main -- frontend/src/ | grep -E '^-.*"[A-Z][^"]{5,}"' | \
  sed -E 's/.*"([^"]+)".*/\1/' | while read s; do
    grep -rl "$s" frontend/playwright-tests/*.spec.ts 2>/dev/null
  done | sort -u
```

**Start the dev server** (connects to the live dev GCP backend — no build step needed, data fetches work).

Use `npm run dev` exactly as written; never substitute a bare `npx vite`, even for a scratch server on another port. The npm script wraps Vite in `env-cmd -f .env.localhost`, which supplies `VITE_BASE_API_URL`. Without it the app renders but every data fetch 404s, so specs fail with "element(s) not found" and the missing env looks like a product regression. A scratch server must keep the wrapper: `npx env-cmd -f .env.localhost npx vite --port 3100`.

```bash
cd frontend
lsof -ti :3000 | xargs kill -9 2>/dev/null; sleep 1
npm run dev > /tmp/het-dev-server.log 2>&1 &
DEV_PID=$!
TIMEOUT=60
until curl -s http://localhost:3000 > /dev/null 2>&1; do
  if [ $TIMEOUT -le 0 ]; then echo "Dev server failed to start" >&2; kill $DEV_PID 2>/dev/null; exit 1; fi
  sleep 1; TIMEOUT=$((TIMEOUT - 1))
done
```

**Run the matched existing specs:**

```bash
cd frontend
E2E_BASE_URL=http://localhost:3000 npx playwright test \
  playwright-tests/<matched>.spec.ts \
  --project=E2E_NIGHTLY --reporter=line 2>&1
```

If no spec files match, note that and skip this step.

**If a spec fails:** the test expected the old behavior. Update the spec to match the new labels or selectors introduced by this PR, commit the fix, and re-run until it passes:

```bash
git add frontend/playwright-tests/<spec>.spec.ts
git commit -m "fix(e2e): update <topic> spec to match <what changed>"
git push $FORK_REMOTE HEAD
```

Do not proceed until all matched existing specs pass. This is the only gate that catches E2E regressions before they hit the post-merge CI run.

---

### 5a — Run Playwright for browser-verifiable items — *frontend bucket only*

For every remaining unchecked item that describes a browser interaction (URL params, navigation behavior, UI state, link resolution), write and run a targeted Playwright test.

**If the dev server was already started in step 5-0, skip the startup block below and reuse `$DEV_PID`.** Otherwise, start it now:

```bash
cd frontend
# Kill any leftover dev server so we always land on port 3000
lsof -ti :3000 | xargs kill -9 2>/dev/null; sleep 1
npm run dev > /tmp/het-dev-server.log 2>&1 &
DEV_PID=$!
# Poll until the server responds (timeout after 60s)
TIMEOUT=60
until curl -s http://localhost:3000 > /dev/null 2>&1; do
  if [ $TIMEOUT -le 0 ]; then echo "Dev server failed to start" >&2; kill $DEV_PID 2>/dev/null; exit 1; fi
  sleep 1; TIMEOUT=$((TIMEOUT - 1))
done
```

**Write a temp test file** at `frontend/playwright-tests/_pr_verify.spec.ts`. Each test should correspond to one checklist item — use a descriptive test name that matches the checklist wording so results map back clearly. Example structure:

```ts
import { test, expect } from './utils/fixtures'

const BASE = 'http://localhost:3000'

test('atl and extremes cleared after mode switch', async ({ page }) => {
  await page.goto(`${BASE}/exploredata?mls=1.hiv-3.00&mlp=disparity&atl=true&extremes=true`)
  await page.getByRole('button', { name: /compare geographies/i }).click()
  await expect(page).not.toHaveURL(/atl=true/)
  await expect(page).not.toHaveURL(/extremes=true/)
})
```

**Run only the temp file** against the `E2E_NIGHTLY` project (Chromium, no testMatch restriction):

```bash
cd frontend
E2E_BASE_URL=http://localhost:3000 npx playwright test playwright-tests/_pr_verify.spec.ts --project=E2E_NIGHTLY --reporter=line 2>&1
```

**Map results back to checklist:**
- Test passed → `- [x]`
- Test failed → leave `- [ ]` and add a note: `(Playwright: <short failure reason)` so the human reviewer knows what to investigate manually
- Item not automatable (requires human judgment, live external service, or next CI run) → **preserve its current state** (`- [x]` stays checked, `- [ ]` stays unchecked). The one exception: if recent commits clearly invalidate a previously-checked item (e.g., the feature it described was reverted, the file it references was removed, or the behavior it describes no longer matches the code), un-check it and add a note explaining why.

**Clean up** after all tests run:

```bash
kill $DEV_PID 2>/dev/null
rm frontend/playwright-tests/_pr_verify.spec.ts
```

### 5b — Gap check

Reuse the diff already read in Step 4. Only fetch more if Step 4 was skipped:

```bash
git diff origin/main -- frontend/src/
```

Add any missing behavioral items the diff introduces but the checklist doesn't cover. Each item must describe a specific interaction and observable outcome — not vague phrases like "test the feature." Only add items that go beyond what CI already verifies.

Carry the final audited checklist into Step 6.

---

## Step 6 — Update the PR title and description

**First, confirm no review thread is still open.** Reviews land asynchronously, so a bot may have posted since Step 3 ran:

```bash
gh api graphql -f query='{ repository(owner: "SatcherInstitute", name: "health-equity-tracker") { pullRequest(number: <number>) { reviewThreads(first: 50) { nodes { id isResolved comments(first: 1) { nodes { databaseId body } } } } } } }' \
  --jq '[.data.repository.pullRequest.reviewThreads.nodes[] | select(.isResolved | not)] | length'
```

If this is anything but `0`, go back to Step 3 and work the open threads before writing the body. A declined finding still needs its reply posted; only a thread that was answered may stay open, and the reply must already be there.

The commit list came from Step 1 and the diff from Step 4. You should need no new calls here; if a commit landed since Step 1, re-run just `git log origin/main..HEAD --oneline`.

Update the PR title (under 70 chars) and body. **Read the existing PR body first** (already fetched in Step 1). Use it as the starting point:

- **Summary bullets:** Keep the existing bullets if they still accurately describe the diff. Only add, remove, or rewrite bullets when the diff has changed significantly since they were written. Do not replace a well-written human summary with a generic one.
- **Test plan:** Use the audited checklist from Step 5 (checked state preserved). Do not regenerate from scratch.
- **Impact:** Always aim to quantify what the PR improves — see Impact rules below.
- **Issue links:** Preserve any existing issue-closing keywords (`Closes`, `Fixes`, `Resolves`, `Fix`, `Close`, `Resolve` — GitHub recognizes all of these) followed by `#NNNN`.
- **Bot-generated blocks:** Preserve per the rule below.

Keep the description **short and focused** — a few tight bullets, no padding.

**Title rules:**
- Under 70 chars
- **Never include an issue number in the title** — no `(#1234)` suffix. It looks like a PR number at a glance and makes titles hard to scan. `Closes #NNNN` belongs in the body only.

Use this template:

```markdown
**Preview:** [<short label>](<netlify-url>/<route>?<params>)

## Summary

- <bullet — what changed and why, one line each>

## Impact

- <measured number, % delta, or cited best practice — see Impact rules>

## Test plan

- [x] <behavioral item verified by Playwright>
- [ ] <manual interaction still needed>

🤖 Generated with [Claude Code](https://claude.com/claude-code)
```

**Preview line rules:**
- *Frontend bucket only* — a backend-only PR has no UI to preview, so **omit the Preview line entirely** rather than linking a preview that shows nothing changed
- Always the first line of the body so reviewers can click straight to the feature
- Use the URL recorded in `/tmp/pr-preview-url.txt` by Step 2b. Do not retype it from memory
- One deep link with the URL params needed to land directly on the changed UI, including whatever opens the specific card or panel (e.g. `?mls=1.hiv-3.06&mlp=disparity&report-insight=true`)

**The preview link must be verified before the body is written.** A link that 404s, or that lands on the report without opening the thing the PR changed, is worse than no link — the reviewer clicks it, sees nothing different, and assumes the PR does nothing. HTTP status alone proves nothing here: this is an SPA, so every path returns 200, including misspelled ones. Load it and assert the changed UI is on screen.

Wait for Netlify to publish the preview for the current head commit, then check it:

```bash
# pipefail so a failing `gh pr checks` isn't masked by grep's exit status —
# the Netlify line prints either way, including when the deploy failed.
set -o pipefail
gh pr checks <number> --watch --interval 15 --fail-fast 2>&1 | grep -i netlify || {
  echo "Netlify preview did not publish cleanly — do not link it yet." >&2
}

cat > /tmp/check-preview.mjs <<'EOF'
import { chromium } from '@playwright/test'
const [url, needle] = process.argv.slice(2)
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
await page.goto(url, { waitUntil: 'domcontentloaded' })
let ok = true
try {
  await page.getByText(needle, { exact: false }).first()
    .waitFor({ state: 'visible', timeout: 45000 })
} catch { ok = false }
console.log({ url, needle, visible: ok })
await page.screenshot({ path: '/tmp/preview-check.png' })
await browser.close()
process.exit(ok ? 0 : 1)
EOF

# Playwright resolves from frontend/node_modules, so run it from frontend/.
# The needle is text that only appears when the changed UI is actually open.
(cd frontend && node /tmp/check-preview.mjs "$(cat /tmp/pr-preview-url.txt)" "<distinctive on-screen text>")
```

Then look at `/tmp/preview-check.png` to confirm the reviewer lands where you intend. If the check fails, fix the params or route and re-verify — do not paste an unverified link and move on.

**Summary rules:**
- 3–5 bullets maximum; each one line
- Omit "Root Cause / Motivation" unless the why is genuinely non-obvious to a reviewer reading the diff

**Impact rules:**

Every PR body gets an `## Impact` section so improvements are recorded per-PR and can be synthesized into periodic meta-reviews. Quantify in this order of preference:

1. **Hard measured data** — actually measure before/after whenever feasible: payload bytes (gzipped, from the prod build), request counts, load/render timings, bundle sizes, query counts. Report absolute numbers *and* % deltas (e.g. "241 KB → 11 KB gz, -95%"). A small table is ideal when there are multiple scenarios.
2. **Derived estimates from measured data** — when direct timing isn't measurable locally, translate measured bytes into transfer time at a stated bandwidth, or cite cache behavior changes (e.g. "repeat visits: 0 B, immutable 1-year cache"). Label estimates as estimates.
3. **Best-practice rationale** — for UX, a11y, or maintainability changes with no measurable number, cite the specific practice or guideline the change satisfies (e.g. WCAG criterion, Core Web Vitals threshold, established design-system convention) in one line.

Never invent numbers. If nothing is measurable and no recognized practice applies (pure refactor, chore), write the one concrete thing the PR makes better (e.g. "removes 300 LOC of dead code") — or state "No user-facing impact" for pure chores.

Before writing the body, fetch the current PR body and check for any auto-generated bot sections (CodeRabbit "Summary by CodeRabbit", or similar blocks appended by review bots). These are delimited by HTML comments like `<!-- This is an auto-generated comment: ... -->`. **Preserve them verbatim** — append them after your written body so they survive the `--body-file` overwrite.

Write the body to `/tmp/pr-body.md`, appending any bot-generated blocks after the human-authored content, then apply:

```bash
gh pr edit --title "<new title>" --body-file /tmp/pr-body.md
```

Then read the body back off GitHub and confirm the Preview line actually survived. Checking the local file is not enough — verify what the PR now shows:

```bash
FIRST_LINE=$(gh pr view <number> --json body -q .body | head -1)
PREVIEW_URL=$(cat /tmp/pr-preview-url.txt)
case "$FIRST_LINE" in
  '**Preview:**'*"$PREVIEW_URL"*) echo "OK: preview line intact" ;;
  *) echo "FAIL: first line is not the verified Preview link: $FIRST_LINE" >&2 ;;
esac
```

For a frontend-bucket PR this must print `OK`. Eyeballing the line is not enough: it has to start with `**Preview:**` and contain the exact URL Step 2b verified, since a link that was retyped or rebuilt from memory is the failure mode this gate exists to catch. On `FAIL`, re-add the link from `/tmp/pr-preview-url.txt`, re-apply with `gh pr edit`, and re-run the check. Do not report the PR as polished until it passes.

Print the updated PR URL when done.

---

## Step 7 — Wait for CI checks and report

The skill is not done until CI has run on the final push. Watch the PR's checks until every one completes:

```bash
gh pr checks <number> --watch --interval 30 --fail-fast
```

This blocks until all checks finish (exit code 0 = all passed, nonzero = at least one failed or was cancelled); `--fail-fast` exits at the first failure so diagnosis can start immediately. Run it in the foreground with a generous timeout (10 minutes). If the suite outlasts the timeout, just re-run the same command — it is idempotent. Do not poll manually in a sleep loop.

**If all checks pass:** report back to the user that the PR is polished and all CI checks are green. Done.

**If any check fails:**

1. Diagnose before touching anything. List the non-passing checks, then pull the failing run's logs:
   ```bash
   gh pr checks <number> --json name,bucket,link \
     --jq '.[] | select(.bucket != "pass" and .bucket != "skipping")'

   # run id is the number in the check's link after /runs/; or find it via:
   gh run list --branch <headRefName> --limit 10
   gh run view <run-id> --log-failed | tail -100
   ```
2. Determine the root cause: a real defect in this PR, a flaky/nondeterministic test, or a failure unrelated to the branch (e.g. broken main, expired secret, infra outage).
3. Alert the user with a short diagnosis — which check failed, why, and what the fix would be — then **ask whether to push up a fix / keep working on it**. Do not push a fix, re-run the workflow, or dismiss the failure without the user's go-ahead.

---

## Notes

- Never push directly to `origin` (SatcherInstitute). Always push to `$FORK_REMOTE` (your personal fork).
- All test failures must be fixed before proceeding — do not skip or suppress them.
- Doc updates should reflect durable invariants, not ephemeral task details.
