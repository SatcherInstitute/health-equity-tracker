---
name: report-out
model: opus
description: Generate a non-technical executive summary of the previous month's work and post it to the Deliverable Metrics Catch-All Notion page. Pulls GitHub merged PRs across the full repo, Gmail threads, and Google Drive docs for the period; asks interactively about how significant items landed; then translates everything into impact language (health equity, financial sustainability, profile, team velocity) with quantified metrics wherever possible. Use when the user wants to report out on the month's work, catch up the Notion page, or run /report-out.
---

# /report-out

Produce a non-technical executive summary of the previous month's work and post it to the
Deliverable Metrics Catch-All Notion page at page ID `39e852c1676e8057b66ef141e18d9322`.

The user may pass a month as an argument (e.g. `/report-out June 2026`). If none is given, default to the previous calendar month relative to today.

The audience for the output is non-technical stakeholders: funders, leadership, board members. Strip all engineering jargon. Lead with outcomes, not code changes.

---

## Step 1 — Determine the reporting period

Parse the month from any argument the user supplied. If none, derive it from today's date: "previous calendar month." Set:
- `REPORT_MONTH` (e.g. "July 2026")
- `DATE_START` (first day, ISO format, e.g. "2026-07-01")
- `DATE_END` (first day of current month, e.g. "2026-08-01") — the `gh pr list` filter uses `mergedAt >= DATE_START AND mergedAt < DATE_END`

---

## Step 2 — Gather raw data in one pass

Issue **all** of these in a single message (they are independent):

### GitHub PRs
```bash
gh pr list \
  --repo SatcherInstitute/health-equity-tracker \
  --state merged \
  --json number,title,author,mergedAt,body,labels \
  --jq '[.[] | select(.mergedAt >= "DATE_START" and .mergedAt < "DATE_END") | select(.author.login != "app/dependabot")]'
```

### Notion page — current state
Use `mcp__notion__API-get-block-children` with `block_id: "39e852c1676e8057b66ef141e18d9322"` to read what is already there. This tells you what months are covered and what format to match.

### Gmail — external communications
Search Gmail for threads in the reporting period that touch the project: grants, partnerships, press, stakeholder updates, demos, user feedback. Use `mcp__gmail__search_threads` with a query like:
```
after:DATE_START before:DATE_END (health equity tracker OR HET OR Satcher OR disparity)
```
Skim subject lines and first 200 chars of each thread. Flag any that represent:
- A grant, funding, or partnership inquiry
- A media mention or press request
- A demo, conference, or speaking engagement
- Substantive user or stakeholder feedback

### Google Drive — documents
Use `mcp__google_drive__list_recent_files` or search for documents modified in the period. Flag slide decks, reports, proposals, or methodology docs.

---

## Step 3 — Cluster and triage the PRs

Group PRs into clusters by theme. Suggested themes (recombine as the actual PRs suggest):
- AI insights (Gemini integration, prompts, caching, UX)
- Data quality / map / visualization
- Accessibility and mobile UX
- Performance and reliability
- Developer tooling and infrastructure
- Documentation

For each cluster, note the catchy metric potential:
- Did it eliminate a wait? Quantify the before/after time.
- Did it reduce cost or API spend? State the % reduction.
- Did it add a new dataset or health topic? Name it.
- Did it fix something users were hitting? Describe the user-visible problem it solved.
- Did it improve a11y in a measurable way (WCAG criteria met)?

**What to skip entirely:** dependency bumps, cSpell word additions, test fixture updates, internal tooling that has zero user-visible impact, style/format-only changes with no behavioral effect. These are never worth a bullet in the report.

---

## Step 4 — Interactive clarification

Before writing the final report, surface 3-7 specific questions to the user. The goal is to:
1. Fill in impact numbers you can't derive from the diff alone
2. Learn how significant items actually landed (did the demo go well? did the grant come through?)
3. Ask about major work that may not be in GitHub (talks, partnerships, external feedback)

Format your questions as a numbered list. Keep each one short. Examples of good questions:
- "The Gemini migration moved insight generation to free-tier GCP. Do you know the actual cost reduction vs the Anthropic account? (e.g., '$X/month → $0')"
- "PR #5024 fixed map data suppression labeling — was this in response to a specific user report or partner complaint?"
- "I didn't see any grant or partnership emails in July — is there anything in that space worth including?"
- "Were there any demos, conference presentations, or media mentions in July I should know about?"

