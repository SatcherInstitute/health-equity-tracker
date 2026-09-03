#!/bin/bash

# Review AI-insight flag records held in the flagged-insights GCS bucket.
# Also manages the generation and serving kill switches, and seeds the
# production insight cache from dev.
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
#   ./review_flagged_insights.sh                  # list all flag records grouped by status
#   ./review_flagged_insights.sh --review         # interactively triage each unhandled report
#   ./review_flagged_insights.sh --ci             # exit non-zero if any unhandled reports exist
#   ./review_flagged_insights.sh --switch-status  # report generation and serving switch state
#   ./review_flagged_insights.sh --disable-serving   # set insights-serving-disabled (emergency stop)
#   ./review_flagged_insights.sh --enable-serving    # clear insights-serving-disabled
#   ./review_flagged_insights.sh --disable-generation # set insights-generation-disabled
#   ./review_flagged_insights.sh --enable-generation  # clear insights-generation-disabled
#   ./review_flagged_insights.sh --sync-cache         # dry-run: show what would be copied dev->prod
#   ./review_flagged_insights.sh --sync-cache --execute  # actually copy dev insights cache to prod
#
# Optional: -p PROJECT_ID  -b FLAGGED_BUCKET  -c CACHE_BUCKET  -h

set -e -u -o pipefail

DEFAULT_PROJECT_ID="het-infra-test-05"
DEFAULT_FLAGGED_BUCKET="het-flagged-insights"
DEFAULT_CACHE_BUCKET="het-insights-cache"

DEFAULT_DEST_PROJECT_ID="het-infra-prod-f6"
DEFAULT_DEST_FLAGGED_BUCKET="het-prod-flagged-insights"
DEFAULT_DEST_CACHE_BUCKET="het-prod-insights-cache"

CLOUD_RUN_REGION="us-central1"
CLOUD_RUN_SERVICE="frontend-service"

PROJECT_ID="$DEFAULT_PROJECT_ID"
FLAGGED_BUCKET="$DEFAULT_FLAGGED_BUCKET"
CACHE_BUCKET="$DEFAULT_CACHE_BUCKET"

DEST_PROJECT_ID="$DEFAULT_DEST_PROJECT_ID"
DEST_FLAGGED_BUCKET="$DEFAULT_DEST_FLAGGED_BUCKET"
DEST_CACHE_BUCKET="$DEFAULT_DEST_CACHE_BUCKET"

MODE="list" # list | review | ci | switch-status | disable-serving | enable-serving | disable-generation | enable-generation | sync-cache
DRY_RUN=true

GENERATION_SWITCH="insights-generation-disabled"
SERVING_SWITCH="insights-serving-disabled"

