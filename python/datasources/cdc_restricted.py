import os
import ingestion.standardized_columns as std_col
import pandas as pd

from datasources.data_source import DataSource
from datasources import age_adjust
from ingestion import gcs_to_bq_util

AGE_ADJUST_FILES = ('cdc_restricted_by_race_and_age_state.csv',)


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

        dfs = []

        for age_adjust_file in AGE_ADJUST_FILES:
            if age_adjust_file not in AGE_ADJUST_FILES:
                raise ValueError('File needed for age adjustment not included: ', age_adjust_file)

            dfs.append(age_adjust.do_age_adjustment(age_adjust_file, age_adjust.get_race_age_covid_df()))

        # For each of the files, we load it as a dataframe and add it as a
        # table in the BigQuery dataset. We expect that all aggregation and
        # standardization of the data has been done by this point.
        int_cols = [std_col.COVID_CASES, std_col.COVID_HOSP_Y,
                    std_col.COVID_HOSP_N, std_col.COVID_HOSP_UNKNOWN,
                    std_col.COVID_DEATH_Y, std_col.COVID_DEATH_N,
                    std_col.COVID_DEATH_UNKNOWN]

        for f in files:
            # Explicitly specify county_fips is a string.
            dfs.append(gcs_to_bq_util.load_csv_as_dataframe(
                gcs_bucket, f, dtype={'county_fips': str}))

        for df in dfs:
            # All columns are str, except outcome columns.
            column_types = {c: 'STRING' for c in df.columns}
            for col in int_cols:
                if col in column_types:
                    column_types[col] = 'FLOAT'
            if std_col.RACE_INCLUDES_HISPANIC_COL in df.columns:
                column_types[std_col.RACE_INCLUDES_HISPANIC_COL] = 'BOOL'

            # Clean up column names.
            self.clean_frame_column_names(df)

            table_name = f.replace('.csv', '')  # Table name is file name
            gcs_to_bq_util.add_dataframe_to_bq(
                df, dataset, table_name, column_types=column_types)


def merge_age_adjusted(df, age_adjusted_df):
    return pd.merge(df, age_adjusted_df, on=df.columns)
