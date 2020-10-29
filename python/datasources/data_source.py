from abc import ABC
from ingestion import url_file_to_gcs, gcs_to_bq_util


# Abstract base class for all data sources ingested by the Health Equity Tracker.
# This also includes default implementations for each of the ingestion methods.
class DataSource(ABC):
    @staticmethod
    def get_id():
        """Returns the data source's unique id. """
        pass

    @staticmethod
    def get_table_name():
        """Returns the BigQuery table name where the data source's data will
        stored. """
        pass

    def upload_to_gcs(self, url, gcs_bucket, filename):
        """Attempts to download a file from a url and upload as a
        blob to the given GCS bucket.

        url: The URL of the file to download.
        gcs_bucket: Name of the GCS bucket to upload to (without gs://).
        filename: What to name the downloaded file in GCS.
            Include the file extension."""
        url_file_to_gcs.url_file_to_gcs(url, None, gcs_bucket, filename)

    def write_to_bq(self, dataset, gcs_bucket, filename):
        """Writes source data from GCS bucket to BigQuery

        dataset: The BigQuery dataset to write to
        table_name: The name of the biquery table to write to
        gcs_bucket: The name of the gcs bucket to read the data from
        filename: The name of the file in the gcs bucket to read from"""
        frame = gcs_to_bq_util.load_csv_as_dataframe(gcs_bucket, filename)

        # Replace spaces and dashes with underscores in column name and make all characters
        # in column names lower case.
        frame.rename(columns=lambda col: col.replace(' ', '_'), inplace=True)
        frame.rename(columns=lambda col: col.replace(
            '-', '_').lower(), inplace=True)

        gcs_to_bq_util.append_dataframe_to_bq(frame, dataset, self.get_table_name())

    def export_to_gcs(self):
        # TODO: Implement
        pass
