import os
import pandas as pd

DATA_DIR = os.path.abspath("data")
FRONTEND_TMP_DIR = os.path.abspath("frontend/public/tmp")


def load_csv_as_df_from_data_dir(
    directory, filename, subdirectory="", dtype=None, skiprows=None, na_values=None, thousands=None, usecols=None
) -> pd.DataFrame:
    file_path = os.path.join(DATA_DIR, directory, subdirectory, filename)

    return pd.read_csv(
        file_path, dtype=dtype, skiprows=skiprows, na_values=na_values, usecols=usecols, thousands=thousands
    )


def write_df_as_json_to_frontend_tmp(df: pd.DataFrame, filename: str):
    file_path = os.path.join(FRONTEND_TMP_DIR, filename)
    df.to_json(f"{file_path}.json", orient="records", date_format="iso", date_unit="s")
