import pandas as pd
from datasources.data_source import DataSource
from ingestion import gcs_to_bq_util
from ingestion.standardized_columns import Race
import ingestion.standardized_columns as std_col

COUNTY_FIPS_COL = 'fips'
COUNTY_COL = 'recip_county'
BASE_VERA_URL = 'https://github.com/vera-institute/incarceration_trends/blob/master/incarceration_trends.csv?raw=true'


class VeraIncarcerationCounty(DataSource):

    @staticmethod
    def get_id():
        return 'VERA_INCARCERATION_COUNTY'

    @staticmethod
    def get_table_name():
        return 'vera_incarceration_county'

    def upload_to_gcs(self, _, **attrs):
        raise NotImplementedError(
            'upload_to_gcs should not be called for VeraIncarcerationCounty')

    def write_to_bq(self, dataset, gcs_bucket, **attrs):
        df = gcs_to_bq_util.load_csv_as_df_from_web(
            BASE_VERA_URL, dtype={COUNTY_FIPS_COL: str}, )

        df = self.generate_for_bq(df)

        column_types = {c: 'STRING' for c in df.columns}
        # column_types[std_col.VACCINATED_FIRST_DOSE] = 'FLOAT'

        if std_col.RACE_INCLUDES_HISPANIC_COL in df.columns:
            column_types[std_col.RACE_INCLUDES_HISPANIC_COL] = 'BOOL'

        gcs_to_bq_util.add_df_to_bq(
            df, dataset, "race_and_ethnicity", column_types=column_types)

    def generate_for_bq(self, df):
        output = []

        columns = [
            std_col.COUNTY_FIPS_COL,
            std_col.COUNTY_NAME_COL,
            std_col.RACE_CATEGORY_ID_COL,
            # std_col.VACCINATED_FIRST_DOSE,
        ]

        for _, row in df.iterrows():
            output_row = {}
            output_row[std_col.COUNTY_FIPS_COL] = row[COUNTY_FIPS_COL]
            output_row[std_col.COUNTY_NAME_COL] = row[COUNTY_COL]
            output_row[std_col.RACE_CATEGORY_ID_COL] = Race.ALL.value
            # output_row[std_col.VACCINATED_FIRST_DOSE] = row['administered_dose1_recip']

            output.append(output_row)

        output_df = pd.DataFrame(output, columns=columns)
        std_col.add_race_columns_from_category_id(output_df)

        return output_df
