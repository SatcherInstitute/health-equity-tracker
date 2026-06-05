---
name: screenshot-pr
description: Take responsive screenshots of the current branch's frontend work and embed them into the open PR's Screenshots section. Use when the user wants to capture UI screenshots for a pull request, add screenshots to a PR, or run /screenshot-pr.
---

# /screenshot-pr

Take responsive screenshots of the current branch's frontend work — both page-level views and open dialogs/drawers — and embed them into the open PR's `## Screenshots` section. Screenshots are uploaded to a public GCS bucket and linked as markdown images. Re-running this skill always **replaces** the existing Screenshots section with fresh images.

The user may pass explicit routes as arguments (e.g. `/screenshot-pr /datacatalog /exploredata`). If no routes are given, infer them from changed files and always confirm before proceeding.

---

## Step 1 — Get PR context

```bash
gh pr view --json number,title,body,headRefName
```

If no open PR is found: print an error and stop.

Extract: `number` (PR number), `headRefName` (branch name), `body` (current PR body).

---

## Step 2 — Derive slugs

- **Feature slug**: take the branch name, strip a leading `feat/`, `fix/`, `feature/`, or `chore/` prefix, replace `/` and non-alphanumeric characters with `-`, lowercase, collapse consecutive `-`.
  - Example: `feat/mobile-bottom-sheet-and-e2e-matrix` → `mobile-bottom-sheet-and-e2e-matrix`
- **Output dir**: `/tmp/het-screenshots/pr-{number}/{feature-slug}`
- **GCS upload prefix**: `pr-{number}/{feature-slug}/`
- **Public URL base**: `https://storage.googleapis.com/het-pr-screenshots/pr-{number}/{feature-slug}/`

---

## Step 3 — Determine what to capture

**The goal is screenshots that visibly demonstrate what the PR changed.** A page in its default/empty state is not useful. Work out the most specific URL that actually shows the change, then confirm with the user before proceeding.

**If the user passed routes as arguments** (e.g. `/screenshot-pr /datacatalog`): use those exactly. Skip inference.

**If no routes were given**: investigate the diff to deduce what URLs will reveal the change.

```bash
git diff --name-only $(git merge-base HEAD origin/main)
git diff $(git merge-base HEAD origin/main) -- frontend/src/
```

Read the actual diff. Think like an investigator: what does a user have to load in the browser to see this change? Work through the evidence in this order:

**1. Find URLs already written in the codebase for this change.**

Scan Playwright test files related to the changed code for `goto(...)` calls — these are working URLs someone already chose to exercise the feature:

```bash
grep -r "goto(" frontend/playwright-tests/ --include="*.ts" -l
```

Read the matching test files. Extract the full URL strings. These are your best candidates.

**2. Find URL params that activate the changed UI.**

For any component that changed, grep for `useParamState` calls to find the URL param key that triggers it:

```bash
grep -r "useParamState" frontend/src/ --include="*.tsx" --include="*.ts" -n
```

If a changed file uses `useParamState('some-param')`, the param `some-param=true` added to a relevant page URL will open that UI.

**3. Map changed files to their page and the minimum state needed.**

| Changed path pattern | Base page | Notes |
|---|---|---|
| `src/pages/DataCatalog/**` | `/datacatalog` | Default state is useful |
| `src/pages/Landing/**` | `/` | Default state is useful |
| `src/pages/AboutUs/**` | `/aboutus` | Default state is useful |
| `src/pages/WhatIsHet/**` | `/whatishet` | Default state is useful |
| `src/pages/Policy/**` | `/policy` | Default state is useful |
| `src/styles/**` or `tokens/*.json` | `/` | Default state is useful |
| `src/pages/ExploreData/**` or `src/data/providers/**` or `src/data/config/**` | `/exploredata?...` | Needs topic params — use URLs from test files (step 1) or construct from context |

For ExploreData / provider / config changes: look at what topic or metric the changed files reference, find a test file URL that exercises it, and use that. `/exploredata` without params shows nothing useful — never propose it bare.

**4. Propose a concrete plan.**

List each URL you plan to screenshot and a one-line reason why it shows the change. If you cannot find any evidence of a meaningful URL for a changed file area (no test URLs, no param keys, no obvious default state), say so and explain what you found — don't guess.

**Always confirm before proceeding.** Show the user exactly what you plan to capture and why, and give them a chance to correct the plan before any screenshots are taken.

---

## Step 4 — Ensure dev server is running

```bash
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000
```

If the result is `200`: server is ready, continue.

If not `200`: start it automatically:

```bash
lsof -ti :3000 | xargs kill -9 2>/dev/null; sleep 1
cd frontend
npm run dev > /tmp/het-dev-server.log 2>&1 &
DEV_PID=$!
TIMEOUT=60
until curl -s http://localhost:3000 > /dev/null 2>&1; do
  if [ $TIMEOUT -le 0 ]; then echo "Dev server failed to start" >&2; kill $DEV_PID 2>/dev/null; exit 1; fi
  sleep 1; TIMEOUT=$((TIMEOUT - 1))
done
echo "Server ready"
```

Track `$DEV_PID` so you can kill it in Step 9 cleanup.

---

## Step 5a — Page-level screenshots

For each confirmed route, run the screenshot script from the `frontend/` directory:

```bash
cd /path/to/frontend  # use the absolute path to frontend/
npx tsx scripts/take-screenshots.ts \
  --base-url "http://localhost:3000" \
  --output-dir "/tmp/het-screenshots/pr-{number}/{feature-slug}" \
  --routes /route1 \
  --routes /route2
```

Run via `npx tsx /absolute/path/to/frontend/scripts/take-screenshots.ts` — do NOT use `cd frontend &&` (shell working directory may already be inside `frontend/`). Use the absolute path.

The script saves files named `{page-slug}-{width}px.png` in the output dir:
- `/` → `home-375px.png`, `home-768px.png`, `home-1280px.png`
- `/datacatalog` → `datacatalog-375px.png`, etc.

---

## Step 5b — Dialog/drawer screenshots (when modals changed)

