from datasources.data_source import DataSource
import ingestion.standardized_columns as std_col
import pandas as pd
from ingestion.standardized_columns import Race
from ingestion import gcs_to_bq_util, dataset_utils
from ingestion.constants import NATIONAL_LEVEL, STATE_LEVEL
from ingestion.dataset_utils import generate_per_100k_col
from ingestion.bjs_utils import (standardize_table_2_df,
                                 standardize_table_10_df,
                                 standardize_table_13_df,
                                 standardize_table_23_df,
                                 standardize_appendix_table_2_df,
                                 cols_to_rows,
                                 keep_only_national,
                                 keep_only_states,
                                 BJS_DATA_TYPES,
                                 STANDARD_RACE_CODES,
                                 BJS_SEX_GROUPS,
                                 RAW_COL,
                                 PER_100K_COL,
                                 PCT_SHARE_COL,
                                 TOTAL_CHILDREN_COL,
                                 APPENDIX_TABLE_2,
                                 BJS_PRISONERS_ZIP,
                                 TABLE_2,
                                 TABLE_10,
                                 TABLE_13,
                                 TABLE_23,
                                 load_tables,
                                 )


def generate_raw_breakdown(demo, geo_level, table_list):
    """
    Takes demographic type and geographic level, along with
     standardized dataframes representing specific tables
    from the BJS Prisoners (2020) report and returns a raw breakdown df
    with rows for each combo of place + demographic group,
    and columns for | RAW# | "race" or "age" or "sex" | "state_name"

    Parameters:
        demo: string "race_or_ethnicity" | "sex" for breakdown to generate
        geo_level: string "national" | "state" for breakdown to generate
        table_list: list of specific data frames needed for breakdown

    Returns:
        df: with raw numbers by demographic group by geographic place(s)
    """

    # TODO error if national-age and suggest alt fn

    main_table, table_23 = table_list

    df = main_table.copy()
    df_territories = table_23.copy()

    if demo == std_col.SEX_COL:
        demo_cols = BJS_SEX_GROUPS
        demo_for_flip = demo

    # STATE/AGE only has ALLS
    if demo == std_col.AGE_COL:
        demo_cols = [std_col.ALL_VALUE]
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
        if demo == std_col.SEX_COL or demo == std_col.AGE_COL:
            df[std_col.ALL_VALUE] = df[std_col.ALL_VALUE].combine_first(
                df[Race.ALL.value])
            df = df.drop(columns=[Race.ALL.value])

    if geo_level == NATIONAL_LEVEL:
        df = keep_only_national(df, demo_cols)

    df = cols_to_rows(
        df, demo_cols, demo_for_flip, RAW_COL)

    return df


def generate_raw_national_age_breakdown(table_list):
    """
    Takes standardized dataframes representing specific tables
    from the BJS Prisoners (2020) report and returns a df
    with rows for each combo of place + demographic group,
    and columns for | RAW# | "age" group | "state_name" (national total)

    Parameters:
        table_list: [list of specific df tables needed]

    Returns:
        df: standardized with raw numbers by age by place
    """

    table_10 = table_list[0]

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

    return df


def post_process(df, breakdown, geo, df_13):
    """
        Takes a breakdown df with raw incidence values by demographic by place and:
        - generates `PER_100K` column (some incoming df may already have this col and partial data)
        - generates `PCT_SHARE` column
        - generates `total_confined_children` column, where number will be stored under the
            "All/ALL" demographic group rows for all demographic breakdowns
        - removes temporary columns needed only for calculating our metrics

       df: Dataframe with all the raw data containing:
            "state_name" column, raw values column, and demographic column
       breakdown: string column name containing demographic breakdown groups (race, sex, age)
       geo: geographic level (national, state)
       df_13: df for table 13 that includes total_confined_children data
    """

    if breakdown == std_col.RACE_OR_HISPANIC_COL:
        std_col.add_race_columns_from_category_id(df)
        pop_breakdown = std_col.RACE_COL
        all_val = Race.ALL.value
        group_col = std_col.RACE_CATEGORY_ID_COL
    else:
        pop_breakdown = breakdown
        all_val = std_col.ALL_VALUE
        group_col = breakdown

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
            all_val,
            Race.UNKNOWN.value
        )
    else:
        # sex and age contain no unknown data
        df = dataset_utils.generate_pct_share_col_without_unknowns(
            df,
            {RAW_COL:
                PCT_SHARE_COL},
            breakdown,
            all_val,
        )

    df = df.drop(columns=[std_col.POPULATION_COL,
                          RAW_COL])
    # get RAW PRISON for 0-17 and set as new property for "All" rows for every demo-breakdowns
    # eventually this property will sum RAW PRISON 0-17 + RAW JAIL 0-17
    df_13 = df_13.rename(
        columns={RAW_COL: TOTAL_CHILDREN_COL, "age": group_col})

    df_13[group_col] = all_val
    df = pd.merge(df, df_13, how='left', on=[
                  std_col.STATE_NAME_COL, group_col])

    return df


