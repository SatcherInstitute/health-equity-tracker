---
name: pre-pr
description: Scan the current PR for tangential changes that can be extracted into a smaller prerequisite PR. Use when the user wants to split out unrelated cleanup, bug fixes, or refactors from a feature branch so reviewers see a focused diff.
---

# /pre-pr

Scan the current PR's full diff for **topic-based clusters of file changes** that are unrelated to the PR's main purpose and safe to extract. Extraction works at the file level — not the commit level — so it handles changes spread across many commits or mixed with feature work. The extracted changes become a standalone pre-PR that merges first; the feature branch then has those files reverted back to main, keeping both diffs clean.

---

## Step 1 — Get PR context

```bash
gh pr view --json number,title,body,headRefName,baseRefName
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
The changes should address something the PR wasn't trying to do. Strong candidates:
- Removing dead code or unnecessary attributes noticed during the work (e.g. unused `tabIndex`, stale JSDoc)
- Fixing an unrelated bug or UX issue discovered while working
- Updating a skill, config, or doc file unrelated to the feature
- Broad cleanup (removing a pattern across many files) that doesn't set up the feature

**2. Can these files be reverted on the feature branch without breaking anything?**
Read the feature branch's remaining changed files. If reverting the tangential files to main leaves the feature branch compiling and logically correct — extraction is safe. If the feature code imports or depends on the tangential changes, it is NOT safe to extract.

**3. Does the extracted state apply cleanly to main?**
The tangential files' current state on the feature branch must be a valid, standalone improvement over main — not a halfway step that only makes sense combined with other feature changes.

**Mixed files**: if a single file contains both tangential changes (lines A-B) and feature changes (lines C-D), it cannot be cleanly extracted at the file level. Flag it and skip it — do not attempt to construct a partial patch.

---

## Step 4 — Present findings

Print a clear, scannable summary. For each candidate cluster, explain WHY it's tangential in one sentence, list the files, and confirm that reverting them on the feature branch is safe.

```
## Tangential change clusters found

### 1. <short cluster name>
Why: <one sentence — what this is and why it's unrelated to the PR's purpose>
Files:
  - path/to/file1.tsx
  - path/to/file2.tsx
Safe to extract: yes — reverting these files on the feature branch leaves the remaining diff intact and compilable.

### 2. <short cluster name>
...

## Cannot extract (mixed files)
- path/to/mixed.tsx — contains both <tangential change> and <feature change> in the same file

## Nothing found
(only if truly nothing qualifies — explain why)
```

If nothing qualifies, say so directly and explain why each changed file area is too coupled to the PR's purpose.

---

## Step 5 — Confirm with user

Summarize the proposed extraction and ask for confirmation before touching any branches:

> "I found [N] extractable cluster(s). I'll:
> 1. Create `<pre-branch>` from main and apply the tangential file versions from your feature branch
> 2. Commit, push, and open a draft pre-PR
> 3. Revert those same files on `<feature-branch>` back to main and commit
>
> Both branches will compile cleanly. Proceed?"

Wait for explicit confirmation. Respect any adjustments to which clusters to extract.

---

## Step 6 — Create the pre-PR branch

Derive a branch name from the cluster description: slugify it, prefix with `refactor/`, `fix/`, or `chore/` based on the nature of the changes.

```bash
PRE_BRANCH="<prefix>/<slug>"

# Abort if there are uncommitted changes — they would bleed into the new branch
if [ -n "$(git status --porcelain)" ]; then
  echo "Error: uncommitted changes present. Commit or stash before extracting." >&2; exit 1
fi

# Branch from main — never from the feature branch
git fetch origin main
git checkout -b $PRE_BRANCH origin/main

# Pull the tangential file versions from the feature branch
git checkout $FEATURE_BRANCH -- path/to/file1.tsx path/to/file2.tsx ...

# Commit
git commit -m "<short description of what the extracted change does>"

# Push to fork
git push $FORK_REMOTE $PRE_BRANCH

# Return to feature branch
git checkout $FEATURE_BRANCH
```

If any step fails: stop, explain what went wrong, and do not proceed to revert the feature branch.

---

## Step 7 — Revert the extracted files on the feature branch

Now that the pre-PR branch holds those changes, revert the same files on the feature branch back to their state on main:

```bash
for file in path/to/file1.tsx path/to/file2.tsx ...; do
  if git show origin/main:"$file" > /dev/null 2>&1; then
    git checkout origin/main -- "$file"   # file existed on main: restore it
  else
    git rm -f "$file"                     # file is new: remove it entirely
  fi
done
git commit -m "revert <description> to main — extracted to pre-PR #<pre-pr-number>"
git push $FORK_REMOTE HEAD
```

After this commit, the feature branch diff no longer includes those files. The two PRs are cleanly separated.

If the feature branch no longer compiles after the revert: something was coupled that wasn't caught in Step 3. Stop, explain the issue, and undo the revert commit with `git revert HEAD`. Do not push a broken state.

---

## Step 8 — Open the pre-PR

```bash
gh pr create \
  --base main \
  --head "${GH_USER}:${PRE_BRANCH}" \
  --draft \
  --title "<concise title under 60 chars>" \
  --body-file /tmp/pre-pr-body.md
```

Body template (write to `/tmp/pre-pr-body.md` first):

```markdown
## Summary

- <bullet: what each file change does>

## Why a separate PR

<One sentence: why these changes are independent of the parent PR's purpose.>

## Parent PR

Extracted from #<number>. This should merge first; the parent PR already has these files reverted to main.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
```

Open as **draft** so the user can verify before requesting review.

---

## Step 9 — Advise on next steps

Print:

```
Pre-PR #<N> is open as a draft at <url>.

Next steps:
1. Review the pre-PR diff — it should contain only the extracted files
2. Mark it ready for review and merge it
3. After it merges, pull main into your feature branch and resolve any conflicts:

   git fetch origin main
   git merge origin/main
   git push <fork-remote> HEAD
```

---

## Notes

- **File-level extraction, not commit-level.** This handles changes spread across multiple commits or mixed with feature work. It copies the file's final state from the feature branch, not a diff of one commit.
- **Compilation safety is the hard gate.** If reverting the extracted files would break the feature branch, do not extract. Flag the coupling and move on.
- **Never push a broken state.** If anything goes wrong during the revert step, undo immediately and explain.
- **Draft by default.** Pre-PRs open as draft so the user can sanity-check before review.
- **Topical, not cosmetic.** The bar for extraction is "meaningfully independent" — not "happened to touch a different file." Refactors that set up the feature (new shared components, type changes that feature code imports) stay in the main PR.
