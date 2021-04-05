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

        # Download the raw data
        df = gcs_to_bq_util.load_csv_as_dataframe(gcs_bucket, gcs_file)
        self.clean_frame_column_names(df)

        # Standardize the data
        # The metadata currently only has information for cases and deaths,
        # not tests or hospitalizations.
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
        df = df.melt(id_vars=['state_postal_abbreviation'])
        df[['col_name', 'variable_type']] = df.variable.str.rsplit(
            '_', 1, expand=True)
        df.drop('variable', axis=1, inplace=True)
        df = df.pivot(
            index=['state_postal_abbreviation', 'variable_type'],
            columns='col_name', values='value').reset_index()
        df.replace({'variable_type': {'death': 'deaths'}}, inplace=True)
        df.rename_axis(None, inplace=True)
        df.rename(columns=self._metadata_columns_map(), inplace=True)

        # Write to BQ
        gcs_to_bq_util.add_dataframe_to_bq(df, dataset, self.get_table_name())

    @staticmethod
    def _metadata_columns_map():
        """Returns a dict for renaming raw column names."""
        return {
            # Asian and Pacific Islander
            'api': 'reports_api',
            # Currently represents NH/PI and AI/AN combined, or "Indigenous"
            'combined_category_other_than_api': 'reports_ind',
            # Whether the locale reports ethnicity
            'ethnicity': 'reports_ethnicity',
            # Whether the locale reports race
            'race': 'reports_race'
        }
