import ingestion.standardized_columns as std_col
import pandas as pd  # type: ignore

import datasources.census_pop_estimates as census_pop_estimates
import datasources.cdc_restricted_local as cdc_restricted_local

from datasources.cdc_restricted import get_col_types

from datasources.data_source import DataSource
from ingestion import gcs_to_bq_util
from ingestion import dataset_utils

REFERENCE_POPULATION = std_col.Race.ALL.value
BASE_POPULATION = std_col.Race.WHITE_NH.value

AGE_ADJUST_RACES = {std_col.Race.WHITE_NH.value, std_col.Race.BLACK_NH.value, std_col.Race.HISP.value,
                    std_col.Race.AIAN_NH.value, std_col.Race.NHPI_NH.value, std_col.Race.ASIAN_NH.value}


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

        for geo in ['state', 'national']:
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

            if geo == 'national':
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

                groupby_cols = list(std_col.RACE_COLUMNS) + [std_col.AGE_COL]
                with_race_age_df = cdc_restricted_local.generate_national_dataset(
                    with_race_age_df, groupby_cols)

            # Clean with race age df
            with_race_age_df = with_race_age_df.loc[
                with_race_age_df[std_col.AGE_COL] != "Unknown"
            ].reset_index(drop=True)

            with_race_age_df = with_race_age_df.loc[
                with_race_age_df[std_col.RACE_CATEGORY_ID_COL].isin(
                    AGE_ADJUST_RACES)
            ].reset_index(drop=True)

            df = get_expected_deaths(with_race_age_df, pop_df_death)
            df = get_expected_hosps(df, pop_df_hosp)
            age_adjusted_df = age_adjust_from_expected(df)

            only_race = f'by_race_{geo}_processed'
            table_name = f'{only_race}-with_age_adjust'

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

            gcs_to_bq_util.add_df_to_bq(
                df, dataset, table_name, column_types=column_types)


def merge_age_adjusted(df, age_adjusted_df):
    """Merges the age adjusted death rate into the standard COVID dataset.
       Returns a dataframe with all needed COVID info for the frontend.

       df: a dataframe with covid date without age adjusted numbers
       age_adjusted_df: a dataframe with age adjusted covid numbers"""

    merge_cols = [std_col.STATE_FIPS_COL, std_col.STATE_NAME_COL]
    merge_cols.extend(std_col.RACE_COLUMNS)

    df = df.reset_index(drop=True)
    age_adjusted_df = age_adjusted_df.reset_index(drop=True)

    return pd.merge(df, age_adjusted_df, how='left', on=merge_cols)


def get_expected_hosps(race_and_age_df, population_df):
    """Calculates the age adjusted expected hospitalizations of each racial group.
       I made this function to break up the age adjustment into smaller, more easily testable pieces.

       Returns a dataframe meant to be used in memory.

       race_and_age_df: a dataframe with covid hospitalizations broken down by race and age
       population_df: a dataframe with population broken down by race and age"""

    def get_expected_hosp_rate(row):
        this_pop_size = float(population_df.loc[
            (population_df[std_col.RACE_CATEGORY_ID_COL] == row[std_col.RACE_CATEGORY_ID_COL]) &
            (population_df[std_col.AGE_COL] == row[std_col.AGE_COL]) &
            (population_df[std_col.STATE_FIPS_COL]
             == row[std_col.STATE_FIPS_COL])
        ][std_col.POPULATION_COL].values[0])

        if not this_pop_size:
            raise ValueError('Population size for %s demographic is 0 or nil' %
                             row[std_col.RACE_CATEGORY_ID_COL])

        true_hosp_rate = float(row[std_col.COVID_HOSP_Y]) / this_pop_size

        ref_pop_size = float(population_df.loc[
            (population_df[std_col.RACE_CATEGORY_ID_COL] == REFERENCE_POPULATION) &
            (population_df[std_col.AGE_COL] == row[std_col.AGE_COL]) &
            (population_df[std_col.STATE_FIPS_COL]
             == row[std_col.STATE_FIPS_COL])
        ][std_col.POPULATION_COL].values[0])

        if not ref_pop_size:
            raise ValueError(
                'Population size for %s demographic is 0 or nil' % REFERENCE_POPULATION)

        if not row[std_col.COVID_HOSP_Y]:
            return None
        else:
            true_hosp_rate = float(row[std_col.COVID_HOSP_Y]) / this_pop_size
            return round(true_hosp_rate * ref_pop_size, 2)

    df = race_and_age_df
    df['expected_hosps'] = df.apply(get_expected_hosp_rate, axis=1)

    return df


