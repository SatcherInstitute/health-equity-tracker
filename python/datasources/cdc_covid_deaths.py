from datasources.data_source import DataSource


# Covid-19 deaths in the United States. Data from the CDC.
class CDCCovidDeaths(DataSource):

    @staticmethod
    def get_id():
        """Returns the data source's unique id. """
        return 'CDC_COVID_DEATHS'

    @staticmethod
    def get_table_name():
        """Returns the BigQuery table name where the data source's data will
        stored. """
        return 'covid_deaths'
