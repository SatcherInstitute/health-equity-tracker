---
name: review
model: opus
description: Senior engineer review of the open PR (or a specified PR number) across four lenses - scientific accuracy, sensitive language, maintainability, and accessibility. Posts a formal GitHub review (request-changes if any BLOCKING issues found, otherwise comment). Nits are routed to tooling suggestions rather than inline comments. Advances health equity by catching data errors, harmful language, and a11y failures before they reach users.
---

# /review

Perform a senior engineer review of the open PR. The review evaluates the change through four lenses weighted by PR type, posts findings as a formal GitHub review, and routes nits to tooling suggestions rather than cluttering the review thread.

The user may pass a PR number as an argument (e.g. `/review 4764`). If none is given, detect the open PR from the current branch.

---

## Step 1: Identify PR and gather context

```bash
gh pr view --json number,title,body,headRefName,baseRefName,files,commits
REPO=$(gh repo view --json nameWithOwner -q .nameWithOwner)
```

If no open PR is found: print an error and stop.

Get the full diff and changed file list:

```bash
git fetch origin main --quiet
git diff origin/main...HEAD
git diff origin/main...HEAD --name-only
```

Read each changed file in full (not just the diff). The diff alone can be misleading without surrounding context.

---

## Step 2: Classify PR type and weight lenses

Determine which of these categories best describes the PR (may be multiple):

| Type | Key signals |
|---|---|
| **Backend data pipeline** | Changes in `python/datasources/`, `python/ingestion/`, `data/` |
| **Frontend UI** | Changes in `frontend/src/` |
| **Infrastructure / DAG** | Changes in `.github/workflows/dag*.yml`, `run_ingestion/`, `run_gcs_to_bq/` |
| **Docs / config** | Changes only in `*.md`, `CLAUDE.md`, config files |

Lens weights by type:

| Lens | Backend | Frontend | Infra | Docs |
|---|---|---|---|---|
| Scientific accuracy | HIGH | MEDIUM | LOW | LOW |
| Sensitive language | HIGH | HIGH | LOW | HIGH |
| Maintainability | HIGH | HIGH | MEDIUM | LOW |
| Accessibility | LOW | HIGH | LOW | LOW |

Apply all four lenses but focus depth and blocking thresholds on the HIGH-weight ones for this PR type.

---

## Step 3: Mission alignment gate

Before the detailed review, answer this question explicitly:

> Does this PR make the Health Equity Tracker more accurate, more accessible to users, or easier to maintain so more health equity data can flow? Does it improve developer experience in a way that broadens the contributor pool or makes the codebase more approachable? Or does it directly advance the Satcher Institute's mission of eliminating health disparities?

HET is an open-source project that actively welcomes early-career developers making their first open-source or production-grade commits. A PR that improves devX (better tooling, cleaner abstractions, modern patterns, documentation) is a valid and valuable contribution even if it does not touch health data directly. It expands the contributor pool that can eventually improve the data. PRs that let contributors work with interesting or resume-relevant technologies are genuinely good for the project.

If the PR appears to be from a first-time or early-career contributor: acknowledge that explicitly and warmly in the review body. "Great first contribution - here is what to address before merge" is more useful than a bare list of problems.

If the answer to all mission alignment questions is genuinely no: flag it as a question for the author, not a blocker.

---

## Step 4: Scientific accuracy lens (HIGH weight for backend PRs)

Check each item below. Mark as BLOCKING, IMPORTANT, or skip based on whether it applies.

**Data integrity:**
- Denominators and numerators cover the same population, geography, and time window. A rate computed over mismatched scopes is a data error, not a style issue.
- Race/ethnicity categories match HET standard labels. Reference `ingestion/standardized_columns.py` (`Race` enum) and the source's grouping logic. Non-standard labels silently produce null joins.
- Suppression thresholds: counts below 100 should be suppressed or flagged per HET policy. Verify suppression is applied before percent calculations, not after.
- Percent calculations: confirm which denominator is used. `pct_share_of_us_congress`, `pct_rate`, and `pct_rel_inequity` have distinct meanings. A `pct_share` using a total-population denominator when a group-specific one is available overstates disparity.
- Time period alignment: if merging two datasets, confirm both use the same reference year or that the merge accounts for the mismatch explicitly.
- Geographic scope: verify state vs county vs national aggregation is correct for each table. A county-level row accidentally aggregated to state silently undercounts.
- AIAN/API grouping: CAWP and some other sources combine AIAN+NHPI as AIANAPI. Verify the grouping logic matches `add_aian_api` and the downstream Race enum.
- Hardcoded years or thresholds that should reference shared constants (`ACS_EARLIEST_YEAR`, `ACS_CURRENT_YEAR`).

**Source fidelity:**
- Does the methodology comment or PR description accurately describe what the data measures? If the source changed format, is that reflected in the code and docs?
- Are `TODO` comments tied to a specific GitHub issue number? Floating TODOs rot.

---

## Step 5: Sensitive language lens (HIGH weight for frontend and data pipeline PRs)

**Person-first language:** "people with diabetes," not "diabetics"; "people experiencing homelessness," not "the homeless." Check all UI strings, column names that surface to users, and methodology text.

