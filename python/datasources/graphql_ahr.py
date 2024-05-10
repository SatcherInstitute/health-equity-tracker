import pandas as pd
from datetime import datetime
from typing import cast

from datasources.data_source import DataSource
from ingestion import gcs_to_bq_util

from ingestion import standardized_columns as std_col
from ingestion.constants import US_ABBR, NATIONAL_LEVEL, CURRENT, Sex
from ingestion.dataset_utils import generate_time_df_with_cols_and_types
from ingestion.graphql_ahr_utils import (
    generate_cols_map,
    fetch_ahr_data_from_graphql,
    AHR_BASE_MEASURES,
    PCT_RATE_TO_PER_100K_TOPICS,
)
from ingestion.merge_utils import merge_state_ids, merge_yearly_pop_numbers
from ingestion.types import DEMOGRAPHIC_TYPE, GEO_TYPE, SEX_RACE_AGE_TYPE

AGE_GROUPS_TO_STANDARD = {
    'Ages 15-24': '15-24',
    'Ages 18-44': '18-44',
    'Ages 25-34': '24-34',
    'Ages 35-44': '35-44',
    'Ages 45-54': '45-54',
    'Ages 45-64': '45-64',
    'Ages 55-64': '55-64',
    'Ages 65+': '65+',
    'Ages 65-74': '65-74',
    'Ages 75-84': '75-84',
    'Ages 85+': '85+',
}

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

AHR_AGE_GROUPS = list(AGE_GROUPS_TO_STANDARD.keys())
AHR_RACE_GROUPS = list(RACE_GROUPS_TO_STANDARD.keys())
AHR_SEX_GROUPS = [Sex.FEMALE, Sex.MALE]

PCT_RATE_TOPICS = [std_col.AVOIDED_CARE_PREFIX, std_col.VOTER_PARTICIPATION_PREFIX]
PER_100K_TOPICS = [
    std_col.ASTHMA_PREFIX,
    std_col.CARDIOVASCULAR_PREFIX,
    std_col.CHRONIC_KIDNEY_PREFIX,
    std_col.COPD_PREFIX,
    std_col.DEPRESSION_PREFIX,
    std_col.DIABETES_PREFIX,
    std_col.EXCESSIVE_DRINKING_PREFIX,
    std_col.FREQUENT_MENTAL_DISTRESS_PREFIX,
    std_col.NON_MEDICAL_DRUG_USE_PREFIX,
    std_col.PREVENTABLE_HOSP_PREFIX,
    std_col.SUICIDE_PREFIX,
]

PCT_RATE_MAP = generate_cols_map(PCT_RATE_TOPICS, std_col.PCT_RATE_SUFFIX)
PER_100K_MAP = generate_cols_map(PER_100K_TOPICS, std_col.PER_100K_SUFFIX)

TIME_MAP = {
    CURRENT: list(AHR_BASE_MEASURES.values()),
}


class GraphQlAHRData(DataSource):
    @staticmethod
    def get_id():
        return 'GRAPHQL_AHR_DATA'

    @staticmethod
    def get_table_name():
        return 'graphql_ahr_data'

    def upload_to_gcs(self, _, **attrs):
        raise NotImplementedError('upload_to_gcs should not be called for AHRData')

    def write_to_bq(self, dataset, gcs_bucket, write_local_instead_of_bq=False, **attrs):
        demographic = self.get_attr(attrs, "demographic")
        geo_level = self.get_attr(attrs, "geographic")

        response_data = fetch_ahr_data_from_graphql()

        df = graphql_response_to_dataframe(response_data, geo_level)

        df = self.generate_breakdown_df(demographic, geo_level, df)

        for table_type in [CURRENT]:
            table_name = f"{demographic}_{geo_level}_{table_type}"
            time_cols = TIME_MAP[table_type]

            df_for_bq, col_types = generate_time_df_with_cols_and_types(df, time_cols, table_type, demographic)

        gcs_to_bq_util.add_df_to_bq(df_for_bq, dataset, table_name, column_types=col_types)

    def generate_breakdown_df(self, breakdown: DEMOGRAPHIC_TYPE, geo_level: GEO_TYPE, df: pd.DataFrame):
        measure_map = create_measure_map()

        measures_for_demographic = measure_map[breakdown]

        filtered_df = df[df['Measure'].isin(measures_for_demographic)]

        breakdown_df = parse_raw_data(filtered_df, breakdown)
        breakdown_df = post_process(breakdown_df, breakdown, geo_level)

        return breakdown_df


