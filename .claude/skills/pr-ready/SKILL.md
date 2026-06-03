---
name: pr-ready
description: Run all frontend checks, update CLAUDE.md and README docs as needed, then update the open PR's title and description to accurately reflect the changes. Use when the user wants to close out a PR, verify it's ready for review, or run /pr-ready.
---

# /pr-ready

Run all checks, update docs, and polish the open PR so it's ready for human review.

The user may pass a PR number as an argument (e.g. `/pr-ready 4764`). If none is given, detect the open PR from the current branch.

---

## Step 1 — Identify the PR

```bash
gh pr view --json number,title,body,headRefName,baseRefName
```

If no open PR is found: print an error and stop.

---

## Step 2 — Run all checks

Run these from `frontend/` in parallel — they are independent:

```bash
npx tsc --noEmit
```

```bash
npm run test
```

```bash
npm run cleanup
```

If any check fails: report the failure with the full error, fix it, re-run, and only continue once all three pass. Stage and commit any files that `cleanup` modified automatically.

---

## Step 3 — Assess doc freshness

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
git push ben main
```

---

## Step 4 — Update the PR title and description

Get the full diff to understand what actually changed:

```bash
git log origin/main..HEAD --oneline
git diff origin/main -- frontend/src/
```

Rewrite the PR title (under 70 chars) and body to accurately describe:
- **What changed** (the specific files and behavior)
- **Why** (the root cause or motivation)
- **Test plan** as a bulleted checklist

Use this body template:

```markdown
## Summary

- <bullet 1>
- <bullet 2>
- <bullet 3>

## Root Cause / Motivation

<one paragraph if non-obvious>

## Test plan

- [ ] <manual test step>
- [ ] <E2E test or unit test that covers this>

🤖 Generated with [Claude Code](https://claude.com/claude-code)
```

Write the body to `/tmp/pr-body.md`, then apply:

```bash
gh pr edit --title "<new title>" --body-file /tmp/pr-body.md
```

Print the updated PR URL when done.

---

## Notes

- Never push directly to `origin` (SatcherInstitute). Always push to `ben` (personal fork).
- All test failures must be fixed before proceeding — do not skip or suppress them.
- Doc updates should reflect durable invariants, not ephemeral task details.
