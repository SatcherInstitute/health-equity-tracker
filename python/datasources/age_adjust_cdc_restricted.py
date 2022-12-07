import ingestion.standardized_columns as std_col
from ingestion.standardized_columns import Race
import pandas as pd  # type: ignore

import datasources.census_pop_estimates as census_pop_estimates
import datasources.cdc_restricted_local as cdc_restricted_local

from datasources.cdc_restricted import get_col_types

from datasources.data_source import DataSource
from ingestion import gcs_to_bq_util
from ingestion.dataset_utils import ratio_round_to_None

from ingestion.constants import (
    NATIONAL_LEVEL,
    STATE_LEVEL,
    UNKNOWN,
)

REFERENCE_POPULATION = Race.ALL.value
BASE_POPULATION = Race.WHITE_NH.value

AGE_ADJUST_RACES = {Race.WHITE_NH.value, Race.BLACK_NH.value,
                    Race.HISP.value, Race.AIAN_NH.value,
                    Race.NHPI_NH.value, Race.ASIAN_NH.value}

EXPECTED_HOSPS = 'expected_hosps'
EXPECTED_DEATHS = 'expected_deaths'


class AgeAdjustCDCRestricted(DataSource):

    @staticmethod
    def get_id():
        return 'AGE_ADJUST_CDC_RESTRICTED'

    @staticmethod
    def get_table_name():
        return 'cdc_restricted_data'

    def upload_to_gcs(self, _, **attrs):
        raise NotImplementedError(
            'upload_to_gcs should not be called for AgeAdjustCDCRestricted')

    def write_to_bq(self, dataset, gcs_bucket, **attrs):
        table_names_to_dfs = {}

        for cumulative in [True, False]:
            for geo in [STATE_LEVEL, NATIONAL_LEVEL]:

                age_adjusted_df = self.generate_age_adjustment(geo, cumulative)

                only_race = f'by_race_{geo}_processed'
                table_name = f'{only_race}-with_age_adjust'

                if not cumulative:
                    table_name += '_time_series'

                only_race_df = gcs_to_bq_util.load_df_from_bigquery(
                    'cdc_restricted_data', only_race)
                table_names_to_dfs[table_name] = merge_age_adjusted(
                    only_race_df, age_adjusted_df)

        # For each of the files, we load it as a dataframe and add it as a
        # table in the BigQuery dataset. We expect that all aggregation and
        # standardization of the data has been done by this point.
        for table_name, df in table_names_to_dfs.items():
            column_types = get_col_types(df, True)
            column_types[std_col.COVID_HOSP_RATIO_AGE_ADJUSTED] = 'FLOAT'
            column_types[std_col.COVID_DEATH_RATIO_AGE_ADJUSTED] = 'FLOAT'

            # Clean up column names.
            self.clean_frame_column_names(df)

            std_col.add_race_columns_from_category_id(df)

            gcs_to_bq_util.add_df_to_bq(
                df, dataset, table_name, column_types=column_types)

    def generate_age_adjustment(self, geo, cumulative):
        print(f'age adjusting {geo} with cumulative = {cumulative}')
        with_race_age = 'by_race_age_state'
        with_race_age_df = gcs_to_bq_util.load_df_from_bigquery(
            'cdc_restricted_data', with_race_age, dtype={'state_fips': str})

        pop_df = gcs_to_bq_util.load_df_from_bigquery(
            'census_pop_estimates', 'race_and_ethnicity', dtype={'state_fips': str})

        # Only get the covid data from states we have population data for
        states_with_pop = set(
            pop_df[std_col.STATE_FIPS_COL].drop_duplicates().to_list())
        with_race_age_df = with_race_age_df.loc[
            with_race_age_df[std_col.STATE_FIPS_COL].isin(states_with_pop)
        ].reset_index(drop=True)

        pop_df_death, pop_df_hosp = pop_df, pop_df

        if geo == NATIONAL_LEVEL:
            with_race_age_df_death = with_race_age_df.loc[~with_race_age_df[std_col.COVID_DEATH_Y].isna(
            )]
            states_to_include_death = set(
                with_race_age_df_death[std_col.STATE_FIPS_COL].drop_duplicates().to_list())

            pop_df_death = census_pop_estimates.generate_national_pop_data(
                pop_df, states_to_include_death)

            with_race_age_df_hosp = with_race_age_df.loc[~with_race_age_df[std_col.COVID_HOSP_Y].isna(
            )]
            states_to_include_hosp = set(
                with_race_age_df_hosp[std_col.STATE_FIPS_COL].drop_duplicates().to_list())

            pop_df_hosp = census_pop_estimates.generate_national_pop_data(
                pop_df, states_to_include_hosp)

            groupby_cols = [std_col.RACE_CATEGORY_ID_COL, std_col.AGE_COL]

            if not cumulative:
                groupby_cols.append(std_col.TIME_PERIOD_COL)

            with_race_age_df = cdc_restricted_local.generate_national_dataset(
                with_race_age_df, groupby_cols)

        if cumulative:
            groupby_cols = [
                std_col.STATE_FIPS_COL,
                std_col.STATE_NAME_COL,
                std_col.RACE_CATEGORY_ID_COL,
                std_col.AGE_COL,
            ]
            with_race_age_df = with_race_age_df.groupby(groupby_cols).sum().reset_index()

        # Clean with race age df
        with_race_age_df = with_race_age_df.loc[
            with_race_age_df[std_col.AGE_COL] != UNKNOWN
        ].reset_index(drop=True)

        with_race_age_df = with_race_age_df.loc[
            with_race_age_df[std_col.RACE_CATEGORY_ID_COL].isin(
                AGE_ADJUST_RACES)
        ].reset_index(drop=True)

        df = get_expected_col(with_race_age_df, pop_df_hosp, EXPECTED_HOSPS, std_col.COVID_HOSP_Y)
        df = get_expected_col(df, pop_df_death, EXPECTED_DEATHS, std_col.COVID_DEATH_Y)
        return age_adjust_from_expected(df, cumulative)


