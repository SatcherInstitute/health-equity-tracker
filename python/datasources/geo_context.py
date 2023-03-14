import ingestion.standardized_columns as std_col
from ingestion.constants import (
    NATIONAL_LEVEL, STATE_LEVEL, COUNTY_LEVEL)
from datasources.data_source import DataSource
from ingestion import gcs_to_bq_util, dataset_utils
import numpy as np
import pandas as pd  # type: ignore
from typing import Literal

from ingestion.merge_utils import (
    merge_county_names, merge_state_ids, merge_pop_numbers)


def format_svi(value: float) -> float:
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


class GeoContext(DataSource):

    @staticmethod
    def get_id():
        return 'GEO_CONTEXT'

    @staticmethod
    def get_table_name():
        return 'geo_context'

    def upload_to_gcs(self, _, **attrs):
        raise NotImplementedError(
            'upload_to_gcs should not be called for GeoContext')

    def write_to_bq(self, dataset, gcs_bucket, **attrs):

        float_cols = [std_col.POPULATION_COL]
        for geo_level in [NATIONAL_LEVEL, STATE_LEVEL, COUNTY_LEVEL]:
            df = self.generate_breakdown(geo_level)
            if geo_level == COUNTY_LEVEL:
                float_cols.append(std_col.SVI)
            column_types = gcs_to_bq_util.get_bq_column_types(
                df, float_cols=float_cols)
            gcs_to_bq_util.add_df_to_bq(
                df, dataset, f'{geo_level}', column_types=column_types)

    def generate_breakdown(self, geo_level: Literal["national", "state", "county"]):

        df = dataset_utils.scaffold_fips_df(geo_level)
        df[std_col.AGE_COL] = std_col.ALL_VALUE
        df = merge_pop_numbers(df, std_col.AGE_COL, geo_level)
        fips_col = (std_col.COUNTY_FIPS_COL
                    if geo_level == COUNTY_LEVEL
                    else std_col.STATE_FIPS_COL)

        df = df[[fips_col, std_col.POPULATION_COL]]
        if geo_level == COUNTY_LEVEL:
            df = merge_svi_data(df)
            df = merge_county_names(df)
        else:
            df = merge_state_ids(df)

        df = df.sort_values(fips_col).reset_index(drop=True)

        return df


def merge_svi_data(df):
    """ Merge a column containing SVI data onto a county level df

    Parameters:
        df: county level df containing a "county_fips" column
    Returns:
        original df with added std_col.SVI column of floats
    """
    svi_df = gcs_to_bq_util.load_csv_as_df_from_data_dir(
        'cdc_svi_county', "cdc_svi_county_totals.csv", dtype={'FIPS': str})
    columns_to_standard = {"FIPS": std_col.COUNTY_FIPS_COL,
                           "RPL_THEMES": std_col.SVI}
    svi_df = svi_df.rename(columns=columns_to_standard)
    svi_df[std_col.SVI] = svi_df[std_col.SVI].apply(format_svi)
    cols_to_keep = columns_to_standard.values()
    svi_df = svi_df[cols_to_keep]
    df = df[[std_col.COUNTY_FIPS_COL,
             std_col.POPULATION_COL]]
    df = pd.merge(svi_df, df, how="outer", on=[
        std_col.COUNTY_FIPS_COL])

    return df
