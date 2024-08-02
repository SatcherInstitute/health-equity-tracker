import json
import os
import pandas as pd
import ingestion.standardized_columns as std_col
import requests  # type: ignore
from ingestion.constants import NATIONAL_LEVEL, US_ABBR
from ingestion.het_types import TOPIC_CATEGORY_TYPE

# Environment variable
ahr_api_key = os.getenv("AHR_API_KEY")

# Constants
AHR_US = 'ALL'
GRAPHQL_URL = 'https://api.americashealthrankings.org/graphql'
GRAPHQL_HEADERS = {'Content-Type': 'application/json', 'x-api-key': ahr_api_key}

AHR_MEASURES_TO_RATES_MAP_18PLUS = {
    'Asthma': 'asthma_per_100k',
    'Avoided Care Due to Cost': 'avoided_care_pct_rate',
    'Cardiovascular Diseases': 'cardiovascular_diseases_per_100k',
    'Chronic Kidney Disease': 'chronic_kidney_disease_per_100k',
    'Chronic Obstructive Pulmonary Disease': 'copd_per_100k',
    'Depression': 'depression_per_100k',
    'Diabetes': 'diabetes_per_100k',
    'Excessive Drinking': 'excessive_drinking_per_100k',
    'Frequent Mental Distress': 'frequent_mental_distress_per_100k',
    'Non-Medical Drug Use': 'non_medical_drug_use_per_100k',
}

AHR_MEASURES_TO_RATES_MAP_ALL_AGES = {
    'Suicide': 'suicide_per_100k',
}

AHR_MEASURES_TO_RATES_MAP_CITIZENS_18PLUS = {
    'Voter Participation (Presidential)': 'voter_participation_pct_rate',
}

AHR_MEASURES_TO_RATES_MAP_MEDICARE_18PLUS = {
    'Preventable Hospitalizations': 'preventable_hospitalizations_per_100k',
}

AHR_BASE_MEASURES_TO_RATES_MAP = {
    **AHR_MEASURES_TO_RATES_MAP_18PLUS,
    **AHR_MEASURES_TO_RATES_MAP_CITIZENS_18PLUS,
    **AHR_MEASURES_TO_RATES_MAP_MEDICARE_18PLUS,
    **AHR_MEASURES_TO_RATES_MAP_ALL_AGES,
}

# AHR provides case per 100; HET needs per 100k
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


# Utility functions
def load_ahr_measures_json(category: TOPIC_CATEGORY_TYPE):
    current_dir = os.path.dirname(os.path.abspath(__file__))
    config_file_path = os.path.join(current_dir, 'ahr_config', f'graphql_ahr_measure_ids_{category}.json')

    with open(config_file_path, 'r') as file:
        return json.load(file)


def get_measure_ids(demographic: str, category: TOPIC_CATEGORY_TYPE, data=None):
    """
    Retrieve all measure IDs based on the specified demographic.

    Args:
    demographic (str): One of 'all', 'age', 'race_and_ethnicity', 'sex'.
    data (dict, optional): The dataset to use for fetching the measure IDs.
    If not provided, the function will load the data from the JSON file.

    Returns:
    list: A list of all measure IDs for the specified demographic.
    """
    if data is None:
        data = load_ahr_measures_json(category)

    all_ids = []
    demographic_measures = data.get(demographic)

    for measure in demographic_measures:
        ids = measure.get('ids') or measure.get('demographics')
        if isinstance(ids, dict):
            # Flatten the dictionary values into a single list
            ids = [item for sublist in ids.values() for item in sublist]
        all_ids.extend(ids)

    return all_ids


def generate_cols_map(prefixes: list[str], suffix: str):
    """
    Generates a mapping of columns with given prefixes to their corresponding columns
    with specified suffix.

    Parameters:
    prefixes (list): A list of prefixes to generate the mapping for.
    suffix (str): The suffix to add to the columns.

    Returns:
    dict: A dictionary mapping the original prefixes to the modified prefixes with the
    specified suffix.
    """
    return {prefix: prefix.replace(f"_{std_col.RAW_SUFFIX}", "") + f"_{suffix}" for prefix in prefixes}


def fetch_ahr_data_from_graphql(demographic: str, geo_level: str, category: TOPIC_CATEGORY_TYPE):
    """
    Fetches data from AmericasHealthRankings GraphQL API.

    Parameters:
        demographic (str): One of 'all', 'age', 'race_and_ethnicity', 'sex'.
        geo_level (str): The geographic level of the data (e.g., 'national', 'state').
        category (str): The topic category of the data topics to fetch.

    Returns:
        a list containing the data retrieved from the API.
    """
    measure_ids = get_measure_ids('all', category) + get_measure_ids(demographic, category)
    results = []
    state_filter = '{eq: "ALL"}' if geo_level == NATIONAL_LEVEL else '{neq: "ALL"}'

    if not ahr_api_key:
        raise ValueError("No API key found. Please set the AHR_API_KEY environment variable.")

    for measure_id in measure_ids:
        graphql_query = f"""
        query getDatum {{
          measure_A(metricId: {measure_id}) {{
            data(where: {{state: {state_filter}}}) {{
              endDate
              state
              value
              measure {{
                name
              }}
            }}
          }}
        }}
        """

        response = requests.post(GRAPHQL_URL, json={'query': graphql_query}, headers=GRAPHQL_HEADERS, timeout=300)

        if response.status_code == 200:
            results.append(response.json().get('data')['measure_A'])

        else:
            print(f"Query failed to run with a {response.status_code} for metricId: {measure_id}")

    return results


def graphql_response_to_dataframe(response_data):
    """
    Converts a GraphQL API response containing nested data into a flattened Pandas DataFrame.

    Args:
    - response_data (list): The GraphQL API response data.
    - geo_level (str): The geographic level of the data (e.g., 'national', 'state').

    Returns:
    - pd.DataFrame: A Pandas DataFrame containing the flattened data.

    The function flattens the nested response_data structure, extracts relevant fields,
    and creates a DataFrame. It also standardizes the state codes and filters the data
    based on the geographic level.
    """
    flattened_data = []

    for dataset in response_data:
        for row in dataset['data']:
            time_period = row['endDate'][:4]
            measure = row['measure']['name']
            state_postal = row['state']
            value = row['value']

            flattened_data.append(
                {
                    std_col.TIME_PERIOD_COL: time_period,
                    'measure': measure,
                    std_col.STATE_POSTAL_COL: state_postal,
                    'value': value,
                }
            )

    df = pd.DataFrame(flattened_data)
    df[std_col.STATE_POSTAL_COL] = df[std_col.STATE_POSTAL_COL].replace(AHR_US, US_ABBR)

    return df
