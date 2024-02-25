import os
import pandas as pd

REAL_DATA_DIR = os.path.abspath('data')


def load_csv_as_df_from_data_dir(
    directory, filename, subdirectory='', dtype=None, skiprows=None, na_values=None, thousands=None, usecols=None
) -> pd.DataFrame:
    """Loads csv data from /data/{directory}/{filename} into a DataFrame.
       Expects the data to be in csv format, with the first row as the column
       names.

    directory: directory within data to load from
    filename: file to load the csv file from
    subdirectory: combined directory and filename path
    skiprows: how many rows to skip when reading csv
    na_values: additional strings to recognize as NA/NaN
    thousands: reads commas in the csv file as a thousand place indicator
    usecols: list of columns to use or callable function against column names
    (using this lambda results in much faster parsing time and lower memory usage)
    """

    file_path = os.path.join(REAL_DATA_DIR, directory, subdirectory, filename)

    return pd.read_csv(
        file_path, dtype=dtype, skiprows=skiprows, na_values=na_values, usecols=usecols, thousands=thousands
    )
