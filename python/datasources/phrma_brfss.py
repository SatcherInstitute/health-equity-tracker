import pandas as pd
from typing import cast
from datasources.data_source import DataSource
from ingestion.constants import (
    STATE_LEVEL,
    NATIONAL_LEVEL,
    US_FIPS,
)
from ingestion.dataset_utils import (
    ensure_leading_zeros,
)
from ingestion import gcs_to_bq_util, standardized_columns as std_col
from ingestion.merge_utils import merge_dfs_list
from ingestion.het_types import (
    GEO_TYPE,
    SEX_RACE_ETH_AGE_TYPE,
    PHRMA_BREAKDOWN_TYPE_OR_ALL,
)
from ingestion.phrma_utils import (
    TMP_ALL,
    PHRMA_DIR,
    get_sheet_name,
    ADHERENCE_RATE_LOWER,
    COUNT_TOTAL_LOWER,
    COUNT_YES_LOWER,
    RACE_NAME_LOWER,
    AGE_GROUP_LOWER,
    INSURANCE_STATUS_LOWER,
    INCOME_GROUP_LOWER,
    EDUCATION_GROUP_LOWER,
    PHRMA_CANCER_PCT_CONDITIONS,
    rename_cols,
)

"""
NOTE: Phrma data comes in .xlsx files, with breakdowns by sheet.
We need to first convert these to csv files as pandas is VERY slow on excel files,
using the `scripts/extract_excel_sheets_to_csvs` script.

`./scripts/extract_excel_sheets_to_csvs --directory ../data/phrma/cancer_screening`
"""

# constants

DTYPE = {'STATE_FIPS': str}


# # a nested dictionary that contains values swaps per column name
# BREAKDOWN_TO_STANDARD_BY_COL = {
#     std_col.LIS_COL: {
#         "Yes": "Receiving low income subsidy (LIS)",
#         "No": "Not receiving low income subsidy (LIS)",
#     },
#     std_col.ELIGIBILITY_COL: {
#         "Aged": "Eligible due to age",
#         "Disabled": "Eligible due to disability",
#         "ESRD": "Eligible due to end-stage renal disease (ESRD)",
#         "Disabled and ESRD": "Eligible due to disability and end-stage renal disease (ESRD)",
#     },
#     std_col.AGE_COL: {
#         "_18-39": "18-39",
#         "_40-64": "40-64",
#         "_65-69": "65-69",
#         "_70-74": "70-74",
#         "_75-79": "75-79",
#         "_80-84": "80-84",
#         "_85+": "85+",
#     },
#     std_col.RACE_CATEGORY_ID_COL: {
#         'Unknown': std_col.Race.UNKNOWN.value,
#         'American Indian / Alaska Native': std_col.Race.AIAN_NH.value,
#         'Asian/Pacific Islander': std_col.Race.API_NH.value,
#         'Black or African-American': std_col.Race.BLACK_NH.value,
#         'Hispanic': std_col.Race.HISP.value,
#         'Other': std_col.Race.OTHER_NONSTANDARD_NH.value,
#         'Non-Hispanic White': std_col.Race.WHITE_NH.value,
#     },
#     # SEX source groups already match needed HET groups
# }

"""
race_name
American Indian or Alaskan Native
Asian
Black
Hispanic
Multiracial
Native Hawaiian or other Pacific Islander
White

age_group
_50_54
_55_59
_60_64
_65_69
_70_74

insurance_status
Have some form of insurance
Do not have some form of health insurance
Don¬¥t know, refused or missing insurance response

income_group
Less than $15,000
$15,000 to < $25,000
$25,000 to < $35,000
$35,000 to < $50,000
$50,000 to < $75,000
$75,000 to < $100,000
$100,000 to < $200,000
$200,000 or more
Don‚Äôt know/Not sure/Missing

education_group
Did not graduate High School
Graduated High School
Attended College or Technical School
Graduated from College or Technical School
Don‚Äôt know/Not sure/Missing
"""


