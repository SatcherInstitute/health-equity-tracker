---
name: screenshot-pr
description: Take responsive screenshots of the current branch's frontend work and embed them into the open PR's Screenshots section. Use when the user wants to capture UI screenshots for a pull request, add screenshots to a PR, or run /screenshot-pr.
---

# /screenshot-pr

Take responsive screenshots that demonstrate what the PR changed — **activated feature shots only, never baseline page views**. Screenshots are cropped to the feature element (dialog, popover, drawer, etc.) so reviewers see the change without scrolling through a full-page render. Uploads to a public GCS bucket and embeds into the PR's `## Screenshots` section. Re-running always **replaces** the existing Screenshots section with fresh images.

The user may pass explicit routes/selectors as arguments. If none are given, infer from changed files and confirm before proceeding.

---

## Step 0 — Commit any uncommitted changes first

Before screenshotting, ensure all local code changes are committed and pushed. Screenshots taken from a dirty working tree will not match the code in the PR.

```bash
cd /path/to/frontend   # absolute path
npm run cleanup
```

If cleanup modifies files, stage and commit:

```bash
git -C /path/to/repo add -u
git -C /path/to/repo status --porcelain
```

If any tracked files are modified (lines starting with ` M` or `M `):

```bash
git -C /path/to/repo add frontend/src frontend/CLAUDE.md .claude/skills
git -C /path/to/repo commit -m "$(cat <<'COMMITMSG'
<short description of changes being screenshotted>

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
COMMITMSG
)"
FORK_REMOTE=$(git -C /path/to/repo remote -v | grep -i "github.com[/:]${GH_USER}/" | head -1 | awk '{print $1}')
git -C /path/to/repo push $FORK_REMOTE HEAD
```

Only continue to Step 1 once the working tree is clean and all changes are pushed.

---

## Step 1 — Get PR context

```bash
gh pr view --json number,title,body,headRefName
```

If no open PR is found: print an error and stop.

Extract: `number`, `headRefName`, `body`.

---

## Step 2 — Derive slugs

- **Feature slug**: strip `feat/`, `fix/`, `feature/`, `chore/` prefix from branch name; replace `/` and non-alphanumeric chars with `-`; lowercase; collapse consecutive `-`.
  - Example: `feat/recent-geo-locations` → `recent-geo-locations`
- **Output dir**: `/tmp/het-screenshots/pr-{number}/{feature-slug}`
- **GCS upload prefix**: `pr-{number}/{feature-slug}/`
- **Public URL base**: `https://storage.googleapis.com/het-pr-screenshots/pr-{number}/{feature-slug}/`

---

## Step 3 — Determine what to capture

**The goal is screenshots that show the activated feature, cropped tightly to the changed UI.** A page in its default/empty state is never useful.

**If the user passed explicit routes or selectors**: use those. Skip inference.

**If no routes given**: read the diff and work out the minimum interaction needed to see the change.

```bash
git diff --name-only $(git merge-base HEAD origin/main)
git diff $(git merge-base HEAD origin/main) -- frontend/src/
```

For each changed file, ask:
1. What URL loads the page containing this component?
2. What interaction (click, URL param, seeded localStorage) activates it?
3. What CSS selector uniquely identifies the feature element to crop to?

Scan Playwright tests for ready-made URLs:
```bash
grep -rn "goto(" frontend/playwright-tests/ --include="*.ts" | head -20
```

Scan for `useParamState` calls to find URL params that open modals/drawers:
```bash
grep -rn "useParamState" frontend/src/ --include="*.tsx" --include="*.ts"
```

**Always confirm the plan with the user** — list each capture, the activation steps, and the crop selector — before taking any screenshots.

---

## Step 4 — Ensure dev server is running

```bash
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000
```

If not `200`:

```bash
lsof -ti :3000 | xargs kill -9 2>/dev/null; sleep 1
cd /path/to/frontend
npm run dev > /tmp/het-dev-server.log 2>&1 &
DEV_PID=$!
TIMEOUT=60
until curl -s http://localhost:3000 > /dev/null 2>&1; do
  sleep 1; TIMEOUT=$((TIMEOUT - 1))
  [ $TIMEOUT -le 0 ] && echo "Dev server failed to start" && kill $DEV_PID 2>/dev/null && exit 1
done
echo "Server ready"
```

Track `$DEV_PID` for cleanup in Step 9.

---

## Step 5 — Feature screenshots (element-cropped)

Write a temporary Playwright script at `frontend/scripts/_screenshots.ts`. For each capture:

1. Navigate to the URL with `{ waitUntil: 'networkidle' }`
2. Disable animations via an injected style tag
3. Perform the activation (click button, seed localStorage, set URL param, etc.)
4. Wait for the feature element to appear
5. **Crop to the feature element** using `locator.screenshot()` — this captures only the element's bounding box, not the full page

**Cropping approach — always use `boundingBox` + `clip` with padding:**

Show the feature element with enough surrounding context that the reviewer can see its boundary, shadow, and relationship to its parent/neighbors. Never crop flush to the element edge.

```ts
const PADDING = 80  // pixels of surrounding context on each side
const el = page.locator(CROP_SELECTOR).first()
await el.waitFor({ timeout: 10000 })
const box = await el.boundingBox()
if (box) {
  const clipX = Math.max(0, box.x - PADDING)
  const clipY = Math.max(0, box.y - PADDING)
  const clipRight = Math.min(vp.width, box.x + box.width + PADDING)
  const clipBottom = Math.min(vp.height, box.y + box.height + PADDING)
  await page.screenshot({
    path: join(OUT, filename),
    clip: { x: clipX, y: clipY, width: clipRight - clipX, height: clipBottom - clipY },
  })
}
```

Adjust `PADDING` per feature — 80px is the default. Use 120px+ for modals where you want the dimmed backdrop edge visible.

**Common crop selectors:**
- MUI Popover/Menu paper: `'.MuiPopover-paper'`
- MUI Dialog: `'[role="dialog"]'`
- MUI Drawer: `'.MuiDrawer-paper'`
- Custom panels/cards: use the outermost container class or `data-testid`

**Viewport heights:** `844` mobile, `1024` tablet, `900` desktop.

**Key considerations:**
- Use `{ waitUntil: 'networkidle' }` — the dev server fetches live data from GCP.
- Disable animations before activating the feature: `page.addStyleTag({ content: '*, *::before, *::after { animation: none !important; transition: none !important; }' })`
- Create a fresh browser context per viewport so state doesn't bleed.
- If a feature only renders below a breakpoint, add a `maxWidth` guard and log a skip message.
- If the feature element never appears, log a warning and continue — do not crash.

**Example script structure:**

