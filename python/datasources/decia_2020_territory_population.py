import numpy as np
import pandas as pd
from datasources.data_source import DataSource
from ingestion.constants import (COUNTY_LEVEL, STATE_LEVEL, Sex)
from ingestion import gcs_to_bq_util, standardized_columns as std_col, dataset_utils

from ingestion.merge_utils import merge_county_names, merge_state_ids
from typing import Literal, cast, List, Dict, Final, Any
from ingestion.types import DEMOGRAPHIC_TYPE


# RACE/ETH CODES DIFFER ACROSS ISLANDS
RACE_CODES_TO_STD = {
    "AS": {"DP1_0076": std_col.Race.ALL.value,
           "DP1_0078": std_col.Race.NHPI.value,
           "DP1_0086": std_col.Race.ASIAN.value,
           "DP1_0095": std_col.Race.WHITE.value,
           "DP1_0096": std_col.Race.BLACK.value,
           "DP1_0097": std_col.Race.AIAN.value,
           "DP1_0098": std_col.Race.OTHER_STANDARD.value,
           "DP1_0099": std_col.Race.MULTI.value,
           "DP1_0105": std_col.Race.HISP.value},
    "GU": {"DP1_0076": std_col.Race.ALL.value,
           "DP1_0078": std_col.Race.NHPI.value,
           "DP1_0090": std_col.Race.ASIAN.value,
           "DP1_0099": std_col.Race.WHITE.value,
           "DP1_0100": std_col.Race.BLACK.value,
           "DP1_0101": std_col.Race.AIAN.value,
           "DP1_0102": std_col.Race.OTHER_STANDARD.value,
           "DP1_0103": std_col.Race.MULTI.value,
           "DP1_0110": std_col.Race.HISP.value},
    "MP": {"DP1_0076": std_col.Race.ALL.value,
           "DP1_0078": std_col.Race.ASIAN.value,
           "DP1_0087": std_col.Race.NHPI.value,
           "DP1_0097": std_col.Race.WHITE.value,
           "DP1_0098": std_col.Race.BLACK.value,
           "DP1_0099": std_col.Race.AIAN.value,
           "DP1_0100": std_col.Race.OTHER_STANDARD.value,
           "DP1_0101": std_col.Race.MULTI.value,
           "DP1_0108": std_col.Race.HISP.value},
    "VI": {"DP1_0076": std_col.Race.ALL.value,
           "DP1_0078": std_col.Race.BLACK.value,
           "DP1_0094": std_col.Race.WHITE.value,
           "DP1_0095": std_col.Race.ASIAN.value,
           "DP1_0096": std_col.Race.AIAN.value,
           "DP1_0097": std_col.Race.NHPI.value,
           "DP1_0098": std_col.Race.OTHER_STANDARD.value,
           "DP1_0099": std_col.Race.MULTI.value,
           "DP1_0105": std_col.Race.HISP.value,
           "DP1_0112": std_col.Race.BLACK_NH.value,
           "DP1_0113": std_col.Race.WHITE_NH.value,
           "DP1_0114": std_col.Race.OTHER_NONSTANDARD_NH.value,
           "DP1_0115": std_col.Race.MULTI_NH.value}
}

SEX_CODES_TO_STD = {"DP1_0001": std_col.ALL_VALUE,
                    "DP1_0049": Sex.FEMALE,
                    "DP1_0025": Sex.MALE}

