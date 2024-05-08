import ingestion.standardized_columns as std_col


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


AHR_BASE_MEASURES = {
    'Voter Participation (Presidential)': 'voter_participation_pct_rate',
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
}

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
