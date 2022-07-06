import ingestion.standardized_columns as std_col

from datasources.data_source import DataSource
from ingestion import gcs_to_bq_util

from ingestion.dataset_utils import merge_fips_codes

# need to add merge_utils file, temporarily removed to pass test


BASE_CDC_URL = 'https://data.cdc.gov/resource/8xkx-amqh.csv'
FILE_SIZE_LIMIT = 5000

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
        # params = {"$limit": FILE_SIZE_LIMIT}
        # df = gcs_to_bq_util.load_csv_as_df_from_web(
        #     BASE_CDC_URL, dtype={COUNTY_FIPS_COL: str}, params=params)
        df = gcs_to_bq_util.load_csv_as_df_from_data_dir('cdc_svi_county', "cdc_svi_county_totals.csv")

        # print(df.to_string())

        df = self.generate_for_bq(df)

        column_types = {c: 'STRING' for c in df.columns}
        column_types[std_col.SVI] = 'FLOAT'

        # print(df.to_string())

        gcs_to_bq_util.add_df_to_bq(
            df, dataset, "age", column_types=column_types)

    def generate_for_bq(self, df):

        df = df.rename(columns=columns_to_standard)

        def update_county_name(x: str):
            return x.split(",")[0]

        def round_svi(x):
            return round(x,2)

        df["county_name"] = df["county_name"].apply(update_county_name)
        df["svi"] = df["svi"].apply(round_svi)

        df[std_col.AGE_COL] = std_col.ALL_VALUE
        cols_to_keep = [*columns_to_standard.values(), std_col.AGE_COL]
        df = df[cols_to_keep]
        
        print("\n")
        print(df.to_string())
         

        return df
