import logging

from datasources.data_source import DataSource


# Covid Tracking Project race data by state from covidtracking.com/race
class CovidTrackingProject(DataSource):

    @staticmethod
    def get_id():
        return 'COVID_TRACKING_PROJECT'

    @staticmethod
    def get_table_name():
        return 'covid_tracking_project'

    def write_to_bq(self, dataset, gcs_bucket, filename):
        logging.info("Covid Tracking Project write_to_bq not implemented yet")
