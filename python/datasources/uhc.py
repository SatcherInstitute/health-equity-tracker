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

# COPD, Diabetes, Depression, Frequent Mental Distress, Excessive Drinking
UHC_STANDARD_AGE_GROUPS = ['18-44', '45-64', '65+']
# Suicide
UHC_DECADE_PLUS_5_AGE_GROUPS = [
    '15-24', '25-34', '35-44', '45-54', '55-64', '65-74', '75-84', '85+']
UHC_AGE_GROUPS = ['All', *UHC_DECADE_PLUS_5_AGE_GROUPS,
                  *UHC_STANDARD_AGE_GROUPS]
# No Age Breakdowns for: Illicit Opioid, Non-medical Drug

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

BASE_UHC_URL = "https://www.ZZZamericashealthrankings.org/api/v1/downloads/210"

UHC_STANDARD_AGE_DETERMINANTS = {
    "Chronic Obstructive Pulmonary Disease": std_col.COPD_PCT,
    "Diabetes": std_col.DIABETES_PCT,
    "Frequent Mental Distress": std_col.FREQUENT_MENTAL_DISTRESS_PCT,
    "Depression": std_col.DEPRESSION_PCT,
    "Non-medical Drug Use": std_col.NON_MEDICAL_DRUG_USE_PCT,
    "Excessive Drinking": std_col.EXCESSIVE_DRINKING_PCT,
    "Illicit Opioid Use": std_col.ILLICIT_OPIOID_USE_PCT,  # all
}

ALIASES = {
    # with breakdown
    "Illicit Opioid Use": "Use of Illicit Opioids"
}

UHC_DECADE_PLUS_5_AGE_DETERMINANTS = {
    "Suicide": std_col.SUICIDE_PCT,
}

# UHC_DETERMINANTS_OF_HEALTH = {
#     **UHC_STANDARD_AGE_DETERMINANTS, **UHC_DECADE_PLUS_5_AGE_DETERMINANTS}

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

            for col in [std_col.COPD_PCT,
                        std_col.DIABETES_PCT,
                        std_col.FREQUENT_MENTAL_DISTRESS_PCT,
                        std_col.DEPRESSION_PCT, std_col.SUICIDE_PCT,
                        std_col.ILLICIT_OPIOID_USE_PCT,
                        std_col.NON_MEDICAL_DRUG_USE_PCT,
                        std_col.EXCESSIVE_DRINKING_PCT]:
                column_types[col] = 'FLOAT'

            if std_col.RACE_INCLUDES_HISPANIC_COL in breakdown_df.columns:
                column_types[std_col.RACE_INCLUDES_HISPANIC_COL] = 'BOOL'

            gcs_to_bq_util.add_dataframe_to_bq(
                breakdown_df, dataset, breakdown, column_types=column_types)

    def generate_breakdown(self, breakdown, df):
        output = []
        states = df['State Name'].drop_duplicates().to_list()

        columns = [std_col.STATE_NAME_COL, std_col.COPD_PCT, std_col.DIABETES_PCT,
                   std_col.FREQUENT_MENTAL_DISTRESS_PCT, std_col.DEPRESSION_PCT,
                   std_col.SUICIDE_PCT, std_col.ILLICIT_OPIOID_USE_PCT,
                   std_col.NON_MEDICAL_DRUG_USE_PCT, std_col.EXCESSIVE_DRINKING_PCT]
        if breakdown == std_col.RACE_OR_HISPANIC_COL:
            columns.append(std_col.RACE_CATEGORY_ID_COL)
        else:
            columns.append(breakdown)

        for state in states:

            for breakdown_value in BREAKDOWN_MAP[breakdown]:
                output_row = {}
                output_row[std_col.STATE_NAME_COL] = state

                if breakdown == std_col.RACE_OR_HISPANIC_COL:
                    output_row[std_col.RACE_CATEGORY_ID_COL] = \
                        UHC_RACE_GROUPS_TO_STANDARD[breakdown_value]
                else:
                    output_row[breakdown] = breakdown_value

                # use select determinants based on the iterated age bucket
                if breakdown_value in UHC_STANDARD_AGE_GROUPS:
                    UHC_DETERMINANTS_OF_HEALTH = UHC_STANDARD_AGE_DETERMINANTS
                elif breakdown_value in UHC_DECADE_PLUS_5_AGE_GROUPS:
                    UHC_DETERMINANTS_OF_HEALTH = UHC_DECADE_PLUS_5_AGE_DETERMINANTS
                # for age="All" or any race/sex breakdown, use every determinant
                else:
                    UHC_DETERMINANTS_OF_HEALTH = {
                        **UHC_STANDARD_AGE_DETERMINANTS, **UHC_DECADE_PLUS_5_AGE_DETERMINANTS}

                # print(breakdown_value, UHC_DETERMINANTS_OF_HEALTH)

                for determinant in UHC_DETERMINANTS_OF_HEALTH:
                    print(determinant)

                    if breakdown_value == 'All':

                        output_row[UHC_DETERMINANTS_OF_HEALTH[determinant]] = \
                            df.loc[(df['State Name'] == state) &
                                   (df['Measure Name'] == determinant)]['Value'].values[0]

                    else:
                        # extract precise determinant and demographic breakdown value
                        df_determinant, df_breakdown_value = df['Measure Name'][1].split(
                            " - ")
                        print(df_determinant, df_breakdown_value)

                        # determinant = ALIASES.get(
                        #     determinant, determinant)

                        row = df.loc[
                            (df['State Name'] == state) &
                            (df_determinant == determinant) &
                            (df_breakdown_value == breakdown_value)]




                        if len(row) > 0:
                            print("yay?")
                            print(row)
                            pct = row['Value'].values[0]
                            if pct:
                                # use determinant name or alias
                                output_row[UHC_DETERMINANTS_OF_HEALTH[determinant]] = pct

                output.append(output_row)

            output_df = pd.DataFrame(output, columns=columns)

            if breakdown == std_col.RACE_OR_HISPANIC_COL:
                std_col.add_race_columns_from_category_id(output_df)

            return output_df