When the PR includes changed modal or dialog components, write a temporary Playwright script to capture each dialog open at each viewport. Write it to `frontend/scripts/_dialog-screenshots.ts` (with the leading `_` so it's clearly temporary), then run it with an absolute path.

**Viewport heights:** use `844` for mobile, `1024` for tablet, `900` for desktop.

**Key considerations:**
- Some modals only mount below a breakpoint (e.g. `InsightReportModal` uses `!isDesktopLayout` which is `md` = 900px, so it never mounts at 1280px). Add a `maxWidth` guard per dialog and log a skip message rather than failing.
- Wait for `[role="dialog"]` to appear (up to 15s) before screenshotting. If it never appears, log a warning and move on.
- Disable animations with an injected style tag before screenshotting.
- Use `{ waitUntil: 'networkidle' }` on `page.goto` since the dev server fetches real data from GCP.
- Create a fresh browser context per dialog+viewport so sessions don't bleed.
- Use `fullPage: false` to capture only the visible viewport (dialog + dimmed background).

**Example script structure** (adapt params/dialogs as needed):

```ts
import { chromium } from '@playwright/test'
import { mkdirSync } from 'node:fs'
import { join } from 'node:path'

const BASE = 'http://localhost:3000'
const OUT  = '/tmp/het-screenshots/pr-{number}/{feature-slug}'
const HET_PARAMS = 'mls=1.hiv-3.00&mlp=disparity'  // adjust per topic

const VIEWPORTS = [
  { width: 375,  height: 844,  label: 'mobile'  },
  { width: 768,  height: 1024, label: 'tablet'  },
  { width: 1280, height: 900,  label: 'desktop' },
]

const DIALOGS = [
  { name: 'topic-info',     param: 'topic-info',    maxWidth: Infinity },
  { name: 'chlp-maps',      param: 'chlp-maps',     maxWidth: Infinity },
  { name: 'report-insight', param: 'report-insight', maxWidth: 899 },  // mobile/tablet only
  { name: 'multiple-maps',  param: 'multiple-maps', maxWidth: Infinity },
  { name: 'vote-dot-org',   param: 'vote-dot-org',  maxWidth: Infinity },
]

mkdirSync(OUT, { recursive: true })
const browser = await chromium.launch()

for (const dialog of DIALOGS) {
  for (const vp of VIEWPORTS) {
    if (vp.width > dialog.maxWidth) {
      console.info(`  [skip] ${dialog.name} @ ${vp.width}px (not mounted)`)
      continue
    }
    const ctx  = await browser.newContext({ viewport: { width: vp.width, height: vp.height } })
    const page = await ctx.newPage()
    await page.goto(`${BASE}/exploredata?${HET_PARAMS}&${dialog.param}=true`, { waitUntil: 'networkidle' })
    await page.addStyleTag({ content: '*, *::before, *::after { animation: none !important; transition: none !important; }' })
    try {
      await page.waitForSelector('[role="dialog"]', { timeout: 15000 })
      await page.waitForTimeout(600)
    } catch {
      console.warn(`  [warn] no dialog: ${dialog.name} @ ${vp.width}px`)
      await ctx.close()
      continue
    }
    const filename = `dialog-${dialog.name}-${vp.label}.png`
    await page.screenshot({ fullPage: false, path: join(OUT, filename) })
    console.info(`  [${vp.label}] ${filename}`)
    await ctx.close()
  }
}

await browser.close()
```

Run it:

```bash
npx tsx /absolute/path/to/frontend/scripts/_dialog-screenshots.ts
```

After all screenshots are captured, delete the temp script:

```bash
rm /absolute/path/to/frontend/scripts/_dialog-screenshots.ts
```

---

## Step 6 — Upload to GCS

Upload with `Cache-Control: no-cache` so GitHub's image proxy always fetches fresh content (without this, overwritten images show stale versions for hours):

```bash
gsutil -m -h "Cache-Control:no-cache, no-store" cp \
  /tmp/het-screenshots/pr-{number}/{feature-slug}/*.png \
  gs://het-pr-screenshots/pr-{number}/{feature-slug}/
```

Public read is granted at the bucket level via Terraform IAM (`allUsers:objectViewer`), so no per-object ACL flag is needed.

After upload, verify the count:

```bash
gsutil ls gs://het-pr-screenshots/pr-{number}/{feature-slug}/*.png | wc -l
```

If the count is less than the number of files captured, upload missing files individually with `gsutil cp -h "Cache-Control:no-cache, no-store"`.

If this fails with an authentication error: tell the user to run `gcloud auth application-default login` and retry.

---

## Step 7 — Build the Screenshots markdown

### Page-level screenshots

For each page route, derive a human-readable name (split on `-`/`/`, title-case, join with spaces). Append `?v={unix-timestamp}` to every URL (same timestamp across the whole run). Group by page:

```markdown
### {Page Name}

**Mobile (375px)**
![{Page Name} mobile]({url}/{slug}-375px.png?v={timestamp})

**Tablet (768px)**
![{Page Name} tablet]({url}/{slug}-768px.png?v={timestamp})

**Desktop (1280px)**
![{Page Name} desktop]({url}/{slug}-1280px.png?v={timestamp})
```

### Dialog screenshots

For each dialog, group by modal name. Note which breakpoints show a drawer vs a dialog. If a modal is mobile/tablet-only, add a note explaining why (e.g. "*(Desktop: rendered inline in sidebar)*"):

Append `?v={unix-timestamp}` to every image URL to bust GitHub's image proxy cache. Use the same timestamp for all images in a single run (capture it once: `TS=$(date +%s)`).

```markdown
### {Modal Name}

**Mobile (375px) — bottom-sheet drawer**
![{name} mobile]({url}/dialog-{name}-mobile.png?v={timestamp})

**Tablet (768px) — bottom-sheet drawer**
![{name} tablet]({url}/dialog-{name}-tablet.png?v={timestamp})

**Desktop (1280px) — dialog**
![{name} desktop]({url}/dialog-{name}-desktop.png?v={timestamp})
```

Separate each modal block with `---`. Omit the trailing `---` after the last block.

---

## Step 8 — Update the PR body (always replaces)

1. Get the current body (already fetched in Step 1, or re-fetch if needed).

2. Locate the `## Screenshots` section in the body:
   - **Found**: replace everything from `## Screenshots` to the end of the string (Screenshots is always the last section). Write the full updated body to `/tmp/het-screenshots/pr-{number}/body.md` and apply it.
   - **Not found**: append `\n\n## Screenshots\n\n{content}` to the end of the body.

3. Write to temp file and apply:

```bash
gh pr edit {number} --body-file /tmp/het-screenshots/pr-{number}/body.md
```

Using `--body-file` avoids shell quoting issues with long markdown content.

---

## Step 9 — Cleanup and confirm

```bash
kill $DEV_PID 2>/dev/null   # only if we started the server in Step 4
rm -rf /tmp/het-screenshots/pr-{number}
```

Print a summary:
> "✓ {count} screenshots embedded in PR #{number}: {PR URL}"

List the public URLs so the user can verify them in a browser.

---

## Notes

- **GCS bucket**: `het-pr-screenshots` — public read, 90-day auto-delete lifecycle.
- **Breakpoints**: 375px (mobile), 768px (tablet), 1280px (desktop).
- **Page screenshot script**: `frontend/scripts/take-screenshots.ts` — always run via `npx tsx /absolute/path` to avoid CJS/ESM issues.
- **Dialog screenshots**: write a fresh `_dialog-screenshots.ts` script each time; delete it after use.
- **Re-running**: always replaces the `## Screenshots` section — never appends a second copy.
- **If Playwright browsers aren't installed**: run `npx playwright install chromium` from `frontend/`.
