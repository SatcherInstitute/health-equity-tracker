from functools import reduce
import pandas as pd
from typing import Dict, cast
from datasources.data_source import DataSource
from ingestion.constants import (
    COUNTY_LEVEL,
    STATE_LEVEL,
    NATIONAL_LEVEL,
    ALL_VALUE,
    US_FIPS,
    US_NAME,
    UNKNOWN,
)
from ingestion.dataset_utils import (
    ensure_leading_zeros,
    generate_pct_share_col_with_unknowns,
    generate_pct_share_col_without_unknowns,
)
from ingestion import gcs_to_bq_util, standardized_columns as std_col
from ingestion.merge_utils import merge_county_names, merge_state_ids
from ingestion.het_types import (
    GEO_TYPE,
    SEX_RACE_ETH_AGE_TYPE,
    PHRMA_BREAKDOWN_TYPE_OR_ALL,
    PHRMA_BREAKDOWN_TYPE,
)

"""
NOTE: Phrma data comes in .xlsx files, with breakdowns by sheet.
We need to first convert these to csv files as pandas is VERY slow on excel files

Ensure Gnumeric is installed with Homebrew or similar, and run this for each excel source file:
ssconvert --export-type=Gnumeric_stf:stf_csv -S beta_blockers.xlsx beta_blockers-%s.csv
"""

# constants
PHRMA_DIR = 'phrma'
ELIGIBILITY = "eligibility"
ADHERENCE = 'adherence'
BENEFICIARIES = 'beneficiaries'
TMP_ALL = 'all'

DTYPE = {'COUNTY_FIPS': str, 'STATE_FIPS': str}

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

# CONSTANTS USED BY DATA SOURCE
COUNT_TOTAL = "TOTAL_BENE"
COUNT_YES = "BENE_YES"
# COUNT_NO = "BENE_NO"
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


# a nested dictionary that contains values swaps per column name
BREAKDOWN_TO_STANDARD_BY_COL = {
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
    std_col.AGE_COL: {
        "_18-39": "18-39",
        "_40-64": "40-64",
        "_65-69": "65-69",
        "_70-74": "70-74",
        "_75-79": "75-79",
        "_80-84": "80-84",
        "_85+": "85+",
    },
    std_col.RACE_CATEGORY_ID_COL: {
        'Unknown': std_col.Race.UNKNOWN.value,
        'American Indian / Alaska Native': std_col.Race.AIAN_NH.value,
        'Asian/Pacific Islander': std_col.Race.API_NH.value,
        'Black or African-American': std_col.Race.BLACK_NH.value,
        'Hispanic': std_col.Race.HISP.value,
        'Other': std_col.Race.OTHER_NONSTANDARD_NH.value,
        'Non-Hispanic White': std_col.Race.WHITE_NH.value,
    },
    # SEX source groups already match needed HET groups
}


