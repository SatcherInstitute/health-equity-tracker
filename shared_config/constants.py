"""
Shared constants used across different services.
"""

# Cache TTL values
DATASET_CACHE_TTL_SECONDS = 2 * 3600  # 2 hours in seconds

# HTTP Cache-Control headers
DATASET_CACHE_CONTROL = f"public, max-age={DATASET_CACHE_TTL_SECONDS}"
