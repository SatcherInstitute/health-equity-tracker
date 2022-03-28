from datasources.data_source import DataSource
from ingestion import gcs_to_bq_util
import os


# Data sources that have been manual uploaded to GCS
class ManualUploads(DataSource):

    @staticmethod
    def get_id():
        """Returns the data source's unique id. """
        return 'MANUAL_UPLOADS'

    def write_to_bq(self, dataset, gcs_bucket, **attrs):
        """Writes state names to BigQuery from the provided GCS bucket

        dataset: The BigQuery dataset to write to
        gcs_bucket: The name of the gcs bucket to read the data from"""
        dataset = os.environ['MANUAL_UPLOADS_DATASET']
        manual_uploads_project = os.environ['MANUAL_UPLOADS_PROJECT']
        bucket_files = gcs_to_bq_util.list_bucket_files(gcs_bucket)
        for file_name in bucket_files:
            table_name = file_name.split('.')[0]
            chunked_frame = gcs_to_bq_util.load_csv_as_df(
                gcs_bucket, file_name, chunksize=1000)

            # For the very first chunk, we set the mode to overwrite to clear
            # the previous table. For subsequent chunks we append.
            overwrite = True
            for chunk in chunked_frame:
                super().clean_frame_column_names(chunk)
                gcs_to_bq_util.add_df_to_bq_as_str_values(
                    chunk, dataset, table_name, project=manual_uploads_project,
                    overwrite=overwrite)
                overwrite = False
