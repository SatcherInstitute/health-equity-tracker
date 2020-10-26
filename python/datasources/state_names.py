import json
import logging

from ingestion import di_url_file_to_gcs, gcs_to_bq_util

from datasources import data_source
from data_source import DataSource

class StateNames(DataSource):

    @staticmethod
    def get_id():
        return 'STATE_NAMES'


    def upload_to_gcs(self, url, gcs_bucket, filename):
        """Uploads state names and FIPS codes from census to GCS bucket."""
        url_params = {'get': 'NAME', 'for': 'state:*'}
        di_url_file_to_gcs.url_file_to_gcs(url, url_params, gcs_bucket, filename)

    
    def write_to_bq(self, dataset, table_name, gcs_bucket, filename):
        """Writes state names to BigQuery from the provided GCS bucket

        dataset: The BigQuery dataset to write to
        table_name: The name of the biquery table to write to
        gcs_bucket: The name of the gcs bucket to read the data from
        filename: The name of the file in the gcs bucket to read from"""
        try:
            frame = gcs_to_bq_util.load_values_as_dataframe(gcs_bucket, filename)
            frame = frame.rename(columns={
                'state': 'state_fips_code',
                'NAME': 'state_name'
            })
            column_types = {'state_fips_code': 'STRING', 'state_name': 'STRING'}
            gcs_to_bq_util.append_dataframe_to_bq(frame, dataset, table_name,
                                                column_types=column_types)
        except json.JSONDecodeError as err:
            msg = 'Unable to write to BigQuery due to improperly formatted data: {}'
            logging.error(msg.format(err))