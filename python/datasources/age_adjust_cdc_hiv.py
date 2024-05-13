import ingestion.standardized_columns as std_col
from ingestion.standardized_columns import Race
import pandas as pd  # type: ignore

from datasources.data_source import DataSource
from datasources.cdc_hiv import (
    TOTAL_DEATHS,
)
from ingestion import gcs_to_bq_util
from ingestion.gcs_to_bq_util import BQ_STRING, BQ_FLOAT
from ingestion.dataset_utils import ratio_round_to_None

from ingestion.constants import NATIONAL_LEVEL, STATE_LEVEL

REFERENCE_POPULATION = Race.ALL.value
BASE_POPULATION = Race.WHITE_NH.value

AGE_ADJUST_RACES = {
    Race.WHITE_NH.value,
    Race.BLACK_NH.value,
    Race.HISP.value,
    Race.AIAN_NH.value,
    Race.NHPI_NH.value,
    Race.ASIAN_NH.value,
    Race.MULTI_NH.value,
}

EXPECTED_DEATHS = 'expected_deaths'


class AgeAdjustCDCHiv(DataSource):
    @staticmethod
    def get_id():
        return 'AGE_ADJUST_CDC_HIV'

    @staticmethod
    def get_table_name():
        return 'cdc_hiv_data'

    def upload_to_gcs(self, _, **attrs):
        raise NotImplementedError('upload_to_gcs should not be called for AgeAdjustCDCHiv')

    def write_to_bq(self, dataset, gcs_bucket, **attrs):
        for geo in [NATIONAL_LEVEL, STATE_LEVEL]:
            # only merges current year
            age_adjusted_df = self.generate_age_adjustment(geo)
            only_race_source = f'race_and_ethnicity_{geo}_current'
            table_name = f'{only_race_source}-with_age_adjust'

            only_race_df = gcs_to_bq_util.load_df_from_bigquery(
                'cdc_hiv_data',
                only_race_source,
                dtype={std_col.STATE_FIPS_COL: str},
            )

            df = merge_age_adjusted(only_race_df, age_adjusted_df)

            col_types = {
                "state_name": BQ_STRING,
                "state_fips": BQ_STRING,
                "race_and_ethnicity": BQ_STRING,
                "race_category_id": BQ_STRING,
                "hiv_stigma_index": BQ_FLOAT,
                "hiv_deaths_per_100k": BQ_FLOAT,
                "hiv_diagnoses_per_100k": BQ_FLOAT,
                "hiv_prevalence_per_100k": BQ_FLOAT,
                "hiv_care_linkage": BQ_FLOAT,
                "hiv_prep_coverage": BQ_FLOAT,
                "hiv_care_pct_share": BQ_FLOAT,
                "hiv_deaths_pct_share": BQ_FLOAT,
                "hiv_diagnoses_pct_share": BQ_FLOAT,
                "hiv_prep_pct_share": BQ_FLOAT,
                "hiv_prevalence_pct_share": BQ_FLOAT,
                "hiv_prep_population_pct": BQ_FLOAT,
                "hiv_population_pct": BQ_FLOAT,
                "hiv_care_population_pct": BQ_FLOAT,
                "hiv_care": BQ_FLOAT,
                "hiv_deaths": BQ_FLOAT,
                "hiv_diagnoses": BQ_FLOAT,
                "hiv_prep": BQ_FLOAT,
                "hiv_prevalence": BQ_FLOAT,
                std_col.HIV_POPULATION: BQ_FLOAT,
                std_col.HIV_CARE_POPULATION: BQ_FLOAT,
                std_col.HIV_PREP_POPULATION: BQ_FLOAT,
                "hiv_deaths_ratio_age_adjusted": BQ_FLOAT,
            }

            gcs_to_bq_util.add_df_to_bq(df, dataset, table_name, column_types=col_types)

    def generate_age_adjustment(self, geo):
        race_age_df = gcs_to_bq_util.load_df_from_bigquery(
            'cdc_hiv_data',
            f'by_race_age_{geo}',
            dtype={
                'state_fips': str,
            },
        )

        pop_df = race_age_df.copy().drop(columns=[TOTAL_DEATHS])
        race_age_df = race_age_df.drop(columns=[std_col.POPULATION_COL])

        groupby_cols = [
            std_col.STATE_FIPS_COL,
            std_col.STATE_NAME_COL,
            std_col.RACE_CATEGORY_ID_COL,
            std_col.AGE_COL,
        ]
        race_age_df = race_age_df.groupby(groupby_cols).sum(numeric_only=True).reset_index()

        race_age_df = race_age_df.loc[race_age_df[std_col.RACE_CATEGORY_ID_COL].isin(AGE_ADJUST_RACES)].reset_index(
            drop=True
        )

        df = get_expected_col(race_age_df, pop_df, EXPECTED_DEATHS, TOTAL_DEATHS)

        return age_adjust_from_expected(df)


