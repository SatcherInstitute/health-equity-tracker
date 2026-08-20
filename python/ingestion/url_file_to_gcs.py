# This file contains code for downloading a file from a url and uploading
# it to a GCS bucket.

import logging
import os
import time
from google.cloud import storage  # type: ignore
import google.cloud.exceptions
import requests
import filecmp


def local_file_path(filename):
    return f"/tmp/{filename}"


def url_file_to_gcs(url, url_params, gcs_bucket, dest_filename, census_api_key=None):
    """
    Attempts to download a file from a url and upload as a
    blob to the given GCS bucket.

    Parameters:
      url: The URL of the file to download.
      url_params: URL parameters to be passed to requests.get().
      gcs_bucket: Name of the GCS bucket to upload to (without gs://).
      dest_filename: What to name the downloaded file in GCS.
        Include the file extension.
      census_api_key: Optional Census API key for Census Bureau endpoints.

    Returns: A boolean indication of a file diff
    """
    return download_first_url_to_gcs([url], gcs_bucket, dest_filename, url_params, census_api_key=census_api_key)


def get_first_response(
    url_list, url_params, validate_json=False, census_api_key=None, max_retries=3, initial_backoff=5
):
    """
    Fetch the first successfully-responding URL from url_list, with optional JSON validation.

    When validate_json=True, calls response.json() to verify the response body is valid JSON.
    If JSON parsing fails, logs the error and moves on to the next URL (retrying the same URL
    won't fix a permanently malformed body).

    Network-level failures (connection errors, timeouts, 5xx/4xx HTTP errors) are retried against
    the same URL with exponential backoff before moving on to the next URL, since these are often
    transient (e.g. the Census API dropping connections under request volume).

    For Census API URLs, automatically adds the api_key param if census_api_key is provided.
    Returns None if all URLs fail.
    """
    for url in url_list:
        params = url_params.copy() if url_params else {}
        # Census Bureau API requires an API key param for all requests
        if census_api_key and "census.gov" in url.lower():
            params["key"] = census_api_key

        for attempt in range(max_retries):
            try:
                file_from_url = requests.get(url, params=params, timeout=120)
                file_from_url.raise_for_status()
                if validate_json:
                    file_from_url.json()
                return file_from_url
            except requests.exceptions.RequestException as err:
                logging.error("Request error for url %s (attempt %d/%d): %s", url, attempt + 1, max_retries, err)
                if attempt < max_retries - 1:
                    time.sleep(initial_backoff * (2**attempt))
            except ValueError as err:
                logging.error("Non-JSON response body from url %s: %s", url, err)
                break
    return None


def download_first_url_to_gcs(url_list, gcs_bucket, dest_filename, url_params=None, census_api_key=None):
    """
    Iterates over the list of potential URLs that may point to the data
    source until one of the URLs succeeds in downloading. If no URL succeeds,
    the method will return an error.

    For .json dest_filename, automatically validates that the response body is
    valid JSON before caching. Non-JSON responses are treated as failures and
    trigger a retry to the next URL in url_list.

    For Census API URLs, automatically adds the api_key param if census_api_key
    is provided (e.g. for Census Bureau ACS data).

    Parameters:
      url_list: List of URLs where the file may be found.
      gcs_bucket: Name of the GCS bucket to upload to (without gs://).
      dest_filename: What to name the downloaded file in GCS.
        Include the file extension. .json extension triggers JSON validation.
      url_params: URL parameters to be passed to requests.get().
      census_api_key: Optional Census API key for Census Bureau endpoints.

      Returns:
        files_are_diff: A boolean indication of a file diff
    """
    if url_params is None:
        url_params = {}

    # Establish connection to valid GCS bucket
    try:
        storage_client = storage.Client()
        bucket = storage_client.get_bucket(gcs_bucket)
    except google.cloud.exceptions.NotFound:
        logging.error("GCS Bucket %s not found", gcs_bucket)
        return

    # Find a valid file in the URL list or exit (with JSON validation for .json files)
    validate_json = dest_filename.endswith(".json")
    file_from_url = get_first_response(url_list, url_params, validate_json=validate_json, census_api_key=census_api_key)
    if file_from_url is None:
        logging.error("No file could be found for intended destination: %s", dest_filename)
        return

    # Download the contents of the URL to a local file
    new_file_local_path = local_file_path(dest_filename)
    with file_from_url, open(new_file_local_path, "wb") as new_file:
        new_file.write(file_from_url.content)

    # Downloads the current file in GCS to a local file
    old_file_local_path = local_file_path(f"gcs_local_file_{dest_filename}")
    with open(old_file_local_path, "wb") as old_file:
        try:
            bucket.blob(dest_filename).download_to_file(old_file)
        except google.cloud.exceptions.NotFound:
            files_are_diff = True
        else:
            # Compare the file contents for a diff
            files_are_diff = not filecmp.cmp(old_file_local_path, new_file_local_path)

    # Only update the bucket if the files are diff
    if files_are_diff:
        # Upload the contents to the bucket
        bucket.blob(dest_filename).upload_from_filename(new_file_local_path)
        print(f"Uploading to Gcs_Bucket: {gcs_bucket}, FileName: {dest_filename}")
    # Remove local files
    os.remove(new_file_local_path)
    os.remove(old_file_local_path)
    return files_are_diff
