import unittest
from unittest.mock import Mock, patch
import google.cloud.exceptions
import requests
from ingestion import url_file_to_gcs


class MockResponse:
    def __init__(self, content, status_code=200):
        self.content = content
        self.status_code = status_code

    def __enter__(self):
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        pass

    def raise_for_status(self):
        if 400 <= self.status_code:
            raise requests.HTTPError(
                f"{self.status_code} response",
                response=self,
            )

    def json(self):
        import json

        return json.loads(self.content.decode("utf-8"))


def write_to_file(file_to_write, contents):
    file_to_write.write(contents)
    file_to_write.close()


def initialize_mocks(mock_storage_client, mock_requests_get, response_data, gcs_data, blob_download_side_effect=None):
    if blob_download_side_effect is None:

        def blob_download_side_effect(test_old_file):
            write_to_file(test_old_file, gcs_data)

    mock_storage_instance = mock_storage_client.return_value
    blob_attrs = {"download_to_file.side_effect": blob_download_side_effect}
    mock_blob = Mock(**blob_attrs)
    bucket_attrs = {"blob.return_value": mock_blob}
    mock_bucket = Mock(**bucket_attrs)
    mock_storage_instance.get_bucket.return_value = mock_bucket
    mock_requests_get.return_value = MockResponse(response_data)


class URLFileToGCSTest(unittest.TestCase):
    @patch("requests.get")
    def testGetFirstResponse_HttpError_FallsBackToNextUrl(self, mock_requests_get):
        error_response = MockResponse(b"Service unavailable", status_code=503)
        valid_response = MockResponse(b'{"status": "ok"}')
        mock_requests_get.side_effect = [error_response, valid_response]

        result = url_file_to_gcs.get_first_response(
            ["https://badurl.com", "https://goodurl.com"],
            {},
            check_json=False,
        )

        self.assertIs(result, valid_response)
        self.assertEqual(mock_requests_get.call_count, 2)

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

    def testDownloadFirstUrlToGcs_JsonDestination_ValidJson(self):
        valid_json = b'{"status": "ok", "count": 42}'
        with patch("ingestion.url_file_to_gcs.storage.Client") as mock_storage_client, patch(
            "requests.get"
        ) as mock_requests_get:
            initialize_mocks(mock_storage_client, mock_requests_get, valid_json, b"old data")

            result = url_file_to_gcs.download_first_url_to_gcs(
                ["https://testurl.com/data.json"], "test_bucket", "data.json"
            )

            self.assertTrue(result)

    def testDownloadFirstUrlToGcs_JsonDestination_NonJsonHtmlError_Ignored(self):
        html_error = b"<html><body>Missing Key Redirect</body></html>"
        with patch("ingestion.url_file_to_gcs.storage.Client") as mock_storage_client, patch(
            "requests.get"
        ) as mock_requests_get:
            initialize_mocks(mock_storage_client, mock_requests_get, html_error, b"old data")

            result = url_file_to_gcs.download_first_url_to_gcs(
                ["https://testurl.com/missing_key.html"], "test_bucket", "data.json"
            )

            self.assertIsNone(result)

    def testDownloadFirstUrlToGcs_FallbackToValidSecondUrlWhenFirstIsInvalidJson(self):
        html_error = MockResponse(b"<html>404 Not Found HTML</html>")
        valid_json = MockResponse(b'{"key": "value"}')

        with patch("ingestion.url_file_to_gcs.storage.Client") as mock_storage_client, patch(
            "requests.get"
        ) as mock_requests_get:
            mock_requests_get.side_effect = [html_error, valid_json]
            mock_storage_instance = mock_storage_client.return_value
            mock_blob = Mock(**{"download_to_file.side_effect": lambda f: write_to_file(f, b"old")})
            mock_storage_instance.get_bucket.return_value = Mock(**{"blob.return_value": mock_blob})

            result = url_file_to_gcs.download_first_url_to_gcs(
                ["https://badurl.com", "https://goodurl.com"], "test_bucket", "output.json"
            )

            self.assertTrue(result)
            self.assertEqual(mock_requests_get.call_count, 2)
            mock_blob.upload_from_filename.assert_called_once()
