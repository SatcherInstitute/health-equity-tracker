#!/bin/bash

# Review AI-insight flag records held in the flagged-insights GCS bucket.
#
# A flag record is a JSON object ({key}.json) written when a site visitor reports an
# insight. Its `status` drives behavior on the live site and in the generation prompt.
#
# Source of truth for these status values is data_server/main.py (FLAG_STATUS_* constants).
# bash can't import them, so the strings are duplicated below — keep the two in sync if the
# vocabulary ever changes.
#
#   flagged    - raw user report. Does NOT hide the insight and is NOT fed to the prompt.
#                Awaits team review (this script). Counts as "unhandled".
#   suppressed - team-confirmed bad output. The combo stays live, but its stored content is
#                fed back into the generation prompt as a negative example and the cached
#                insight is dropped, so it regenerates steered away from the bad output.
#
# A false-alarm report is deleted outright (this script's `d` action) rather than given a
# status — nothing is ever hidden, so there is nothing to "re-enable".
#
# Access is gated by GCP IAM on the buckets — only team members with credentials can run
# this. Auth uses your ambient `gcloud auth` (or a CI service account via ADC).
#
# Usage:
#   ./review_flagged_insights.sh            # list all flag records grouped by status
#   ./review_flagged_insights.sh --review   # interactively triage each unhandled report
#   ./review_flagged_insights.sh --ci       # exit non-zero if any unhandled reports exist
#
# Optional: -p PROJECT_ID  -b FLAGGED_BUCKET  -c CACHE_BUCKET  -h

set -e -u -o pipefail

DEFAULT_PROJECT_ID="het-infra-test-05"
DEFAULT_FLAGGED_BUCKET="het-flagged-insights"
DEFAULT_CACHE_BUCKET="het-insights-cache"

PROJECT_ID="$DEFAULT_PROJECT_ID"
FLAGGED_BUCKET="$DEFAULT_FLAGGED_BUCKET"
CACHE_BUCKET="$DEFAULT_CACHE_BUCKET"
MODE="list" # list | review | ci

show_help() {
    cat <<EOF
Usage: $0 [--review | --ci] [-p PROJECT_ID] [-b FLAGGED_BUCKET] [-c CACHE_BUCKET]

Review AI-insight flag records in the flagged-insights GCS bucket.

Modes:
  (default)    List every flag record grouped by status.
  --review     Interactively triage each unhandled ("flagged") report: suppress,
               delete (false alarm), skip, or quit.
  --ci         Non-interactive check used by CI. Prints any unhandled reports and
               exits 1 if there are any, else exits 0.

Options:
  -p PROJECT_ID      GCP project (default: $DEFAULT_PROJECT_ID)
  -b FLAGGED_BUCKET  Flagged-insights bucket (default: $DEFAULT_FLAGGED_BUCKET)
  -c CACHE_BUCKET    Insights-cache bucket (default: $DEFAULT_CACHE_BUCKET)
  -h, --help         Show this help and exit
EOF
    exit "${1:-0}"
}

# Guards a value-taking flag: errors out if no value follows. Without this, under `set -u`
# a trailing `-p`/`-b`/`-c` would dereference an unbound $2, and `shift 2` would trip `set -e`.
# $1 = flag name, $2 = remaining arg count ($#).
require_value() {
    if [[ "$2" -lt 2 ]]; then
        echo "Error: $1 requires a value." >&2
        show_help 1
    fi
}

# --- Parse args (supports long flags, unlike getopts) ---
while [[ $# -gt 0 ]]; do
    case "$1" in
        --list) MODE="list"; shift ;;
        --review) MODE="review"; shift ;;
        --ci) MODE="ci"; shift ;;
        -p) require_value "$1" "$#"; PROJECT_ID="$2"; shift 2 ;;
        -b) require_value "$1" "$#"; FLAGGED_BUCKET="$2"; shift 2 ;;
        -c) require_value "$1" "$#"; CACHE_BUCKET="$2"; shift 2 ;;
        -h|--help) show_help 0 ;;
        *) echo "Unknown argument: $1" >&2; show_help 1 ;;
    esac
done

# --- Preconditions ---
for cmd in gcloud jq; do
    if ! command -v "$cmd" >/dev/null 2>&1; then
        echo "Error: '$cmd' is required but not installed." >&2
        exit 2
    fi
done

