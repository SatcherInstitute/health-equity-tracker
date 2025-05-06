from google.cloud import storage  # type: ignore


def download_blob_as_bytes(gcs_bucket: str, filename: str) -> bytes:
    client = storage.Client()
    bucket = client.get_bucket(gcs_bucket)
    blob = bucket.blob(filename)
    return blob.download_as_bytes()


TTL_SECONDS = 7200
TTL_CONTROL_HEADER = f"public, max-age={TTL_SECONDS}"
