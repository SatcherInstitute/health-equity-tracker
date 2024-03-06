from typing import Literal, cast
import pandas as pd
from datetime import datetime

from datasources.data_source import DataSource
from ingestion import gcs_to_bq_util

from ingestion import standardized_columns as std_col
from ingestion.constants import US_ABBR, NATIONAL_LEVEL, CURRENT
from ingestion.dataset_utils import (
    add_estimated_total_columns,
    generate_time_df_with_cols_and_types,
    generate_pct_share_col_without_unknowns,
)
from ingestion.merge_utils import merge_pop_numbers, merge_yearly_pop_numbers, merge_state_ids
from ingestion.types import GEO_TYPE, SEX_RACE_AGE_TYPE

# Set options to display the full DataFrame
pd.set_option('display.max_rows', None)  # Shows all rows
pd.set_option('display.max_columns', None)  # Shows all columns


def generate_cols_map(prefixes, suffix):
    cols_map = {}

    for prefix in prefixes:
        if f"_{std_col.RAW_SUFFIX}" in prefix:
            new_key = prefix.replace(f"_{std_col.RAW_SUFFIX}", "")
        elif f"_{std_col.PER_100K_SUFFIX}" in prefix:
            new_key = prefix.replace(f"_{std_col.PER_100K_SUFFIX}", "")
        else:
            new_key = prefix

        cols_map[prefix] = new_key + f"_{suffix}"

    return cols_map


AHR_BASE_MEASURES = {
    'Asthma': 'asthma_per_100k',
    'Avoided Care Due to Cost': 'avoided_care_pct_rate',
    'Cardiovascular Diseases': 'cardiovascular_diseases_per_100k',
    'Chronic Kidney Disease': 'chronic_kidney_disease_per_100k',
    'Chronic Obstructive Pulmonary Disease': 'copd_per_100k',
    'Depression': 'depression_per_100k',
    'Diabetes': 'diabetes_per_100k',
    'Excessive Drinking': 'excessive_drinking_per_100k',
    'Frequent Mental Distress': 'frequent_mental_distress_per_100k',
    'Preventable Hospitalizations': 'preventable_hospitalizations_per_100k',
    'Non-Medical Drug Use - Past Year': 'non_medical_drug_use_per_100k',
    'Suicide': 'suicide_per_100k',
    'Voter Participation (Presidential)': 'voter_participation_pct_rate',
}

PER_100K_TOPICS = ['Suicide', 'Preventable Hospitalizations']

PCT_RATE_TO_PER_100K_TOPICS = [
    "Asthma",
    "Cardiovascular Diseases",
    "Chronic Kidney Disease",
    "Chronic Obstructive Pulmonary Disease",
    "Depression",
    "Diabetes",
    "Excessive Drinking",
    "Frequent Mental Distress",
    "Non-medical Drug Use",
]

ALL_PER_100K_TOPICS = [
    std_col.ASTHMA_PREFIX,
    std_col.CARDIOVASCULAR_PREFIX,
    std_col.CHRONIC_KIDNEY_PREFIX,
    std_col.DEPRESSION_PREFIX,
    std_col.DIABETES_PREFIX,
    std_col.EXCESSIVE_DRINKING_PREFIX,
    std_col.FREQUENT_MENTAL_DISTRESS_PREFIX,
    std_col.NON_MEDICAL_DRUG_USE_PREFIX,
    std_col.PREVENTABLE_HOSP_PREFIX,
    std_col.SUICIDE_PREFIX,
]

PER_100K_MAP = generate_cols_map(ALL_PER_100K_TOPICS, std_col.PER_100K_SUFFIX)
RAW_TOTALS_MAP = generate_cols_map(PER_100K_MAP.values(), std_col.RAW_SUFFIX)
PCT_SHARE_MAP = generate_cols_map(RAW_TOTALS_MAP.values(), std_col.PCT_SHARE_SUFFIX)
PCT_SHARE_MAP[std_col.POPULATION_COL] = std_col.POPULATION_PCT_COL

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

AHR_AGE_STRINGS = list(AGE_GROUPS_TO_STANDARD.keys())
AHR_RACE_STRINGS = list(RACE_GROUPS_TO_STANDARD.keys())
AHR_SEX_STRINGS = ['Female', 'Male']

CURRENT_COLS = list(RAW_TOTALS_MAP.values()) + list(AHR_BASE_MEASURES.values()) + list(PCT_SHARE_MAP.values())


class GraphQlAHRData(DataSource):
    @staticmethod
    def get_id():
        return 'GRAPHQL_AHR_DATA'

    @staticmethod
    def get_table_name():
        return 'graphql_ahr_data'

    def upload_to_gcs(self, _, **attrs):
        raise NotImplementedError('upload_to_gcs should not be called for AHRData')

    def write_to_bq(self, dataset, gcs_bucket, **attrs):
        demographic = self.get_attr(attrs, "demographic")
        geographic = self.get_attr(attrs, "geographic")
        table_name = f"{demographic}_{geographic}"

        response_data = gcs_to_bq_util.fetch_ahr_data_from_graphql()

        df = graphql_response_to_dataframe(response_data, geographic)

        df = self.generate_breakdown_df(df, demographic, geographic)

        df_for_bq, col_types = generate_time_df_with_cols_and_types(
            df, CURRENT_COLS, CURRENT, demographic, current_year='2021'
        )

        gcs_to_bq_util.add_df_to_bq(df_for_bq, dataset, table_name, column_types=col_types)

    def generate_breakdown_df(
        self, df: pd.DataFrame, demographic: Literal['age', 'race_and_ethnicity', 'sex'], geographic: str
    ):
        measure_map = create_measure_map()

        if demographic == 'race_and_ethnicity':
            print(measure_map[demographic])

        if demographic in measure_map:
            measures_for_demographic = measure_map[demographic]

            filtered_df = df[df['Measure'].isin(measures_for_demographic)]

            breakdown_df = parse_raw_data(filtered_df, demographic)
            breakdown_df = post_process(breakdown_df, demographic, geographic)

            return breakdown_df

        else:
            print(f"Demographic '{demographic}' not found in measure map.")
            return None


