from datasources.data_source import DataSource
import ingestion.standardized_columns as std_col
import numpy as np
import pandas as pd
from ingestion.standardized_columns import Race
from ingestion import gcs_to_bq_util, dataset_utils
from ingestion.constants import NATIONAL_LEVEL, STATE_LEVEL, Sex
from ingestion.dataset_utils import generate_per_100k_col
from ingestion.bjs_utils import (standardize_table_2_df,
                                 standardize_table_10_df,
                                 standardize_table_13_df,
                                 standardize_table_23_df,
                                 standardize_appendix_table_2_df,
                                 standardize_jail_6, standardize_jail_7,
                                 cols_to_rows,
                                 keep_only_national,
                                 keep_only_states,
                                 BJS_DATA_TYPES,
                                 STANDARD_RACE_CODES,
                                 BJS_SEX_GROUPS,
                                 BJS_JAIL_AGE_GROUPS,
                                 RAW_JAIL_COL,
                                 RAW_PRISON_COL,
                                 PRISON_PER_100K_COL,
                                 PRISON_PCT_SHARE_COL,
                                 JAIL_PCT_SHARE_COL,
                                 JAIL_PER_100K_COL,
                                 TOTAL_CHILDREN_COL,
                                 APPENDIX_PRISON_2,
                                 BJS_PRISONERS_ZIP,
                                 BJS_CENSUS_OF_JAILS_ZIP,
                                 BJS_CENSUS_OF_JAILS_CROPS,
                                 BJS_PRISONERS_CROPS,
                                 PRISON_2,
                                 PRISON_10,
                                 PRISON_13,
                                 PRISON_23,
                                 JAIL_6, JAIL_7,
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
        demo: string "age" | "race_or_ethnicity" | "sex" for breakdown to generate
        geo_level: string "national" | "state" for breakdown to generate
        table_list: list of specific data frames needed for breakdown

    Returns:
        df: with raw numbers by demographic group by geographic place(s)
    """

    if demo == std_col.AGE_COL and geo_level == NATIONAL_LEVEL:
        raise ValueError("This function cannot generate the BJS Prisoners" +
                         "National Age breakdown; use generate_raw_national_age_breakdown() instead")

    main_prison_table, prison_23, main_jail_table = table_list

    df_prison = main_prison_table.copy()
    df_territories = prison_23.copy()
    df_jail = main_jail_table.copy()

    if demo == std_col.SEX_COL:
        demo_cols = BJS_SEX_GROUPS
        demo_for_flip = demo

        df_jail[Sex.MALE] = df_jail[RAW_JAIL_COL].astype(
            float) * df_jail["Male Pct"] / 100
        df_jail[Sex.FEMALE] = df_jail[RAW_JAIL_COL].astype(
            float) * df_jail["Female Pct"] / 100
        df_jail = df_jail.rename(
            columns={RAW_JAIL_COL: std_col.ALL_VALUE})
        columns_to_keep = [*BJS_SEX_GROUPS, std_col.STATE_NAME_COL]
        df_jail = df_jail[columns_to_keep]

    # STATE/AGE only has ALLS
    if demo == std_col.AGE_COL:
        demo_cols = [std_col.ALL_VALUE]
        demo_for_flip = demo

    if demo == std_col.RACE_OR_HISPANIC_COL:
        demo_cols = STANDARD_RACE_CODES
        demo_for_flip = std_col.RACE_CATEGORY_ID_COL

        bjs_races = list(df_jail.columns)

        for race in STANDARD_RACE_CODES:
            if race in bjs_races and race != "ALL":
                df_jail[race] = df_jail[race].astype(float) * \
                    df_jail[Race.ALL.value].astype(float) / 100

    if geo_level == STATE_LEVEL:
        df_prison = keep_only_states(df_prison)
        df_prison = df_prison.append(prison_23)

        df_jail = keep_only_states(df_jail)

        # force territory unknowns to end up as 100% share
        df_territories[Race.UNKNOWN.value] = df_territories[Race.ALL.value]
        df_prison = pd.concat([df_prison, df_territories])

        # `ALL` vs `All`
        if demo == std_col.SEX_COL or demo == std_col.AGE_COL:
            df_prison[std_col.ALL_VALUE] = df_prison[std_col.ALL_VALUE].combine_first(
                df_prison[Race.ALL.value])
            df_prison = df_prison.drop(columns=[Race.ALL.value])

    if geo_level == NATIONAL_LEVEL:
        df_prison = keep_only_national(df_prison, demo_cols)
        df_jail = keep_only_national(df_jail, demo_cols)

    df_prison = cols_to_rows(
        df_prison, demo_cols, demo_for_flip, RAW_PRISON_COL)

    df_jail = cols_to_rows(
        df_jail, demo_cols, demo_for_flip, RAW_JAIL_COL)

    df_jail = df_jail.reset_index(drop=True)
    df_prison = df_prison.reset_index(drop=True)

    merge_cols = [std_col.STATE_NAME_COL, demo_for_flip]
    df = pd.merge(df_prison, df_jail, how='left', on=merge_cols)

    return df


def generate_raw_national_age_breakdown(table_list):
    """
    Takes standardized dataframes representing specific tables
    from the BJS Prisoners (2020) report and returns a df_prison
    with rows for each combo of place + demographic group,
    and columns for | RAW# | "age" group | "state_name" (national total)

    Parameters:
        table_list: [list of specific df_prison tables needed]

    Returns:
        df_prison: standardized with raw numbers by age by place
    """

    prison_10, jail_6 = table_list

    jail_6 = jail_6.rename(
        columns={RAW_JAIL_COL: std_col.ALL_VALUE})

    df_jail = keep_only_national(jail_6, std_col.ALL_VALUE)

    columns_to_keep = [*BJS_JAIL_AGE_GROUPS, std_col.STATE_NAME_COL]
    df_jail = df_jail[columns_to_keep]

    df_jail = cols_to_rows(df_jail, BJS_JAIL_AGE_GROUPS,
                           std_col.AGE_COL, RAW_JAIL_COL)

    total_raw = prison_10.loc[
        prison_10[std_col.AGE_COL] == 'Number of sentenced prisoners', PRISON_PCT_SHARE_COL].values[0]

    df_prison = prison_10.loc[prison_10[std_col.AGE_COL]
                              != 'Number of sentenced prisoners']

    # standardize df_prison with ADULT RAW # / AGE / USA
    df_prison = dataset_utils.merge_fips_codes(df_prison)
    df_prison = dataset_utils.merge_pop_numbers(
        df_prison, std_col.AGE_COL, NATIONAL_LEVEL)

    df_prison[RAW_PRISON_COL] = df_prison[PRISON_PCT_SHARE_COL] * \
        total_raw / 100

    df_prison = df_prison[[
        RAW_PRISON_COL, std_col.STATE_NAME_COL, std_col.AGE_COL, PRISON_PCT_SHARE_COL]]

    return df_prison


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
        df, RAW_PRISON_COL, std_col.POPULATION_COL, PRISON_PER_100K_COL)
    df = generate_per_100k_col(
        df, RAW_JAIL_COL, std_col.POPULATION_COL, JAIL_PER_100K_COL)

    if breakdown == std_col.RACE_OR_HISPANIC_COL and geo == NATIONAL_LEVEL:
        # some states and all territories will have unknown race data
        df = dataset_utils.generate_pct_share_col_with_unknowns(
            df,
            {RAW_PRISON_COL:
                PRISON_PCT_SHARE_COL},
            std_col.RACE_CATEGORY_ID_COL,
            all_val,
            Race.UNKNOWN.value
        )
    else:
        # sex and age contain no unknown data
        df = dataset_utils.generate_pct_share_col_without_unknowns(
            df,
            {RAW_PRISON_COL:
                PRISON_PCT_SHARE_COL},
            breakdown,
            all_val,
        )

    df = df.drop(columns=[std_col.POPULATION_COL,
                          RAW_JAIL_COL, RAW_PRISON_COL])

    # get RAW PRISON for 0-17 and set as new property for "All" rows for every demo-breakdowns
    # eventually this property will sum RAW PRISON 0-17 + RAW JAIL 0-17
    df_13 = df_13.rename(
        columns={RAW_PRISON_COL: TOTAL_CHILDREN_COL, "age": group_col})

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

        prison_tables = load_tables(BJS_PRISONERS_ZIP, BJS_PRISONERS_CROPS)
        prisoners_2 = standardize_table_2_df(prison_tables[PRISON_2])
        prisoners_10 = standardize_table_10_df(prison_tables[PRISON_10])
        prisoners_13 = standardize_table_13_df(prison_tables[PRISON_13])
        prisoners_23 = standardize_table_23_df(prison_tables[PRISON_23])
        prisoners_app_2 = standardize_appendix_table_2_df(
            prison_tables[APPENDIX_PRISON_2])

        jail_tables = load_tables(
            BJS_CENSUS_OF_JAILS_ZIP, BJS_CENSUS_OF_JAILS_CROPS)
        jail_6 = standardize_jail_6(jail_tables[JAIL_6])
        jail_7 = standardize_jail_7(jail_tables[JAIL_7])

        # BJS tables needed per breakdown
        table_lookup = {
            f'{std_col.AGE_COL}_{NATIONAL_LEVEL}': [prisoners_10, jail_6],
            f'{std_col.AGE_COL}_{STATE_LEVEL}': [prisoners_2, prisoners_23, jail_6],
            f'{std_col.RACE_OR_HISPANIC_COL}_{NATIONAL_LEVEL}': [prisoners_app_2, prisoners_23, jail_7],
            f'{std_col.RACE_OR_HISPANIC_COL}_{STATE_LEVEL}': [prisoners_app_2, prisoners_23, jail_7],
            f'{std_col.SEX_COL}_{NATIONAL_LEVEL}': [prisoners_2, prisoners_23, jail_6],
            f'{std_col.SEX_COL}_{STATE_LEVEL}': [prisoners_2, prisoners_23, jail_6],
        }

        for geo_level in [NATIONAL_LEVEL, STATE_LEVEL]:
            for breakdown in [std_col.AGE_COL, std_col.RACE_OR_HISPANIC_COL, std_col.SEX_COL]:
                table_name = f'{breakdown}_{geo_level}'

                df = self.generate_breakdown_df(
                    breakdown, geo_level, table_lookup[table_name], prisoners_13)

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

    def generate_breakdown_df(self, breakdown, geo_level, table_list, prison_13):
        """
        Accepts demographic and geographic settings, along with the mapping of BJS tables
        to HET breakdowns, and generates the specified HET breakdown

        Parameters:
            breakdown: string of "age", "race_and_ethnicity", or "sex" to determine
                resulting demographic breakdown
            geo_level: string of "national" or "state" to determine resulting
                geographic breakdown
            table_list: list of dfs containing needed tables for each geo/demo breakdown
            prison_13: df needed separately for each breakdown's "total_confined_children" in prison
            need JAIL confined nums here too
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
            raw_df, breakdown, geo_level, prison_13)

        return processed_df
