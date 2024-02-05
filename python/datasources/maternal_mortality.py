from ingestion import gcs_to_bq_util
from datasources.data_source import DataSource
import ingestion.standardized_columns as std_col

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


class MaternalMortalityData(DataSource):
    @staticmethod
    def get_id():
        return 'MATERNAL_MORTALITY_DATA'

    @staticmethod
    def get_table_name():
        return 'maternal_mortality_data'

    def upload_to_gcs(self, _, **attrs):
        raise NotImplementedError(
            'upload_to_gcs should not be called for MaternalMortalityData'
        )

    def write_to_bq(self, dataset, gcs_bucket, **attrs):
        # Read in the data
        df = gcs_to_bq_util.load_csv_as_df_from_data_dir(
            'maternal_mortality',
            'IHME_USA_MMR_STATE_RACE_ETHN_1999_2019_ESTIMATES_Y2023M07D03.CSV',
        )

        df = df.rename(
            columns={
                'val': 'maternal_mortality_per_100k',
                'race_group': std_col.RACE_CATEGORY_ID_COL,
            }
        )

        # round to whole numbers
        df['maternal_mortality_per_100k'] = df['maternal_mortality_per_100k'].round(0)

        df = df.replace(RACE_GROUPS_TO_STANDARD)
        std_col.add_race_columns_from_category_id(df)

        print("\n")
        print(df)
