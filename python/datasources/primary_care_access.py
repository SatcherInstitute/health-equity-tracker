import math
from pandas import DataFrame, read_excel
from google.cloud import storage

from ingestion import constants, url_file_to_gcs, gcs_to_bq_util
from datasources.data_source import DataSource


# Ratio of population to primary care physicians.
class PrimaryCareAccess(DataSource):

    _FILEPATH = '{}-{}.xlsx'
    _URL1 = ("https://www.countyhealthrankings.org/sites/default/files/media/"
             "document/2020 County Health Rankings {} Data - v1.xlsx")
    _URL2 = ("https://www.countyhealthrankings.org/sites/default/files/media/"
             "document/2020 County Health Rankings {} Data - v1_0.xlsx")

    @staticmethod
    def get_id():
        """Returns the data source's unique id. """
        return 'PRIMARY_CARE_ACCESS'

    @staticmethod
    def get_table_name():
        """Returns the BigQuery table name where the data source's data will
        stored. """
        return 'primary_care_access'

    def upload_to_gcs(self, url, gcs_bucket, filename):
        """Uploads one file containing primary care access info for each state."""

        file_diff = False
        for state in constants.STATE_NAMES:
            next_file_diff = url_file_to_gcs.download_first_url_to_gcs(
                [self._URL1.format(state), self._URL2.format(state)],
                gcs_bucket,
                self._FILEPATH.format(filename, state)
            )
            file_diff = file_diff or next_file_diff
        return file_diff

    def write_to_bq(self, dataset, gcs_bucket, filename):
        """Writes primary care access stats to BigQuery from bucket
            dataset: The BigQuery dataset to write to
            table_name: The name of the biquery table to write to
            gcs_bucket: The name of the gcs bucket to read the data from
            filename: The prefix of files in the landing bucket to read from"""
        client = storage.Client()
        bucket = client.get_bucket(gcs_bucket)

        data = []
        for state_name in constants.STATE_NAMES:
            filename = self._FILEPATH.format(filename, state_name)
            blob = bucket.blob(filename)
            local_path = '/tmp/{}'.format(filename)
            blob.download_to_filename(local_path)

            frame = read_excel(
                io=local_path, sheet_name='Ranked Measure Data', skiprows=[0, 2])
            for _, row in frame.iterrows():
                # These fields may not be set for every county.
                # If they're not set, we'll use -1 as the numerical value
                # Number of physicians in the county
                num_physicians = row[108] if not math.isnan(row[108]) else -1
                # Primary Care Physicians per 100,000 population
                physicians_rate = row[109] if not math.isnan(row[108]) else -1
                row = [row[0], row[1], row[2], num_physicians, physicians_rate]
                data.append(row)
        new_dataframe = DataFrame(
            data=data,
            columns=(
                'county_fips_code',
                'state_name',
                'county_name',
                'num_primary_care_physicians',
                'primary_care_physicians_rate')
        )
        column_types = {
            'county_fips_code': 'INT64',
            'state_name': 'STRING',
            'county_name': 'STRING',
            'num_primary_care_physicians': 'FLOAT64',
            'primary_care_physicians_rate': 'FLOAT64',
        }
        gcs_to_bq_util.add_df_to_bq(
            new_dataframe, dataset, self.get_table_name(), column_types=column_types)
