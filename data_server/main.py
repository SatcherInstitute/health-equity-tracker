import json
import logging
import os
import time

import google.cloud.exceptions
from flask import Flask, Response, jsonify, request
from flask_cors import CORS
from werkzeug.datastructures import Headers

from data_server import gcs_utils
from data_server.dataset_cache import DatasetCache
from data_server.gcs_utils import INSIGHT_TTL_MS, TTL_CONTROL_HEADER

app = Flask(__name__)
CORS(app)
cache = DatasetCache()

INSIGHTS_CACHE_BUCKET_ENV = "INSIGHTS_CACHE_BUCKET"
# Separate bucket for flagged-insight records. Kept apart from the cache bucket so the
# cache's 210-day delete lifecycle rule can never sweep away the curated flag archive.
FLAGGED_INSIGHTS_BUCKET_ENV = "FLAGGED_INSIGHTS_BUCKET"
INSIGHT_KEY_MAX_LEN = 500

# Reasons a user may select when flagging an insight.
VALID_FLAG_REASONS = {"inaccurate", "misleading", "offensive", "other"}
# Flag lifecycle. A user flag records the bad output without hiding the data combination:
# the cached text is dropped so a fresh insight regenerates in its place, and the record is
# kept as a negative example. The team can later escalate a record to `suppressed` (hidden
# pending review) or `permanent` (hidden for good), or `reenabled` to clear it.
FLAG_STATUS_FLAGGED = "flagged"
FLAG_STATUS_SUPPRESSED = "suppressed"
FLAG_STATUS_PERMANENT = "permanent"
FLAG_STATUS_REENABLED = "reenabled"
# Statuses that hide an insight on read. Only the team can set these (via PATCH); a plain
# user flag never suppresses, so the combo immediately regenerates a new insight.
SUPPRESSING_STATUSES = {FLAG_STATUS_SUPPRESSED, FLAG_STATUS_PERMANENT}
# Statuses whose stored content is fed back into the prompt as a negative example. Only
# team-confirmed records (`suppressed`/`permanent`) qualify — a raw user `flagged` record is
# excluded so a bad-faith or mistaken public flag can't poison the prompt, and `reenabled`
# is excluded because the team has explicitly cleared it.
NEGATIVE_EXAMPLE_STATUSES = {FLAG_STATUS_SUPPRESSED, FLAG_STATUS_PERMANENT}
VALID_FLAG_STATUSES = {FLAG_STATUS_FLAGGED, FLAG_STATUS_SUPPRESSED, FLAG_STATUS_PERMANENT, FLAG_STATUS_REENABLED}
# Cap on how many flagged examples we feed back into the generation prompt.
MAX_FLAGGED_EXAMPLES = 10


@app.route("/", methods=["GET"])
def get_program_name():
    return "Running data server."


@app.route("/metadata", methods=["GET"])
def get_metadata():
    """Downloads and returns metadata about available download files."""
    try:
        metadata = cache.getDataset(os.environ.get("GCS_BUCKET"), os.environ.get("METADATA_FILENAME"))
    except Exception as err:
        logging.error(err)
        return f"Internal server error: {err}", 500

    def generate_response(data: bytes):
        next_row = b"["
        for row in data.splitlines():
            yield next_row
            next_row = row + b","
        yield next_row.rstrip(b",") + b"]"

    headers = Headers()
    headers.add("Content-Disposition", "attachment", filename=os.environ.get("METADATA_FILENAME"))
    headers.add("Vary", "Accept-Encoding")
    return Response(generate_response(metadata), mimetype="application/json", headers=headers)


