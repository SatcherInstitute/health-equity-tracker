---
name: tackle
model: sonnet
description: Start work on a GitHub issue - assign it, move it to In Progress on the project board, branch from clean main, scan for related issues/PRs and sibling codebase patterns to replicate, then begin implementation directly with no confirmation gate. Use when the user says "work on #NNNN", "tackle #NNNN", "let's do issue NNNN", or runs /tackle.
---

# /tackle

Start work on a GitHub issue end to end: assign, move to In Progress, branch, gather context, then implement. This skill does not pause for plan approval — Step 5 goes straight into implementation.

The user passes an issue number (e.g. `/tackle 5124`). If none is given, ask which issue.

---

## Step 1 — Precondition check

```bash
git status --porcelain
git branch --show-current
```

If the working tree is dirty: stop and ask whether to commit or stash before switching branches. Never discard uncommitted work silently.

If the current branch has an open PR against it, note that briefly — the user may want to finish it first — but don't block on it unless the tree is dirty.

---

## Step 2 — Fetch the issue

```bash
gh issue view <number> --json id,number,title,body,labels,milestone,comments,state,assignees
```

If `state` is not `OPEN`: stop and tell the user.

Read the full body and all comments, not just the title — scope and constraints often live in a comment thread, not the original body.

---

## Step 3 — Assign and move to In Progress

Always assign immediately, without asking:

```bash
gh issue edit <number> --add-assignee @me
```

Move the board status to **In Progress**. This repo's project board is `SatcherInstitute` org project number 5 (id `PVT_kwDOBCaVcM4BeXhW`), Status field id `PVTSSF_lADOBCaVcM4BeXhWzhYyS0g`, "In Progress" option id `47fc9ee4`.

```bash
ISSUE_NODE_ID=$(gh issue view <number> --json id -q .id)

# Find the existing project item id, if the issue is already on the board
ITEM_ID=$(gh api graphql -f query='
{
  organization(login: "SatcherInstitute") {
    projectV2(number: 5) {
      items(first: 100) {
        nodes { id content { ... on Issue { number } } }
      }
    }
  }
}' -q ".data.organization.projectV2.items.nodes[] | select(.content.number == <number>) | .id")

# Not on the board yet — add it
if [ -z "$ITEM_ID" ]; then
  ITEM_ID=$(gh api graphql -f query="mutation { addProjectV2ItemById(input: { projectId: \"PVT_kwDOBCaVcM4BeXhW\" contentId: \"$ISSUE_NODE_ID\" }) { item { id } } }" -q .data.addProjectV2ItemById.item.id)
fi

gh api graphql -f query="mutation { updateProjectV2ItemFieldValue(input: { projectId: \"PVT_kwDOBCaVcM4BeXhW\" itemId: \"$ITEM_ID\" fieldId: \"PVTSSF_lADOBCaVcM4BeXhWzhYyS0g\" value: { singleSelectOptionId: \"47fc9ee4\" } }) { projectV2Item { id } } }"
```

If the GraphQL calls fail (e.g. permissions), don't block the rest of the skill on it — note the failure and continue.

---

## Step 4 — Branch from clean main

```bash
git fetch origin main --quiet
git checkout -b <type>/<slug> origin/main
```

Derive `<type>` from the issue's labels: `bug` → `fix`, `enhancement`/`feature request` → `feat`, otherwise `chore`. Derive `<slug>` from the issue title (kebab-case, trimmed to ~5 words).

Never branch from whatever happens to be checked out — always cut from `origin/main` directly, per this repo's branch discipline.

---

## Step 5 — Gather context, then implement directly

No pause for confirmation here — do the research, then go straight into writing code. Summarize findings in 2-3 sentences before diving in, not a full report.

**Related issues and PRs:**

```bash
gh issue view <number> --json body -q .body | grep -oE '#[0-9]+'   # explicit "Related: #NNNN" links in the body
gh search issues "<keyword from title>" --repo SatcherInstitute/health-equity-tracker --state all
gh search prs "<keyword from title>" --repo SatcherInstitute/health-equity-tracker --state merged
git log --oneline --all --grep="<keyword from title>"
```

Specifically check whether this issue is a promised follow-up from a prior PR — search merged PR bodies for "deferred", "follow-up", or "scoped out" plus the topic keyword. If found, that PR is the canonical pattern to replicate; read it in full (`gh pr view <N> --json body,files` and read the changed files at their current state, not the diff).

**Sibling code patterns:** if the issue is "add X to topic A" and topic A has siblings that already do X (e.g. suppression detection landed on WISQARS/cancer before HIV), read those sibling files in full before writing anything. The right shape is almost always copy-and-adapt from the most recent sibling implementation, not invent-from-scratch — recent siblings encode lessons (like the WISQARS implicit-merge-key issue) that older ones don't.

**Situational flags — mention inline if applicable, don't stop for them:**
- If the issue touches a skill file or `CLAUDE.md`: that work must ship as its own PR, on a branch cut from clean main, separate from any other change.
- If the issue mentions data being "stale" or "old": multi-year public health data lag is normal, not a defect — confirm against the source's actual release cadence before treating it as a bug.
- If the issue is security-adjacent: this repo is public; frame the work and any issue/PR text as neutral hardening, not a vulnerability disclosure.
- If the issue mentions "prod": merging to `main` deploys to dev only; prod requires an explicit release cut (`/release`). Don't imply a merge here ships to production.
- If you land on a genuine design decision or a "revisit later" note while implementing: put it in the issue or PR body as a comment, not in local memory — GitHub is the durable record for project decisions.

Then implement. Use `TaskCreate`/`TaskUpdate` to track multi-step implementation work if it has more than a couple of discrete pieces.

---

## Notes

- This skill assigns and moves the board status unconditionally — that's the explicit point of running it. Don't ask permission for those two actions.
- Step 5's research is not optional even for small-looking issues — the sibling-pattern check is what prevents reinventing conventions that already exist elsewhere in the codebase.
- Do not open a PR as part of this skill. That's `/pr`'s job, once the implementation is ready.
