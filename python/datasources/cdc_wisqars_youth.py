import pandas as pd

from datasources.data_source import DataSource
from ingestion import gcs_to_bq_util, standardized_columns as std_col
from ingestion.cdc_wisqars_utils import (
    convert_columns_to_numeric,
    standardize_and_merge_race_ethnicity,
    WISQARS_COLS,
)
from ingestion.constants import (
    CURRENT,
    HISTORICAL,
    NATIONAL_LEVEL,
    US_NAME,
)
from ingestion.dataset_utils import (
    generate_pct_rel_inequity_col,
    generate_pct_share_col_with_unknowns,
    preserve_only_current_time_period_rows,
)
from ingestion.merge_utils import merge_state_ids


DATA_DIR = "cdc_wisqars"

"""
Data Source: CDC WISQARS Youth (data on gun violence)

Description:
- The data on gun violence by youth and race is downloaded from the CDC WISQARS database.
- The downloaded data is stored locally in our directory for subsequent use.

Instructions for Downloading Data:
1. Visit the WISQARS website: https://wisqars.cdc.gov/reports/
2. Select the desired injury outcome:
   - select fatal data
3. Choose the demographic selections for the report:
   - select the appropriate data years, geographic level, and other demographic groups, i.e (age, race)
4. Select the mechanism (Firearm)
5. Select appropriate report layout:
   - For fatal: Year, Intent, State(only if state-level data is needed), and demographic (if not all)

Notes:
- There is no county-level data
- Race data is only available for fatal data and is available from 2018-2021

Last Updated: 2/24
"""


class CDCWisqarsYouthData(DataSource):
    @staticmethod
    def get_id():
        return "CDC_WISQARS_YOUTH_DATA"

    @staticmethod
    def get_table_name():
        return "cdc_wisqars_youth_data"

    def upload_to_gcs(self, gcs_bucket, **attrs):
        raise NotImplementedError("upload_to_gcs should not be called for CDCHIVData")

    def write_to_bq(self, dataset, gcs_bucket, **attrs):
        demographic = self.get_attr(attrs, "demographic")
        geo_level = self.get_attr(attrs, "geographic")

        nat_totals_by_intent_df = load_wisqars_df_from_data_dir("all", geo_level)

        df = self.generate_breakdown_df(demographic, geo_level, nat_totals_by_intent_df)

        float_cols = [
            std_col.POPULATION_COL,
            std_col.GUN_DEATHS_RAW,
            std_col.GUN_DEATHS_PER_100K,
            std_col.GUN_DEATHS_PCT_SHARE,
            std_col.POPULATION_PCT_COL,
            std_col.GUN_DEATHS_PCT_REL_INEQUITY,
        ]

        df[float_cols] = df[float_cols].astype(float)

        for table_type in [CURRENT, HISTORICAL]:
            df_for_bq = df.copy()
            table_name = f"youth_by_{demographic}_{geo_level}_{table_type}"

            if table_type == CURRENT:
                df_for_bq[std_col.TIME_PERIOD_COL] = (
                    df_for_bq[std_col.TIME_PERIOD_COL] + '-01'
                )

                df_for_bq = preserve_only_current_time_period_rows(df_for_bq)

            col_types = gcs_to_bq_util.get_bq_column_types(df_for_bq, float_cols)

            gcs_to_bq_util.add_df_to_bq(
                df_for_bq, dataset, table_name, column_types=col_types
            )

    def generate_breakdown_df(
        self, breakdown: str, geo_level: str, alls_df: pd.DataFrame
    ):
        cols_to_standard = {
            "Year": std_col.TIME_PERIOD_COL,
            "State": std_col.STATE_NAME_COL,
            "Race": std_col.RACE_CATEGORY_ID_COL,
            "Population": std_col.POPULATION_COL,
            "Deaths": std_col.GUN_DEATHS_RAW,
            "Crude Rate": std_col.GUN_DEATHS_PER_100K,
        }

        breakdown_group_df = load_wisqars_df_from_data_dir(breakdown, geo_level)

        combined_group_df = pd.concat([breakdown_group_df, alls_df], axis=0)

        df = combined_group_df.rename(columns=cols_to_standard)

        std_col.add_race_columns_from_category_id(df)

        df = merge_state_ids(df)

        df = generate_pct_share_col_with_unknowns(
            df,
            {
                std_col.GUN_DEATHS_RAW: std_col.GUN_DEATHS_PCT_SHARE,
                std_col.POPULATION_COL: std_col.POPULATION_PCT_COL,
            },
            std_col.RACE_OR_HISPANIC_COL,
            std_col.ALL_VALUE,
            std_col.Race.ETHNICITY_UNKNOWN.race,
        )

        df = generate_pct_rel_inequity_col(
            df,
            std_col.GUN_DEATHS_PCT_SHARE,
            std_col.POPULATION_PCT_COL,
            std_col.GUN_DEATHS_PCT_REL_INEQUITY,
        )

        gun_deaths_column_order = [
            std_col.TIME_PERIOD_COL,
            std_col.STATE_NAME_COL,
            std_col.STATE_FIPS_COL,
            std_col.RACE_OR_HISPANIC_COL,
            std_col.RACE_CATEGORY_ID_COL,
            std_col.POPULATION_COL,
            std_col.GUN_DEATHS_RAW,
            std_col.GUN_DEATHS_PER_100K,
            std_col.GUN_DEATHS_PCT_SHARE,
            std_col.POPULATION_PCT_COL,
            std_col.GUN_DEATHS_PCT_REL_INEQUITY,
        ]

        df = (
            df[gun_deaths_column_order]
            .sort_values(
                by=[std_col.TIME_PERIOD_COL, std_col.STATE_NAME_COL],
                ascending=[False, True],
            )
            .reset_index(drop=True)
        )

        return df


def load_wisqars_df_from_data_dir(breakdown: str, geo_level: str):
    df = gcs_to_bq_util.load_csv_as_df_from_data_dir(
        DATA_DIR,
        f"fatal_gun_injuries_youth-{geo_level}-{breakdown}.csv",
        na_values=["--", "**"],
        usecols=lambda x: x not in WISQARS_COLS,
        thousands=",",
        dtype={"Year": str},
    )

    # removes the metadata section from the csv
    metadata_start_index = df[df["Year"] == "Total"].index
    metadata_start_index = metadata_start_index[0]
    df = df.iloc[:metadata_start_index]

    # cleans data frame
    columns_to_convert = ["Deaths", "Crude Rate"]
    convert_columns_to_numeric(df, columns_to_convert)

    if geo_level == NATIONAL_LEVEL:
        df.insert(1, "State", US_NAME)

    if breakdown == "all":
        df.insert(2, "Race", std_col.Race.ALL.value)

    if 'Ethnicity' in df.columns.to_list():
        df = standardize_and_merge_race_ethnicity(df)

    df = df[["Year", "State", "Race", "Population", "Deaths", "Crude Rate"]]

    return df