WORKDIR="$(mktemp -d)"
trap 'rm -rf "$WORKDIR"' EXIT

fmt_ts() {
    # Render an epoch-ms timestamp as UTC. Tries BSD (-r) then GNU (-d) date.
    local ms="$1" s
    [[ -z "$ms" || "$ms" == "null" ]] && { echo "unknown"; return; }
    s=$(( ms / 1000 ))
    date -u -r "$s" "+%Y-%m-%d %H:%M UTC" 2>/dev/null \
        || date -u -d "@$s" "+%Y-%m-%d %H:%M UTC" 2>/dev/null \
        || echo "$ms"
}

# Mirror the whole bucket locally. rsync takes literal object paths (no wildcard
# expansion), so keys containing ? # / & = are downloaded safely.
echo "Fetching flag records from gs://$FLAGGED_BUCKET ..." >&2
if ! gcloud storage rsync --recursive "gs://$FLAGGED_BUCKET" "$WORKDIR" \
        --project "$PROJECT_ID" >/dev/null 2>&1; then
    echo "Error: could not read gs://$FLAGGED_BUCKET (check the bucket name and your GCP access)." >&2
    exit 2
fi

# Collect record files (null-delimited; portable to bash 3.2 on macOS).
FILES=()
while IFS= read -r -d '' f; do
    FILES+=("$f")
done < <(find "$WORKDIR" -type f -name '*.json' -print0)

if [[ ${#FILES[@]} -eq 0 ]]; then
    echo "No flag records found."
    exit 0
fi

# Clears a cached insight so a suppressed combo regenerates fresh (this time with the
# suppressed content fed in as a negative example). The cache object name is built from the
# literal key; guard against wildcard chars that `rm` would expand and could match
# unintended objects (these effectively never appear in real report URLs).
clear_cache() {
    local key="$1" err err_lc
    case "$key" in
        *'*'*|*'['*|*']'*)
            echo "  note: cached insight not auto-cleared (key contains a wildcard char); clear it manually if needed."
            return ;;
    esac
    if err=$(gcloud storage rm "gs://$CACHE_BUCKET/insights/${key}.json" \
            --project "$PROJECT_ID" 2>&1); then
        echo "  cleared cached insight so it regenerates fresh."
        return
    fi
    # A missing object is the normal case (nothing was cached). Anything else — auth,
    # network, permissions — is a real failure the reviewer needs to see, since the stale
    # insight will keep being served until the cache is cleared. Lowercase the message
    # first (portably, via tr) so the match is case-insensitive without glob char classes.
    err_lc=$(printf '%s' "$err" | tr '[:upper:]' '[:lower:]')
    case "$err_lc" in
        *"not found"*|*404*|*"does not match any"*|*"no urls matched"*)
            echo "  no cached insight to clear." ;;
        *)
            echo "  WARNING: could not clear cached insight — it may keep serving the stale text:" >&2
            echo "    $err" >&2 ;;
    esac
}

# Writes a new status onto a record and uploads it back to its literal object name.
# Returns 0 on a successful upload, non-zero otherwise so the caller only counts records
# it actually changed.
update_status() {
    local file="$1" key="$2" new_status="$3" tmp now_ms rc=0
    # Stamp the write time at the moment of the write, not at script startup — a long
    # interactive review session would otherwise back-date every record to launch time.
    now_ms=$(( $(date +%s) * 1000 ))
    # Stage inside WORKDIR so the EXIT trap cleans it up even if an early `set -e` exit
    # skips the rm below. FILES was already collected before the review loop, so this
    # never affects iteration.
    tmp="${WORKDIR}/tmp_status.json"
    jq --arg s "$new_status" --argjson t "$now_ms" \
        '.status = $s | .statusUpdatedAt = $t' "$file" > "$tmp"
    if gcloud storage cp "$tmp" "gs://$FLAGGED_BUCKET/${key}.json" \
            --project "$PROJECT_ID" >/dev/null 2>&1; then
        echo "  set status -> $new_status"
        [[ "$new_status" == "suppressed" ]] && clear_cache "$key"
    else
        echo "  FAILED to update status (no changes written)." >&2
        rc=1
    fi
    rm -f "$tmp"
    return "$rc"
}