AGE_CODES_TO_STD = {"DP1_0001": std_col.ALL_VALUE,
                    "DP1_0002": "0-4",
                    "DP1_0003": "5-9",
                    "DP1_0004": "10-14",
                    "DP1_0005": "15-19",
                    "DP1_0006": "20-24",
                    "DP1_0007": "25-29",
                    "DP1_0008": "30-34",
                    "DP1_0009": "35-39",
                    "DP1_0010": "40-44",
                    "DP1_0011": "45-49",
                    "DP1_0012": "50-54",
                    "DP1_0013": "55-59",
                    "DP1_0014": "60-64",
                    "DP1_0015": "65-69",
                    "DP1_0016": "70-74",
                    "DP1_0017": "75-79",
                    "DP1_0018": "80-84",
                    "DP1_0019": "85+",
                    "DP1_0020": "16+",
                    "DP1_0021": "18+",
                    "DP1_0022": "21+",
                    "DP1_0023": "62+",
                    "DP1_0024": "65+"}


# SOME DATA SOURCES USE AGE BUCKETS WE CAN GENERATE BY SUMMING THE GIVEN ONES ABOVE
STD_AGES_SUM_MAP = {
    # DECADE AGE BUCKETS
    ("0-4", "5-9"): "0-9",
    ("10-14", "15-19"): "10-19",
    ("20-24", "25-29"): "20-29",
    ("30-34", "35-39"): "30-39",
    ("40-44", "45-49"): "40-49",
    ("50-54", "55-59"): "50-59",
    ("60-64", "65-69"): "60-69",
    ("70-74", "75-79"): "70-79",
    ("80-84", "85+"): "80+",

    # EXTRA UHC DECADE PLUS 5 AGE BUCKETS
    ("15-19", "20-24"): "15-24",
    ("25-29", "30-34"): "25-34",
    ("35-39", "40-44"): "35-44",
    ("45-49", "50-54"): "45-54",
    ("55-59", "60-64"): "55-64",
    ("65-69", "70-74"): "65-74",
    ("75-79", "80-84"): "75-84",
    # EXTRA UHC STANDARD AGE BUCKETS
    ("45-49", "50-54", "55-59", "60-64"): "45-64",
    # UNAVAILABLE AGE BUCKETS
    # "18-24", "18-44"
}


COMBO_RACES_SUM_MAP = {
    # note each territry only has other_standard or other_nonstandard but not both,
    # so we can include both in the sum
    (std_col.Race.MULTI.value,
     std_col.Race.OTHER_STANDARD.value,
     std_col.Race.OTHER_NONSTANDARD.value): std_col.Race.MULTI_OR_OTHER_STANDARD.value,
    (std_col.Race.MULTI_NH.value,
     std_col.Race.OTHER_STANDARD_NH.value,
     std_col.Race.OTHER_NONSTANDARD_NH.value): std_col.Race.MULTI_OR_OTHER_STANDARD_NH.value,
    (std_col.Race.AIAN.value,
     std_col.Race.ASIAN.value,
     std_col.Race.NHPI.value): std_col.Race.AIAN_API.value
}

NON_NH_TO_NH_RACE_MAP = {
    std_col.Race.NHPI.value: std_col.Race.NHPI_NH.value,
    std_col.Race.ASIAN.value: std_col.Race.ASIAN_NH.value,
    std_col.Race.WHITE.value: std_col.Race.WHITE_NH.value,
    std_col.Race.BLACK.value: std_col.Race.BLACK_NH.value,
    std_col.Race.AIAN.value: std_col.Race.AIAN_NH.value,
    std_col.Race.OTHER_STANDARD.value: std_col.Race.OTHER_STANDARD_NH.value,
    std_col.Race.MULTI.value: std_col.Race.MULTI_NH.value,

}


ISLAND_SOURCE_FILE_MAP = {
    "AS": "DECENNIALDPAS2020.DP1-Data.csv",
    "GU": "DECENNIALDPGU2020.DP1-Data.csv",
    "MP": "DECENNIALDPMP2020.DP1-Data.csv",
    "VI": "DECENNIALDPVI2020.DP1-Data.csv"
}

# used to differentiate renamed columns before melting into HET style df
TMP_COUNT_SUFFIX: Final = '_count'
COUNT_CHAR: Final = "C"
TMP_PCT_SHARE_SUFFIX: Final = '_pct_share'
PCT_CHAR: Final = "P"


