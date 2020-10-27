from datasources.data_source import DataSource


# Location of urgent care facilities in the United States from the
# Department of Homeland Security.
class UrgentCareFacilities(DataSource):

    @staticmethod
    def get_id():
        """Returns the data source's unique id. """
        return 'URGENT_CARE_FACILITIES'

    @staticmethod
    def get_table_name():
        """Returns the BigQuery table name where the data source's data will
        stored. """
        return 'urgent_care_facilities'
