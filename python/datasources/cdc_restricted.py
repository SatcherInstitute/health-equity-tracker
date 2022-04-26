import ingestion.standardized_columns as std_col

from datasources.data_source import DataSource
from ingestion import gcs_to_bq_util
from ingestion.dataset_utils import merge_fips_codes, merge_pop_numbers


CDC_RESTRICTED_FILES = [
    'cdc_restricted_by_race_county.csv',
    'cdc_restricted_by_race_state.csv',
    'cdc_restricted_by_age_county.csv',
    'cdc_restricted_by_age_state.csv',
    'cdc_restricted_by_sex_county.csv',
    'cdc_restricted_by_sex_state.csv',
    'cdc_restricted_by_race_and_age_state.csv'
]


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
        # For each of the files, we load it as a dataframe and add it as a
        # table in the BigQuery dataset. We expect that all aggregation and
        # standardization of the data has been done by this point.
        int_cols = [std_col.COVID_CASES, std_col.COVID_HOSP_Y,
                    std_col.COVID_HOSP_N, std_col.COVID_HOSP_UNKNOWN,
                    std_col.COVID_DEATH_Y, std_col.COVID_DEATH_N,
                    std_col.COVID_DEATH_UNKNOWN]

        for geo in ['state', 'county']:
            for demo in ['race', 'sex', 'age']:
                filename = f'cdc_restricted_by_{demo}_{geo}.csv'
                df = gcs_to_bq_util.load_csv_as_df(
                    gcs_bucket, filename, dtype={'county_fips': str})

                if geo == 'state':
                    # The county files already have fips codes
                    df = merge_fips_codes(df)

                df = merge_pop_numbers(df)
                # calculate per 100k
                # calculate pct_share

                column_types = {c: 'STRING' for c in df.columns}
                for col in int_cols:
                    if col in column_types:
                        column_types[col] = 'FLOAT'
                if std_col.RACE_INCLUDES_HISPANIC_COL in df.columns:
                    column_types[std_col.RACE_INCLUDES_HISPANIC_COL] = 'BOOL'

                # Clean up column names.
                self.clean_frame_column_names(df)

                table_name = f'by_{demo}_{geo}_processed'
                gcs_to_bq_util.add_df_to_bq(
                    df, dataset, table_name, column_types=column_types)
