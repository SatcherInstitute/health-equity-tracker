from ingestion.het_types import GEO_TYPE, PHRMA_BREAKDOWN_TYPE_OR_ALL
import ingestion.standardized_columns as std_col
from ingestion.constants import STATE_LEVEL, COUNTY_LEVEL, NATIONAL_LEVEL
import pandas as pd
from typing import Dict

TMP_ALL = 'all'
PHRMA_DIR = 'phrma'

ADHERENCE = 'adherence'
BENEFICIARIES = 'beneficiaries'

# PHRMA BRFSS CONSTANTS
COUNT_TOTAL_LOWER = "total_bene"
COUNT_YES_LOWER = "bene_yes"
COUNT_NO_LOWER = "bene_no"
ADHERENCE_RATE_LOWER = "bene_yes_pct"
RACE_NAME_LOWER = "race_name"
AGE_GROUP_LOWER = "age_group"
INSURANCE_STATUS_LOWER = "insurance_status"
INCOME_GROUP_LOWER = "income_group"
EDUCATION_GROUP_LOWER = "education_group"

SCREENING_ADHERENT = 'adherent'
SCREENING_ELIGIBLE = 'eligible'


# PHRMA CMS CONSTANTS
COUNT_TOTAL = "TOTAL_BENE"
COUNT_YES = "BENE_YES"
MEDICARE_DISEASE_COUNT = "BENE_N"
MEDICARE_POP_COUNT = "TOTAL_N"
ADHERENCE_RATE = "BENE_YES_PCT"
PER_100K = "PER_100K"
STATE_NAME = "STATE_NAME"
COUNTY_NAME = "COUNTY_NAME"
STATE_FIPS = "STATE_FIPS"
COUNTY_FIPS = "COUNTY_FIPS"
ENTLMT_RSN_CURR = "ENTLMT_RSN_CURR"
LIS = "LIS"
RACE_NAME = "RACE_NAME"
AGE_GROUP = "AGE_GROUP"
SEX_NAME = "SEX_NAME"

PHRMA_PCT_CONDITIONS = [
    std_col.ARV_PREFIX,
    std_col.BETA_BLOCKERS_PREFIX,
    std_col.CCB_PREFIX,
    std_col.DOAC_PREFIX,
    std_col.BB_AMI_PREFIX,
    std_col.RASA_PREFIX,
    std_col.STATINS_PREFIX,
    std_col.ANTI_PSYCHOTICS_PREFIX,
]

PHRMA_100K_CONDITIONS = [
    std_col.AMI_PREFIX,
    std_col.PHRMA_HIV_PREFIX,
    std_col.SCHIZOPHRENIA_PREFIX,
]

PHRMA_CANCER_PCT_CONDITIONS = ["Breast", "Cervical", "Colorectal", "Lung", "Prostate"]

