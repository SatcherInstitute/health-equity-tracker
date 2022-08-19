import numpy as np  # type: ignore
import pandas as pd  # type: ignore

import time

import ingestion.standardized_columns as std_col
from ingestion.standardized_columns import generate_column_name
from ingestion.standardized_columns import Race
import ingestion.constants as constants

from datasources.data_source import DataSource
from datasources.cdc_restricted_local import (
    HOSP_DATA_SUPPRESSION_STATES,
    DEATH_DATA_SUPPRESSION_STATES,
    RACE_NAMES_MAPPING,
    SEX_NAMES_MAPPING,
    AGE_NAMES_MAPPING)

from ingestion import gcs_to_bq_util
from ingestion.dataset_utils import (
    generate_per_100k_col,
    generate_pct_share_col_with_unknowns)

from ingestion.merge_utils import (
    merge_state_fips_codes,
    merge_pop_numbers,
    merge_multiple_pop_cols,
    merge_county_names
)


DC_COUNTY_FIPS = '11001'

ONLY_FIPS_FILES = {
    # These files only need to get their fips codes merged in
    'cdc_restricted_by_race_and_age_state.csv': 'by_race_age_state',
}

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
        cumulative = self.get_attr(attrs, 'cumulative')
        for geo in ['national', 'state', 'county']:
            for demo in ['sex', 'race', 'age']:
                geo_to_pull = 'state' if geo == 'national' else geo
                filename = f'cdc_restricted_by_{demo}_{geo_to_pull}.csv'
                df = gcs_to_bq_util.load_csv_as_df(
                    gcs_bucket, filename, dtype={'county_fips': str})

                df = self.generate_breakdown(df, demo, geo, cumulative)

                if demo == 'race':
                    std_col.add_race_columns_from_category_id(df)

                column_types = get_col_types(df)

                table_name = f'by_{demo}_{geo}_processed'
                if not cumulative:
                    table_name += '_time_series'

                gcs_to_bq_util.add_df_to_bq(
                    df, dataset, table_name, column_types=column_types)

        # Only do this once, open to a less weird way of doing this
        if cumulative:
            for filename, table_name in ONLY_FIPS_FILES.items():
                df = gcs_to_bq_util.load_csv_as_df(gcs_bucket, filename)

                df = df[df[std_col.STATE_POSTAL_COL] != 'Unknown']
                df = merge_state_fips_codes(df)
                df = df[df[std_col.STATE_FIPS_COL].notna()]

                self.clean_frame_column_names(df)

                int_cols = [std_col.COVID_CASES, std_col.COVID_HOSP_Y,
                            std_col.COVID_HOSP_N, std_col.COVID_HOSP_UNKNOWN,
                            std_col.COVID_DEATH_Y, std_col.COVID_DEATH_N,
                            std_col.COVID_DEATH_UNKNOWN]

                # Add race metadata columns.
                if std_col.RACE_CATEGORY_ID_COL in df.columns:
                    std_col.add_race_columns_from_category_id(df)

                column_types = {c: 'STRING' for c in df.columns}
                for col in int_cols:
                    if col in column_types:
                        column_types[col] = 'FLOAT'

                if std_col.RACE_INCLUDES_HISPANIC_COL in df.columns:
                    column_types[std_col.RACE_INCLUDES_HISPANIC_COL] = 'BOOL'

                print(f'uploading {table_name}')
                gcs_to_bq_util.add_df_to_bq(
                    df, dataset, table_name, column_types=column_types)

    def generate_breakdown(self, df, demo, geo, cumulative):
        print(f'processing {demo} {geo} cumulative = {cumulative}')
        start = time.time()

        demo_col = std_col.RACE_CATEGORY_ID_COL if demo == 'race' else demo
        unknown_val = Race.UNKNOWN.value if demo == 'race' else 'Unknown'
        all_val = Race.ALL.value if demo == 'race' else std_col.ALL_VALUE

        all_columns = [
            std_col.STATE_FIPS_COL,
            std_col.STATE_NAME_COL,
            demo_col,
            std_col.COVID_POPULATION_PCT,
        ]

        if geo == 'national' or cumulative:
            # We need to always find the missing demographic values on the 'national'
            # level because of the way we calculate the national population numbers, as
            # we sum the population for each state that reports sufficient data. So every
            # population group needs to be in the df, otherwise they won't get counted in
            # national population.
            geo_to_pull = 'state' if geo == 'national' else geo
            df = add_missing_demographic_values(df, geo_to_pull, demo)

        if cumulative:
            groupby_cols = [
                std_col.STATE_POSTAL_COL,
                demo_col,
            ]

            if geo == 'county':
                groupby_cols.extend(
                    [std_col.COUNTY_NAME_COL, std_col.COUNTY_FIPS_COL])

            df = df.groupby(groupby_cols).sum(min_count=1).reset_index()

        else:
            all_columns.append(std_col.TIME_PERIOD_COL)

        df = merge_state_fips_codes(df, keep_postal=True)

        if geo == 'county':
            all_columns.extend(
                [std_col.COUNTY_NAME_COL, std_col.COUNTY_FIPS_COL])
            df = merge_county_names(df)
            null_out_all_unknown_deaths_hosps(df)

        if geo == 'national':
            pop_cols = [
                generate_column_name(std_col.COVID_CASES, 'population'),
                generate_column_name(std_col.COVID_DEATH_Y, 'population'),
                generate_column_name(std_col.COVID_HOSP_Y, 'population'),
            ]

            df = merge_multiple_pop_cols(df, demo, pop_cols)

            # Don't count the population of states that we null out data from
            rows_to_modify = df[std_col.STATE_POSTAL_COL].isin(
                HOSP_DATA_SUPPRESSION_STATES)
            df.loc[rows_to_modify, generate_column_name(std_col.COVID_HOSP_Y, 'population')] = 0

            rows_to_modify = df[std_col.STATE_POSTAL_COL].isin(
                DEATH_DATA_SUPPRESSION_STATES)
            df.loc[rows_to_modify, generate_column_name(std_col.COVID_DEATH_Y, 'population')] = 0

            df = df.drop(columns=std_col.STATE_POSTAL_COL)
            df = generate_national_dataset(df, demo_col, cumulative)

        fips = std_col.COUNTY_FIPS_COL if geo == 'county' else std_col.STATE_FIPS_COL

        # Drop annoying column that doesnt match any fips codes or have
        # an associated time period
        df = df[df[fips].notna()]
        if not cumulative:
            df = df[df[std_col.TIME_PERIOD_COL].notna()]

        if geo == 'county':
            df = remove_bad_fips_cols(df)

        df = merge_pop_numbers(df, demo, geo)
        df = df.rename(
            columns={std_col.POPULATION_PCT_COL: std_col.COVID_POPULATION_PCT})

        for raw_count_col, prefix in COVID_CONDITION_TO_PREFIX.items():
            per_100k_col = generate_column_name(
                prefix, std_col.PER_100K_SUFFIX)
            all_columns.append(per_100k_col)

            pop_col = std_col.POPULATION_COL
            if geo == 'national':
                pop_col = generate_column_name(raw_count_col, 'population')
            df = generate_per_100k_col(
                df, raw_count_col, pop_col, per_100k_col)

        raw_count_to_pct_share = {}
        for raw_count_col, prefix in COVID_CONDITION_TO_PREFIX.items():
            raw_count_to_pct_share[raw_count_col] = generate_column_name(
                prefix, std_col.SHARE_SUFFIX)

        all_columns.extend(list(raw_count_to_pct_share.values()))
        df = generate_pct_share_col_with_unknowns(df, raw_count_to_pct_share,
                                                  demo_col, all_val, unknown_val)

        df = df[all_columns]
        self.clean_frame_column_names(df)

        sortby_cols = [fips, demo_col]
        df = df.sort_values(by=sortby_cols).reset_index(drop=True)

        if geo == 'county':
            null_out_dc_county_rows(df)

        end = time.time()
        print("took", round(end - start, 2),
              f"seconds to process {demo} {geo}")
        return df


