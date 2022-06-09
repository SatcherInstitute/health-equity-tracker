from datasources.data_source import DataSource
import ingestion.standardized_columns as std_col
import numpy as np
import pandas as pd
from ingestion.standardized_columns import Race
from ingestion import gcs_to_bq_util, dataset_utils
from ingestion.constants import NATIONAL_LEVEL, STATE_LEVEL
from ingestion.dataset_utils import generate_per_100k_col
from datasources.bjs_table_utils import (standardize_table_2_df,
                                         standardize_table_10_df,
                                         standardize_table_13_df,
                                         standardize_table_23_df,
                                         standardize_appendix_table_2_df,
                                         NON_NULL_RAW_COUNT_GROUPS,
                                         cols_to_rows,
                                         keep_only_national,
                                         keep_only_states,
                                         BJS_DATA_TYPES,
                                         STANDARD_RACE_CODES,
                                         BJS_SEX_GROUPS,
                                         RAW_COL,
                                         PER_100K_COL,
                                         PCT_SHARE_COL,
                                         APPENDIX_TABLE_2,
                                         BJS_PRISONERS_ZIP,
                                         TABLE_2,
                                         TABLE_10,
                                         TABLE_13,
                                         TABLE_23,
                                         load_tables,
                                         )


def generate_raw_race_or_sex_breakdown(demo, geo_level, source_tables):
    """
    Takes demographic type and geographic level, along with
     standardized dataframes representing specific tables
    from the BJS Prisoners (2020) report and returns a raw breakdown df
    with rows for each combo of place + demographic group,
    and columns for | RAW# | "race" or "age" or "sex" | "state_name"

    Parameters:
        demo: string "race_or_ethnicity" | "sex" for breakdown to generate
        geo_level: string "national" | "state" for breakdown to generate
        source_tables: list of specific data frames needed for breakdown

    Returns:
        df: with raw numbers by demographic group by geographic place(s)
    """

    main_table, table_23 = source_tables

    df = main_table.copy()
    df_territories = table_23.copy()

    if demo == std_col.SEX_COL:
        demo_cols = BJS_SEX_GROUPS
        demo_for_flip = demo

    if demo == std_col.RACE_OR_HISPANIC_COL:
        demo_cols = STANDARD_RACE_CODES
        demo_for_flip = std_col.RACE_CATEGORY_ID_COL

    if geo_level == STATE_LEVEL:
        df = keep_only_states(df)

        # force territory unknowns to end up as 100% share
        df_territories[Race.UNKNOWN.value] = df_territories[Race.ALL.value]
        df = pd.concat([df, df_territories])

        # `ALL` vs `All`
        if demo == std_col.SEX_COL:
            df[std_col.ALL_VALUE] = df[std_col.ALL_VALUE].combine_first(
                df[Race.ALL.value])
            df = df.drop(columns=[Race.ALL.value])

    if geo_level == NATIONAL_LEVEL:
        df = keep_only_national(df, demo_cols)

    df = cols_to_rows(
        df, demo_cols, demo_for_flip, RAW_COL)

    return df


def generate_raw_national_age_breakdown(source_tables):
    """
    Takes standardized dataframes representing specific tables
    from the BJS Prisoners (2020) report and returns a df
    with rows for each combo of place + demographic group,
    and columns for | RAW# | "age" group | "state_name" (national total)

    Parameters:
        source_tables: [list of specific df tables needed]

    Returns:
        df: standardized with raw numbers by age by place
    """

    table_10, table_13 = source_tables

    total_raw = table_10.loc[
        table_10[std_col.AGE_COL] == 'Number of sentenced prisoners', PCT_SHARE_COL].values[0]

    df = table_10.loc[table_10[std_col.AGE_COL]
                      != 'Number of sentenced prisoners']

    # standardize df with ADULT RAW # / AGE / USA
    df = dataset_utils.merge_fips_codes(df)
    df = dataset_utils.merge_pop_numbers(
        df, std_col.AGE_COL, NATIONAL_LEVEL)

    df[RAW_COL] = df[PCT_SHARE_COL] * total_raw / 100

    df = df[[
        RAW_COL, std_col.STATE_NAME_COL, std_col.AGE_COL, PCT_SHARE_COL]]

    # RAW count of sentenced children in adult jurisdiction
    table_13 = keep_only_national(table_13, "Total")

    df = pd.concat([df, table_13])

    return df


def generate_raw_state_age_breakdown(source_tables):
    """
    Takes standardized dataframes representing specific tables
    from the BJS Prisoners (2020) report and returns a df
    with rows for each combo of place + demographic group,
    and columns for | RAW# | "age" group | "state_name" (states+territories)

    Parameters:
        source_tables: [list of specific df tables needed]

    Returns:
        df: standardized with raw numbers by age by place
    """

    table_2, table_13, table_23 = source_tables

    # standardize dfs with JUVENILE RAW # IN CUSTODY and TOTAL RAW # UNDER JURISDICTION / AGE / PLACE
    table_2 = keep_only_states(table_2)
    table_13 = keep_only_states(table_13)

    table_2 = table_2[[
        std_col.STATE_NAME_COL, std_col.ALL_VALUE]]

    table_13 = table_13.rename(
        columns={RAW_COL: '0-17'})
    table_13 = table_13.drop(columns=[std_col.AGE_COL])

    # df with TOTAL+JUV AGE / PLACE
    df = pd.merge(table_13, table_2,
                  on=std_col.STATE_NAME_COL)

    # add territories
    df = pd.concat([df, table_23])

    df[std_col.ALL_VALUE] = df[std_col.ALL_VALUE].combine_first(
        df[Race.ALL.value])
    df = df.drop(columns=[Race.ALL.value])

    # df with RAW COUNT Under 18 / PLACE
    df = cols_to_rows(df, [std_col.ALL_VALUE, "0-17"],
                      std_col.AGE_COL, RAW_COL)

    return df