```ts
import { chromium } from '@playwright/test'
import { mkdirSync } from 'node:fs'
import { join } from 'node:path'

const BASE = 'http://localhost:3000'
const OUT = '/tmp/het-screenshots/pr-{number}/{feature-slug}'
const CROP_SELECTOR = '.MuiPopover-paper'  // adjust per feature

const VIEWPORTS = [
  { width: 375,  height: 844,  label: 'mobile'  },
  { width: 768,  height: 1024, label: 'tablet'  },
  { width: 1280, height: 900,  label: 'desktop' },
]

mkdirSync(OUT, { recursive: true })
const browser = await chromium.launch()

for (const vp of VIEWPORTS) {
  const ctx  = await browser.newContext({ viewport: { width: vp.width, height: vp.height } })
  const page = await ctx.newPage()

  // Seed any required state before navigation
  await page.goto(BASE, { waitUntil: 'domcontentloaded' })
  await page.evaluate(() => {
    localStorage.setItem('my-key', JSON.stringify({ /* seed data */ }))
  })

  await page.goto(`${BASE}/exploredata?mls=1.hiv-3.06&mlp=disparity`, { waitUntil: 'networkidle' })
  await page.addStyleTag({ content: '*, *::before, *::after { animation: none !important; transition: none !important; }' })

  // Activate the feature
  await page.getByRole('button', { name: /location name/i }).first().click()
  await page.waitForTimeout(400)

  // Crop to feature element with surrounding context
  const PADDING = 80
  const el = page.locator(CROP_SELECTOR).first()
  try {
    await el.waitFor({ timeout: 10000 })
    const box = await el.boundingBox()
    if (!box) throw new Error('no bounding box')
    const clipX = Math.max(0, box.x - PADDING)
    const clipY = Math.max(0, box.y - PADDING)
    const clipRight = Math.min(vp.width, box.x + box.width + PADDING)
    const clipBottom = Math.min(vp.height, box.y + box.height + PADDING)
    const filename = `feature-name-${vp.label}.png`
    await page.screenshot({
      path: join(OUT, filename),
      clip: { x: clipX, y: clipY, width: clipRight - clipX, height: clipBottom - clipY },
    })
    console.info(`  [${vp.label}] ${filename}`)
  } catch {
    console.warn(`  [warn] feature element not found @ ${vp.width}px`)
  }

  await ctx.close()
}

await browser.close()
console.info('Done.')
```

Run it:

```bash
npx tsx /absolute/path/to/frontend/scripts/_screenshots.ts
```

After all screenshots are captured, delete the temp script:

```bash
rm /absolute/path/to/frontend/scripts/_screenshots.ts
```

---

## Step 6 — Upload to GCS

```bash
gsutil -m -h "Cache-Control:no-cache, no-store" cp \
  /tmp/het-screenshots/pr-{number}/{feature-slug}/*.png \
  gs://het-pr-screenshots/pr-{number}/{feature-slug}/

gsutil ls gs://het-pr-screenshots/pr-{number}/{feature-slug}/*.png | wc -l
```

If the count is less than expected, re-upload missing files individually.

If this fails with an auth error: tell the user to run `gcloud auth application-default login` and retry.

---

## Step 7 — Build the Screenshots markdown

Group screenshots by feature/section. Append `?v={unix-timestamp}` to every URL (same `TS=$(date +%s)` across the whole run) to bust GitHub's image proxy cache.

```markdown
### {Feature Name}

**Mobile (375px)**
![{Feature Name} mobile]({url}/{filename}-mobile.png?v={timestamp})

**Tablet (768px)**
![{Feature Name} tablet]({url}/{filename}-tablet.png?v={timestamp})

**Desktop (1280px)**
![{Feature Name} desktop]({url}/{filename}-desktop.png?v={timestamp})
```

Separate feature groups with `---`. Omit the trailing `---` after the last block.

---

## Step 8 — Update the PR body (always replaces)

1. Fetch the current body if not already held.
2. Strip everything from `## Screenshots` to end-of-string (it's always last).
3. Append the new Screenshots section.
4. Write to `/tmp/het-screenshots/pr-{number}/body.md` and apply:

```bash
gh pr edit {number} --body-file /tmp/het-screenshots/pr-{number}/body.md
```

---

## Step 9 — Cleanup and confirm

```bash
[ -n "$DEV_PID" ] && kill $DEV_PID 2>/dev/null
rm -rf /tmp/het-screenshots/pr-{number}
```

Print:
> "✓ {count} screenshots embedded in PR #{number}: {PR URL}"

---

## Notes

- **GCS bucket**: `het-pr-screenshots` — public read, 90-day auto-delete lifecycle.
- **Breakpoints**: 375px mobile, 768px tablet, 1280px desktop.
- **Crop first**: always use `locator.screenshot()` or `clip` — never `fullPage: true`.
- **No baseline shots**: only capture the activated/changed UI state.
- **Re-running**: always replaces the `## Screenshots` section — never appends a second copy.
- **If Playwright browsers aren't installed**: run `npx playwright install chromium` from `frontend/`.
