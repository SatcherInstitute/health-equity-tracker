from ingestion import gcs_to_bq_util
from datasources.data_source import DataSource
import ingestion.standardized_columns as std_col
from ingestion.merge_utils import merge_state_ids, merge_pop_numbers
from ingestion.constants import NATIONAL_LEVEL, STATE_LEVEL

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

# IMAGE CONTAINING NATIONAL-LEVEL TABLE FOR /data (manually created csv from this image)
# https://cdn.jamanetwork.com/ama/content_public/journal/jama/939176/joi230063t1_1687532958.71302.png?Expires=1716416583&Signature=VACaqnLwid41ua7XRHx~imHeYBiobUtXwsEG~A1z4pWqI7J-wsRbo73BmqIs41H4GOGRHyWjTnmdwtEFdHe5zPkY6Er3XKzciV7jTc0m5kX5PXduJvKQ~-KOVArVbP1IhTvtWz3mK6P0thi6hEtEjx2iht0nMM95hDPCIU3VsOrhwmbx-mLt4465DFsMnE2lj3JsFEs3L~cKRx7Gd5SjYCktNP~GPRlNbOAGiEW~jgRv2Sz2MyEhm513owc0HMgODyks3OWA2YfZLGJ7E4ZFqag3Vnup4GN77lAEkF1-~h5oKIVvCImqpU3XxM9g6Mxjf8sTkgeILIh7mGGQ7-Ps8Q__&Key-Pair-Id=APKAIE5G5CRDK6RD3PGA


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

        for geo_level in [STATE_LEVEL, NATIONAL_LEVEL]:

            df = load_source_data(geo_level)

            df = df.rename(
                columns={
                    'val': 'maternal_mortality_per_100k',
                    'race_group': std_col.RACE_CATEGORY_ID_COL,
                    'location_name': std_col.STATE_NAME_COL,
                    'year_id': std_col.TIME_PERIOD_COL,
                }
            )

            # round to whole numbers
            df['maternal_mortality_per_100k'] = df['maternal_mortality_per_100k'].round(0)

            df = df.replace(RACE_GROUPS_TO_STANDARD)
            std_col.add_race_columns_from_category_id(df)
            df = merge_state_ids(df)
            df = merge_pop_numbers(df, "race", geo_level)

            df[std_col.TIME_PERIOD_COL] = df[std_col.TIME_PERIOD_COL].astype(str)

            keep_string_cols = [
                std_col.TIME_PERIOD_COL,
                std_col.STATE_FIPS_COL,
                std_col.RACE_CATEGORY_ID_COL,
                std_col.STATE_NAME_COL,
                std_col.RACE_OR_HISPANIC_COL,
            ]

            keep_number_cols = [
                'maternal_mortality_per_100k',
                std_col.POPULATION_PCT_COL,
            ]

            if geo_level == NATIONAL_LEVEL:
                keep_number_cols.extend(['maternal_deaths_estimated_total', 'live_births_estimated_total'])

            df = df[keep_string_cols + keep_number_cols]
            # get list of all columns expected to contain numbers
            col_types = gcs_to_bq_util.get_bq_column_types(df, keep_number_cols)
            table_name = f'by_race_{geo_level}_historical'
            gcs_to_bq_util.add_df_to_bq(df, dataset, table_name, column_types=col_types)


def load_source_data(geo_level):

    file_name = (
        'IHME_USA_MMR_STATE_RACE_ETHN_1999_2019_ESTIMATES_Y2023M07D03.CSV'
        if geo_level == STATE_LEVEL
        else 'manual_national_table.csv'
    )

    df = gcs_to_bq_util.load_csv_as_df_from_data_dir(
        'maternal_mortality',
        file_name,
    )

    return df
