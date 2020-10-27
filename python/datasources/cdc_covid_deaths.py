from datasources.data_source import DataSource


# Covid-19 deaths in the United States. Data from the CDC.
class CDCCovidDeaths(DataSource):

    @staticmethod
    def get_id():
        return 'CDC_COVID_DEATHS'
