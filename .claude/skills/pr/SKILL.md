---
name: pr
description: Run Biome auto-fix (cleanup only — tsc and Vitest run in CI, not locally), address any open review comments, update CLAUDE.md docs if stale, verify the test plan with Playwright against a local dev server (live backend + feature flags), then update the open PR title and description. Use when the user wants to close out a PR, verify it's ready for review, or run /pr.
---

# /pr

Polish the open PR so it's ready for human review: auto-fix formatting, address review comments, update docs, verify tests, and rewrite the PR description.

The user may pass a PR number as an argument (e.g. `/pr 4764`). If none is given, detect the open PR from the current branch.

---

## Step 1 — Identify the PR and derive context

```bash
gh pr view --json number,title,body,headRefName,baseRefName
```

If no open PR is found: print an error and stop.

Then derive two variables used throughout the remaining steps:

```bash
# Upstream repo (e.g. SatcherInstitute/health-equity-tracker)
REPO=$(gh repo view --json nameWithOwner -q .nameWithOwner)

# Personal fork remote — the remote whose URL contains the current GitHub user's login
GH_USER=$(gh api user -q .login)
FORK_REMOTE=$(git remote -v | grep -i "github.com[/:]${GH_USER}/" | head -1 | awk '{print $1}')
```

If `FORK_REMOTE` is empty, print a warning and ask the user to identify their fork remote with `git remote -v`, then continue using that name.

---

## Step 2 — Run Biome auto-fix

`tsc --noEmit` and `npm run test` (Vitest) both run in CI on every PR push — do NOT run them locally here.

Run only Biome from `frontend/`, since it auto-fixes files (CI runs `biome ci` which only reports, never fixes):

```bash
npm run cleanup
```

If cleanup modifies any files, stage and commit them:

```bash
git add -p   # review what changed
git commit -m "style: biome auto-fix"
git push $FORK_REMOTE HEAD
```

If cleanup exits non-zero with unfixable errors: report and fix manually before continuing.

---

## Step 3 — Evaluate and address code review feedback

Fetch all reviews and inline comments on the PR:

```bash
gh api repos/$REPO/pulls/<number>/reviews \
  --jq '[.[] | {user: .user.login, state: .state, body: .body}]'

gh api repos/$REPO/pulls/<number>/comments \
  --jq '[.[] | {user: .user.login, path: .path, line: .line, body: .body, id: .id}]'
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
  Reply with one short sentence — what you did and why, nothing more:
  ```bash
  gh api repos/$REPO/pulls/<number>/comments/<comment_id>/replies \
    -f body="Fixed — <one line>."
  ```
  Then resolve the thread via GraphQL. The mutation requires the **thread's** node ID (`PRRT_...`), not the comment's node ID (`PRRC_...`). Fetch it first:
  ```bash
  gh api graphql -f query='{ repository(owner: "<owner>", name: "<repo>") { pullRequest(number: <number>) { reviewThreads(first: 20) { nodes { id isResolved comments(first: 1) { nodes { databaseId } } } } } } }' \
    --jq '.data.repository.pullRequest.reviewThreads.nodes[] | select(.comments.nodes[0].databaseId == <comment_id>) | .id'
  ```
  Then resolve using the returned `PRRT_...` id:
  ```bash
  gh api graphql -f query='mutation { resolveReviewThread(input: {threadId: "<PRRT_id>"}) { thread { isResolved } } }'
  ```
- **Decline it**: reply with one sentence explaining why, then leave the thread open:
  ```bash
  gh api repos/$REPO/pulls/<number>/comments/<comment_id>/replies \
    -f body="Not changing — <one line reason>."
  ```

If there are no unresolved reviews or comments, note that and continue.

---

## Step 4 — Assess doc freshness

Read the current `frontend/CLAUDE.md` and (if relevant) the root `CLAUDE.md` and `README.md`.

Compare against the changes in this PR:

```bash
git diff origin/main --name-only
git diff origin/main -- frontend/CLAUDE.md frontend/src/utils/sharedSettingsState.ts frontend/src/pages/ExploreData/ExploreDataPage.tsx
```

Ask: do any of the MadLib navigation invariants, URL param table, or architecture sections need updating to reflect what this PR changed? Only update if something is genuinely stale or missing — do not add commentary about the PR itself (those belong in the PR description, not the docs).

If updates are needed: edit the relevant docs, then commit:

```bash
git add frontend/CLAUDE.md CLAUDE.md README.md   # only files actually changed
git commit -m "docs: update CLAUDE.md to reflect <what changed>"
git push $FORK_REMOTE HEAD
```

---

## Step 5 — Audit and verify the test plan

Read the current PR body (already fetched in Step 1). Extract all `- [ ]` and `- [x]` items under the Test plan section.

### 5a — Static checks

Check off items already satisfied by Step 2 without running a browser:
- TypeScript, unit tests, linting/formatting → verified by Step 2, check off.
- Items asserting a code change is in place → verify by reading the diff, not by guessing.

Remove or rewrite any items that refer to code that was removed or refactored.

### 5b — Run Playwright for browser-verifiable items

For every remaining unchecked item that describes a browser interaction (URL params, navigation behavior, UI state, link resolution), write and run a targeted Playwright test.

**Start the dev server** (connects to the live dev GCP backend — no build step needed, data fetches work):

```bash
cd frontend
npm run localhost > /tmp/het-dev-server.log 2>&1 &
DEV_PID=$!
# Poll until the server responds rather than sleeping a fixed amount
until curl -s http://localhost:3000 > /dev/null 2>&1; do sleep 1; done
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
- Item not automatable (requires human judgment, live external service, or next CI run) → leave `- [ ]` as-is

**Clean up** after all tests run:

```bash
kill $DEV_PID 2>/dev/null
rm frontend/playwright-tests/_pr_verify.spec.ts
```

### 5c — Gap check

Compare the remaining unchecked items against the full diff:

```bash
git diff origin/main --name-only
git diff origin/main -- frontend/src/
```

Add any missing items that the diff introduces but the checklist doesn't cover. New manual items should describe the exact interaction, not vague phrases like "test the feature."

Carry the final audited checklist into Step 6.

---

## Step 6 — Update the PR title and description

Get the full diff to understand what actually changed:

```bash
git log origin/main..HEAD --oneline
git diff origin/main -- frontend/src/
```

Rewrite the PR title (under 70 chars) and body to accurately describe:
- **What changed** (the specific files and behavior)
- **Why** (the root cause or motivation)
- **Test plan** using the audited checklist from Step 5 — do not regenerate from scratch, use the checked/unchecked items produced there

Use this body template:

```markdown
## Summary

- <bullet 1>
- <bullet 2>
- <bullet 3>

## Root Cause / Motivation

<one paragraph if non-obvious>

## Test plan

- [x] <already verified item>
- [ ] <manual test step still needed>

🤖 Generated with [Claude Code](https://claude.com/claude-code)
```

Write the body to `/tmp/pr-body.md`, then apply:

```bash
gh pr edit --title "<new title>" --body-file /tmp/pr-body.md
```

Print the updated PR URL when done.

---

## Notes

- Never push directly to `origin` (SatcherInstitute). Always push to `$FORK_REMOTE` (your personal fork).
- All test failures must be fixed before proceeding — do not skip or suppress them.
- Doc updates should reflect durable invariants, not ephemeral task details.
