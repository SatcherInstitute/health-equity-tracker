import pandas as pd
import numpy as np  # type: ignore

from ingestion.standardized_columns import Race
import ingestion.standardized_columns as std_col

from datasources.data_source import DataSource
from ingestion import gcs_to_bq_util

UHC_RACE_GROUPS = [
    'American Indian/Alaska Native',
    'Asian',
    'Asian/Pacific Islander',
    'Black',
    'Hawaiian/Pacific Islander',
    'Hispanic',
    'Multiracial',
    'Other Race',
    'White',
    'All',
]

# COPD, Diabetes, Depression, Frequent Mental Distress, Excessive Drinking
BROAD_AGE_GROUPS = [
    '18-44',
    '45-64',
    '65+']

SUICIDE_AGE_GROUPS = [
    '15-24',
    '25-34',
    '35-44',
    '45-54',
    '55-64',
    '65-74',
    '75-84',
    '85+']


VOTER_AGE_GROUPS = [
    '18-24 ',  # NOTE csv has typo extra space which we remove later
    '25-34',
    '35-44',
    '45-64']

# single list of all unique age group options
UHC_AGE_GROUPS = list(dict.fromkeys([
    'All',
    *SUICIDE_AGE_GROUPS,
    *VOTER_AGE_GROUPS,
    *BROAD_AGE_GROUPS
]))

# No Age Breakdowns for: Non-medical Drug (including Illicit Opioid, Non-Medical Rx Opioid)

UHC_SEX_GROUPS = ['Male', 'Female', 'All']

RACE_GROUPS_TO_STANDARD = {
    'American Indian/Alaska Native': Race.AIAN_NH.value,
    'Asian': Race.ASIAN_NH.value,
    'Asian/Pacific Islander': Race.API_NH.value,
    'Black': Race.BLACK_NH.value,
    'Hispanic': Race.HISP.value,
    'Hawaiian/Pacific Islander': Race.NHPI_NH.value,
    'Other Race': Race.OTHER_STANDARD_NH.value,
    'White': Race.WHITE_NH.value,
    'Multiracial': Race.MULTI_NH.value,
    'All': Race.ALL.value,
}

BASE_UHC_URL = "https://www.americashealthrankings.org/api/v1/downloads/251"

UHC_DETERMINANTS = {
    "Chronic Obstructive Pulmonary Disease": std_col.COPD_PER_100K,
    "Diabetes": std_col.DIABETES_PER_100K,
    "Frequent Mental Distress": std_col.FREQUENT_MENTAL_DISTRESS_PER_100K,
    "Depression": std_col.DEPRESSION_PER_100K,
    "Excessive Drinking": std_col.EXCESSIVE_DRINKING_PER_100K,
    "Non-medical Drug Use": std_col.NON_MEDICAL_DRUG_USE_PER_100K,
    # NOTE: both opioid conditions below are subsets of Non-medical Drug Use above
    "Illicit Opioid Use": std_col.ILLICIT_OPIOID_USE_PER_100K,
    "Non-medical Use of Prescription Opioids": std_col.NON_MEDICAL_RX_OPIOID_USE_PER_100K,
    "Asthma": std_col.ASTHMA_PER_100K,
    "Cardiovascular Diseases": std_col.CARDIOVASCULAR_PER_100K,
    "Chronic Kidney Disease": std_col.CHRONIC_KIDNEY_PER_100K,
    "Avoided Care Due to Cost": std_col.AVOIDED_CARE_PER_100K,
    "Suicide": std_col.SUICIDE_PER_100K,
    "Preventable Hospitalizations": std_col.PREVENTABLE_HOSP_PER_100K,
    "Voter Participation": std_col.VOTER_PARTICIPATION_PER_100K,

    # VOTER PARTICIPATION
    # pres: state total ALL + by age (missing 65+) + by sex + by race
    # midterm: state total ALL + by age (missing 65+)
    # 65+ midterm: only 65+ age tracker
    # average: not using, state totals from AHR match our state totals



}

# When parsing Measure Names from rows with a demographic breakdown
# these aliases will be used instead of the determinant string above
ALT_ROWS_ALL = {
    "Non-medical Drug Use": "Non-medical Drug Use - Past Year",
    "Voter Participation": "Voter Participation (Presidential)"
}

ALT_ROWS_WITH_DEMO = {
    "Illicit Opioid Use": "Use of Illicit Opioids",
    "Voter Participation": "Voter Participation (Presidential)"
}

PER100K_DETERMINANTS = {
    "Suicide": std_col.SUICIDE_PER_100K,
    "Preventable Hospitalizations": std_col.PREVENTABLE_HOSP_PER_100K
}

PLUS_5_AGE_DETERMINANTS = {
    "Suicide": std_col.SUICIDE_PER_100K,
}

