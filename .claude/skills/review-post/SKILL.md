---
name: review-post
model: haiku
description: Mechanical half of /review - posts a pre-written review body to GitHub and auto-resolves any threads that the current HEAD has already addressed. Called by /review after the analysis is complete; can also be run standalone to re-post or to clean up resolved threads on an existing PR.
---

# /review-post

Post a pre-written review to GitHub and resolve threads that are already addressed. This skill handles only the mechanical steps; the analysis lives in `/review`.

Expects `/tmp/het-review.md` to exist with the review body and a first line matching:
`VERDICT: request-changes|comment`

If that file does not exist, print an error and stop.

The user may pass a PR number as an argument (e.g. `/review-post 4764`). If none is given, detect the open PR from the current branch.

---

## Step 1: Read verdict and identify PR

```bash
head -1 /tmp/het-review.md          # read VERDICT line
gh pr view --json number,headRefName
REPO=$(gh repo view --json nameWithOwner -q .nameWithOwner)
```

Strip the `VERDICT: ` prefix line from the body before posting (it is metadata, not review content):

```bash
tail -n +2 /tmp/het-review.md > /tmp/het-review-body.md
```

---

## Step 2: Post the GitHub review

```bash
gh pr review <number> --<request-changes|comment> --body-file /tmp/het-review-body.md
```

Print the URL of the posted review.

---

## Step 3: Auto-resolve already-addressed threads

Fetch all open review threads:

```bash
gh api graphql -f query='{ repository(owner: "<owner>", name: "<repo>") { pullRequest(number: <n>) { reviewThreads(first: 50) { nodes { id isResolved body comments(first: 1) { nodes { databaseId body } } } } } } }'
```

For each unresolved thread, check whether the exact code or concern it references still exists in the current HEAD using `git grep` or `git diff origin/main...HEAD`. If the flagged code is gone or changed to address the concern, resolve the thread:

```bash
gh api graphql -f query='mutation { resolveReviewThread(input: {threadId: "<PRRT_id>"}) { thread { isResolved } } }'
```

Leave threads open where the concern is still valid or the resolution is ambiguous.

---

## Notes

- Never modify source code.
- This skill is cheap (haiku) intentionally. All reasoning happens in `/review`.