@app.route("/dataset", methods=["GET"])
def get_dataset():
    """Downloads and returns the requested dataset if it exists."""
    dataset_name = request.args.get("name")
    if dataset_name is None:
        return "Request missing required url param 'name'", 400

    try:
        dataset = cache.getDataset(os.environ.get("GCS_BUCKET"), dataset_name)
    except Exception as err:
        logging.error(err)
        return f"Internal server error: {err}", 500

    def generate_response():
        next_row = b"["
        for row in dataset.splitlines():
            yield next_row
            next_row = row + b","
        yield next_row.rstrip(b",") + b"]"

    headers = Headers()
    headers.add("Content-Disposition", "attachment", filename=dataset_name)
    headers.add("Vary", "Accept-Encoding")
    headers.add("Cache-Control", TTL_CONTROL_HEADER)

    if dataset_name.endswith(".csv"):
        return Response(dataset, mimetype="text/csv", headers=headers)

    return Response(generate_response(), mimetype="application/json", headers=headers)


def _json_object_body() -> dict:
    """Returns the request's JSON body if it's an object, else {}.

    Guards against a non-object body (a JSON array, string, or number), which would
    otherwise make the subsequent `.get(...)` raise AttributeError. Returning {} lets the
    per-field validation below produce a clean 400 instead of a 500.
    """
    body = request.get_json(silent=True)
    return body if isinstance(body, dict) else {}


def _validate_insight_key(key: str | None) -> str | None:
    # GCS object names are literal strings, not paths — "/" can't escape the insights/ prefix.
    if not key or len(key) > INSIGHT_KEY_MAX_LEN or ".." in key:
        return None
    return key


def _flagged_record(key: str) -> dict | None:
    """Returns the flag record for a key if one exists, else None. Never raises."""
    bucket = os.environ.get(FLAGGED_INSIGHTS_BUCKET_ENV)
    if not bucket:
        return None
    try:
        blob = gcs_utils.download_blob_as_bytes(bucket, f"{key}.json")
    except google.cloud.exceptions.NotFound:
        return None
    except Exception as err:  # pylint: disable=broad-except
        logging.error(err)
        return None
    try:
        record = json.loads(blob)
    except json.JSONDecodeError:
        return None
    return record if isinstance(record, dict) else None


def _cached_insight_content(key: str) -> str:
    """Returns the cached insight text for a key, or "" if missing/unreadable. Never raises."""
    bucket = os.environ.get(INSIGHTS_CACHE_BUCKET_ENV)
    if not bucket:
        return ""
    try:
        blob = gcs_utils.download_blob_as_bytes(bucket, f"insights/{key}.json")
    except google.cloud.exceptions.NotFound:
        return ""
    except Exception as err:  # pylint: disable=broad-except
        logging.error(err)
        return ""
    try:
        payload = json.loads(blob)
    except json.JSONDecodeError:
        return ""
    if not isinstance(payload, dict):
        return ""
    content = payload.get("content")
    return content if isinstance(content, str) else ""


@app.route("/insight-cache", methods=["GET"])
def get_insight_cache():
    """Returns a cached AI insight if present and within TTL, otherwise 404.

    If the key has been flagged and is currently suppressed, returns
    {"suppressed": true} so the insight is never served, regardless of cache state.
    """
    key = _validate_insight_key(request.args.get("key"))
    if key is None:
        return "Request missing or invalid required url param 'key'", 400

    flag = _flagged_record(key)
    if flag is not None and flag.get("status") in SUPPRESSING_STATUSES:
        return jsonify({"suppressed": True})

    bucket = os.environ.get(INSIGHTS_CACHE_BUCKET_ENV)
    if not bucket:
        return "Insights cache not configured", 503

    try:
        blob = gcs_utils.download_blob_as_bytes(bucket, f"insights/{key}.json")
    except google.cloud.exceptions.NotFound:
        return "", 404
    except Exception as err:  # pylint: disable=broad-except
        logging.error(err)
        return "Internal server error", 500

    try:
        payload = json.loads(blob)
    except json.JSONDecodeError:
        return "", 404

    if not isinstance(payload, dict):
        return "", 404

    timestamp = payload.get("timestamp", 0)
    if int(time.time() * 1000) - timestamp >= INSIGHT_TTL_MS:
        return "", 404

    return jsonify(payload)