class BJSIncarcerationData(DataSource):

    @ staticmethod
    def get_id():
        return 'BJS_INCARCERATION_DATA'

    @ staticmethod
    def get_table_name():
        return 'bjs_incarceration_data'

    def upload_to_gcs(self, _, **attrs):
        raise NotImplementedError(
            'upload_to_gcs should not be called for BJSIncarcerationData')

    def write_to_bq(self, dataset, gcs_bucket, **attrs):
        """
        Main function for this data source that fetches external data and runs
        needed cleaning and standardization, and then writes needed tables to
        BigQuery

        """
        loaded_tables = load_tables(BJS_PRISONERS_ZIP)
        df_2 = standardize_table_2_df(loaded_tables[TABLE_2])
        df_10 = standardize_table_10_df(loaded_tables[TABLE_10])
        df_13 = standardize_table_13_df(loaded_tables[TABLE_13])
        df_23 = standardize_table_23_df(loaded_tables[TABLE_23])
        df_app_2 = standardize_appendix_table_2_df(
            loaded_tables[APPENDIX_TABLE_2])

        # BJS tables needed per breakdown
        table_lookup = {
            f'{std_col.AGE_COL}_{NATIONAL_LEVEL}': [df_10],
            f'{std_col.RACE_OR_HISPANIC_COL}_{NATIONAL_LEVEL}': [df_app_2, df_23],
            f'{std_col.SEX_COL}_{NATIONAL_LEVEL}': [df_2, df_23],
            f'{std_col.AGE_COL}_{STATE_LEVEL}': [df_2, df_23],
            f'{std_col.RACE_OR_HISPANIC_COL}_{STATE_LEVEL}': [df_app_2, df_23],
            f'{std_col.SEX_COL}_{STATE_LEVEL}': [df_2, df_23],
        }

        for geo_level in [NATIONAL_LEVEL, STATE_LEVEL]:
            for breakdown in [std_col.AGE_COL, std_col.RACE_OR_HISPANIC_COL, std_col.SEX_COL]:
                table_name = f'{breakdown}_{geo_level}'

                df = self.generate_breakdown_df(
                    breakdown, geo_level, table_lookup[table_name], df_13)

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

    def generate_breakdown_df(self, breakdown, geo_level, table_list, df_13):
        """
        Accepts demographic and geographic settings, along with the mapping of BJS tables
        to HET breakdowns, and generates the specified HET breakdown

        Parameters:
            breakdown: string of "age", "race_and_ethnicity", or "sex" to determine
                resulting demographic breakdown
            geo_level: string of "national" or "state" to determine resulting
                geographic breakdown
            table_list: list of dfs containing needed tables for each geo/demo breakdown
            df_13: df of table 13 needed separately for each breakdown's "total_confined_children"
        Returns:
            Processed HET style df ready for BigQuery and HET frontend
        """

        if breakdown == std_col.AGE_COL and geo_level == NATIONAL_LEVEL:
            raw_df = generate_raw_national_age_breakdown(
                table_list)
        else:
            raw_df = generate_raw_breakdown(
                breakdown, geo_level, table_list)

        processed_df = post_process(
            raw_df, breakdown, geo_level, df_13)

        return processed_df
