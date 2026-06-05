---
name: pre-pr
description: Scan the current PR for tangential changes that can be extracted into a smaller prerequisite PR. Use when the user wants to split out unrelated cleanup, bug fixes, or refactors from a feature branch so reviewers see a focused diff.
---

# /pre-pr

Scan the current PR's commits and diff for changes that are tangential to the PR's stated purpose — unrelated bug fixes, dead-code removal, refactors, style corrections — and offer to extract them into a standalone "pre" PR that can be merged first.

---

## Step 1 — Get PR context

```bash
gh pr view --json number,title,body,headRefName,baseRefName
REPO=$(gh repo view --json nameWithOwner -q .nameWithOwner)
GH_USER=$(gh api user -q .login)
FORK_REMOTE=$(git remote -v | grep -i "github.com[/:]${GH_USER}/" | head -1 | awk '{print $1}')
```

If no open PR: print an error and stop.

---

## Step 2 — Map the commits

List every commit ahead of main, then read each one's diff:

```bash
git log origin/main..HEAD --oneline
```

For each commit SHA, collect:
- Its subject line
- Which files it touched: `git show <sha> --stat --format=''`
- Its full diff: `git show <sha>`

Also read the overall PR diff to understand the PR's theme:

```bash
git diff origin/main --stat
git diff origin/main -- frontend/src/
```

---

## Step 3 — Identify tangential commits

For each commit, evaluate three questions:

**1. Is it topically independent?**
The commit's changed files should have no logical coupling to the PR's stated purpose. Examples that are typically tangential:
- Removing dead code or attributes that were never needed (like unused `tabIndex`)
- Fixing an unrelated bug noticed during development
- Cleanup of a file that happened to be open (comment removal, lint fixes on untouched lines)
- Updating a skill, doc, or config that isn't part of the feature

**2. Is it self-contained?**
The commit should compile and make sense on its own without any other commits from this branch. If it touches files that were also modified by the feature work and depends on those changes, it is NOT self-contained.

**3. Would it be easier to review separately?**
Ask: "Would a reviewer understand this commit in 30 seconds without reading the rest of the PR?" If yes, it's a pre-PR candidate.

Commits that fail any of these tests stay in the main PR.

**Mixed commits** (tangential changes bundled with feature changes in one commit) are flagged separately — they require the user to manually split the commit before extraction is possible.

---

## Step 4 — Present findings

Print a clear summary. For each candidate commit, explain WHY it's tangential in one sentence — not just what it does, but why it's unrelated to the PR's purpose. Be direct; skip commits that don't clearly qualify.

Format:

```
## Tangential commits found

These commits appear independent of the PR's main purpose and could land as a pre-PR:

1. `<sha>` — <subject>
   Why: <one sentence. e.g. "Removes tabIndex=-1 attributes that were dead weight unrelated to the responsive dialog work.">
   Files: <list>
   Risk: <low | medium — and why if medium>

2. ...

## Mixed commits (require manual splitting first)

- `<sha>` — <subject>: <which part is tangential and which isn't>

## Recommendation

<One paragraph: which commits to extract, what to name the pre-PR branch, and whether the extraction is safe.>
```

If nothing qualifies, say so clearly and explain why — don't force weak candidates.

---

## Step 5 — Confirm with user

Ask the user to confirm before taking any action:

> "Extract commits [1, 2] into a pre-PR? I'll create a branch from main, cherry-pick those commits, push it to your fork, and open a draft PR. The current branch stays unchanged — you'd rebase it on top of the pre-PR once it merges."

Wait for explicit confirmation. If the user adjusts the selection, respect that.

---

## Step 6 — Create the pre-PR branch

Once confirmed, derive a branch name: take the commit subjects, pick the most descriptive one, slugify it (lowercase, replace spaces/punctuation with `-`), prefix with `refactor/` or `fix/` or `chore/` based on the nature of the commits.

```bash
PRE_BRANCH="<prefix>/<slug>"

# Create branch from main (not from the current feature branch)
git fetch origin main
git checkout -b $PRE_BRANCH origin/main

# Cherry-pick each confirmed tangential commit in original order
git cherry-pick <sha1>
git cherry-pick <sha2>
# ...

# Push to fork
git push $FORK_REMOTE $PRE_BRANCH

# Return to original branch
git checkout <original-branch>
```

If a cherry-pick conflicts: stop, explain what conflicted, and tell the user to resolve it manually. Do not force-resolve.

---

## Step 7 — Open the pre-PR

```bash
gh pr create \
  --base main \
  --head "${GH_USER}:${PRE_BRANCH}" \
  --draft \
  --title "<concise title under 60 chars>" \
  --body "$(cat <<'EOF'
## Summary

<bullet points describing what the extracted changes do>

## Why a separate PR

<one sentence: why these changes are independent of the parent PR>

## Parent PR

Extracted from #<number> — this should merge first, then the parent PR rebases on top.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

Open as **draft** — the user should mark it ready once they've verified it's correct.

---

## Step 8 — Advise on the rebase

Print the commands the user will need once the pre-PR merges:

```bash
# After the pre-PR merges to main:
git fetch origin main
git rebase origin/main
# resolve any conflicts if the extracted commits overlap with remaining work
git push $FORK_REMOTE HEAD --force-with-lease
```

Explain that `--force-with-lease` is safe here because the rebase only removes commits that have now landed on main.

---

## Notes

- **Never touch the feature branch during extraction.** The cherry-pick creates a new branch from main; the feature branch is untouched until the user manually rebases after merge.
- **Only extract commits, not partial commits.** If a commit mixes tangential and feature work, tell the user to split it with `git rebase -i` first — do not attempt to reconstruct a partial patch automatically.
- **Draft by default.** Pre-PRs open as draft so the user can do a quick sanity check before requesting review.
- **Topical, not cosmetic.** The bar for extraction is "meaningfully independent" — not "happened to touch a different file." Don't extract refactors that set up the feature, only ones that are genuinely unrelated.
