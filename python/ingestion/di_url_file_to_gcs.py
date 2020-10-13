# This file contains code for downloading a file from a url and uploading
# it to a GCS bucket.

import logging
import os
from google.cloud import storage
import google.cloud.exceptions
import requests


def local_file_path(filename):
    return '/tmp/{}'.format(filename)


def url_file_to_gcs(url, url_params, gcs_bucket, dest_filename):
    """Attempts to download a file from a url and upload as a blob to the given GCS bucket.

      url: The URL of the file to download.
      url_params: URL parameters to be passed to requests.get().
      gcs_bucket: Name of the GCS bucket to upload to (without gs://).
      dest_filename: What to name the downloaded file in GCS. Include the file extension."""
    download_first_url_to_gcs([url], url_params, gcs_bucket, dest_filename)


def get_first_response(url_list, url_params):
    for url in url_list:
        try:
            file_from_url = requests.get(url, params=url_params)
            file_from_url.raise_for_status()
            return file_from_url
        except requests.HTTPError as err:
            logging.error("HTTP error for url %s: %s", url, err)
    return None


def download_first_url_to_gcs(url_list, url_params, gcs_bucket, dest_filename):
    """Iterates over the list of potential URLs that may point to the data
       source until one of the URLs succeeds in downloading. If no URL suceeds,
       the method will return an error.

      url_list: List of URLs where the file may be found.
      url_params: URL parameters to be passed to requests.get().
      gcs_bucket: Name of the GCS bucket to upload to (without gs://).
      dest_filename: What to name the downloaded file in GCS. Include the file extension."""

    # Establish connection to valid GCS bucket
    try:
        storage_client = storage.Client()
        bucket = storage_client.get_bucket(gcs_bucket)
    except google.cloud.exceptions.NotFound:
        logging.error("GCS Bucket %s not found", gcs_bucket)
        return

    # Find a valid file in the URL list or exit
    file_from_url = get_first_response(url_list, url_params)
    if file_from_url is None:
        logging.error(
            "No file could be found for intended destination: %s", dest_filename)
        return

    # Download URL locally, upload to bucket and remove local file
    local_path = local_file_path(dest_filename)
    with file_from_url, open(local_path, 'wb') as f:
        f.write(file_from_url.content)
    blob = bucket.blob(dest_filename)
    blob.upload_from_filename(local_path)
    os.remove(local_path)
