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
INSIGHT_KEY_MAX_LEN = 500


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


def _validate_insight_key(key: str | None) -> str | None:
    if not key or len(key) > INSIGHT_KEY_MAX_LEN or "/" in key or ".." in key:
        return None
    return key


@app.route("/insight-cache", methods=["GET"])
def get_insight_cache():
    """Returns a cached AI insight if present and within TTL, otherwise 404."""
    key = _validate_insight_key(request.args.get("key"))
    if key is None:
        return "Request missing or invalid required url param 'key'", 400

    bucket = os.environ.get(INSIGHTS_CACHE_BUCKET_ENV)
    if not bucket:
        return "Insights cache not configured", 503

    try:
        blob = gcs_utils.download_blob_as_bytes(bucket, f"insights/{key}.json")
    except google.cloud.exceptions.NotFound:
        return "", 404
    except Exception as err:  # pylint: disable=broad-except
        logging.error(err)
        return f"Internal server error: {err}", 500

    try:
        payload = json.loads(blob)
    except json.JSONDecodeError:
        return "", 404

    timestamp = payload.get("timestamp", 0)
    if int(time.time() * 1000) - timestamp >= INSIGHT_TTL_MS:
        return "", 404

    return jsonify(payload)


@app.route("/insight-cache", methods=["POST"])
def put_insight_cache():
    """Stores an AI insight in GCS, keyed by the provided cache key."""
    body = request.get_json(silent=True) or {}
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
        return f"Internal server error: {err}", 500

    return "", 204


if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=int(os.environ.get("PORT", 8080)))
