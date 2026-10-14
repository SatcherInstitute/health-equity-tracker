---
name: next
model: sonnet
description: Figure out the best new thing to work on. Pulls open items from the GitHub project board, weighs assignment and labels, then prioritizes cleanly closeable scoped work and issues that would wrap up a milestone. Use when the user wants to know what to work on next, or run /next.
---

# /next

Recommend the single best issue to work on next, with a short ranked shortlist. Pull live data from the GitHub project board and milestone list; cross-reference memory for project priorities. Do not rely on memory alone — GitHub is the authoritative source.

---

## Step 1 — Fetch board items, off-board issues, and milestone health in one call

Issue all four commands in parallel (they are independent):

**Project board — ALL items (paginated):**

Use a Python script to paginate through every board item. Do not cap at 100; keep fetching until `hasNextPage` is false.

```bash
python3 - <<'PYEOF'
import subprocess, json, sys

all_nodes = []
project_id = None
cursor = None

while True:
    after = f', after: "{cursor}"' if cursor else ''
    query = f"""{{
  organization(login: "SatcherInstitute") {{
    projectV2(number: 5) {{
      id
      items(first: 100{after}) {{
        pageInfo {{ hasNextPage endCursor }}
        nodes {{
          fieldValues(first: 10) {{
            nodes {{
              ... on ProjectV2ItemFieldSingleSelectValue {{
                name
                field {{ ... on ProjectV2SingleSelectField {{ name }} }}
              }}
            }}
          }}
          content {{
            ... on Issue {{
              id number title state
              assignees(first: 3) {{ nodes {{ login }} }}
              labels(first: 8) {{ nodes {{ name }} }}
              milestone {{ title number }}
              url
            }}
          }}
        }}
      }}
    }}
  }}
}}"""
    r = subprocess.run(['gh', 'api', 'graphql', '-f', f'query={query}'],
                       capture_output=True, text=True)
    if r.returncode != 0:
        print(f"gh api error: {r.stderr}", file=sys.stderr); sys.exit(1)
    resp = json.loads(r.stdout)
    if 'errors' in resp:
        print(f"GraphQL errors: {resp['errors']}", file=sys.stderr); sys.exit(1)
    org = resp.get('data', {}).get('organization')
    if not org or not org.get('projectV2'):
        print(f"Unexpected response shape: {resp}", file=sys.stderr); sys.exit(1)
    pv2 = org['projectV2']
    if not project_id:
        project_id = pv2['id']
    page = pv2['items']
    all_nodes.extend(page['nodes'])
    if not page['pageInfo']['hasNextPage']:
        break
    cursor = page['pageInfo']['endCursor']

print(json.dumps({'project_id': project_id, 'nodes': all_nodes}))
PYEOF
```

**Milestone health:**
```bash
gh api 'repos/SatcherInstitute/health-equity-tracker/milestones?state=open&per_page=50'
```

**Recently opened issues (last 60 days) — catches new issues not yet added to the board:**

```bash
SIXTY_DAYS_AGO=$(date -u -v-60d +%Y-%m-%d 2>/dev/null || date -u -d '60 days ago' +%Y-%m-%d)
gh issue list --repo SatcherInstitute/health-equity-tracker --state open --search "created:>$SIXTY_DAYS_AGO" --limit 100 --json number,title,assignees,labels,milestone,url,createdAt
```

**Issues assigned to the current user — catches assigned work that may have fallen off the board:**

Capture the runner's login first so scoring and discard logic below can compare against it (never hardcode a username — this skill is run by multiple contributors):

```bash
GH_USER=$(gh api user -q .login)
gh issue list --repo SatcherInstitute/health-equity-tracker --state open --assignee @me --limit 100 --json number,title,assignees,labels,milestone,url,createdAt
```

Also read the memory index to surface any standing priorities:
- `/Users/bhammond/.claude/projects/-Users-bhammond-code-health-equity-tracker/memory/MEMORY.md`

---

## Step 2 — Merge board and off-board issues

