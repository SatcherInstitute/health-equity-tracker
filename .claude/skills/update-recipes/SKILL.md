---
name: update-recipes
model: sonnet
description: Refresh the ReadMe contributor recipes (code tabs, line highlights, and prose) after frontend changes land on main. Runs scripts/readme_recipes/sync_recipes.py, then scans recipe prose against the merged diff. Called by /merge after frontend PRs; also usable standalone via /update-recipes [PR number].
---

# /update-recipes

The recipes on healthequitytracker.readme.io quote real source files and go stale silently. This skill keeps their code tabs and highlights in sync mechanically and flags prose that needs a human decision.

The optional argument is a merged PR number (e.g. `/update-recipes 5250`). With no argument, use the latest commit on local main.

---

## Step 1: Decide whether to run

Get the changed paths:

```bash
gh pr view <number> --json files --jq '.files[].path'   # with a PR number
git show --name-only --format= HEAD                      # without
```

Skip the skill with a one-line note unless a path starts with `frontend/src/` or `frontend/.env`.

**Never pre-check `README_API_KEY` yourself.** The script resolves the key from the environment or from `.env.secrets` at the repo root, and reports a missing key as exit 5 in Step 2. Testing the variable in your own shell gives a false negative: the key may live in a file the shell never read, and a bash shell does not source `~/.zshenv` at all. That exact mistake skipped this skill on PR #5311 and left the recipes drifted. Run the script and read its exit code.

Local main must be at the merge commit so the script reads the merged code. `/merge` guarantees this in its Step 4; standalone, verify all three conditions and stop if any fails, since a wrong-branch or dirty checkout would publish recipes from unmerged code:

```bash
git fetch origin main
BRANCH=$(git rev-parse --abbrev-ref HEAD)                # must equal "main"
STATUS=$(git status --porcelain)                         # must be empty
LOCAL_SHA=$(git rev-parse HEAD)
MERGE_SHA=$(gh pr view <number> --json mergeCommit --jq '.mergeCommit.oid')
[ "$BRANCH" = "main" ] && [ -z "$STATUS" ] && [ "$LOCAL_SHA" = "$MERGE_SHA" ] \
  || { echo "Refusing to sync: not on clean main at merge commit ($BRANCH, dirty=$([ -n "$STATUS" ] && echo yes || echo no), local=$LOCAL_SHA vs merge=$MERGE_SHA)"; exit 1; }
```

---

## Step 2: Sync tabs and highlights

```bash
python3 scripts/readme_recipes/sync_recipes.py check
```

- **Exit 0:** recipes are current.
- **Exit 1 (drift):** only code tabs or line highlights changed, which is mechanical. Run `python3 scripts/readme_recipes/sync_recipes.py push` and report which recipes moved.
- **Exit 2 (anchor error or unexpected recipe shape):** a symbol or file the recipes point at was renamed or removed, or a live recipe no longer matches `recipes.json`. Do not push. Tell the user which recipe broke and offer a follow-up PR that updates `scripts/readme_recipes/recipes.json`.
- **Exit 3 (API error):** readme.io returned an error or timed out, so the check did not complete. Transient. Do not push; report the error and move on.
- **Exit 4 (bad command line):** you mistyped the invocation; fix it and rerun.
- **Exit 5 (no API key configured):** a one-time setup task, not a transient failure. Do not push. Relay the script's own setup instructions to the user verbatim, since they name the file path and say to ask a team member for the value. Never print the key.

Pass a slug as a second argument (`check <slug>`) to limit the run to one recipe.

---

## Step 3: Scan recipe prose

The script never touches step titles or bodies. Map the changed paths (relative to `frontend/src/`) to recipes:

| Changed path | Recipe slug |
|---|---|
| `data/loading/DataSourceConfigs.ts`, `data/loading/VariableProviderMap.ts` | `setting-up-a-new-data-provider` |
| `data/providers/*.test.ts` | `creating-test-cases-for-the-new-data-provider` |
| `data/config/MetricConfig*.ts`, `charts/mapGlobals.ts` | `setting-up-the-metric-configuration` |
| `data/config/DatasetMetadata*.ts`, `data/config/MetadataMap.ts` | `updating-metadata-configuration-for-new-dataset-integration` |
| `utils/MadLibs.ts` | `updating-the-madlibs-configuration-for-new-dataset-integration` |
| `featureFlags.ts`, `frontend/.env.*` | `merging-behind-a-feature-flag` |

This step calls the API directly rather than through the script, so it needs the key in its own shell. Step 2 may have resolved it from `.env.secrets`, where a shell will not have it; load it first and never echo the value:

```bash
[ -n "$README_API_KEY" ] || { set -a; . .env.secrets; set +a; }
```

For each mapped recipe, fetch it (`GET https://api.readme.com/v2/branches/1.0/recipes/<slug>` with `Authorization: Bearer $README_API_KEY` and a `User-Agent` header, since the default Python one gets a 403) and check whether any step title or body names a file, symbol, path or behavior the change removed or altered. If so, show the user the proposed wording and ask before PATCHing. The whole `content` object must be sent back, so change only the step `title`/`body` fields you mean to.

---

## Step 4: Report

One line: `Recipes: <current/pushed (which)/skipped/needs recipes.json update/prose flagged>`.

**A skip must name its reason**, so that "nothing to do" is never mistaken for "something broke and I moved on". Say `skipped (no frontend/src changes)` or `skipped (no API key configured)`, not a bare `skipped`.

---

## Notes

- `scripts/readme_recipes/recipes.json` declares which source files each recipe quotes and which text anchors drive the highlights. Adding a recipe means adding an entry there.
- The recipes are external to the repo and nothing fails when they go stale, so this skill is the only safety net.
