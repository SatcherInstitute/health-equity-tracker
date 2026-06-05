---
name: split
description: Split a cluster of tangential file changes out of the current PR into a focused pre-PR (merges before) or follow-up PR (merges after). Both modes add merge-order notes to both PRs and cross-reference each other. Use when the user wants to extract unrelated changes from a feature branch, or run /split.
---

# /split

Extract a cluster of tangential file changes from the current PR into a standalone **pre-PR** (merges before the parent) or **follow-up PR** (merges after the parent). Both modes work the same way mechanically — branch from main, copy extracted files, revert on the feature branch — and differ only in framing and merge-order documentation.

The user may pass a PR number as an argument (e.g. `/split 4764`). If none is given, detect the open PR from the current branch.

---

## Step 1 — Get PR context

```bash
gh pr view [<number>] --json number,title,body,headRefName,baseRefName
REPO=$(gh repo view --json nameWithOwner -q .nameWithOwner)
GH_USER=$(gh api user -q .login)
FORK_REMOTE=$(git remote -v | grep -i "github.com[/:]${GH_USER}/" | head -1 | awk '{print $1}')
FEATURE_BRANCH=$(git rev-parse --abbrev-ref HEAD)
```

If no open PR: print an error and stop.

---

## Step 2 — Read the full diff

```bash
git diff origin/main --name-only
git diff origin/main --stat
git diff origin/main
```

Read every changed file's diff in full. Also read the PR title and body to understand the stated purpose.

---

## Step 3 — Identify tangential file clusters

Group the changed files by topic. For each group, ask:

**1. Is this topic independent of the PR's stated purpose?**
Strong candidates:
- Removing dead code or unnecessary attributes noticed during the work
- Fixing an unrelated bug or UX issue discovered while working
- Updating a skill, config, or doc file unrelated to the feature
- Broad cleanup that doesn't set up the feature
- Bonus enhancements that could ship independently

**2. Can these files be reverted on the feature branch without breaking it?**
If reverting the cluster leaves the feature branch compiling and logically correct, extraction is safe. If the feature code imports or depends on the cluster's changes, it is NOT safe.

**3. Does the extracted state apply cleanly to main?**
The files' current state on the feature branch must be a valid, standalone improvement over main — not a halfway step that only makes sense combined with other feature changes.

**Mixed files**: if a single file contains both tangential changes (lines A–B) and feature changes (lines C–D), it cannot be cleanly extracted at the file level. Flag it and skip it.

---

## Step 4 — Present findings and propose mode

For each candidate cluster, explain why it's tangential, list the files, and propose a mode:

- **pre**: the cluster is cleanup, refactoring, or a prerequisite — it should land before the parent PR
- **follow-up**: the cluster is an enhancement or deferred bonus work — it should land after the parent PR

```
## Extractable clusters

### 1. <cluster name> — proposed mode: pre | follow-up
Why: <one sentence>
Mode reason: <one sentence on why pre vs follow-up>
Files:
  - path/to/file1
  - path/to/file2
Safe to extract: yes — reverting leaves the feature branch intact and compilable.

## Cannot extract (mixed files)
- path/to/mixed.tsx — contains both <tangential> and <feature> changes

## Nothing found
(only if truly nothing qualifies)
```

---

## Step 5 — Confirm with user

> "I found [N] cluster(s). I'll:
> 1. Create `<branch>` from main and apply the extracted files from your feature branch
> 2. Open a draft **pre-PR** [or **follow-up PR**] with merge-order notes
> 3. Revert those files on `<feature-branch>` and update the parent PR with a cross-reference
>
> Proceed?"

Wait for confirmation. Respect any mode adjustments.

---

## Step 6 — Create the split branch

Derive a branch name: slugify the cluster description, prefix with `refactor/`, `fix/`, or `chore/` for pre; `feat/` or `chore/` for follow-up.