1. Collect all issue numbers from the board result into a set.
2. From the recent-issues and assigned-issues results, keep any issue whose number is **not** in that set — these are **off-board** (not yet added to the project board). Deduplicate by issue number across both lists.
3. Tag off-board issues with board status **"No Milestone"** if they have no milestone, or **"Off Board"** if they do have a milestone but aren't on the project board.

From all sources (board + off-board), keep only items where:
- `state == "OPEN"`
- board Status is **"In Progress"**, **"Up Next"**, **"Backlog"**, **"No Milestone"**, or **"Off Board"** (exclude "Done")

Extract for each item:
- Issue number and title
- Board status: In Progress / Up Next / Backlog / No Milestone / Off Board
- Assignees (logins)
- Labels
- Milestone title and number
- URL
- `createdAt` (off-board items only, to compute age)

---

## Step 3 — Score each item

Score each open item from 0–100 using these weighted signals. Higher = better to pick up next.

### Scoring rubric

| Signal | Points |
|---|---|
| Board status: **In Progress** | +40 |
| Board status: **Up Next** | +25 |
| Board status: **Backlog** | +5 |
| Board status: **Off Board** or **No Milestone** (not on project board) | +2 |
| Assigned to the current user `$GH_USER` (or unassigned — available to pick up) | +15 (assigned) / +5 (unassigned) |
| Assigned to someone else | -30 (skip unless no other options) |
| Milestone with **1 open issue** remaining (this could close it) | +30 |
| Milestone with **2–3 open issues** remaining | +15 |
| Milestone with **4–6 open issues** remaining | +5 |
| Label: `bug` | +10 |
| Label: `enhancement` or `feature` | +5 |
| Label: `infrastructure` | +3 |
| Top-priority milestone from memory (e.g., Generated Insights / insights prod launch) | +20 |
| Off-board and opened within the last **14 days** | +10 |
| Off-board and opened within the last **60 days** | +5 |

Apply all signals that match; scores can exceed 100 if many apply.

### Milestone near-completion bonus

For each open milestone compute: `open_issues / (open_issues + closed_issues)`. When this ratio is < 0.25 (less than 25% remaining), add the milestone-near-completion bonus from the rubric above. This rewards issues that would wrap up a long-running push.

---

## Step 4 — Rank and pick

Sort scored items descending. Identify the top recommendation and a shortlist of up to 4 runners-up.

Discard items assigned to someone other than the current user (`$GH_USER`) unless they are the only In Progress item or there is genuinely nothing better — note this in the output.

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

If any item in the top-5 is off-board, append a one-line note after the shortlist: "Note: #NNNN and #NNNN are not on the project board."

If the user's current branch has an open PR, note it briefly and ask whether they want to finish that first.

```bash
CURRENT_BRANCH=$(git branch --show-current)
gh pr list --author @me --state open --head "${GH_USER}:$CURRENT_BRANCH" --json number,title,headRefName
```

Keep the whole response under 200 words.

---

## Step 6 — Project management cleanup

After outputting the recommendation, scan the full issue list for obvious cleanup. Do what is clearly correct without asking; ask about anything that seems useful but needs a judgment call. Never assign issues to people.

**Do silently (no confirmation needed):**
- Add a milestone to an issue when the fit is unambiguous from the issue title and the milestone description (e.g., an issue titled "fix suppressed data label" clearly belongs in the "Handle SUPPRESSED vs MISSING data" milestone)
- Add an off-board issue to the project board when it has a milestone already set

```bash
# Add milestone (get milestone node_id from milestone health data already fetched)
gh api repos/SatcherInstitute/health-equity-tracker/issues/<number> -X PATCH -f milestone=<milestone_number>

# Add issue to project board
gh api graphql -f query='mutation { addProjectV2ItemById(input: { projectId: "<project_node_id>" contentId: "<issue_node_id>" }) { item { id } } }'
```

**Ask about (one short question per item, grouped at the end):**
- An issue that might belong in a milestone but the fit is ambiguous
- A milestone that looks nearly done but has a blocker issue that seems stale
- Any pattern in the off-board issues that suggests a missing milestone

Do not mention cleanup if there is nothing to do.
