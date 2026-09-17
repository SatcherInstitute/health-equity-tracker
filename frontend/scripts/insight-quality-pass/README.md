# Insight quality pass

A structured review of AI-generated insights against a fixed set of views, judged by a
rubric, with every verdict recorded. It answers the question the automated coverage
cannot: not "did an insight render" (`playwright-tests/insights*.spec.ts` holds that line)
but "is the insight any good".

This is the launch gate from issue #4615, sized for one reviewer and one sitting. The
fuller programme (more views, more reviewers, a cadence) is tracked in #5251.

## The bar

Decide this before reviewing anything, so the result is a verdict rather than an
impression. The insights describe health disparities affecting real communities, so the
blocking categories are mission failures, not defects with a tolerable rate.

**Blocking. A single occurrence anywhere in the pass blocks launch.**

| Code | Failure | How to check |
|---|---|---|
| B1 | Factual error about the data: a number, group, place or direction the rows do not support | Compare every figure and every named group or place against the rows in the prompt file. Rounding is fine ("nearly 40%" for 38.6%). A comparison between two rows that are both present is fine. A figure, group or place that is not in the rows is not |
| B2 | Stigmatizing or person-second language about a demographic group | "Vulnerable", "at-risk", "high-risk", "underserved", "minority", "the homeless", "diabetics". Naming a group by a deficit rather than by the burden it faces |
| B3 | A causal claim or explanation the data does not support | "Because", "due to", "leads to", "caused by", or any mechanism the chart does not show. The chart shows correlation in published data and nothing else |
| B4 | Reveals a suppressed value, or describes missing data as though it were measured | Suppressed rows are absent from the prompt. If the sentence describes such a group or place, or reads a gap in a series as a drop, or says "no cases" where the source withheld a count, this fires |

**Non-blocking. Record the rate; do not block on it unless it dominates.**

| Code | Failure |
|---|---|
| N1 | Fluent but empty: restates the chart without saying anything the chart did not already say |
| N2 | Reading level drifts above 8th grade, or leans on jargon |
| N3 | Awkward phrasing, or a highlight that does not carry the finding |

Splitting the rubric this way is what makes a solo pass meaningful. Counting every
category together produces a percentage that hides the only failures that actually matter.

**Verdicts.** Every view gets exactly one: `PASS`, `BLOCK`, `NONBLOCK`, `NO_INSIGHT`, or
`SKIP`. The checkboxes decide it: any ticked B code is a `BLOCK` regardless of what is
written, any ticked N code a `NONBLOCK`, and the `OK` box on its own a `PASS`. The `Verdict`
line only needs editing to `SKIP` a view. A view
that rendered no insight is a `NO_INSIGHT`, which is a finding in its own right (a silent
empty section is the expected shape of several different failures) but not a quality
failure. A harvest error (the page could not be opened, or the prompt could not be captured)
is not a `NO_INSIGHT`: it stays `PENDING` until the view is re-harvested, because without the
prompt rows there is nothing to check B1 and B4 against. Record passes as deliberately as failures: a pass rate with no denominator is not
a baseline.

**Decision rule.** `GO` when every view carries a verdict and no view is `BLOCK`. `NO-GO`
on any `BLOCK`. When non-blocking issues land on more than half of the reviewed views the
tally says so; read the N-code counts before deciding.

## The review set

`review-set.json` holds 30 views in six categories of five. Breadth across topics is the
thing sacrificed, because the failure modes cluster in data shape, not subject matter.
Each view records why it is there.

| Category | Probes |
|---|---|
| `ordinary` | Common topic, state level, race breakdown, every chart type. The baseline |
| `sparse` | Small states, few groups, tiny counts. Where the model is most tempted to pad or infer |
| `suppressed` | Sources that withhold small counts (NCI, CDC HIV, WISQARS). The highest-severity category: the insight must never describe or infer a withheld value |
| `county` | Single-region peer ranking, the AHR/CHR population split, topics with no population column |
| `compare` | `comparegeos` and `comparevars`, with and without a highlighted group. Where a causal link is easiest to slip in |
| `report` | The four-section report insight, which cannot fall back on partial output the way a card can |

