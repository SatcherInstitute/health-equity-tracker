"""
This documentation outlines the procedure for acquiring gun violence data for the youth/young adult
population from the CDC WISQARS database. The data, once downloaded, is stored locally in
the `data/cdc_wisqars` directory for further processing and analysis.

Instructions for Downloading Data:
1. Access the WISQARS website at https://wisqars.cdc.gov/reports/.
2. Select `Fatal` as the injury outcome.
3. Specify the data years of interest, from `2018-2021 by Single Race`.
4. Set geography to `United States`.
5. Choose `All Intents` for the intent.
6. Under mechanism, opt for `Firearm`.
7. For youth demographics, select `Custom Age Range: <1 to 17`, `Both Sexes`, `All Races`.
8. For youth demographics, select `Custom Age Range: 18 to 25`, `Both Sexes`, `All Races`.
9. Decide on the report layout based on your requirements:
   - For youth-national-all: `Intent`, `None`, `None`, `None`
   - For youth-national-race: `Intent`, `Race`, `Ethnicity`, `None`
   - For youth-state-all: `Intent`, `State`, `None`, `None`
   - For youth-state-race: `Intent`, `State`, `Race`, `Ethnicity`

Notes:
- There is no county-level data.
- Race data is provided only for fatal data outcomes and covers the period from 2018-2021.

Last Updated: 4/23
"""

import pandas as pd
from datasources.data_source import DataSource
from ingestion import gcs_to_bq_util, standardized_columns as std_col
from ingestion.cdc_wisqars_utils import (
    generate_cols_map,
    RACE_NAMES_MAPPING,
    load_wisqars_as_df_from_data_dir,
    WISQARS_ALL,
)
from ingestion.constants import (
    CURRENT,
    HISTORICAL,
)
from ingestion.dataset_utils import (
    combine_race_ethnicity,
    generate_pct_rel_inequity_col,
    generate_pct_share_col_with_unknowns,
    generate_per_100k_col,
    generate_time_df_with_cols_and_types,
)
from ingestion.merge_utils import merge_state_ids
from ingestion.het_types import WISQARS_DEMO_TYPE, GEO_TYPE, WISQARS_VAR_TYPE
from typing import List

CATEGORIES_LIST: List[WISQARS_VAR_TYPE] = [std_col.GUN_DEATHS_YOUNG_ADULTS_PREFIX, std_col.GUN_DEATHS_YOUTH_PREFIX]
ESTIMATED_TOTALS_MAP = generate_cols_map(CATEGORIES_LIST, std_col.RAW_SUFFIX)
PCT_REL_INEQUITY_MAP = generate_cols_map(ESTIMATED_TOTALS_MAP.values(), std_col.PCT_REL_INEQUITY_SUFFIX)
PCT_SHARE_MAP = generate_cols_map(ESTIMATED_TOTALS_MAP.values(), std_col.PCT_SHARE_SUFFIX)
PCT_SHARE_MAP[std_col.GUN_DEATHS_YOUNG_ADULTS_POPULATION] = std_col.GUN_DEATHS_YOUNG_ADULTS_POP_PCT
PCT_SHARE_MAP[std_col.GUN_DEATHS_YOUTH_POPULATION] = std_col.GUN_DEATHS_YOUTH_POP_PCT
PER_100K_MAP = generate_cols_map(CATEGORIES_LIST, std_col.PER_100K_SUFFIX)

TIME_MAP = {
    CURRENT: list(ESTIMATED_TOTALS_MAP.values())
    + list(PCT_SHARE_MAP.values())
    + list(PER_100K_MAP.values())
    + [std_col.GUN_DEATHS_YOUNG_ADULTS_POPULATION, std_col.GUN_DEATHS_YOUTH_POPULATION],
    HISTORICAL: list(PCT_REL_INEQUITY_MAP.values()) + list(PCT_SHARE_MAP.values()) + list(PER_100K_MAP.values()),
}


