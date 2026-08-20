import json
import unittest
from unittest.mock import Mock, patch
import google.cloud.exceptions
import requests
from ingestion import url_file_to_gcs


class MockResponse:
    def __init__(self, content, json_data=None, raise_json=False):
        self.content = content
        self._json_data = json_data
        self._raise_json = raise_json

    def __enter__(self):
        pass

    def __exit__(self, exc_type, exc_val, exc_tb):
        pass

    def raise_for_status(self):
        pass

    def json(self):
        if self._raise_json:
            raise ValueError("No JSON object could be decoded")
        if self._json_data is not None:
            return self._json_data
        return json.loads(self.content)


def write_to_file(file_to_write, contents):
    file_to_write.write(contents)
    file_to_write.close()


def initialize_mocks(
    mock_storage_client,
    mock_requests_get,
    response_data=None,
    gcs_data=None,
    blob_download_side_effect=None,
    mock_response=None,
):
    if blob_download_side_effect is None and gcs_data is not None:

        def default_blob_side_effect(test_old_file):
            write_to_file(test_old_file, gcs_data)

        blob_download_side_effect = default_blob_side_effect

    mock_storage_instance = mock_storage_client.return_value
    blob_attrs = {"download_to_file.side_effect": blob_download_side_effect}
    mock_blob = Mock(**blob_attrs)
    bucket_attrs = {"blob.return_value": mock_blob}
    mock_bucket = Mock(**bucket_attrs)
    mock_storage_instance.get_bucket.return_value = mock_bucket
    mock_requests_get.return_value = mock_response if mock_response is not None else MockResponse(response_data)


class URLFileToGCSTest(unittest.TestCase):
    def testDownloadFirstUrlToGcs_SameFile(self):
        test_data = b"fake data"
        with patch("ingestion.url_file_to_gcs.storage.Client") as mock_storage_client, patch(
            "requests.get"
        ) as mock_requests_get:
            initialize_mocks(mock_storage_client, mock_requests_get, test_data, test_data)

            result = url_file_to_gcs.download_first_url_to_gcs(
                ["https://testurl.com"], "test_bucket", "test_destination"
            )

            self.assertFalse(result)

    def testDownloadFirstUrlToGcs_DiffFile(self):
        with patch("ingestion.url_file_to_gcs.storage.Client") as mock_storage_client, patch(
            "requests.get"
        ) as mock_requests_get:
            initialize_mocks(mock_storage_client, mock_requests_get, b"data from url", b"gcs data")

            result = url_file_to_gcs.download_first_url_to_gcs(
                ["https://testurl.com"], "test_bucket", "test_destination"
            )

            self.assertTrue(result)

    def testDownloadFirstUrlToGcs_NoGCSFile(self):
        with patch("ingestion.url_file_to_gcs.storage.Client") as mock_storage_client, patch(
            "requests.get"
        ) as mock_requests_get:
            initialize_mocks(
                mock_storage_client,
                mock_requests_get,
                b"data from url",
                b"gcs data",
                blob_download_side_effect=google.cloud.exceptions.NotFound("test error"),
            )

            result = url_file_to_gcs.download_first_url_to_gcs(
                ["https://testurl.com"], "test_bucket", "test_destination"
            )

            self.assertTrue(result)

    def testDownloadFirstUrlToGcs_JsonFilenameValidJson(self):
        """A .json dest_filename with a valid JSON response body succeeds."""
        with patch("ingestion.url_file_to_gcs.storage.Client") as mock_storage_client, patch(
            "requests.get"
        ) as mock_requests_get:
            initialize_mocks(
                mock_storage_client,
                mock_requests_get,
                response_data=None,
                gcs_data=b"old data",
                mock_response=MockResponse(
                    b'[["NAME","B01001_001E"],["Alabama","5024279"]]',
                    json_data=[["NAME", "B01001_001E"], ["Alabama", "5024279"]],
                ),
            )

            result = url_file_to_gcs.download_first_url_to_gcs(
                ["https://testurl.com"], "test_bucket", "test_destination.json"
            )

            self.assertTrue(result)

    def testDownloadFirstUrlToGcs_JsonFilenameHtmlResponse(self):
        """A .json dest_filename whose response body is HTML (e.g. Census key-wall) returns None."""
        with patch("ingestion.url_file_to_gcs.storage.Client") as mock_storage_client, patch(
            "requests.get"
        ) as mock_requests_get:
            initialize_mocks(
                mock_storage_client,
                mock_requests_get,
                response_data=None,
                gcs_data=b"old data",
                mock_response=MockResponse(b"<html>missing key</html>", raise_json=True),
            )

            result = url_file_to_gcs.download_first_url_to_gcs(
                ["https://testurl.com"], "test_bucket", "test_destination.json"
            )

            self.assertIsNone(result)

    def testGetFirstResponse_JsonValidation_HtmlBody(self):
        """get_first_response with validate_json=True returns None for HTML body."""
        html_response = MockResponse(b"<html>error</html>", raise_json=True)
        with patch("requests.get", return_value=html_response):
            result = url_file_to_gcs.get_first_response(["https://testurl.com"], {}, validate_json=True)
        self.assertIsNone(result)

    def testGetFirstResponse_JsonValidation_ValidJson(self):
        """get_first_response with validate_json=True returns response for valid JSON body."""
        json_response = MockResponse(b'{"key": "value"}', json_data={"key": "value"})
        with patch("requests.get", return_value=json_response):
            result = url_file_to_gcs.get_first_response(["https://testurl.com"], {}, validate_json=True)
        self.assertIsNotNone(result)

    def testGetFirstResponse_NoJsonValidation_HtmlBody(self):
        """get_first_response with validate_json=False (default) returns response even for HTML body."""
        html_response = MockResponse(b"<html>error</html>", raise_json=True)
        with patch("requests.get", return_value=html_response):
            result = url_file_to_gcs.get_first_response(["https://testurl.com"], {})
        self.assertIsNotNone(result)

    def testGetFirstResponse_RetriesTransientConnectionError(self):
        """A ConnectionError/ReadTimeout on the same URL is retried, not treated as permanent failure."""
        good_response = MockResponse(b'{"key": "value"}', json_data={"key": "value"})
        with patch(
            "requests.get",
            side_effect=[requests.exceptions.ConnectionError("Remote end closed connection"), good_response],
        ) as mock_get, patch("time.sleep") as mock_sleep:
            result = url_file_to_gcs.get_first_response(["https://testurl.com"], {}, validate_json=True)
        self.assertIsNotNone(result)
        self.assertEqual(mock_get.call_count, 2)
        mock_sleep.assert_called_once()

    def testGetFirstResponse_GivesUpAfterMaxRetries(self):
        """Persistent connection errors on one URL exhaust retries and return None."""
        with patch("requests.get", side_effect=requests.exceptions.ReadTimeout("Read timed out")) as mock_get, patch(
            "time.sleep"
        ) as mock_sleep:
            result = url_file_to_gcs.get_first_response(["https://testurl.com"], {}, max_retries=3, initial_backoff=1)
        self.assertIsNone(result)
        self.assertEqual(mock_get.call_count, 3)
        self.assertEqual(mock_sleep.call_count, 2)