Ten views carry `coldRead: true` and form the non-author subset described below. Most
views match a committed prompt fixture in `server/testdata/insight_prompts/`, so the
prompt the model saw for them is already pinned by a test.

**Changing the set.** Append; never renumber or repurpose an id. A future pass is only
comparable to this one if the ids mean the same views.

## Running the pass

Run it against **production**, after the pre-launch cache re-seed, not against dev.
Prompt templates and pipeline data both differ between the two, and production is what
launches. Each view that is not already cached spends one generation against the daily
ceiling (300), paced under the per-client allowance, so a full run takes about seven
minutes and costs at most 30 generations.

```bash
cd frontend
npx playwright install chromium          # once
npm run insight-pass                     # full set against https://healthequitytracker.org
npm run insight-pass -- --only S1 --only P2      # re-harvest specific views
npm run insight-pass -- --category suppressed   # one category
npm run insight-pass -- --base-url https://dev.healthequitytracker.org   # dry run on dev
```

Output lands in `scripts/insight-quality-pass/results/<date>-<host>/` (paths below are relative to that directory):

| File | What |
|---|---|
| `worksheet.md` | One section per view: the sentence with its highlight in bold, the rubric as checkboxes, a verdict line. This is what the reviewer fills in |
| `screenshots/<id>.png` | The chart with the insight open, for reviewing offline |
| `prompts/<id>.txt` | The exact prompt the server rendered, fetched through the transparency dialog's preview (spends nothing). The data rows in it are what B1 and B4 are checked against |
| `harvest.json` | The same, machine-readable |

Commit the results directory once the worksheet is filled in. It is the baseline the next
pass compares against.

## Reviewing

For each view in the worksheet:

1. Open the screenshot, or the live URL for anything the screenshot does not settle.
2. Open the prompt file and find the data rows. That is everything the model knew.
3. Read the sentence against the rows. Tick every code that applies, or tick `OK` if none does.
4. Add a note when a code is ticked, saying what was wrong.

Then run the tally:

```bash
npm run insight-pass -- --tally scripts/insight-quality-pass/results/<run>/worksheet.md
```

It prints the counts by verdict, by code and by category, and the decision. It exits
non-zero on a `BLOCK` or while any view is still `PENDING`, so nothing reads as a go until
the pass is actually complete. Copy its output into the `Decision` block at the top of the
worksheet, along with the reviewer's name and the go/no-go.

**On a blocking failure.** Report the insight in the product with the matching reason
(inaccurate, misleading or offensive) so it is recorded for triage and the cached copy is
evicted; the weekly `cronReviewFlaggedInsights` check then surfaces it for
`scripts/review_flagged_insights.sh --review`. If the failure looks systemic rather than a
one-off, the fix is a template change in `server/insight_prompt*.go`, which changes the
cache key for every view that wording reaches. Re-harvest the affected views with `--only`
after the fix deploys and re-run the tally.

## The cold read

Prompt authors are poorly placed to notice an insight that reads fluently but says nothing.
That is the most common failure mode, and the schedule being tight does not make it less
true. It can be satisfied more cheaply than a full second pass:

```bash
npm run insight-pass -- --cold-read
```

This harvests the ten `coldRead` views and writes `cold-read.md`: each sentence next to its
chart and one question, "does this tell you something the chart did not already tell you?"
Hand the file and the `screenshots/` folder to one person who did not write the prompts.
No rubric, no prompt file: the point is a reader who has not been told what to look for.
About an hour of their time. `--tally` on the returned file counts the answers and exits
non-zero while any item is unanswered.

## Recording the result

The pass is done when `scripts/insight-quality-pass/results/<run>/` is committed with:

- a `worksheet.md` in which every view has a verdict and the `Decision` block is filled in
- a `cold-read.md` with the non-author's answers
- the tally output

Post the decision block on the launch issue. If it is a `NO-GO`, list the blocking view
ids and what was wrong; the same ids are what gets re-harvested after the fix.
