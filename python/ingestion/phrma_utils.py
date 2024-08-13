from ingestion.het_types import GEO_TYPE, PHRMA_BREAKDOWN_TYPE
import ingestion.standardized_columns as std_col
from ingestion.constants import STATE_LEVEL, COUNTY_LEVEL, NATIONAL_LEVEL

TMP_ALL = 'all'
PHRMA_DIR = 'phrma'


def get_sheet_name(geo_level: GEO_TYPE, breakdown: PHRMA_BREAKDOWN_TYPE) -> str:
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
