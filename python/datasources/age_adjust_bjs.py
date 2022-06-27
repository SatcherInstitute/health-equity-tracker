import ingestion.standardized_columns as std_col
import pandas as pd  # type: ignore

import datasources.census_pop_estimates as census_pop_estimates
from datasources.census_pop_estimates import BJS_PRISON_RACES_MAP, BJS_PRISON_AGES_MAP

from datasources.data_source import DataSource
from ingestion import gcs_to_bq_util
from ingestion import dataset_utils

REFERENCE_POPULATION = std_col.Race.ALL.value
BASE_POPULATION = std_col.Race.WHITE_NH.value


class AgeAdjustBjsIncarceration(DataSource):

    @staticmethod
    def get_id():
        return 'AGE_ADJUST_BJS_INCARCERATION'

    @staticmethod
    def get_table_name():
        return 'bjs_incarceration_data'

    def upload_to_gcs(self, _, **attrs):
        raise NotImplementedError(
            'upload_to_gcs should not be called for AgeAdjustBjsIncarceration')

    def write_to_bq(self, dataset, gcs_bucket, **attrs):

        print("\n\n")
        table_names_to_dfs = {}

        with_race_age = 'by_race_age_state'
        with_race_age_df = gcs_to_bq_util.load_df_from_bigquery(
            'bjs_incarceration_data', with_race_age, dtype={'state_fips': str})

        pop_df = gcs_to_bq_util.load_df_from_bigquery(
            'census_pop_estimates', 'race_and_ethnicity', dtype={'state_fips': str})

        # Only get the prison data from states we have population data for
        states_with_pop = set(
            pop_df[std_col.STATE_FIPS_COL].drop_duplicates().to_list())
        with_race_age_df = with_race_age_df.loc[
            with_race_age_df[std_col.STATE_FIPS_COL].isin(states_with_pop)
        ].reset_index(drop=True)

        pop_df_prison = pop_df

        with_race_age_df_prison = with_race_age_df.loc[
            ~with_race_age_df["prison_estimated_total"].isna(
            )]
        states_to_include_prison = set(
            with_race_age_df_prison[std_col.STATE_FIPS_COL].drop_duplicates().to_list())

        pop_df_prison = census_pop_estimates.generate_national_pop_data(
            pop_df, states_to_include_prison)

        # Clean with race age df
        with_race_age_df = with_race_age_df.loc[
            with_race_age_df[std_col.AGE_COL] != "Unknown"
        ].reset_index(drop=True)

        # remove rows with races we dont have pop. info for
        with_race_age_df = with_race_age_df.loc[
            with_race_age_df[std_col.RACE_CATEGORY_ID_COL].isin(
                BJS_PRISON_RACES_MAP.values()
            )
        ].reset_index(drop=True)

        # remove rows with age groups we dont have pop. info for
        with_race_age_df = with_race_age_df.loc[
            with_race_age_df[std_col.AGE_COL].isin(
                BJS_PRISON_AGES_MAP.keys()
            )
        ].reset_index(drop=True)

        df = get_expected_prisoners(with_race_age_df, pop_df_prison)
        age_adjusted_df = age_adjust_from_expected(df)

        only_race = 'by_race_national_processed'
        table_name = f'{only_race}-with_age_adjust'

        table_names_to_dfs[table_name] = age_adjusted_df

        # For each of the files, we load it as a dataframe and add it as a
        # table in the BigQuery dataset. We expect that all aggregation and
        # standardization of the data has been done by this point.
        for table_name, df in table_names_to_dfs.items():
            # All columns are str, except outcome columns.
            column_types = {c: 'STRING' for c in df.columns}
            if std_col.RACE_INCLUDES_HISPANIC_COL in df.columns:
                column_types[std_col.RACE_INCLUDES_HISPANIC_COL] = 'BOOL'

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


def get_expected_prisoners(race_and_age_df, population_df):
    """Calculates the age adjusted expected people in prison of each racial group.

       Returns a dataframe meant to be used in memory.

       race_and_age_df: a dataframe with number of people in prison broken down by race and age
       population_df: a dataframe with population broken down by race and age"""

    # print("in get_exp")
    # print("race age df")
    # print(race_and_age_df)
    # print("pop df")
    # print(population_df)

    def get_expected_prison_rate(row):
        # print("** ROW IN POP DF? **")
        # print(row)
        # print(population_df.to_string())
        this_pop_size_cell = population_df.loc[
            (population_df[std_col.RACE_CATEGORY_ID_COL] == row[std_col.RACE_CATEGORY_ID_COL]) &
            (population_df[std_col.AGE_COL] == row[std_col.AGE_COL]) &
            (population_df[std_col.STATE_FIPS_COL]
             == row[std_col.STATE_FIPS_COL])
        ][std_col.POPULATION_COL]

        if this_pop_size_cell.empty:
            raise ValueError('Population size for %s demographic is 0 or nil' %
                             row[std_col.RACE_CATEGORY_ID_COL])

        this_pop_value = float(this_pop_size_cell.values[0])

        true_prison_rate = float(
            row["prison_estimated_total"]) / this_pop_value

        ref_pop_size = float(population_df.loc[
            (population_df[std_col.RACE_CATEGORY_ID_COL] == REFERENCE_POPULATION) &
            (population_df[std_col.AGE_COL] == row[std_col.AGE_COL]) &
            (population_df[std_col.STATE_FIPS_COL]
             == row[std_col.STATE_FIPS_COL])
        ][std_col.POPULATION_COL].values[0])

        if not ref_pop_size:
            raise ValueError(
                'Population size for %s demographic is 0 or nil' % REFERENCE_POPULATION)

        if not row["prison_estimated_total"]:
            return None
        else:
            true_prison_rate = float(
                row["prison_estimated_total"]) / this_pop_value
            return round(true_prison_rate * ref_pop_size, 2)

    df = race_and_age_df
    df['expected_prisoners'] = df.apply(get_expected_prison_rate, axis=1)

    return df


def age_adjust_from_expected(df):
    """Calculates the age adjusted prison rate against the standard population
       when given a dataframe with the expected number of people in prison from each racial group.
       Returns a dataframe with the age adjusted death rate.

       df: dataframe with an 'expected_prisoners' field"""

    def get_age_adjusted_prison_rate(row):
        ref_pop_expected_prisoners = df.loc[
            (df[std_col.RACE_CATEGORY_ID_COL] == BASE_POPULATION) &
            (df[std_col.STATE_FIPS_COL] == row[std_col.STATE_FIPS_COL])
        ]['expected_prisoners'].values[0]

        if not ref_pop_expected_prisoners:
            return None

        return dataset_utils.ratio_round_to_None(row['expected_prisoners'], ref_pop_expected_prisoners)

    groupby_cols = [std_col.STATE_FIPS_COL, std_col.STATE_NAME_COL]
    groupby_cols.extend(std_col.RACE_COLUMNS)

    grouped = df.groupby(groupby_cols)
    df = grouped.sum().reset_index()

    df[std_col.PRISON_RATIO_AGE_ADJUSTED] = df.apply(
        get_age_adjusted_prison_rate, axis=1)

    needed_cols = groupby_cols
    needed_cols.append(std_col.PRISON_RATIO_AGE_ADJUSTED)

    return df[needed_cols]
