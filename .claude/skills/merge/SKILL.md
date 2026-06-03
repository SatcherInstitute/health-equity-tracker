---
name: merge
description: Force-merge an open PR to main (bypassing review requirements), delete the local branch, pull the updated main, and push it to the ben remote (personal fork). Use when the user wants to close out a PR without waiting for review, or run /merge.
---

# /merge

Force-merge a PR, sync local main, and push to the personal fork.

The user may pass a PR number as an argument (e.g. `/merge 4764`). If none is given, detect the open PR from the current branch.

---

## Step 1 — Identify the PR

```bash
gh pr view [<number>] --json number,title,headRefName,baseRefName,state
```

Confirm:
- `state` is `OPEN`
- `baseRefName` is `main`

If the PR is already merged or closed: print a message and stop.

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
git merge origin/main --ff-only
```

If `--ff-only` fails (shouldn't happen after a clean merge): print the error and stop. Do not force-reset main.

---

## Step 5 — Push main to personal fork

```bash
git push ben main
```

---

## Step 6 — Confirm

Print a summary:
> "Merged PR #<number>. Local main is up to date with origin/main and pushed to ben/main."

---

## Notes

- `--admin` bypasses all branch protection rules including required reviews. Use only when you have confirmed the PR is ready.
- Never force-push to `origin/main` (SatcherInstitute). The merge goes through `gh pr merge`, not a direct push.
- If the PR is on a non-main base branch: stop and warn the user.
