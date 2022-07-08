import ingestion.standardized_columns as std_col

from datasources.data_source import DataSource
from ingestion import gcs_to_bq_util
import numpy as np

from ingestion.merge_utils import (merge_county_names)

BASE_CDC_URL = 'https://data.cdc.gov/resource/8xkx-amqh.csv'
FILE_SIZE_LIMIT = 5000

columns_to_standard = {
    "FIPS": std_col.COUNTY_FIPS_COL,
    "LOCATION": std_col.COUNTY_NAME_COL,
    "RPL_THEMES": std_col.SVI,
}


def format_svi(value):
    """
    Takes the RPL_THEMES column and formats it to match an expected number between 0.0 - 1.0,
    or null. If the RPL_THEMES column that is greater than 1.0, this function raises an 
    assertion error. The columns that have a value within the expected range, are then rounded
    to two decimal places. The value is then outputted on the svi column of the dataframe. 

    Parameters:
        svi: number

    Returns:
        df: return svi wih two decimal places, nan, or an assertion error. 
    """
    if value == -999.0:
        return np.nan
    if value >= 0 and value <= 1:
        return round(value, 2)
    raise ValueError(
        f'The provided SVI: {value} is not an expected number between 0.0-1.0')


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
        for geo in ['county']:
            df = gcs_to_bq_util.load_csv_as_df_from_data_dir(
                'cdc_svi_county', "cdc_svi_county_totals.csv")

            df = self.generate_for_bq(df, geo)

            column_types = {c: 'STRING' for c in df.columns}
            column_types[std_col.SVI] = 'FLOAT'

            gcs_to_bq_util.add_df_to_bq(
                df, dataset, "age", column_types=column_types)

    def generate_for_bq(self, df, geo):

        df = df.rename(columns=columns_to_standard)

        if geo == 'county':
            df = merge_county_names(df)

        df["svi"] = df["svi"].apply(format_svi)

        df[std_col.AGE_COL] = std_col.ALL_VALUE
        cols_to_keep = [*columns_to_standard.values(), std_col.AGE_COL]
        df = df[cols_to_keep]

        print("\n")
        print(df.to_string())

        return df
