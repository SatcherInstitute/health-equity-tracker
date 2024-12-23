# pylint: disable=unused-argument
from unittest import mock
from unittest.mock import call
from textwrap import dedent
from data_server.dataset_cache import DatasetCache


test_data = dedent(
    """
{"label1":"value1","label2":["value2a","value2b","value2c"],"label3":"value3"}
{"label1":"value2","label2":["value3a","value2b","value2c"],"label3":"value6"}
{"label1":"value3","label2":["value4a","value2b","value2c"],"label3":"value9"}
{"label1":"value4","label2":["value5a","value2b","value2c"],"label3":"value12"}
{"label1":"value5","label2":["value6a","value2b","value2c"],"label3":"value15"}
{"label1":"value6","label2":["value7a","value2b","value2c"],"label3":"value18"}
"""
).strip()

test_data2 = dedent(
    """
    {"county_geoid":"78020","neighbor_geoids":["78020","78030"]}
    {"county_geoid":"78030","neighbor_geoids":["78020","78030"]}
    {"county_geoid":"78030","neighbor_geoids":["78020","78030"]}
    {"county_geoid":"78030","neighbor_geoids":["78020","78030"]}
    {"county_geoid":"78030","neighbor_geoids":["78020","78030"]}
    {"county_geoid":"78030","neighbor_geoids":["78020","78030"]}
"""
).strip()


def get_test_data(gcs_bucket: str, filename: str):
    """Returns the contents of filename as a bytes object. Meant to be used to
    patch gcs_utils.download_blob_as_bytes."""
    if filename == "test_data":
        return test_data
    elif filename == "test_data2":
        return test_data2
    return ""


@mock.patch("data_server.gcs_utils.download_blob_as_bytes", side_effect=get_test_data)
def testGetDataset(mock_func: mock.MagicMock):
    cache = DatasetCache()
    data = cache.getDataset("test_bucket", "test_data")
    mock_func.assert_called_once_with("test_bucket", "test_data")
    assert data == test_data.strip()


@mock.patch("data_server.gcs_utils.download_blob_as_bytes", side_effect=get_test_data)
def testGetDataset_FromCache(mock_func: mock.MagicMock):
    # Make the first request, which should incur an API call.
    cache = DatasetCache()
    cache.getDataset("test_bucket", "test_data")
    mock_func.assert_called_once_with("test_bucket", "test_data")

    # Make the second request, which should be served from the cache.
    cache.getDataset("test_bucket", "test_data")
    mock_func.assert_called_once()


@mock.patch("data_server.gcs_utils.download_blob_as_bytes", side_effect=get_test_data)
def testGetDataset_CacheEviction(mock_func: mock.MagicMock):
    cache = DatasetCache(max_cache_size=1)

    data = cache.getDataset("test_bucket", "test_data")
    assert data == test_data

    # Make a second call which doesn't make an API call.
    data = cache.getDataset("test_bucket", "test_data")
    assert data == test_data

    # Now request a file that is not in the cache. It should replace the
    # existing data.
    data = cache.getDataset("test_bucket", "test_data2")
    assert data == test_data2

    data = cache.getDataset("test_bucket", "test_data2")
    assert data == test_data2

    data = cache.getDataset("test_bucket", "test_data")
    assert data == test_data

    assert mock_func.call_count == 3
    mock_func.assert_has_calls(
        [call("test_bucket", "test_data"), call("test_bucket", "test_data2"), call("test_bucket", "test_data")]
    )


@mock.patch("data_server.gcs_utils.download_blob_as_bytes", side_effect=get_test_data)
def testGetDataset_MultipleEntries(mock_func: mock.MagicMock):
    cache = DatasetCache()
    data = cache.getDataset("test_bucket", "test_data")
    assert data == test_data

    data = cache.getDataset("test_bucket", "test_data2")
    assert data == test_data2

    data = cache.getDataset("test_bucket", "test_data")
    assert data == test_data

    assert mock_func.call_count == 2
    mock_func.assert_has_calls([call("test_bucket", "test_data"), call("test_bucket", "test_data2")])