def post_process(df, breakdown, geo):
    """
        Takes a breakdown df with raw incidence values by demographic by place and:
        - generates `PER_100K` column (some incoming df may already have this col and partial data)
        - generates `PCT_SHARE` column
        - removes temporary columns needed only for calculating our metrics

       df: Dataframe with all the raw data containing:
       "state_name" column, raw values column, and demographic column
       breakdown: string column name containing demographic breakdown groups (race, sex, age)
       geo: geographic level (national, state)
    """

    if breakdown == std_col.RACE_OR_HISPANIC_COL:
        std_col.add_race_columns_from_category_id(df)
        pop_breakdown = std_col.RACE_COL
    else:
        pop_breakdown = breakdown

    df = dataset_utils.merge_fips_codes(df)
    df = dataset_utils.merge_pop_numbers(
        df, pop_breakdown, geo)

    df[std_col.POPULATION_PCT_COL] = df[std_col.POPULATION_PCT_COL].astype(
        float)

    df = generate_per_100k_col(
        df, RAW_COL, std_col.POPULATION_COL, PER_100K_COL)

    if breakdown == std_col.RACE_OR_HISPANIC_COL:
        # some states and all territories will have unknown race data
        df = dataset_utils.generate_pct_share_col_with_unknowns(
            df,
            {RAW_COL:
                PCT_SHARE_COL},
            std_col.RACE_CATEGORY_ID_COL,
            Race.ALL.value,
            Race.UNKNOWN.value
        )
    else:
        # sex and age contain no unknown data
        df = dataset_utils.generate_pct_share_col_without_unknowns(
            df,
            {RAW_COL:
                PCT_SHARE_COL},
            breakdown,
            std_col.ALL_VALUE,
        )

    # manually null RATES for 0-17 and null RAW for all other groups
    if breakdown == std_col.AGE_COL:
        df.loc[df[std_col.AGE_COL].isin(NON_NULL_RAW_COUNT_GROUPS),
               [PER_100K_COL, PCT_SHARE_COL]] = np.nan
        df.loc[~df[std_col.AGE_COL].isin(NON_NULL_RAW_COUNT_GROUPS),
               [RAW_COL]] = np.nan
        df = df.drop(columns=[std_col.POPULATION_COL])

    else:
        df = df.drop(columns=[std_col.POPULATION_COL, RAW_COL])

    return df


class BJSData(DataSource):

    @ staticmethod
    def get_id():
        return 'BJS_DATA'

    @ staticmethod
    def get_table_name():
        return 'bjs_data'

    def upload_to_gcs(self, _, **attrs):
        raise NotImplementedError(
            'upload_to_gcs should not be called for BJSData')

    def write_to_bq(self, dataset, gcs_bucket, **attrs):

        loaded_tables = load_tables(BJS_PRISONERS_ZIP)
        df_2 = standardize_table_2_df(loaded_tables[TABLE_2])
        df_10 = standardize_table_10_df(loaded_tables[TABLE_10])
        df_13 = standardize_table_13_df(loaded_tables[TABLE_13])
        df_23 = standardize_table_23_df(loaded_tables[TABLE_23])
        df_app_2 = standardize_appendix_table_2_df(
            loaded_tables[APPENDIX_TABLE_2])

        # BJS tables needed per breakdown
        table_lookup = {
            f'{std_col.AGE_COL}_{NATIONAL_LEVEL}': [df_10, df_13],
            f'{std_col.AGE_COL}_{STATE_LEVEL}': [df_2, df_13, df_23],
            f'{std_col.RACE_OR_HISPANIC_COL}_{NATIONAL_LEVEL}': [df_app_2, df_23],
            f'{std_col.SEX_COL}_{NATIONAL_LEVEL}': [df_2, df_23],
            f'{std_col.RACE_OR_HISPANIC_COL}_{STATE_LEVEL}': [df_app_2, df_23],
            f'{std_col.SEX_COL}_{STATE_LEVEL}': [df_2, df_23],
        }

        for geo_level in [NATIONAL_LEVEL, STATE_LEVEL]:
            for breakdown in [std_col.AGE_COL, std_col.RACE_OR_HISPANIC_COL, std_col.SEX_COL]:
                table_name = f'{breakdown}_{geo_level}'

                if breakdown == std_col.AGE_COL:
                    if geo_level == NATIONAL_LEVEL:
                        df = generate_raw_national_age_breakdown(
                            table_lookup[table_name])
                    if geo_level == STATE_LEVEL:
                        df = generate_raw_state_age_breakdown(
                            table_lookup[table_name])
                else:
                    df = generate_raw_race_or_sex_breakdown(
                        breakdown, geo_level, table_lookup[table_name])

                df = post_process(df, breakdown, geo_level)

                # set / add BQ types
                column_types = {c: 'STRING' for c in df.columns}
                for col in BJS_DATA_TYPES:
                    column_types[std_col.generate_column_name(
                        col, std_col.PER_100K_SUFFIX)] = 'FLOAT'
                    column_types[std_col.generate_column_name(
                        col, std_col.PCT_SHARE_SUFFIX)] = 'FLOAT'
                column_types[std_col.POPULATION_PCT_COL] = 'FLOAT'
                if std_col.RACE_INCLUDES_HISPANIC_COL in df.columns:
                    column_types[std_col.RACE_INCLUDES_HISPANIC_COL] = 'BOOL'

                gcs_to_bq_util.add_df_to_bq(
                    df, dataset, table_name, column_types=column_types)
