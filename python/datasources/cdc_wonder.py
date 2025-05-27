"""
This documentation outlines the procedure for acquiring cancer incidence data
for the general population from the CDC WONDER database. The data, once downloaded,
is stored locally in the `data/cdc_wonder` directory for further processing and
analysis.

Instructions for Downloading Data:
- Access the CDC WONDER website at https://wonder.cdc.gov/cancer.html
- Select the `Cancer Incidence 1999 - 2021` report and click `Data Request`

Section 1 - Group Results By:
- And By: Leading Cancer Sites
- And By: States and Puerto Rico OR States
- And By: [SELECT ONE DEMOGRAPHIC OPTION]:
  * Age Groups
  * Sex
  * Race
- And By: [OPTIONAL - SELECT IF USING RACE]:
  * Ethnicity (only when Race is selected above)
  * None (if not breaking down by ethnicity)

Measures (select Crude Rates)

Section 2 - Select Locations:
- Click "States and Puerto Rico" OR "States" button
- Note: Some race breakdowns only have states (without PR) breakdown

Section 3 - Select Year and Demographics:
- Year: All Years (1999-2021)
- Age Groups: All Ages (or specific age ranges if Age Groups selected in Section 1)
- Sex: Both (or specific sex if Sex selected in Section 1)
- Race: All Races (or specific races if Race selected in Section 1)
- Ethnicity: All Ethnicities (or specific ethnicities if Ethnicity selected in Section 1)

Section 4 - Select Cancers of Interest:
- Pick between: Leading Cancer Sites

Section 5 - Other Options:
- Export Results ✓
- Show Totals ✓
- Show Zero Values ✓
- Show Suppressed Values ✓

COMMON REPORT CONFIGURATIONS:

CANCER INCIDENCE - BY RACE National Level:
`Leading Cancer Sites`, `None`, `Race`, `Ethnicity`
Age Groups: All years


CANCER INCIDENCE - BY RACE State Level:
Options: `Leading Cancer Sites`, `States and Puerto Rico`, `Race`, `Ethnicity`

CANCER INCIDENCE - BY AGE National Level:
Options: `Leading Cancer Sites`, `None`, `Age Groups`, `None`
Age Groups: Select 50-54 years, 55-59 years, 60-64 years, 65-69 years, 70-74 years

CANCER INCIDENCE - BY AGE State Level:
Options: `Leading Cancer Sites`, `States and Puerto Rico`, `Age Groups`, `None`
Age Groups: Select 50-54 years, 55-59 years, 60-64 years, 65-69 years, 70-74 years

CANCER INCIDENCE - BY SEX National Level:
Options: `Leading Cancer Sites`, `None`, `Sex`, `None`

CANCER INCIDENCE - BY SEX State Level:
Options: `Leading Cancer Sites`, `States and Puerto Rico`, `Sex`, `None`

Last Updated: 5/27/2025
"""

import pandas as pd
from ingestion.cdc_wonder_utils import (
    ALL_CANCER_CONDITIONS,
    DEMOGRAPHIC_TO_STANDARD_BY_COL,
    CANCERS_WITH_SEX_DEMOGRAPHIC,
    TMP_ALL,
    get_float_cols,
    load_cdc_df_from_data_dir,
)
from datasources.data_source import DataSource
from ingestion import gcs_to_bq_util
from ingestion import standardized_columns as std_col
from ingestion.constants import (
    ALL_VALUE,
    CURRENT,
    HISTORICAL,
    NATIONAL_LEVEL,
    US_NAME,
)
from ingestion.dataset_utils import (
    generate_pct_rel_inequity_col,
    generate_pct_share_col_with_unknowns,
    generate_pct_share_col_without_unknowns,
    generate_time_df_with_cols_and_types,
)
from ingestion.het_types import CANCER_TYPE_OR_ALL, GEO_TYPE
from ingestion.merge_utils import merge_state_ids


