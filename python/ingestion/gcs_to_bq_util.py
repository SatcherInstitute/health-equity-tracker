from datetime import datetime
from datetime import timezone
import json
import os

import pandas
from google.cloud import bigquery, storage


def __convert_frame_to_json(frame):
    """Returns the serialized version of the given dataframe in json."""
    # Repeated fields are not supported with bigquery.Client.load_table_from_dataframe()
    # (See https://github.com/googleapis/python-bigquery/issues/19). We have to
    # use load_table_from_json as a workaround.
    result = frame.to_json(orient='records')
    json_data = json.loads(result)
    return json_data


def __create_bq_load_job_config(frame, column_types, col_modes, overwrite):
    """
    Creates a job to write the given data frame into BigQuery.

    Paramenters:
        frame: A pandas.DataFrame representing the data for the job.
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


def __add_ingestion_ts(frame, column_types):
    """Adds a timestamp for when the given DataFrame was ingested."""
    # Formatting to a string helps BQ autodetection.
    frame['ingestion_ts'] = datetime.now(
        timezone.utc).strftime("%Y-%m-%d %H:%M:%S.%f %Z")
    if column_types is not None:
        column_types['ingestion_ts'] = 'TIMESTAMP'


def __dataframe_to_bq(frame, dataset, table_name, column_types, col_modes,
                      project, json_data, overwrite):
    job_config = __create_bq_load_job_config(
        frame, column_types, col_modes, overwrite)

    client = bigquery.Client(project)
    table_id = client.dataset(dataset).table(table_name)

    load_job = client.load_table_from_json(
        json_data,	table_id, job_config=job_config)
    load_job.result()  # Wait for table load to complete.


def add_dataframe_to_bq_as_str_values(frame, dataset, table_name,
                                      column_types=None, col_modes=None,
                                      project=None, overwrite=True):
    """Adds (either overwrites or appends) the provided DataFrame to the table
       specified by `dataset.table_name`. Automatically adds an ingestion time
       column and coverts all other values to a string.

       frame: pandas.DataFrame representing the data to add.
       dataset: The BigQuery dataset to write to.
       table_name: The BigQuery table to write to.
       column_types: Optional dict of column name to BigQuery data type. If
                     present, the column names must match the columns in the
                     DataFrame. Otherwise, table schema is inferred.
       col_modes: Optional dict of modes for each field. Possible values include
                  NULLABLE, REQUIRED, and REPEATED. Must also specify
                  column_types to specify col_modes.
       overwrite: Whether to overwrite or append to the BigQuery table."""
    __add_ingestion_ts(frame, column_types)
    json_data = __convert_frame_to_json(frame)
    for sub in json_data:
        for key in sub:
            sub[key] = str(sub[key])

    __dataframe_to_bq(frame, dataset, table_name, column_types, col_modes,
                      project, json_data, overwrite)


def add_dataframe_to_bq(frame, dataset, table_name, column_types=None,
                        col_modes=None, project=None, overwrite=True):
    """Adds (either overwrites or appends) the provided DataFrame to the table
       specified by `dataset.table_name`. Automatically adds an ingestion time
       column.

       frame: pandas.DataFrame representing the data to add.
       dataset: The BigQuery dataset to write to.
       table_name: The BigQuery table to write to.
       column_types: Optional dict of column name to BigQuery data type. If
                     present, the column names must match the columns in the
                     DataFrame. Otherwise, table schema is inferred.
       col_modes: Optional dict of modes for each field. Possible values include
                  NULLABLE, REQUIRED, and REPEATED. Must also specify
                  column_types to specify col_modes.
       overwrite: Whether to overwrite or append to the BigQuery table."""
    __add_ingestion_ts(frame, column_types)
    json_data = __convert_frame_to_json(frame)
    __dataframe_to_bq(frame, dataset, table_name, column_types, col_modes,
                      project, json_data, overwrite)


def get_schema(frame, column_types, col_modes):
    """Generates the BigQuery table schema from the column types and modes.

       frame: pandas.DataFrame representing the data to add.
       column_types: a dict of column name to BigQuery data type."""
    if col_modes is None:
        col_modes = {}

    input_cols = column_types.keys()
    if (len(input_cols) != len(frame.columns)
            or set(input_cols) != set(frame.columns)):
        raise Exception('Column types did not match frame columns')

    def create_field(col):
        return bigquery.SchemaField(
            col, column_types[col],
            mode=(col_modes[col] if col in col_modes else 'NULLABLE'))
    return list(map(create_field, column_types.keys()))


def load_values_as_dataframe(gcs_bucket, filename):
    """Loads data from the provided gcs_bucket and filename to a DataFrame.
       Expects the data to be in the pandas 'values' format: a list of rows,
       where each row is a list of values.

       gcs_bucket: The name of the gcs bucket to read the data from
       filename: The name of the file in the gcs bucket to read from"""
    client = storage.Client()
    bucket = client.get_bucket(gcs_bucket)
    blob = bucket.blob(filename)
    return load_values_blob_as_dataframe(blob)


def values_json_to_dataframe(json_string):
    frame = pandas.read_json(json_string, orient='values')
    frame.rename(columns=frame.iloc[0], inplace=True)
    frame.drop([0], inplace=True)
    return frame


def load_values_blob_as_dataframe(blob):
    """Loads data from the provided GCS blob to a DataFrame.
       Expects the data to be in the pandas 'values' format: a list of rows,
       where each row is a list of values.

       blob: google.cloud.storage.blob.Blob object"""
    json_string = blob.download_as_string()
    return values_json_to_dataframe(json_string)


def load_csv_as_dataframe(gcs_bucket, filename, dtype=None, chunksize=None,
                          parse_dates=False, thousands=None):
    """Loads csv data from the provided gcs_bucket and filename to a DataFrame.
       Expects the data to be in csv format, with the first row as the column
       names.

       gcs_bucket: The name of the gcs bucket to read the data from
       filename: The name of the file in the gcs bucket to read from
       dtype: An optional dictionary of column names to column types, as
              specified by the pandas API. Not all column types need to be
              specified; column type is auto-detected. This is useful, for
              example, to force integer-like ids to be treated as strings
       parse_dates: Column(s) that should be parsed and interpreted as dates.
       thousands: str to be used as a thousands separator for parsing numbers"""
    client = storage.Client()
    bucket = client.get_bucket(gcs_bucket)
    blob = bucket.blob(filename)
    local_path = local_file_path(filename)
    blob.download_to_filename(local_path)
    frame = pandas.read_csv(local_path, dtype=dtype, chunksize=chunksize,
                            parse_dates=parse_dates, thousands=thousands)

    # Warning: os.remove() will remove the directory entry but will not release
    # the file's storage until the file is no longer being used by |frame|.
    # Double warning: This will cause an exception on Windows. See
    # https://docs.python.org/3/library/os.html#os.remove for details.
    os.remove(local_path)
    return frame


def load_csv_as_dataframe_from_web(url, dtype=None):
    """Loads csv data from the provided url to a DataFrame.
       Expects the data to be in csv format, with the first row as the column
       names.

       url: url to download the csv file from"""
    return pandas.read_csv(url, dtype=dtype)


def load_values_as_json(gcs_bucket, filename):
    """Loads data from the provided gcs_bucket and filename.
       Expects the data to be in the pandas 'values' format: a list of rows,
       where each row is a list of values.

       gcs_bucket: The name of the gcs bucket to read the data from
       filename: The name of the file in the gcs bucket to read from"""
    client = storage.Client()
    bucket = client.get_bucket(gcs_bucket)
    blob = bucket.blob(filename)
    return json.loads(blob.download_as_bytes().decode('utf-8'))


def local_file_path(filename):
    return '/tmp/{}'.format(filename)


def list_bucket_files(bucket_name: str) -> list:
    """Returns a list of file names contained in the provided bucket.

       bucket_name: The name of the gcs bucket containing files"""
    gcs_client = storage.Client()
    bucket = gcs_client.get_bucket(bucket_name)
    blobs = bucket.list_blobs()

    return list(map(lambda blob: blob.name, blobs))
