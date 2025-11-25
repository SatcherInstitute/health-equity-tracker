import numpy as np
import pandas as pd
from datasources.data_source import DataSource
from ingestion.constants import (
    COUNTY_LEVEL,
    NATIONAL_LEVEL,
    US_FIPS,
    ALL_VALUE,
    CURRENT,
    HISTORICAL,
)
from ingestion.dataset_utils import (
    generate_pct_share_col_without_unknowns,
    generate_pct_rel_inequity_col,
    preserve_only_current_time_period_rows,
)
from ingestion import gcs_to_bq_util, standardized_columns as std_col
from ingestion.merge_utils import merge_county_names
from ingestion.het_types import HIV_BREAKDOWN_TYPE
from typing import cast

from ingestion.cdc_hiv_utils import (
    CDC_AGE,
    CDC_POP,
    CDC_RACE,
    CDC_SEX,
    CDC_STATE_FIPS,
    CDC_STATE_NAME,
    CDC_YEAR,
    PER_100K_MAP,
    TOTAL_DEATHS,
    BW_FLOAT_COLS_RENAME_MAP,
    BREAKDOWN_TO_STANDARD_BY_COL,
    TEST_PCT_SHARE_MAP,
    PCT_SHARE_MAP,
    HIV_METRICS,
    BASE_COLS_PER_100K,
    PCT_RELATIVE_INEQUITY_MAP,
    CDC_CASES,
    DTYPE,
    load_atlas_df_from_data_dir,
    get_bq_col_types,
    NA_VALUES,
)


