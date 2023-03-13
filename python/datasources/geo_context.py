import ingestion.standardized_columns as std_col
from ingestion.constants import (NATIONAL_LEVEL, STATE_LEVEL, COUNTY_LEVEL)
from datasources.data_source import DataSource
from ingestion import gcs_to_bq_util
import numpy as np
import pandas as pd  # type: ignore
from typing import Literal


from ingestion.merge_utils import (merge_county_names, merge_state_ids)


def format_svi(value: float):
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

    def generate_breakdown(self, geo_level: str):

        # load population table
        df = gcs_to_bq_util.load_df_from_bigquery(
            'acs_population', f'by_age_{geo_level}')

        # only keep ALL rows
        df = df.loc[df[std_col.AGE_COL] == std_col.ALL_VALUE]

        if geo_level == COUNTY_LEVEL:
            df = merge_svi_data(df)
            df = merge_county_names(df)
            df = df.sort_values(std_col.COUNTY_FIPS_COL).reset_index(drop=True)
        if geo_level == STATE_LEVEL:
            df = add_territory_populations(df)
        if geo_level == STATE_LEVEL or geo_level == NATIONAL_LEVEL:
            # drop initial state_names to standardize on merge_state_ids()
            df = df.drop(columns=[std_col.STATE_NAME_COL])
            df = merge_state_ids(df)
            # drop unneeded cols
            df = df[[std_col.STATE_FIPS_COL, std_col.STATE_NAME_COL,
                     std_col.POPULATION_COL]]
            df = df.sort_values(std_col.STATE_FIPS_COL).reset_index(drop=True)

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


def add_territory_populations(df: pd.DataFrame, geo_level: Literal["county", "state"]):
    """ Add rows with territory populations to state and county level dfs

    Parameters:
        df: df containing a row for every location's total population, and columns
            for "population" and FIP
        geo_level: string "county" or "state" for which geographic level should be merged

    Returns:
        df with added rows for every territory or territory county equivalent"""

    if geo_level not in [COUNTY_LEVEL, STATE_LEVEL]:
        raise ValueError(
            f'Invalid argument for geo_level: {geo_level}\nMust be one of `county` or `state`')

    # load territory population table (demographic breakdown doesn't matter because we
    # are only retrieving the ALL values which are the same for every breakdown type)
    terr_pop_df = gcs_to_bq_util.load_df_from_bigquery(
        'decia_2020_territory_population', f'by_age_territory_{geo_level}_level')

    # only keep ALL rows,
    terr_pop_df = terr_pop_df.loc[terr_pop_df[std_col.AGE_COL]
                                  == std_col.ALL_VALUE]
    geo_col = std_col.COUNTY_FIPS_COL if geo_level == COUNTY_LEVEL else std_col.STATE_FIPS_COL
    terr_pop_df = terr_pop_df[[
        geo_col, std_col.POPULATION_COL]]

    # append territory ROWS
    df = pd.concat([df, terr_pop_df]).reset_index(drop=True)

    return df
