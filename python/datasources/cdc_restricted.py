import numpy as np  # type: ignore
import pandas as pd  # type: ignore
import time

import ingestion.standardized_columns as std_col
from ingestion.standardized_columns import (
    generate_column_name,
    Race)

from ingestion.constants import (
    US_FIPS,
    US_NAME,
    NATIONAL_LEVEL,
    STATE_LEVEL,
    COUNTY_LEVEL,
    RACE,
    AGE,
    SEX,
    UNKNOWN)

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
    generate_pct_share_col_with_unknowns,
    generate_pct_rel_inequity_col,
    zero_out_pct_rel_inequity
)

from ingestion.merge_utils import (
    merge_state_ids,
    merge_pop_numbers,
    merge_multiple_pop_cols,
    merge_county_names)

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

COVID_RATES_TO_PCT_REL_INEQUITY_MAP = {}
for prefix in COVID_CONDITION_TO_PREFIX.values():
    COVID_RATES_TO_PCT_REL_INEQUITY_MAP[
        generate_column_name(
            prefix,
            std_col.PER_100K_SUFFIX
        )] = generate_column_name(
        prefix,
        std_col.PCT_REL_INEQUITY_SUFFIX
    )

DEMO_COL_MAPPING = {
    RACE: (std_col.RACE_CATEGORY_ID_COL, list(RACE_NAMES_MAPPING.values())),
    AGE: (std_col.AGE_COL, list(AGE_NAMES_MAPPING.values())),
    SEX: (std_col.SEX_COL, list(SEX_NAMES_MAPPING.values())),
}

POPULATION_SUFFIX = 'population'


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
        demo = self.get_attr(attrs, 'demographic')
        for geo in [NATIONAL_LEVEL, STATE_LEVEL, COUNTY_LEVEL]:
            for time_series in [False, True]:
                geo_to_pull = STATE_LEVEL if geo == NATIONAL_LEVEL else geo
                filename = f'cdc_restricted_by_{demo}_{geo_to_pull}.csv'

                df = gcs_to_bq_util.load_csv_as_df(
                    gcs_bucket, filename, dtype={'county_fips': str})

                df = self.generate_breakdown(df, demo, geo, time_series)

                if demo == RACE:
                    std_col.add_race_columns_from_category_id(df)

                column_types = get_col_types(df, time_series)

                table_name = f'by_{demo}_{geo}_processed'
                if time_series:
                    table_name += '_time_series'

                gcs_to_bq_util.add_df_to_bq(
                    df, dataset, table_name, column_types=column_types)

        # Only do this once, open to a less weird way of doing this
        if demo == RACE:
            for filename, table_name in ONLY_FIPS_FILES.items():
                df = gcs_to_bq_util.load_csv_as_df(gcs_bucket, filename)

                df = df[df[std_col.STATE_POSTAL_COL] != UNKNOWN]
                df = merge_state_ids(df)
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

    def generate_breakdown(self, df, demo, geo, time_series):
        print(f'processing {demo} {geo} time_series = {time_series}')
        start = time.time()

        demo_col = std_col.RACE_CATEGORY_ID_COL if demo == RACE else demo
        unknown_val = Race.UNKNOWN.value if demo == RACE else UNKNOWN
        all_val = Race.ALL.value if demo == RACE else std_col.ALL_VALUE

        all_columns = [
            std_col.STATE_FIPS_COL,
            std_col.STATE_NAME_COL,
            demo_col,
            std_col.COVID_POPULATION_PCT,
        ]

        geo_to_pull = STATE_LEVEL if geo == NATIONAL_LEVEL else geo
        df = add_missing_demographic_values(df, geo_to_pull, demo)

        if not time_series:
            groupby_cols = [
                std_col.STATE_POSTAL_COL,
                demo_col,
            ]

            if geo == COUNTY_LEVEL:
                groupby_cols.extend(
                    [std_col.COUNTY_NAME_COL, std_col.COUNTY_FIPS_COL])

            df = df.groupby(groupby_cols).sum(min_count=1).reset_index()

        else:
            all_columns.append(std_col.TIME_PERIOD_COL)

        df = merge_state_ids(df, keep_postal=True)

        if geo == COUNTY_LEVEL:
            all_columns.extend(
                [std_col.COUNTY_NAME_COL, std_col.COUNTY_FIPS_COL])
            df = merge_county_names(df)

        if geo == NATIONAL_LEVEL:
            pop_cols = [
                generate_column_name(std_col.COVID_CASES, POPULATION_SUFFIX),
                generate_column_name(std_col.COVID_DEATH_Y, POPULATION_SUFFIX),
                generate_column_name(std_col.COVID_HOSP_Y, POPULATION_SUFFIX),
            ]

            df = merge_multiple_pop_cols(df, demo, pop_cols)
            null_out_suppressed_deaths_hosps(df, True)
            df = generate_national_dataset(df, demo_col, time_series)

        fips = std_col.COUNTY_FIPS_COL if geo == COUNTY_LEVEL else std_col.STATE_FIPS_COL

        # Drop annoying column that doesnt match any fips codes or have
        # an associated time period
        df = df[df[fips].notna()]
        if time_series:
            df = df[df[std_col.TIME_PERIOD_COL].notna()]

        if geo == COUNTY_LEVEL:
            df = remove_bad_fips_cols(df)

        df = merge_pop_numbers(df, demo, geo)
        df = df.rename(
            columns={std_col.POPULATION_PCT_COL: std_col.COVID_POPULATION_PCT})

        for raw_count_col, prefix in COVID_CONDITION_TO_PREFIX.items():
            per_100k_col = generate_column_name(
                prefix, std_col.PER_100K_SUFFIX)
            all_columns.append(per_100k_col)

            pop_col = std_col.POPULATION_COL
            if geo == NATIONAL_LEVEL:
                pop_col = generate_column_name(
                    raw_count_col, POPULATION_SUFFIX)
            df = generate_per_100k_col(
                df, raw_count_col, pop_col, per_100k_col)

        raw_count_to_pct_share = {}
        for raw_count_col, prefix in COVID_CONDITION_TO_PREFIX.items():
            raw_count_to_pct_share[raw_count_col] = generate_column_name(
                prefix, std_col.SHARE_SUFFIX)

        all_columns.extend(list(raw_count_to_pct_share.values()))
        df = generate_pct_share_col_with_unknowns(df, raw_count_to_pct_share,
                                                  demo_col, all_val, unknown_val)

        if time_series and geo != NATIONAL_LEVEL:
            df = remove_or_set_to_zero(df, geo, demo)

        if time_series:
            for prefix in COVID_CONDITION_TO_PREFIX.values():
                pct_relative_inequity_col = generate_column_name(

                    prefix, std_col.PCT_REL_INEQUITY_SUFFIX)
                df = generate_pct_rel_inequity_col(
                    df, generate_column_name(prefix, std_col.SHARE_SUFFIX),
                    std_col.COVID_POPULATION_PCT,
                    pct_relative_inequity_col)

                all_columns.append(pct_relative_inequity_col)

        if geo != NATIONAL_LEVEL:
            null_out_suppressed_deaths_hosps(df, False)

        if geo == COUNTY_LEVEL:
            null_out_dc_county_rows(df)

        if geo == COUNTY_LEVEL and not time_series:
            null_out_all_unknown_deaths_hosps(df)

        if time_series:
            df = zero_out_pct_rel_inequity(
                df, geo, demo, COVID_RATES_TO_PCT_REL_INEQUITY_MAP)

        df = df[all_columns]
        self.clean_frame_column_names(df)

        sortby_cols = [fips, demo_col]
        df = df.sort_values(by=sortby_cols).reset_index(drop=True)

        end = time.time()
        print("took", round(end - start, 2),
              f"seconds to process {demo} {geo}")
        return df


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