show_help() {
    cat <<EOF
Usage: $0 [MODE] [OPTIONS]

Review AI-insight flag records, manage kill switches, and seed the prod cache.

Modes:
  (default)           List every flag record grouped by status.
  --review            Interactively triage each unhandled ("flagged") report: suppress,
                      delete (false alarm), skip, or quit.
  --ci                Non-interactive check used by CI. Prints any unhandled reports and
                      exits 1 if there are any, else exits 0.
  --switch-status     Report the current state of both kill switches (generation and serving).
  --disable-serving   Set insights-serving-disabled: stops all insights from being served,
                      including cached ones. Use in a content emergency.
  --enable-serving    Clear insights-serving-disabled: resume serving insights.
  --disable-generation Set insights-generation-disabled: stops new generation; cached
                      insights keep serving.
  --enable-generation Clear insights-generation-disabled: resume generation.
  --sync-cache        Copy insights/ from dev cache to prod, excluding flagged keys from
                      both environments. Dry-run by default; add --execute to actually copy.
                      Verifies GEMINI_MODEL matches across environments before copying.

Options:
  -p PROJECT_ID        Source/current GCP project (default: $DEFAULT_PROJECT_ID)
  -b FLAGGED_BUCKET    Source flagged-insights bucket (default: $DEFAULT_FLAGGED_BUCKET)
  -c CACHE_BUCKET      Source insights-cache bucket (default: $DEFAULT_CACHE_BUCKET)
  --dest-project DEST_PROJECT_ID  Destination GCP project for --sync-cache (default: $DEFAULT_DEST_PROJECT_ID)
  --dest-flagged DEST_FLAGGED     Destination flagged-insights bucket (default: $DEFAULT_DEST_FLAGGED_BUCKET)
  --dest-cache DEST_CACHE         Destination insights-cache bucket (default: $DEFAULT_DEST_CACHE_BUCKET)
  --execute            With --sync-cache: actually copy (default is dry-run)
  -h, --help           Show this help and exit

Kill switch notes:
  Both switches live in the cache bucket as GCS objects. Their existence, not their
  content, is what the server reads.

  insights-generation-disabled  - stops new generation; cached insights keep serving.
                                   Server fails closed on a read error.
  insights-serving-disabled      - stops all serving (cached and fresh). Use for a
                                   content emergency. Server fails open on a read error,
                                   so a transient GCS outage cannot black out the feature.

  --switch-status and the disable/enable modes use the source -p/-c flags.
  To manage prod switches: $0 --switch-status -p $DEFAULT_DEST_PROJECT_ID -c $DEFAULT_DEST_CACHE_BUCKET
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
        --switch-status) MODE="switch-status"; shift ;;
        --disable-serving) MODE="disable-serving"; shift ;;
        --enable-serving) MODE="enable-serving"; shift ;;
        --disable-generation) MODE="disable-generation"; shift ;;
        --enable-generation) MODE="enable-generation"; shift ;;
        --sync-cache) MODE="sync-cache"; shift ;;
        --execute) DRY_RUN=false; shift ;;
        -p) require_value "$1" "$#"; PROJECT_ID="$2"; shift 2 ;;
        -b) require_value "$1" "$#"; FLAGGED_BUCKET="$2"; shift 2 ;;
        -c) require_value "$1" "$#"; CACHE_BUCKET="$2"; shift 2 ;;
        --dest-project) require_value "$1" "$#"; DEST_PROJECT_ID="$2"; shift 2 ;;
        --dest-flagged) require_value "$1" "$#"; DEST_FLAGGED_BUCKET="$2"; shift 2 ;;
        --dest-cache) require_value "$1" "$#"; DEST_CACHE_BUCKET="$2"; shift 2 ;;
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

# --- Kill switch helpers ---

switch_exists() {
    local bucket="$1" obj="$2" project="$3"
    gcloud storage ls "gs://$bucket/$obj" --project "$project" >/dev/null 2>&1
}

set_switch() {
    local bucket="$1" obj="$2" project="$3" label="$4"
    local tmp
    tmp=$(mktemp)
    echo '{}' > "$tmp"
    if gcloud storage cp "$tmp" "gs://$bucket/$obj" --project "$project" >/dev/null 2>&1; then
        echo "$label: ON (disabled)"
    else
        echo "Error: could not set $obj in gs://$bucket" >&2
        rm -f "$tmp"
        exit 2
    fi
    rm -f "$tmp"
}

clear_switch() {
    local bucket="$1" obj="$2" project="$3" label="$4"
    if switch_exists "$bucket" "$obj" "$project"; then
        if gcloud storage rm "gs://$bucket/$obj" --project "$project" >/dev/null 2>&1; then
            echo "$label: OFF (enabled)"
        else
            echo "Error: could not clear $obj in gs://$bucket" >&2
            exit 2
        fi
    else
        echo "$label: already OFF (was not set)"
    fi
}

report_switch() {
    local bucket="$1" obj="$2" project="$3" label="$4"
    if switch_exists "$bucket" "$obj" "$project"; then
        echo "$label: ON (disabled)"
    else
        echo "$label: OFF (enabled)"
    fi
}

# --- Mode: switch-status ---
if [[ "$MODE" == "switch-status" ]]; then
    echo "Kill switch state in gs://$CACHE_BUCKET (project: $PROJECT_ID):"
    report_switch "$CACHE_BUCKET" "$GENERATION_SWITCH" "$PROJECT_ID" "  Generation ($GENERATION_SWITCH)"
    report_switch "$CACHE_BUCKET" "$SERVING_SWITCH"    "$PROJECT_ID" "  Serving    ($SERVING_SWITCH)"
    exit 0
fi

# --- Mode: disable-serving ---
if [[ "$MODE" == "disable-serving" ]]; then
    echo "Setting serving kill switch in gs://$CACHE_BUCKET (project: $PROJECT_ID)..."
    set_switch "$CACHE_BUCKET" "$SERVING_SWITCH" "$PROJECT_ID" "  Serving ($SERVING_SWITCH)"
    echo "Insights will stop being served (cached and fresh) within ~60 seconds."
    echo "To restore: $0 --enable-serving -p $PROJECT_ID -c $CACHE_BUCKET"
    exit 0
