from datasources.data_source import DataSource


class CtpMetadata(DataSource):

    @staticmethod
    def get_id():
        return 'COVID_TRACKING_PROJECT_METADATA'

    @staticmethod
    def get_table_name():
        return 'covid_tracking_project_metadata'
