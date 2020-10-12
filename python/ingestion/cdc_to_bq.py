from .gcs_to_bq_util import load_csv_as_dataframe, append_dataframe_to_bq


def write_covid_deaths_to_bq(dataset, table_name, gcs_bucket, filename):
    """Writes cdc covid death data to BigQuery from bucket

       dataset: The BigQuery dataset to write to
       table_name: The name of the biquery table to write to
       gcs_bucket: The name of the gcs bucket to read the data from
       filename: The name of the file in the gcs bucket to read from"""
    frame = load_csv_as_dataframe(gcs_bucket, filename)

    # Replace spaces and dashes with underscores in column name and make all characters
    # in column names lower case.
    frame.rename(columns=lambda col: col.replace(' ', '_'), inplace=True)
    frame.rename(columns=lambda col: col.replace(
        '-', '_').lower(), inplace=True)

    append_dataframe_to_bq(frame, dataset, table_name)
