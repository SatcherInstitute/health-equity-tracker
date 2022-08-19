# This file contains code for downloading a file from a url and uploading
# it to a GCS bucket.

import logging
import os
from google.cloud import storage
import google.cloud.exceptions
import requests
import filecmp


def local_file_path(filename):
    return '/tmp/{}'.format(filename)


def url_file_to_gcs(url, url_params, gcs_bucket, dest_filename):
    """
    Attempts to download a file from a url and upload as a
    blob to the given GCS bucket.

    Parameters:
      url: The URL of the file to download.
      url_params: URL parameters to be passed to requests.get().
      gcs_bucket: Name of the GCS bucket to upload to (without gs://).
      dest_filename: What to name the downloaded file in GCS.
        Include the file extension.

    Returns: A boolean indication of a file diff
    """
    return download_first_url_to_gcs(
        [url], gcs_bucket, dest_filename, url_params)


def get_first_response(url_list, url_params):
    for url in url_list:
        try:
            file_from_url = requests.get(url, params=url_params)
            file_from_url.raise_for_status()
            return file_from_url
        except requests.HTTPError as err:
            logging.error("HTTP error for url %s: %s", url, err)
    return None


def download_first_url_to_gcs(url_list, gcs_bucket, dest_filename,
                              url_params={}):
    """
    Iterates over the list of potential URLs that may point to the data
    source until one of the URLs succeeds in downloading. If no URL succeeds,
    the method will return an error.

    Parameters:
      url_list: List of URLs where the file may be found.
      gcs_bucket: Name of the GCS bucket to upload to (without gs://).
      dest_filename: What to name the downloaded file in GCS.
        Include the file extension.
      url_params: URL parameters to be passed to requests.get().

      Returns:
        files_are_diff: A boolean indication of a file diff
      """

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
            "No file could be found for intended destination: %s",
            dest_filename)
        return

    # Download the contents of the URL to a local file
    new_file_local_path = local_file_path(dest_filename)
    with file_from_url, open(new_file_local_path, 'wb') as new_file:
        new_file.write(file_from_url.content)

    # Downloads the current file in GCS to a local file
    old_file_local_path = local_file_path("gcs_local_file")
    with open(old_file_local_path, "wb") as old_file:
        try:
            bucket.blob(dest_filename).download_to_file(old_file)
        except google.cloud.exceptions.NotFound:
            files_are_diff = True
        else:
            # Compare the file contents for a diff
            files_are_diff = not filecmp.cmp(
                old_file_local_path, new_file_local_path)

    # Only update the bucket if the files are diff
    if files_are_diff:
        # Upload the contents to the bucket
        bucket.blob(dest_filename).upload_from_filename(new_file_local_path)
        print(
            f'Uploading to Gcs_Bucket: {gcs_bucket}, FileName: {dest_filename}')
    # Remove local files
    os.remove(new_file_local_path)
    os.remove(old_file_local_path)
    return files_are_diff
