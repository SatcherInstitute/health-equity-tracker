from datasources.data_source import DataSource


class BJSData(DataSource):

    @staticmethod
    def get_id():
        return 'BJS_DATA'

    @staticmethod
    def get_table_name():
        return 'bjs_data'

    def upload_to_gcs(self, _, **attrs):
        raise NotImplementedError(
            'upload_to_gcs should not be called for BJSData')

    def write_to_bq(self, dataset, gcs_bucket, **attrs):
        print("writing to BQ")
