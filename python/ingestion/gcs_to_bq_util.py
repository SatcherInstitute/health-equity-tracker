import requests  # type: ignore
import json
import os
import pandas as pd
from google.cloud import bigquery, storage  # type: ignore
from zipfile import ZipFile
from io import BytesIO, StringIO
from typing import List
from ingestion.constants import BQ_STRING, BQ_FLOAT
import numpy as np
from ingestion.het_types import (
    TIME_VIEW_TYPE,
    COMPREHENSIVE_DEMOGRAPHIC_TYPE,
    TOPIC_CATEGORY_TYPE,
)  # pylint: disable=no-name-in-module


DATA_DIR = os.path.join(os.sep, "app", "data")


def __convert_frame_to_json(frame):
    """Returns the serialized version of the given dataframe in json."""
    # Repeated fields are not supported with bigquery.Client.load_table_from_dataframe()
    # (See https://github.com/googleapis/python-bigquery/issues/19). We have to
    # use load_table_from_json as a workaround.
    result = frame.to_json(orient="records")
    json_data = json.loads(result)
    return json_data


def __create_bq_load_job_config(frame, column_types, col_modes, overwrite):
    """
    Creates a job to write the given data frame into BigQuery.

    Parameters:
        frame: A pd.DataFrame representing the data for the job.
        column_types: Optional dict of column name to BigQuery data type.
        col_modes: Optional dict of modes for each field.
        overwrite: Boolean indicating whether we want to overwrite or append.

    Returns:
        job_config: The BigQuery write job to add the given frame to a table.
    """
    write_disposition = bigquery.WriteDisposition.WRITE_APPEND
    if overwrite:
        write_disposition = bigquery.WriteDisposition.WRITE_TRUNCATE
    job_config = bigquery.LoadJobConfig(write_disposition=write_disposition)

    if column_types is None:
        job_config.autodetect = True
    else:
        job_config.schema = get_schema(frame, column_types, col_modes)

    return job_config


def __dataframe_to_bq(frame, dataset, table_name, column_types, col_modes, project, json_data, overwrite):
    job_config = __create_bq_load_job_config(frame, column_types, col_modes, overwrite)

    client = bigquery.Client(project)
    table_id = client.dataset(dataset).table(table_name)

    load_job = client.load_table_from_json(json_data, table_id, job_config=job_config)
    load_job.result()  # Wait for table load to complete.


def add_df_to_bq_as_str_values(
    frame, dataset: str, table_name: str, column_types=None, col_modes=None, project=None, overwrite=True
):
    """Adds (either overwrites or appends) the provided DataFrame to the table
    specified by `dataset.table_name`. Converts all other values to a string.

    frame: pd.DataFrame representing the data to add.
    dataset: The BigQuery dataset to write to.
    table_name: The BigQuery table to write to.
    column_types: Optional dict of column name to BigQuery data type. If
                  present, the column names must match the columns in the
                  DataFrame. Otherwise, table schema is inferred.
    col_modes: Optional dict of modes for each field. Possible values include
               NULLABLE, REQUIRED, and REPEATED. Must also specify
               column_types to specify col_modes.
    overwrite: Whether to overwrite or append to the BigQuery table."""
    json_data = __convert_frame_to_json(frame)
    for sub in json_data:
        for key in sub:
            sub[key] = str(sub[key])

    __dataframe_to_bq(frame, dataset, table_name, column_types, col_modes, project, json_data, overwrite)


def add_df_to_bq(frame, dataset, table_name, column_types=None, col_modes=None, project=None, overwrite=True):
    """Adds (either overwrites or appends) the provided DataFrame to the table
    specified by `dataset.table_name`.

    frame: pd.DataFrame representing the data to add.
    dataset: The BigQuery dataset to write to.
    table_name: The BigQuery table to write to.
    column_types: Optional dict of column name to BigQuery data type. If
                  present, the column names must match the columns in the
                  DataFrame. Otherwise, table schema is inferred.
    col_modes: Optional dict of modes for each field. Possible values include
               NULLABLE, REQUIRED, and REPEATED. Must also specify
               column_types to specify col_modes.
    overwrite: Whether to overwrite or append to the BigQuery table."""
    json_data = __convert_frame_to_json(frame)
    __dataframe_to_bq(frame, dataset, table_name, column_types, col_modes, project, json_data, overwrite)


