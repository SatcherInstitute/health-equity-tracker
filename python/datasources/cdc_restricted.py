import ingestion.standardized_columns as std_col

from datasources.data_source import DataSource
from ingestion import gcs_to_bq_util


class CDCRestrictedData(DataSource):

    @staticmethod
    def get_id():
        return 'CDC_RESTRICTED_DATA'

    @staticmethod
    def get_table_name():
        return 'cdc_restricted_data'

    def upload_to_gcs(self, _, **attrs):
        raise NotImplementedError(
            'upload_to_gcs should not be called for CDCRestrictedData')

    def write_to_bq(self, dataset, gcs_bucket, **attrs):
        gcs_files = self.get_attr(attrs, 'filename')

        # In this instance, we expect filename to be a string with
        # comma-separated CSV filenames.
        if ',' not in gcs_files:
            raise ValueError('filename passed to write_to_bq is not a '
                             'comma-separated list of files')
        files = gcs_files.split(',')

        # For each of the files, we load it as a dataframe and add it as a
        # table in the BigQuery dataset. We expect that all aggregation and
        # standardization of the data has been done by this point.
        str_cols = [std_col.COUNTY_NAME_COL, std_col.STATE_NAME_COL,
                    std_col.RACE_OR_HISPANIC_COL, std_col.AGE_COL,
                    std_col.SEX_COL]
        for f in files:
            df = gcs_to_bq_util.load_csv_as_dataframe(gcs_bucket, f)

            # All columns are int, except certain geo and breakdown columns.
            column_types = {c: 'INT64' for c in df.columns}
            for col in str_cols:
                if col in column_types:
                    column_types[col] = 'STRING'

            # Clean up column names.
            self.clean_frame_column_names(df)

            table_name = f.removesuffix('.csv')  # Table name is file name
            gcs_to_bq_util.append_dataframe_to_bq(
                df, dataset, table_name, column_types=column_types)
