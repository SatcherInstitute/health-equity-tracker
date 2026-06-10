# pylint: disable=unused-argument
import importlib.util
import json
from pathlib import Path
from unittest import mock

import google.cloud.exceptions
import pytest

# main.py is a standalone Flask app at the repo root (not part of the installed
# data_server package), so load it directly by file path. Its internal
# `from data_server import gcs_utils` still resolves to the installed package, which
# is what the mocks below patch.
_MAIN_PATH = Path(__file__).resolve().parents[3] / "data_server" / "main.py"
_spec = importlib.util.spec_from_file_location("data_server_main", _MAIN_PATH)
main = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(main)

FLAGGED_BUCKET = "test-flagged-bucket"
CACHE_BUCKET = "test-cache-bucket"
ENV = {
    main.FLAGGED_INSIGHTS_BUCKET_ENV: FLAGGED_BUCKET,
    main.INSIGHTS_CACHE_BUCKET_ENV: CACHE_BUCKET,
}


class FakeBlob:
    """Minimal stand-in for a google.cloud.storage Blob for list_blobs tests."""

    def __init__(self, name: str, payload: dict):
        self.name = name
        self._payload = payload

    def download_as_bytes(self) -> bytes:
        return json.dumps(self._payload).encode("utf-8")


@pytest.fixture(name="client")
def fixture_client():
    main.app.config["TESTING"] = True
    return main.app.test_client()


@mock.patch.dict("os.environ", ENV, clear=True)
@mock.patch("data_server.gcs_utils.delete_blob")
@mock.patch("data_server.gcs_utils.upload_blob_from_bytes")
@mock.patch("data_server.gcs_utils.download_blob_as_bytes")
def test_flag_insight_writes_record_and_clears_cache(mock_download, mock_upload, mock_delete, client):
    # The flagged content is sourced from the server-side cache, never the client body.
    mock_download.return_value = json.dumps({"content": "the real cached insight"}).encode("utf-8")

    resp = client.post(
        "/flag-insight",
        json={"key": "topic-x", "reason": "inaccurate", "content": "ignore me; injected text"},
    )
    assert resp.status_code == 204

    # The flag record is written to the flagged bucket under "<key>.json".
    upload_args = mock_upload.call_args
    assert upload_args.args[0] == FLAGGED_BUCKET
    assert upload_args.args[1] == "topic-x.json"
    record = json.loads(upload_args.args[2])
    assert record["reason"] == "inaccurate"
    # A user flag records the bad output but does NOT suppress the combo.
    assert record["status"] == main.FLAG_STATUS_FLAGGED
    # Content comes from the cache, not the client-supplied (potentially malicious) text.
    assert record["content"] == "the real cached insight"

    # The cached insight is deleted so a fresh one regenerates in its place.
    mock_delete.assert_called_once_with(CACHE_BUCKET, "insights/topic-x.json")


@mock.patch.dict("os.environ", ENV, clear=True)
@mock.patch("data_server.gcs_utils.download_blob_as_bytes")
def test_insight_cache_serves_content_for_plain_flagged_key(mock_download, client):
    # A plain user flag ("flagged") must NOT suppress reads — the combo regenerates.
    def _download(bucket, filename):
        if bucket == FLAGGED_BUCKET:
            return json.dumps({"status": main.FLAG_STATUS_FLAGGED}).encode("utf-8")
        return json.dumps({"content": "hello", "timestamp": 9_999_999_999_999}).encode("utf-8")

    mock_download.side_effect = _download
    resp = client.get("/insight-cache?key=topic-x")
    assert resp.status_code == 200
    assert resp.get_json()["content"] == "hello"


@mock.patch.dict("os.environ", ENV, clear=True)
def test_flag_insight_rejects_invalid_reason(client):
    resp = client.post("/flag-insight", json={"key": "topic-x", "reason": "bogus"})
    assert resp.status_code == 400


