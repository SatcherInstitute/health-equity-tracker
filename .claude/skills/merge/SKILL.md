---
name: merge
description: Force-merge an open PR to main (bypassing review requirements), delete the local branch, pull the updated main, and push it to the personal fork remote. Use when the user wants to close out a PR without waiting for review, or run /merge.
---

# /merge

Force-merge a PR, sync local main, and push to the personal fork.

The user may pass a PR number as an argument (e.g. `/merge 4764`). If none is given, detect the open PR from the current branch.

---

## Step 1 — Identify the PR and derive fork remote

```bash
gh pr view [<number>] --json number,title,headRefName,baseRefName,state
```

Confirm:
- `state` is `OPEN`
- `baseRefName` is `main`

If the PR is already merged or closed: print a message and stop.

Derive the personal fork remote:

```bash
GH_USER=$(gh api user -q .login)
FORK_REMOTE=$(git remote -v | grep -i "github.com[/:]${GH_USER}/" | head -1 | awk '{print $1}')
```

If `FORK_REMOTE` is empty, print a warning and ask the user to identify their fork remote with `git remote -v`.

Print the PR title and number, then ask the user to confirm before merging:
> "About to force-merge PR #<number>: '<title>'. Confirm? (yes/no)"

Wait for confirmation before continuing.

---

## Step 2 — Force-merge the PR

```bash
gh pr merge <number> --squash --admin --delete-branch
```

- `--admin`: bypasses required review checks and branch protection rules
- `--squash`: squash all commits into one on main
- `--delete-branch`: deletes the remote branch after merge

If the merge fails: print the full error and stop. Do not proceed.

---

## Step 3 — Delete the local branch (if applicable)

Check whether the branch exists locally:

```bash
git branch --list <headRefName>
```

If the branch exists and is not the currently checked-out branch: delete it.

```bash
git branch -d <headRefName>
```