class Decia2020TerritoryPopulationData(DataSource):
    @ staticmethod
    def get_id():
        return 'DECIA_2020_TERRITORY_POPULATION_DATA'

    @ staticmethod
    def get_table_name():
        return 'decia_2020_territory_population_data'

    def upload_to_gcs(self, gcs_bucket, **attrs):
        raise NotImplementedError(
            'upload_to_gcs should not be called for Decia2020TerritoryPopulationData')

    def write_to_bq(self, dataset, gcs_bucket, **attrs):

        # get GEO and DEMO from DAG payload
        breakdown = self.get_attr(attrs, 'demographic')
        geo_level = self.get_attr(attrs, 'geographic')
        raw_dfs_by_postal_map = load_source_dfs()
        df = self.generate_breakdown_df(
            raw_dfs_by_postal_map, breakdown, geo_level)
        float_cols = [std_col.POPULATION_COL, std_col.POPULATION_PCT_COL]
        column_types = gcs_to_bq_util.get_bq_column_types(
            df, float_cols=float_cols)
        table_name = f'by_{breakdown}_territory_{geo_level}_level'
        gcs_to_bq_util.add_df_to_bq(df, dataset, table_name,
                                    column_types=column_types)

    def generate_breakdown_df(self,
                              raw_dfs_by_postal_map: Dict[str, pd.DataFrame],
                              breakdown: Literal["age", "sex", "race_and_ethnicity"],
                              geo_level: Literal["state", "county"]):
        """generate_breakdown_df generates a territory population data frame for a given combo
         of demographic breakdown and geographic level
        breakdown: string for type of demographic disaggregation
        geo_level: string for geographic level (state = territory, county = territory county equivalent) """

        if geo_level == COUNTY_LEVEL:
            geo_col = std_col.COUNTY_FIPS_COL
        if geo_level == STATE_LEVEL:
            geo_col = std_col.STATE_FIPS_COL

        rename_map: Dict[str, str] = {}
        value_cols = []
        cleaned_dfs: List[pd.DataFrame] = []

        for postal, raw_df in raw_dfs_by_postal_map.items():
            raw_df = format_fips_col(raw_df, geo_col)

            # determine relevant values columns and their mapping to HET groups via tmp columns
            if breakdown == std_col.AGE_COL:
                value_cols = get_value_cols(AGE_CODES_TO_STD)
                rename_map = get_rename_map(AGE_CODES_TO_STD)
            if breakdown == std_col.SEX_COL:
                value_cols = get_value_cols(SEX_CODES_TO_STD)
                rename_map = get_rename_map(SEX_CODES_TO_STD)
            if breakdown == std_col.RACE_OR_HISPANIC_COL:
                value_cols = get_value_cols(RACE_CODES_TO_STD[postal])
                rename_map = get_rename_map(RACE_CODES_TO_STD[postal])

            # cleanup and store raw dfs
            raw_df[value_cols] = raw_df[value_cols].replace(
                ['-', '(X)'], np.nan)
            raw_df[value_cols] = raw_df[value_cols].astype(float)
            needed_cols = [geo_col] + value_cols
            raw_df = raw_df[needed_cols]
            raw_df = raw_df.rename(columns=rename_map)

            if breakdown == std_col.RACE_OR_HISPANIC_COL:
                # non-VI gets nh/non-nh fill ins
                if postal in ["AS", "GU", "MP"]:
                    raw_df = use_nonNH_as_NH(raw_df)
                # every island gets needed combo races
                raw_df = add_combo_race_cols(raw_df)
            cleaned_dfs.append(raw_df)

        # combine cleaned per-island dfs into one
        df = pd.concat(cleaned_dfs, ignore_index=True)

        if breakdown == std_col.SEX_COL:
            count_group_cols_map = get_melt_map(
                SEX_CODES_TO_STD, TMP_COUNT_SUFFIX)
            pct_share_group_cols_map = get_melt_map(
                SEX_CODES_TO_STD, TMP_PCT_SHARE_SUFFIX)
        if breakdown == std_col.RACE_OR_HISPANIC_COL:

            race_map: Dict[Any, str] = {
                **RACE_CODES_TO_STD[postal],
                **NON_NH_TO_NH_RACE_MAP,
                **COMBO_RACES_SUM_MAP
            }
            count_group_cols_map = get_melt_map(
                race_map, TMP_COUNT_SUFFIX)
            pct_share_group_cols_map = get_melt_map(
                race_map, TMP_PCT_SHARE_SUFFIX)

        if breakdown == std_col.AGE_COL:
            df = generate_summed_age_cols(df)
            count_group_cols_map = get_melt_map(
                AGE_CODES_TO_STD, TMP_COUNT_SUFFIX)
            pct_share_group_cols_map = get_melt_map(
                AGE_CODES_TO_STD, TMP_PCT_SHARE_SUFFIX)
            # extend the melt maps to include summed age bucket cols
            count_group_cols_map = {
                **count_group_cols_map,
                **get_melt_map(STD_AGES_SUM_MAP, TMP_COUNT_SUFFIX)
            }
            pct_share_group_cols_map = {
                **pct_share_group_cols_map,
                **get_melt_map(STD_AGES_SUM_MAP, TMP_PCT_SHARE_SUFFIX)
            }

        demo_col = (std_col.RACE_CATEGORY_ID_COL if breakdown ==
                    std_col.RACE_OR_HISPANIC_COL else breakdown)
        df = dataset_utils.melt_to_het_style_df(
            df,
            cast(DEMOGRAPHIC_TYPE, demo_col),
            [geo_col],
            {std_col.POPULATION_COL: count_group_cols_map,
                std_col.POPULATION_PCT_COL: pct_share_group_cols_map}
        )

        if geo_level == COUNTY_LEVEL:
            df = merge_county_names(df)
            df[std_col.STATE_FIPS_COL] = df[
                std_col.COUNTY_FIPS_COL].str.slice(0, 2)
        df = merge_state_ids(df)
        if breakdown == std_col.RACE_OR_HISPANIC_COL:
            std_col.add_race_columns_from_category_id(df)
        df = df.sort_values([geo_col, breakdown]).reset_index(drop=True)
        return df


