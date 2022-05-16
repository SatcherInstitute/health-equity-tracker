import pandas as pd  # type: ignore
import numpy as np  # type: ignore

import time

import ingestion.standardized_columns as std_col
from ingestion.standardized_columns import generate_column_name
from ingestion.standardized_columns import Race

from datasources.data_source import DataSource
from ingestion import gcs_to_bq_util
from ingestion.dataset_utils import (
        merge_fips_codes,
        merge_pop_numbers,
        generate_per_100k_col,
        generate_pct_share_col)


DC_COUNTY_FIPS = '11001'

EXTRA_FILES = ['cdc_restricted_by_race_and_age_state.csv']

COVID_CONDITION_TO_PREFIX = {
    std_col.COVID_CASES: std_col.COVID_CASES_PREFIX,
    std_col.COVID_HOSP_Y: std_col.COVID_HOSP_PREFIX,
    std_col.COVID_DEATH_Y: std_col.COVID_DEATH_PREFIX,
}


class CDCRestrictedData(DataSource):

    @staticmethod
    def get_id():
        return 'CDC_RESTRICTED_DATA'

    @staticmethod
    def get_table_name():
        return 'cdc_restricted_data'

    def upload_to_gcs(self, _, **attrs):
        raise NotImplementedError(
            'upload_to_gcs should not be called for CDCRestrictedData')

    def write_to_bq(self, dataset, gcs_bucket, **attrs):
        for geo in ['state', 'county']:
            for demo in ['sex', 'race', 'age']:
                filename = f'cdc_restricted_by_{demo}_{geo}.csv'
                df = gcs_to_bq_util.load_csv_as_df(
                    gcs_bucket, filename, dtype={'county_fips': str})

                df = self.generate_breakdown(df, demo, geo)

                if demo == 'race':
                    std_col.add_race_columns_from_category_id(df)

                column_types = get_col_types(df)

                table_name = f'by_{demo}_{geo}_processed'
                gcs_to_bq_util.add_df_to_bq(
                    df, dataset, table_name, column_types=column_types)

        for filename in EXTRA_FILES:
            df = gcs_to_bq_util.load_csv_as_df(
                gcs_bucket, filename, dtype={'county_fips': str})

            self.clean_frame_column_names(df)

            int_cols = [std_col.COVID_CASES, std_col.COVID_HOSP_Y,
                        std_col.COVID_HOSP_N, std_col.COVID_HOSP_UNKNOWN,
                        std_col.COVID_DEATH_Y, std_col.COVID_DEATH_N,
                        std_col.COVID_DEATH_UNKNOWN]

            column_types = {c: 'STRING' for c in df.columns}
            for col in int_cols:
                if col in column_types:
                    column_types[col] = 'FLOAT'

            if std_col.RACE_INCLUDES_HISPANIC_COL in df.columns:
                column_types[std_col.RACE_INCLUDES_HISPANIC_COL] = 'BOOL'

            print('uploading extra file')

            table_name = filename.replace('.csv', '')  # Table name is file name
            gcs_to_bq_util.add_df_to_bq(
                df, dataset, table_name, column_types=column_types)

        print('uploaded extra file')

    def generate_breakdown(self, df, demo, geo):
        print(f'processing {demo} {geo}')
        start = time.time()

        demo_col = std_col.RACE_CATEGORY_ID_COL if demo == 'race' else demo
        unknown_val = Race.UNKNOWN.value if demo == 'race' else 'Unknown'
        all_val = Race.ALL.value if demo == 'race' else std_col.ALL_VALUE

        all_columns = [
           std_col.STATE_FIPS_COL,
           std_col.STATE_NAME_COL,
           demo_col,
           std_col.POPULATION_PCT_COL
        ]

        if geo == 'county':
            all_columns.extend([std_col.COUNTY_NAME_COL, std_col.COUNTY_FIPS_COL])

        df = merge_fips_codes(df)
        fips = std_col.COUNTY_FIPS_COL if geo == 'county' else std_col.STATE_FIPS_COL

        # Drop annoying column that doesnt match any fips code
        df = df[df[fips].notna()]

        if geo == 'county':
            df = remove_bad_fips_cols(df)

        df = merge_pop_numbers(df, demo, geo)

        df = null_out_all_unknown_deaths_hosps(df)

        for raw_count_col, prefix in COVID_CONDITION_TO_PREFIX.items():
            per_100k_col = generate_column_name(prefix, std_col.PER_100K_SUFFIX)
            all_columns.append(per_100k_col)
            df = generate_per_100k_col(df, raw_count_col, std_col.POPULATION_COL, per_100k_col)

        raw_count_to_pct_share = {}
        for raw_count_col, prefix in COVID_CONDITION_TO_PREFIX.items():
            raw_count_to_pct_share[raw_count_col] = generate_column_name(prefix, std_col.PCT_SHARE_SUFFIX)

        all_columns.extend(list(raw_count_to_pct_share.values()))
        df = generate_pct_share_col(df, raw_count_to_pct_share, demo_col, all_val)

        raw_count_to_pct_share_known = {}
        for raw_count_col, prefix in COVID_CONDITION_TO_PREFIX.items():
            raw_count_to_pct_share_known[raw_count_col] = generate_column_name(prefix, std_col.SHARE_OF_KNOWN_SUFFIX)

        all_columns.extend(list(raw_count_to_pct_share_known.values()))
        df = generate_share_of_known_col(df, raw_count_to_pct_share_known, demo_col, all_val, unknown_val, geo)

        df = null_out_unneeded_rows(df, demo_col, unknown_val)

        df = df[all_columns]
        self.clean_frame_column_names(df)

        sortby_cols = [fips, demo_col]
        df = df.sort_values(by=sortby_cols).reset_index(drop=True)

        if geo == 'county':
            null_out_dc_county_rows(df)

        end = time.time()
        print("took", round(end - start, 2), f"seconds to process {demo} {geo}")
        return df


