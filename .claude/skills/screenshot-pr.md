# /screenshot-pr

Take responsive screenshots of the current branch's frontend work and embed them into the open PR's `## Screenshots` section. Screenshots are uploaded to a public GCS bucket and linked as markdown images.

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

- **Feature slug**: take the branch name, strip a leading `feature/` prefix, replace `/` and non-alphanumeric characters with `-`, lowercase, collapse consecutive `-`.
  - Example: `feature/datacatalog-topic-tags` → `datacatalog-topic-tags`
- **Output dir**: `/tmp/het-screenshots/pr-{number}/{feature-slug}`
- **GCS upload prefix**: `pr-{number}/{feature-slug}/`
- **Public URL base**: `https://storage.googleapis.com/het-pr-screenshots/pr-{number}/{feature-slug}/`

---

## Step 3 — Determine routes

**If the user passed routes as arguments** (e.g. `/screenshot-pr /datacatalog`): use those routes. Skip inference. Still confirm briefly ("I'll screenshot `/datacatalog` — proceed?") before continuing.

**If no routes were given**: infer from changed files:

```bash
git diff --name-only $(git merge-base HEAD origin/main)
```

Apply these heuristics (first match wins per file; collect all unique routes):

| Changed path pattern | Route |
|---|---|
| `src/pages/DataCatalog/**` or `*datacatalog*` | `/datacatalog` |
| `src/pages/ExploreData/**` or `*exploredata*` | `/exploredata` |
| `src/pages/Landing/**` | `/` |
| `src/pages/AboutUs/**` | `/aboutus` |
| `src/pages/WhatIsHet/**` | `/whatishet` |
| `src/pages/Policy/**` | `/policy` |
| `src/styles/**` or design tokens (`tokens/*.json`) | `/` |
| `src/data/providers/**`, `src/data/config/**` | `/exploredata` |

If multiple routes are inferred, list them all.

If the changed files don't map clearly to any route (e.g. pure utility/infra changes), explain this to the user and ask them to specify routes manually.

**Always ask for confirmation before proceeding**, even when inference is confident. Show the inferred routes and the reasoning, then wait for the user to confirm or adjust.

---

## Step 4 — Check local dev server

```bash
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000
```

If the result is not `200`: tell the user to start the dev server first:
> "The dev server isn't running. Start it with `npm run localhost` (or `npm run start:deploy_preview`) from the `frontend/` directory, then re-run `/screenshot-pr`."

Stop here and wait. Do not proceed without a running server.

---

## Step 5 — Run the screenshot script

Build the command with one `--routes` flag per route:

```bash
cd frontend && npm run screenshots -- \
  --base-url "http://localhost:3000" \
  --output-dir "/tmp/het-screenshots/pr-{number}/{feature-slug}" \
  --routes /route1 \
  --routes /route2
```

(Add one `--routes <path>` flag for each confirmed route.)

The script saves files named `{page-slug}-{width}px.png` in the output dir:
- `/` → `home-375px.png`, `home-768px.png`, `home-1280px.png`
- `/datacatalog` → `datacatalog-375px.png`, etc.

---

## Step 6 — Upload to GCS

```bash
gsutil -m cp \
  /tmp/het-screenshots/pr-{number}/{feature-slug}/*.png \
  gs://het-pr-screenshots/pr-{number}/{feature-slug}/
```

Public read is granted at the bucket level via Terraform IAM (`allUsers:objectViewer`), so no per-object ACL flag is needed.

If this fails with an authentication error: tell the user to run `gcloud auth application-default login` and retry. Write access requires an authenticated `msm.edu` Google account.

If `het-pr-screenshots` doesn't exist yet: it is provisioned via Terraform. The user should push to `infra-test` and trigger the deploy workflow, or run `terraform apply` locally against `het-infra-test-05` using the config in `config/`.

---

## Step 7 — Build the Screenshots markdown

For each route, derive a human-readable page name:
- `/` → `Home`
- `/exploredata` → `Explore Data`
- `/datacatalog` → `Data Catalog`
- `/aboutus` → `About Us`
- General rule: split on `-` and `/`, title-case each word, join with spaces.

The public URL for each file: `https://storage.googleapis.com/het-pr-screenshots/pr-{number}/{feature-slug}/{page-slug}-{width}px.png`

Build the section as stacked breakpoints — one block per route, separated by `---`:

```markdown
## Screenshots

### {Page Name}

**Mobile — 375px**
![{Page Name} mobile screenshot]({url}/{slug}-375px.png)

**Tablet — 768px**
![{Page Name} tablet screenshot]({url}/{slug}-768px.png)

**Desktop — 1280px**
![{Page Name} desktop screenshot]({url}/{slug}-1280px.png)

---

### {Next Page Name}

**Mobile — 375px**
...
```

(Omit the trailing `---` after the last route.)

---

## Step 8 — Update the PR body

1. Get the current body:
   ```bash
   gh pr view --json body --jq '.body'
   ```

2. Locate the `## Screenshots` section in the body:
   - **Found**: replace everything from `## Screenshots` up to (but not including) the next `## ` heading, or to the end of the string if there's no next `##` heading.
   - **Not found**: append only the images (no `## Screenshots` heading) to the end of the body, separated by a blank line.

3. Write the updated body to a temp file:
   ```bash
   # (Write new body content to this path)
   /tmp/het-screenshots/pr-{number}/body.md
   ```

4. Apply the update:
   ```bash
   gh pr edit --body-file /tmp/het-screenshots/pr-{number}/body.md
   ```
   Using `--body-file` avoids shell quoting issues with long markdown content.

---

## Step 9 — Cleanup and confirm

```bash
rm -rf /tmp/het-screenshots/pr-{number}
```

Print a summary:
> "✓ {count} screenshots embedded in PR #{number}: {PR URL}"

List the public URLs of the uploaded images so the user can verify them in a browser before pushing.

---

## Notes

- **GCS bucket**: `het-pr-screenshots` — public read, 90-day auto-delete lifecycle. A GitHub Actions workflow (`cleanup-pr-screenshots.yml`) also deletes the folder when the PR closes.
- **Breakpoints**: 375px (mobile), 768px (tablet), 1280px (desktop) — matches the project's `sm`, `smplus`, and `lg` design tokens.
- **Script location**: `frontend/scripts/take-screenshots.ts` — run via `npm run screenshots` from `frontend/`.
- **If Playwright browsers aren't installed**: run `npx playwright install chromium` from `frontend/`.
