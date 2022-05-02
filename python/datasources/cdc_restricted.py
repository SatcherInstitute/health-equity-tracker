import pandas as pd  # type: ignore
import numpy as np  # type: ignore

import ingestion.standardized_columns as std_col
from ingestion.standardized_columns import generate_column_name
from ingestion.standardized_columns import Race

from datasources.data_source import DataSource
from ingestion import gcs_to_bq_util
from ingestion.dataset_utils import (
        merge_fips_codes,
        merge_pop_numbers,
        generate_per_100k_col,
        generate_pct_share_col,
        add_sum_of_rows)


# CDC_RESTRICTED_FILES = [
#     'cdc_restricted_by_race_county.csv',
#     'cdc_restricted_by_race_state.csv',
#     'cdc_restricted_by_age_county.csv',
#     'cdc_restricted_by_age_state.csv',
#     'cdc_restricted_by_sex_county.csv',
#     'cdc_restricted_by_sex_state.csv',
#     'cdc_restricted_by_race_and_age_state.csv'
# ]


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

                column_types = {c: 'STRING' for c in df.columns}
                if std_col.RACE_INCLUDES_HISPANIC_COL in df.columns:
                    column_types[std_col.RACE_INCLUDES_HISPANIC_COL] = 'BOOL'

                df = self.generate_breakdown(df, demo, geo)

                table_name = f'by_{demo}_{geo}_processed'
                gcs_to_bq_util.add_df_to_bq(
                    df, dataset, table_name, column_types=column_types)

    def generate_breakdown(self, df, demo, geo):
        demo_col = std_col.RACE_CATEGORY_ID_COL if demo == 'race' else demo
        all_columns = [std_col.STATE_FIPS_COL, std_col.STATE_NAME_COL, demo_col]
        unknown_val = Race.UNKNOWN.value if demo == 'race' else 'Unknown'
        total_val = Race.ALL.value if demo == 'race' else std_col.ALL_VALUE
        all_val = Race.ALL.value if demo == 'race' else std_col.ALL_VALUE

        if geo == 'state':
            # The county files already have fips codes
            df = merge_fips_codes(df)

        df = merge_pop_numbers(df, demo, geo)

        for raw_count_col, prefix in COVID_CONDITION_TO_PREFIX.items():
            pct_share_col = generate_column_name(prefix, std_col.PCT_SHARE_SUFFIX)
            per_100k_col = generate_column_name(prefix, std_col.PER_100K_SUFFIX)
            share_of_known_col = generate_column_name(prefix, std_col.SHARE_OF_KNOWN_SUFFIX)
            pct_share_col = generate_column_name(prefix, std_col.PCT_SHARE_SUFFIX)

            df = generate_per_100k_col(df, raw_count_col, std_col.POPULATION_COL, per_100k_col)
            df = generate_pct_share_col(df, raw_count_col, pct_share_col, demo_col, total_val)
            df = generate_share_of_known_col(df, raw_count_col, share_of_known_col,
                                             demo_col, all_val, unknown_val)

            all_columns.extend([pct_share_col, share_of_known_col, per_100k_col])

        df = null_out_unneeded_rows(df, demo_col, unknown_val)
        # Clean up column names.
        df = df[all_columns]
        self.clean_frame_column_names(df)
        return df


def generate_share_of_known_col(df, raw_count_col, share_of_known_col,
                                breakdown_col, all_val, unknown_val):
    """Generates a share of known column for a condition.

       df: DataFrame to generate the share_of_known column for.
       raw_count_col: String column name with the raw condition count.
       share_of_known_col: String column name to place the generate share of known
                           numbers in.
       breakdown_col: String column name represting the demographic breakdown
                      (race/sex/age).
       all_val: String represting an ALL demographic value in the dataframe.
       unknown_val: String respresting an UNKNOWN value in the dataframe."""

    unknown_df = df.loc[df[breakdown_col] == unknown_val].reset_index(drop=True)
    all_df = df.loc[df[breakdown_col] == all_val].reset_index(drop=True)

    df = df.loc[~df[breakdown_col].isin({unknown_val, all_val})]

    alls = df.groupby([std_col.STATE_FIPS_COL, std_col.STATE_NAME_COL]).sum().reset_index()
    alls[breakdown_col] = all_val
    df = pd.concat([df, alls]).reset_index(drop=True)

    df = generate_pct_share_col(df, raw_count_col, share_of_known_col, breakdown_col, all_val)

    df = df.loc[df[breakdown_col] != all_val]
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

    for _, prefix in COVID_CONDITION_TO_PREFIX.items():
        unknown_df[generate_column_name(prefix, std_col.SHARE_OF_KNOWN_SUFFIX)] = np.nan
        known_df[generate_column_name(prefix, std_col.PCT_SHARE_SUFFIX)] = np.nan

    df = pd.concat([known_df, unknown_df]).reset_index(drop=True)
    return df
