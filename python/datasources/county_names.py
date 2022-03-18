import json
import logging

from ingestion import census, url_file_to_gcs, gcs_to_bq_util
from datasources.data_source import DataSource


# Names of the counties in the United States from US Census data.
class CountyNames(DataSource):

    @staticmethod
    def get_id():
        """Returns the data source's unique id. """
        return 'COUNTY_NAMES'

    @staticmethod
    def get_table_name():
        """Returns the BigQuery table name where the data source's data will
        stored. """
        return 'county_names'

    def upload_to_gcs(self, url, gcs_bucket, filename):
        """Uploads county names and FIPS codes from census to GCS bucket."""
        url_params = census.get_census_params_by_county(['NAME'])
        return url_file_to_gcs.url_file_to_gcs(url, url_params, gcs_bucket, filename)

    def write_to_bq(self, dataset, gcs_bucket, filename):
        """Writes county names to BigQuery from the provided GCS bucket

        dataset: The BigQuery dataset to write to
        table_name: The name of the biquery table to write to
        gcs_bucket: The name of the gcs bucket to read the data from
        filename: The name of the file in the gcs bucket to read from"""
        try:
            frame = gcs_to_bq_util.load_values_as_df(
                gcs_bucket, filename)
            frame = frame.rename(columns={
                'NAME': 'county_name',
                'state': 'state_fips_code',
                'county': 'county_fips_code'
            })
            column_types = {
                'county_name': 'STRING',
                'state_fips_code': 'STRING',
                'county_fips_code': 'STRING'
            }
            gcs_to_bq_util.add_df_to_bq(frame, dataset, self.get_table_name(),
                                        column_types=column_types)
        except json.JSONDecodeError as err:
            logging.error(
                'Unable to write to BigQuery due to improperly formatted data: %s', err)
