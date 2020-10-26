from datasources import data_source
from data_source import DataSource

class CDCCovidDeaths(DataSource):

    @staticmethod
    def get_id():
        return 'CDC_COVID_DEATHS'