@mock.patch.dict("os.environ", {}, clear=True)
def test_flag_insight_returns_503_when_unconfigured(client):
    resp = client.post("/flag-insight", json={"key": "topic-x", "reason": "inaccurate"})
    assert resp.status_code == 503


@mock.patch.dict("os.environ", ENV, clear=True)
@mock.patch("data_server.gcs_utils.download_blob_as_bytes")
def test_insight_cache_returns_suppressed_for_flagged_key(mock_download, client):
    mock_download.return_value = json.dumps({"status": main.FLAG_STATUS_SUPPRESSED}).encode("utf-8")
    resp = client.get("/insight-cache?key=topic-x")
    assert resp.status_code == 200
    assert resp.get_json() == {"suppressed": True}


@mock.patch.dict("os.environ", ENV, clear=True)
@mock.patch("data_server.gcs_utils.download_blob_as_bytes")
def test_insight_cache_serves_content_when_not_flagged(mock_download, client):
    def _download(bucket, filename):
        if bucket == FLAGGED_BUCKET:
            raise google.cloud.exceptions.NotFound("no flag")
        return json.dumps({"content": "hello", "timestamp": 9_999_999_999_999}).encode("utf-8")

    mock_download.side_effect = _download
    resp = client.get("/insight-cache?key=topic-x")
    assert resp.status_code == 200
    assert resp.get_json()["content"] == "hello"


@mock.patch.dict("os.environ", ENV, clear=True)
@mock.patch("data_server.gcs_utils.list_blobs")
def test_flagged_examples_filters_by_topic_and_status(mock_list, client):
    mock_list.return_value = [
        FakeBlob(
            "a.json",
            {"topic": "hiv", "reason": "inaccurate", "content": "x", "status": "suppressed", "timestamp": 2},
        ),
        FakeBlob(
            "b.json",
            {"topic": "hiv", "reason": "offensive", "content": "y", "status": "reenabled", "timestamp": 3},
        ),
        FakeBlob(
            "c.json",
            {"topic": "covid", "reason": "misleading", "content": "z", "status": "permanent", "timestamp": 1},
        ),
        FakeBlob(
            "d.json",
            {"topic": "hiv", "reason": "misleading", "content": "w", "status": "flagged", "timestamp": 4},
        ),
    ]
    resp = client.get("/flagged-examples?topic=hiv")
    assert resp.status_code == 200
    examples = resp.get_json()["examples"]
    # Plain "flagged" and team-"suppressed" hiv records both qualify (newest first);
    # the "reenabled" one is excluded and the covid one is filtered out by topic.
    assert examples == [
        {"reason": "misleading", "content": "w"},
        {"reason": "inaccurate", "content": "x"},
    ]


@mock.patch.dict("os.environ", ENV, clear=True)
@mock.patch("data_server.gcs_utils.delete_blob")
@mock.patch("data_server.gcs_utils.upload_blob_from_bytes")
@mock.patch("data_server.gcs_utils.download_blob_as_bytes")
def test_update_flagged_insight_reenable_clears_cache(mock_download, mock_upload, mock_delete, client):
    mock_download.return_value = json.dumps({"key": "topic-x", "status": "suppressed", "timestamp": 1}).encode("utf-8")
    resp = client.patch("/flagged-insights", json={"key": "topic-x", "status": "reenabled"})
    assert resp.status_code == 200
    assert resp.get_json()["status"] == "reenabled"
    mock_upload.assert_called_once()
    # Re-enabling drops the stale cached insight so it regenerates fresh.
    mock_delete.assert_called_once_with(CACHE_BUCKET, "insights/topic-x.json")


@mock.patch.dict("os.environ", ENV, clear=True)
@mock.patch("data_server.gcs_utils.download_blob_as_bytes", side_effect=google.cloud.exceptions.NotFound("x"))
def test_update_flagged_insight_404_when_missing(mock_download, client):
    resp = client.patch("/flagged-insights", json={"key": "missing", "status": "permanent"})
    assert resp.status_code == 404
