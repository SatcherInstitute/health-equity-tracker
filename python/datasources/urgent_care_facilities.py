from datasources import data_source
from data_source import DataSource

class UrgentCareFacilities(DataSource):

    @staticmethod
    def get_id():
        return 'URGENT_CARE_FACILITIES'