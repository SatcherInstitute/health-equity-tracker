import os
import json

import pandas as pd

# Current working directory.
THIS_DIR = os.path.dirname(os.path.abspath(__file__))
TEST_DIR = os.path.join(THIS_DIR, os.pardir, "data", "utils")
REAL_DATA_DIR = os.path.abspath("./data")


def get_acs_metadata_as_json(year: int):
    metadata_file = "acs_metadata_2021_and_earlier.json" if year < 2022 else "acs_metadata_2022_and_later.json"
    with open(os.path.join(TEST_DIR, metadata_file)) as f:
        return json.load(f)


def _load_csv_as_df_from_real_data_dir(*args, **kwargs) -> pd.DataFrame:
    """Testing utility function; allows tests to read real input from data/ folder.
    Used as a mock, but only because the loading file structure is different in test vs. via Docker.
    Call the wrapper below for slow data sets to enable sampling and significant test speed boost.
    """
    directory, filename = args
    print("ACTUALLY LOADING FROM /data", filename)
    dtype = kwargs.get("dtype", None)
    na_values = kwargs.get("na_values", None)
    subdirectory = kwargs.get("subdirectory", "")
    usecols = kwargs.get("usecols", None)
    delimiter = kwargs.get("delimiter", None)
    skipinitialspace = kwargs.get("skipinitialspace", None)
    create_sample = kwargs.get("create_sample", False)

    file_path = os.path.join(REAL_DATA_DIR, directory, subdirectory, filename)

    df = pd.read_csv(
        file_path,
        na_values=na_values,
        dtype=dtype,
        usecols=usecols,
        delimiter=delimiter,
        skipinitialspace=skipinitialspace,
    )

    if create_sample:
        n = len(df) // 50  # Calculate step size to get ~50 rows
        sample_df = df.iloc[::n][:50]  # Take every nth row, limit to 50
        return sample_df

    return df


def _load_sample_csv_as_df_from_real_data_dir(*args, **kwargs) -> pd.DataFrame:
    """Creates a sample of the full dataset loaded from from data/ folder.
    Useful in county, historical, or other slow data sources."""
    return _load_csv_as_df_from_real_data_dir(*args, create_sample=True, **kwargs)


def _load_xlsx_as_df_from_real_data_dir(*args, **kwargs) -> pd.DataFrame:
    """Testing utility function; allows tests to read real input from data/ folder."""
    directory, filename, sheetname = args
    print("ACTUALLY LOADING FROM /data", filename, sheetname)
    use_cols = kwargs["usecols"]
    dtype = kwargs["dtype"]
    header = kwargs["header"]

    df = pd.read_excel(
        os.path.join(REAL_DATA_DIR, directory, filename),
        sheet_name=sheetname,
        header=header,
        usecols=use_cols,
        dtype=dtype,
    )
    return df
