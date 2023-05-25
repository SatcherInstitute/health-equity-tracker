from functools import reduce
import numpy as np
import pandas as pd
from typing import Dict, cast
from datasources.data_source import DataSource
from ingestion.constants import (COUNTY_LEVEL,
                                 STATE_LEVEL,
                                 NATIONAL_LEVEL,
                                 ALL_VALUE,
                                 US_FIPS,
                                 US_NAME)
from ingestion.dataset_utils import (ensure_leading_zeros,
                                     generate_pct_share_col_with_unknowns,
                                     generate_pct_share_col_without_unknowns)
from ingestion import gcs_to_bq_util, standardized_columns as std_col
from ingestion.merge_utils import merge_county_names, merge_pop_numbers
from ingestion.types import (
    GEO_TYPE,
    SEX_RACE_AGE_TYPE,
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

PHRMA_CONDITIONS = [
    std_col.STATINS_PREFIX,
    std_col.BETA_BLOCKERS_PREFIX,
    std_col.RASA_PREFIX
]

# CONSTANTS USED BY DATA SOURCE
COUNT_TOTAL = "TOTAL_BENE"
COUNT_YES = "BENE_YES"
COUNT_NO = "BENE_NO"
ADHERENCE_RATE = "BENE_YES_PCT"
STATE_CODE = "STATE_CODE"
STATE_NAME = "STATE_NAME"
COUNTY_CODE = "COUNTY_CODE"
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
    LIS: {
        "Yes": "Receiving low income subsidy (LIS)",
        "No": "Not receiving low income subsidy (LIS)",
    },
    ELIGIBILITY: {
        "Aged": "Eligible due to age",
        "Disabled": "Eligible due to disability",
        "ESRD": "Eligible due to end-stage renal disease (ESRD)",
        "Disabled and ESRD": "Eligible due to disability and end-stage renal disease (ESRD)"
    },
    std_col.AGE_COL: {
        "_18-39": "18-39",
        "_40-64": "40-64",
        "_65-69": "65-69",
        "_70-74": "70-74",
        "_75-79": "75-79",
        "_80-84": "80-84",
        "_85+": "85+"
    },
    std_col.RACE_CATEGORY_ID_COL: {
        'Unknown': std_col.Race.UNKNOWN.value,
        'American Indian / Alaska Native': std_col.Race.AIAN_NH.value,
        'Asian/Pacific Islander': std_col.Race.API_NH.value,
        'Black or African-American': std_col.Race.BLACK_NH.value,
        'Hispanic': std_col.Race.HISP.value,
        'Other': std_col.Race.MULTI_OR_OTHER_STANDARD_NH.value,
        'Non-Hispanic White': std_col.Race.WHITE_NH.value
    }
    # SEX source groups already match needed HET groups

}


