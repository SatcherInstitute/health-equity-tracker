import pandas as pd

from ingestion.standardized_columns import Race
import ingestion.standardized_columns as std_col

from datasources.data_source import DataSource
from ingestion import gcs_to_bq_util


BASE_CDC_URL = 'https://data.cdc.gov/resource/8xkx-amqh.csv'
FILE_SIZE_LIMIT = 5000

COUNTY_FIPS_COL = 'fips'
COUNTY_COL = 'recip_county'


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
        df = gcs_to_bq_util.load_csv_as_dataframe_from_web(BASE_CDC_URL, dtype={COUNTY_FIPS_COL: str}, params=params)

        latest_date = df['date'].max()
        df = df.loc[df['date'] == latest_date]

        # Get rid of counties that don't provide this data
        df = df.loc[df['administered_dose1_recip'] != 0]
        df = df.loc[df['administered_dose1_recip'] != "0"]
        df = df.loc[~df['administered_dose1_recip'].isnull()]

        df = self.generate_for_bq(df)

        column_types = {c: 'STRING' for c in df.columns}
        column_types[std_col.VACCINATED_FIRST_DOSE] = 'FLOAT'

        if std_col.RACE_INCLUDES_HISPANIC_COL in df.columns:
            column_types[std_col.RACE_INCLUDES_HISPANIC_COL] = 'BOOL'

        gcs_to_bq_util.add_dataframe_to_bq(
            df, dataset, "race_and_ethnicity", column_types=column_types)

    def generate_for_bq(self, df):
        output = []

        columns = [
            std_col.COUNTY_FIPS_COL,
            std_col.COUNTY_NAME_COL,
            std_col.RACE_CATEGORY_ID_COL,
            std_col.VACCINATED_FIRST_DOSE,
        ]

        for _, row in df.iterrows():
            output_row = {}
            output_row[std_col.COUNTY_FIPS_COL] = row[COUNTY_FIPS_COL]
            output_row[std_col.COUNTY_NAME_COL] = row[COUNTY_COL]
            output_row[std_col.RACE_CATEGORY_ID_COL] = Race.TOTAL.value
            output_row[std_col.VACCINATED_FIRST_DOSE] = row['administered_dose1_recip']

            output.append(output_row)

        output_df = pd.DataFrame(output, columns=columns)
        std_col.add_race_columns_from_category_id(output_df)

        return output_df