fi

# --- Mode: enable-serving ---
if [[ "$MODE" == "enable-serving" ]]; then
    echo "Clearing serving kill switch in gs://$CACHE_BUCKET (project: $PROJECT_ID)..."
    clear_switch "$CACHE_BUCKET" "$SERVING_SWITCH" "$PROJECT_ID" "  Serving ($SERVING_SWITCH)"
    echo "Insights will resume serving within ~60 seconds."
    exit 0
fi

# --- Mode: disable-generation ---
if [[ "$MODE" == "disable-generation" ]]; then
    echo "Setting generation kill switch in gs://$CACHE_BUCKET (project: $PROJECT_ID)..."
    set_switch "$CACHE_BUCKET" "$GENERATION_SWITCH" "$PROJECT_ID" "  Generation ($GENERATION_SWITCH)"
    echo "New generation will stop; cached insights keep serving."
    echo "To restore: $0 --enable-generation -p $PROJECT_ID -c $CACHE_BUCKET"
    exit 0
fi

# --- Mode: enable-generation ---
if [[ "$MODE" == "enable-generation" ]]; then
    echo "Clearing generation kill switch in gs://$CACHE_BUCKET (project: $PROJECT_ID)..."
    clear_switch "$CACHE_BUCKET" "$GENERATION_SWITCH" "$PROJECT_ID" "  Generation ($GENERATION_SWITCH)"
    echo "Insight generation will resume within ~60 seconds."
    exit 0
fi

