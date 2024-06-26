import pandas as pd
from datasources.data_source import DataSource
from ingestion import gcs_to_bq_util
import ingestion.constants as constants
from ingestion.merge_utils import merge_pop_numbers, merge_state_ids
import ingestion.standardized_columns as std_col
from ingestion.het_types import SEX_RACE_ETH_AGE_TYPE, GEO_TYPE, SEX_RACE_AGE_TYPE
from typing import cast

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
BROAD_AGE_GROUPS = ['0-17', '18-44', '45-64', '65+']

SUICIDE_AGE_GROUPS = ['0-14', '15-24', '25-34', '35-44', '45-54', '55-64', '65-74', '75-84', '85+']


VOTER_AGE_GROUPS = ['0-17', '18-24', '25-34', '35-44', '45-64']  # NOTE csv has typo extra space which we remove later

# single list of all unique age group options
AHR_AGE_GROUPS = list(dict.fromkeys([std_col.ALL_VALUE, *SUICIDE_AGE_GROUPS, *VOTER_AGE_GROUPS, *BROAD_AGE_GROUPS]))

# # No Age Breakdowns for: Non-medical Drug (including Non-Medical Rx Opioid)

AHR_SEX_GROUPS = ['Male', 'Female', std_col.ALL_VALUE]

RACE_GROUPS_TO_STANDARD = {
    'American Indian/Alaska Native': std_col.Race.AIAN_NH.value,
    'Asian': std_col.Race.ASIAN_NH.value,
    'Asian/Pacific Islander': std_col.Race.API_NH.value,
    'Black': std_col.Race.BLACK_NH.value,
    'Hispanic': std_col.Race.HISP.value,
    'Hawaiian/Pacific Islander': std_col.Race.NHPI_NH.value,
    'Other Race': std_col.Race.OTHER_STANDARD_NH.value,
    'White': std_col.Race.WHITE_NH.value,
    'Multiracial': std_col.Race.MULTI_NH.value,
    'All': std_col.Race.ALL.value,
}

PER100K_TOPICS = {
    "Suicide": std_col.SUICIDE_PREFIX,
    "Preventable Hospitalizations": std_col.PREVENTABLE_HOSP_PREFIX,
}

PCT_RATE_TOPICS = {
    "Voter Participation": std_col.VOTER_PARTICIPATION_PREFIX,
    "Avoided Care Due to Cost": std_col.AVOIDED_CARE_PREFIX,
}

CONVERT_PCT_TO_100K_TOPICS = {
    "Chronic Obstructive Pulmonary Disease": std_col.COPD_PREFIX,
    "Diabetes": std_col.DIABETES_PREFIX,
    "Frequent Mental Distress": std_col.FREQUENT_MENTAL_DISTRESS_PREFIX,
    "Depression": std_col.DEPRESSION_PREFIX,
    "Excessive Drinking": std_col.EXCESSIVE_DRINKING_PREFIX,
    "Non-medical Drug Use": std_col.NON_MEDICAL_DRUG_USE_PREFIX,
    "Asthma": std_col.ASTHMA_PREFIX,
    "Cardiovascular Diseases": std_col.CARDIOVASCULAR_PREFIX,
    "Chronic Kidney Disease": std_col.CHRONIC_KIDNEY_PREFIX,
}

AHR_METRICS = {**PER100K_TOPICS, **PCT_RATE_TOPICS, **CONVERT_PCT_TO_100K_TOPICS}

# When parsing Measure Names from rows with a demographic breakdown
# these aliases will be used instead of the topic string above
ALT_ROWS_ALL = {
    "Non-medical Drug Use": "Non-medical Drug Use - Past Year",
    "Voter Participation": "Voter Participation (Presidential)",
}

ALT_ROWS_WITH_DEMO = {"Voter Participation": "Voter Participation (Presidential)"}


PLUS_5_AGE_TOPICS = {
    "Suicide": std_col.SUICIDE_PREFIX,
}


BREAKDOWN_MAP = {
    std_col.RACE_OR_HISPANIC_COL: AHR_RACE_GROUPS,
    std_col.AGE_COL: AHR_AGE_GROUPS,
    std_col.SEX_COL: AHR_SEX_GROUPS,
}


