import pandas as pd
from datasources.data_source import DataSource
from ingestion import gcs_to_bq_util, standardized_columns as std_col
from ingestion.cdc_wisqars_utils import (
    convert_columns_to_numeric,
    generate_cols_map,
    WISQARS_YEAR,
    WISQARS_URBANICITY,
    WISQARS_STATE,
    WISQARS_DEATHS,
    WISQARS_CRUDE_RATE,
    WISQARS_ALL,
    WISQARS_POP,
    WISQARS_AGE_GROUP,
    condense_age_groups,
    load_wisqars_as_df_from_data_dir,
)  # pylint: disable=no-name-in-module
from ingestion.constants import (
    CURRENT,
    HISTORICAL,
    NATIONAL_LEVEL,
    US_NAME,
)
from ingestion.dataset_utils import (
    generate_pct_rel_inequity_col,
    generate_pct_share_col_without_unknowns,
    generate_time_df_with_cols_and_types,
)
from ingestion.merge_utils import merge_state_ids
from ingestion.het_types import RATE_CALC_COLS_TYPE, WISQARS_VAR_TYPE, SEX_RACE_ETH_AGE_TYPE_OR_ALL, GEO_TYPE
from typing import List

"""
Data Source: CDC WISQARS

Description:
- The data is downloaded from the CDC WISQARS database.
- The downloaded data is stored locally in our data/cdc_wisqars directory for subsequent use.

Instructions for Downloading Data:
1. Visit the WISQARS website: https://wisqars.cdc.gov/reports/
2. Select the injury outcome:
    - `Fatal`
3. Select the year and race options:
    - `2018-2021 by Single Race`
4. Select the desired data years:
    - `2018-2021`
5. Select the geography:
    - `United States`
6. Select the intent:
    - `Homicide and Legal Intervention`
7. Select the mechanism:
    - `Firearm`
8. Select the demographic selections:
   - `All Ages`, `Males`, `Black`
5. Select appropriate report layout:
   - For black_men-national-all: `Year`, `None`, `None`, `None`
   - For black_men-national-urbanicity: `Year`, `None`, `Metro / Non-Metro`,`None`
   - For black_men-national-age: `Year`, `None`, `Age Group`,`None`
   - For black_men-state-all: `Year`, `State`, `None`, `None`
   - For black_men-state-urbanicity: `Year`, `State`, `Metro / Non-Metro`,`None`
   - For black_men-state-age: `Year`, `State`, `Age Group`,`None`

Notes:
- There is no county-level data.
- Single-race data is only available from 2018-2021.
- We could consider using the bridged-race from 2001-2018 to supplement the single-race data.

Last Updated: April 2024
"""

GUN_HOMICIDES_BM_PREFIX: WISQARS_VAR_TYPE = "gun_homicides_black_men"
ESTIMATED_TOTALS_MAP = generate_cols_map([GUN_HOMICIDES_BM_PREFIX], std_col.RAW_SUFFIX)
PCT_REL_INEQUITY_MAP = generate_cols_map(ESTIMATED_TOTALS_MAP.values(), std_col.PCT_REL_INEQUITY_SUFFIX)
PCT_SHARE_MAP = generate_cols_map(ESTIMATED_TOTALS_MAP.values(), std_col.PCT_SHARE_SUFFIX)
PCT_SHARE_MAP[std_col.GUN_HOMICIDES_BM_POP_RAW] = std_col.GUN_HOMICIDES_BM_POP_PCT
PER_100K_MAP = generate_cols_map([GUN_HOMICIDES_BM_PREFIX], std_col.PER_100K_SUFFIX)

TIME_MAP = {
    CURRENT: list(ESTIMATED_TOTALS_MAP.values())
    + list(PCT_SHARE_MAP.values())
    + list(PER_100K_MAP.values())
    + [std_col.GUN_HOMICIDES_BM_POP_RAW],
    HISTORICAL: list(PCT_REL_INEQUITY_MAP.values()) + list(PCT_SHARE_MAP.values()) + list(PER_100K_MAP.values()),
}


COL_DICTS: List[RATE_CALC_COLS_TYPE] = [
    {
        'numerator_col': 'gun_homicides_black_men_estimated_total',
        'denominator_col': 'gun_homicides_black_men_population_estimated_total',
        'rate_col': 'gun_homicides_black_men_per_100k',
    }
]


