from ingestion import gcs_to_bq_util
from datasources.data_source import DataSource


# Adjacent counties for each county in the United States from US Census data
class CountyAdjacency(DataSource):

    @staticmethod
    def get_id():
        """Returns the data source's unique id. """
        return 'COUNTY_ADJACENCY'

    @staticmethod
    def get_table_name():
        """Returns the BigQuery table name where the data source's data will
        stored. """
        return 'county_adjacency'

    def write_to_bq(self, dataset, gcs_bucket, filename):
        """Writes county adjacencies to BigQuery from the provided GCS bucket

        dataset: The BigQuery dataset to write to
        table_name: The name of the biquery table to write to
        gcs_bucket: The name of the gcs bucket to read the data from
        filename: The name of the file in the gcs bucket to read from"""
        frame = gcs_to_bq_util.load_csv_as_df(gcs_bucket, filename, dtype={
            'fipscounty': 'string',
            'fipsneighbor': 'string'
        })
        frame = frame[['fipscounty', 'fipsneighbor']]
        frame = frame.rename(columns={
            'fipscounty': 'county_geoid',
            'fipsneighbor': 'neighbor_geoids'
        })
        frame = frame.groupby('county_geoid', as_index=False).agg(list)

        column_types = {
            'county_geoid': 'STRING',
            'neighbor_geoids': 'STRING'
        }
        col_modes = {'neighbor_geoids': 'REPEATED'}
        gcs_to_bq_util.add_df_to_bq(
            frame, dataset, self.get_table_name(), column_types=column_types,
            col_modes=col_modes)
