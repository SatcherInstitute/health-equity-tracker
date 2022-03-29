import pandas
from google.cloud import storage

from ingestion import census, url_file_to_gcs, gcs_to_bq_util
from datasources.data_source import DataSource


# Median household income per county from the US Department of Agriculture.
class HouseholdIncome(DataSource):

    @staticmethod
    def get_id():
        """Returns the data source's unique id. """
        return 'HOUSEHOLD_INCOME'

    @staticmethod
    def get_table_name():
        """Returns the BigQuery table name where the data source's data will
        stored. """
        return 'SAIPE_household_income_poverty_estimates'

    @staticmethod
    def get_household_income_columns():
        """Returns column names of SAIPE fields and their descriptions."""
        return {
            'COUNTY': 'County FIPS Code',
            'GEOCAT': 'Summary Level',
            'GEOID': 'State+County FIPS Code',
            'SAEMHI_LB90': 'Median Household Income Lower Bound for 90% Confidence Interval',
            'SAEMHI_MOE': 'Median Household Income Margin of Error',
            'SAEMHI_PT': 'Median Household Income Estimate',
            'SAEMHI_UB90': 'Median Household Income Upper Bound for 90% Confidence Interval',
            'SAEPOVALL_LB90': 'All ages in Poverty, Count Lower Bound for 90% Confidence Interval',
            'SAEPOVALL_MOE': 'All ages in Poverty, Count Margin of Error',
            'SAEPOVALL_PT': 'All ages in Poverty, Count Estimate',
            'SAEPOVALL_UB90': 'All ages in Poverty, Count Upper Bound for 90% Confidence Interval',
            'SAEPOVRTALL_LB90': 'All ages in Poverty, Rate Lower Bound for 90% Confidence Interval',
            'SAEPOVRTALL_MOE': 'All ages in Poverty, Rate Margin of Error',
            'SAEPOVRTALL_PT': 'All ages in Poverty, Rate Estimate',
            'SAEPOVRTALL_UB90': 'All ages in Poverty, Rate Upper Bound for 90% Confidence Interval',
            'SAEPOVU_ALL': 'All Ages in Poverty Universe',
            'STABREV': 'Two-letter State Postal abbreviation',
            'STATE': 'FIPS State Code',
            'YEAR': 'Estimate Year',
        }

    def upload_to_gcs(self, url, gcs_bucket, filename):
        """Uploads household income data from SAIPE to GCS bucket for all available years."""
        year_range = {1989, 1993, *range(1995, 2019)}
        file_diff = False
        for year in year_range:
            url_params = census.get_census_params_by_county(
                self.get_household_income_columns().keys())
            url_params['time'] = year
            next_file_diff = url_file_to_gcs.url_file_to_gcs(
                url, url_params, gcs_bucket, '{}_{}.json'.format(filename, year))
            file_diff = file_diff or next_file_diff
        return file_diff

    def write_to_bq(self, dataset, gcs_bucket, filename):
        """Fetches all SAIPE blobs from a GCS bucket and uploads to a single BQ table.
        Also does some preprocessing.

        dataset: The BigQuery dataset to write to
        table_name: The name of the BigQuery table to write to
        gcs_bucket: The name of the GCS bucket to pull from
        filename: File name prefix used to identify which GCS blobs to fetch"""
        client = storage.Client()
        saipe_blobs = client.list_blobs(gcs_bucket, prefix=filename)

        frames = []
        for blob in saipe_blobs:
            frame = gcs_to_bq_util.load_values_blob_as_df(blob)
            frames.append(frame)

        concat = pandas.concat(frames, ignore_index=True)
        # The SAIPE API includes the query predicate columns, which are duplicates of their
        # ALL_CAPS counterparts. Toss 'em.
        concat.drop(columns=['state', 'county', 'time'], inplace=True)
        gcs_to_bq_util.add_df_to_bq(
            concat, dataset, self.get_table_name())
