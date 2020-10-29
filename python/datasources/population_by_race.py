import json
import logging

from ingestion import census, url_file_to_gcs, gcs_to_bq_util
from datasources.data_source import DataSource


# Population by race for counties in the United States from US Census data.
class PopulationByRace(DataSource):

    @staticmethod
    def get_id():
        """Returns the data source's unique id. """
        return 'POPULATION_BY_RACE'

    @staticmethod
    def get_table_name():
        """Returns the BigQuery table name where the data source's data will
        stored. """
        return 'population_by_race'

    def upload_to_gcs(self, url, gcs_bucket, filename):
        """Uploads population by county and race from census to GCS bucket."""
        url_params = census.get_census_params_by_county(
            self.get_population_by_race_external_columns().keys())
        url_file_to_gcs.url_file_to_gcs(url, url_params, gcs_bucket, filename)

    def write_to_bq(self, dataset, gcs_bucket, filename):
        """Writes population by race to BigQuery from the provided GCS bucket

        dataset: The BigQuery dataset to write to
        table_name: The name of the biquery table to write to
        gcs_bucket: The name of the gcs bucket to read the data from
        filename: The name of the file in the gcs bucket to read from"""
        try:
            frame = gcs_to_bq_util.load_values_as_dataframe(gcs_bucket, filename)

            columns = self.get_population_by_race_columns()
            for col in columns:
                frame = frame.astype({col: 'int64'})

            frame['pop_other'] = (frame['DP05_0079E']
                                  + frame['DP05_0081E']
                                  + frame['DP05_0082E']
                                  + frame['DP05_0083E'])

            frame = frame.rename(columns=columns)
            frame = frame.rename(columns={
                'state': 'state_fips_code',
                'county': 'county_fips_code'
            })

            column_types = {v: 'INT64' for k, v in columns.items()}
            column_types['pop_other'] = 'INT64'
            column_types['state_fips_code'] = 'STRING'
            column_types['county_fips_code'] = 'STRING'

            gcs_to_bq_util.append_dataframe_to_bq(frame, dataset, self.get_table_name(),
                                                  column_types=column_types)
        except json.JSONDecodeError as err:
            logging.error(
                'Unable to write to BigQuery due to improperly formatted data: %s', err)

    @staticmethod
    def get_population_by_race_external_columns():
        """Returns population by race column names of ACS fields and their
        descriptions."""
        return {
            'DP05_0070E': 'Population (Total)',
            'DP05_0071E': 'Population (Hispanic or Latino)',
            'DP05_0077E': 'Population (White alone, Non-Hispanic)',
            'DP05_0078E': 'Population (Black or African American alone, Non-Hispanic)',
            'DP05_0080E': 'Population (Asian alone, Non-Hispanic)',

            # These will be grouped into an "Other" category
            'DP05_0079E': 'Population (American Indian and Alaska Native alone, Non-Hispanic)',
            'DP05_0081E': 'Population (Native Hawaiian and Other Pacific Islander alone, Non-Hispanic)',
            'DP05_0082E': 'Population (Some other race alone, Non-Hispanic)',
            'DP05_0083E': 'Population (Two or more races, Non-Hispanic)'
        }

    @staticmethod
    def get_population_by_race_columns():
        """Returns population by race column names of ACS fields and the BigQuery
        column names to convert them to."""
        return {
            'DP05_0070E': 'pop_total',
            'DP05_0071E': 'pop_his_or_lat',
            'DP05_0077E': 'pop_whi_only_nonhis',
            'DP05_0078E': 'pop_bla_only_nonhis',
            'DP05_0080E': 'pop_asi_only_nonhis',

            # These will be grouped into an "Other" category. They will also be
            # included in the output table for completeness, in case one of the
            'DP05_0079E': 'pop_other__ame_ind__ala_nat_only_nonhis',
            'DP05_0081E': 'pop_other__nat_haw__pac_isl_only_nonhis',
            'DP05_0082E': 'pop_other__other_race_only_nonhis',
            'DP05_0083E': 'pop_other__two_or_more_races_nonhis'
        }
