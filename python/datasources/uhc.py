import pandas as pd

from ingestion.standardized_columns import Race
import ingestion.standardized_columns as std_col

from datasources.data_source import DataSource
from ingestion import gcs_to_bq_util

UHC_RACE_GROUPS = [
    'American Indian/Alaska Native',
    'Asian',
    'Black',
    'Hawaiian/Pacific Islander',
    'Hispanic',
    'Multiracial',
    'Other Race',
    'White',
    'All',
]

UHC_AGE_GROUPS = ['18-44', '45-64', '65+', 'All']

UHC_SEX_GROUPS = ['Male', 'Female', 'All']

UHC_RACE_GROUPS_TO_STANDARD = {
    'American Indian/Alaska Native': Race.AIAN_NH.value,
    'Asian': Race.ASIAN_NH.value,
    'Black': Race.BLACK_NH.value,
    'Hispanic': Race.HISP.value,
    'Hawaiian/Pacific Islander': Race.NHPI_NH.value,
    'Other Race': Race.OTHER_STANDARD_NH.value,
    'White': Race.WHITE_NH.value,
    'Multiracial': Race.MULTI_NH.value,
    'All': Race.ALL.value,
}

BASE_UHC_URL = "https://www.americashealthrankings.org/api/v1/downloads/251"

UHC_DETERMINANTS_OF_HEALTH = {
    "Chronic Obstructive Pulmonary Disease": std_col.COPD_PCT,
    "Diabetes": std_col.DIABETES_PCT,
}

BREAKDOWN_MAP = {
    "race_and_ethnicity": UHC_RACE_GROUPS,
    "age": UHC_AGE_GROUPS,
    "sex": UHC_SEX_GROUPS,
}


class UHCData(DataSource):

    @staticmethod
    def get_id():
        return 'UHC_DATA'

    @staticmethod
    def get_table_name():
        return 'uhc_data'

    def upload_to_gcs(self, _, **attrs):
        raise NotImplementedError(
            'upload_to_gcs should not be called for UHCData')

    def write_to_bq(self, dataset, gcs_bucket, **attrs):
        df = gcs_to_bq_util.load_csv_as_dataframe_from_web(BASE_UHC_URL)

        for breakdown in [std_col.RACE_OR_HISPANIC_COL, std_col.AGE_COL, std_col.SEX_COL]:
            breakdown_df = self.generate_breakdown(breakdown, df)

            column_types = {c: 'STRING' for c in breakdown_df.columns}
            for col in [std_col.COPD_PCT, std_col.DIABETES_PCT]:
                column_types[col] = 'FLOAT'

            if std_col.RACE_INCLUDES_HISPANIC_COL in breakdown_df.columns:
                column_types[std_col.RACE_INCLUDES_HISPANIC_COL] = 'BOOL'

            gcs_to_bq_util.add_dataframe_to_bq(
                breakdown_df, dataset, breakdown, column_types=column_types)

    def generate_breakdown(self, breakdown, df):
        output = []
        states = df['State Name'].drop_duplicates().to_list()

        columns = [std_col.STATE_NAME_COL, std_col.COPD_PCT, std_col.DIABETES_PCT]
        if breakdown == std_col.RACE_OR_HISPANIC_COL:
            columns.append(std_col.RACE_CATEGORY_ID_COL)
        else:
            columns.append(breakdown)

        for state in states:
            for breakdown_value in BREAKDOWN_MAP[breakdown]:
                output_row = {}
                output_row[std_col.STATE_NAME_COL] = state

                if breakdown == std_col.RACE_OR_HISPANIC_COL:
                    output_row[std_col.RACE_CATEGORY_ID_COL] = UHC_RACE_GROUPS_TO_STANDARD[breakdown_value]
                else:
                    output_row[breakdown] = breakdown_value

                for determinant in UHC_DETERMINANTS_OF_HEALTH:
                    if breakdown_value == 'All':
                        output_row[UHC_DETERMINANTS_OF_HEALTH[determinant]] = df.loc[
                            (df['State Name'] == state) &
                            (df['Measure Name'] == determinant)]['Value'].values[0]

                    else:
                        row = df.loc[
                            (df['State Name'] == state) &
                            (df['Measure Name'].str.contains(determinant)) &
                            (df['Measure Name'].str.contains(breakdown_value))]

                        if len(row) > 0:
                            pct = row['Value'].values[0]
                            if pct:
                                output_row[UHC_DETERMINANTS_OF_HEALTH[determinant]] = pct

                output.append(output_row)

        output_df = pd.DataFrame(output, columns=columns)

        if breakdown == std_col.RACE_OR_HISPANIC_COL:
            std_col.add_race_columns_from_category_id(output_df)

        return output_df
