---
name: request
model: sonnet
description: Flag the open PR as ready for human review — request GitHub review from the two teammates who did not open it, then post a "ready for review" message to the het-core Slack channel with the PR title and link, tagging @channel. Use when the user wants to hand a finished PR off for review, or runs /request.
---

# /request

Hand the open PR off for human review in two places at once:

1. **GitHub** — request a review from the two teammates who are *not* the PR author.
2. **Slack** — post a "ready for review" message to `het-core`, tagging `@channel`, with the PR title and link.

The user may pass a PR number as an argument (e.g. `/request 5306`). If none is given, detect the open PR from the current branch.

---

## Team roster

Three people review each other's work. GitHub handles are public (they appear on every commit and PR already), so they live here. **No Slack user IDs or emails are stored in this skill** — the Slack post tags `@channel`, so no individual Slack identity is ever needed. If you ever need to tag a person in Slack, resolve them at runtime with `slack_search_users`; never hardcode a Slack ID or email into this file.

| Person | GitHub handle |
|---|---|
| Ben | `benhammondmusic` |
| Kim | `kccrtv` |
| Eric | `eriwarr` |

The reviewers are always "the roster minus the PR author" — see Step 2.

---

## Step 1 — Identify the PR

Gather everything in one call:

```bash
gh pr view <number> --json number,title,url,author,isDraft,state,headRefName
```

Omit `<number>` to detect the PR from the current branch. If no open PR is found: print an error and stop.

If `state` is not `"OPEN"` (e.g. the PR is closed or merged): print an error and stop — do not request review or ping Slack for a PR that is no longer active.

If `isDraft` is `true`: stop and tell the user the PR is still a draft — mark it ready first (`gh pr ready <number>`) or re-run once it is. A draft is not ready for review and `@channel` should not be pinged for one.

---

## Step 2 — Compute the two reviewers

The author is in the `author.login` field from Step 1. The reviewers are the other two roster handles.

```bash
AUTHOR=$(gh pr view <number> --json author -q .author.login)
# Roster minus the author:
REVIEWERS=$(printf '%s\n' benhammondmusic kccrtv eriwarr | grep -v "^${AUTHOR}$" | paste -sd, -)
echo "Author: $AUTHOR  →  Reviewers: $REVIEWERS"
```

Edge cases:
- **Author is not in the roster** (an external contributor's PR): request review from all three roster members instead. `grep -v` naturally leaves all three when the author matches none.
- GitHub silently ignores a request to add the author as their own reviewer, so the `grep -v` is belt-and-suspenders, not strictly required — but it keeps the Slack message honest about who was asked.

---

## Step 3 — Request the GitHub reviews

```bash
gh pr edit <number> --add-reviewer "$REVIEWERS"
```

`--add-reviewer` is additive and will not error on a duplicate request. However, if a reviewer has already submitted their review, re-running will re-request them and trigger another notification. Only run this skill once per PR unless the team expects a re-request.

---

## Step 4 — Post to Slack

Post to the `het-core` channel (ID `C02A2RWN53L`) with `mcp__claude_ai_Slack__slack_send_message`:

- `channel_id`: `C02A2RWN53L`
- `unfurl_app_links`: `true` (so the PR link expands into a rich preview)
- `message`: start with `<!channel>` (Slack syntax for `@channel`), then a short "ready for review" line that **includes the PR title and URL** so no one has to switch apps to know what it is.

Template:

```
<!channel> PR ready for review: *<PR title>*
<PR URL>
Requested review from <reviewer first names> on GitHub.
```

List **every** reviewer Step 2 actually produced, not a fixed two — a roster author yields two names, but an external-contributor PR yields all three. Join them naturally: `Kim and Eric` for two, `Ben, Kim, and Eric` for three. Map the handles back to first names (`benhammondmusic`→Ben, `kccrtv`→Kim, `eriwarr`→Eric). The names are not sensitive; this just saves readers a lookup.

Keep the message to those few lines — `@channel` pings everyone, so it must be scannable in one glance.

---

## Step 5 — Confirm

Print a single line:

> "✓ Review requested from <names> on PR #<number>; posted to het-core."

---

## Notes

- **No sensitive data in this file.** GitHub handles are public; Slack is addressed by `@channel` and a public channel ID, never by individual user ID or email. Keep it that way — resolve any future per-person Slack mention at runtime.
- **Re-running:** Step 3 re-requests any reviewer who has already submitted a review, triggering another GitHub notification. Step 4 posts a second `@channel` Slack message. Only re-run if you genuinely want both of those to happen.
- **Draft guard.** Step 1 refuses to ping `@channel` for a draft PR.
- This skill does not open, merge, or modify the PR's code — it only requests review and announces it. Use `/pr` to polish a PR and `/merge` to land it.