class CDCWisqarsYouthData(DataSource):
    @staticmethod
    def get_id():
        return "CDC_WISQARS_YOUTH_DATA"

    @staticmethod
    def get_table_name():
        return "cdc_wisqars_youth_data"

    def upload_to_gcs(self, gcs_bucket, **attrs):
        raise NotImplementedError("upload_to_gcs should not be called for CDCWisqarsYouthData")

    def write_to_bq(self, dataset, gcs_bucket, **attrs):
        demographic: WISQARS_DEMO_TYPE = self.get_attr(attrs, "demographic")  # type: ignore
        geo_level: GEO_TYPE = self.get_attr(attrs, "geographic")  # type: ignore

        national_totals_by_intent_df = process_wisqars_youth_df(WISQARS_ALL, geo_level)

        df = self.generate_breakdown_df(demographic, geo_level, national_totals_by_intent_df)

        for time_view in [CURRENT, HISTORICAL]:
            table_demo = f"youth_by_{demographic}"
            table_id = gcs_to_bq_util.make_bq_table_id(table_demo, geo_level, time_view)
            time_cols = TIME_MAP[time_view]

            df_for_bq, col_types = generate_time_df_with_cols_and_types(df, time_cols, time_view, demographic)

            gcs_to_bq_util.add_df_to_bq(df_for_bq, dataset, table_id, column_types=col_types)

    def generate_breakdown_df(self, demographic: WISQARS_DEMO_TYPE, geo_level: GEO_TYPE, alls_df: pd.DataFrame):
        cols_to_standard = {
            "year": std_col.TIME_PERIOD_COL,
            "state": std_col.STATE_NAME_COL,
        }

        breakdown_group_df = process_wisqars_youth_df(demographic, geo_level)
        combined_group_df = pd.concat([breakdown_group_df, alls_df], axis=0)
        df = combined_group_df.rename(columns=cols_to_standard)
        std_col.add_race_columns_from_category_id(df)
        df = merge_state_ids(df)

        df = generate_pct_share_col_with_unknowns(
            df,
            PCT_SHARE_MAP,
            std_col.RACE_OR_HISPANIC_COL,
            std_col.ALL_VALUE,
            "Unknown race",
        )

        for col in ESTIMATED_TOTALS_MAP.values():
            pop_col = (
                std_col.GUN_DEATHS_YOUNG_ADULTS_POP_PCT
                if col == std_col.GUN_DEATHS_YOUNG_ADULTS_PREFIX
                else std_col.GUN_DEATHS_YOUTH_POP_PCT
            )
            df = generate_pct_rel_inequity_col(df, PCT_SHARE_MAP[col], pop_col, PCT_REL_INEQUITY_MAP[col])

        return df


def process_wisqars_youth_df(demographic: WISQARS_DEMO_TYPE, geo_level: GEO_TYPE):
    output_df = pd.DataFrame(columns=["year", "state", "race"])

    for variable_string in [std_col.GUN_DEATHS_YOUNG_ADULTS_PREFIX, std_col.GUN_DEATHS_YOUTH_PREFIX]:

        df = load_wisqars_as_df_from_data_dir(variable_string, geo_level, demographic)

        # Convert column names to lowercase
        df.columns = df.columns.str.lower()

        if demographic == WISQARS_ALL:
            df.insert(2, std_col.RACE_CATEGORY_ID_COL, std_col.Race.ALL.value)

        if std_col.ETH_COL in df.columns.to_list():
            df = combine_race_ethnicity(
                df,
                ["deaths", "population", "crude rate"],
                RACE_NAMES_MAPPING,
                ethnicity_value="Hispanic",
                additional_group_cols=["year", "state"],
                treat_zero_count_as_missing=True,
            )

            # Identify rows where 'race' is 'HISP' or 'UNKNOWN'
            subset_mask = df[std_col.RACE_CATEGORY_ID_COL].isin(["HISP", "UNKNOWN"])

            # Create a temporary DataFrame with just the subset
            temp_df = df[subset_mask].copy()

            # Apply the function to the temporary DataFrame
            temp_df = generate_per_100k_col(temp_df, "deaths", "population", "crude rate")

            # Update the original DataFrame with the results for the 'crude rate' column
            df.loc[subset_mask, "crude rate"] = temp_df["crude rate"]

        df.rename(
            columns={
                "deaths": f"{variable_string}_{std_col.RAW_SUFFIX}",
                "population": f"{variable_string}_{std_col.POPULATION_COL}",
                "crude rate": f"{variable_string}_{std_col.PER_100K_SUFFIX}",
            },
            inplace=True,
        )

        output_df = output_df.merge(df, how="outer")

    return output_df
