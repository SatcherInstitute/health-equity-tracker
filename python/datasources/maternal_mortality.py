from ingestion import gcs_to_bq_util
from datasources.data_source import DataSource


# ZIP FILE CONTAINING STATE-LEVEL CSV FOR /data
# https://ghdx.healthdata.org/record/ihme-data/united-states-maternal-mortality-by-state-race-ethnicity-1999-2019


class MaternalMortalityData(DataSource):
    @staticmethod
    def get_id():
        return 'MATERNAL_MORTALITY_DATA'

    @staticmethod
    def get_table_name():
        return 'maternal_mortality_data'

    def upload_to_gcs(self, _, **attrs):
        raise NotImplementedError(
            'upload_to_gcs should not be called for MaternalMortalityData'
        )

    def write_to_bq(self, dataset, gcs_bucket, **attrs):
        # Read in the data
        df = gcs_to_bq_util.load_csv_as_df_from_data_dir(
            'maternal_mortality',
            'IHME_USA_MMR_STATE_RACE_ETHN_1999_2019_ESTIMATES_Y2023M07D03.CSV',
        )

        print(df)

        # col_types = gcs_to_bq_util.get_bq_column_types(breakdown_df, float_cols)

        # gcs_to_bq_util.add_df_to_bq(
        #     breakdown_df, dataset, table_name, column_types=col_types
        # )
