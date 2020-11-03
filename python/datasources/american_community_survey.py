import json
import logging

from ingestion import census, url_file_to_gcs, gcs_to_bq_util
from datasources.data_source import DataSource


# American Community Survey data in the United States from the US Census.
class AmericanCommunitySurvey(DataSource):

    @staticmethod
    def get_id():
        """Returns the data source's unique id. """
        return 'AMERICAN_COMMUNITY_SURVEY'

    @staticmethod
    def get_table_name():
        """Returns the BigQuery table name where the data source's data will
        stored. """
        return 'american_community_survey'

    def upload_to_gcs(self, url, gcs_bucket, filename):
        """Uploads population by county and race from census to GCS bucket."""
        cols = self.get_external_columns()
        url_params = census.get_census_params_by_county(cols)
        url_file_to_gcs.url_file_to_gcs(url, url_params, gcs_bucket, filename)

    def write_to_bq(self, dataset, gcs_bucket, filename):
        """Writes population by race to BigQuery from the provided GCS bucket

        dataset: The BigQuery dataset to write to
        table_name: The name of the biquery table to write to
        gcs_bucket: The name of the gcs bucket to read the data from
        filename: The name of the file in the gcs bucket to read from"""
        try:
            frame = gcs_to_bq_util.load_values_as_dataframe(
                gcs_bucket, filename)

            race_columns = self.get_population_by_race_columns()
            for col in race_columns:
                frame = frame.astype({col: 'int64'})

            frame['pop_other'] = (frame['DP05_0079E']
                                  + frame['DP05_0081E']
                                  + frame['DP05_0082E']
                                  + frame['DP05_0083E'])

            gender_age_columns = self.get_population_by_gender_age_columns()
            for col in gender_age_columns:
                if col.endswith('PE'):
                    frame = frame.astype({col: 'float64'})
                else:
                    frame = frame.astype({col: 'int64'})

            columns = race_columns+gender_age_columns
            frame = frame.rename(columns=columns)
            frame = frame.rename(columns={
                'state': 'state_fips_code',
                'county': 'county_fips_code'
            })

            column_types = {}
            for v in columns.values():
                if v.endswith('percentage'):
                    column_types[v] = 'FLOAT64'
                else:
                    column_types[v] = 'INT64'
            column_types['pop_other'] = 'INT64'
            column_types['state_fips_code'] = 'STRING'
            column_types['county_fips_code'] = 'STRING'

            gcs_to_bq_util.append_dataframe_to_bq(frame, dataset, self.get_table_name(),
                                                  column_types=column_types)
        except json.JSONDecodeError as err:
            logging.error(
                'Unable to write to BigQuery due to improperly formatted data: %s', err)

    def get_external_columns(self) -> list:
        return (self.get_population_by_race_external_columns().keys() +
                self.get_population_by_gender_age_columns().keys())

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

    @staticmethod
    def get_population_by_gender_age_columns() -> dict:
        """Returns population by gender and age column names of ACS fields and the BigQuery
        column names to rename them as."""
        return {
            # Total Gender and Age Population
            'DP05_0001E': 'pop_total_gender_age',
            # Total Male Population
            'DP05_0002E': 'pop_total_male',
            # Male Population Percentage
            'DP05_0002PE': 'pop_male_percentage',
            # Total Female Population
            'DP05_0003E': 'pop_total_female',
            # Female Population Percentage
            'DP05_0003PE': 'pop_female_percentage',
            # Total Male Population 18 Years and Over
            'DP05_0026E': 'pop_total_male_18_up',
            # Male Population 18 Years and Over Percentage
            'DP05_0026PE': 'pop_male_18_up_percentage',
            # Total Female Population 18 Years and Over
            'DP05_0027E': 'pop_total_female_18_up',
            # Female Population 18 Years and Over Percentage
            'DP05_0027PE': 'pop_female_18_up_percentage',
            # Total Male Population 65 Years and Over
            'DP05_0030E': 'pop_total_male_65_up',
            # Male Population 65 Years and Over Percentage
            'DP05_0030PE': 'pop_male_65_up_percentage',
            # Total Female Population 65 Years and Over
            'DP05_0031E': 'pop_total_female_65_up',
            # Female Population 65 Years and Over Percentage
            'DP05_0031PE': 'pop_female_65_up_percentage',

            # Total Population Under 5
            'DP05_0005E': 'pop_total_under_5',
            # Population Under 5 Percentage
            'DP05_0005PE': 'pop_under_5_percentage',
            # Total population 5 - 9 Years
            'DP05_0006E': 'pop_total_5_to_9',
            # Population 5 - 9 Years Percentage
            'DP05_0006PE': 'pop_total_5_to_9_percentage',
            # Total population 10 - 14 Years
            'DP05_0007E': 'pop_total_10_to_14',
            # Population 10 - 14 Years Percentage
            'DP05_0007PE': 'pop_total_10_to_14_percentage',
            # Total Population 15 - 19 Years
            'DP05_0008E': 'pop_total_15_to_19',
            # Population 15 - 19 Years Percentage
            'DP05_0008PE': 'pop_total_15_to_19_percentage',
            # Total population 20 - 24 Years
            'DP05_0009E': 'pop_total_20_to_24',
            # Population 20 - 24 Years Percentage
            'DP05_0009PE': 'pop_total_20_to_24_percentage',
            # Total population 25 - 34 Years
            'DP05_0010E': 'pop_total_25_to_34',
            # Population 25 - 34 Years Percentage
            'DP05_0010PE': 'pop_total_25_to_34_percentage',
            # Total population 35 - 44 Years
            'DP05_0011E': 'pop_total_35_to_44',
            # Population 35 - 44 Years Percentage
            'DP05_0011PE': 'pop_total_35_to_44_percentage',
            # Total population 45 - 54 Years
            'DP05_0012E': 'pop_total_45_to_54',
            # Population 45 - 54 Years Percentage
            'DP05_0012PE': 'pop_total_45_to_54_percentage',
            # Total Population 55 - 59 Years
            'DP05_0013E': 'pop_total_55_to_59',
            # Population 55 - 59 Years Percentage
            'DP05_0013PE': 'pop_total_55_to_59_percentage',
            # Total population 60 - 64 Years
            'DP05_0014E': 'pop_total_60_to_64',
            # Population 60 - 64 Years Percentage
            'DP05_0014PE': 'pop_total_60_to_64_percentage',
            # Total population 65 - 74 Years
            'DP05_0015E': 'pop_total_65_to_74',
            # Population 65 - 74 Years Percentage
            'DP05_0015PE': 'pop_total_65_to_74_percentage',
            # Total population 75 - 84 Years
            'DP05_0016E': 'pop_total_75_to_84',
            # Population 75 - 84 Years Percentage
            'DP05_0016PE': 'pop_total_75_to_84_percentage',
            # Total population 85 Years and Over
            'DP05_0017E': 'pop_total_over_85',
            # Population 85 Years and Over Percentage
            'DP05_0017PE': 'pop_over_85_percentage',
        }
