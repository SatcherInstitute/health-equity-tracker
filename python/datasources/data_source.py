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
        gcs_bucket: The name of the gcs bucket to read the data from
        filename: The name of the file in the gcs bucket to read from"""
        self.write_to_bq_table(dataset, gcs_bucket,
                               filename, self.get_table_name())

    def write_to_bq_table(self, dataset: str, gcs_bucket: str, filename: str, table_name: str, project=None):
        """Writes source data from GCS bucket to BigQuery

        dataset: The BigQuery dataset to write to
        gcs_bucket: The name of the gcs bucket to read the data from
        filename: The name of the file in the gcs bucket to read from
        table_name: The name of the BigQuery table to write to"""
        chunked_frame = gcs_to_bq_util.load_csv_as_dataframe(
            gcs_bucket, filename, chunksize=1000)

        # Replace spaces and dashes with underscores in column name and make all characters
        # in column names lower case.
        for chunk in chunked_frame:
            chunk.rename(columns=lambda col: (
                col
                .lower()
                .strip()
                .replace(' ', '_')
                .replace('-', '_')
                .replace(':', '_')
                .replace('&', '_')
                .replace("\n", '_')
                .replace("\t", '_')
                .replace('(', '_')
                .replace(')', '_')
                .replace('=', 'eq')
            ), inplace=True)
            gcs_to_bq_util.append_dataframe_to_bq(
                chunk, dataset, table_name, project=project)

    def export_to_gcs(self):
        # TODO: Implement
        pass