def merge_age_adjusted(df, age_adjusted_df):
    """Merges the age adjusted death rate into the standard dataset.
    Returns a dataframe with all needed info for the frontend.

    df: a dataframe with data without age adjusted numbers
    age_adjusted_df: a dataframe with age adjusted numbers"""

    merge_cols = [
        std_col.STATE_FIPS_COL,
        std_col.STATE_NAME_COL,
        std_col.RACE_CATEGORY_ID_COL,
    ]

    df = df.reset_index(drop=True)
    age_adjusted_df = age_adjusted_df.reset_index(drop=True)

    return pd.merge(df, age_adjusted_df, how='left', on=merge_cols)


def get_expected_col(race_and_age_df, population_df, expected_col, raw_number_col):
    """Calculates the age adjusted expected cases for the condition in
    `raw_number_col` of each racial group.
    I made this function to break up the age adjustment into smaller, more
    easily testable pieces.

    Returns a dataframe meant to be used in memory.

    race_and_age_df: a dataframe with deaths broken down by race and age
    population_df: a dataframe with population broken down by race and age
    expected_col: a string column name to place the output of the calculations in
                  ie: `expected_deaths`
    raw_number_col: string column name to get the raw number of cases to age
                    adjust from"""

    this_pop_size, ref_pop_size = 'this_pop_size', 'ref_pop_size'

    def get_expected(row):
        """Calculates the expected value of each race/age split based on the
        raw condition count, the reference population, and the race/age population
        split."""

        if not row[ref_pop_size]:
            raise ValueError(f'Population size for {REFERENCE_POPULATION} demographic is 0 or nil')

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

    ref_pop_df = population_df.loc[population_df[std_col.RACE_CATEGORY_ID_COL] == REFERENCE_POPULATION].reset_index(
        drop=True
    )

    merge_cols = [std_col.AGE_COL, std_col.STATE_FIPS_COL]
    ref_pop_df = ref_pop_df[merge_cols + [std_col.POPULATION_COL]]

    # Then, we merge the reference population data to get the reference population
    # for each age group, which we put in a column called `ref_pop_size`
    df = pd.merge(df, ref_pop_df, on=merge_cols)
    df = df.rename(columns={std_col.POPULATION_COL: ref_pop_size})

    # Finally, we calculate the expected value of the raw count
    # using the function `get_expected`
    df[expected_col] = df.apply(get_expected, axis=1)
    df = df.drop(columns=[this_pop_size, ref_pop_size])

    return df.reset_index(drop=True)


def age_adjust_from_expected(df):
    """Calculates the age adjusted death rate against the standard population
    when given a dataframe with the expected deaths from each racial group.
    Returns a dataframe with the age adjusted death rate.

    df: dataframe with an 'expected_deaths' field
    """

    # DROP THE `All` AGE ROWS TO AVOID DOUBLE COUNTING
    df = df.loc[df[std_col.AGE_COL] != std_col.ALL_VALUE].reset_index(drop=True)

    def get_age_adjusted_ratios(row):
        row[std_col.HIV_DEATH_RATIO_AGE_ADJUSTED] = (
            None
            if not row[base_pop_expected_deaths]
            else ratio_round_to_None(row[EXPECTED_DEATHS], row[base_pop_expected_deaths])
        )
        return row

    base_pop_expected_deaths = 'base_pop_expected_deaths'

    groupby_cols = [
        std_col.STATE_FIPS_COL,
        std_col.STATE_NAME_COL,
        std_col.RACE_CATEGORY_ID_COL,
    ]

    # Sum all of a race group's age rows into a single row
    df = df.groupby(groupby_cols).sum(numeric_only=True).reset_index()
    base_pop_df = df.loc[df[std_col.RACE_CATEGORY_ID_COL] == BASE_POPULATION].reset_index(drop=True)

    merge_cols = [std_col.STATE_FIPS_COL]

    base_pop_df = base_pop_df[merge_cols + [EXPECTED_DEATHS]]
    base_pop_df = base_pop_df.rename(columns={EXPECTED_DEATHS: base_pop_expected_deaths})

    # Then, merge the expected deaths of the 'base'
    # or comparison population (WHITE_NH in this case)
    df = pd.merge(df, base_pop_df, on=merge_cols)

    # Then, calculate the ratio of each race's
    # expected deaths compared
    # to the base race.
    df = df.apply(get_age_adjusted_ratios, axis=1)
    needed_cols = groupby_cols
    needed_cols.append(std_col.HIV_DEATH_RATIO_AGE_ADJUSTED)

    return df[needed_cols]