class PhrmaData(DataSource):
    @staticmethod
    def get_id():
        return 'PHRMA_DATA'

    @staticmethod
    def get_table_name():
        return 'phrma_data'

    def upload_to_gcs(self, gcs_bucket, **attrs):
        raise NotImplementedError('upload_to_gcs should not be called for PhrmaData')

    def write_to_bq(self, dataset, gcs_bucket, **attrs):
        demo_type = self.get_attr(attrs, 'demographic')
        geo_level = self.get_attr(attrs, 'geographic')

        alls_df = load_phrma_df_from_data_dir(geo_level, TMP_ALL)

        table_name = f'{demo_type}_{geo_level}'
        df = self.generate_breakdown_df(demo_type, geo_level, alls_df)

        # POP COMPARE FOR 100K
        float_cols = [
            f'{std_col.MEDICARE_PREFIX}_{std_col.POPULATION_COL}_{std_col.PCT_SHARE_SUFFIX}',
            f'{std_col.MEDICARE_PREFIX}_{std_col.POPULATION_COL}',
        ]

        # PCT_RATE CONDITIONS
        for condition in PHRMA_PCT_CONDITIONS:
            # rate, pct_share, count cols
            for metric in [
                std_col.PCT_RATE_SUFFIX,
                std_col.PCT_SHARE_SUFFIX,
                std_col.RAW_SUFFIX,
            ]:
                float_cols.append(f'{condition}_{ADHERENCE}_{metric}')
            # valid-population comparison pct_share and count cols
            float_cols.append(f'{condition}_{BENEFICIARIES}_{std_col.RAW_SUFFIX}')

        # PER_100K CONDITIONS
        for condition in PHRMA_100K_CONDITIONS:
            # rate, pct_share, count_cols
            for metric in [
                std_col.PER_100K_SUFFIX,
                std_col.PCT_SHARE_SUFFIX,
                std_col.RAW_SUFFIX,
            ]:
                float_cols.append(f'{condition}_{metric}')

        col_types = gcs_to_bq_util.get_bq_column_types(df, float_cols)

        gcs_to_bq_util.add_df_to_bq(df, dataset, table_name, column_types=col_types)

    def generate_breakdown_df(
        self,
        demo_breakdown: PHRMA_BREAKDOWN_TYPE,
        geo_level: GEO_TYPE,
        alls_df: pd.DataFrame,
    ) -> pd.DataFrame:
        """Generates HET-stye dataframe by demo_breakdown and geo_level
        demo_breakdown: string equal to `lis`, `eligibility`, `age`, `race_and_ethnicity`, or `sex`
        geo_level: string equal to `county`, `national`, or `state`
        alls_df: the data frame containing the all values for each demographic demo_breakdown.
        return: a breakdown df by demographic and geo_level"""

        # give the ALL df a demographic column with correctly capitalized "All"/"ALL" value
        demo_col = std_col.RACE_CATEGORY_ID_COL if demo_breakdown == std_col.RACE_OR_HISPANIC_COL else demo_breakdown
        all_val = std_col.Race.ALL.value if demo_breakdown == std_col.RACE_OR_HISPANIC_COL else ALL_VALUE

        alls_df = alls_df.copy()
        alls_df[demo_col] = all_val

        fips_to_use = std_col.COUNTY_FIPS_COL if geo_level == COUNTY_LEVEL else std_col.STATE_FIPS_COL

        breakdown_group_df = load_phrma_df_from_data_dir(geo_level, demo_breakdown)

        df = pd.concat([breakdown_group_df, alls_df], axis=0)
        df = df.replace(to_replace=BREAKDOWN_TO_STANDARD_BY_COL)

        # ADHERENCE rate
        for condition in PHRMA_PCT_CONDITIONS:
            source_col_name = f'{condition}_{ADHERENCE_RATE}'
            het_col_name = f'{condition}_{ADHERENCE}_{std_col.PCT_RATE_SUFFIX}'
            df[het_col_name] = df[source_col_name].multiply(100).round()

        for condition in PHRMA_100K_CONDITIONS:
            source_col_name = f'{condition}_{PER_100K}'
            het_col_name = f'{condition}_{std_col.PER_100K_SUFFIX}'
            df[het_col_name] = df[source_col_name].round()

        if geo_level == COUNTY_LEVEL:
            df[std_col.STATE_FIPS_COL] = df[std_col.COUNTY_FIPS_COL].str.slice(0, 2)
            df = merge_county_names(df)

        if geo_level == NATIONAL_LEVEL:
            df[std_col.STATE_NAME_COL] = US_NAME
        else:
            df = merge_state_ids(df)

        count_to_share_map = {
            # Pct share of adherence
            **{
                f'{condition}_{COUNT_YES}': f'{condition}_{ADHERENCE}_{std_col.PCT_SHARE_SUFFIX}'
                for condition in PHRMA_PCT_CONDITIONS
            },
            # Pct Share for disease
            **{
                f'{condition}_{MEDICARE_DISEASE_COUNT}': f'{condition}_{std_col.PCT_SHARE_SUFFIX}'
                for condition in PHRMA_100K_CONDITIONS
            },
            # Shared comparison population share col for all 100ks
            MEDICARE_POP_COUNT: (f'{std_col.MEDICARE_PREFIX}_{std_col.POPULATION_COL}_{std_col.PCT_SHARE_SUFFIX}'),
        }

        if demo_breakdown == std_col.RACE_OR_HISPANIC_COL:
            df = generate_pct_share_col_with_unknowns(
                df, count_to_share_map, demo_col, all_val, std_col.Race.UNKNOWN.value
            )
        else:
            # Some Sex breakdowns contained null count rows for Unknown with 100k/100k rate
            if demo_breakdown == std_col.SEX_COL:
                df = df[df[demo_breakdown] != UNKNOWN]
            df = generate_pct_share_col_without_unknowns(
                df, count_to_share_map, cast(PHRMA_BREAKDOWN_TYPE, demo_col), all_val
            )

        rename_col_map = {MEDICARE_POP_COUNT: f'{std_col.MEDICARE_PREFIX}_{std_col.POPULATION_COL}'}
        for condition in PHRMA_PCT_CONDITIONS:
            rename_col_map[f'{condition}_{COUNT_YES}'] = f'{condition}_{ADHERENCE}_{std_col.RAW_SUFFIX}'
            rename_col_map[f'{condition}_{COUNT_TOTAL}'] = f'{condition}_{BENEFICIARIES}_{std_col.RAW_SUFFIX}'
        for condition in PHRMA_100K_CONDITIONS:
            rename_col_map[f'{condition}_{MEDICARE_DISEASE_COUNT}'] = f'{condition}_{std_col.RAW_SUFFIX}'

        df = df.rename(columns=rename_col_map)

        df = df.drop(
            columns=[
                *[f'{condition}_{ADHERENCE_RATE}' for condition in PHRMA_PCT_CONDITIONS],
                *[f'{condition}_{PER_100K}' for condition in PHRMA_100K_CONDITIONS],
            ]
        )

        if demo_breakdown == std_col.RACE_OR_HISPANIC_COL:
            std_col.add_race_columns_from_category_id(df)

        df = df.sort_values(by=[fips_to_use, demo_col]).reset_index(drop=True)

        return df


