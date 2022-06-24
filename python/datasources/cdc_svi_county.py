import pandas as pd

from ingestion.standardized_columns import Race
import ingestion.standardized_columns as std_col

from datasources.data_source import DataSource
from ingestion import gcs_to_bq_util, merge_utils


BASE_CDC_URL = 'https://data.cdc.gov/resource/8xkx-amqh.csv'
FILE_SIZE_LIMIT = 5000

COUNTY_FIPS_COL = 'fips'
COUNTY_COL = 'recip_county'

columns_to_standard = {
            "FIPS": std_col.COUNTY_FIPS_COL,
            "LOCATION": std_col.COUNTY_NAME_COL,
            "RPL_THEMES": std_col.SVI,
}

class CDCSviCounty(DataSource):

    @staticmethod
    def get_id():
        return 'CDC_SVI_COUNTY'

    @staticmethod
    def get_table_name():
        return 'cdc_svi_county'

    def upload_to_gcs(self, _, **attrs):
        raise NotImplementedError(
            'upload_to_gcs should not be called for CDCSviCounty')

    def write_to_bq(self, dataset, gcs_bucket, **attrs):
        params = {"$limit": FILE_SIZE_LIMIT}
        df = gcs_to_bq_util.load_csv_as_df_from_web(
            BASE_CDC_URL, dtype={COUNTY_FIPS_COL: str}, params=params)



        df = self.generate_for_bq(df)

        column_types = {c: 'STRING' for c in df.columns}
        column_types[std_col.SVI] = 'FLOAT'


        gcs_to_bq_util.add_df_to_bq(
            df, dataset, "age", column_types=column_types)

    def generate_for_bq(self, df):



        df = df.rename(columns_to_standard, axis="columns")

        # TODO: need to remove the `, STATE_NAME` from each value in county_name col
        # df = df.apply()

        df[std_col.AGE_COL] = std_col.ALL_VALUE
        cols_to_keep = [*columns_to_standard.values(), std_col.AGE_COL]
        df = df[cols_to_keep]

        print("df inside gen for bq")
        print(df.to_string())

        return df
