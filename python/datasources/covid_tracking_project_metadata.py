from datasources.data_source import DataSource
from ingestion import gcs_to_bq_util


class CtpMetadata(DataSource):

    @staticmethod
    def get_id():
        return 'COVID_TRACKING_PROJECT_METADATA'

    @staticmethod
    def get_table_name():
        return 'covid_tracking_project_metadata'

    def upload_to_gcs(self, _, **attrs):
        raise NotImplementedError(
            'upload_to_gcs should not be called for CtpMetadata')

    def write_to_bq(self, dataset, gcs_bucket, **attrs):
        gcs_file = self.get_attr(attrs, 'filename')
        output_table = self.get_attr(attrs, 'table_name')

        # Download the raw data
        df = gcs_to_bq_util.load_csv_as_dataframe(gcs_bucket, gcs_file)
        self.clean_frame_column_names(df)

        # Standardize the data
        keep_cols = [
            'state_postal_abbreviation', 'api_death',
            'defines_other_death', 'race_ethnicity_separately_death',
            'race_ethnicity_combined_death', 'race_mutually_exclusive_death',
            'combined_category_other_than_api_death', 'race_death',
            'ethnicity_death', 'api_cases', 'defines_other_cases',
            'race_ethnicity_separately_cases', 'race_ethnicity_combined_cases',
            'race_mutually_exclusive_cases', 'combined_category_other_than_api_cases',
            'race_cases', 'ethnicity_cases']
        df = df[keep_cols]
        df = df.melt(id_vars=['ingestion_ts', 'state_postal_abbreviation'])
        df[['col_name', 'variable_type']] = df.variable.str.rsplit(
            '_', 1, expand=True)
        df.drop('variable', axis=1, inplace=True)
        df = df.pivot(
            index=['ingestion_ts', 'state_postal_abbreviation', 'variable_type'],
            columns='col_name', values='value').reset_index()
        df.rename(columns=self._metadata_columns_map(), inplace=True)

        # Write to BQ
        gcs_to_bq_util.append_dataframe_to_bq(df, dataset, output_table)

    @staticmethod
    def _metadata_columns_map():
        return {
            'api': 'reports_api',
            'combined_category_other_than_api': 'reports_ind',
            'ethnicity': 'reports_ethnicity',
            'race': 'reports_race'
        }