def get_col_types(df, time_series):
    """Returns a dict of column types to send to bigquery

      df: DataFrame to generate column types dict for"""
    column_types = {c: 'STRING' for c in df.columns}
    for prefix in COVID_CONDITION_TO_PREFIX.values():
        column_types[generate_column_name(
            prefix, std_col.PER_100K_SUFFIX)] = 'FLOAT'
        column_types[generate_column_name(
            prefix, std_col.SHARE_SUFFIX)] = 'FLOAT'

        if time_series:
            column_types[generate_column_name(
                prefix, std_col.PCT_REL_INEQUITY_SUFFIX)] = 'FLOAT'

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


def generate_national_dataset(state_df, demo_col, time_series):
    """Generates a national dataset based on a state_df and demographic column"""
    int_cols = [
        std_col.COVID_CASES,
        std_col.COVID_DEATH_Y,
        std_col.COVID_HOSP_Y,
        generate_column_name(std_col.COVID_CASES, POPULATION_SUFFIX),
        generate_column_name(std_col.COVID_DEATH_Y, POPULATION_SUFFIX),
        generate_column_name(std_col.COVID_HOSP_Y, POPULATION_SUFFIX),
    ]

    state_df[int_cols] = state_df[int_cols].fillna(0)
    state_df[int_cols] = state_df[int_cols].replace("", 0)
    state_df[int_cols] = state_df[int_cols].astype(int)

    groupby_cols = [demo_col]
    if time_series:
        groupby_cols.append(std_col.TIME_PERIOD_COL)
    df = state_df.groupby(groupby_cols).sum().reset_index()

    df[std_col.STATE_FIPS_COL] = US_FIPS
    df[std_col.STATE_NAME_COL] = US_NAME

    needed_cols = [
        std_col.STATE_FIPS_COL,
        std_col.STATE_NAME_COL,
    ]

    if time_series:
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
        STATE_LEVEL: [std_col.STATE_POSTAL_COL],
        COUNTY_LEVEL: [
            std_col.STATE_POSTAL_COL,
            std_col.COUNTY_FIPS_COL,
            std_col.COUNTY_NAME_COL,
        ],
    }

    geo_cols = geo_col_mapping[geo]
    demog_col = DEMO_COL_MAPPING[demographic][0]
    all_demos = DEMO_COL_MAPPING[demographic][1]
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


