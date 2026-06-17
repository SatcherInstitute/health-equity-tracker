#!/bin/bash

# Review AI-insight flag records held in the flagged-insights GCS bucket.
#
# A flag record is a JSON object ({key}.json) written when a site visitor reports an
# insight. Its `status` drives behavior on the live site and in the generation prompt:
#
#   flagged    - raw user report. Does NOT hide the insight and is NOT fed to the prompt.
#                Awaits team review (this script). Counts as "unhandled".
#   suppressed - team-confirmed bad output. Hidden on the site AND fed back into the
#                generation prompt as a negative example.
#   permanent  - same as suppressed, intended as a lasting ban.
#   reenabled  - team cleared the report. Insight is shown again; cached copy is dropped
#                so it regenerates fresh.
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
               permanently ban, re-enable, skip, or quit.
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

# --- Parse args (supports long flags, unlike getopts) ---
while [[ $# -gt 0 ]]; do
    case "$1" in
        --list) MODE="list"; shift ;;
        --review) MODE="review"; shift ;;
        --ci) MODE="ci"; shift ;;
        -p) PROJECT_ID="$2"; shift 2 ;;
        -b) FLAGGED_BUCKET="$2"; shift 2 ;;
        -c) CACHE_BUCKET="$2"; shift 2 ;;
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

NOW_MS=$(( $(date +%s) * 1000 ))

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

# Clears a cached insight so a re-enabled combo regenerates fresh. The cache object name
# is built from the literal key; guard against wildcard chars that `rm` would expand and
# could match unintended objects (these effectively never appear in real report URLs).
clear_cache() {
    local key="$1"
    case "$key" in
        *'*'*|*'['*|*']'*)
            echo "  note: cached insight not auto-cleared (key contains a wildcard char); clear it manually if needed."
            return ;;
    esac
    if gcloud storage rm "gs://$CACHE_BUCKET/insights/${key}.json" \
            --project "$PROJECT_ID" >/dev/null 2>&1; then
        echo "  cleared cached insight so it regenerates fresh."
    else
        echo "  no cached insight to clear."
    fi
}

# Writes a new status onto a record and uploads it back to its literal object name.
update_status() {
    local file="$1" key="$2" new_status="$3" tmp
    tmp="$(mktemp)"
    jq --arg s "$new_status" --argjson t "$NOW_MS" \
        '.status = $s | .statusUpdatedAt = $t' "$file" > "$tmp"
    if gcloud storage cp "$tmp" "gs://$FLAGGED_BUCKET/${key}.json" \
            --project "$PROJECT_ID" >/dev/null 2>&1; then
        echo "  set status -> $new_status"
        [[ "$new_status" == "reenabled" ]] && clear_cache "$key"
    else
        echo "  FAILED to update status (no changes written)." >&2
    fi
    rm -f "$tmp"
}

# --- Mode: list ---
if [[ "$MODE" == "list" ]]; then
    declare -i n_flagged=0 n_suppressed=0 n_permanent=0 n_reenabled=0 n_other=0
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
            permanent) n_permanent+=1 ;;
            reenabled) n_reenabled+=1 ;;
            *) n_other+=1 ;;
        esac
        printf '[%-10s] %s | topic=%s reason=%s\n' "$status" "$(fmt_ts "$ts")" "${topic:-—}" "${reason:-—}"
        printf '             %s\n' "$key"
    done
    echo
    echo "Totals: flagged(unhandled)=$n_flagged  suppressed=$n_suppressed  permanent=$n_permanent  reenabled=$n_reenabled  other=$n_other"
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
        read -r -p "Action  s = suppress  b = ban permanently  r = re-enable  k = skip  q = quit: " choice </dev/tty
        case "$choice" in
            s|S) action="suppressed" ;;
            b|B) action="permanent" ;;
            r|R) action="reenabled" ;;
            k|K) echo "  skipped."; action="skip" ;;
            q|Q) echo "Quitting. Reviewed $REVIEWED report(s) this session."; exit 0 ;;
            *) echo "  Please enter s, b, r, k, or q." ;;
        esac
    done
    if [[ "$action" != "skip" ]]; then
        update_status "$f" "$key" "$action"
        REVIEWED=$(( REVIEWED + 1 ))
    fi
done

echo
echo "Done. Updated $REVIEWED report(s)."
