from ingestion import standardized_columns as std_col

SELECT_SHEET = "Select Measure Data"
RANKED_SHEET = "Ranked Measure Data"
ADDITIONAL_SHEET = "Additional Measure Data"

# Race mapping configurations
DEFAULT_RACE_MAP = {
    "(AIAN)": std_col.Race.AIAN_NH.value,
    "(Asian)": std_col.Race.API_NH.value,
    "(Black)": std_col.Race.BLACK_NH.value,
    "(Hispanic)": std_col.Race.HISP.value,
    "(White)": std_col.Race.WHITE_NH.value,
}

RACE_FEW_MAP = {
    "(Black)": std_col.Race.BLACK_NH.value,
    "(Hispanic)": std_col.Race.HISP.value,
    "(White)": std_col.Race.WHITE_NH.value,
}

RACE_LOWERCASE_WHITE_MAP = {
    "(AIAN)": std_col.Race.AIAN_NH.value,
    "(Asian)": std_col.Race.API_NH.value,
    "(Black)": std_col.Race.BLACK_NH.value,
    "(Hispanic)": std_col.Race.HISP.value,
    "(white)": std_col.Race.WHITE_NH.value,  # lowercase 'w'
}

RACE_NON_HISPANIC_MAP = {
    "(Hispanic (all races))": std_col.Race.HISP.value,
    "(Non-Hispanic AIAN)": std_col.Race.AIAN_NH.value,
    "(Non-Hispanic Asian)": std_col.Race.ASIAN_NH.value,
    "(Non-Hispanic Black)": std_col.Race.BLACK_NH.value,
    "(Non-Hispanic Native Hawaiian and Other Pacific Islander)": std_col.Race.NHPI_NH.value,
    "(Non-Hispanic 2+ races)": std_col.Race.MULTI_NH.value,
    "(Non-Hispanic White)": std_col.Race.WHITE_NH.value,
}

# Maps (year, sheet_name) to the race mapping to use
CHR_RACE_MAPS = {
    ("2019", RANKED_SHEET): RACE_FEW_MAP,
    ("2022", RANKED_SHEET): RACE_LOWERCASE_WHITE_MAP,
    ("2022", ADDITIONAL_SHEET): RACE_LOWERCASE_WHITE_MAP,
    ("2024", ADDITIONAL_SHEET): RACE_NON_HISPANIC_MAP,
    ("2025", ADDITIONAL_SHEET): RACE_NON_HISPANIC_MAP,
}


def get_race_map(year: str, sheet_name: str) -> dict[str, str]:
    """
    Returns a dict of CHR source race names to the HET standard race code.
    Some source years/sheets use inconsistent labels for the column names.

    Args:
        year: CHR release year (e.g., "2025")
        sheet_name: Either SELECT_SHEET, RANKED_SHEET, or ADDITIONAL_SHEET

    Returns:
        dict: Mapping of source race suffixes (e.g., "(White)") to HET race codes
    """
    # Normalize sheet name for lookup
    normalized_sheet = SELECT_SHEET if sheet_name in [SELECT_SHEET, RANKED_SHEET] else sheet_name

    return CHR_RACE_MAPS.get((year, normalized_sheet), DEFAULT_RACE_MAP)


