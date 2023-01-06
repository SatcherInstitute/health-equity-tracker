import ingestion.standardized_columns as std_col
from datasources.data_source import DataSource
from ingestion import gcs_to_bq_util
import numpy as np
import pandas as pd  # type: ignore


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

        for geo_level in ["national", "state", "county"]:

            df = self.generate_breakdown(geo_level)

            if geo_level == "county":
                float_cols.append(std_col.SVI)
            column_types = gcs_to_bq_util.get_bq_column_types(
                df, float_cols=float_cols)
            gcs_to_bq_util.add_df_to_bq(
                df, dataset, f'{geo_level}', column_types=column_types)

    def generate_breakdown(self, geo_level: str):

        pop_df = gcs_to_bq_util.load_df_from_bigquery(
            'acs_population', f'by_age_{geo_level}')

        pop_df.to_csv(f'pop-{geo_level}.csv', index=False)

        # only keep ALL rows
        pop_df = pop_df.loc[pop_df[std_col.AGE_COL] == std_col.ALL_VALUE]

        if geo_level == "county":

            # load SVI from /data
            svi_df = gcs_to_bq_util.load_csv_as_df_from_data_dir(
                'cdc_svi_county', "cdc_svi_county_totals.csv", dtype={'FIPS': str})
            columns_to_standard = {
                "FIPS": std_col.COUNTY_FIPS_COL,
                "RPL_THEMES": std_col.SVI,
            }
            svi_df = svi_df.rename(columns=columns_to_standard)
            svi_df["svi"] = svi_df["svi"].apply(format_svi)
            cols_to_keep = columns_to_standard.values()
            svi_df = svi_df[cols_to_keep]

            pop_df = pop_df[[std_col.COUNTY_FIPS_COL,
                             std_col.POPULATION_COL]]

            df = pd.merge(svi_df, pop_df, how="outer", on=[
                          std_col.COUNTY_FIPS_COL])

            df = merge_county_names(df)

        if geo_level == "state":

            pop_df = pop_df[[std_col.STATE_FIPS_COL, std_col.POPULATION_COL]]

            pop_2010_df = gcs_to_bq_util.load_df_from_bigquery(
                'acs_2010_population', 'by_age_territory')

            pop_2010_df.to_csv('pop-terr.csv', index=False)

            # only keep ALL rows
            pop_2010_df = pop_2010_df.loc[pop_2010_df[std_col.AGE_COL]
                                          == std_col.ALL_VALUE]

            pop_2010_df = pop_2010_df[[
                std_col.STATE_FIPS_COL, std_col.POPULATION_COL]]

            df = pd.concat([pop_df, pop_2010_df]).reset_index(drop=True)
            df = merge_state_ids(df)

        if geo_level == "national":

            pop_df = pop_df[[std_col.STATE_FIPS_COL, std_col.POPULATION_COL]]
            df = merge_state_ids(pop_df)

            df = df[[std_col.STATE_FIPS_COL, std_col.STATE_NAME_COL,
                     std_col.POPULATION_COL]]

        return df
