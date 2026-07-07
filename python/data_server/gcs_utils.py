from google.cloud import storage  # type: ignore

# Lazily-instantiated module-level Storage client. Reusing one client across requests
# avoids per-call auth and connection-pool overhead.
_client: storage.Client | None = None


def _get_client() -> storage.Client:
    global _client  # pylint: disable=global-statement
    if _client is None:
        _client = storage.Client()
    return _client


def download_blob_as_bytes(gcs_bucket: str, filename: str) -> bytes:
    # bucket() avoids the extra buckets.get API call that get_bucket() makes; if the
    # bucket doesn't exist the subsequent download will fail anyway.
    bucket = _get_client().bucket(gcs_bucket)
    blob = bucket.blob(filename)
    return blob.download_as_bytes()


def upload_blob_from_bytes(gcs_bucket: str, filename: str, data: bytes, content_type: str) -> None:
    bucket = _get_client().bucket(gcs_bucket)
    blob = bucket.blob(filename)
    blob.upload_from_string(data, content_type=content_type)


def delete_blob(gcs_bucket: str, filename: str) -> None:
    bucket = _get_client().bucket(gcs_bucket)
    blob = bucket.blob(filename)
    blob.delete()


def list_blobs(gcs_bucket: str, prefix: str | None = None) -> list:
    # Returns blob objects so callers can read names and download contents as needed.
    return list(_get_client().list_blobs(gcs_bucket, prefix=prefix))


TTL_SECONDS = 7200
TTL_CONTROL_HEADER = f"public, max-age={TTL_SECONDS}"
INSIGHT_TTL_MS = 180 * 24 * 60 * 60 * 1000  # 6 months, matches frontend timestamp format
