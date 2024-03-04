import os
import json

# Current working directory.
THIS_DIR = os.path.dirname(os.path.abspath(__file__))
TEST_DIR = os.path.join(THIS_DIR, os.pardir, "data", "utils")


def get_acs_metadata_as_json(year: int):
    metadata_file = 'acs_metadata_2021_and_earlier.json' if year < 2022 else 'acs_metadata_2022_and_later.json'
    with open(os.path.join(TEST_DIR, metadata_file)) as f:
        return json.load(f)
