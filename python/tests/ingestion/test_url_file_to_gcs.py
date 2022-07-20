import unittest
from unittest.mock import Mock, patch
import google.cloud.exceptions
from ingestion import url_file_to_gcs


class MockResponse:
    def __init__(self, content):
        self.content = content

    def __enter__(self):
        pass

    def __exit__(self, exc_type, exc_val, exc_tb):
        pass

    def raise_for_status(self):
        pass


def write_to_file(file_to_write, contents):
    file_to_write.write(contents)
    file_to_write.close()


def initialize_mocks(mock_storage_client, mock_requests_get, response_data, gcs_data, blob_download_side_effect=None):
    if blob_download_side_effect is None:
        def blob_download_side_effect(test_old_file):
            write_to_file(test_old_file, gcs_data)
    mock_storage_instance = mock_storage_client.return_value
    blob_attrs = {
        'download_to_file.side_effect': blob_download_side_effect}
    mock_blob = Mock(**blob_attrs)
    bucket_attrs = {'blob.return_value': mock_blob}
    mock_bucket = Mock(**bucket_attrs)
    mock_storage_instance.get_bucket.return_value = mock_bucket
    mock_requests_get.return_value = MockResponse(response_data)


class URLFileToGCSTest(unittest.TestCase):
    def testDownloadFirstUrlToGcs_SameFile(self):
        test_data = b'fake data'
        with patch('ingestion.url_file_to_gcs.storage.Client') as mock_storage_client, \
                patch('requests.get') as mock_requests_get:
            initialize_mocks(mock_storage_client,
                             mock_requests_get, test_data, test_data)

            result = url_file_to_gcs.download_first_url_to_gcs(
                ['https://testurl.com'], 'test_bucket', 'test_destination')

            self.assertFalse(result)

    def testDownloadFirstUrlToGcs_DiffFile(self):
        with patch('ingestion.url_file_to_gcs.storage.Client') as mock_storage_client, \
                patch('requests.get') as mock_requests_get:
            initialize_mocks(mock_storage_client,
                             mock_requests_get, b'data from url', b'gcs data')

            result = url_file_to_gcs.download_first_url_to_gcs(
                ['https://testurl.com'], 'test_bucket', 'test_destination')

            self.assertTrue(result)

    def testDownloadFirstUrlToGcs_NoGCSFile(self):
        with patch('ingestion.url_file_to_gcs.storage.Client') as mock_storage_client, \
                patch('requests.get') as mock_requests_get:
            initialize_mocks(mock_storage_client,
                             mock_requests_get, b'data from url', b'gcs data',
                             blob_download_side_effect=google.cloud.exceptions.NotFound('test error'))

            result = url_file_to_gcs.download_first_url_to_gcs(
                ['https://testurl.com'], 'test_bucket', 'test_destination')

            self.assertTrue(result)
