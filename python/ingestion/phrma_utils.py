from ingestion.het_types import GEO_TYPE, PHRMA_BREAKDOWN_TYPE_OR_ALL, SEX_RACE_ETH_AGE_TYPE
from ingestion import gcs_to_bq_util, dataset_utils
import ingestion.standardized_columns as std_col
from ingestion.constants import STATE_LEVEL, COUNTY_LEVEL, NATIONAL_LEVEL, US_FIPS
import pandas as pd
from typing import Dict, Literal, cast, List
from ingestion.merge_utils import merge_dfs_list

TMP_ALL = 'all'
PHRMA_DIR = 'phrma'

ADHERENCE = 'adherence'
BENEFICIARIES = 'beneficiaries'

# PHRMA BRFSS CONSTANTS
COUNT_TOTAL_LOWER = "total_bene"
COUNT_YES_LOWER = "bene_yes"
COUNT_NO_LOWER = "bene_no"
ADHERENCE_RATE_LOWER = "bene_yes_pct"
AGE_ADJ_RATE_LOWER = "age_adjusted_pct"
RACE_NAME_LOWER = "race_name"
AGE_GROUP_LOWER = "age_group"
SEX_NAME_LOWER = "sex_name"
INSURANCE_STATUS_LOWER = "insurance_status"
INCOME_GROUP_LOWER = "income_group"
EDUCATION_GROUP_LOWER = "education_group"
STATE_FIPS_LOWER = "state_fips"

SCREENED = 'screened'
SCREENING_ELIGIBLE = 'screening_eligible'


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

PHRMA_MEDICARE_CONDITIONS = [*PHRMA_PCT_CONDITIONS, *PHRMA_100K_CONDITIONS]

PHRMA_CANCER_PCT_CONDITIONS_WITH_SEX_BREAKDOWN = ["Colorectal", "Lung"]
PHRMA_CANCER_PCT_CONDITIONS = ["Breast", "Cervical", "Prostate"] + PHRMA_CANCER_PCT_CONDITIONS_WITH_SEX_BREAKDOWN


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
        "_65-69": "65-69",
        "_70_74": "70-74",
        "_70-74": "70-74",
        "_70_75": "70-75",
        "_70-75": "70-75",
        "_75_79": "75-79",
        "_75-79": "75-79",
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
        "Do not have some form of health insurance": "Uninsured",
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
        "Less than $15,000": "Under $15k",
        "$15,000 to < $25,000": "$15k-$25k",
        "$25,000 to < $35,000": "$25k-$35k",
        "$35,000 to < $50,000": "$35k-$50k",
        "$50,000 to < $75,000": "$50k-$75k",
        "$75,000 to < $100,000": "$75k-$100k",
        "$100,000 to < $200,000": "$100k-$200k",
        "$200,000 or more": "$200k+",
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
        AGE_ADJ_RATE_LOWER: f'{condition}_{AGE_ADJ_RATE_LOWER}',
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
        rename_cols_map[SEX_NAME_LOWER] = std_col.SEX_COL

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


DTYPE = {'COUNTY_FIPS': str, 'STATE_FIPS': str}