AVERAGED_DETERMINANTS = ["Voter Participation"]


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

        for breakdown in [std_col.RACE_OR_HISPANIC_COL,
                          std_col.AGE_COL,
                          std_col.SEX_COL]:
            breakdown_df = self.generate_breakdown(breakdown, df)
            column_types = {c: 'STRING' for c in breakdown_df.columns}

            for col in UHC_DETERMINANTS.values():
                column_types[col] = 'FLOAT'

            if std_col.RACE_INCLUDES_HISPANIC_COL in breakdown_df.columns:
                column_types[std_col.RACE_INCLUDES_HISPANIC_COL] = 'BOOL'

            gcs_to_bq_util.add_dataframe_to_bq(
                breakdown_df, dataset, breakdown, column_types=column_types)

    def generate_breakdown(self, breakdown, df):
        output = []
        states = df['State Name'].drop_duplicates().to_list()

        columns = [std_col.STATE_NAME_COL,
                   *UHC_DETERMINANTS.values()]
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
                        RACE_GROUPS_TO_STANDARD[breakdown_value]
                else:
                    output_row[breakdown] = breakdown_value.strip()

                for determinant in UHC_DETERMINANTS:

                    if breakdown_value == 'All':
                        # find row that matches current nested iterations
                        matched_row = df.loc[
                            (df['State Name'] == state) &
                            (df['Measure Name'] ==
                             ALT_ROWS_ALL.get(determinant, determinant))
                        ]

                        # TOTAL voter_participation is avg of pres and midterm data
                        if determinant in AVERAGED_DETERMINANTS:

                            matched_row_midterm = df.loc[
                                (df['State Name'] == state) &
                                (df['Measure Name'] ==
                                 "Voter Participation (Midterm)")
                            ]

                            pres_all_value = matched_row['Value'].values[0]
                            mid_all_value = matched_row_midterm['Value'].values[0]
                            average_value = np.nanmean(
                                [pres_all_value, mid_all_value])

                            output_row[std_col.VOTER_PARTICIPATION_PER_100K] = average_value * 1000

                        # already per 100k
                        elif determinant in PER100K_DETERMINANTS:
                            output_row[UHC_DETERMINANTS[determinant]
                                       ] = matched_row['Value'].values[0]
                        # converted from % to per 100k
                        else:
                            output_row[UHC_DETERMINANTS[determinant]
                                       ] = matched_row['Value'].values[0] * 1000

                    else:
                        # For rows with demographic breakdown, the determinant
                        # and breakdown group are in a single field
                        # We build that string to perfectly match the field,
                        # using any alias for the determinant as needed
                        space_or_ages = " "
                        if breakdown == std_col.AGE_COL:
                            space_or_ages += "Ages "
                        measure_name = (
                            f"{ALT_ROWS_WITH_DEMO.get(determinant, determinant)}"
                            f" -{space_or_ages}"
                            f"{breakdown_value}"
                        )

                        matched_row = df.loc[
                            (df['State Name'] == state) &
                            (df['Measure Name'] == measure_name)]

                        # BY AGE voter participation is avg of pres and midterm
                        if determinant in AVERAGED_DETERMINANTS and breakdown == std_col.AGE_COL:
                            average_value = get_average_determinate_value(matched_row, breakdown_value, df, state)
                            if average_value:
                                output_row[std_col.VOTER_PARTICIPATION_PER_100K] = average_value

                        # for other determinants besides VOTER
                        elif len(matched_row) > 0:
                            pct = matched_row['Value'].values[0]
                            if pct:
                                if determinant in PER100K_DETERMINANTS:
                                    output_row[UHC_DETERMINANTS[determinant]
                                               ] = matched_row['Value'].values[0]
                                # convert from % to per 100k
                                else:
                                    output_row[UHC_DETERMINANTS[determinant]
                                               ] = matched_row['Value'].values[0] * 1000

                output.append(output_row)

        output_df = pd.DataFrame(output, columns=columns)

        if breakdown == std_col.RACE_OR_HISPANIC_COL:
            std_col.add_race_columns_from_category_id(output_df)

        return output_df


def get_average_determinate_value(matched_row, breakdown_value, df, state):
    # get midterm for voting ages other than 65+
    if breakdown_value in VOTER_AGE_GROUPS:
        measure_name = (
            f"Voter Participation (Midterm) - Ages "
            f"{breakdown_value}"
        )

    # or get midterm for 65+ (different format)
    elif breakdown_value == "65+":
        measure_name = "Voter Participation - Ages 65+ (Midterm)"

    # skip midterm calc for all other age groups
    else:
        return

    pres_breakdown_value, mid_breakdown_value = np.nan, np.nan

    if len(matched_row) > 0:
        pres_breakdown_value = matched_row['Value'].values[0]

    matched_row_midterm = df.loc[
        (df['State Name'] == state) &
        (df['Measure Name'] == measure_name)]

    if len(matched_row_midterm) > 0:
        mid_breakdown_value = matched_row_midterm['Value'].values[0]

    average_value = np.nanmean(
        [pres_breakdown_value, mid_breakdown_value])

    return average_value * 1000