def generate_share_of_known_col(df, raw_count_to_pct_share_known,
                                breakdown_col, all_val, unknown_val, geo_level):
    """Generates a share of known column for a condition.

       df: DataFrame to generate the share_of_known column for.
       raw_count_col: String column name with the raw condition count.
       share_of_known_col: String column name to place the generate share of known
                           numbers in.
       breakdown_col: String column name represting the demographic breakdown
                      (race/sex/age).
       all_val: String represting an ALL demographic value in the dataframe.
       unknown_val: String respresting an UNKNOWN value in the dataframe.
       geo_level: String representing geo level (state/county)"""

    unknown_df = df.loc[df[breakdown_col] == unknown_val].reset_index(drop=True)
    all_df = df.loc[df[breakdown_col] == all_val].reset_index(drop=True)

    df = df.loc[~df[breakdown_col].isin({unknown_val, all_val})]

    groupby_cols = [std_col.STATE_FIPS_COL, std_col.STATE_NAME_COL]
    if geo_level == 'county':
        groupby_cols.extend([std_col.COUNTY_NAME_COL, std_col.COUNTY_FIPS_COL])

    alls = df.groupby(groupby_cols).sum().reset_index()
    alls[breakdown_col] = all_val
    df = pd.concat([df, alls]).reset_index(drop=True)

    df = generate_pct_share_col(df, raw_count_to_pct_share_known, breakdown_col, all_val)

    df = df.loc[df[breakdown_col] != all_val]

    for share_of_known_col in raw_count_to_pct_share_known.values():
        all_df[share_of_known_col] = 100.0

    df = pd.concat([df, all_df, unknown_df]).reset_index(drop=True)
    return df


