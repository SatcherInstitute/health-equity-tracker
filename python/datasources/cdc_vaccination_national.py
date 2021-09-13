import pandas as pd

from ingestion.standardized_columns import Race
import ingestion.standardized_columns as std_col

from datasources.data_source import DataSource
from ingestion import gcs_to_bq_util
from ingestion.constants import Sex


CDC_SEX_GROUPS_TO_STANDARD = {
    'Sex_Female': Sex.FEMALE,
    'Sex_Male': Sex.MALE,
    'Sex_unknown': 'Unknown',
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
}

CDC_AGE_GROUPS_TO_STANDARD = {
    'Ages_<12yrs': '0-12',
    'Ages_12-15_yrs': '12-15',
    'Ages_16-17_yrs': '16-17',
    'Ages_18-24_yrs': '18-24',
    'Ages_25-39_yrs': '25-39',
    'Ages_40-49_yrs': '40-49',
    'Ages_50-64_yrs': '50-64',
    'Ages_65-74_yrs': '65-74',
    'Ages_75+_yrs': '75+',
    'Age_unknown': 'Unknown',
}

BREAKDOWN_MAP = {
    'race_and_ethnicity': CDC_RACE_GROUPS_TO_STANDARD,
    'sex': CDC_SEX_GROUPS_TO_STANDARD,
    'age': CDC_AGE_GROUPS_TO_STANDARD,
}

BASE_CDC_URL = "https://covid.cdc.gov/covid-data-tracker/COVIDData/getAjaxData?id=vaccination_demographic_trends_data"


def generate_total(df, demo_col):
    """Generates a total row for a dataframe with national vaccine demographic information.

    df: dataframe with national vaccine information for one demographic category
    demo_col: the demographiv category the df has data for
    """
    total = {}

    total[std_col.VACCINATED_FIRST_DOSE] = df[std_col.VACCINATED_FIRST_DOSE].sum()
    total[std_col.POPULATION_COL] = df[std_col.POPULATION_COL].sum()
    total[std_col.STATE_NAME_COL] = 'United States'
    total[std_col.STATE_FIPS_COL] = '00'
    if demo_col == std_col.RACE_CATEGORY_ID_COL:  # Special case required due to later processing.
        total[demo_col] = std_col.Race.TOTAL.value
    else:
        total[demo_col] = std_col.TOTAL_VALUE

    df = df.append(total, ignore_index=True)
    return df


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
        df = gcs_to_bq_util.load_json_as_df_from_web_based_on_key(
            BASE_CDC_URL,
            "vaccination_demographic_trends_data",
            dtype=str
        )

        latest_date = df['Date'].max()
        df = df.loc[df['Date'] == latest_date]

        for breakdown in [std_col.RACE_OR_HISPANIC_COL, std_col.SEX_COL, std_col.AGE_COL]:
            breakdown_df = self.generate_breakdown(breakdown, df)

            column_types = {c: 'STRING' for c in breakdown_df.columns}
            column_types[std_col.VACCINATED_FIRST_DOSE] = 'INT64'
            column_types[std_col.POPULATION_COL] = 'INT64'

            if std_col.RACE_INCLUDES_HISPANIC_COL in breakdown_df.columns:
                column_types[std_col.RACE_INCLUDES_HISPANIC_COL] = 'BOOL'

            gcs_to_bq_util.add_dataframe_to_bq(
                breakdown_df, dataset, breakdown, column_types=column_types)

    def generate_breakdown(self, breakdown, df):
        output = []

        columns = [
            std_col.STATE_NAME_COL,
            std_col.STATE_FIPS_COL,
            std_col.VACCINATED_FIRST_DOSE,
            std_col.POPULATION_COL,
        ]

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

            row = df.loc[df['Demographic_category'] == cdc_group]
            output_row[std_col.VACCINATED_FIRST_DOSE] = int(row['Administered_Dose1'].values[0])

            # Otherwise leave it as null
            if standard_group != "Unknown" or standard_group != Race.UNKNOWN.value:
                output_row[std_col.POPULATION_COL] = int(row['census'].values[0])

            output.append(output_row)

        output_df = pd.DataFrame(output, columns=columns)

        if breakdown == std_col.RACE_OR_HISPANIC_COL:
            output_df = generate_total(output_df, std_col.RACE_CATEGORY_ID_COL)
            std_col.add_race_columns_from_category_id(output_df)
        else:
            output_df = generate_total(output_df, breakdown)

        return output_df