BREAKDOWN_TO_STANDARD_BY_COL = {
    std_col.AGE_COL: {
        "_21_24": "21-24",
        "_25_29": "25-29",
        "_30_34": "30-34",
        "_35_39": "35-39",
        "_40_44": "40-44",
        "_45_49": "45-49",
        "_50_54": "50-54",
        "_55_59": "55-59",
        "_60_64": "60-64",
        "_60_65": "60-65",
        "_65_69": "65-69",
        "_70_74": "70-74",
        "_70_75": "70-75",
        "_75_79": "75-79",
        "_18-39": "18-39",
        "_40-64": "40-64",
        "_80-84": "80-84",
        "_85+": "85+",
    },
    std_col.RACE_CATEGORY_ID_COL: {
        'American Indian or Alaskan Native': std_col.Race.AIAN_NH.value,
        'Asian': std_col.Race.ASIAN_NH.value,
        'Black': std_col.Race.BLACK_NH.value,
        'Hispanic': std_col.Race.HISP.value,
        'Multiracial': std_col.Race.MULTI_NH.value,
        'Native Hawaiian or other Pacific Islander': std_col.Race.NHPI_NH.value,
        'White': std_col.Race.WHITE_NH.value,
        'Unknown': std_col.Race.UNKNOWN.value,
        'American Indian / Alaska Native': std_col.Race.AIAN_NH.value,
        'Asian/Pacific Islander': std_col.Race.API_NH.value,
        'Black or African-American': std_col.Race.BLACK_NH.value,
        'Other': std_col.Race.OTHER_NONSTANDARD_NH.value,
        'Non-Hispanic White': std_col.Race.WHITE_NH.value,
    },
    std_col.INSURANCE_COL: {
        "Have some form of insurance": "Insured",
        "Do not have some form of health insurance": "Not insured",
        "Don´t know, refused or missing insurance response": "Unknown",
    },
    std_col.EDUCATION_COL: {
        "Did not graduate High School": "Did not graduate high school",
        "Graduated High School": "Graduated high school",
        "Attended College or Technical School": "Attended college or technical school",
        "Graduated from College or Technical School": "Graduated from college or technical school",
        "Don’t know/Not sure/Missing": "Unknown",
    },
    std_col.INCOME_COL: {
        "Less than $15,000": "Less than $15,000",
        "$15,000 to < $25,000": "$15,000 to < $25,000",
        "$25,000 to < $35,000": "$25,000 to < $35,000",
        "$35,000 to < $50,000": "$35,000 to < $50,000",
        "$50,000 to < $75,000": "$50,000 to < $75,000",
        "$75,000 to < $100,000": "$75,000 to < $100,000",
        "$100,000 to < $200,000": "$100,000 to < $200,000",
        "$200,000 or more": "$200,000 or more",
        "Don’t know/Not sure/Missing": "Unknown",
    },
    std_col.LIS_COL: {
        "Yes": "Receiving low income subsidy (LIS)",
        "No": "Not receiving low income subsidy (LIS)",
    },
    std_col.ELIGIBILITY_COL: {
        "Aged": "Eligible due to age",
        "Disabled": "Eligible due to disability",
        "ESRD": "Eligible due to end-stage renal disease (ESRD)",
        "Disabled and ESRD": "Eligible due to disability and end-stage renal disease (ESRD)",
    },
    # SEX source groups already match needed HET groups
}


def get_sheet_name(geo_level: GEO_TYPE, breakdown: PHRMA_BREAKDOWN_TYPE_OR_ALL) -> str:
    """geo_level: string equal to `county`, `national`, or `state`
    breakdown: string demographic breakdown type
    return: a string sheet name based on the provided args"""

    sheet_map = {
        (TMP_ALL, NATIONAL_LEVEL): "US",
        (TMP_ALL, STATE_LEVEL): "State",
        (TMP_ALL, COUNTY_LEVEL): "County",
        (std_col.LIS_COL, NATIONAL_LEVEL): "LIS_US",
        (std_col.LIS_COL, STATE_LEVEL): "LIS_State",
        (std_col.LIS_COL, COUNTY_LEVEL): "LIS_County",
        (std_col.ELIGIBILITY_COL, NATIONAL_LEVEL): "Elig_US",
        (std_col.ELIGIBILITY_COL, STATE_LEVEL): "Elig_State",
        (std_col.ELIGIBILITY_COL, COUNTY_LEVEL): "Elig_County",
        (std_col.RACE_OR_HISPANIC_COL, NATIONAL_LEVEL): "Race_US",
        (std_col.RACE_OR_HISPANIC_COL, STATE_LEVEL): "Race_State",
        (std_col.RACE_OR_HISPANIC_COL, COUNTY_LEVEL): "Race_County",
        (std_col.SEX_COL, NATIONAL_LEVEL): "Sex_US",
        (std_col.SEX_COL, STATE_LEVEL): "Sex_State",
        (std_col.SEX_COL, COUNTY_LEVEL): "Sex_County",
        (std_col.AGE_COL, NATIONAL_LEVEL): "Age_US",
        (std_col.AGE_COL, STATE_LEVEL): "Age_State",
        (std_col.AGE_COL, COUNTY_LEVEL): "Age_County",
        (std_col.EDUCATION_COL, NATIONAL_LEVEL): "Education_US",
        (std_col.EDUCATION_COL, STATE_LEVEL): "Education_State",
        (std_col.INSURANCE_COL, NATIONAL_LEVEL): "Insurance_US",
        (std_col.INSURANCE_COL, STATE_LEVEL): "Insurance_State",
        (std_col.INCOME_COL, NATIONAL_LEVEL): "Income_US",
        (std_col.INCOME_COL, STATE_LEVEL): "Income_State",
    }

    return sheet_map[(breakdown, geo_level)]


