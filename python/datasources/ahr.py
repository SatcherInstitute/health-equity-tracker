import numpy as np
import pandas as pd

from datasources.data_source import DataSource
from ingestion import gcs_to_bq_util
from ingestion.constants import *
from ingestion.merge_utils import merge_pop_numbers, merge_state_ids
from ingestion.standardized_columns import *
from ingestion.types import SEX_RACE_ETH_AGE_TYPE

AHR_RACE_GROUPS = [
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
BROAD_AGE_GROUPS = ['18-44', '45-64', '65+']

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
AHR_AGE_GROUPS = list(dict.fromkeys([
    ALL_VALUE,
    *SUICIDE_AGE_GROUPS,
    *VOTER_AGE_GROUPS,
    *BROAD_AGE_GROUPS
]))

# # No Age Breakdowns for: Non-medical Drug (including Non-Medical Rx Opioid)

AHR_SEX_GROUPS = ['Male', 'Female', ALL_VALUE]

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


AHR_DETERMINANTS = {
    "Chronic Obstructive Pulmonary Disease": COPD_PREFIX,
    "Diabetes": DIABETES_PREFIX,
    "Frequent Mental Distress": FREQUENT_MENTAL_DISTRESS_PREFIX,
    "Depression": DEPRESSION_PREFIX,
    "Excessive Drinking": EXCESSIVE_DRINKING_PREFIX,
    "Non-medical Drug Use": NON_MEDICAL_DRUG_USE_PREFIX,
    # NOTE: both opioid conditions below are subsets of Non-medical Drug Use above
    "Non-medical Use of Prescription Opioids": NON_MEDICAL_RX_OPIOID_USE_PREFIX,
    "Asthma": ASTHMA_PREFIX,
    "Cardiovascular Diseases": CARDIOVASCULAR_PREFIX,
    "Chronic Kidney Disease": CHRONIC_KIDNEY_PREFIX,
    "Avoided Care Due to Cost": AVOIDED_CARE_PREFIX,
    "Suicide": SUICIDE_PREFIX,
    "Preventable Hospitalizations": PREVENTABLE_HOSP_PREFIX,
    "Voter Participation": VOTER_PARTICIPATION_PREFIX,
}

# When parsing Measure Names from rows with a demographic breakdown
# these aliases will be used instead of the determinant string above
ALT_ROWS_ALL = {
    "Non-medical Drug Use": "Non-medical Drug Use - Past Year",
    "Voter Participation": "Voter Participation (Presidential)"
}

ALT_ROWS_WITH_DEMO = {
    "Voter Participation": "Voter Participation (Presidential)"
}

PER100K_DETERMINANTS = {
    "Suicide": SUICIDE_PREFIX,
    "Preventable Hospitalizations": PREVENTABLE_HOSP_PREFIX
}

PLUS_5_AGE_DETERMINANTS = {
    "Suicide": SUICIDE_PREFIX,
}

BREAKDOWN_MAP = {
    "race_and_ethnicity": AHR_RACE_GROUPS,
    "age": AHR_AGE_GROUPS,
    "sex": AHR_SEX_GROUPS,
}


class AHRData(DataSource):

    @staticmethod
    def get_id():
        return 'AHR_DATA'

    @staticmethod
    def get_table_name():
        return 'ahr_data'

    def upload_to_gcs(self, _, **attrs):
        raise NotImplementedError(
            'upload_to_gcs should not be called for AHRData')

    def write_to_bq(self, dataset, gcs_bucket, **attrs):
        df = gcs_to_bq_util.load_csv_as_df_from_data_dir('ahr',
                                                         'ahr_annual_2022.csv')

        df.rename(columns={'StateCode': STATE_POSTAL_COL}, inplace=True)
        df[STATE_POSTAL_COL].replace('ALL', US_ABBR, inplace=True)

        for geo in [STATE_LEVEL, NATIONAL_LEVEL]:
            loc_df = df.copy()

            if geo == NATIONAL_LEVEL:
                loc_df = loc_df.loc[loc_df[STATE_POSTAL_COL] == US_ABBR]
            else:
                loc_df = loc_df.loc[loc_df[STATE_POSTAL_COL] != US_ABBR]

            for breakdown in [RACE_OR_HISPANIC_COL, AGE_COL, SEX_COL]:
                table_name = f'{breakdown}_{geo}'
                breakdown_df = loc_df.copy()
                breakdown_df = parse_raw_data(breakdown_df, breakdown)
                breakdown_df = post_process(breakdown_df, breakdown, geo)

                float_cols = [generate_column_name(col, suffix) for col in AHR_DETERMINANTS.values(
                ) for suffix in [PER_100K_SUFFIX, PCT_SHARE_SUFFIX]]
                float_cols.append(BRFSS_POPULATION_PCT)

                col_types = gcs_to_bq_util.get_bq_column_types(
                    breakdown_df, float_cols)

                breakdown_df.to_json(
                    f'ahr_test_output_{breakdown}_{geo}.json', orient="records")

                gcs_to_bq_util.add_df_to_bq(breakdown_df,
                                            dataset,
                                            table_name,
                                            column_types=col_types)


def parse_raw_data(df: pd.DataFrame, breakdown: SEX_RACE_ETH_AGE_TYPE):
    """
    Parses raw data from a AHR CSV file into a pandas DataFrame that the front-end can use.

    Args:
        df: Dataframe with raw data directly pulled from the AHR CSV file
        breakdown: string equal to race_and_ethnicity, sex, or age.

    Returns:
        A pandas DataFrame with processed data ready for the frontend.
    """
    output = []
    states = df[STATE_POSTAL_COL].drop_duplicates().to_list()

    for state in states:
        for breakdown_value in BREAKDOWN_MAP[breakdown]:
            output_row = {}
            output_row[STATE_POSTAL_COL] = state

            if breakdown == RACE_OR_HISPANIC_COL:
                output_row[RACE_CATEGORY_ID_COL] = RACE_GROUPS_TO_STANDARD[breakdown_value]

            else:
                output_row[breakdown] = breakdown_value

            for determinant, prefix in AHR_DETERMINANTS.items():
                per_100k_col_name = generate_column_name(prefix,
                                                         PER_100K_SUFFIX)
                pct_share_col_name = generate_column_name(prefix,
                                                          PCT_SHARE_SUFFIX)

                matched_row = get_matched_row(df,
                                              state,
                                              determinant,
                                              breakdown_value,
                                              breakdown)

                if len(matched_row) > 0:
                    output_row[pct_share_col_name] = matched_row['CaseShare'].values[0]

                    if determinant in PER100K_DETERMINANTS:
                        output_row[per_100k_col_name] = matched_row['Value'].values[0]
                    else:
                        output_row[per_100k_col_name] = matched_row['Value'].values[0] * 1000

            output.append(output_row)

    output_df = pd.DataFrame(output)

    return output_df


def post_process(breakdown_df: pd.DataFrame, breakdown: SEX_RACE_ETH_AGE_TYPE, geo: str):
    """
    Merges the state IDs with population data and performs necessary calculations
    to create a processed dataframe ready for the frontend. If the given breakdown
    is RACE_OR_HISPANIC_COL, additional columns are added to the dataframe based on
    the RACE_CATEGORY_ID_COL column.

    Args:
        breakdown_df: A pandas DataFrame containing all the raw AHR data.
        breakdown: string equal to race_and_ethnicity, sex, or age.

    Returns:
        A pandas DataFrame with processed data ready for use in the frontend.
    """
    if breakdown == RACE_OR_HISPANIC_COL:
        add_race_columns_from_category_id(breakdown_df)

    breakdown_df = merge_state_ids(breakdown_df)

    breakdown_name = 'race' if breakdown == RACE_OR_HISPANIC_COL else breakdown

    breakdown_df = merge_pop_numbers(
        breakdown_df, breakdown_name, geo)

    breakdown_df = breakdown_df.rename(
        columns={POPULATION_PCT_COL: BRFSS_POPULATION_PCT})
    breakdown_df[BRFSS_POPULATION_PCT] = breakdown_df[BRFSS_POPULATION_PCT].astype(
        float)
    breakdown_df = breakdown_df.drop(columns=POPULATION_COL)

    return breakdown_df


def get_matched_row(df: pd.DataFrame, state: str, determinant: str, breakdown_value: str, breakdown: SEX_RACE_ETH_AGE_TYPE):
    """
    Find the row in the AHR dataframe that matches the given state, determinant,
    and breakdown values.

    Args:
        df: Dataframe with raw data directly pulled from the AHR csv.
        state: The state abbreviation to search for (e.g. "CA").
        determinant: The AHR determinant to search for (e.g. "Asthma").
        breakdown_value: The breakdown value to search for (e.g. "65+).
        breakdown: string equal to race_and_ethnicity, sex, or age. 

    Returns:
        A pandas dataframe that matches the given criteria.
    """
    if breakdown_value in {ALL_VALUE, 'Total'}:
        # find row that matches current nested iterations
        matched_row = df.loc[
            (df[STATE_POSTAL_COL] == state) &
            (df['Measure'] == ALT_ROWS_ALL.get(determinant, determinant))
        ]

    else:
        # For rows with demographic breakdown, the determinant
        # and breakdown group are in a single field
        # We build that string to perfectly match the field,
        # using any alias for the determinant as needed
        space_or_ages = " "
        if breakdown == AGE_COL:
            space_or_ages += "Ages "
        measure_name = (
            f"{ALT_ROWS_WITH_DEMO.get(determinant, determinant)}"
            f" -{space_or_ages}"
            f"{breakdown_value}"
        )

        matched_row = df.loc[
            (df[STATE_POSTAL_COL] == state) &
            (df['Measure'] == measure_name)
        ]

    return matched_row
