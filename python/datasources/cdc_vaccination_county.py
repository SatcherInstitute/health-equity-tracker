from ingestion.standardized_columns import Race
import ingestion.standardized_columns as std_col

from datasources.data_source import DataSource
from ingestion import gcs_to_bq_util
from ingestion.merge_utils import merge_county_names, merge_pop_numbers

from ingestion.constants import (
    COUNTY_LEVEL,
    RACE)

from ingestion.dataset_utils import generate_per_100k_col


BASE_CDC_URL = 'https://data.cdc.gov/resource/8xkx-amqh.csv'
FILE_SIZE_LIMIT = 5000

CDC_COUNTY_FIPS_COL = 'fips'
CDC_COUNTY_COL = 'recip_county'
CDC_DOSE_ONE_COL = 'administered_dose1_recip'
CDC_DATE_COL = 'date'

COL_NAME_MAPPING = {
    CDC_COUNTY_FIPS_COL: std_col.COUNTY_FIPS_COL,
    CDC_COUNTY_COL: std_col.COUNTY_NAME_COL,
    CDC_DOSE_ONE_COL: std_col.VACCINATED_FIRST_DOSE,
}


class CDCVaccinationCounty(DataSource):

    @staticmethod
    def get_id():
        return 'CDC_VACCINATION_COUNTY'

    @staticmethod
    def get_table_name():
        return 'cdc_vaccination_county'

    def upload_to_gcs(self, _, **attrs):
        raise NotImplementedError(
            'upload_to_gcs should not be called for CDCVaccinationCounty')

    def write_to_bq(self, dataset, gcs_bucket, **attrs):
        params = {"$limit": FILE_SIZE_LIMIT}
        df = gcs_to_bq_util.load_csv_as_df_from_web(
            BASE_CDC_URL, dtype={CDC_COUNTY_FIPS_COL: str}, params=params)

        latest_date = df[CDC_DATE_COL].max()
        df = df.loc[df[CDC_DATE_COL] == latest_date]

        # Get rid of counties that don't provide this data
        df = df.loc[df[CDC_DOSE_ONE_COL] != 0]
        df = df.loc[df[CDC_DOSE_ONE_COL] != "0"]
        df = df.loc[~df[CDC_DOSE_ONE_COL].isnull()]

        df = generate_breakdown(df)

        col_types = gcs_to_bq_util.get_bq_column_types(df, float_cols=[std_col.VACCINATED_PER_100K])

        gcs_to_bq_util.add_df_to_bq(
            df, dataset, 'race_and_ethnicity_processed', column_types=col_types)


def generate_breakdown(df):
    df = df.rename(columns=COL_NAME_MAPPING)
    df[std_col.RACE_CATEGORY_ID_COL] = Race.ALL.value

    df[std_col.VACCINATED_FIRST_DOSE] = df[std_col.VACCINATED_FIRST_DOSE].astype(float)
    df = df[list(COL_NAME_MAPPING.values()) + [std_col.RACE_CATEGORY_ID_COL]]

    df = merge_county_names(df)
    df = merge_pop_numbers(df, RACE, COUNTY_LEVEL)

    df = generate_per_100k_col(df, std_col.VACCINATED_FIRST_DOSE,
                               std_col.POPULATION_COL, std_col.VACCINATED_PER_100K)

    df = df[[std_col.COUNTY_FIPS_COL, std_col.COUNTY_NAME_COL,
             std_col.RACE_CATEGORY_ID_COL, std_col.VACCINATED_PER_100K]]

    std_col.add_race_columns_from_category_id(df)

    return df