def get_schema(frame, column_types, col_modes):
    """Generates the BigQuery table schema from the column types and modes.

    frame: pd.DataFrame representing the data to add.
    column_types: a dict of column name to BigQuery data type."""
    if col_modes is None:
        col_modes = {}

    input_cols = column_types.keys()

    if len(input_cols) != len(frame.columns) or set(input_cols) != set(frame.columns):
        raise ValueError("Column types did not match frame columns")

    def create_field(col):
        return bigquery.SchemaField(col, column_types[col], mode=(col_modes[col] if col in col_modes else "NULLABLE"))

    return list(map(create_field, column_types.keys()))


def load_values_as_df(gcs_bucket, filename):
    """Loads data from the provided gcs_bucket and filename to a DataFrame.
    Expects the data to be in the pd 'values' format: a list of rows,
    where each row is a list of values.

    gcs_bucket: The name of the gcs bucket to read the data from
    filename: The name of the file in the gcs bucket to read from"""
    client = storage.Client()
    bucket = client.get_bucket(gcs_bucket)
    blob = bucket.blob(filename)
    return load_values_blob_as_df(blob)


def values_json_to_df(values_json, dtype=None) -> pd.DataFrame:
    """Loads data from the provided json file (or file name string) to a DataFrame.
    NOTE: Passing json as a literal string like we did in tests is no longer directly supported.
    NOTE: To test without needing a real json file, wrap the json string in StringIO()
    """

    frame = pd.DataFrame(pd.read_json(values_json, orient="values", dtype=dtype))
    new_column_names = dict(frame.iloc[0])
    frame.rename(columns=new_column_names, inplace=True)  # pylint: disable=E1101
    frame.drop([0], inplace=True)  # pylint: disable=E1101
    # Fill None values with np.nan TODO: remove after updating to pandas 3
    with pd.option_context("future.no_silent_downcasting", True):
        frame = frame.fillna(np.nan)  # pylint: disable=E1101

    return frame


def load_values_blob_as_df(blob):
    """Loads data from the provided GCS blob to a DataFrame.
    Expects the data to be in the pd 'values' format: a list of rows,
    where each row is a list of values.

    blob: google.cloud.storage.blob.Blob object"""
    json_string = blob.download_as_string()
    json_string = json_string.decode("utf-8")
    return values_json_to_df(StringIO(json_string))


def load_csv_as_df(gcs_bucket, filename, dtype=None, chunksize=None, parse_dates=False, thousands=None, encoding=None):
    """Loads csv data from the provided gcs_bucket and filename to a DataFrame.
    Expects the data to be in csv format, with the first row as the column
    names.

    gcs_bucket: The name of the gcs bucket to read the data from
    filename: The name of the file in the gcs bucket to read from
    dtype: An optional dictionary of column names to column types, as
           specified by the pd API. Not all column types need to be
           specified; column type is auto-detected. This is useful, for
           example, to force integer-like ids to be treated as strings
    parse_dates: Column(s) that should be parsed and interpreted as dates.
    thousands: str to be used as a thousands separator for parsing numbers
    encoding: Encoding of the file"""
    client = storage.Client()
    bucket = client.get_bucket(gcs_bucket)
    blob = bucket.blob(filename)
    local_path = local_file_path(filename)
    blob.download_to_filename(local_path)
    frame = pd.read_csv(
        local_path, dtype=dtype, chunksize=chunksize, parse_dates=parse_dates, thousands=thousands, encoding=encoding
    )

    # Warning: os.remove() will remove the directory entry but will not release
    # the file's storage until the file is no longer being used by |frame|.
    # Double warning: This will cause an exception on Windows. See
    # https://docs.python.org/3/library/os.html#os.remove for details.
    os.remove(local_path)
    return frame


def load_json_as_df(gcs_bucket, filename, dtype=None):
    """Loads json data from the provided gcs_bucket and filename to a DataFrame.
    Expects the data to be in csv format, with the first row as the column
    names.

    gcs_bucket: The name of the gcs bucket to read the data from
    filename: The name of the file in the gcs bucket to read from
    dtype: An optional dictionary of column names to column types, as
           specified by the pd API. Not all column types need to be
           specified; column type is auto-detected. This is useful, for
           example, to force integer-like ids to be treated as strings"""
    client = storage.Client()
    bucket = client.get_bucket(gcs_bucket)
    blob = bucket.blob(filename)
    local_path = local_file_path(filename)
    blob.download_to_filename(local_path)
    frame = pd.read_json(local_path, dtype=dtype)

    # Warning: os.remove() will remove the directory entry but will not release
    # the file's storage until the file is no longer being used by |frame|.
    # Double warning: This will cause an exception on Windows. See
    # https://docs.python.org/3/library/os.html#os.remove for details.
    os.remove(local_path)
    return frame


