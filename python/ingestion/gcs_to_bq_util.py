from datetime import datetime
from datetime import timezone
import json
import os

import pandas
from google.cloud import bigquery, storage


def append_dataframe_to_bq(
        frame, dataset, table_name, column_types=None, col_modes=None):
    """Appends the provided DataFrame to the table specified by
       `dataset.table_name`. Automatically adds an ingestion time column.

       frame: pandas.DataFrame representing the data to append.
       dataset: The BigQuery dataset to write to.
       table_name: The BigQuery table to write to.
       column_types: Optional dict of column name to BigQuery data type. If present,
                     the column names must match the columns in the DataFrame.
                     Otherwise, table schema is inferred.
       col_modes: Optional dict of modes for each field. Possible values include
                  NULLABLE, REQUIRED, and REPEATED. Must also specify column_types to
                  specify col_modes."""
    job_config = bigquery.LoadJobConfig(
        # Always append, so we can keep the history.
        write_disposition=bigquery.WriteDisposition.WRITE_APPEND
    )
    if column_types is None:
        job_config.autodetect = True
    else:
        job_config.schema = get_schema(frame, column_types, col_modes)

    # Add an upload timestamp. Formatting to a string helps BQ autodetection.
    frame['ingestion_time'] = datetime.now(
        timezone.utc).strftime("%Y-%m-%d %H:%M:%S.%f %Z")

    client = bigquery.Client()
    table_id = client.dataset(dataset).table(table_name)
    # Repeated fields are not supported with bigquery.Client.load_table_from_dataframe()
    # (See https://github.com/googleapis/python-bigquery/issues/19). We have to use
    # load_table_from_json as a workaround.
    result = frame.to_json(orient='records')
    json_data = json.loads(result)
    load_job = client.load_table_from_json(
        json_data,	table_id, job_config=job_config)
    load_job.result()  # Wait for table load to complete.


def get_schema(frame, column_types, col_modes):
    """Generates the BigQuery table schema from the column types and modes.

       frame: pandas.DataFrame representing the data to append.
       column_types: a dict of column name to BigQuery data type."""
    if col_modes is None:
        col_modes = {}

    input_cols = column_types.keys()
    if (len(input_cols) != len(frame.columns)
            or set(input_cols) != set(frame.columns)):
        raise Exception('Column types did not match frame columns')

    columns = column_types.copy()
    columns['ingestion_time'] = 'TIMESTAMP'

    def create_field(col):
        return bigquery.SchemaField(
            col, columns[col],
            mode=(col_modes[col] if col in col_modes else 'NULLABLE'))
    return list(map(create_field, columns.keys()))


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


def load_values_blob_as_dataframe(blob):
    """Loads data from the provided GCS blob to a DataFrame.
       Expects the data to be in the pandas 'values' format: a list of rows,
       where each row is a list of values.

       blob: google.cloud.storage.blob.Blob object"""
    json_string = blob.download_as_string()
    frame = pandas.read_json(json_string, orient='values')
    frame.rename(columns=frame.iloc[0], inplace=True)
    frame.drop([0], inplace=True)
    return frame


def load_csv_as_dataframe(gcs_bucket, filename, dtype=None):
    """Loads csv data from the provided gcs_bucket and filename to a DataFrame.
       Expects the data to be in csv format, with the first row as the column
       names.

       gcs_bucket: The name of the gcs bucket to read the data from
       filename: The name of the file in the gcs bucket to read from
       dtype: An optional dictionary of column names to column types, as
              specified by the pandas API. Not all column types need to be
              specified; column type is auto-detected. This is useful, for
              example, to force integer-like ids to be treated as strings"""
    client = storage.Client()
    bucket = client.get_bucket(gcs_bucket)
    blob = bucket.blob(filename)
    local_path = local_file_path(filename)
    blob.download_to_filename(local_path)
    frame = pandas.read_csv(local_path, dtype=dtype)

    os.remove(local_path)
    return frame


def local_file_path(filename):
    return '/tmp/{}'.format(filename)
