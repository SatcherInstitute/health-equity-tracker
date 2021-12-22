from ingestion.constants import HealthInsurancePopulation, Sex, PovertyPopulation
import re
import requests


class MetadataKey:
    RACE = "race"
    SEX = "sex"
    INCOME = "income"
    AGE = "age"
    POPULATION = "population"


# Regex and builder functions for parsing the ACS labels into usable metadata.
REGEX_METADATA_LIBRARY = {
    r"under (\d+) years": lambda matches: {MetadataKey.AGE: f"0-{int(matches[0])-1}"},
    r"(\d+) to (\d+) years": lambda matches: {
        MetadataKey.AGE: f"{matches[0]}-{matches[1]}"
    },
    r"(\d+) years and over": lambda matches: {MetadataKey.AGE: f"{matches[0]}+"},
    r"^(\d+) years": lambda matches: {MetadataKey.AGE: f"{matches[0]}"},
    r"(\d+) and (\d+) years": lambda matches: {
        MetadataKey.AGE: f"{matches[0]}-{matches[1]}"
    },
    r"\$(\d+,\d{3}) or more": lambda matches: {MetadataKey.INCOME: f"${matches[0]}+"},
    r"\$(\d+,\d{3}) to \$(\d+,\d{3})": lambda matches: {
        MetadataKey.INCOME: f"${matches[0]}-${matches[1]}"
    },
    r"Less than \$(\d+,\d{3})": lambda matches: {
        MetadataKey.INCOME: f"$0-${matches[0]}"
    },
    r"Female": lambda matches: {MetadataKey.SEX: Sex.FEMALE},
    r"Male": lambda matches: {MetadataKey.SEX: Sex.MALE},
    r"With health insurance coverage": lambda matches: {
        MetadataKey.POPULATION: HealthInsurancePopulation.WITH
    },
    r"No health insurance coverage": lambda matches: {
        MetadataKey.POPULATION: HealthInsurancePopulation.WITHOUT
    },
    r"Income in the past 12 months below poverty level:": lambda matches: {
        MetadataKey.POPULATION: PovertyPopulation.BELOW
    },
    r"Income in the past 12 months at or above poverty level:": lambda matches: {
        MetadataKey.POPULATION: PovertyPopulation.ABOVE
    },
}


"""
    Loops over the trimmed metadata, uses the regex mapping to convert the label into metadata object.
    Race metadata is pulled from the parent group by using reverse lookup on the acs key

    ex input:
        {"label": Estimate!!Total: !!Householder 25 to 44 years: !!$125, 000 to $149, 999}
    ex result:
    "B19037A_033E": {
        "race": "Hispanic or Latino",
        "age": "25-44",
        "income": "$125,000-$149,999"
    }
"""


def parseMetadata(
    raw_metadata_trimmed, required_keys, metadataInitializer=lambda grp: {}
):
    parsed = {}
    for k, v in raw_metadata_trimmed.items():
        label = v["label"]
        parts = label.split("!!")
        label_meta = metadataInitializer(k)

        for part in parts:
            if part == "Estimate" or part == "Total:":
                continue

            regex_match = False
            for regex, callback in REGEX_METADATA_LIBRARY.items():
                match = re.search(regex, part, re.IGNORECASE)
                if match:
                    groups = match.groups()
                    partial_meta = callback(groups)
                    label_meta.update(partial_meta)
                    regex_match = True
                    break
            if not regex_match:
                raise Exception(f"No Regex handler for part: {part}")

        if set(required_keys).issubset(label_meta.keys()):
            parsed[k] = label_meta

    return parsed


# Loops over the returned metadata variables and throws out the ones not in the
# MEDIAN_INCOME_BY_RACE_GROUPS list.
def trimMetadata(raw_metadata, groups_to_include):
    trimmed = {}
    for metadata_key in raw_metadata:
        parts = metadata_key.split("_")

        if len(parts) < 2:
            continue

        metadata_group = parts[0]
        metadata_concept = parts[1]

        if metadata_concept.endswith("E") and metadata_group in groups_to_include:
            trimmed[metadata_key] = raw_metadata[metadata_key]

    return trimmed


def get_acs_data_from_variables(base_url, params):
    resp = requests.get(base_url, params=params)
    print(f"[{resp.status_code}] {resp.request.url}")
    return resp.json()


# Gets the query params for the ACS Data Request
def get_params(group, is_county):
    geo = "county" if is_county else "state"
    return f"get=group({group})&for={geo}"