def graphql_response_to_dataframe(response_data, geo_level: GEO_TYPE):
    """
    Converts a GraphQL API response containing nested data into a flattened Pandas DataFrame.

    Args:
    - response_data (dict): The GraphQL API response data.
    - geo_level (str): The geographic level of the data (e.g., 'national', 'state').

    Returns:
    - pd.DataFrame: A Pandas DataFrame containing the flattened data.

    The function flattens the nested response_data structure, extracts relevant fields,
    and creates a DataFrame. It also standardizes the state codes and filters the data
    based on the geographic level.
    """
    flattened_data = []

    for dataset in response_data:
        for data in dataset:
            for row in data['data']:
                dt_obj = datetime.strptime(row['endDate'], '%Y-%m-%dT%H:%M:%S.%fZ')
                row['time_period'] = str(dt_obj.year)
                row['Measure'] = row['measure']['name']
                row['state_postal'] = row['state']
                row['Value'] = row['value']
                del row['endDate']
                del row['value']
                del row['measure']
                del row['state']
                flattened_data.append(row)

    df = pd.DataFrame(flattened_data)

    df[std_col.STATE_POSTAL_COL].replace('ALL', US_ABBR, inplace=True)

    if geo_level == NATIONAL_LEVEL:
        df = df.loc[df[std_col.STATE_POSTAL_COL] == US_ABBR]
    else:
        df = df.loc[df[std_col.STATE_POSTAL_COL] != US_ABBR]

    return df


def parse_raw_data(df: pd.DataFrame, breakdown_col: DEMOGRAPHIC_TYPE):
    """
    Parses raw data in a DataFrame to extract breakdown information and create a pivot table.

    Args:
    - df (pd.DataFrame): The DataFrame containing the raw data.
    - breakdown_col (DEMOGRAPHIC_TYPE): The name of the column where the breakdown information will be placed.

    Returns:
    - pd.DataFrame: A pivot table DataFrame containing the parsed and aggregated data.

    This function iterates over topics in the AHR_BASE_MEASURES dictionary, extracts breakdown
    information from the 'Measure' column, sets the measure type, and pivots the DataFrame to
    create a summary table. It also converts values to per 100,000 if necessary and sorts the
    resulting DataFrame by time period in descending order.
    """
    breakdown_df = df.copy()

    for ahr_topic, ahr_measure_type in AHR_BASE_MEASURES.items():
        # Check if the ahr topic, e.g Asthma, is present in the `Measure` column
        is_topic_present = breakdown_df['Measure'].str.contains(ahr_topic, regex=False)

        # Extracts the breakdown from the 'Measure' column and places it in the 'breakdown_col'
        breakdown_df.loc[is_topic_present, breakdown_col] = (
            breakdown_df.loc[is_topic_present, 'Measure'].str.replace(ahr_topic, "", regex=False).str.strip(" - ")
        )

        # Fills any empty breakdown_col rows with the 'ALL' value
        breakdown_df.loc[breakdown_df[breakdown_col] == "", breakdown_col] = std_col.ALL_VALUE

        # Set measure type for the topics
        breakdown_df.loc[is_topic_present, 'Measure'] = ahr_measure_type

        if ahr_topic in PCT_RATE_TO_PER_100K_TOPICS:
            breakdown_df.loc[is_topic_present, 'Value'] *= 1000

    pivot_df = breakdown_df.pivot_table(
        index=[std_col.TIME_PERIOD_COL, std_col.STATE_POSTAL_COL, breakdown_col],
        columns='Measure',
        values='Value',
        aggfunc='first',
    ).reset_index()

    pivot_df = pivot_df.sort_values(by=std_col.TIME_PERIOD_COL, ascending=False)

    return pivot_df


