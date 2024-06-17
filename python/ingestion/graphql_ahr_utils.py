import json
import os
import ingestion.standardized_columns as std_col
import requests

ahr_api_key = os.getenv("AHR_API_KEY")


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
    'Non-Medical Drug Use - Past Year': 'non_medical_drug_use_per_100k',
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


def fetch_ahr_data_from_graphql():
    """
    Fetches data from AmericasHealthRankings GraphQL API.

    Parameters:
        query (str): The GraphQL query to be executed.
        variables (dict): Variables to be passed with the query.
    Returns:
        a dictionary containing the data retrieved from the API.
    """

    graphql_url = 'https://api.americashealthrankings.org/graphql'
    headers = {'Content-Type': 'application/json', 'x-api-key': ahr_api_key}
    all_responses = []

    query = """
    query Data_A($where: MeasureFilterInput_A) {
        measures_A(where: $where) {
            data {
                endDate
                state
                value
                measure {
                    name
                }
            }
        }
    }
    """

    descriptions_list = [
        'asthma',
        'cost',
        'angina or coronary heart disease, a heart attack or myocardial infarction, or a stroke',
        'kidney disease',
        'chronic obstructive pulmonary disease',
        'depression',
        'diabetes',
        'binge drinking',
        'mental health',
        'Discharges following hospitalization',
        'prescription drugs non-medically',
        "self-harm",
        'presidential national election',
    ]

    # Iterate over each description in the list
    for description in descriptions_list:
        variables_str = f"""
        {{
            "where": {{
                "description": {{
                    "contains": "{description}"
                }}
            }}
        }}
        """
        variables = json.loads(variables_str)
        graphql_request = {'query': query, 'variables': variables}
        response = requests.post(graphql_url, json=graphql_request, headers=headers, timeout=10)

        if response.status_code == 200:
            # Collect each successful responses
            all_responses.append(response.json().get('data')['measures_A'])
        else:
            raise requests.exceptions.HTTPError(f"HTTP Error: {response.status_code}")

    return all_responses