def rename_cols(
    df: pd.DataFrame,
    geo_level: GEO_TYPE,
    breakdown: PHRMA_BREAKDOWN_TYPE_OR_ALL,
    condition: str,
) -> pd.DataFrame:
    """Renames columns based on the demo/geo breakdown"""

    rename_cols_map: Dict[str, str] = {
        COUNT_YES: f'{condition}_{COUNT_YES}',
        COUNT_TOTAL: f'{condition}_{COUNT_TOTAL}',
        ADHERENCE_RATE: f'{condition}_{ADHERENCE_RATE}',
        MEDICARE_DISEASE_COUNT: f'{condition}_{MEDICARE_DISEASE_COUNT}',
        PER_100K: f'{condition}_{PER_100K}',
        COUNT_YES_LOWER: f'{condition}_{COUNT_YES_LOWER}',
        COUNT_TOTAL_LOWER: f'{condition}_{COUNT_TOTAL_LOWER}',
        ADHERENCE_RATE_LOWER: f'{condition}_{ADHERENCE_RATE_LOWER}',
    }

    if geo_level == COUNTY_LEVEL:
        rename_cols_map[COUNTY_FIPS] = std_col.COUNTY_FIPS_COL

    if geo_level in [STATE_LEVEL, NATIONAL_LEVEL]:
        rename_cols_map[STATE_FIPS] = std_col.STATE_FIPS_COL

    if breakdown == std_col.RACE_OR_HISPANIC_COL:
        rename_cols_map[RACE_NAME] = std_col.RACE_CATEGORY_ID_COL
        rename_cols_map[RACE_NAME_LOWER] = std_col.RACE_CATEGORY_ID_COL

    if breakdown == std_col.AGE_COL:
        rename_cols_map[AGE_GROUP] = std_col.AGE_COL
        rename_cols_map[AGE_GROUP_LOWER] = std_col.AGE_COL

    if breakdown == std_col.SEX_COL:
        rename_cols_map[SEX_NAME] = std_col.SEX_COL

    if breakdown == std_col.ELIGIBILITY_COL:
        rename_cols_map[ENTLMT_RSN_CURR] = std_col.ELIGIBILITY_COL

    if breakdown == std_col.LIS_COL:
        rename_cols_map[LIS] = std_col.LIS_COL

    if breakdown == std_col.INSURANCE_COL:
        rename_cols_map[INSURANCE_STATUS_LOWER] = std_col.INSURANCE_COL

    if breakdown == std_col.EDUCATION_COL:
        rename_cols_map[EDUCATION_GROUP_LOWER] = std_col.EDUCATION_COL

    if breakdown == std_col.INCOME_COL:
        rename_cols_map[INCOME_GROUP_LOWER] = std_col.INCOME_COL

    df = df.rename(columns=rename_cols_map)

    # only keep the medicare/medicaid raw population for one of the 100k conditions
    if condition in PHRMA_100K_CONDITIONS and condition != std_col.AMI_PREFIX:
        df = df.drop(columns=[MEDICARE_POP_COUNT])

    return df