# --- Mode: sync-cache ---
if [[ "$MODE" == "sync-cache" ]]; then
    echo "=== Insight cache sync: gs://$CACHE_BUCKET -> gs://$DEST_CACHE_BUCKET ==="
    if [[ "$DRY_RUN" == "true" ]]; then
        echo "(dry-run — add --execute to actually copy)"
    fi
    echo

    # Verify GEMINI_MODEL matches across environments before copying.
    # The model is not part of the cache key, so copying while the two differ
    # would import one model's output under a key the other considers current.
    echo "Checking GEMINI_MODEL across environments..."
    src_svc_json=$(gcloud run services describe "$CLOUD_RUN_SERVICE" \
        --project "$PROJECT_ID" --region "$CLOUD_RUN_REGION" --format=json) || {
        echo "Error: could not describe Cloud Run service in $PROJECT_ID." >&2
        exit 2
    }
    dest_svc_json=$(gcloud run services describe "$CLOUD_RUN_SERVICE" \
        --project "$DEST_PROJECT_ID" --region "$CLOUD_RUN_REGION" --format=json) || {
        echo "Error: could not describe Cloud Run service in $DEST_PROJECT_ID." >&2
        exit 2
    }
    src_model=$(printf '%s' "$src_svc_json" \
        | jq -r '(.spec.template.spec.containers[0].env // [])[] | select(.name == "GEMINI_MODEL") | .value' \
        | head -1)
    dest_model=$(printf '%s' "$dest_svc_json" \
        | jq -r '(.spec.template.spec.containers[0].env // [])[] | select(.name == "GEMINI_MODEL") | .value' \
        | head -1)

    # Default if unset in Cloud Run (matches server default in insight_budget.go)
    src_model="${src_model:-gemini-3.1-flash-lite}"
    dest_model="${dest_model:-gemini-3.1-flash-lite}"

    echo "  Source model ($PROJECT_ID): $src_model"
    echo "  Dest model ($DEST_PROJECT_ID): $dest_model"
    if [[ "$src_model" != "$dest_model" ]]; then
        echo
        echo "Error: GEMINI_MODEL mismatch. Copying while the models differ would import" >&2
        echo "one model's output under a key the other considers current. Resolve the" >&2
        echo "mismatch before seeding the cache." >&2
        exit 2
    fi
    echo "  Models match. Proceeding."
    echo

    # Build denylist from both flagged buckets. A key present in either environment's
    # flagged bucket is excluded regardless of status — a suppression is a deletion on
    # the live site, and restoring it would undo content moderation.
    # Fail the run if either bucket cannot be read, rather than proceed with a partial denylist.
    echo "Reading flagged-insights denylist from both environments..."
    WORKDIR_SYNC=$(mktemp -d)
    trap 'rm -rf "$WORKDIR_SYNC"' EXIT

    SRC_FLAGS_DIR="$WORKDIR_SYNC/src_flags"
    DEST_FLAGS_DIR="$WORKDIR_SYNC/dest_flags"
    mkdir -p "$SRC_FLAGS_DIR" "$DEST_FLAGS_DIR"

    if ! gcloud storage rsync --recursive "gs://$FLAGGED_BUCKET" "$SRC_FLAGS_DIR" \
            --project "$PROJECT_ID" >/dev/null 2>&1; then
        echo "Error: could not read source flagged bucket gs://$FLAGGED_BUCKET." >&2
        echo "Cannot proceed without a complete denylist." >&2
        exit 2
    fi
    if ! gcloud storage rsync --recursive "gs://$DEST_FLAGGED_BUCKET" "$DEST_FLAGS_DIR" \
            --project "$DEST_PROJECT_ID" >/dev/null 2>&1; then
        echo "Error: could not read dest flagged bucket gs://$DEST_FLAGGED_BUCKET." >&2
        echo "Cannot proceed without a complete denylist." >&2
        exit 2
    fi

    declare -A DENYLIST
    while IFS= read -r -d '' f; do
        key=$(jq -r '.key // ""' "$f")
        [[ -n "$key" ]] && DENYLIST["$key"]=1
    done < <(find "$SRC_FLAGS_DIR" "$DEST_FLAGS_DIR" -type f -name '*.json' -print0 2>/dev/null)
    echo "  Denylist: ${#DENYLIST[@]} flagged key(s) across both environments."
    echo

    # List source and destination insights/ objects upfront to avoid O(N) per-key GCS calls.
    echo "Listing source insights in gs://$CACHE_BUCKET/insights/ ..."
    SRC_KEYS=()
    while IFS= read -r line; do
        # gcloud storage ls outputs full gs:// URLs; strip prefix and .json suffix to get the key.
        key="${line#gs://"$CACHE_BUCKET"/insights/}"
        key="${key%.json}"
        [[ -n "$key" ]] && SRC_KEYS+=("$key")
    done < <(gcloud storage ls "gs://$CACHE_BUCKET/insights/" --project "$PROJECT_ID" 2>/dev/null || true)
    echo "  Source objects: ${#SRC_KEYS[@]}"

    echo "Listing destination insights in gs://$DEST_CACHE_BUCKET/insights/ ..."
    declare -A DEST_KEYS
    while IFS= read -r line; do
        key="${line#gs://"$DEST_CACHE_BUCKET"/insights/}"
        key="${key%.json}"
        [[ -n "$key" ]] && DEST_KEYS["$key"]=1
    done < <(gcloud storage ls "gs://$DEST_CACHE_BUCKET/insights/" --project "$DEST_PROJECT_ID" 2>/dev/null || true)
    echo "  Destination objects: ${#DEST_KEYS[@]}"
    echo

    copied=0
    skipped_denylist=0
    skipped_exists=0
    would_copy=0

    for key in "${SRC_KEYS[@]}"; do
        src_obj="gs://$CACHE_BUCKET/insights/${key}.json"
        dest_obj="gs://$DEST_CACHE_BUCKET/insights/${key}.json"

        if [[ -n "${DENYLIST[$key]+x}" ]]; then
            skipped_denylist=$(( skipped_denylist + 1 ))
            continue
        fi

        # Skip if already present in dest (idempotent re-runs); uses the upfront list.
        if [[ -n "${DEST_KEYS[$key]+x}" ]]; then
            skipped_exists=$(( skipped_exists + 1 ))
            continue
        fi

        if [[ "$DRY_RUN" == "true" ]]; then
            would_copy=$(( would_copy + 1 ))
        else
            # Billing to source (dev) project; the developer running this has credentials there.
            if gcloud storage cp "$src_obj" "$dest_obj" --project "$PROJECT_ID" >/dev/null 2>&1; then
                copied=$(( copied + 1 ))
            else
                echo "  Warning: failed to copy $src_obj" >&2
            fi
        fi
    done

    echo "=== Summary ==="
    echo "  Source objects total:       ${#SRC_KEYS[@]}"
    echo "  Skipped (denylist):         $skipped_denylist"
    echo "  Skipped (already in dest):  $skipped_exists"
    if [[ "$DRY_RUN" == "true" ]]; then
        echo "  Would copy (dry-run):       $would_copy"
        echo
        echo "Re-run with --execute to perform the copy."
    else
        echo "  Copied:                     $copied"
    fi
    exit 0
fi

# --- WORKDIR setup (modes: list, review, ci) ---

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
