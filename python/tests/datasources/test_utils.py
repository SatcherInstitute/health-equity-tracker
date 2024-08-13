import os
import json

import pandas as pd

# Current working directory.
THIS_DIR = os.path.dirname(os.path.abspath(__file__))
TEST_DIR = os.path.join(THIS_DIR, os.pardir, "data", "utils")
REAL_DATA_DIR = os.path.abspath("./data")


def get_acs_metadata_as_json(year: int):
    metadata_file = 'acs_metadata_2021_and_earlier.json' if year < 2022 else 'acs_metadata_2022_and_later.json'
    with open(os.path.join(TEST_DIR, metadata_file)) as f:
        return json.load(f)


def _load_csv_as_df_from_real_data_dir(*args, **kwargs):
    """Testing utility function; allows tests to read real input from data/ folder.
    Used as a mock, but only because the loading file structure is different in test vs. via Docker
    """
    directory, filename = args
    print("ACTUALLY LOADING FROM /data", filename)
    dtype = kwargs['dtype']
    na_values = kwargs['na_values']
    subdirectory = kwargs['subdirectory']
    usecols = kwargs['usecols']
    file_path = os.path.join(REAL_DATA_DIR, directory, subdirectory, filename)

    df = pd.read_csv(file_path, na_values=na_values, dtype=dtype, usecols=usecols)
    return df
