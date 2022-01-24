import ingestion.standardized_columns as std_col
import pandas as pd

from datasources.data_source import DataSource
from datasources import age_adjust
from ingestion import gcs_to_bq_util

AGE_ADJUST_FILES = {'cdc_restricted_by_race_and_age_state.csv': 'cdc_restricted-by_race.csv'}


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
        print("Files that will be written to BQ:", files)

        table_names_to_dfs = {}

        for with_race_age_file, only_race_file in AGE_ADJUST_FILES.items():
            with_race_age_df = gcs_to_bq_util.load_csv_as_dataframe(
                gcs_bucket, with_race_age_file, dtype={'state_fips': str})

            pop_df = gcs_to_bq_util.load_dataframe_from_bigquery('census_pop_estimates', 'race_and_ethnicity')
            age_adjusted_df = age_adjust.do_age_adjustment(with_race_age_df, pop_df)

            only_race_df = gcs_to_bq_util.load_csv_as_dataframe(
                gcs_bucket, only_race_file, dtype={'state_fips': str})

            table_name = only_race_file.replace('.csv', '')
            table_name = '%s-with_age_adjust' % table_name

            table_names_to_dfs[table_name] = merge_age_adjusted(only_race_df, age_adjusted_df)

        # For each of the files, we load it as a dataframe and add it as a
        # table in the BigQuery dataset. We expect that all aggregation and
        # standardization of the data has been done by this point.
        int_cols = [std_col.COVID_CASES, std_col.COVID_HOSP_Y,
                    std_col.COVID_HOSP_N, std_col.COVID_HOSP_UNKNOWN,
                    std_col.COVID_DEATH_Y, std_col.COVID_DEATH_N,
                    std_col.COVID_DEATH_UNKNOWN]

        for f in files:
            if f in AGE_ADJUST_FILES:
                continue

            table_name = f.replace('.csv', '')  # Table name is file name
            print(table_name)

            # Explicitly specify county_fips is a string.
            table_names_to_dfs[table_name] = gcs_to_bq_util.load_csv_as_dataframe(
                gcs_bucket, f, dtype={'county_fips': str})

        for table_name, df in table_names_to_dfs.items():
            # All columns are str, except outcome columns.
            column_types = {c: 'STRING' for c in df.columns}
            for col in int_cols:
                if col in column_types:
                    column_types[col] = 'FLOAT'
            if std_col.RACE_INCLUDES_HISPANIC_COL in df.columns:
                column_types[std_col.RACE_INCLUDES_HISPANIC_COL] = 'BOOL'

            # Clean up column names.
            self.clean_frame_column_names(df)

            gcs_to_bq_util.add_dataframe_to_bq(
                df, dataset, table_name, column_types=column_types)


def merge_age_adjusted(df, age_adjusted_df):
    merge_cols = [std_col.STATE_FIPS_COL, std_col.STATE_NAME_COL]
    merge_cols.extend(std_col.RACE_COLUMNS)

    return pd.merge(df, age_adjusted_df, how='left', on=merge_cols)