def null_out_all_unknown_deaths_hosps(df):
    """If a given geo x breakdown has all unknown hospitalizations or deaths,
       we treat it as if it has "no data," i.e. we clear the hosp/death fields.

       Note: This is an in place function so it doesnt return anything

       df: DataFrame to null out rows on"""

    df.loc[df[std_col.COVID_DEATH_UNKNOWN] == df[std_col.COVID_CASES], std_col.COVID_DEATH_Y] = np.nan
    df.loc[df[std_col.COVID_HOSP_UNKNOWN] == df[std_col.COVID_CASES], std_col.COVID_HOSP_Y] = np.nan


def null_out_dc_county_rows(df):
    """Clear all county-level DC data. See issue for more details:
       https://github.com/SatcherInstitute/health-equity-tracker/issues/872.

       Note: This is an in place function so it doesnt return anything

       df: DataFrame to remove DC info from"""
    for prefix in COVID_CONDITION_TO_PREFIX.values():
        df.loc[df[std_col.COUNTY_FIPS_COL] == DC_COUNTY_FIPS,
               generate_column_name(prefix, std_col.PER_100K_SUFFIX)] = np.nan
        df.loc[df[std_col.COUNTY_FIPS_COL] == DC_COUNTY_FIPS,
               generate_column_name(prefix, std_col.SHARE_SUFFIX)] = np.nan

    df.loc[df[std_col.COUNTY_FIPS_COL] == DC_COUNTY_FIPS,
           std_col.COVID_POPULATION_PCT] = np.nan


