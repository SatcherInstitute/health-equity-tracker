---
name: next
model: sonnet
description: Figure out the best new thing to work on. Pulls open items from the GitHub project board, weighs assignment and labels, then prioritizes cleanly closeable scoped work and issues that would wrap up a milestone. Use when the user wants to know what to work on next, or run /next.
---

# /next

Recommend the single best issue to work on next, with a short ranked shortlist. Pull live data from the GitHub project board and milestone list; cross-reference memory for project priorities. Do not rely on memory alone — GitHub is the authoritative source.

---

## Step 1 — Fetch board items and milestone health in one call

Issue both commands in parallel (they are independent):

**Project board — open items:**
```bash
gh api graphql -f query='
{
  organization(login: "SatcherInstitute") {
    projectV2(number: 5) {
      items(first: 100) {
        nodes {
          fieldValues(first: 10) {
            nodes {
              ... on ProjectV2ItemFieldSingleSelectValue {
                name
                field { ... on ProjectV2SingleSelectField { name } }
              }
            }
          }
          content {
            ... on Issue {
              number
              title
              state
              assignees(first: 3) { nodes { login } }
              labels(first: 8) { nodes { name } }
              milestone { title number }
              url
              body
            }
          }
        }
      }
    }
  }
}'
```

**Milestone health:**
```bash
gh api 'repos/SatcherInstitute/health-equity-tracker/milestones?state=open&per_page=50'
```

Also read the memory index to surface any standing priorities:
- `/Users/bhammond/.claude/projects/-Users-bhammond-code-health-equity-tracker/memory/MEMORY.md`

---

## Step 2 — Filter to actionable items

From the board results, keep only items where:
- `content.state == "OPEN"` (issue is not closed)
- board Status field is **"In Progress"**, **"Up Next"**, or **"Backlog"** (exclude "Done")

Extract for each item:
- Issue number and title
- Board status: In Progress / Up Next / Backlog
- Assignees (logins)
- Labels
- Milestone title and number
- URL

---

## Step 3 — Score each item

Score each open item from 0–100 using these weighted signals. Higher = better to pick up next.

### Scoring rubric

| Signal | Points |
|---|---|
| Board status: **In Progress** | +40 |
| Board status: **Up Next** | +25 |
| Board status: **Backlog** | +5 |
| Assigned to `bhammond` (or unassigned — available to pick up) | +15 (assigned) / +5 (unassigned) |
| Assigned to someone else | -30 (skip unless no other options) |
| Milestone with **1 open issue** remaining (this could close it) | +30 |
| Milestone with **2–3 open issues** remaining | +15 |
| Milestone with **4–6 open issues** remaining | +5 |
| Label: `bug` | +10 |
| Label: `enhancement` or `feature` | +5 |
| Label: `infrastructure` | +3 |
| Top-priority milestone from memory (e.g., Generated Insights / insights prod launch) | +20 |
| Issue body is short and concrete (< 400 chars) — signals scope clarity | +8 |
| Issue body references a specific file, function, or PR — strongly scoped | +12 |

Apply all signals that match; scores can exceed 100 if many apply.

### Milestone near-completion bonus

For each open milestone compute: `open_issues / (open_issues + closed_issues)`. When this ratio is < 0.25 (less than 25% remaining), add the milestone-near-completion bonus from the rubric above. This rewards issues that would wrap up a long-running push.

---

## Step 4 — Rank and pick

Sort scored items descending. Identify the top recommendation and a shortlist of up to 4 runners-up.

Discard items assigned to someone other than `bhammond` unless they are the only In Progress item or there is genuinely nothing better — note this in the output.

---

## Step 5 — Output the recommendation

Print a short, structured response. No headers beyond the top recommendation label. No bullet-point essays.

Format:

```
**Top pick: #<number> — <title>**
<One sentence: why this is the best choice right now — milestone impact, assignment status, scope clarity.>
<URL>

Runners-up:
1. #<number> — <title> (<milestone, if any>) — <7-word reason>
2. #<number> — <title> (<milestone, if any>) — <7-word reason>
3. #<number> — <title> (<milestone, if any>) — <7-word reason>
```

If the top pick would close a milestone entirely (it is the last open issue), say so explicitly: "Closing this would wrap up the <Milestone Name> milestone."

If the user's current branch has an open PR, note it briefly and ask whether they want to finish that first.
```bash
gh pr list --author bhammond --state open --json number,title,headRefName | head -5
```

Keep the whole response under 200 words.