class CDCWisqarsBlackMenData(DataSource):
    @staticmethod
    def get_id():
        return "CDC_WISQARS_BLACK_MEN_DATA"

    @staticmethod
    def get_table_name():
        return "cdc_wisqars_black_men_data"

    def upload_to_gcs(self, gcs_bucket, **attrs):
        raise NotImplementedError("upload_to_gcs should not be called for CDCWisqarsBlackMenData")

    def write_to_bq(self, dataset, gcs_bucket, **attrs):
        demographic: SEX_RACE_ETH_AGE_TYPE_OR_ALL = self.get_attr(attrs, "demographic")
        geo_level: GEO_TYPE = self.get_attr(attrs, "geographic")

        alls_df = process_wisqars_black_men_df(WISQARS_ALL, geo_level)

        df = self.generate_breakdown_df(demographic, geo_level, alls_df)

        for table_type in [CURRENT, HISTORICAL]:
            table_name = f"black_men_by_{demographic}_{geo_level}_{table_type}"
            time_cols = TIME_MAP[table_type]

            df_for_bq, col_types = generate_time_df_with_cols_and_types(df, time_cols, table_type, demographic)

            gcs_to_bq_util.add_df_to_bq(df_for_bq, dataset, table_name, column_types=col_types)

    def generate_breakdown_df(
        self, demographic: SEX_RACE_ETH_AGE_TYPE_OR_ALL, geo_level: GEO_TYPE, alls_df: pd.DataFrame
    ):
        cols_to_standard = {
            WISQARS_YEAR: std_col.TIME_PERIOD_COL,
            WISQARS_STATE: std_col.STATE_NAME_COL,
            WISQARS_URBANICITY: std_col.URBANICITY_COL,
            WISQARS_AGE_GROUP: std_col.AGE_COL,
        }

        breakdown_group_df = process_wisqars_black_men_df(demographic, geo_level)
        combined_group_df = pd.concat([breakdown_group_df, alls_df], axis=0)
        df = combined_group_df.rename(columns=cols_to_standard)
        if demographic == std_col.AGE_COL:
            df = condense_age_groups(df, COL_DICTS)

        df = merge_state_ids(df)

        df = generate_pct_share_col_without_unknowns(
            df,
            PCT_SHARE_MAP,
            demographic,
            std_col.ALL_VALUE,
        )

        for col in ESTIMATED_TOTALS_MAP.values():
            df = generate_pct_rel_inequity_col(
                df, PCT_SHARE_MAP[col], std_col.GUN_HOMICIDES_BM_POP_PCT, PCT_REL_INEQUITY_MAP[col]
            )

        return df


def process_wisqars_black_men_df(demographic: SEX_RACE_ETH_AGE_TYPE_OR_ALL, geo_level: GEO_TYPE):
    output_df = pd.DataFrame(columns=[WISQARS_YEAR, WISQARS_STATE, WISQARS_URBANICITY])

    for variable_string in [GUN_HOMICIDES_BM_PREFIX]:
        df = load_wisqars_as_df_from_data_dir(variable_string, geo_level, demographic)

        # removes the metadata section from the csv
        metadata_start_index = df[df[WISQARS_YEAR] == "Total"].index
        metadata_start_index = metadata_start_index[0]
        df = df.iloc[:metadata_start_index]

        # cleans data frame
        columns_to_convert = [WISQARS_DEATHS, WISQARS_CRUDE_RATE]
        convert_columns_to_numeric(df, columns_to_convert)

        if geo_level == NATIONAL_LEVEL:
            df.insert(1, WISQARS_STATE, US_NAME)

        if demographic == WISQARS_ALL:
            df.insert(2, WISQARS_URBANICITY, std_col.ALL_VALUE)
            df.insert(3, WISQARS_AGE_GROUP, std_col.ALL_VALUE)
        elif demographic == std_col.AGE_COL:
            df[WISQARS_AGE_GROUP] = df[WISQARS_AGE_GROUP].str.replace(' to ', '-')

        df.rename(
            columns={
                WISQARS_DEATHS: std_col.GUN_HOMICIDES_BM_RAW,
                WISQARS_POP: std_col.GUN_HOMICIDES_BM_POP_RAW,
                WISQARS_CRUDE_RATE: std_col.GUN_HOMICIDES_BM_PER_100K,
            },
            inplace=True,
        )

        output_df = output_df.merge(df, how='outer')

    return output_df