def load_source_dfs() -> Dict[str, pd.DataFrame]:
    """ Loads raw files, returns a dict mapping territory
    postal code to its raw source df. Drops the row after the
    source header that contains non-code semi-humanreadable col
    details. """
    return {
        postal: gcs_to_bq_util.load_csv_as_df_from_data_dir(
            "decia_2020_territory_population",
            filename).drop([0]) for postal, filename in ISLAND_SOURCE_FILE_MAP.items()
    }


def get_source_col_names(source_codes_map: Dict[str, str],
                         metric: Literal["_count", "_pct_share"]
                         ) -> List[str]:
    """ source_codes_map: a dict of partial codes to standard group names
    metric type: string determining requested metric type code letter
    returns: list of string source code column names"""
    if metric == TMP_COUNT_SUFFIX:
        suffix_char = COUNT_CHAR
    if metric == TMP_PCT_SHARE_SUFFIX:
        suffix_char = PCT_CHAR
    return [
        f'{code}{suffix_char}' for code in list(source_codes_map.keys())
    ]


def generate_summed_age_cols(df: pd.DataFrame) -> pd.DataFrame:
    """ Where possible, generates alternate age-buckets by
    combining those from the source.
    Example: "10-19" = "10-14" + "15-19"
    df: pre-melted, wide/short decennial df that contains
        unique columns for each age group
    returns same df with additional columns. Temp added column names
        will be the the newgroup plus the tmp_metric_suffix; the added
        column values will be the mathematical sum (both COUNT and PCT_SHARE can sum)
     """

    for buckets_to_sum_tuple, summed_bucket in STD_AGES_SUM_MAP.items():
        for metric_suffix in [TMP_COUNT_SUFFIX, TMP_PCT_SHARE_SUFFIX]:
            cols_to_sum = [
                f'{bucket}{metric_suffix}' for bucket in buckets_to_sum_tuple
            ]
            df[f'{summed_bucket}{metric_suffix}'] = df[cols_to_sum].sum(
                min_count=1, axis=1)
    return df