class CdcWonderData(DataSource):
    @staticmethod
    def get_id():
        return "CDC_WONDER_DATA"

    @staticmethod
    def get_table_name():
        return "cdc_wonder_data"

    def upload_to_gcs(self, gcs_bucket, **attrs):
        raise NotImplementedError("upload_to_gcs should not be called for CdcWonderData")

    def write_to_bq(self, dataset, gcs_bucket, **attrs):
        demo_type = self.get_attr(attrs, "demographic")
        geo_level = self.get_attr(attrs, "geographic")

        df = self.generate_breakdown_df(demo_type, geo_level)

        for time_view in (CURRENT, HISTORICAL):
            table_id = gcs_to_bq_util.make_bq_table_id(demo_type, geo_level, time_view)
            conditions = CANCERS_WITH_SEX_DEMOGRAPHIC if demo_type == std_col.SEX_COL else ALL_CANCER_CONDITIONS
            float_cols = get_float_cols(time_view, conditions)

            df_for_bq, col_types = generate_time_df_with_cols_and_types(df, float_cols, time_view, demo_type)
            gcs_to_bq_util.add_df_to_bq(df_for_bq, dataset, table_id, column_types=col_types)

    def generate_breakdown_df(
        self,
        demo_breakdown: CANCER_TYPE_OR_ALL,
        geo_level: GEO_TYPE,
    ) -> pd.DataFrame:
        """Generates HET-stye dataframe by demo_breakdown and geo_level
        demo_breakdown: string equal to `age`, `race_and_ethnicity`, or `sex`
        geo_level: string equal to `national`, or `state`
        return: a breakdown df by demographic and geo_level"""

        demo_col = std_col.RACE_CATEGORY_ID_COL if demo_breakdown == std_col.RACE_OR_HISPANIC_COL else demo_breakdown
        all_val = std_col.Race.ALL.value if demo_breakdown == std_col.RACE_OR_HISPANIC_COL else ALL_VALUE

        conditions = CANCERS_WITH_SEX_DEMOGRAPHIC if demo_breakdown == std_col.SEX_COL else ALL_CANCER_CONDITIONS

        alls_df = load_cdc_df_from_data_dir(geo_level, TMP_ALL, conditions)
        alls_df[demo_col] = all_val

        breakdown_group_df = load_cdc_df_from_data_dir(geo_level, demo_breakdown, conditions)

        df = pd.concat([breakdown_group_df, alls_df], axis=0)
        df = df.replace(to_replace=DEMOGRAPHIC_TO_STANDARD_BY_COL)  # type: ignore[arg-type]

        if geo_level == NATIONAL_LEVEL:
            df[std_col.STATE_NAME_COL] = US_NAME
        else:
            df = merge_state_ids(df)

        count_to_pct_share_map = {}
        raw_totals_map = {}
        pct_share_map = {}
        pop_pct_share_map = {}
        pct_rel_inequity_map = {}

        for condition in conditions:
            # HET cols to make
            cancer_type = condition.lower()
            het_rate_numerator = f"{cancer_type}_count_{std_col.RAW_SUFFIX}"
            het_rate_denominator = f"{cancer_type}_{std_col.RAW_POP_SUFFIX}"
            het_pct_share = f"{cancer_type}_{std_col.PCT_SHARE_SUFFIX}"
            het_pop_pct_share = f"{cancer_type}_{std_col.POP_PCT_SUFFIX}"
            het_pct_rel_inequity = f"{cancer_type}_{std_col.PCT_REL_INEQUITY_SUFFIX}"

            # Pct share mappings
            count_to_pct_share_map[het_rate_numerator] = het_pct_share
            count_to_pct_share_map[het_rate_denominator] = het_pop_pct_share

            # Build mappings for inequity calculation
            raw_totals_map[cancer_type] = het_rate_numerator
            pct_share_map[het_rate_numerator] = het_pct_share
            pop_pct_share_map[het_rate_numerator] = het_pop_pct_share
            pct_rel_inequity_map[het_rate_numerator] = het_pct_rel_inequity

            if demo_breakdown == std_col.RACE_OR_HISPANIC_COL:
                std_col.add_race_columns_from_category_id(df)

        if demo_breakdown == std_col.AGE_COL:
            # For age breakdowns, calculate totals from available age groups
            non_all_df = df[df[demo_breakdown] != ALL_VALUE]
            for condition in conditions:
                count_col = f"{condition.lower()}_count_{std_col.RAW_SUFFIX}"
                if count_col in df.columns:
                    # Update the 'All' row with sum of available age groups
                    available_total = non_all_df[count_col].sum()
                    df.loc[df[demo_breakdown] == ALL_VALUE, count_col] = available_total

        if demo_breakdown in [std_col.AGE_COL, std_col.SEX_COL]:
            df = generate_pct_share_col_without_unknowns(
                df,
                count_to_pct_share_map,
                demo_breakdown,
                ALL_VALUE,
            )
        else:
            df = generate_pct_share_col_with_unknowns(
                df,
                count_to_pct_share_map,
                demo_breakdown,
                ALL_VALUE,
                std_col.Race.UNKNOWN.race,
            )

        for raw_total_col in raw_totals_map.values():
            if raw_total_col in df.columns:
                df = generate_pct_rel_inequity_col(
                    df,
                    pct_share_map[raw_total_col],
                    pop_pct_share_map[raw_total_col],
                    pct_rel_inequity_map[raw_total_col],
                )

        df = df.sort_values(by=[std_col.STATE_FIPS_COL, demo_col]).reset_index(drop=True)

        return df