@app.route("/insight-cache", methods=["POST"])
def put_insight_cache():
    """Stores an AI insight in GCS, keyed by the provided cache key."""
    body = _json_object_body()
    key = _validate_insight_key(body.get("key"))
    content = body.get("content")
    if key is None or not content:
        return "Request body missing or invalid 'key' or 'content'", 400

    bucket = os.environ.get(INSIGHTS_CACHE_BUCKET_ENV)
    if not bucket:
        return "Insights cache not configured", 503

    payload = json.dumps({"content": content, "timestamp": int(time.time() * 1000)}).encode("utf-8")
    try:
        gcs_utils.upload_blob_from_bytes(bucket, f"insights/{key}.json", payload, "application/json")
    except Exception as err:  # pylint: disable=broad-except
        logging.error(err)
        return "Internal server error", 500

    return "", 204


@app.route("/flag-insight", methods=["POST"])
def flag_insight():
    """Records a user-flagged insight without hiding its data combination.

    Writes a flag record to the flagged-insights bucket (kept as a negative example) and
    best-effort deletes the matching cached insight so a fresh one regenerates in its place.
    The record is NOT suppressing — only the team can escalate it to hide the combo.
    """
    body = _json_object_body()
    key = _validate_insight_key(body.get("key"))
    reason = body.get("reason")
    if key is None or reason not in VALID_FLAG_REASONS:
        return "Request body missing or invalid 'key' or 'reason'", 400

    flagged_bucket = os.environ.get(FLAGGED_INSIGHTS_BUCKET_ENV)
    if not flagged_bucket:
        return "Insight flagging not configured", 503

    # Source the flagged content from the server-side cache, never from the client. The
    # content is later fed back into the generation prompt as a negative example, so trusting
    # client-supplied text would let a caller inject arbitrary instructions into the prompt.
    content = _cached_insight_content(key)

    record = {
        "key": key,
        "reason": reason,
        "note": (body.get("note") or "")[:1000],
        "content": content[:5000],
        "topic": (body.get("topic") or "")[:200],
        "status": FLAG_STATUS_FLAGGED,
        "timestamp": int(time.time() * 1000),
    }
    try:
        gcs_utils.upload_blob_from_bytes(
            flagged_bucket, f"{key}.json", json.dumps(record).encode("utf-8"), "application/json"
        )
    except Exception as err:  # pylint: disable=broad-except
        logging.error(err)
        return "Internal server error", 500

    # Best-effort delete of the cached insight so the next read misses and regenerates a
    # fresh one. If this fails the stale text lingers until its TTL, but no data is lost.
    cache_bucket = os.environ.get(INSIGHTS_CACHE_BUCKET_ENV)
    if cache_bucket:
        try:
            gcs_utils.delete_blob(cache_bucket, f"insights/{key}.json")
        except google.cloud.exceptions.NotFound:
            pass
        except Exception as err:  # pylint: disable=broad-except
            logging.warning("Failed to delete cached insight after flagging: %s", err)

    return "", 204


def _blob_modified_key(blob):
    """Sort key for newest-first blob ordering using GCS metadata (no content download).

    Real GCS blobs expose `updated`/`time_created` after a list call; fall back to 0 so the
    sort stays stable for blobs (or test fakes) lacking that metadata.
    """
    return getattr(blob, "updated", None) or getattr(blob, "time_created", None) or 0


def _iter_flag_records(flagged_bucket: str):
    """Yields all valid flag records in the flagged-insights bucket."""
    for blob in gcs_utils.list_blobs(flagged_bucket):
        if not blob.name.endswith(".json"):
            continue
        try:
            record = json.loads(blob.download_as_bytes())
        except (json.JSONDecodeError, google.cloud.exceptions.NotFound):
            continue
        if isinstance(record, dict):
            yield record