def post_process(df: pd.DataFrame, breakdown: DEMOGRAPHIC_TYPE, geo_level: GEO_TYPE):
    """
    Post-processes a DataFrame containing demographic data.

    Args:
    - df (pd.DataFrame): The DataFrame containing the raw demographic data.
    - breakdown_col (DEMOGRAPHIC_TYPE): The type of demographic breakdown to be standardized.
    - geo_level (GEO_TYPE): The geographic level of the data.

    Returns:
    - pd.DataFrame: A processed DataFrame containing the post-processed data.

    This function performs the following steps:
    1. Standardizes demographic breakdowns based on the specified demographic type.
    2. Merges state IDs with the DataFrame.
    3. Merges yearly population numbers based on the demographic breakdown and geographic level.
    4. Adds estimated total columns based on specified mappings.
    5. Generates percentage share columns without unknowns based on specified mappings.
    6. Drops the 'Population' column from the DataFrame.
    7. Sorts the DataFrame by state FIPS code and time period in descending order.
    8. Converts the 'Time Period' column to datetime and filters data up to the year 2021.
    """
    breakdown_df = df.copy()

    if breakdown == std_col.AGE_COL:
        breakdown_df = breakdown_df.replace(to_replace=AGE_GROUPS_TO_STANDARD)
    if breakdown == std_col.RACE_OR_HISPANIC_COL:
        breakdown_df = breakdown_df.rename(columns={std_col.RACE_OR_HISPANIC_COL: std_col.RACE_CATEGORY_ID_COL})
        breakdown_df = breakdown_df.replace(to_replace=RACE_GROUPS_TO_STANDARD)
        std_col.add_race_columns_from_category_id(breakdown_df)

    pop_breakdown = std_col.RACE_COL if breakdown == std_col.RACE_OR_HISPANIC_COL else breakdown

    breakdown_df = merge_state_ids(breakdown_df)
    breakdown_df = merge_yearly_pop_numbers(breakdown_df, cast(SEX_RACE_AGE_TYPE, pop_breakdown), geo_level)

    breakdown_df = breakdown_df.drop(columns=std_col.POPULATION_COL)

    breakdown_df = breakdown_df.sort_values(
        by=[std_col.STATE_FIPS_COL, std_col.TIME_PERIOD_COL], ascending=[True, False]
    )

    breakdown_df[std_col.TIME_PERIOD_COL] = pd.to_datetime(breakdown_df[std_col.TIME_PERIOD_COL])
    breakdown_df[std_col.TIME_PERIOD_COL] = breakdown_df[std_col.TIME_PERIOD_COL].dt.year
    breakdown_df = breakdown_df[breakdown_df[std_col.TIME_PERIOD_COL] <= 2021]

    return breakdown_df


def create_measure_map():
    """
    Creates a map of measures based on demographic categories.

    Returns:
    - dict: A dictionary mapping demographic categories to lists of measures.

    This function iterates over the AHR_BASE_MEASURES dictionary and generates a map
    containing the base measures and their breakdowns for age, race or ethnicity,
    and sex categories.
    """
    measure_map = {std_col.AGE_COL: [], std_col.RACE_OR_HISPANIC_COL: [], std_col.SEX_COL: []}

    # Add base measures to each category
    for base_measure in AHR_BASE_MEASURES:
        for category, measures_list in measure_map.items():
            measures_list.append(base_measure)

    # Add breakdowns for each base measure
    for category, measures_list in measure_map.items():
        for base_measure in AHR_BASE_MEASURES:
            if base_measure == 'Non-Medical Drug Use - Past Year':
                base_measure = 'Non-Medical Drug Use'
            if category is std_col.AGE_COL:
                for demographic in AHR_AGE_GROUPS:
                    measures_list.append(f"{base_measure} - {demographic}")
            if category is std_col.RACE_OR_HISPANIC_COL:
                for demographic in AHR_RACE_GROUPS:
                    measures_list.append(f"{base_measure} - {demographic}")
            if category is std_col.SEX_COL:
                for demographic in AHR_SEX_GROUPS:
                    measures_list.append(f"{base_measure} - {demographic}")

    return measure_map