def merge_age_adjusted(df, age_adjusted_df):
    """Merges the age adjusted death rate into the standard COVID dataset.
       Returns a dataframe with all needed COVID info for the frontend.

       df: a dataframe with covid date without age adjusted numbers
       age_adjusted_df: a dataframe with age adjusted covid numbers"""

    merge_cols = [std_col.STATE_FIPS_COL, std_col.STATE_NAME_COL, std_col.RACE_CATEGORY_ID_COL]

    df = df.reset_index(drop=True)
    age_adjusted_df = age_adjusted_df.reset_index(drop=True)

    return pd.merge(df, age_adjusted_df, how='left', on=merge_cols)


def get_expected_col(race_and_age_df, population_df, expected_col, raw_number_col):
    """Calculates the age adjusted expected deaths of each racial group.
       I made this function to break up the age adjustment into smaller, more
       easily testable pieces.

       Returns a dataframe meant to be used in memory.

       race_and_age_df: a dataframe with covid deaths broken down by race and age
       population_df: a dataframe with population broken down by race and age
       expected_col: a string column name to place the output of the calculations in
                     ie: `expected_deaths`
       raw_number_col: string column name to get the raw number of cases to age
                       adjust from"""

    this_pop_size, ref_pop_size = 'this_pop_size', 'ref_pop_size'

    def get_expected(row):
        """Calculates the expcted value of each race/age split based on the
           raw condition count, the reference population, and the race/age population
           split."""

        if not row[ref_pop_size]:
            raise ValueError(
                f'Population size for {REFERENCE_POPULATION} demographic is 0 or nil')

        if not row[raw_number_col]:
            return None

        true_rate = float(row[raw_number_col]) / float(row[this_pop_size])
        return round(true_rate * float(row[ref_pop_size]), 2)

    merge_cols = [std_col.RACE_CATEGORY_ID_COL, std_col.AGE_COL, std_col.STATE_FIPS_COL]

    population_df = population_df[merge_cols + [std_col.POPULATION_COL]]

    # First, we merge the population data to get the population for each
    # race/age split, which we put in a column called `this_pop_size`.
    df = pd.merge(race_and_age_df, population_df, on=merge_cols)
    df = df.rename(columns={std_col.POPULATION_COL: this_pop_size})

    ref_pop_df = population_df.loc[population_df[std_col.RACE_CATEGORY_ID_COL] ==
                                   REFERENCE_POPULATION].reset_index(drop=True)

    merge_cols = [std_col.AGE_COL, std_col.STATE_FIPS_COL]

    ref_pop_df = ref_pop_df[merge_cols + [std_col.POPULATION_COL]]

    # Then, we merge the population data to get the reference population
    # for each age group, which we put in a column called `ref_pop_size`
    df = pd.merge(df, ref_pop_df, on=merge_cols)
    df = df.rename(columns={std_col.POPULATION_COL: ref_pop_size})

    # Finally, we calculate the expected value of the raw count
    # using the function `get_expected`
    df[expected_col] = df.apply(get_expected, axis=1)

    df = df.drop(columns=[this_pop_size, ref_pop_size])
    return df.reset_index(drop=True)


def age_adjust_from_expected(df, cumulative):
    """Calculates the age adjusted death rate against the standard population
       when given a dataframe with the expected deaths from each racial group.
       Returns a dataframe with the age adjusted death rate.

       df: dataframe with an 'expected_deaths' and 'expected_hosps' field"""

    def get_age_adjusted_ratios(row):
        row[std_col.COVID_HOSP_RATIO_AGE_ADJUSTED] = None if \
            not row[base_pop_expected_hosps] else \
            ratio_round_to_None(row[EXPECTED_HOSPS], row[base_pop_expected_hosps])

        row[std_col.COVID_DEATH_RATIO_AGE_ADJUSTED] = None if \
            not row[base_pop_expected_deaths] else \
            ratio_round_to_None(row[EXPECTED_DEATHS], row[base_pop_expected_deaths])

        return row

    base_pop_expected_deaths, base_pop_expected_hosps = \
        'base_pop_expected_deaths', 'base_pop_expected_hosps'

    groupby_cols = [std_col.STATE_FIPS_COL, std_col.STATE_NAME_COL,
                    std_col.RACE_CATEGORY_ID_COL]
    if not cumulative:
        groupby_cols.append(std_col.TIME_PERIOD_COL)

    # First, sum up expected deaths across age groups
    df = df.groupby(groupby_cols).sum().reset_index()

    base_pop_df = df.loc[df[std_col.RACE_CATEGORY_ID_COL] ==
                         BASE_POPULATION].reset_index(drop=True)

    merge_cols = [std_col.STATE_FIPS_COL]
    if not cumulative:
        merge_cols.append(std_col.TIME_PERIOD_COL)

    base_pop_df = base_pop_df[merge_cols + [EXPECTED_DEATHS, EXPECTED_HOSPS]]
    base_pop_df = base_pop_df.rename(columns={EXPECTED_HOSPS: base_pop_expected_hosps,
                                              EXPECTED_DEATHS: base_pop_expected_deaths})

    df = pd.merge(df, base_pop_df, on=merge_cols)
    df = df.apply(get_age_adjusted_ratios, axis=1)

    needed_cols = groupby_cols
    needed_cols.extend([std_col.COVID_DEATH_RATIO_AGE_ADJUSTED,
                       std_col.COVID_HOSP_RATIO_AGE_ADJUSTED])

    return df[needed_cols]