def get_col_types(df):
    """Returns a dict of column types to send to bigquery

      df: DataFrame to generate column types dict for"""
    column_types = {c: 'STRING' for c in df.columns}
    for prefix in COVID_CONDITION_TO_PREFIX.values():
        column_types[generate_column_name(
            prefix, std_col.PER_100K_SUFFIX)] = 'FLOAT'
        column_types[generate_column_name(
            prefix, std_col.SHARE_SUFFIX)] = 'FLOAT'

    column_types[std_col.COVID_POPULATION_PCT] = 'FLOAT'

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


def generate_national_dataset(state_df, demo_col, cumulative):
    """Generates a national dataset based on a state_df and demographic column"""
    int_cols = [
        std_col.COVID_CASES,
        std_col.COVID_DEATH_Y,
        std_col.COVID_HOSP_Y,
        generate_column_name(std_col.COVID_CASES, 'population'),
        generate_column_name(std_col.COVID_DEATH_Y, 'population'),
        generate_column_name(std_col.COVID_HOSP_Y, 'population'),
    ]

    state_df[int_cols] = state_df[int_cols].fillna(0)
    state_df[int_cols] = state_df[int_cols].replace("", 0)
    state_df[int_cols] = state_df[int_cols].astype(int)

    groupby_cols = [demo_col]
    if not cumulative:
        groupby_cols.append(std_col.TIME_PERIOD_COL)
    df = state_df.groupby(groupby_cols).sum().reset_index()

    df[std_col.STATE_FIPS_COL] = constants.US_FIPS
    df[std_col.STATE_NAME_COL] = constants.US_NAME

    needed_cols = [
        std_col.STATE_FIPS_COL,
        std_col.STATE_NAME_COL,
    ]

    if not cumulative:
        needed_cols.append(std_col.TIME_PERIOD_COL)

    needed_cols.extend(int_cols)
    needed_cols.append(demo_col)

    return df[needed_cols].reset_index(drop=True)


def add_missing_demographic_values(df, geo, demographic):
    """Adds in missing demographic values for each geo in the df. For example,
    if a given county only has WHITE, adds in empty data rows for all other
    race/ethnicity groups.
    See https://github.com/SatcherInstitute/health-equity-tracker/issues/841.

    df: Pandas dataframe to append onto.
    geo: Geographic level. Must be "state" or "county".
    demographic: Demographic breakdown. Must be "race", "age", or "sex".
    """
    geo_col_mapping = {
        'state': [std_col.STATE_POSTAL_COL],
        'county': [
            std_col.STATE_POSTAL_COL,
            std_col.COUNTY_FIPS_COL,
            std_col.COUNTY_NAME_COL,
        ],
    }

    demo_col_mapping = {
        'race': (std_col.RACE_CATEGORY_ID_COL, list(RACE_NAMES_MAPPING.values())),
        'age': (std_col.AGE_COL, list(AGE_NAMES_MAPPING.values())),
        'sex': (std_col.SEX_COL, list(SEX_NAMES_MAPPING.values())),
    }

    geo_cols = geo_col_mapping[geo]
    demog_col = demo_col_mapping[demographic][0]
    all_demos = demo_col_mapping[demographic][1]
    unknown_values = ["Unknown", std_col.Race.UNKNOWN.value]
    all_demos = set([v for v in all_demos if v not in unknown_values])

    # Map from each geo to the demographic values present. Note that multiple
    # values/columns may define each geo.
    geo_demo_map = df.loc[:, geo_cols + [
        demog_col, std_col.TIME_PERIOD_COL]].groupby(geo_cols + [std_col.TIME_PERIOD_COL])

    geo_demo_map = geo_demo_map.agg({demog_col: list}).to_dict()[demog_col]

    # List where each entry is a geo and demographic value pair that need to be
    # added to the df. Example entry: ["06035", "LASSEN", "CA", "ASIAN_NH"].
    geo_demo_to_add = []
    for geo_key, demo_values in geo_demo_map.items():
        geo_lst = [geo_key] if isinstance(geo_key, str) else list(geo_key)
        values_to_add = sorted(list(all_demos.difference(set(demo_values))))
        for val in values_to_add:
            geo_demo_to_add.append(geo_lst + [val])

    # Build the dataframe (as a dict) that we want to append to the original.
    df_to_append = []
    columns = list(df.columns)
    for geo_demo in geo_demo_to_add:
        row = []
        for col in columns:
            if col in geo_cols:
                row.append(geo_demo[geo_cols.index(col)])
            elif col == demog_col:
                row.append(geo_demo[-1])
            elif col == std_col.TIME_PERIOD_COL:
                row.append(geo_demo[-2])
            else:
                row.append(np.NaN)
        df_to_append.append(row)

    return pd.concat([df, pd.DataFrame(df_to_append, columns=columns)],
                     ignore_index=True)