def load_csv_as_df_from_web(url, dtype=None, params=None, encoding=None) -> pd.DataFrame:
    """Loads csv data from the provided url to a DataFrame.
    Expects the data to be in csv format, with the first row as the column
    names.

    url: url to download the csv file from"""

    url = requests.Request("GET", url, params=params).prepare().url
    return pd.read_csv(url, dtype=dtype, encoding=encoding)


def load_xlsx_as_df_from_data_dir(
    directory: str, filename: str, sheet_name: str, dtype=None, na_values=None, header=None, usecols=None
) -> pd.DataFrame:
    """Loads a single sheet of a .xlsx file within target
     directory and outputs as a pandas dataframe

    directory: string dir name to load from
    filename: string file name to load from
    sheet_name: string sheet name to load from
    dtype: optional dict of column types
    na_values: optional list of strings to recognize as NA/NaN
    header: optional row number to use as the column names
    usecols: optional lambda or list of column names to load (skip the rest)
    """

    file_path = os.path.join(DATA_DIR, directory, filename)

    sheet_df = pd.read_excel(
        file_path, sheet_name=sheet_name, dtype=dtype, na_values=na_values, header=header, usecols=usecols
    )
    return sheet_df


def load_csv_as_df_from_data_dir(
    directory, filename, subdirectory="", dtype=None, skiprows=None, na_values=None, thousands=None, usecols=None
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

    file_path = os.path.join(DATA_DIR, directory, subdirectory, filename)

    return pd.read_csv(
        file_path, dtype=dtype, skiprows=skiprows, na_values=na_values, usecols=usecols, thousands=thousands
    )


def load_tsv_as_df_from_data_dir(
    directory,
    filename,
    subdirectory="",
    dtype=None,
    skiprows=None,
    na_values=None,
    thousands=None,
    usecols=None,
    delimiter="\t",
    skipinitialspace=True,
) -> pd.DataFrame:
    """Loads tsv data from /data/{directory}/{filename} into a DataFrame.
       Expects the data to be in tsv format, with the first row as the column
       names.

    directory: directory within data to load from
    filename: file to load the tsv file from
    subdirectory: combined directory and filename path
    skiprows: how many rows to skip when reading tsv
    na_values: additional strings to recognize as NA/NaN
    thousands: reads commas in the tsv file as a thousand place indicator
    usecols: list of columns to use or callable function against column names
    (using this lambda results in much faster parsing time and lower memory usage)
    """

    file_path = os.path.join(DATA_DIR, directory, subdirectory, filename)

    return pd.read_csv(
        file_path,
        dtype=dtype,
        skiprows=skiprows,
        na_values=na_values,
        usecols=usecols,
        thousands=thousands,
        delimiter=delimiter,
        skipinitialspace=skipinitialspace,
    )


def load_json_as_df_from_data_dir(directory, filename, dtype=None) -> pd.DataFrame:
    """Loads json data from /data/{directory}/{filename} into a DataFrame.
       Expects the data to be in json format, with the first row as the column
       names.

    directory: directory within data to load from
    filename: file to load the json file from"""
    file_path = os.path.join(DATA_DIR, directory, filename)

    return pd.read_json(file_path, dtype=dtype)


def load_json_as_df_from_data_dir_based_on_key_list(directory, filename, key_list) -> pd.DataFrame:
    """Loads json data from /data/{directory}/{filename} into a DataFrame.
       Expects the data to be in json format, stored under the given list of nested keys

    directory: directory within data to load from
    filename: file to load the json file from
    key_list: List of keys to represent the nested keys needed to get to the data in the json

    For Example, given this JSON string:
    grandparent: {
        parent: {
            child: {
                grandchildren: [
                    {name: "Joe"},
                    {name: "Sally"},
                    {name: "Steve"}
                ]
            }
        }
    }

    To get a dataframe of the grandchildren by name, you would use the key_list
    ["grandparent", "parent", "children", "grandchildren"]

    """

    file_path = os.path.join(DATA_DIR, directory, filename)
    with open(file_path, "r", encoding="utf-8") as data_file:
        data = json.loads(data_file.read())
    df = pd.json_normalize(data, key_list)
    return df


def load_json_as_df_from_web(url, dtype=None, params=None) -> pd.DataFrame:
    """Loads json data from the web underneath a given key into a dataframe

    url: url to download the json from
    """
    url = requests.Request("GET", url, params=params).prepare().url
    return pd.read_json(url, dtype=dtype)


def load_json_as_df_from_web_based_on_key(url, key, dtype=None) -> pd.DataFrame:
    """Loads json data from the web underneath a given key into a dataframe

    url: url to download the json from
    key: key in the json in which all data underneath will be loaded into the dataframe"""
    r = requests.get(url, timeout=120)
    jsn = json.loads(r.text)
    return pd.DataFrame(jsn[key], dtype=dtype)


def load_public_dataset_from_bigquery_as_df(dataset, table_name, dtype=None) -> pd.DataFrame:
    """Loads data from a public big query table into a dataframe.
    Need this as a separate function because of the need for a
    different way to generate the table_id.

    dataset: The BigQuery dataset to write to.
    table_name: The BigQuery table to write to."""
    client = bigquery.Client()
    table_id = f"bigquery-public-data.{dataset}.{table_name}"

    return client.list_rows(table_id).to_dataframe(dtypes=dtype)


def load_df_from_bigquery(dataset, table_name, dtype=None) -> pd.DataFrame:
    """Loads data from a big query table into a dataframe.

    dataset: The BigQuery dataset to write to.
    table_name: The BigQuery table to write to."""
    client = bigquery.Client()
    table_id = client.dataset(dataset).table(table_name)
    table = client.get_table(table_id)

    return client.list_rows(table).to_dataframe(dtypes=dtype)


def load_values_as_json(gcs_bucket, filename):
    """Loads data from the provided gcs_bucket and filename.
    Expects the data to be in the pd 'values' format: a list of rows,
    where each row is a list of values.

    gcs_bucket: The name of the gcs bucket to read the data from
    filename: The name of the file in the gcs bucket to read from"""
    client = storage.Client()
    bucket = client.get_bucket(gcs_bucket)
    blob = bucket.blob(filename)
    return json.loads(blob.download_as_bytes().decode("utf-8"))


def local_file_path(filename):
    return f"/tmp/{filename}"


def list_bucket_files(bucket_name: str) -> list:
    """Returns a list of file names contained in the provided bucket.

    bucket_name: The name of the gcs bucket containing files"""
    gcs_client = storage.Client()
    bucket = gcs_client.get_bucket(bucket_name)
    blobs = bucket.list_blobs()

    return list(map(lambda blob: blob.name, blobs))


def fetch_zip_as_files(url: str) -> ZipFile:
    """
    Fetches a .zip files from the given url and returns a zip object
    with the listed internal files.
    """
    response = requests.get(url, timeout=120)
    response.raise_for_status()  # Ensure we notice bad responses
    zip_file = BytesIO(response.content)
    return ZipFile(zip_file)


def fetch_json_from_web(url):
    """
    fetches json from a URL
    """
    r = requests.get(url, timeout=120)
    return json.loads(r.text)


def get_bq_column_types(df, float_cols: List[str]):
    """Generates the column_types dict needed for each data source's add_df_to_bq()
    Parameters:
        df: dataframe to be sent to BQ
        float_cols: list of string column names for the columns that
            should be BigQuery FLOATs. All other columns will be sent
            as BigQuery STRINGs.
    Returns:
        dict of pandas column names to specific BiqQuery column types
         like {"something_pct_share": "FLOAT"}
    """

    column_types = {c: BQ_STRING for c in df.columns}
    for col in float_cols:
        column_types[col] = BQ_FLOAT

    return column_types


def make_bq_table_id(
    demographic: COMPREHENSIVE_DEMOGRAPHIC_TYPE,
    geographic,
    time_view: TIME_VIEW_TYPE,
    category_prefix: TOPIC_CATEGORY_TYPE | None = None,
    has_age_adjust_suffix: bool = False,
):

    id = f"{demographic}_{geographic}_{time_view}"
    if category_prefix:
        id = f"{category_prefix}_{id}"

    if has_age_adjust_suffix:
        id = f"{id}-with_age_adjust"

    return id