**Wait for the user's answers before proceeding.** Do not write the summary until they reply (or explicitly say to proceed without answers).

---

## Step 5 — Synthesize into the impact report

Translate everything into non-technical impact language across these buckets. You will not always have content for every bucket — omit empty ones rather than padding.

### Bucket order and framing

**Health Equity Advancement**
What did this month's work do to help the tracker surface, communicate, or act on health disparities? New data topics, improved accuracy, better labeling of missing/suppressed data, improved accessibility that reaches more users. Each bullet should name the health outcome or population affected where possible.

Example bullets:
- "Added AI-generated narrative insights to every health disparity chart, making data findings accessible without statistical literacy"
- "Fixed misleading 'no data' labels on map tooltips — users now see 'unavailable' vs 'suppressed' so they understand data gaps rather than inferring incorrect conclusions"

**Financial Sustainability**
Cost reductions, free-tier migrations, avoidance of new spend, grants, funding-relevant demos. Quantify in dollars or percentages wherever possible.

Example bullets:
- "Migrated AI insight generation from a paid Anthropic account to Gemini's free-tier GCP quota — eliminating recurring AI infrastructure cost with no billing account attached"
- "Structural usage ceiling means AI generation stops rather than accruing overage charges"

**Profile and Visibility**
Media, conference presentations, external demos, partnerships, stakeholder conversations, new use cases of the data. Name the organizations or events where possible.

**Team Velocity**
Developer experience improvements that let the team ship faster or with fewer errors. Frame in terms of time saved, errors prevented, or onboarding simplified — not in terms of refactors or code quality.

Example bullets:
- "Automated PR screenshot uploads unblocked a step that previously stalled every UI release cycle due to expired authentication tokens"
- "Scroll-settling fix eliminated a class of intermittent failures that required manual re-navigation after every deep link"

**Product Quality and Reliability**
User-facing bug fixes and UX improvements that didn't fit elsewhere. Frame from the user's perspective: what was broken, what does it do now.

---

### Writing rules

- Every bullet should pass this test: "Would a funder or board member find this meaningful?"
- Quantify whenever possible: time, percentage, dollar, count of users/topics/states affected
- If a metric is an estimate, label it as such ("~10 seconds → instant")
- No code names, file paths, PR numbers, branch names, or GitHub jargon in the final output
- No sentences about "refactoring," "cache keys," "state machines," or similar internal concepts
- If multiple PRs collectively achieve one outcome, merge them into one bullet
- Aim for 8-15 bullets total across all buckets. Fewer tight bullets beat more vague ones.

---

## Step 6 — Format for Notion

Structure the output as a new section to append to the existing page. Match the heading level and style already in use (read from Step 2's page fetch).

The section should look like:

```
## [REPORT_MONTH]

### Health Equity Advancement
- bullet
- bullet

### Financial Sustainability
- bullet

### Profile and Visibility
- bullet

### Team Velocity
- bullet

### Product Quality and Reliability
- bullet
```

---

## Step 7 — Post to Notion

1. Use `mcp__notion__API-retrieve-a-page` with `page_id: "39e852c1676e8057b66ef141e18d9322"` to get the current page metadata (title, parent, etc.).

2. Use `mcp__notion__API-patch-block-children` with `block_id: "39e852c1676e8057b66ef141e18d9322"` to **append** the new section as blocks. Do not overwrite or move existing content.

   Build the block array:
   - One `heading_2` block for the month heading
   - For each non-empty bucket: one `heading_3` block, then one `bulleted_list_item` block per bullet
   - Add a blank `paragraph` block between sections for readability

3. After posting, retrieve the page URL and report it to the user.

---

## Step 8 — Confirm and report

Tell the user:
- The month covered
- How many bullets were posted across which buckets
- The Notion page URL
- Any significant items you chose to omit and why (so they can override)

---

## Notes

- Never include PR numbers, branch names, file paths, or commit hashes in the Notion output — these are internal artifacts
- Dependabot bumps, cSpell word adds, and lint-only changes are always excluded
- If Gmail or Drive data requires account authentication, note what's missing and proceed with GitHub data only
- The Notion page is public-facing (stakeholders may read it); frame all language accordingly
- When in doubt about whether something crosses the "meaningful to a funder" bar, leave it out and mention it to the user at the end