class PhrmaBrfssData(DataSource):
    @staticmethod
    def get_id():
        return 'PHRMA_BRFSS_DATA'

    @staticmethod
    def get_table_name():
        return 'phrma_brfss_data'

    def upload_to_gcs(self, gcs_bucket, **attrs):
        raise NotImplementedError('upload_to_gcs should not be called for PhrmaBrfssData')

    def write_to_bq(self, dataset, gcs_bucket, **attrs):
        demo_type = self.get_attr(attrs, 'demographic')
        geo_level = self.get_attr(attrs, 'geographic')

        table_name = f'{demo_type}_{geo_level}'

        df = load_phrma_brfss_df_from_data_dir(geo_level, demo_type)
        float_cols = []
        col_types = gcs_to_bq_util.get_bq_column_types(df, float_cols)
        gcs_to_bq_util.add_df_to_bq(df, dataset, table_name, column_types=col_types)


def load_phrma_brfss_df_from_data_dir(geo_level: GEO_TYPE, breakdown: PHRMA_BREAKDOWN_TYPE_OR_ALL) -> pd.DataFrame:
    """Generates Phrma data by breakdown and geo_level
    geo_level: string equal to `county`, `national`, or `state`
    breakdown: string equal to 'age', 'race_and_ethnicity', 'insurance_status', 'education', 'income', 'all'
    return: a single data frame of data by demographic breakdown and
        geo_level with data columns loaded from multiple Phrma source tables"""

    sheet_name = get_sheet_name(geo_level, breakdown)
    merge_cols = [std_col.STATE_FIPS_COL]

    if breakdown != TMP_ALL:
        breakdown_col = std_col.RACE_CATEGORY_ID_COL if breakdown == std_col.RACE_OR_HISPANIC_COL else breakdown
        merge_cols.append(breakdown_col)

    breakdown_het_to_source_type = {
        "age": AGE_GROUP_LOWER,
        "race_and_ethnicity": RACE_NAME_LOWER,
        "income": INCOME_GROUP_LOWER,
        "education": EDUCATION_GROUP_LOWER,
        'insurance_status': INSURANCE_STATUS_LOWER,
    }

    # only read certain columns from source data
    keep_cols = []
    fips_length = 0

    if breakdown != TMP_ALL:
        keep_cols.append(breakdown_het_to_source_type[breakdown])

    if geo_level == STATE_LEVEL:
        fips_length = 2
        keep_cols.append(std_col.STATE_FIPS_COL)
    if geo_level == NATIONAL_LEVEL:
        fips_length = 2

    topic_dfs = []
    condition_keep_cols = []

    for condition in PHRMA_CANCER_PCT_CONDITIONS:
        if condition in PHRMA_CANCER_PCT_CONDITIONS:
            condition_keep_cols = [*keep_cols, COUNT_YES_LOWER, COUNT_TOTAL_LOWER, ADHERENCE_RATE_LOWER]

        condition_folder = f'MSM_BRFSS {condition} Cancer Screening_2024-08-07'

        topic_df = gcs_to_bq_util.load_csv_as_df_from_data_dir(
            PHRMA_DIR,
            f'{condition_folder}-{sheet_name}.csv',
            subdirectory=condition_folder,
            dtype=DTYPE,
            na_values=["."],
            usecols=condition_keep_cols,
        )

        if geo_level == NATIONAL_LEVEL:
            topic_df[std_col.STATE_FIPS_COL] = US_FIPS

        topic_df = rename_cols(
            topic_df,
            cast(GEO_TYPE, geo_level),
            cast(SEX_RACE_ETH_AGE_TYPE, breakdown),
            condition,
        )

        topic_dfs.append(topic_df)

    df_merged = merge_dfs_list(topic_dfs, merge_cols)

    # drop rows that dont include FIPS and DEMO values
    df_merged = df_merged[df_merged[std_col.STATE_FIPS_COL].notna()]
    df_merged = ensure_leading_zeros(df_merged, std_col.STATE_FIPS_COL, fips_length)

    return df_merged