**Avoid:**
- "vulnerable populations" (use specific: "communities with lower income," "rural communities")
- "at-risk" without qualification
- "minority" as a noun without context (prefer "people of color," "Black and Latino communities," etc., matching the data source's own framing)
- Stigmatizing disease language: "substance abuser" should be "person with substance use disorder"; "addict" should be "person in recovery"
- Ableist defaults: "see the chart," "click here" in accessible contexts

**Race/ethnicity labels:** UI labels must match the HET standard display names (e.g., "Black or African American," "Hispanic or Latino"). Check `MetricConfig` tooltip labels and axis labels against `RACE_LABELS` or equivalent constants.

**Data source attribution:** If the PR surfaces data from a new source, verify the source name and methodology description are accurate and not inadvertently editorialized.

---

## Step 6: Maintainability lens (HIGH weight for backend and frontend PRs)

**Abstraction level:**
- Is new logic duplicating something in `ingestion/merge_utils.py`, `ingestion/dataset_utils.py`, or a shared frontend hook/util? Check before flagging; don't demand abstraction that doesn't exist yet.
- Is new abstraction created for a single call site? Three similar uses justify extraction; one does not.

**Patterns:**
- Backend: new `DataSource` subclasses should follow the `write_to_bq` / `get_breakdowns` split used by `CdcHiv`, `Phrma`, etc.
- Frontend: new metric configs belong in `MetricConfig<Topic>.ts`; new providers extend `VariableProvider` and register in `VariableProviderMap.ts`; new UI components use MUI + HET design tokens (`het-teal`, `het-purple`, `het-grey`, etc.), not raw hex values.
- Shared components: check `frontend/src/styles/HetComponents/` and `frontend/src/utils/` before suggesting a new component is needed.

**Test coverage:**
- Is the right thing tested? Unit tests on pure transforms are good. Integration tests that exercise the full `write_to_bq` path (like CAWP's `testWriteToBq`) catch join and aggregation bugs that unit tests miss.
- Golden data: if output tables changed shape, were golden CSVs regenerated?
- Are mocks faithful to the real API? A mock that accepts bad input and returns good output is worse than no test.

**Operational concerns:**
- New DAG workflows: does the workflow have a failure notification step? Does it respect the infra-test pattern?
- Data files committed to `data/`: is there a refresh script or documented process for keeping them current?

---

## Step 7: Accessibility lens (HIGH weight for frontend PRs)

**WCAG 2.1 AA baseline:**
- Color contrast: text on background >= 4.5:1; large text >= 3:1. Especially critical for data viz labels and map legends that use the HET color palette.
- No color-only encoding: every color distinction must also have a shape, pattern, or label distinction. Check D3 charts and map gradients.
- Interactive elements: buttons, links, and controls must have visible focus rings and accessible names (`aria-label` or visible text). Check any new `IconButton` or custom click targets.
- Screen reader: new charts need an accessible text alternative, either a summary description or a data table. Check whether `HetNotice` or equivalent is used for chart descriptions.
- Keyboard navigation: any new modal, dropdown, or drawer must trap focus correctly and release it on close.

**Motion:**
- Animations should respect `prefers-reduced-motion`. Check new CSS transitions or D3 transitions.

**Forms and inputs:**
- Every input needs a visible label (not just a placeholder). Error messages must be associated via `aria-describedby`.

---

## Step 8: Compile findings and draft review

Organize findings into three buckets:

### BLOCKING (must fix before merge)
Issues that produce incorrect data, harmful language, a11y failures that exclude users, or security problems. Request changes for any of these.

Format each as:
```
**[BLOCKING] <short title>**
File: `path/to/file.py`, line N
Issue: <what is wrong and why it matters>
Fix: <specific suggested change>
```

### IMPORTANT (should address, not a merge blocker)
Pattern violations, missing tests for significant logic, suboptimal abstractions, language that is imprecise but not harmful.

Format each as:
```
**[IMPORTANT] <short title>**
File: `path/to/file.py`, line N
Issue: <what and why>
Suggestion: <what to do>
```

### TOOLING SUGGESTIONS (do not post as inline comments)
Pure nits: import order, formatting, naming conventions that could be enforced by Biome, cspell word additions, pylint rules. Draft the actual config change so the author can open a quick follow-up PR:

```
**Tooling: <description>**
Consider a follow-up PR:
<details>
<summary>Suggested config change</summary>

\`\`\`json
// .biome.json
\`\`\`
</details>
```

---

## Step 9: Write review body and hand off to /review-post

Determine verdict:
- Any BLOCKING findings: `request-changes`
- No BLOCKING, but IMPORTANT findings or tooling suggestions: `comment`
- No findings: `comment` with a brief positive note (human reviewer still approves formally)

Write `/tmp/het-review.md` with the verdict on the first line, then the body:

```
VERDICT: <request-changes|comment>
## 🤖 Health Equity Tracker: Auto-Review

**PR type:** <backend data / frontend UI / infra / docs>
**Mission alignment:** <one sentence on how this advances health equity or devX, or flag if unclear>

---

### Scientific Accuracy
<findings or "No issues found">

### Sensitive Language
<findings or "No issues found">

### Maintainability
<findings or "No issues found">

### Accessibility
<findings or "No issues found">

---

### Tooling Suggestions
<tooling items, or omit section if none>

---

*Review by Claude Code (/review skill). Blocking issues require resolution before merge; important suggestions are at the author's discretion.*
```

Then invoke `/review-post` to handle the mechanical posting and thread-resolution. That skill runs on haiku and handles Steps 9-10 at a fraction of this skill's token cost.

---

## Notes

- Never push code changes as part of this skill. Review only.
- Be specific: vague feedback ("this could be cleaner") wastes the author's time. Cite file, line, and exact issue.
- Be proportionate: a one-line config change warrants a different level of scrutiny than a new data pipeline.
- Scientific errors and harmful language are always BLOCKING regardless of PR type or size.
- When in doubt about scientific accuracy, flag it as IMPORTANT and ask the question rather than guessing.
- Tone: honest but constructive. Early-career contributors especially benefit from knowing what is good as well as what needs to change.
