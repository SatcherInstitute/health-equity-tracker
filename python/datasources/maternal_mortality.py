from ingestion import gcs_to_bq_util
from datasources.data_source import DataSource
import ingestion.standardized_columns as std_col
from ingestion.merge_utils import merge_state_ids, merge_pop_numbers
from ingestion.constants import NATIONAL_LEVEL, STATE_LEVEL, US_NAME, CURRENT, HISTORICAL
from ingestion import dataset_utils
import pandas as pd
from typing import List

NATIONAL = "National"

RACE_GROUPS_TO_STANDARD = {
    'Non-Hispanic American Indian and Alaska Native': std_col.Race.AIAN_NH.value,
    'Non-Hispanic Asian, Native Hawaiian, or Other Pacific Islander': std_col.Race.API_NH.value,
    'Non-Hispanic Black': std_col.Race.BLACK_NH.value,
    'Non-Hispanic White': std_col.Race.WHITE_NH.value,
    'Hispanic and any race': std_col.Race.HISP.value,
    'All racial and ethnic groups': std_col.Race.ALL.value,
}

# ZIP FILE CONTAINING STATE-LEVEL CSV FOR /data
# https://ghdx.healthdata.org/record/ihme-data/united-states-maternal-mortality-by-state-race-ethnicity-1999-2019

# DATA FOR NATIONAL AND REGIONAL COUNTS ARE FROM THE IMAGE IN THE
# ORIGINAL STUDY LABELED "Table" AND MANUALLY INPUTTED TO /data

COLS_TO_STANDARD = {
    'race_group': std_col.RACE_CATEGORY_ID_COL,
    'location_name': std_col.STATE_NAME_COL,
    'year_id': std_col.TIME_PERIOD_COL,
}

RATE_COLS_TO_STANDARD = {'val': std_col.MM_PER_100K, **COLS_TO_STANDARD}


class MaternalMortalityData(DataSource):
    @staticmethod
    def get_id():
        return 'MATERNAL_MORTALITY_DATA'

    @staticmethod
    def get_table_name():
        return 'maternal_mortality_data'

    def upload_to_gcs(self, _, **attrs):
        raise NotImplementedError('upload_to_gcs should not be called for MaternalMortalityData')

    def write_to_bq(self, dataset, gcs_bucket, **attrs):

        # load source data once
        source_df = preprocess_source_rates()

        for geo_level in [STATE_LEVEL, NATIONAL_LEVEL]:

            # filter source data rows for states or national
            df = source_df.copy()
            df = (
                df[df[std_col.STATE_NAME_COL] != US_NAME]
                if geo_level == STATE_LEVEL
                else df[df[std_col.STATE_NAME_COL] == US_NAME]
            )

            df = merge_state_ids(df)
            df = merge_pop_numbers(df, std_col.RACE_COL, geo_level)

            keep_string_cols = [
                std_col.TIME_PERIOD_COL,
                std_col.STATE_FIPS_COL,
                std_col.RACE_CATEGORY_ID_COL,
                std_col.STATE_NAME_COL,
                std_col.RACE_OR_HISPANIC_COL,
            ]

            if geo_level == NATIONAL_LEVEL:
                df = merge_counts(df)
                df = dataset_utils.generate_pct_share_col_without_unknowns(
                    df,
                    {std_col.MATERNAL_DEATHS_RAW: std_col.MM_PCT_SHARE},
                    std_col.RACE_OR_HISPANIC_COL,
                    std_col.ALL_VALUE,
                )
                df = dataset_utils.generate_pct_rel_inequity_col(
                    df, std_col.MM_PCT_SHARE, std_col.POPULATION_PCT_COL, std_col.MM_PCT_REL_INEQUITY
                )

            for time_type in [HISTORICAL, CURRENT]:
                table_name = f'by_race_{geo_level}_{time_type}'

                float_cols = get_float_cols(time_type, geo_level)

                df_for_bq = df.copy()[keep_string_cols + float_cols]

                if time_type == CURRENT:
                    df_for_bq = dataset_utils.preserve_only_current_time_period_rows(df_for_bq, std_col.TIME_PERIOD_COL)

                col_types = gcs_to_bq_util.get_bq_column_types(df_for_bq, float_cols)

                gcs_to_bq_util.add_df_to_bq(df_for_bq, dataset, table_name, column_types=col_types)


def preprocess_source_rates() -> pd.DataFrame:
    """Load and preprocess source data.
    Returns:
        pandas.DataFrame: preprocessed source data including state and national rows
    """
    source_rates_df = gcs_to_bq_util.load_csv_as_df_from_data_dir(
        'maternal_mortality',
        'IHME_USA_MMR_STATE_RACE_ETHN_1999_2019_ESTIMATES_Y2023M07D03.CSV',
        dtype={'year_id': str},
        usecols=RATE_COLS_TO_STANDARD.keys(),
    )

    source_rates_df = source_rates_df.rename(columns=RATE_COLS_TO_STANDARD)
    source_rates_df = source_rates_df.replace({NATIONAL: US_NAME})
    source_rates_df = source_rates_df.replace(RACE_GROUPS_TO_STANDARD)
    std_col.add_race_columns_from_category_id(source_rates_df)

    # round rate to whole numbers
    source_rates_df[std_col.MM_PER_100K] = source_rates_df[std_col.MM_PER_100K].round(0)

    return source_rates_df


def merge_counts(df: pd.DataFrame) -> pd.DataFrame:
    """Merges columns for live births and maternal deaths onto the df.
    These are manually input from a png image titled 'Table' within the original study

    TODO: There are also regional counts available (the South, Mid-Atlantic, etc.)
    which we could consider using in place of missing state level counts."""

    source_counts_df = gcs_to_bq_util.load_csv_as_df_from_data_dir(
        'maternal_mortality',
        'Table.csv',
        dtype={'year_id': str},
        usecols=[
            'race_group',
            'location_name',
            'year_id',
            std_col.MATERNAL_DEATHS_RAW,
            std_col.LIVE_BIRTHS_RAW,
        ],
    )

    source_counts_df = source_counts_df.rename(columns=COLS_TO_STANDARD)
    source_counts_df = source_counts_df.replace({NATIONAL: US_NAME})
    source_counts_df = source_counts_df.replace(RACE_GROUPS_TO_STANDARD)
    std_col.add_race_columns_from_category_id(source_counts_df)

    df = df.merge(
        source_counts_df,
        on=[
            std_col.TIME_PERIOD_COL,
            std_col.STATE_NAME_COL,
            std_col.RACE_OR_HISPANIC_COL,
            std_col.RACE_CATEGORY_ID_COL,
        ],
        how="left",
    )

    return df


def get_float_cols(time_type: str, geo_level: str) -> List[str]:
    """Get the float columns for the given time type and geo level
    Until we can load regional counts from Table as state, most metrics are only national
    Args:
        time_type (str): time type
        geo_level (str): geo level
    Returns:
        List[str]: list of numerical columns
    """

    cols = [std_col.MM_PER_100K]

    if time_type == HISTORICAL:
        if geo_level == NATIONAL_LEVEL:
            cols.extend([std_col.MM_PCT_REL_INEQUITY])
    if time_type == CURRENT:
        if geo_level == NATIONAL_LEVEL:
            cols.extend(
                [std_col.POPULATION_PCT_COL, std_col.MM_PCT_SHARE, std_col.MATERNAL_DEATHS_RAW, std_col.LIVE_BIRTHS_RAW]
            )

    return cols
