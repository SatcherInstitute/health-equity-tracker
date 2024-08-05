"""
This documentation outlines the procedure for acquiring gun violence data for the general
population from the CDC WISQARS database. The data, once downloaded, is stored locally in
the `data/cdc_wisqars` directory for further processing and analysis.

Instructions for Downloading Data:
1. Access the WISQARS website at https://wisqars.cdc.gov/reports/.
2. Select `Fatal` as the injury outcome.
3. Specify the data years of interest, from `2001-2021`.
4. Set geography to `United States`.
5. Choose `All Intents` for the intent.
6. Under mechanism, opt for `Firearm`.
7. For demographics, select `All ages`, `Both Sexes`, `All Races`.
8. Decide on the report layout based on your requirements:
   - For fatal_gun_injuries-national-all: `Intent`, `None`, `None`, `None`
   - For fatal_gun_injuries-national-race: `Intent`, `Race`, `Ethnicity`, `None`

Notes:
- State-level data for non-fatal injury outcomes is not available.
- Race data is provided only for fatal data outcomes and covers the period from 2018-2021.

Last Updated: 2/24
"""

import pandas as pd
import numpy as np
from datasources.data_source import DataSource
from ingestion.constants import CURRENT, HISTORICAL, US_NAME, NATIONAL_LEVEL, Sex
from ingestion import gcs_to_bq_util, standardized_columns as std_col
from ingestion.dataset_utils import (
    combine_race_ethnicity,
    generate_pct_rel_inequity_col,
    generate_pct_share_col_without_unknowns,
    generate_pct_share_col_with_unknowns,
    generate_per_100k_col,
    generate_time_df_with_cols_and_types,
)
from ingestion.merge_utils import merge_state_ids
from ingestion.cdc_wisqars_utils import (
    generate_cols_map,
    convert_columns_to_numeric,
    contains_unknown,
    RACE_NAMES_MAPPING,
    INJ_INTENTS,
    INJ_OUTCOMES,
    condense_age_groups,
    load_wisqars_as_df_from_data_dir,
)  # pylint: disable=no-name-in-module
from typing import List
from ingestion.het_types import RATE_CALC_COLS_TYPE, WISQARS_VAR_TYPE, SEX_RACE_ETH_AGE_TYPE_OR_ALL, GEO_TYPE


PER_100K_MAP = generate_cols_map(INJ_INTENTS, std_col.PER_100K_SUFFIX)
RAW_TOTALS_MAP = generate_cols_map(INJ_INTENTS, std_col.RAW_SUFFIX)
RAW_POPULATIONS_MAP = generate_cols_map(INJ_OUTCOMES, std_col.POPULATION_COL)
PCT_SHARE_MAP = generate_cols_map(RAW_TOTALS_MAP.values(), std_col.PCT_SHARE_SUFFIX)
PCT_SHARE_MAP[std_col.FATAL_POPULATION] = std_col.FATAL_POPULATION_PCT
PCT_REL_INEQUITY_MAP = generate_cols_map(RAW_TOTALS_MAP.values(), std_col.PCT_REL_INEQUITY_SUFFIX)

PIVOT_DEM_COLS = {
    std_col.AGE_COL: ["year", "state", "age group", "population"],
    std_col.RACE_OR_HISPANIC_COL: ["year", "state", "race", "ethnicity", "population"],
    std_col.SEX_COL: ["year", "state", "sex", "population"],
    "all": ["year", "state", "population"],
}

TIME_MAP = {
    CURRENT: (
        list(PER_100K_MAP.values())
        + list(PCT_SHARE_MAP.values())
        + list(RAW_TOTALS_MAP.values())
        + list(RAW_POPULATIONS_MAP.values())
    ),
    HISTORICAL: (list(PER_100K_MAP.values()) + list(PCT_REL_INEQUITY_MAP.values()) + list(PCT_SHARE_MAP.values())),
}