def get_expected_deaths(race_and_age_df, population_df):
    """Calculates the age adjusted expected deaths of each racial group.
       I made this function to break up the age adjustment into smaller, more easily testable pieces.

       Returns a dataframe meant to be used in memory.

       race_and_age_df: a dataframe with covid deaths broken down by race and age
       population_df: a dataframe with population broken down by race and age"""

    def get_expected_death_rate(row):
        this_pop_size = float(population_df.loc[
            (population_df[std_col.RACE_CATEGORY_ID_COL] == row[std_col.RACE_CATEGORY_ID_COL]) &
            (population_df[std_col.AGE_COL] == row[std_col.AGE_COL]) &
            (population_df[std_col.STATE_FIPS_COL]
             == row[std_col.STATE_FIPS_COL])
        ][std_col.POPULATION_COL].values[0])

        if not this_pop_size:
            raise ValueError('Population size for %s demographic is 0 or nil' %
                             row[std_col.RACE_CATEGORY_ID_COL])

        true_death_rate = float(row[std_col.COVID_DEATH_Y]) / this_pop_size

        ref_pop_size = float(population_df.loc[
            (population_df[std_col.RACE_CATEGORY_ID_COL] == REFERENCE_POPULATION) &
            (population_df[std_col.AGE_COL] == row[std_col.AGE_COL]) &
            (population_df[std_col.STATE_FIPS_COL]
             == row[std_col.STATE_FIPS_COL])
        ][std_col.POPULATION_COL].values[0])

        if not ref_pop_size:
            raise ValueError(
                'Population size for %s demographic is 0 or nil' % REFERENCE_POPULATION)

        if not row[std_col.COVID_DEATH_Y]:
            return None
        else:
            true_death_rate = float(row[std_col.COVID_DEATH_Y]) / this_pop_size
            return round(true_death_rate * ref_pop_size, 2)

    df = race_and_age_df
    df['expected_deaths'] = df.apply(get_expected_death_rate, axis=1)

    return df


def age_adjust_from_expected(df):
    """Calculates the age adjusted death rate against the standard population
       when given a dataframe with the expected deaths from each racial group.
       Returns a dataframe with the age adjusted death rate.

       df: dataframe with an 'expected_deaths' and 'expected_hosps' field"""

    def get_age_adjusted_death_rate(row):
        ref_pop_expected_deaths = df.loc[
            (df[std_col.RACE_CATEGORY_ID_COL] == BASE_POPULATION) &
            (df[std_col.STATE_FIPS_COL] == row[std_col.STATE_FIPS_COL])
        ]['expected_deaths'].values[0]

        if not ref_pop_expected_deaths:
            return None

        return dataset_utils.ratio_round_to_None(row['expected_deaths'], ref_pop_expected_deaths)

    def get_age_adjusted_hosp_rate(row):
        ref_pop_expected_hosp = df.loc[
            (df[std_col.RACE_CATEGORY_ID_COL] == BASE_POPULATION) &
            (df[std_col.STATE_FIPS_COL] == row[std_col.STATE_FIPS_COL])
        ]['expected_hosps'].values[0]

        if not ref_pop_expected_hosp:
            return None

        return dataset_utils.ratio_round_to_None(row['expected_hosps'], ref_pop_expected_hosp)

    groupby_cols = [std_col.STATE_FIPS_COL, std_col.STATE_NAME_COL]
    groupby_cols.extend(std_col.RACE_COLUMNS)

    grouped = df.groupby(groupby_cols)
    df = grouped.sum().reset_index()

    df[std_col.COVID_DEATH_RATIO_AGE_ADJUSTED] = df.apply(
        get_age_adjusted_death_rate, axis=1)
    df[std_col.COVID_HOSP_RATIO_AGE_ADJUSTED] = df.apply(
        get_age_adjusted_hosp_rate, axis=1)

    needed_cols = groupby_cols
    needed_cols.extend([std_col.COVID_DEATH_RATIO_AGE_ADJUSTED,
                       std_col.COVID_HOSP_RATIO_AGE_ADJUSTED])

    return df[needed_cols]
