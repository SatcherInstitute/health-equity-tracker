import threading
import cachetools
from data_server import gcs_utils


class DatasetCache:
    """DatasetCache manages and stores datasets accessed through GCS.
    DatasetCache is a thin, thread-safe wrapper around cachetools.TTLCache."""

    def __init__(self, max_cache_size=8, cache_ttl=gcs_utils.TTL_SECONDS):
        """max_cache_size: Max number of cache elements. Default 8.
        cache_ttl: TTL per object in seconds. Default 2 hours."""
        self.cache = cachetools.TTLCache(maxsize=max_cache_size, ttl=cache_ttl)
        self.cache_lock = threading.Lock()

    def clear(self):
        """Clears entries from the cache. Mostly useful for tests."""
        with self.cache_lock:
            self.cache.clear()

    def getDataset(self, gcs_bucket: str, table_id: str):
        """Returns the given dataset identified by table_id as bytes.

        getDataset will return the dataset from memory if it exists in the
        cache. Otherwise, it will request the file from GCS and update the
        cache on success.

        gcs_bucket: Name of GCS bucket where the dataset is stored.
        table_id: Name of the data set file to access.

        Returns: Bytes object containing the dataset if successful. Throws
        NotFoundError on failure."""
        with self.cache_lock:
            item = self.cache.get(table_id)
            if item is not None:
                return item

        # Release the lock while performing IO.
        blob_str = gcs_utils.download_blob_as_bytes(gcs_bucket, table_id)

        # If this has been updated since we last checked, it's still okay to
        # overwrite since it will only affect freshness.
        with self.cache_lock:
            self.cache[table_id] = blob_str
            return blob_str