COL_DICTS: List[RATE_CALC_COLS_TYPE] = [
    {
        'numerator_col': 'gun_violence_homicide_estimated_total',
        'denominator_col': 'fatal_population',
        'rate_col': 'gun_violence_homicide_per_100k',
    },
    {
        'numerator_col': 'gun_violence_suicide_estimated_total',
        'denominator_col': 'fatal_population',
        'rate_col': 'gun_violence_suicide_per_100k',
    },
]


class CDCWisqarsData(DataSource):
    """
    Class for handling CDC WISQARS data.

    Methods:
        get_id(): Retrieves the ID for CDC WISQARS data.
        get_table_name(): Retrieves the table name for CDC WISQARS data.
        upload_to_gcs(gcs_bucket, **attrs): Uploads data to Google Cloud Storage.
        write_to_bq(dataset, gcs_bucket, **attrs): Writes data to BigQuery.
        generate_breakdown_df(demographic, geo_level, alls_df): Generates a data frame
        by breakdown and geographic level.

    """

    @staticmethod
    def get_id():
        return "CDC_WISQARS_DATA"

    @staticmethod
    def get_table_name():
        return "cdc_wisqars_data"

    def upload_to_gcs(self, gcs_bucket, **attrs):
        raise NotImplementedError("upload_to_gcs should not be called for CDCWISQARS")

    def write_to_bq(self, dataset, gcs_bucket, **attrs):
        demographic: SEX_RACE_ETH_AGE_TYPE_OR_ALL = self.get_attr(attrs, "demographic")
        geo_level: GEO_TYPE = self.get_attr(attrs, "geographic")

        national_totals_by_intent_df = process_wisqars_df("all", geo_level)

        if demographic == std_col.RACE_OR_HISPANIC_COL:
            national_totals_by_intent_df.insert(2, 'race', std_col.Race.ALL.value)
        else:
            national_totals_by_intent_df.insert(2, demographic, std_col.ALL_VALUE)

        df = self.generate_breakdown_df(demographic, geo_level, national_totals_by_intent_df)

        for table_type in (CURRENT, HISTORICAL):
            table_name = f"{demographic}_{geo_level}_{table_type}"
            time_cols = TIME_MAP[table_type]

            df_for_bq, col_types = generate_time_df_with_cols_and_types(df, time_cols, table_type, demographic)

            gcs_to_bq_util.add_df_to_bq(df_for_bq, dataset, table_name, column_types=col_types)

    def generate_breakdown_df(self, demographic: str, geo_level: str, alls_df: pd.DataFrame):
        """generate_breakdown_df generates a gun violence data frame by demographic and geo_level

        demographic: string equal to `age`, `race_and_ethnicity, or `sex`
        geo_level: string equal to `national` or `state`
        alls_df: the data frame containing the all values for each demographic demographic
        return: a data frame of national time-based WISQARS data by demographic"""

        cols_to_standard = {
            "race": std_col.RACE_CATEGORY_ID_COL,
            "state": std_col.STATE_NAME_COL,
            "year": std_col.TIME_PERIOD_COL,
        }

        breakdown_group_df = process_wisqars_df(demographic, geo_level)

        # Replace WISQARS group labels with HET group labels
        breakdown_group_df = breakdown_group_df.replace({demographic: {"Females": Sex.FEMALE, "Males": Sex.MALE}})

        df = pd.concat([breakdown_group_df, alls_df], axis=0)
        df = df.rename(columns=cols_to_standard)

        if demographic == std_col.AGE_COL:
            df = condense_age_groups(df, COL_DICTS)
        if demographic == std_col.RACE_OR_HISPANIC_COL:
            std_col.add_race_columns_from_category_id(df)

        df = merge_state_ids(df)

        # Adds missing columns
        combined_cols = list(PER_100K_MAP.values()) + list(RAW_TOTALS_MAP.values())
        for col in combined_cols:
            if col not in df.columns:
                df[col] = np.nan

        if std_col.NON_FATAL_POPULATION not in df.columns:
            df[std_col.NON_FATAL_POPULATION] = np.nan

        # Detect if data frame has unknown values
        has_unknown = df.map(contains_unknown).any().any()

        if has_unknown:
            unknown = 'Unknown'
            if demographic == std_col.RACE_OR_HISPANIC_COL:
                unknown = 'Unknown race'
            df = generate_pct_share_col_with_unknowns(df, PCT_SHARE_MAP, demographic, std_col.ALL_VALUE, unknown)

        else:
            df = generate_pct_share_col_without_unknowns(df, PCT_SHARE_MAP, demographic, std_col.ALL_VALUE)

        for col in RAW_TOTALS_MAP.values():
            df = generate_pct_rel_inequity_col(
                df, PCT_SHARE_MAP[col], std_col.FATAL_POPULATION_PCT, PCT_REL_INEQUITY_MAP[col]
            )

        return df


