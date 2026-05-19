from google.cloud import storage  # type: ignore


def download_blob_as_bytes(gcs_bucket: str, filename: str) -> bytes:
    client = storage.Client()
    bucket = client.get_bucket(gcs_bucket)
    blob = bucket.blob(filename)
    return blob.download_as_bytes()


def upload_blob_from_bytes(gcs_bucket: str, filename: str, data: bytes, content_type: str) -> None:
    client = storage.Client()
    bucket = client.get_bucket(gcs_bucket)
    blob = bucket.blob(filename)
    blob.upload_from_string(data, content_type=content_type)


TTL_SECONDS = 7200
TTL_CONTROL_HEADER = f"public, max-age={TTL_SECONDS}"
INSIGHT_TTL_MS = 180 * 24 * 60 * 60 * 1000  # 6 months, matches frontend timestamp format