```bash
SPLIT_BRANCH="<prefix>/<slug>"

# Abort if there are uncommitted changes
if [ -n "$(git status --porcelain)" ]; then
  echo "Error: uncommitted changes present. Commit or stash before splitting." >&2; exit 1
fi

# Always branch from main, never from the feature branch
git fetch origin main
git checkout -b $SPLIT_BRANCH origin/main

# Copy the extracted file versions from the feature branch
git checkout $FEATURE_BRANCH -- path/to/file1 path/to/file2 ...

git commit -m "<short description of what the extracted changes do>"
git push $FORK_REMOTE $SPLIT_BRANCH

git checkout $FEATURE_BRANCH
```

If any step fails: stop and explain. Do not proceed to revert.

---

## Step 7 — Revert the extracted files on the feature branch

```bash
for file in path/to/file1 path/to/file2 ...; do
  if git show origin/main:"$file" > /dev/null 2>&1; then
    git checkout origin/main -- "$file"   # existed on main: restore it
  else
    git rm -f "$file"                     # new file: remove it entirely
  fi
done
git commit -m "revert <description> to main — extracted to #<split-pr-number>"
git push $FORK_REMOTE HEAD
```

If the feature branch no longer compiles after the revert: undo with `git revert HEAD`, explain the coupling, and stop.

---

## Step 8 — Open the draft split PR

Write the body to `/tmp/split-pr-body.md` using the appropriate template, then open:

```bash
gh pr create \
  --base main \
  --head "${GH_USER}:${SPLIT_BRANCH}" \
  --draft \
  --title "<concise title under 60 chars>" \
  --body-file /tmp/split-pr-body.md
```

### Pre-PR body template

```markdown
## Summary

- <bullet: what each file change does>

## Merge order

**Merge this PR BEFORE #<parent-number>.**
The parent PR has these files reverted to main; once this lands, rebase or merge main into the parent branch to restore them.

## Parent PR

Extracted from #<parent-number> as a prerequisite.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
```

### Follow-up PR body template

```markdown
## Summary

- <bullet: what each file change does>

## Merge order

**Merge this PR AFTER #<parent-number>.**
These changes extend the feature but don't need to block it from shipping. The parent PR has these files reverted to main; once the parent lands, this PR applies cleanly on top.

## Parent PR

Extracted from #<parent-number> as a follow-up.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
```

---

## Step 9 — Update the parent PR with a cross-reference

Fetch the parent PR's current body and add a `## Related PRs` section before `## Screenshots` (or at the end if no Screenshots section). Do not overwrite the Screenshots section.

```bash
gh pr view <parent-number> --json body -q '.body' > /tmp/parent-body.md
```

Append or insert:

**Pre mode:**
```markdown
## Related PRs

- **Prerequisite:** #<split-pr> must merge before this PR.
```

**Follow-up mode:**
```markdown
## Related PRs

- **Follow-up:** #<split-pr> should merge after this PR.
```

Apply:

```bash
gh pr edit <parent-number> --body-file /tmp/parent-body.md
```

---

## Step 10 — Advise next steps

**Pre mode:**
```
Split PR #<N> is open as a draft at <url>.

Next steps:
1. Review and mark #<N> ready, then merge it
2. After it merges, pull main into your feature branch:

   git fetch origin main
   git merge origin/main
   git push <fork-remote> HEAD
```

**Follow-up mode:**
```
Split PR #<N> is open as a draft at <url>.

Next steps:
1. Merge the parent PR #<parent> first
2. After it merges, update the follow-up branch:

   git fetch origin main
   git checkout <split-branch>
   git merge origin/main
   git push <fork-remote> HEAD --force-with-lease

3. Then mark #<N> ready for review and merge it
```

---

## Notes

- **File-level extraction only.** Copies the file's final state from the feature branch; does not attempt partial-file patches.
- **Compilation safety is the hard gate.** If reverting breaks the feature branch, do not extract.
- **Always draft.** Open as draft so the user can sanity-check before requesting review.
- **Never push to origin (SatcherInstitute).** Always push to `$FORK_REMOTE`.
