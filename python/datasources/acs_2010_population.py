import ingestion.standardized_columns as std_col

from datasources.data_source import DataSource
from ingestion import gcs_to_bq_util


class ACS2010Population(DataSource):

    @staticmethod
    def get_id():
        return 'ACS_2010_POPULATION'

    @staticmethod
    def get_table_name():
        return 'acs_2010_population'

    def upload_to_gcs(self, _, **attrs):
        raise NotImplementedError(
            'upload_to_gcs should not be called for ACS2010Population')

    def write_to_bq(self, dataset, gcs_bucket, **attrs):
        gcs_files = self.get_attr(attrs, 'filename')

        # In this instance, we expect filename to be a string with
        # comma-separated CSV filenames.
        if ',' not in gcs_files:
            raise ValueError('filename passed to write_to_bq is not a '
                             'comma-separated list of files')
        files = gcs_files.split(',')
        print("Files that will be written to BQ:", files)

        for f in files:
            # Explicitly specify county_fips is a string.
            df = gcs_to_bq_util.load_json_as_dataframe(
                gcs_bucket, f, dtype={'state_fips': str})

            if std_col.RACE_CATEGORY_ID_COL in df.columns:
                std_col.add_race_columns_from_category_id(df)

            # All columns are str, except outcome columns.
            column_types = {c: 'STRING' for c in df.columns}
            column_types[std_col.POPULATION_COL] = 'INT64'
            if std_col.RACE_INCLUDES_HISPANIC_COL in df.columns:
                column_types[std_col.RACE_INCLUDES_HISPANIC_COL] = 'BOOL'

            # Clean up column names.
            self.clean_frame_column_names(df)

            table_name = f.replace('.json', '')  # Table name is file name
            table_name = table_name.replace('acs_2010_population-', '')  # Dont need this
            gcs_to_bq_util.add_dataframe_to_bq(
                df, dataset, table_name, column_types=column_types)