def graphql_response_to_dataframe(response_data, geographic):
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

    if geographic == NATIONAL_LEVEL:
        df = df.loc[df[std_col.STATE_POSTAL_COL] == US_ABBR]
    else:
        df = df.loc[df[std_col.STATE_POSTAL_COL] != US_ABBR]

    return df


def parse_raw_data(df: pd.DataFrame, breakdown: str):
    breakdown_df = df.copy()

    for topic, metric in AHR_BASE_MEASURES.items():
        topic_rows = breakdown_df['Measure'].str.contains(topic, regex=False)

        # Extract and assign the demographic breakdown
        breakdown_value = breakdown_df.loc[topic_rows, 'Measure'].str.replace(topic, "").str.strip(" - ")
        breakdown_df.loc[topic_rows, breakdown] = breakdown_value
        breakdown_df.loc[breakdown_df[breakdown] == "", breakdown] = std_col.ALL_VALUE

        # Update the 'Measure' column
        breakdown_df.loc[topic_rows, 'Measure'] = metric

        if topic in PCT_RATE_TO_PER_100K_TOPICS:
            breakdown_df.loc[topic_rows, 'Value'] = breakdown_df.loc[topic_rows, 'Value'] * 1000
        else:
            breakdown_df.loc[topic_rows, 'Value'] = breakdown_df.loc[topic_rows, 'Value']

    # Pivot the DataFrame
    pivot_df = breakdown_df.pivot_table(
        index=[std_col.TIME_PERIOD_COL, std_col.STATE_POSTAL_COL, breakdown],
        columns='Measure',
        values='Value',
        aggfunc='first',
    ).reset_index()

    pivot_df = pivot_df.sort_values(by=std_col.TIME_PERIOD_COL, ascending=False)

    return pivot_df


def post_process(df: pd.DataFrame, breakdown: str, geographic: str):
    if breakdown == std_col.AGE_COL:
        df = df.replace(to_replace=AGE_GROUPS_TO_STANDARD)
    if breakdown == std_col.RACE_OR_HISPANIC_COL:
        df = df.rename(columns={std_col.RACE_OR_HISPANIC_COL: std_col.RACE_CATEGORY_ID_COL})
        df = df.replace(to_replace=RACE_GROUPS_TO_STANDARD)
        std_col.add_race_columns_from_category_id(df)

    breakdown_df = merge_state_ids(df)

    if breakdown == std_col.RACE_OR_HISPANIC_COL:
        breakdown_df = merge_yearly_pop_numbers(
            breakdown_df, cast(SEX_RACE_AGE_TYPE, std_col.RACE_COL), cast(GEO_TYPE, geographic)
        )
    else:
        breakdown_df = merge_pop_numbers(breakdown_df, breakdown, geographic)

    breakdown_df = breakdown_df.rename(columns={std_col.POPULATION_PCT_COL: std_col.POPULATION_PCT_COL})

    breakdown_df[std_col.POPULATION_PCT_COL] = breakdown_df[std_col.POPULATION_PCT_COL].astype(float)

    breakdown_df = add_estimated_total_columns(breakdown_df, RAW_TOTALS_MAP, std_col.POPULATION_COL)

    breakdown_df = generate_pct_share_col_without_unknowns(breakdown_df, PCT_SHARE_MAP, breakdown, std_col.ALL_VALUE)

    breakdown_df = breakdown_df.drop(columns=std_col.POPULATION_COL)
    breakdown_df = breakdown_df.sort_values(
        by=[std_col.STATE_FIPS_COL, std_col.TIME_PERIOD_COL], ascending=[True, False]
    )

    return breakdown_df


def create_measure_map():
    measure_map = {std_col.AGE_COL: [], std_col.RACE_OR_HISPANIC_COL: [], std_col.SEX_COL: []}

    for base_measure in AHR_BASE_MEASURES:
        for category in measure_map:
            measure_map[category].append(base_measure)

    for category in measure_map:
        for base_measure in AHR_BASE_MEASURES:
            if base_measure == 'Non-Medical Drug Use - Past Year':
                base_measure = 'Non-Medical Drug Use'
            if category is std_col.AGE_COL:
                for demographic in AHR_AGE_STRINGS:
                    measure_map[category].append(f"{base_measure} - {demographic}")
            if category is std_col.RACE_OR_HISPANIC_COL:
                for demographic in AHR_RACE_STRINGS:
                    measure_map[category].append(f"{base_measure} - {demographic}")
            if category is std_col.SEX_COL:
                for demographic in AHR_SEX_STRINGS:
                    measure_map[category].append(f"{base_measure} - {demographic}")

    return measure_map