def format_fips_col(df: pd.DataFrame, geo_col: str) -> pd.DataFrame:
    """ Replace the Census `GEO_ID` col with a standardized geo_col
    ("state_fips" or "county_fips")"""

    # FIPS codes are at the end of the string
    df[geo_col] = df["GEO_ID"].str.split('US').str[1]
    # only keep the requested geo level rows
    if geo_col == std_col.STATE_FIPS_COL:
        df = df[df[geo_col].str.len() == 2]
    if geo_col == std_col.COUNTY_FIPS_COL:
        df = df[df[geo_col].str.len() == 5]
    df.drop(columns=["GEO_ID"])
    return df


def get_value_cols(code_map: Dict):
    """ Returns a list of all Census source columns that contain counts or pct_shares """
    return get_source_col_names(
        code_map, TMP_COUNT_SUFFIX) + get_source_col_names(
        code_map, TMP_PCT_SHARE_SUFFIX)


def get_rename_map(code_map: Dict) -> Dict[str, str]:
    """ code_map: dict relating Census code prefixes to HET groups.
    Returns a dict map relating Census source col names
    to temporary, pre-melt, HET-group col names"""
    rename_map = {}
    for code, group in code_map.items():
        rename_map[f'{code}{COUNT_CHAR}'] = f'{group}{TMP_COUNT_SUFFIX}'
        rename_map[f'{code}{PCT_CHAR}'] = f'{group}{TMP_PCT_SHARE_SUFFIX}'
    return rename_map


def get_melt_map(code_map: Dict, metric_suffix: Literal["_count", "_pct_share"]) -> Dict[str, str]:
    """ code_map: dict where only the values will be used as the group to relate between
        temp group metric col and group row value in the metric col
    metric_suffix: str determining which metric
    Returns a map for melting the temporary, pre-melt,
    HET-group metric col names into final HET groups used per row in the metric col
"""
    return {
        f'{group}{metric_suffix}': group for group in code_map.values()
    }


def use_nonNH_as_NH(df: pd.DataFrame) -> pd.DataFrame:
    """ For AS, GU, MP, the Census does not provide _NH specific races;
    only races that don't account for ethnicity. This is likely due to the
    extremely small number of Hispanic people in these areas. To allow for
    merging these island populations onto more of our data sources, we duplicate
    the non-NH races as the NH races when they are not provided (as in VI) """

    for non_nh_col, nh_col in NON_NH_TO_NH_RACE_MAP.items():
        df[f'{nh_col}_count'] = df[f'{non_nh_col}_count']
        df[f'{nh_col}_pct_share'] = df[f'{non_nh_col}_pct_share']

    return df


def add_combo_race_cols(df: pd.DataFrame) -> pd.DataFrame:
    """ Certain data sources use composite race groups that combine
    standard Census race/ethnicity groups into composite groups.

    Returns df with new tmp columns for each combo-group-metric; which will later be melted into HET style table """

    for suffix in ["_count", "_pct_share"]:
        for races_to_sum_tuple, combo_race in COMBO_RACES_SUM_MAP.items():
            race_cols_to_sum = [
                f'{race}{suffix}' for race in races_to_sum_tuple if f'{race}{suffix}' in df.columns]
            df[f'{combo_race}{suffix}'] = df[race_cols_to_sum].sum(axis=1)

    return df
