import gzip
import json
import threading
import time

import cachetools

from data_server import gcs_utils


class DatasetCache:
    """DatasetCache manages and stores datasets accessed through GCS.
    DatasetCache is a thin, thread-safe wrapper around cachetools.TTLCache."""

    def __init__(self, max_cache_size=8, cache_ttl=2 * 3600):
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

        get_dataset_start_time = time.time()
        with self.cache_lock:
            item = self.cache.get(table_id)
            if item is not None:
                print(
                    f"Time to retrieve dataset from cache {(time.time() - get_dataset_start_time) * 1000}ms"
                )
                return item

        # Release the lock while performing IO.
        blob_str = gcs_utils.download_blob_as_bytes(gcs_bucket, table_id)

        def generate_response(data: bytes):
            next_row = b"["
            for row in blob_str.splitlines():
                yield next_row
                next_row = row + b","
            yield next_row.rstrip(b",") + b"]"

        resp_data = b""
        gen_dset_start_time = time.time()
        resp = generate_response(blob_str)
        for d in resp:
            resp_data += d

        print(f"Time to generate resp {(time.time() - gen_dset_start_time) * 1000}ms")

        encode_start_time = time.time()
        resp_data = gzip.compress(resp_data, 5)
        print(f"Time to Encode: {(time.time() - encode_start_time) * 1000}ms")
        # If this has been updated since we last checked, it's still okay to
        # overwrite since it will only affect freshness.
        with self.cache_lock:
            self.cache[table_id] = resp_data
            print(
                f"Time to retrieve dataset from gcs {(time.time() - get_dataset_start_time) * 1000}ms"
            )
            return resp_data