# Key: (chr_release_year, sheet_name)
# Value: dict of {
# 	topic_prefix: {
# 		source_all_col,
# 		primary_data_year (from BRFSS or other original source),
# 		source_race_prefix (optional)
# 	}
# }
CHR_METRIC_CONFIG = {
    ("2011", ADDITIONAL_SHEET): {
        std_col.DIABETES_PREFIX: {
            "source_all_col": "Diabetes",
            "primary_data_year": "2008",
        },
    },
    ("2012", SELECT_SHEET): {
        std_col.EXCESSIVE_DRINKING_PREFIX: {
            "source_all_col": "% Excessive Drinking",
            "primary_data_year": "2010",
        },
    },
    ("2012", ADDITIONAL_SHEET): {
        std_col.DIABETES_PREFIX: {
            "source_all_col": "% diabetic",
            "primary_data_year": "2009",
        },
    },
    ("2013", SELECT_SHEET): {
        std_col.EXCESSIVE_DRINKING_PREFIX: {
            "source_all_col": "% Excessive Drinking",
            "primary_data_year": "2011",
        },
    },
    ("2013", ADDITIONAL_SHEET): {
        std_col.DIABETES_PREFIX: {
            "source_all_col": "% diabetic",
            "primary_data_year": "2009",
        },
    },
    ("2014", SELECT_SHEET): {
        std_col.EXCESSIVE_DRINKING_PREFIX: {
            "source_all_col": "% Excessive Drinking",
            "primary_data_year": "2012",
        },
    },
    ("2014", ADDITIONAL_SHEET): {
        std_col.DIABETES_PREFIX: {
            "source_all_col": "% Diabetic",
            "primary_data_year": "2010",
        },
    },
    ("2015", SELECT_SHEET): {
        std_col.EXCESSIVE_DRINKING_PREFIX: {
            "source_all_col": "% Excessive Drinking",
            "primary_data_year": "2012",
        },
        std_col.PREVENTABLE_HOSP_PREFIX: {
            "source_all_col": "Preventable Hosp. Rate",
            "primary_data_year": "2012",
        },
    },
    ("2015", ADDITIONAL_SHEET): {
        std_col.DIABETES_PREFIX: {
            "source_all_col": "% Diabetic",
            "primary_data_year": "2011",
        },
    },
    ("2016", SELECT_SHEET): {
        std_col.EXCESSIVE_DRINKING_PREFIX: {
            "source_all_col": "% Excessive Drinking",
            "primary_data_year": "2014",
        },
        std_col.PREVENTABLE_HOSP_PREFIX: {
            "source_all_col": "Preventable Hosp. Rate",
            "primary_data_year": "2013",
        },
    },
    ("2016", ADDITIONAL_SHEET): {
        std_col.DIABETES_PREFIX: {
            "source_all_col": "% Diabetic",
            "primary_data_year": "2012",
        },
        std_col.FREQUENT_MENTAL_DISTRESS_PREFIX: {
            "source_all_col": "% Frequent Mental Distress",
            "primary_data_year": "2014",
        },
    },
    ("2017", SELECT_SHEET): {
        std_col.EXCESSIVE_DRINKING_PREFIX: {
            "source_all_col": "% Excessive Drinking",
            "primary_data_year": "2015",
        },
        std_col.PREVENTABLE_HOSP_PREFIX: {
            "source_all_col": "Preventable Hosp. Rate",
            "primary_data_year": "2014",
        },
    },
    ("2017", ADDITIONAL_SHEET): {
        std_col.DIABETES_PREFIX: {
            "source_all_col": "% Diabetic",
            "primary_data_year": "2013",
        },
        std_col.FREQUENT_MENTAL_DISTRESS_PREFIX: {
            "source_all_col": "% Frequent Mental Distress",
            "primary_data_year": "2015",
        },
        std_col.GUN_DEATHS_PREFIX: {
            "source_all_col": "Firearm Fatalities Rate",
            "primary_data_year": "2015",
        },
    },
    ("2018", SELECT_SHEET): {
        std_col.EXCESSIVE_DRINKING_PREFIX: {
            "source_all_col": "% Excessive Drinking",
            "primary_data_year": "2016",
        },
        std_col.PREVENTABLE_HOSP_PREFIX: {
            "source_all_col": "Preventable Hosp. Rate",
            "primary_data_year": "2015",
        },
    },
    ("2018", ADDITIONAL_SHEET): {
        std_col.DIABETES_PREFIX: {
            "source_all_col": "% Diabetic",
            "primary_data_year": "2014",
        },
        std_col.FREQUENT_MENTAL_DISTRESS_PREFIX: {
            "source_all_col": "% Frequent Mental Distress",
            "primary_data_year": "2016",
        },
        std_col.GUN_DEATHS_PREFIX: {
            "source_all_col": "Firearm Fatalities Rate",
            "primary_data_year": "2016",
        },
    },
    ("2019", SELECT_SHEET): {
        std_col.EXCESSIVE_DRINKING_PREFIX: {
            "source_all_col": "% Excessive Drinking",
            "primary_data_year": "2016",
        },
        std_col.PREVENTABLE_HOSP_PREFIX: {
            "source_all_col": "Preventable Hosp. Rate",
            "source_race_prefix": "Preventable Hosp. Rate",
            "primary_data_year": "2016",
        },
    },
    ("2019", ADDITIONAL_SHEET): {
        std_col.DIABETES_PREFIX: {
            "source_all_col": "% Diabetic",
            "primary_data_year": "2015",
        },
        std_col.FREQUENT_MENTAL_DISTRESS_PREFIX: {
            "source_all_col": "% Frequent Mental Distress",
            "primary_data_year": "2016",
        },
        std_col.GUN_DEATHS_PREFIX: {
            "source_all_col": "Firearm Fatalities Rate",
            "primary_data_year": "2017",
        },
    },
    ("2020", SELECT_SHEET): {
        std_col.EXCESSIVE_DRINKING_PREFIX: {
            "source_all_col": "% Excessive Drinking",
            "primary_data_year": "2017",
        },
        std_col.PREVENTABLE_HOSP_PREFIX: {
            "source_all_col": "Preventable Hospitalization Rate",
            "source_race_prefix": "Preventable Hosp. Rate",
            "primary_data_year": "2017",
        },
    },
    ("2020", ADDITIONAL_SHEET): {
        std_col.DIABETES_PREFIX: {
            "source_all_col": "% Adults with Diabetes",
            "primary_data_year": "2016",
        },
        std_col.FREQUENT_MENTAL_DISTRESS_PREFIX: {
            "source_all_col": "% Frequent Mental Distress",
            "primary_data_year": "2017",
        },
        std_col.GUN_DEATHS_PREFIX: {
            "source_all_col": "Firearm Fatalities Rate",
            "source_race_prefix": "Firearm Fatalities Rate",
            "primary_data_year": "2018",
        },
        std_col.SUICIDE_PREFIX: {
            "source_all_col": "Crude Rate",
            "source_race_prefix": "Suicide Rate",
            "primary_data_year": "2018",
        },
    },
    ("2021", SELECT_SHEET): {
        std_col.EXCESSIVE_DRINKING_PREFIX: {
            "source_all_col": "% Excessive Drinking",
            "primary_data_year": "2018",
        },
        std_col.PREVENTABLE_HOSP_PREFIX: {
            "source_all_col": "Preventable Hospitalization Rate",
            "source_race_prefix": "Preventable Hosp. Rate",
            "primary_data_year": "2018",
        },
    },
    ("2021", ADDITIONAL_SHEET): {
        std_col.DIABETES_PREFIX: {
            "source_all_col": "% Adults with Diabetes",
            "primary_data_year": "2017",
        },
        std_col.FREQUENT_MENTAL_DISTRESS_PREFIX: {
            "source_all_col": "% Frequent Mental Distress",
            "primary_data_year": "2018",
        },
        std_col.GUN_DEATHS_PREFIX: {
            "source_all_col": "Firearm Fatalities Rate",
            "source_race_prefix": "Firearm Fatalities Rate",
            "primary_data_year": "2019",
        },
        std_col.SUICIDE_PREFIX: {
            "source_all_col": "Crude Rate",
            "source_race_prefix": "Suicide Rate",
            "primary_data_year": "2019",
        },
    },
    ("2022", SELECT_SHEET): {
        std_col.EXCESSIVE_DRINKING_PREFIX: {
            "source_all_col": "% Excessive Drinking",
            "primary_data_year": "2019",
        },
        std_col.PREVENTABLE_HOSP_PREFIX: {
            "source_all_col": "Preventable Hospitalization Rate",
            "source_race_prefix": "Preventable Hosp. Rate",
            "primary_data_year": "2019",
        },
    },
    ("2022", ADDITIONAL_SHEET): {
        std_col.DIABETES_PREFIX: {
            "source_all_col": "% Adults with Diabetes",
            "primary_data_year": "2019",
        },
        std_col.FREQUENT_MENTAL_DISTRESS_PREFIX: {
            "source_all_col": "% Frequent Mental Distress",
            "primary_data_year": "2019",
        },
        std_col.GUN_DEATHS_PREFIX: {
            "source_all_col": "Firearm Fatalities Rate",
            "source_race_prefix": "Firearm Fatalities Rate",
            "primary_data_year": "2020",
        },
        std_col.SUICIDE_PREFIX: {
            "source_all_col": "Crude Rate",
            "source_race_prefix": "Suicide Rate",
            "primary_data_year": "2020",
        },
    },
    ("2023", SELECT_SHEET): {
        std_col.EXCESSIVE_DRINKING_PREFIX: {
            "source_all_col": "% Excessive Drinking",
            "primary_data_year": "2020",
        },
        std_col.PREVENTABLE_HOSP_PREFIX: {
            "source_all_col": "Preventable Hospitalization Rate",
            "source_race_prefix": "Preventable Hosp. Rate",
            "primary_data_year": "2020",
        },
    },
    ("2023", ADDITIONAL_SHEET): {
        std_col.DIABETES_PREFIX: {
            "source_all_col": "% Adults with Diabetes",
            "primary_data_year": "2020",
        },
        std_col.FREQUENT_MENTAL_DISTRESS_PREFIX: {
            "source_all_col": "% Frequent Mental Distress",
            "primary_data_year": "2020",
        },
        std_col.GUN_DEATHS_PREFIX: {
            "source_all_col": "Firearm Fatalities Rate",
            "source_race_prefix": "Firearm Fatalities Rate",
            "primary_data_year": "2020",
        },
        std_col.SUICIDE_PREFIX: {
            "source_all_col": "Crude Rate",
            "source_race_prefix": "Suicide Rate",
            "primary_data_year": "2020",
        },
        std_col.VOTER_PARTICIPATION_PREFIX: {
            "source_all_col": "% Voter Turnout",
            "primary_data_year": "2020",
        },
    },
    ("2024", SELECT_SHEET): {
        std_col.EXCESSIVE_DRINKING_PREFIX: {
            "source_all_col": "% Excessive Drinking",
            "primary_data_year": "2021",
        },
        std_col.PREVENTABLE_HOSP_PREFIX: {
            "source_all_col": "Preventable Hospitalization Rate",
            "source_race_prefix": "Preventable Hosp. Rate",
            "primary_data_year": "2021",
        },
    },
    ("2024", ADDITIONAL_SHEET): {
        std_col.DIABETES_PREFIX: {
            "source_all_col": "% Adults with Diabetes",
            "primary_data_year": "2021",
        },
        std_col.FREQUENT_MENTAL_DISTRESS_PREFIX: {
            "source_all_col": "% Frequent Mental Distress",
            "primary_data_year": "2021",
        },
        std_col.GUN_DEATHS_PREFIX: {
            "source_all_col": "Firearm Fatalities Rate",
            "source_race_prefix": "Firearm Fatalities Rate",
            "primary_data_year": "2021",
        },
        std_col.SUICIDE_PREFIX: {
            "source_all_col": "Crude Rate",
            "source_race_prefix": "Suicide Rate",
            "primary_data_year": "2021",
        },
        std_col.VOTER_PARTICIPATION_PREFIX: {
            "source_all_col": "% Voter Turnout",
            "primary_data_year": "2020",
        },
    },
    ("2025", SELECT_SHEET): {
        std_col.PREVENTABLE_HOSP_PREFIX: {
            "source_all_col": "Preventable Hospitalization Rate",
            "source_race_prefix": "Preventable Hosp. Rate",
            "primary_data_year": "2022",
        },
    },
    ("2025", ADDITIONAL_SHEET): {
        std_col.DIABETES_PREFIX: {
            "source_all_col": "% Adults with Diabetes",
            "primary_data_year": "2022",
        },
        std_col.EXCESSIVE_DRINKING_PREFIX: {
            "source_all_col": "% Excessive Drinking",
            "primary_data_year": "2022",
        },
        std_col.FREQUENT_MENTAL_DISTRESS_PREFIX: {
            "source_all_col": "% Frequent Mental Distress",
            "primary_data_year": "2022",
        },
        std_col.GUN_DEATHS_PREFIX: {
            "source_all_col": "Firearm Fatalities Rate",
            "source_race_prefix": "Firearm Fatalities Rate",
            "primary_data_year": "2022",
        },
        std_col.SUICIDE_PREFIX: {
            "source_all_col": "Crude Rate",
            "source_race_prefix": "Suicide Rate",
            "primary_data_year": "2022",
        },
        std_col.VOTER_PARTICIPATION_PREFIX: {
            "source_all_col": "% Voter Turnout",
            "primary_data_year": "2020",
        },
    },
}


