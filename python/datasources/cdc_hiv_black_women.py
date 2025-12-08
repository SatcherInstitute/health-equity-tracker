import pandas as pd
from datasources.data_source import DataSource
from ingestion import gcs_to_bq_util, standardized_columns as std_col
from ingestion.constants import NATIONAL_LEVEL, US_FIPS, CURRENT, HISTORICAL
from ingestion.het_types import GEO_TYPE, HIV_BREAKDOWN_TYPE
from ingestion.cdc_hiv_utils import (
    load_atlas_df_from_data_dir,
    BREAKDOWN_TO_STANDARD_BY_COL,
    TEST_PCT_SHARE_MAP,
    PCT_SHARE_MAP,
    PCT_RELATIVE_INEQUITY_MAP,
    BW_FLOAT_COLS_RENAME_MAP,
    get_bq_col_types,
)
from ingestion.dataset_utils import (
    generate_pct_share_col_without_unknowns,
    generate_pct_rel_inequity_col,
    preserve_only_current_time_period_rows,
)
from typing import cast

CDC_AGE = "Age Group"
CDC_POP = "Population"
CDC_RACE = "Race/Ethnicity"
CDC_SEX = "Sex"
CDC_STATE_NAME = "Geography"
CDC_STATE_FIPS = "FIPS"
CDC_YEAR = "Year"

HIV_DIRECTORY = "cdc_hiv_black_women"

HIV_METRICS = {
    "deaths": std_col.HIV_DEATHS_PREFIX,
    "diagnoses": std_col.HIV_DIAGNOSES_PREFIX,
    "prevalence": std_col.HIV_PREVALENCE_PREFIX,
}


class CDCHIVBlackWomenData(DataSource):
    @staticmethod
    def get_id():
        return "CDC_HIV_BLACK_WOMEN_DATA"

    @staticmethod
    def get_table_name():
        return "cdc_hiv_black_women_data"

    def upload_to_gcs(self, gcs_bucket, **attrs):
        raise NotImplementedError("upload_to_gcs should not be called for CDCHIVBlackWomenData")

    def write_to_bq(self, dataset, gcs_bucket, **attrs):
        demographic = self.get_attr(attrs, "demographic")
        geo_level = self.get_attr(attrs, "geographic")

        alls_df = load_atlas_df_from_data_dir(geo_level, "black_women_all")
        df = self.generate_breakdown_df(demographic, geo_level, alls_df)

        for time_view in (CURRENT, HISTORICAL):
            df_for_bq = df.copy()

            table_demo = "black_women_by_age"
            table_id = gcs_to_bq_util.make_bq_table_id(table_demo, geo_level, time_view)
            df_for_bq.rename(columns=BW_FLOAT_COLS_RENAME_MAP, inplace=True)
            col_types = get_bq_col_types(demographic, geo_level, time_view)

            if time_view == CURRENT:
                df_for_bq = preserve_only_current_time_period_rows(df_for_bq)

            keep_cols = col_types.keys()
            df_for_bq = df_for_bq[keep_cols]

            gcs_to_bq_util.add_df_to_bq(df_for_bq, dataset, table_id, column_types=col_types)

    def generate_breakdown_df(self, breakdown: HIV_BREAKDOWN_TYPE, geo_level: GEO_TYPE, alls_df: pd.DataFrame):
        """generate_breakdown_df generates a HIV data frame by breakdown and geo_level

        breakdown: string equal to `black_women`
        geo_level: string equal to `national`, or `state`
        alls_df: the data frame containing the all values for each demographic breakdown
        return: a data frame of time-based HIV data by breakdown and geo_level"""

        cols_to_standard = {
            CDC_AGE: std_col.AGE_COL,
            CDC_STATE_FIPS: std_col.STATE_FIPS_COL,
            CDC_STATE_NAME: std_col.STATE_NAME_COL,
            CDC_POP: std_col.POPULATION_COL,
            CDC_RACE: std_col.RACE_CATEGORY_ID_COL,
            CDC_SEX: std_col.SEX_COL,
            CDC_YEAR: std_col.TIME_PERIOD_COL,
        }

        breakdown_group_df = load_atlas_df_from_data_dir(geo_level, breakdown)

        combined_group_df = pd.concat([breakdown_group_df, alls_df], axis=0)

        df = combined_group_df.rename(columns=cols_to_standard)

        df = df.replace(to_replace=BREAKDOWN_TO_STANDARD_BY_COL)

        if geo_level == NATIONAL_LEVEL:
            df[std_col.STATE_FIPS_COL] = US_FIPS

        std_col.add_race_columns_from_category_id(df)

        df = generate_pct_share_col_without_unknowns(
            df,
            TEST_PCT_SHARE_MAP,
            cast(HIV_BREAKDOWN_TYPE, std_col.AGE_COL),
            std_col.ALL_VALUE,
        )

        for col in HIV_METRICS.values():
            pop_col = std_col.HIV_POPULATION_PCT
            df = generate_pct_rel_inequity_col(df, PCT_SHARE_MAP[col], pop_col, PCT_RELATIVE_INEQUITY_MAP[col])

        return df
