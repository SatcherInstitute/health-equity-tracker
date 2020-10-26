from abc import ABC
from ingestion import di_url_file_to_gcs, gcs_to_bq_util

class DataSource(ABC):
    @classmethod
    def upload_to_gcs(self, url, gcs_bucket, filename):
        di_url_file_to_gcs.url_file_to_gcs(url, None, gcs_bucket, filename)


    @classmethod
    def write_to_bq(self, dataset, table_name, gcs_bucket, filename):
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

        gcs_to_bq_util.append_dataframe_to_bq(frame, dataset, table_name)


    @classmethod
    def export_to_gcs(self):
        #TODO: Implement
        pass