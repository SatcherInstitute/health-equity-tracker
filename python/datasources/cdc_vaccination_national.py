import pandas as pd

from ingestion.standardized_columns import Race
import ingestion.standardized_columns as std_col

from datasources.data_source import DataSource
from ingestion import gcs_to_bq_util
from ingestion.constants import Sex


BASE_CDC_URL = 'https://data.cdc.gov/resource/km4m-vcsb.csv'

CDC_SEX_GROUPS_TO_STANDARD = {
    'Sex_Female': Sex.FEMALE,
    'Sex_Male': Sex.MALE,
    'Sex_unknown': 'Unknown',
    'US': std_col.TOTAL_VALUE,
}

CDC_RACE_GROUPS_TO_STANDARD = {
    'Race_eth_Hispanic': Race.HISP.value,
    'Race_eth_NHAIAN': Race.AIAN_NH.value,
    'Race_eth_NHAsian': Race.ASIAN_NH.value,
    'Race_eth_NHBlack': Race.BLACK_NH.value,
    'Race_eth_NHMult_Oth': Race.MULTI_OR_OTHER_STANDARD_NH.value,
    'Race_eth_NHNHOPI': Race.NHPI_NH.value,
    'Race_eth_NHWhite': Race.WHITE_NH.value,
    'Race_eth_unknown': Race.UNKNOWN.value,
    'US': Race.TOTAL.value,
}

CDC_AGE_GROUPS_TO_STANDARD = {
    'Ages_12-15_yrs': '12-15',
    'Ages_16-17_yrs': '16-17',
    'Ages_18-24_yrs': '18-24',
    'Ages_25-39_yrs': '25-39',
    'Ages_30-39_yrs': '30-39',
    'Ages_40-49_yrs': '40-49',
    'Ages_50-64_yrs': '50-64',
    'Ages_65-74_yrs': '65-74',
    'Ages_75+_yrs': '75+',
    'Age_unknown': 'Unknown',
    'US': std_col.TOTAL_VALUE,
}

BREAKDOWN_MAP = {
    'race_and_ethnicity': CDC_RACE_GROUPS_TO_STANDARD,
    'sex': CDC_SEX_GROUPS_TO_STANDARD,
    'age': CDC_AGE_GROUPS_TO_STANDARD,
}


class CDCVaccinationNational(DataSource):

    @staticmethod
    def get_id():
        return 'CDC_VACCINATION_NATIONAL'

    @staticmethod
    def get_table_name():
        return 'cdc_vaccination_national'

    def upload_to_gcs(self, _, **attrs):
        raise NotImplementedError(
            'upload_to_gcs should not be called for CDCVaccinationNational')

    def write_to_bq(self, dataset, gcs_bucket, **attrs):
        df = gcs_to_bq_util.load_csv_as_dataframe_from_web(BASE_CDC_URL)

        latest_date = df['date'].max()
        df = df.loc[df['date'] == latest_date]

        for breakdown in [std_col.RACE_OR_HISPANIC_COL, std_col.SEX_COL, std_col.AGE_COL]:
            breakdown_df = self.generate_breakdown(breakdown, df)

            column_types = {c: 'STRING' for c in breakdown_df.columns}
            column_types[std_col.VACCINATED_FIRST_DOSE] = 'INT64'

            if std_col.RACE_INCLUDES_HISPANIC_COL in breakdown_df.columns:
                column_types[std_col.RACE_INCLUDES_HISPANIC_COL] = 'BOOL'

            gcs_to_bq_util.add_dataframe_to_bq(
                breakdown_df, dataset, breakdown, column_types=column_types)

    def generate_breakdown(self, breakdown, df):
        output = []

        columns = [std_col.STATE_NAME_COL, std_col.STATE_FIPS_COL, std_col.VACCINATED_FIRST_DOSE]
        if breakdown == std_col.RACE_OR_HISPANIC_COL:
            columns.append(std_col.RACE_CATEGORY_ID_COL)
        else:
            columns.append(breakdown)

        for cdc_group, standard_group in BREAKDOWN_MAP[breakdown].items():
            output_row = {}
            output_row[std_col.STATE_NAME_COL] = 'United States'
            output_row[std_col.STATE_FIPS_COL] = '00'

            if breakdown == std_col.RACE_OR_HISPANIC_COL:
                output_row[std_col.RACE_CATEGORY_ID_COL] = standard_group
            else:
                output_row[breakdown] = standard_group

            row = df.loc[df['demographic_category'] == cdc_group]['administered_dose1']
            output_row[std_col.VACCINATED_FIRST_DOSE] = row.values[0]

            output.append(output_row)

        output_df = pd.DataFrame(output, columns=columns)

        if breakdown == std_col.RACE_OR_HISPANIC_COL:
            std_col.add_race_columns_from_category_id(output_df)

        return output_df
