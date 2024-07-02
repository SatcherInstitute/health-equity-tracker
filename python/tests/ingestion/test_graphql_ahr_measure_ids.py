import json
import os

THIS_DIR = os.path.dirname(os.path.abspath(__file__))
BASE_DIR = os.path.join(THIS_DIR, os.pardir, os.pardir, 'ingestion')
CONFIG_FILE_PATH = os.path.join(BASE_DIR, 'graphql_ahr_measure_ids.json')

with open(CONFIG_FILE_PATH, 'r') as file:
    data = json.load(file)


def get_measure_ids(demographic: str, measure_name: str, flatten=False):
    """
    Retrieve measure IDs based on demographic and measure name.

    Args:
    demographic (str): One of 'all', 'age', 'race_and_ethnicity', 'sex'.
    measure_name (str): The name of the measure (e.g., 'Asthma', 'Diabetes').
    flatten (bool): Whether to flatten the list of IDs if the result is a dictionary.

    Returns:
    list: A list of measure IDs.
    """
    if demographic in data:
        for measure in data[demographic]:
            if measure['measure'] == measure_name:
                ids = measure.get('ids') or measure.get('demographics')
                if flatten and isinstance(ids, dict):
                    # Flatten the dictionary values into a single list
                    return [item for sublist in ids.values() for item in sublist]
                return ids
    return None


def run_test(demographic, measure_name, expected_ids, flatten=False):
    actual_ids = get_measure_ids(demographic, measure_name, flatten=flatten)
    assert actual_ids == expected_ids


def test_config_all():
    expected_all_asthma_ids = ["16388"]
    run_test('all', 'Asthma', expected_all_asthma_ids)


def test_config_age():
    expected_age_diabetes_ids = ["408", "406", "407"]
    run_test('age', 'Diabetes', expected_age_diabetes_ids, flatten=True)


def test_config_race_and_ethnicity():
    expected_race_preventable_hosp_ids = [
        "16448",
        "18326",
        "16447",
        "18325",
        "16446",
        "18324",
        "16449",
        "18327",
        "16445",
        "18323",
        "16444",
        "18322",
    ]
    run_test('race_and_ethnicity', 'Preventable Hospitalizations', expected_race_preventable_hosp_ids, flatten=True)


def test_config_sex():
    expected_sex_suicide_ids = ["1273", "1272"]
    run_test('sex', 'Suicide', expected_sex_suicide_ids, flatten=True)
