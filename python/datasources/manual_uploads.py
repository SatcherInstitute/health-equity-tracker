from datasources.data_source import DataSource
from ingestion import gcs_to_bq_util
import os


# Data sources that have been manual uploaded to GCS
class ManualUploads(DataSource):

    @staticmethod
    def get_id():
        """Returns the data source's unique id. """
        return 'MANUAL_UPLOADS'

    def write_to_bq(self, dataset, gcs_bucket, _):
        """Writes state names to BigQuery from the provided GCS bucket

        dataset: The BigQuery dataset to write to
        gcs_bucket: The name of the gcs bucket to read the data from"""
        dataset = os.environ['MANUAL_UPLOADS_DATASET']
        manual_uploads_project = os.environ['MANUAL_UPLOADS_PROJECT']
        bucket_files = gcs_to_bq_util.list_bucket_files(gcs_bucket)
        for file_name in bucket_files:
            table_name = file_name.split('.')[0]
            super().write_to_bq_table(
                dataset, gcs_bucket, file_name, table_name, manual_uploads_project)