class PhrmaData(DataSource):

    @ staticmethod
    def get_id():
        return 'PHRMA_DATA'

    @ staticmethod
    def get_table_name():
        return 'phrma_data'

    def upload_to_gcs(self, gcs_bucket, **attrs):
        raise NotImplementedError(
            'upload_to_gcs should not be called for PhrmaData')

    def write_to_bq(self, dataset, gcs_bucket, **attrs):

        for geo_level in [
            NATIONAL_LEVEL,
            STATE_LEVEL,
            COUNTY_LEVEL
        ]:
            alls_df = load_phrma_df_from_data_dir(geo_level, TMP_ALL)
            for breakdown in [
                LIS,
                ELIGIBILITY,
                std_col.SEX_COL,
                std_col.AGE_COL,
                std_col.RACE_OR_HISPANIC_COL
            ]:
                table_name = f'{breakdown}_{geo_level}'
                df = self.generate_breakdown_df(breakdown, geo_level, alls_df)
                float_cols = [std_col.PHRMA_POPULATION_PCT,
                              std_col.PHRMA_POPULATION]
                for condition in PHRMA_CONDITIONS:
                    for metric in [std_col.PCT_RATE_SUFFIX, std_col.PCT_SHARE_SUFFIX, std_col.RAW_SUFFIX]:
                        float_cols.append(f'{condition}_{ADHERENCE}_{metric}')
                    float_cols.append(
                        f'{condition}_{BENEFICIARIES}_{std_col.RAW_SUFFIX}')
                col_types = gcs_to_bq_util.get_bq_column_types(df, float_cols)
                gcs_to_bq_util.add_df_to_bq(df,
                                            dataset,
                                            table_name,
                                            column_types=col_types)

    def generate_breakdown_df(
            self,
            demo_breakdown: PHRMA_BREAKDOWN_TYPE,
            geo_level: GEO_TYPE,
            alls_df: pd.DataFrame
    ) -> pd.DataFrame:
        """ Generates HET-stye dataframe by demo_breakdown and geo_level
        demo_breakdown: string equal to `lis`, `eligibility`, `age`, `race_and_ethnicity`, or `sex`
        geo_level: string equal to `county`, `national`, or `state`
        alls_df: the data frame containing the all values for each demographic demo_breakdown.
        return: a breakdown df by demographic and geo_level"""

        # give the ALL df a demographic column with correctly capitalized "All"/"ALL" value
        demo_col = std_col.RACE_CATEGORY_ID_COL if demo_breakdown == std_col.RACE_OR_HISPANIC_COL else demo_breakdown
        demo = std_col.RACE_COL if demo_breakdown == std_col.RACE_OR_HISPANIC_COL else demo_breakdown
        all_val = std_col.Race.ALL.value if demo_breakdown == std_col.RACE_OR_HISPANIC_COL else ALL_VALUE

        alls_df = alls_df.copy()
        alls_df[demo_col] = all_val

        fips_to_use = std_col.COUNTY_FIPS_COL if geo_level == COUNTY_LEVEL else std_col.STATE_FIPS_COL

        breakdown_group_df = load_phrma_df_from_data_dir(
            geo_level, demo_breakdown)

        df = pd.concat([breakdown_group_df, alls_df], axis=0)
        df = df.replace(
            to_replace=BREAKDOWN_TO_STANDARD_BY_COL)

        if demo != ELIGIBILITY and demo != LIS:
            df = merge_pop_numbers(
                df, cast(SEX_RACE_AGE_TYPE, demo), cast(GEO_TYPE, geo_level))
        else:
            df[[std_col.PHRMA_POPULATION, std_col.PHRMA_POPULATION_PCT]] = np.nan

        # ADHERENCE rate
        for condition in PHRMA_CONDITIONS:
            source_col_name = f'{condition}_{ADHERENCE_RATE}'
            het_col_name = f'{condition}_{ADHERENCE}_{std_col.PCT_RATE_SUFFIX}'
            df[het_col_name] = df[source_col_name].multiply(
                100).round()

        if geo_level == COUNTY_LEVEL:
            df = merge_county_names(df)
            df[std_col.STATE_FIPS_COL] = df[std_col.COUNTY_FIPS_COL].str.slice(0,
                                                                               2)

        count_to_share_map = {
            f'{condition}_{COUNT_YES}':
            f'{condition}_{ADHERENCE}_{std_col.PCT_SHARE_SUFFIX}' for condition in PHRMA_CONDITIONS
        }

        if demo_breakdown == std_col.RACE_OR_HISPANIC_COL:
            df = generate_pct_share_col_with_unknowns(
                df,
                count_to_share_map,
                demo_col,
                all_val,
                std_col.Race.UNKNOWN.value)
        else:
            df = generate_pct_share_col_without_unknowns(
                df,
                count_to_share_map,
                cast(PHRMA_BREAKDOWN_TYPE, demo_col),
                all_val
            )

        rename_col_map = {
            std_col.POPULATION_PCT_COL: std_col.PHRMA_POPULATION_PCT,
            std_col.POPULATION_COL: std_col.PHRMA_POPULATION,
        }
        for condition in PHRMA_CONDITIONS:
            rename_col_map[f'{condition}_{COUNT_YES}'] = f'{condition}_{ADHERENCE}_{std_col.RAW_SUFFIX}'
            rename_col_map[f'{condition}_{COUNT_TOTAL}'] = f'{condition}_{BENEFICIARIES}_{std_col.RAW_SUFFIX}'
        df = df.rename(columns=rename_col_map)

        df = df.drop(columns=[
            f'{std_col.STATINS_PREFIX}_{COUNT_NO}',
            f'{std_col.BETA_BLOCKERS_PREFIX}_{COUNT_NO}',
            f'{std_col.RASA_PREFIX}_{COUNT_NO}',
            f'{std_col.STATINS_PREFIX}_{ADHERENCE_RATE}',
            f'{std_col.BETA_BLOCKERS_PREFIX}_{ADHERENCE_RATE}',
            f'{std_col.RASA_PREFIX}_{ADHERENCE_RATE}'
        ])

        if demo_breakdown == std_col.RACE_OR_HISPANIC_COL:
            std_col.add_race_columns_from_category_id(df)

        df = df.sort_values(
            by=[fips_to_use, demo_col]).reset_index(drop=True)

        return df