def load_phrma_df_from_data_dir(geo_level: GEO_TYPE, breakdown: PHRMA_BREAKDOWN_TYPE_OR_ALL) -> pd.DataFrame:
    """Generates Phrma data by breakdown and geo_level
    geo_level: string equal to `county`, `national`, or `state`
    breakdown: string equal to `age`, `race_and_ethnicity`, `sex`, `lis`, `eligibility`, or `all`
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
        "age": AGE_GROUP,
        "race_and_ethnicity": RACE_NAME,
        "sex": SEX_NAME,
        "lis": LIS,
        "eligibility": ENTLMT_RSN_CURR,
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
        keep_cols.append(STATE_FIPS)
    if geo_level == NATIONAL_LEVEL:
        fips_length = 2

    topic_dfs = []
    condition_keep_cols = []

    for condition in [*PHRMA_PCT_CONDITIONS, *PHRMA_100K_CONDITIONS]:
        if condition in PHRMA_PCT_CONDITIONS:
            condition_keep_cols = [*keep_cols, COUNT_YES, COUNT_TOTAL, ADHERENCE_RATE]

        if condition in PHRMA_100K_CONDITIONS:
            condition_keep_cols = [
                *keep_cols,
                MEDICARE_DISEASE_COUNT,
                MEDICARE_POP_COUNT,
                PER_100K,
            ]

        topic_df = gcs_to_bq_util.load_csv_as_df_from_data_dir(
            PHRMA_DIR,
            f'{condition}-{sheet_name}.csv',
            subdirectory=condition,
            dtype=DTYPE,
            na_values=["."],
            usecols=condition_keep_cols,
        )

        if geo_level == NATIONAL_LEVEL:
            topic_df[STATE_FIPS] = US_FIPS

        topic_df = rename_cols(
            topic_df,
            cast(GEO_TYPE, geo_level),
            cast(SEX_RACE_ETH_AGE_TYPE, breakdown),
            condition,
        )

        topic_dfs.append(topic_df)

    df_merged = reduce(lambda df_a, df_b: pd.merge(df_a, df_b, on=merge_cols, how='outer'), topic_dfs)

    # drop rows that dont include FIPS and DEMO values
    df_merged = df_merged[df_merged[fips_col].notna()]
    df_merged = ensure_leading_zeros(df_merged, fips_col, fips_length)

    return df_merged


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
    }

    return sheet_map[(breakdown, geo_level)]


def rename_cols(
    df: pd.DataFrame,
    geo_level: GEO_TYPE,
    breakdown: PHRMA_BREAKDOWN_TYPE_OR_ALL,
    condition: str,
) -> pd.DataFrame:
    """Renames columns based on the demo/geo breakdown"""

    rename_cols_map: Dict[str, str] = (
        {
            COUNT_YES: f'{condition}_{COUNT_YES}',
            COUNT_TOTAL: f'{condition}_{COUNT_TOTAL}',
            ADHERENCE_RATE: f'{condition}_{ADHERENCE_RATE}',
        }
        if condition in PHRMA_PCT_CONDITIONS
        else {
            MEDICARE_DISEASE_COUNT: f'{condition}_{MEDICARE_DISEASE_COUNT}',
            PER_100K: f'{condition}_{PER_100K}',
        }
    )

    if geo_level == COUNTY_LEVEL:
        rename_cols_map[COUNTY_FIPS] = std_col.COUNTY_FIPS_COL

    if geo_level in [STATE_LEVEL, NATIONAL_LEVEL]:
        rename_cols_map[STATE_FIPS] = std_col.STATE_FIPS_COL

    if breakdown == std_col.RACE_OR_HISPANIC_COL:
        rename_cols_map[RACE_NAME] = std_col.RACE_CATEGORY_ID_COL

    if breakdown == std_col.SEX_COL:
        rename_cols_map[SEX_NAME] = std_col.SEX_COL

    if breakdown == std_col.AGE_COL:
        rename_cols_map[AGE_GROUP] = std_col.AGE_COL

    if breakdown == std_col.ELIGIBILITY_COL:
        rename_cols_map[ENTLMT_RSN_CURR] = std_col.ELIGIBILITY_COL

    if breakdown == std_col.LIS_COL:
        rename_cols_map[LIS] = std_col.LIS_COL

    df = df.rename(columns=rename_cols_map)

    # only keep the medicare/medicaid raw population for one of the 100k conditions
    if condition in PHRMA_100K_CONDITIONS and condition != std_col.AMI_PREFIX:
        df = df.drop(columns=[MEDICARE_POP_COUNT])

    return df