class CDCHIVData(DataSource):
    @staticmethod
    def get_id():
        return "CDC_HIV_DATA"

    @staticmethod
    def get_table_name():
        return "cdc_hiv_data"

    def upload_to_gcs(self, gcs_bucket, **attrs):
        raise NotImplementedError("upload_to_gcs should not be called for CDCHIVData")

    def write_to_bq(self, dataset, gcs_bucket, **attrs):
        demographic = self.get_attr(attrs, "demographic")
        geo_level = self.get_attr(attrs, "geographic")

        # MAKE RACE-AGE BREAKDOWN WITH ONLY COUNTS (NOT RATES) FOR AGE-ADJUSTMENT
        if geo_level != COUNTY_LEVEL and demographic == std_col.RACE_OR_HISPANIC_COL:
            race_age_table_id = f"multi_race_age_{geo_level}"
            race_age_df = self.generate_race_age_deaths_df(geo_level)
            float_cols = [TOTAL_DEATHS, std_col.POPULATION_COL]
            col_types = gcs_to_bq_util.get_bq_column_types(race_age_df, float_cols)
            gcs_to_bq_util.add_df_to_bq(race_age_df, dataset, race_age_table_id, column_types=col_types)

        # WE DONT SHOW BLACK WOMEN AT COUNTY LEVEL
        if geo_level == COUNTY_LEVEL and demographic == std_col.BLACK_WOMEN:
            return

        all = "black_women_all" if demographic == std_col.BLACK_WOMEN else "all"
        alls_df = load_atlas_df_from_data_dir(geo_level, all)
        df = self.generate_breakdown_df(demographic, geo_level, alls_df)

        # MAKE TWO TABLES: ONE FOR TIME WITH MORE ROWS AND ONE FOR CURRENT WITH MORE COLS
        for time_view in (CURRENT, HISTORICAL):
            # copy so iterative changes dont interfere
            df_for_bq = df.copy()

            table_demo = demographic if demographic != std_col.BLACK_WOMEN else "black_women_by_age"
            table_id = gcs_to_bq_util.make_bq_table_id(table_demo, geo_level, time_view)
            if demographic == std_col.BLACK_WOMEN:
                df_for_bq.rename(columns=BW_FLOAT_COLS_RENAME_MAP, inplace=True)
            else:
                df_for_bq.rename(columns={std_col.POPULATION_COL: std_col.HIV_POPULATION}, inplace=True)

            col_types = get_bq_col_types(demographic, geo_level, time_view)

            # drop unneeded rows from current
            if time_view == CURRENT:
                df_for_bq = preserve_only_current_time_period_rows(df_for_bq)

            # drop unneeded columns to reduce file size
            keep_cols = col_types.keys()
            df_for_bq = df_for_bq[keep_cols]

            gcs_to_bq_util.add_df_to_bq(df_for_bq, dataset, table_id, column_types=col_types)

    def generate_breakdown_df(self, breakdown: str, geo_level: str, alls_df: pd.DataFrame):
        """generate_breakdown_df generates a HIV data frame by breakdown and geo_level

        breakdown: string equal to `age`, `black_women`, `race_and_ethnicity`, or `sex`
        geo_level: string equal to `county`, `national`, or `state`
        alls_df: the data frame containing the all values for each demographic breakdown
        return: a data frame of time-based HIV data by breakdown and geo_level"""

        geo_to_use = std_col.COUNTY_NAME_COL if geo_level == COUNTY_LEVEL else std_col.STATE_NAME_COL
        fips_to_use = std_col.COUNTY_FIPS_COL if geo_level == COUNTY_LEVEL else std_col.STATE_FIPS_COL

        cols_to_standard = {
            CDC_AGE: std_col.AGE_COL,
            CDC_STATE_FIPS: fips_to_use,
            CDC_STATE_NAME: geo_to_use,
            CDC_POP: std_col.POPULATION_COL,
            CDC_RACE: std_col.RACE_CATEGORY_ID_COL,
            CDC_SEX: std_col.SEX_COL,
            CDC_YEAR: std_col.TIME_PERIOD_COL,
        }

        breakdown_group_df = load_atlas_df_from_data_dir(geo_level, breakdown)

        combined_group_df = pd.concat([breakdown_group_df, alls_df], axis=0)

        df = combined_group_df.rename(columns=cols_to_standard)

        df = df.replace(to_replace=BREAKDOWN_TO_STANDARD_BY_COL)  # type: ignore[arg-type]

        if geo_level == COUNTY_LEVEL:
            df = merge_county_names(df)
            df[std_col.STATE_FIPS_COL] = df[std_col.COUNTY_FIPS_COL].str.slice(0, 2)

        if geo_level == NATIONAL_LEVEL:
            df[std_col.STATE_FIPS_COL] = US_FIPS

        if breakdown in [std_col.RACE_OR_HISPANIC_COL, std_col.BLACK_WOMEN]:
            std_col.add_race_columns_from_category_id(df)

        if breakdown != std_col.BLACK_WOMEN:
            if std_col.HIV_DEATHS_PREFIX not in df.columns:
                df[[std_col.HIV_DEATHS_PREFIX, PER_100K_MAP[std_col.HIV_DEATHS_PREFIX]]] = np.nan

            if std_col.HIV_PREP_PREFIX not in df.columns:
                df[[std_col.HIV_PREP_PREFIX, std_col.HIV_PREP_COVERAGE]] = np.nan

            if std_col.HIV_STIGMA_INDEX not in df.columns:
                df[[std_col.HIV_STIGMA_INDEX]] = np.nan

        if breakdown == std_col.BLACK_WOMEN:
            df = generate_pct_share_col_without_unknowns(
                df,
                TEST_PCT_SHARE_MAP,
                cast(HIV_BREAKDOWN_TYPE, std_col.AGE_COL),
                std_col.ALL_VALUE,
            )

        else:
            df = generate_pct_share_col_without_unknowns(
                df,
                PCT_SHARE_MAP,
                cast(HIV_BREAKDOWN_TYPE, breakdown),
                std_col.ALL_VALUE,
            )

        for col in HIV_METRICS.values():
            pop_col = std_col.HIV_POPULATION_PCT
            if col == std_col.HIV_PREP_PREFIX:
                pop_col = std_col.HIV_PREP_POPULATION_PCT
            if col == std_col.HIV_CARE_PREFIX:
                pop_col = std_col.HIV_CARE_POPULATION_PCT
            if breakdown == std_col.BLACK_WOMEN:
                pop_col == "black_women_population_count"

            if (breakdown == std_col.BLACK_WOMEN) and (col in BASE_COLS_PER_100K):
                df = generate_pct_rel_inequity_col(df, PCT_SHARE_MAP[col], pop_col, PCT_RELATIVE_INEQUITY_MAP[col])

            elif breakdown != std_col.BLACK_WOMEN:
                if col != std_col.HIV_STIGMA_INDEX:
                    df = generate_pct_rel_inequity_col(df, PCT_SHARE_MAP[col], pop_col, PCT_RELATIVE_INEQUITY_MAP[col])

        return df

    def generate_race_age_deaths_df(self, geo_level):
        """load in CDC Atlas HIV Deaths tables from /data
        for "ALL" and for "by race by age" by geo_level,
        merge and keep the counts needed for age-adjustment"""

        use_cols = [
            CDC_YEAR,
            CDC_STATE_NAME,
            CDC_STATE_FIPS,
            CDC_AGE,
            CDC_RACE,
            CDC_CASES,
            CDC_POP,
        ]

        # ALL RACE x ALL AGE
        alls_df = gcs_to_bq_util.load_csv_as_df_from_data_dir(
            "cdc_hiv",
            f"hiv_deaths-{geo_level}-all.csv",
            subdirectory="hiv_deaths",
            na_values=NA_VALUES,
            usecols=use_cols,
            thousands=",",
            dtype=DTYPE,
        )
        alls_df = preserve_only_current_time_period_rows(alls_df, keep_time_period_col=True, time_period_col=CDC_YEAR)
        alls_df[std_col.RACE_CATEGORY_ID_COL] = std_col.Race.ALL.value
        alls_df[std_col.AGE_COL] = ALL_VALUE
        alls_df = alls_df[use_cols]

        # RACE GROUPS x ALL AGE
        race_df = gcs_to_bq_util.load_csv_as_df_from_data_dir(
            "cdc_hiv",
            f"hiv_deaths-{geo_level}-race_and_ethnicity.csv",
            subdirectory="hiv_deaths",
            na_values=NA_VALUES,
            usecols=use_cols,
            thousands=",",
            dtype=DTYPE,
        )
        race_df = preserve_only_current_time_period_rows(race_df, keep_time_period_col=True, time_period_col=CDC_YEAR)
        race_df[std_col.AGE_COL] = ALL_VALUE
        race_df = race_df[use_cols]

        # ALL RACE x AGE GROUPS
        age_df = gcs_to_bq_util.load_csv_as_df_from_data_dir(
            "cdc_hiv",
            f"hiv_deaths-{geo_level}-age.csv",
            subdirectory="hiv_deaths",
            na_values=NA_VALUES,
            usecols=use_cols,
            thousands=",",
            dtype=DTYPE,
        )
        age_df = preserve_only_current_time_period_rows(age_df, keep_time_period_col=True, time_period_col=CDC_YEAR)
        age_df[std_col.RACE_CATEGORY_ID_COL] = std_col.Race.ALL.value
        age_df = age_df[use_cols]

        # RACE GROUPS x AGE GROUPS
        race_age_df = gcs_to_bq_util.load_csv_as_df_from_data_dir(
            "cdc_hiv",
            f"hiv_deaths-{geo_level}-race_and_ethnicity-age.csv",
            subdirectory="hiv_deaths",
            na_values=NA_VALUES,
            usecols=use_cols,
            thousands=",",
            dtype=DTYPE,
        )

        race_age_df = preserve_only_current_time_period_rows(
            race_age_df, keep_time_period_col=True, time_period_col=CDC_YEAR
        )
        # fix poorly formatted state names
        race_age_df[CDC_STATE_NAME] = race_age_df[CDC_STATE_NAME].str.replace("^", "", regex=False)

        df = pd.concat([alls_df, race_df, age_df, race_age_df], ignore_index=True)

        # rename columns
        df = df.rename(
            columns={
                CDC_YEAR: std_col.TIME_PERIOD_COL,
                CDC_STATE_NAME: std_col.STATE_NAME_COL,
                CDC_STATE_FIPS: std_col.STATE_FIPS_COL,
                CDC_AGE: std_col.AGE_COL,
                CDC_RACE: std_col.RACE_CATEGORY_ID_COL,
                CDC_CASES: TOTAL_DEATHS,
                CDC_POP: std_col.POPULATION_COL,
            }
        )

        # rename data items
        df = df.replace(to_replace=BREAKDOWN_TO_STANDARD_BY_COL)
        if geo_level == NATIONAL_LEVEL:
            df[std_col.STATE_FIPS_COL] = US_FIPS

        std_col.add_race_columns_from_category_id(df)
        return df
