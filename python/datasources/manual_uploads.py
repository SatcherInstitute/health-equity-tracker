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
            chunked_frame = gcs_to_bq_util.load_csv_as_dataframe(
                gcs_bucket, file_name, chunksize=1000)
            for chunk in chunked_frame:
                super().clean_frame_column_names(chunk)
                gcs_to_bq_util.append_dataframe_to_bq_as_str_values(
                    chunk, dataset, table_name, project=manual_uploads_project)
