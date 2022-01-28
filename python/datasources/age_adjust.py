import ingestion.standardized_columns as std_col
import pandas as pd

from datasources.data_source import DataSource
from ingestion import gcs_to_bq_util

REFERENCE_POPULATION = std_col.Race.WHITE_NH.value

AGE_ADJUST_RACES = {std_col.Race.WHITE_NH.value, std_col.Race.BLACK_NH.value, std_col.Race.HISP.value,
                    std_col.Race.AIAN_NH.value, std_col.Race.NHPI_NH.value, std_col.Race.ASIAN_NH.value}


AGE_ADJUST_MAP = {'by_race_age_state': 'by_race_state'}


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

        for with_race_age, only_race in AGE_ADJUST_MAP.items():
            with_race_age_df = gcs_to_bq_util.load_dataframe_from_bigquery('cdc_restricted_data', with_race_age)

            pop_df = gcs_to_bq_util.load_dataframe_from_bigquery('census_pop_estimates', 'race_and_ethnicity')
            age_adjusted_df = do_age_adjustment(with_race_age_df, pop_df)

            only_race_df = gcs_to_bq_util.load_dataframe_from_bigquery('cdc_restricted_data', only_race)

            table_name = only_race.replace('.csv', '')
            table_name = '%s-with_age_adjust' % table_name

            table_names_to_dfs[table_name] = merge_age_adjusted(only_race_df, age_adjusted_df)

        # For each of the files, we load it as a dataframe and add it as a
        # table in the BigQuery dataset. We expect that all aggregation and
        # standardization of the data has been done by this point.
        int_cols = [std_col.COVID_CASES, std_col.COVID_HOSP_Y,
                    std_col.COVID_HOSP_N, std_col.COVID_HOSP_UNKNOWN,
                    std_col.COVID_DEATH_Y, std_col.COVID_DEATH_N,
                    std_col.COVID_DEATH_UNKNOWN]

        for table_name, df in table_names_to_dfs.items():
            # All columns are str, except outcome columns.
            column_types = {c: 'STRING' for c in df.columns}
            for col in int_cols:
                if col in column_types:
                    column_types[col] = 'FLOAT'
            if std_col.RACE_INCLUDES_HISPANIC_COL in df.columns:
                column_types[std_col.RACE_INCLUDES_HISPANIC_COL] = 'BOOL'

            # Clean up column names.
            self.clean_frame_column_names(df)

            gcs_to_bq_util.add_dataframe_to_bq(
                df, dataset, table_name, column_types=column_types)


def merge_age_adjusted(df, age_adjusted_df):
    merge_cols = [std_col.STATE_FIPS_COL, std_col.STATE_NAME_COL]
    merge_cols.extend(std_col.RACE_COLUMNS)

    return pd.merge(df, age_adjusted_df, how='left', on=merge_cols)


def per_100k(rate):
    return round(rate * 1000 * 100, 2)


def get_expected_deaths(race_and_age_df, population_df):

    def get_expected_death_rate(row):
        true_death_rate = float(row['death_y']) / float(row['population'])

        ref_pop_size = float(population_df.loc[
                (population_df[std_col.RACE_CATEGORY_ID_COL] == REFERENCE_POPULATION) &
                (population_df[std_col.AGE_COL] == row[std_col.AGE_COL]) &
                (population_df[std_col.STATE_FIPS_COL] == row[std_col.STATE_FIPS_COL])
            ][std_col.POPULATION_COL].values[0])

        return round(true_death_rate * ref_pop_size, 2)

    on_cols = [std_col.STATE_FIPS_COL, std_col.STATE_NAME_COL, std_col.AGE_COL]
    on_cols.extend(std_col.RACE_COLUMNS)

    df = pd.merge(race_and_age_df, population_df, how='left', on=on_cols)

    states_with_pop = set(population_df[std_col.STATE_FIPS_COL].drop_duplicates().to_list())
    df = df.loc[df[std_col.AGE_COL] != "UNKNOWN"].reset_index(drop=True)
    df = df.loc[df[std_col.RACE_CATEGORY_ID_COL].isin(AGE_ADJUST_RACES)].reset_index(drop=True)
    df = df.loc[df[std_col.STATE_FIPS_COL].isin(states_with_pop)].reset_index(drop=True)

    df['expected_deaths'] = df.apply(get_expected_death_rate, axis=1)

    return df


def age_adjust_from_expected(df):

    def get_age_adjusted_rate(row):
        ref_pop_expected_deaths = float(df.loc[
                (df[std_col.RACE_CATEGORY_ID_COL] == REFERENCE_POPULATION) &
                (df[std_col.STATE_FIPS_COL] == row[std_col.STATE_FIPS_COL])
            ][std_col.COVID_DEATH_Y].values[0])

        if ref_pop_expected_deaths == 0:
            return 0

        return round(row['expected_deaths'] / ref_pop_expected_deaths, 2)

    groupby_cols = [std_col.STATE_FIPS_COL, std_col.STATE_NAME_COL]
    groupby_cols.extend(std_col.RACE_COLUMNS)

    grouped = df.groupby(groupby_cols)
    df = grouped.sum().reset_index()

    df[std_col.COVID_DEATH_RATIO_AGE_ADJUSTED] = df.apply(get_age_adjusted_rate, axis=1)

    needed_cols = groupby_cols
    needed_cols.append(std_col.COVID_DEATH_RATIO_AGE_ADJUSTED)

    return df[needed_cols]


def do_age_adjustment(race_and_age_df, population_df):
    expected_deaths = get_expected_deaths(race_and_age_df, population_df)
    return age_adjust_from_expected(expected_deaths)
