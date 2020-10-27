from datasources.data_source import DataSource

# Location of urgent care facilities in the United States from the 
# Department of Homeland Security.
class UrgentCareFacilities(DataSource):

    @staticmethod
    def get_id():
        return 'URGENT_CARE_FACILITIES'