def process_wisqars_df(demographic: str, geo_level: str):
    """
    generates WISQARS data by demographic and geo_level

    demographic: string equal to `age`, `race_and_ethnicity`, or `sex`
    geo_level: string equal to `national`, or `state`
    return: a data frame of time-based WISQARS data by demographic and geo_level with
    WISQARS columns
    """
    output_df = pd.DataFrame(columns=["year"])

    data_metric = 'deaths'
    data_column_name = 'intent'

    fatal_gun_injuries: WISQARS_VAR_TYPE = 'fatal_gun_injuries'

    df = load_wisqars_as_df_from_data_dir(fatal_gun_injuries, geo_level, demographic)

    df.columns = df.columns.str.lower()

    # Removes the metadata section from the csv
    metadata_start_index = df[df[data_column_name] == "Total"].index
    metadata_start_index = metadata_start_index[0]
    df = df.iloc[:metadata_start_index]

    # Cleans data frame
    columns_to_convert = [data_metric, 'crude rate']
    convert_columns_to_numeric(df, columns_to_convert)

    if geo_level == NATIONAL_LEVEL:
        df.insert(1, "state", US_NAME)

    df = df[~df['intent'].isin(['Unintentional', 'Undetermined', 'Legal Intervention'])]

    # Reshapes df to add the intent rows as columns
    pivot_df = df.pivot(
        index=PIVOT_DEM_COLS.get(demographic, []),
        columns="intent",
        values=['deaths', 'crude rate'],
    )

    pivot_df.columns = [
        (
            f"gun_violence_{col[1].lower().replace(' ', '_')}_{std_col.RAW_SUFFIX}"
            if col[0] == 'deaths'
            else f"gun_violence_{col[1].lower().replace(' ', '_')}_{std_col.PER_100K_SUFFIX}"
        )
        for col in pivot_df.columns
    ]

    df = pivot_df.reset_index()

    df.rename(
        columns={
            "age group": std_col.AGE_COL,
            'population': 'fatal_population',
            'sex': std_col.SEX_COL,
        },
        inplace=True,
    )
    if demographic == std_col.AGE_COL:
        df[std_col.AGE_COL] = df[std_col.AGE_COL].str.replace(' to ', '-')

    if std_col.ETH_COL in df.columns.to_list():
        df = combine_race_ethnicity(df, RACE_NAMES_MAPPING)
        df = df.rename(columns={'race_ethnicity_combined': 'race'})

        # Combines the unknown and hispanic rows
        df = df.groupby(['year', 'state', 'race']).sum(min_count=1).reset_index()

        # Identify rows where 'race' is 'HISP' or 'UNKNOWN'
        subset_mask = df['race'].isin(['HISP', 'UNKNOWN'])

        # Create a temporary DataFrame with just the subset
        temp_df = df[subset_mask].copy()

        # Apply the function to the temporary DataFrame
        for raw_total in RAW_TOTALS_MAP.values():
            if raw_total in df.columns:
                temp_df = generate_per_100k_col(temp_df, raw_total, 'fatal_population', 'crude rate', decimal_places=2)

        # Update the original DataFrame with the results for the 'crude rate' column
        df.loc[subset_mask, 'crude rate'] = temp_df['crude rate']

    output_df = output_df.merge(df, how="outer")

    return output_df