def null_out_unneeded_rows(df, breakdown_col, unknown_val):
    """Nulls out rows in the dataframe that will not be used by the frontend.

       df: DataFrame to null out the rows in.
       breakdown_col: String column name represting the demographic breakdown
                      (race/sex/age).
       unknown_val: String respresting an UNKNOWN value in the dataframe."""
    unknown_df = df.loc[df[breakdown_col] == unknown_val].reset_index(drop=True)
    known_df = df.loc[df[breakdown_col] != unknown_val].reset_index(drop=True)

    for prefix in COVID_CONDITION_TO_PREFIX.values():
        unknown_df[generate_column_name(prefix, std_col.SHARE_OF_KNOWN_SUFFIX)] = np.nan
        known_df[generate_column_name(prefix, std_col.PCT_SHARE_SUFFIX)] = np.nan

    df = pd.concat([known_df, unknown_df]).reset_index(drop=True)
    return df


def null_out_all_unknown_deaths_hosps(df):
    """If a given geo x breakdown has all unknown hospitalizations or deaths,
       we treat it as if it has "no data," i.e. we clear the hosp/death fields.

       df: DataFrame to null out rows on"""
    def null_out_row(row):
        if row[std_col.COVID_DEATH_UNKNOWN] == row[std_col.COVID_CASES]:
            row[std_col.COVID_DEATH_Y] = np.nan
        if row[std_col.COVID_HOSP_UNKNOWN] == row[std_col.COVID_CASES]:
            row[std_col.COVID_HOSP_Y] = np.nan
        return row

    return df.apply(null_out_row, axis=1)


def null_out_dc_county_rows(df):
    """Clear all county-level DC data. See issue for more details:
       https://github.com/SatcherInstitute/health-equity-tracker/issues/872.

       Note: This is an in place function so it doesnt return anything

       df: DataFrame to remove DC info from"""
    for prefix in COVID_CONDITION_TO_PREFIX.values():
        df.loc[df[std_col.COUNTY_FIPS_COL] == DC_COUNTY_FIPS,
               generate_column_name(prefix, std_col.PER_100K_SUFFIX)] = np.nan
        df.loc[df[std_col.COUNTY_FIPS_COL] == DC_COUNTY_FIPS,
               generate_column_name(prefix, std_col.PCT_SHARE_SUFFIX)] = np.nan
        df.loc[df[std_col.COUNTY_FIPS_COL] == DC_COUNTY_FIPS,
               generate_column_name(prefix, std_col.SHARE_OF_KNOWN_SUFFIX)] = np.nan

    df.loc[df[std_col.COUNTY_FIPS_COL] == DC_COUNTY_FIPS, std_col.POPULATION_PCT_COL] = np.nan


def get_col_types(df):
    """Returns a dict of column types to send to bigquery

      df: DataFrame to generate column types dict for"""
    column_types = {c: 'STRING' for c in df.columns}
    for prefix in COVID_CONDITION_TO_PREFIX.values():
        column_types[generate_column_name(prefix, std_col.PER_100K_SUFFIX)] = 'FLOAT'
        column_types[generate_column_name(prefix, std_col.PCT_SHARE_SUFFIX)] = 'FLOAT'
        column_types[generate_column_name(prefix, std_col.SHARE_OF_KNOWN_SUFFIX)] = 'FLOAT'

    column_types[std_col.POPULATION_PCT_COL] = 'FLOAT'

    if std_col.RACE_INCLUDES_HISPANIC_COL in df.columns:
        column_types[std_col.RACE_INCLUDES_HISPANIC_COL] = 'BOOL'

    return column_types


def remove_bad_fips_cols(df):
    """Throws out any row where the first two digits of the county fips do not
       equal the state fips. This is a mistake in the dataset and we can not
       tell where the cases are from.

       df: The DataFrame to toss rows out of."""
    def fips_code_is_good(row):
        return row[std_col.COUNTY_FIPS_COL][0:2] == row[std_col.STATE_FIPS_COL]

    df = df[df.apply(fips_code_is_good, axis=1)]
    return df.reset_index(drop=True)