def load_phrma_df_from_data_dir(
        geo_level: GEO_TYPE,
        breakdown: PHRMA_BREAKDOWN_TYPE_OR_ALL
) -> pd.DataFrame:
    """ Generates Phrma data by breakdown and geo_level
    geo_level: string equal to `county`, `national`, or `state`
    breakdown: string equal to `age`, `race_and_ethnicity`, `sex`, `LIS`, `eligibility`, or `all`
    return: a single data frame of data by demographic breakdown and
        geo_level with data columns loaded from multiple Phrma source tables """

    sheet_name = get_sheet_name(geo_level, breakdown)

    merge_cols = [std_col.STATE_FIPS_COL,
                  std_col.STATE_NAME_COL]
    if geo_level == COUNTY_LEVEL:
        merge_cols.extend([std_col.COUNTY_FIPS_COL, std_col.COUNTY_NAME_COL])

    if breakdown != TMP_ALL:
        breakdown_col = std_col.RACE_CATEGORY_ID_COL if breakdown == std_col.RACE_OR_HISPANIC_COL else breakdown
        merge_cols.append(breakdown_col)
    fips_col = std_col.COUNTY_FIPS_COL if geo_level == COUNTY_LEVEL else std_col. STATE_FIPS_COL
    fips_length = 5 if geo_level == COUNTY_LEVEL else 2

    topic_dfs = []

    for condition in PHRMA_CONDITIONS:

        topic_df = gcs_to_bq_util.load_csv_as_df_from_data_dir(
            PHRMA_DIR,
            f'{condition}-{sheet_name}.csv',
            subdirectory=condition,
            dtype=DTYPE,
            na_values=["."],
        )

        if geo_level == NATIONAL_LEVEL:
            topic_df[STATE_CODE] = US_FIPS
            topic_df[STATE_NAME] = US_NAME

        topic_df = rename_cols(topic_df,
                               cast(GEO_TYPE, geo_level),
                               cast(SEX_RACE_ETH_AGE_TYPE, breakdown),
                               condition)

        topic_dfs.append(topic_df)

    df_merged = reduce(lambda df_a, df_b: pd.merge(df_a, df_b, on=merge_cols,
                                                   how='outer'), topic_dfs)

    # drop rows that dont include FIPS and DEMO values
    df_merged = df_merged[df_merged[fips_col].notna()]
    df_merged = ensure_leading_zeros(df_merged, fips_col, fips_length)

    return df_merged


def get_sheet_name(
    geo_level: GEO_TYPE,
    breakdown: PHRMA_BREAKDOWN_TYPE_OR_ALL
) -> str:
    """ geo_level: string equal to `county`, `national`, or `state`
   breakdown: string demographic breakdown type
   return: a string sheet name based on the provided args  """

    sheet_map = {
        (TMP_ALL, NATIONAL_LEVEL): "US",
        (TMP_ALL, STATE_LEVEL): "State",
        (TMP_ALL, COUNTY_LEVEL): "County",
        (LIS, NATIONAL_LEVEL): "LIS_US",
        (LIS, STATE_LEVEL): "LIS_State",
        (LIS, COUNTY_LEVEL): "LIS_County",
        (ELIGIBILITY, NATIONAL_LEVEL): "Elig_US",
        (ELIGIBILITY, STATE_LEVEL): "Elig_State",
        (ELIGIBILITY, COUNTY_LEVEL): "Elig_County",
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


def rename_cols(df: pd.DataFrame,
                geo_level: GEO_TYPE,
                breakdown: PHRMA_BREAKDOWN_TYPE_OR_ALL,
                condition: str) -> pd.DataFrame:
    """ Renames columns based on the demo/geo breakdown """

    rename_cols_map: Dict[str, str] = {
        COUNT_NO: f'{condition}_{COUNT_NO}',
        COUNT_YES: f'{condition}_{COUNT_YES}',
        COUNT_TOTAL: f'{condition}_{COUNT_TOTAL}',
        ADHERENCE_RATE: f'{condition}_{ADHERENCE_RATE}',
    }

    if geo_level == COUNTY_LEVEL:
        rename_cols_map[STATE_FIPS] = std_col.STATE_FIPS_COL
        rename_cols_map[COUNTY_FIPS] = std_col.COUNTY_FIPS_COL
        rename_cols_map[STATE_NAME] = std_col.STATE_NAME_COL
        rename_cols_map[COUNTY_NAME] = std_col.COUNTY_NAME_COL

    if geo_level in [STATE_LEVEL, NATIONAL_LEVEL]:
        rename_cols_map[STATE_NAME] = std_col.STATE_NAME_COL
        rename_cols_map[STATE_CODE] = std_col.STATE_FIPS_COL

    if breakdown == std_col.RACE_OR_HISPANIC_COL:
        rename_cols_map[RACE_NAME] = std_col.RACE_CATEGORY_ID_COL

    if breakdown == std_col.SEX_COL:
        rename_cols_map[SEX_NAME] = std_col.SEX_COL

    if breakdown == std_col.AGE_COL:
        rename_cols_map[AGE_GROUP] = std_col.AGE_COL

    if breakdown == ELIGIBILITY:
        rename_cols_map[ENTLMT_RSN_CURR] = ELIGIBILITY

    df = df.rename(columns=rename_cols_map)

    return df