def get_topics_for_sheet_and_year(sheet_name: str, year: str) -> dict[str, dict[str, str]]:
    """
    Returns a mapping of HET topic prefixes to their source column configuration for a specific sheet and year.

    Args:
        sheet_name: Either SELECT_SHEET, RANKED_SHEET, or ADDITIONAL_SHEET
        year: The CHR release year (e.g., "2025")

    Returns:
        dict: {het_prefix: {source_all_col, primary_data_year, source_race_prefix (optional)}}
        Returns empty dict if year/sheet combo not found

    Example:
        >>> get_topics_for_sheet_and_year(ADDITIONAL_SHEET, "2025")
        {
            'diabetes': {'source_all_col': '% Adults with Diabetes', 'primary_data_year': '2022'},
            'excessive_drinking': {'source_all_col': '% Excessive Drinking', 'primary_data_year': '2022'},
            ...
        }
    """
    # Normalize sheet name - 2024+ calls it SELECT_SHEET, earlier years call it RANKED_SHEET
    normalized_sheet = SELECT_SHEET if sheet_name in [SELECT_SHEET, RANKED_SHEET] else sheet_name

    return CHR_METRIC_CONFIG.get((year, normalized_sheet), {})


def get_primary_data_year_for_topic(topic_prefix: str, chr_year: str) -> str | None:
    """
    Returns the primary data year for a specific topic and CHR release year.

    Searches both sheets (Select/Ranked and Additional) for the topic.

    Args:
        topic_prefix: The HET topic prefix (e.g., "diabetes", "excessive_drinking")
        chr_year: The CHR release year (e.g., "2025")

    Returns:
        str: The primary data year (e.g., "2022") or None if topic not found in that year

    Example:
        >>> get_primary_data_year_for_topic("diabetes", "2025")
        "2022"
        >>> get_primary_data_year_for_topic("voter_participation", "2025")
        "2020"
    """
    # Check both possible sheets
    for sheet_name in [SELECT_SHEET, ADDITIONAL_SHEET]:
        topics = get_topics_for_sheet_and_year(sheet_name, chr_year)
        if topic_prefix in topics:
            return topics[topic_prefix]["primary_data_year"]

    return None


def get_all_topic_prefixes() -> list[str]:
    """
    Returns a list of all unique HET topic prefixes across all years.

    Returns:
        list: List of topic prefix strings (e.g., ['diabetes', 'excessive_drinking', ...])

    Example:
        >>> get_all_topic_prefixes()
        ['diabetes', 'excessive_drinking', 'preventable_hospitalizations', ...]
    """
    prefixes = set()
    for topics_dict in CHR_METRIC_CONFIG.values():
        prefixes.update(topics_dict.keys())
    return sorted(list(prefixes))