def load_phrma_df_from_data_dir(
    geo_level: GEO_TYPE,
    breakdown: PHRMA_BREAKDOWN_TYPE_OR_ALL,
    data_type: Literal['standard', 'cancer'],
    conditions: List[str],
) -> pd.DataFrame:
    """Generates Phrma data by breakdown and geo_level
    geo_level: string equal to `county`, `national`, or `state`
    breakdown: string equal to `age`, `race_and_ethnicity`, `sex`, `lis`, `eligibility`,
     `insurance_status`, `education`, `income`, or `all`
    data_type: string equal to 'standard' or 'cancer' to determine which data to process
    return: a single data frame of data by demographic breakdown and
        geo_level with data columns loaded from multiple Phrma source tables"""

    sheet_name = get_sheet_name(geo_level, breakdown)
    merge_cols = []

    if geo_level == COUNTY_LEVEL:
        merge_cols.append(std_col.COUNTY_FIPS_COL)
    else:
        merge_cols.append(std_col.STATE_FIPS_COL)

    if breakdown != TMP_ALL:
        breakdown_col = std_col.RACE_CATEGORY_ID_COL if breakdown == std_col.RACE_OR_HISPANIC_COL else breakdown
        merge_cols.append(breakdown_col)
    fips_col = std_col.COUNTY_FIPS_COL if geo_level == COUNTY_LEVEL else std_col.STATE_FIPS_COL

    breakdown_het_to_source_type = {
        "age": AGE_GROUP if data_type == 'standard' else AGE_GROUP_LOWER,
        "race_and_ethnicity": RACE_NAME if data_type == 'standard' else RACE_NAME_LOWER,
        "sex": SEX_NAME if data_type == 'standard' else SEX_NAME_LOWER,
        "lis": LIS,
        "eligibility": ENTLMT_RSN_CURR,
        "income": INCOME_GROUP_LOWER,
        "education": EDUCATION_GROUP_LOWER,
        "insurance_status": INSURANCE_STATUS_LOWER,
    }

    # only read certain columns from source data
    keep_cols = []
    fips_length = 0

    if breakdown != TMP_ALL:
        keep_cols.append(breakdown_het_to_source_type[breakdown])

    if geo_level == COUNTY_LEVEL:
        fips_length = 5
        keep_cols.append(COUNTY_FIPS)
    if geo_level == STATE_LEVEL:
        fips_length = 2
        keep_cols.append(STATE_FIPS if data_type == 'standard' else STATE_FIPS_LOWER)
    if geo_level == NATIONAL_LEVEL:
        fips_length = 2

    topic_dfs = []
    condition_keep_cols = []

    # if data_type == 'standard':
    #     conditions = [*PHRMA_PCT_CONDITIONS, *PHRMA_100K_CONDITIONS]
    # else:  # cancer
    #     conditions = PHRMA_CANCER_PCT_CONDITIONS

    for condition in conditions:
        if data_type == 'standard':
            if condition in PHRMA_PCT_CONDITIONS:
                condition_keep_cols = [*keep_cols, COUNT_YES, COUNT_TOTAL, ADHERENCE_RATE]
            elif condition in PHRMA_100K_CONDITIONS:
                condition_keep_cols = [
                    *keep_cols,
                    MEDICARE_DISEASE_COUNT,
                    MEDICARE_POP_COUNT,
                    PER_100K,
                ]
        else:  # cancer
            condition_keep_cols = [
                *keep_cols,
                COUNT_YES_LOWER,
                COUNT_TOTAL_LOWER,
                ADHERENCE_RATE_LOWER,
            ]

            # TODO: can we present age-adj ratios for non-race reports somehow?
            # Only load source age-adj rates for race
            if breakdown == std_col.RACE_OR_HISPANIC_COL:
                condition_keep_cols.append(AGE_ADJ_RATE_LOWER)

        if data_type == 'standard':
            file_name = f'{condition}-{sheet_name}.csv'
            subdirectory = condition
        else:  # cancer
            condition_folder = f'MSM_BRFSS {condition} Cancer Screening_2024-08-07'
            file_name = f'{condition_folder}-{sheet_name}.csv'
            subdirectory = condition_folder

        topic_df = gcs_to_bq_util.load_csv_as_df_from_data_dir(
            PHRMA_DIR,
            file_name,
            subdirectory=subdirectory,
            dtype=DTYPE,
            na_values=["."],
            usecols=condition_keep_cols,
        )

        topic_df = topic_df.replace(['\n', '¬¥', '‚Äô'], [' ', "'", "'"], regex=True)

        if geo_level == NATIONAL_LEVEL:
            topic_df[STATE_FIPS] = US_FIPS

        topic_df = rename_cols(
            topic_df,
            cast(GEO_TYPE, geo_level),
            cast(SEX_RACE_ETH_AGE_TYPE, breakdown),
            condition,
        )

        topic_dfs.append(topic_df)

    df_merged = merge_dfs_list(topic_dfs, merge_cols)

    # drop rows that dont include FIPS and DEMO values
    df_merged = df_merged[df_merged[fips_col].notna()]
    df_merged = dataset_utils.ensure_leading_zeros(df_merged, fips_col, fips_length)

    return df_merged