@app.route("/flagged-examples", methods=["GET"])
def get_flagged_examples():
    """Returns recent flagged {reason, content} pairs, optionally scoped to a topic.

    Used to feed prior bad outputs back into the generation prompt as negative examples.
    This runs on the critical path of every insight generation, so it avoids downloading
    every blob: it lists once (metadata only), orders blobs newest-first by their GCS
    modification time, then downloads lazily and stops once MAX_FLAGGED_EXAMPLES matches
    are collected — O(min(N, MAX)) downloads in the common case instead of O(N).
    """
    flagged_bucket = os.environ.get(FLAGGED_INSIGHTS_BUCKET_ENV)
    if not flagged_bucket:
        # Not an error — flagging just isn't configured in this environment.
        return jsonify({"examples": []})

    topic = request.args.get("topic")
    examples: list[dict] = []
    try:
        blobs = gcs_utils.list_blobs(flagged_bucket)
        blobs.sort(key=_blob_modified_key, reverse=True)
        for blob in blobs:
            if len(examples) >= MAX_FLAGGED_EXAMPLES:
                break
            if not blob.name.endswith(".json"):
                continue
            try:
                record = json.loads(blob.download_as_bytes())
            except (json.JSONDecodeError, google.cloud.exceptions.NotFound):
                continue
            if not isinstance(record, dict):
                continue
            if record.get("status") not in NEGATIVE_EXAMPLE_STATUSES:
                continue
            if topic and record.get("topic") != topic:
                continue
            content = record.get("content")
            if content:
                examples.append({"reason": record.get("reason"), "content": content})
    except Exception as err:  # pylint: disable=broad-except
        logging.error(err)
        return jsonify({"examples": []})

    return jsonify({"examples": examples})


@app.route("/flagged-insights", methods=["GET"])
def list_flagged_insights():
    """Returns all flag records for team review (admin)."""
    flagged_bucket = os.environ.get(FLAGGED_INSIGHTS_BUCKET_ENV)
    if not flagged_bucket:
        return "Insight flagging not configured", 503
    try:
        records = list(_iter_flag_records(flagged_bucket))
    except Exception as err:  # pylint: disable=broad-except
        logging.error(err)
        return "Internal server error", 500
    records.sort(key=lambda r: r.get("timestamp", 0), reverse=True)
    return jsonify({"flagged": records})


@app.route("/flagged-insights", methods=["PATCH"])
def update_flagged_insight():
    """Updates a flag record's status (re-enable or permanently suppress)."""
    body = _json_object_body()
    key = _validate_insight_key(body.get("key"))
    status = body.get("status")
    if key is None or status not in VALID_FLAG_STATUSES:
        return "Request body missing or invalid 'key' or 'status'", 400

    flagged_bucket = os.environ.get(FLAGGED_INSIGHTS_BUCKET_ENV)
    if not flagged_bucket:
        return "Insight flagging not configured", 503

    record = _flagged_record(key)
    if record is None:
        return "", 404

    # A `permanent` ban is intentionally a one-way door: it can't be lifted through the API
    # (neither this endpoint nor the review script, which only ever touches `flagged`
    # records). Re-enabling one requires a deliberate manual edit of the GCS object. This is
    # what distinguishes `permanent` from `suppressed`, which the team can freely re-enable.
    if record.get("status") == FLAG_STATUS_PERMANENT and status == FLAG_STATUS_REENABLED:
        return "Cannot re-enable a permanently banned insight; edit the GCS record directly", 409

    record["status"] = status
    record["statusUpdatedAt"] = int(time.time() * 1000)
    try:
        gcs_utils.upload_blob_from_bytes(
            flagged_bucket, f"{key}.json", json.dumps(record).encode("utf-8"), "application/json"
        )
    except Exception as err:  # pylint: disable=broad-except
        logging.error(err)
        return "Internal server error", 500

    # When re-enabling, drop any stale cached insight so it regenerates fresh next time.
    if status == FLAG_STATUS_REENABLED:
        cache_bucket = os.environ.get(INSIGHTS_CACHE_BUCKET_ENV)
        if cache_bucket:
            try:
                gcs_utils.delete_blob(cache_bucket, f"insights/{key}.json")
            except google.cloud.exceptions.NotFound:
                pass
            except Exception as err:  # pylint: disable=broad-except
                logging.warning("Failed to delete cached insight on re-enable: %s", err)

    return jsonify(record)


if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=int(os.environ.get("PORT", 8080)))