class AHRData(DataSource):
    @staticmethod
    def get_id():
        return 'AHR_DATA'

    @staticmethod
    def get_table_name():
        return 'ahr_data'

    def upload_to_gcs(self, _, **attrs):
        raise NotImplementedError('upload_to_gcs should not be called for AHRData')

    def write_to_bq(self, dataset, gcs_bucket, **attrs):
        df = gcs_to_bq_util.load_csv_as_df_from_data_dir(
            'ahr', 'ahr_annual_2022.csv', dtype={'StateCode': str, "Measure": str, "Value": float}
        )

        # remove typo trailing spaces from source data
        df['Measure'] = df['Measure'].str.strip()

        df.rename(columns={'StateCode': std_col.STATE_POSTAL_COL}, inplace=True)
        df[std_col.STATE_POSTAL_COL].replace('ALL', constants.US_ABBR, inplace=True)

        for geo in [constants.STATE_LEVEL, constants.NATIONAL_LEVEL]:
            loc_df = df.copy()

            if geo == constants.NATIONAL_LEVEL:
                loc_df = loc_df.loc[loc_df[std_col.STATE_POSTAL_COL] == constants.US_ABBR]
            else:
                loc_df = loc_df.loc[loc_df[std_col.STATE_POSTAL_COL] != constants.US_ABBR]

            for breakdown in [std_col.RACE_OR_HISPANIC_COL, std_col.AGE_COL, std_col.SEX_COL]:
                table_name = f'{breakdown}_{geo}'
                breakdown_df = loc_df.copy()
                breakdown_df = parse_raw_data(breakdown_df, breakdown)
                breakdown_df = post_process(breakdown_df, breakdown, geo)

                # get list of all columns expected to contain numbers
                float_cols = [std_col.AHR_POPULATION_PCT]
                float_cols.extend(
                    [std_col.generate_column_name(col, std_col.PCT_RATE_SUFFIX) for col in PCT_RATE_TOPICS.values()]
                )
                float_cols.extend(
                    [std_col.generate_column_name(col, std_col.PER_100K_SUFFIX) for col in PER100K_TOPICS.values()]
                )
                float_cols.extend(
                    [
                        std_col.generate_column_name(col, std_col.PER_100K_SUFFIX)
                        for col in CONVERT_PCT_TO_100K_TOPICS.values()
                    ]
                )
                float_cols.extend(
                    [std_col.generate_column_name(col, std_col.PCT_SHARE_SUFFIX) for col in AHR_METRICS.values()]
                )
                col_types = gcs_to_bq_util.get_bq_column_types(breakdown_df, float_cols)

                gcs_to_bq_util.add_df_to_bq(breakdown_df, dataset, table_name, column_types=col_types)


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
    states = df[std_col.STATE_POSTAL_COL].drop_duplicates().to_list()

    for state in states:
        for breakdown_value in BREAKDOWN_MAP[breakdown]:
            output_row = {}
            output_row[std_col.STATE_POSTAL_COL] = state

            if breakdown == std_col.RACE_OR_HISPANIC_COL:
                output_row[std_col.RACE_CATEGORY_ID_COL] = RACE_GROUPS_TO_STANDARD[breakdown_value]

            else:
                output_row[breakdown] = breakdown_value

            for topic, prefix in AHR_METRICS.items():
                per_100k_col_name = std_col.generate_column_name(prefix, std_col.PER_100K_SUFFIX)
                pct_rate_col_name = std_col.generate_column_name(prefix, std_col.PCT_RATE_SUFFIX)
                pct_share_col_name = std_col.generate_column_name(prefix, std_col.PCT_SHARE_SUFFIX)

                matched_row = get_matched_row(df, state, topic, breakdown_value, breakdown)

                if len(matched_row) > 0:
                    output_row[pct_share_col_name] = matched_row['CaseShare'].values[0]

                    if topic in PER100K_TOPICS:
                        output_row[per_100k_col_name] = matched_row['Value'].values[0]
                    elif topic in PCT_RATE_TOPICS:
                        output_row[pct_rate_col_name] = matched_row['Value'].values[0]
                    else:
                        # convert AHR pct_rate to HET per100k
                        output_row[per_100k_col_name] = matched_row['Value'].values[0] * 1000

            output.append(output_row)

    output_df = pd.DataFrame(output)

    return output_df


def post_process(breakdown_df: pd.DataFrame, breakdown: SEX_RACE_ETH_AGE_TYPE, geo: GEO_TYPE):
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
    if breakdown == std_col.RACE_OR_HISPANIC_COL:
        std_col.add_race_columns_from_category_id(breakdown_df)

    breakdown_df = merge_state_ids(breakdown_df)

    breakdown_name = 'race' if breakdown == std_col.RACE_OR_HISPANIC_COL else breakdown

    breakdown_df = merge_pop_numbers(breakdown_df, cast(SEX_RACE_AGE_TYPE, breakdown_name), geo)

    breakdown_df = breakdown_df.rename(columns={std_col.POPULATION_PCT_COL: std_col.AHR_POPULATION_PCT})

    breakdown_df[std_col.AHR_POPULATION_PCT] = breakdown_df[std_col.AHR_POPULATION_PCT].astype(float)
    breakdown_df = breakdown_df.drop(columns=std_col.POPULATION_COL)

    return breakdown_df


def get_matched_row(df: pd.DataFrame, state: str, topic: str, breakdown_value: str, breakdown: SEX_RACE_ETH_AGE_TYPE):
    """
    Find the row in the AHR dataframe that matches the given state, topic,
    and breakdown values.

    Args:
        df: Dataframe with raw data directly pulled from the AHR csv.
        state: The state abbreviation to search for (e.g. "CA").
        topic: The AHR topic to search for (e.g. "Asthma").
        breakdown_value: The breakdown value to search for (e.g. "65+).
        breakdown: string equal to race_and_ethnicity, sex, or age.

    Returns:
        A pandas dataframe that matches the given criteria.
    """
    if breakdown_value in {std_col.ALL_VALUE, 'Total'}:
        # find row that matches current nested iterations
        matched_row = df.loc[
            (df[std_col.STATE_POSTAL_COL] == state) & (df['Measure'] == ALT_ROWS_ALL.get(topic, topic))
        ]

    else:
        # For rows with demographic breakdown, the topic
        # and breakdown group are in a single field
        # We build that string to perfectly match the field,
        # using any alias for the topic as needed
        space_or_ages = " "
        if breakdown == std_col.AGE_COL:
            space_or_ages += "Ages "
        measure_name = f"{ALT_ROWS_WITH_DEMO.get(topic, topic)}" f" -{space_or_ages}" f"{breakdown_value}"

        matched_row = df.loc[(df[std_col.STATE_POSTAL_COL] == state) & (df['Measure'] == measure_name)]

    return matched_row