def remove_or_set_to_zero(df, geo, demographic):
    """Cleans a dataframe by either removing unneeded rows
    or changing rows to zero

    df: Pandas dataframe to append onto.
    geo: Geographic level. Must be `state` or `county`.
    demographic: Demographic breakdown. Must be `race`, `age`, or `sex`."""

    geo_col_mapping = {
        STATE_LEVEL: [
            std_col.STATE_POSTAL_COL,
            std_col.STATE_FIPS_COL,
            std_col.STATE_NAME_COL,
        ],
        COUNTY_LEVEL: [
            std_col.STATE_POSTAL_COL,
            std_col.COUNTY_FIPS_COL,
            std_col.COUNTY_NAME_COL,
        ],
    }

    geo_cols = geo_col_mapping[geo]
    demog_col = DEMO_COL_MAPPING[demographic][0]

    grouped_df = df.groupby(

        geo_cols + [demog_col]).sum(min_count=1).reset_index()
    grouped_df = grouped_df.rename(

        columns={std_col.COVID_CASES: 'grouped_cases'})
    grouped_df = grouped_df[geo_cols + [demog_col, 'grouped_cases']]

    # Remove all rows that have zero cases throughout the pandemic
    df = pd.merge(df, grouped_df, how='left', on=geo_cols + [demog_col])
    df = df[~pd.isna(df['grouped_cases'])]
    df = df.drop(columns='grouped_cases')

    # Unknowns are a special case, we want to keep the per_100k values
    # as NULL no matter what
    unknown = Race.UNKNOWN.value if demographic == 'race' else UNKNOWN
    unknown_df = df.loc[df[demog_col] == unknown]

    # Set all other null conditions to zero
    condition_cols = []
    for prefix in COVID_CONDITION_TO_PREFIX.values():
        for suffix in [std_col.PER_100K_SUFFIX, std_col.SHARE_SUFFIX]:
            condition_cols.append(generate_column_name(prefix, suffix))

    df = df.loc[df[demog_col] != unknown]
    df[condition_cols] = df[condition_cols].fillna(0)
    df = pd.concat([df, unknown_df])

    return df.reset_index()


def null_out_suppressed_deaths_hosps(df, modify_pop_rows):
    """Sets suppressed states deaths and hospitalizations to null based on the
       tuples defined in `cdc_restricted_local.py`.
       Note: This is an in place function and doesn't return anything.

       df: Pandas df to modify
       modify_pop_rows: Boolean, whether or not to set corresponding population
                        rows to np.nan. Note, these population rows must have been
                        created using the `merge_multiple_pop_cols` function."""

    suffixes = [std_col.PER_100K_SUFFIX,

                std_col.SHARE_SUFFIX, std_col.PCT_REL_INEQUITY_SUFFIX]
    hosp_rows_to_modify = df[std_col.STATE_POSTAL_COL].isin(
        HOSP_DATA_SUPPRESSION_STATES)
    for suffix in suffixes:
        df.loc[hosp_rows_to_modify,
               generate_column_name(std_col.COVID_HOSP_PREFIX, suffix)] = np.nan

    death_rows_to_modify = df[std_col.STATE_POSTAL_COL].isin(
        DEATH_DATA_SUPPRESSION_STATES)
    for suffix in suffixes:
        df.loc[death_rows_to_modify,
               generate_column_name(std_col.COVID_DEATH_PREFIX, suffix)] = np.nan

    if modify_pop_rows:
        df.loc[hosp_rows_to_modify,
               generate_column_name(std_col.COVID_HOSP_Y, POPULATION_SUFFIX)] = np.nan
        df.loc[death_rows_to_modify,
               generate_column_name(std_col.COVID_DEATH_Y, POPULATION_SUFFIX)] = np.nan


def null_out_all_unknown_deaths_hosps(df):
    """If a given geo x breakdown has all unknown hospitalizations or deaths,
       we treat it as if it has "no data," i.e. we clear the hosp/death fields.
       Note: This is an in place function so it doesnt return anything

       df: DataFrame to null out rows on"""

    df.loc[df[std_col.COVID_DEATH_UNKNOWN] ==
           df[std_col.COVID_CASES], generate_column_name(std_col.COVID_DEATH_PREFIX, std_col.PER_100K_SUFFIX)] = np.nan
    df.loc[df[std_col.COVID_DEATH_UNKNOWN] ==
           df[std_col.COVID_CASES], generate_column_name(std_col.COVID_DEATH_PREFIX, std_col.SHARE_SUFFIX)] = np.nan

    df.loc[df[std_col.COVID_HOSP_UNKNOWN] ==
           df[std_col.COVID_CASES], generate_column_name(std_col.COVID_HOSP_PREFIX, std_col.PER_100K_SUFFIX)] = np.nan
    df.loc[df[std_col.COVID_HOSP_UNKNOWN] ==
           df[std_col.COVID_CASES], generate_column_name(std_col.COVID_HOSP_PREFIX, std_col.SHARE_SUFFIX)] = np.nan