# Deletes a flag record outright — used when a report turns out to be a false alarm. The
# combo's currently cached insight (regenerated when the report was first filed) is left in
# place: nothing was hidden, and with the record gone there is no negative example to keep.
# Returns 0 on a successful delete, non-zero otherwise so the caller only counts real deletes.
delete_record() {
    local key="$1"
    if gcloud storage rm "gs://$FLAGGED_BUCKET/${key}.json" \
            --project "$PROJECT_ID" >/dev/null 2>&1; then
        echo "  deleted report (false alarm)."
        return 0
    fi
    echo "  FAILED to delete report (no changes made)." >&2
    return 1
}

# --- Mode: list ---
if [[ "$MODE" == "list" ]]; then
    # `other` catches any legacy status (e.g. a pre-existing `permanent`/`reenabled` record
    # left over from the old vocabulary) so it stays visible rather than silently vanishing.
    declare -i n_flagged=0 n_suppressed=0 n_other=0
    echo
    for f in "${FILES[@]}"; do
        status=$(jq -r '.status // "unknown"' "$f")
        key=$(jq -r '.key // ""' "$f")
        topic=$(jq -r '.topic // ""' "$f")
        reason=$(jq -r '.reason // ""' "$f")
        ts=$(jq -r '.timestamp // ""' "$f")
        case "$status" in
            flagged) n_flagged+=1 ;;
            suppressed) n_suppressed+=1 ;;
            *) n_other+=1 ;;
        esac
        printf '[%-10s] %s | topic=%s reason=%s\n' "$status" "$(fmt_ts "$ts")" "${topic:-—}" "${reason:-—}"
        printf '             %s\n' "$key"
    done
    echo
    echo "Totals: flagged(unhandled)=$n_flagged  suppressed=$n_suppressed  other=$n_other"
    exit 0
fi

# --- Mode: ci ---
if [[ "$MODE" == "ci" ]]; then
    unhandled=0
    for f in "${FILES[@]}"; do
        status=$(jq -r '.status // ""' "$f")
        if [[ "$status" == "flagged" ]]; then
            unhandled=$(( unhandled + 1 ))
            key=$(jq -r '.key // ""' "$f")
            reason=$(jq -r '.reason // ""' "$f")
            echo "UNHANDLED: reason=$reason key=$key"
        fi
    done
    if [[ "$unhandled" -gt 0 ]]; then
        echo
        echo "$unhandled unhandled flagged insight(s) awaiting team review."
        echo "Run: scripts/review_flagged_insights.sh --review"
        exit 1
    fi
    echo "No unhandled flagged insights. All clear."
    exit 0
fi

# --- Mode: review ---
REVIEWED=0
for f in "${FILES[@]}"; do
    status=$(jq -r '.status // ""' "$f")
    [[ "$status" == "flagged" ]] || continue
    key=$(jq -r '.key // ""' "$f")
    topic=$(jq -r '.topic // ""' "$f")
    reason=$(jq -r '.reason // ""' "$f")
    note=$(jq -r '.note // ""' "$f")
    ts=$(jq -r '.timestamp // ""' "$f")
    content=$(jq -r '.content // ""' "$f")

    echo
    echo "------------------------------------------------------------"
    echo "Reported: $(fmt_ts "$ts")"
    echo "Topic:    ${topic:-—}"
    echo "Reason:   ${reason:-—}"
    [[ -n "$note" ]] && echo "Note:     $note"
    echo "Key:      $key"
    echo "Insight:"
    echo "  ${content:-(no cached content was captured)}"
    echo

    action=""
    while [[ -z "$action" ]]; do
        read -r -p "Action  s = suppress  d = delete (false alarm)  k = skip  q = quit: " choice </dev/tty
        case "$choice" in
            s|S) action="suppress" ;;
            d|D) action="delete" ;;
            k|K) echo "  skipped."; action="skip" ;;
            q|Q) echo "Quitting. Reviewed $REVIEWED report(s) this session."; exit 0 ;;
            *) echo "  Please enter s, d, k, or q." ;;
        esac
    done
    # Only count records whose write actually succeeded; a failed write/delete leaves the
    # record untouched and must not inflate the session tally.
    case "$action" in
        suppress)
            if update_status "$f" "$key" "suppressed"; then
                REVIEWED=$(( REVIEWED + 1 ))
            fi ;;
        delete)
            if delete_record "$key"; then
                REVIEWED=$(( REVIEWED + 1 ))
            fi ;;
    esac
done

echo
echo "Done. Updated $REVIEWED report(s)."