If that fails (branch not fully merged in git's view due to squash): use force:

```bash
git branch -D <headRefName>
```

If we're currently on the feature branch: switch to main first, then delete.

```bash
git checkout main
git branch -D <headRefName>
```

---

## Step 4 — Pull updated main

```bash
git fetch origin main
git reset --hard origin/main
```

After a squash merge, local main always diverges (N commits become 1 on origin), so `--ff-only` will always fail. `reset --hard` is correct and safe here — local commits are already represented in the squash on origin.

---

## Step 5 — Push main to personal fork

```bash
git push $FORK_REMOTE main --force
```

Force-push is required after a squash merge because the fork's main still has the pre-squash commits.

---

## Step 6 — Update linked issues on the project board

This repo's project board is `SatcherInstitute` org project number 5 (id `PVT_kwDOBCaVcM4BeXhW`), Status field id `PVTSSF_lADOBCaVcM4BeXhWzhYyS0g`, with options `Backlog` (`f75ad846`), `Up Next` (`d6a0bd53`), `In Progress` (`47fc9ee4`), `Done` (`98236657`).

GitHub's native "Item closed" project automation already moves an issue to **Done** the moment it closes via a recognized keyword (`Closes #NNNN`, `Fixes #NNNN`, etc). That case needs no action here — just identify it:

```bash
gh pr view <number> --json body,closingIssuesReferences \
  --jq '{body, autoClosing: [.closingIssuesReferences[].number]}'
```

For every other bare `#NNNN` reference in the PR body that is **not** in `autoClosing`, read the issue and use judgement against the merged diff:

```bash
gh issue view <n> --json number,title,body,state
```

- **Fully resolved but not tagged with a closing keyword** (the PR body mentions `#NNNN` in passing, but the diff clearly finishes what the issue describes): close it and move it to Done yourself.
  ```bash
  gh issue close <n> --comment "Resolved by #<pr_number>."
  ITEM_ID=$(gh api graphql -f query='{ organization(login: "SatcherInstitute") { projectV2(number: 5) { items(first: 100) { nodes { id content { ... on Issue { number } } } } } } }' -q ".data.organization.projectV2.items.nodes[] | select(.content.number == <n>) | .id")
  gh api graphql -f query="mutation { updateProjectV2ItemFieldValue(input: { projectId: \"PVT_kwDOBCaVcM4BeXhW\" itemId: \"$ITEM_ID\" fieldId: \"PVTSSF_lADOBCaVcM4BeXhWzhYyS0g\" value: { singleSelectOptionId: \"98236657\" } }) { projectV2Item { id } } }"
  ```
- **Not obviously resolved** (referenced in passing, partial progress, a "found while working on this" aside): leave it — it's a candidate for Step 7, not a silent Done move. Don't guess.

Skip this step entirely if there are no issue references at all in the PR body.

---

## Step 7 — Confirm follow-up items with the user

Scan the PR body/diff and anything surfaced in Step 6 for deferred work: language like "follow-up", "out of scope", "revisit later", "TODO", "deferred," or a new problem noticed but not fixed while building this PR.

If candidates exist, ask the user with `AskUserQuestion` (multiSelect) before touching anything — this is a prioritization call, not a mechanical one:

```bash
gh issue edit <n> --add-assignee @me
gh api graphql -f query="mutation { updateProjectV2ItemFieldValue(input: { projectId: \"PVT_kwDOBCaVcM4BeXhW\" itemId: \"$ITEM_ID\" fieldId: \"PVTSSF_lADOBCaVcM4BeXhWzhYyS0g\" value: { singleSelectOptionId: \"d6a0bd53\" } }) { projectV2Item { id } } }"
```

Only run the assign/move mutation for items the user actually selected. If nothing reads as an obvious follow-up, skip this step and say so briefly rather than forcing a suggestion.

---

## Step 8 — Flag a likely DAG rerun for backend data changes

Check which files the merged PR touched:

```bash
gh pr view <number> --json files --jq '.files[].path'
```

If any path is under `python/datasources/` or `python/ingestion/` **and** the change affects data output (not just a comment, type hint, or test-only change — read the diff if unsure), the merge likely needs a DAG rerun to actually refresh the deployed data, since merging alone only ships the code.

Map the touched datasource to its workflow: look for a `.github/workflows/dag*.yml` whose name or `on.workflow_dispatch` job references the same data source (e.g. `age_adjust_cdc_hiv.py` → `dagCdcHiv.yml`).

```bash
gh workflow list --all | grep -i dag
```

Ask the user before triggering anything:
> "This PR touched `<file>`, which looks like it changes data output. Want me to rerun `<dag>.yml` against infra-test?"

If they decline or no backend-data files were touched, skip to Step 10.

---

## Step 9 — Wait for the auto-deploy before rerunning the DAG

Merging to `main` automatically fires a `DEPLOY MAIN CODE TO INFRA-TEST GCP (DEV SITE)` workflow that redeploys the same `het-infra-test-05` project the DAG will hit. Running the DAG before that deploy finishes hits the pre-merge container and fails or silently uses stale code — indistinguishable from the fix not having worked. Confirm the deploy has completed before triggering the DAG:

```bash
gh run list --branch main --workflow "DEPLOY MAIN CODE TO INFRA-TEST GCP (DEV SITE)" --limit 1 --json status,conclusion,createdAt
```

If `status` is not `completed`, wait for it (poll, or use `gh run watch <id>`) rather than proceeding immediately. Once it's done, trigger the DAG:

```bash
gh workflow run <dag>.yml --ref infra-test
```

---

## Step 10 — Confirm

Print a summary:
> "Merged PR #<number>. Local main is up to date with origin/main and pushed to $FORK_REMOTE/main. Board: <issues moved to Done, if any> <issues moved to Up Next, if any>. DAG: <triggered/skipped/declined>."

---

## Notes

- `--admin` bypasses all branch protection rules including required reviews. Use only when you have confirmed the PR is ready.
- Never force-push to `origin/main` (SatcherInstitute). The merge goes through `gh pr merge`, not a direct push.
- If the PR is on a non-main base branch: stop and warn the user.
- Step 6 only needs to run once per merge — don't re-derive the project/field/option IDs, they're fixed for this repo (same ones `/tackle` uses).
- Step 8/9 only apply when the PR touches `python/datasources/` or `python/ingestion/` with real data-output impact — most PRs (frontend, docs, skills) skip straight to Step 10.
