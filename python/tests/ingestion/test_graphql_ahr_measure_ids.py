from ingestion.graphql_ahr_utils import get_measure_ids

test_data = {
    "all": [
        {"measure": "Asthma", "ids": ["16388"]},
        {"measure": "Avoided Care Due to Cost", "ids": ["16348", "18353"]},
        {"measure": "Diabetes", "ids": ["115", "176"]},
    ],
    "age": [
        {"measure": "Asthma", "demographics": {"Age 65+": ["16374"], "Ages 18-44": ["16372"], "Ages 45-64": ["16373"]}},
        {
            "measure": "Avoided Care Due to Cost",
            "demographics": {
                "Age 65+": ["15969", "16369", "18358", "18389"],
                "Ages 18-44": ["16367", "18356"],
                "Ages 45-64": ["16368", "18357"],
            },
        },
    ],
    "race_and_ethnicity": [
        {"measure": "Asthma", "demographics": {"Black": ["16376", "19988"], "White": ["16375", "19987"]}},
        {"measure": "Diabetes", "demographics": {"Black": ["410", "432", "19743"], "White": ["409", "431", "19742"]}},
    ],
    "sex": [
        {"measure": "Asthma", "demographics": {"Female": ["16371"], "Male": ["16370"]}},
        {"measure": "Diabetes", "demographics": {"Female": ["405", "427"], "Male": ["404", "426"]}},
    ],
}


def test_all_demographic():
    result = get_measure_ids("all", data=test_data)
    expected_ids = ["16388", "16348", "18353", "115", "176"]
    assert result == expected_ids


def test_age_demographic():
    result = get_measure_ids("age", data=test_data)
    expected_ids = ["16374", "16372", "16373", "15969", "16369", "18358", "18389", "16367", "18356", "16368", "18357"]
    assert result == expected_ids


def test_race_and_ethnicity_demographic():
    result = get_measure_ids("race_and_ethnicity", data=test_data)
    expected_ids = ["16376", "19988", "16375", "19987", "410", "432", "19743", "409", "431", "19742"]
    assert result == expected_ids


def test_sex_demographic():
    result = get_measure_ids("sex", data=test_data)
    expected_ids = ["16371", "16370", "405", "427", "404", "426"]
    assert result == expected_ids
