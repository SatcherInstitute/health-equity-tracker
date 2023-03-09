import numpy as np
import pandas as pd
from datasources.data_source import DataSource
from ingestion.constants import (COUNTY_LEVEL,
                                 STATE_LEVEL,
                                 Sex)
from ingestion import gcs_to_bq_util, standardized_columns as std_col, dataset_utils

from ingestion.merge_utils import merge_county_names, merge_state_ids
from typing import Literal, cast
from ingestion.types import DEMOGRAPHIC_TYPE


"""

American Samoa (doesn't provide NH races?)
"DP1_0076C","Number!!RACE!!Total population"
"DP1_0078C","Number!!RACE!!Total population!!One Race!!Native Hawaiian and Other Pacific Islander"
"DP1_0086C","Number!!RACE!!Total population!!One Race!!Asian"
"DP1_0095C","Number!!RACE!!Total population!!One Race!!White"
"DP1_0096C","Number!!RACE!!Total population!!One Race!!Black or African American"
"DP1_0097C","Number!!RACE!!Total population!!One Race!!American Indian and Alaska Native"
"DP1_0098C","Number!!RACE!!Total population!!One Race!!Some Other Race"
"DP1_0099C","Number!!RACE!!Total population!!Two or More Races"
"DP1_0105C","Number!!HISPANIC OR LATINO ORIGIN!!Total population!!Hispanic or Latino (of any race)"

Guam  (doesn't provide NH races?)
"DP1_0076C","Number!!RACE!!Total population"
"DP1_0078C","Number!!RACE!!Total population!!One Race!!Native Hawaiian and Other Pacific Islander"
"DP1_0090C","Number!!RACE!!Total population!!One Race!!Asian"
"DP1_0099C","Number!!RACE!!Total population!!One Race!!White"
"DP1_0100C","Number!!RACE!!Total population!!One Race!!Black or African American"
"DP1_0101C","Number!!RACE!!Total population!!One Race!!American Indian and Alaska Native"
"DP1_0102C","Number!!RACE!!Total population!!One Race!!Some Other Race"
"DP1_0103C","Number!!RACE!!Total population!!Two or More Races"
"DP1_0110C","Number!!HISPANIC OR LATINO ORIGIN!!Total population!!Hispanic or Latino (of any race)"

Mariana Islands (doesn't provide NH races?)
"DP1_0076C","Number!!RACE!!Total population"
"DP1_0078C","Number!!RACE!!Total population!!One Race!!Asian"
"DP1_0087C","Number!!RACE!!Total population!!One Race!!Native Hawaiian and Other Pacific Islander"
"DP1_0097C","Number!!RACE!!Total population!!One Race!!White"
"DP1_0098C","Number!!RACE!!Total population!!One Race!!Black or African American"
"DP1_0099C","Number!!RACE!!Total population!!One Race!!American Indian and Alaska Native"
"DP1_0100C","Number!!RACE!!Total population!!One Race!!Some Other Race"
"DP1_0101C","Number!!RACE!!Total population!!Two or More Races"
"DP1_0108C","Number!!HISPANIC OR LATINO ORIGIN!!Total population!!Hispanic or Latino (of any race)"

Virgin Islands
"DP1_0076C","Number!!RACE!!Total population"
"DP1_0078C","Number!!RACE!!Total population!!One Race!!Black or African American"
"DP1_0094C","Number!!RACE!!Total population!!One Race!!White"
"DP1_0095C","Number!!RACE!!Total population!!One Race!!Asian"
"DP1_0096C","Number!!RACE!!Total population!!One Race!!American Indian and Alaska Native"
"DP1_0097C","Number!!RACE!!Total population!!One Race!!Native Hawaiian and Other Pacific Islander"
"DP1_0098C","Number!!RACE!!Total population!!One Race!!Some Other Race"
"DP1_0099C","Number!!RACE!!Total population!!Two or More Races"
"DP1_0105C","Number!!HISPANIC OR LATINO ORIGIN AND RACE!!Total population!!Hispanic or Latino (of any race)"

Virgin Islands NH
"DP1_0112C","Number!!HISPANIC OR LATINO ORIGIN AND RACE!!Total population!!Not Hispanic or Latino!!One Race!!Black or African American"
"DP1_0113C","Number!!HISPANIC OR LATINO ORIGIN AND RACE!!Total population!!Not Hispanic or Latino!!One Race!!White"
"DP1_0114C","Number!!HISPANIC OR LATINO ORIGIN AND RACE!!Total population!!Not Hispanic or Latino!!One Race!!Other races [6]"
"DP1_0115C","Number!!HISPANIC OR LATINO ORIGIN AND RACE!!Total population!!Not Hispanic or Latino!!Two or More Races"
"""


SEX_COUNT_COLS_TO_STD = {
    "DP1_0001C": std_col.ALL_VALUE,
    "DP1_0049C": Sex.FEMALE,
    "DP1_0025C": Sex.MALE
}

SEX_PCT_SHARE_COLS_TO_STD = {
    "DP1_0001P": std_col.ALL_VALUE,
    "DP1_0049P": Sex.FEMALE,
    "DP1_0025P": Sex.MALE
}


AGE_COUNT_COLS_TO_STD = {
    "DP1_0001C": std_col.ALL_VALUE,
    "DP1_0002C": "0-4",
    "DP1_0003C": "5-9",
    "DP1_0004C": "10-14",
    "DP1_0005C": "15-19",
    "DP1_0006C": "20-24",
    "DP1_0007C": "25-29",
    "DP1_0008C": "30-34",
    "DP1_0009C": "35-39",
    "DP1_0010C": "40-44",
    "DP1_0011C": "45-49",
    "DP1_0012C": "50-54",
    "DP1_0013C": "55-59",
    "DP1_0014C": "60-64",
    "DP1_0015C": "65-69",
    "DP1_0016C": "70-74",
    "DP1_0017C": "75-79",
    "DP1_0018C": "80-84",
    "DP1_0019C": "85+",
    "DP1_0020C": "16+",
    "DP1_0021C": "18+",
    "DP1_0022C": "21+",
    "DP1_0023C": "62+",
    "DP1_0024C": "65+",
}

AGE_PCT_SHARE_COLS_TO_STD = {
    "DP1_0001P": std_col.ALL_VALUE,
    "DP1_0002P": "0-4",
    "DP1_0003P": "5-9",
    "DP1_0004P": "10-14",
    "DP1_0005P": "15-19",
    "DP1_0006P": "20-24",
    "DP1_0007P": "25-29",
    "DP1_0008P": "30-34",
    "DP1_0009P": "35-39",
    "DP1_0010P": "40-44",
    "DP1_0011P": "45-49",
    "DP1_0012P": "50-54",
    "DP1_0013P": "55-59",
    "DP1_0014P": "60-64",
    "DP1_0015P": "65-69",
    "DP1_0016P": "70-74",
    "DP1_0017P": "75-79",
    "DP1_0018P": "80-84",
    "DP1_0019P": "85+",
    "DP1_0020P": "16+",
    "DP1_0021P": "18+",
    "DP1_0022P": "21+",
    "DP1_0023P": "62+",
    "DP1_0024P": "65+"
}

AGE_SUMMED_COUNT_COLS_TO_STD = {
    # DECADE AGE BUCKETS
    ("DP1_0002C", "DP1_0003C"): "0-9",
    ("DP1_0004C", "DP1_0005C"): "10-19",
    ("DP1_0006C", "DP1_0007C"): "20-29",
    ("DP1_0008C", "DP1_0009C"): "30-39",
    ("DP1_0010C", "DP1_0011C"): "40-49",
    ("DP1_0012C", "DP1_0013C"): "50-59",
    ("DP1_0014C", "DP1_0015C"): "60-69",
    ("DP1_0016C", "DP1_0017C"): "70-79",
    ("DP1_0018C", "DP1_0019C"): "80+",

    # EXTRA UHC DECADE PLUS 5 AGE BUCKETS
    ("DP1_0005C", "DP1_0006C"): "15-24",
    ("DP1_0007C", "DP1_0008C"): "25-34",
    ("DP1_0009C", "DP1_0010C"): "35-44",
    ("DP1_0011C", "DP1_0012C"): "45-54",
    ("DP1_0013C", "DP1_0014C"): "55-64",
    ("DP1_0015C", "DP1_0016C"): "65-74",
    ("DP1_0017C", "DP1_0018C"): "75-84",
    # EXTRA UHC STANDARD AGE BUCKETS
    ("DP1_0011C", "DP1_0012C", "DP1_0013C", "DP1_0014C"): "45-64",
    # UNAVAILABLE AGE BUCKETS
    # "18-24", "18-44"
}

AGE_SUMMED_PCT_SHARE_COLS_TO_STD = {
    # DECADE AGE BUCKETS
    ("DP1_0002P", "DP1_0003P"): "0-9",
    ("DP1_0004P", "DP1_0005P"): "10-19",
    ("DP1_0006P", "DP1_0007P"): "20-29",
    ("DP1_0008P", "DP1_0009P"): "30-39",
    ("DP1_0010P", "DP1_0011P"): "40-49",
    ("DP1_0012P", "DP1_0013P"): "50-59",
    ("DP1_0014P", "DP1_0015P"): "60-69",
    ("DP1_0016P", "DP1_0017P"): "70-79",
    ("DP1_0018P", "DP1_0019P"): "80+",

    # EXTRA UHC DECADE PLUS 5 AGE BUCKETS
    ("DP1_0005P", "DP1_0006P"): "15-24",
    ("DP1_0007P", "DP1_0008P"): "25-34",
    ("DP1_0009P", "DP1_0010P"): "35-44",
    ("DP1_0011P", "DP1_0012P"): "45-54",
    ("DP1_0013P", "DP1_0014P"): "55-64",
    ("DP1_0015P", "DP1_0016P"): "65-74",
    ("DP1_0017P", "DP1_0018P"): "75-84",
    # EXTRA UHC STANDARD AGE BUCKETS
    ("DP1_0011P", "DP1_0012P", "DP1_0013P", "DP1_0014P"): "45-64",
    # UNAVAILABLE AGE BUCKETS
    # "18-24", "18-44"
}

RACE_COUNT_COLS_TO_STD = {
    "DP1_0076C": std_col.Race.ALL.value,
    "DP1_0105C": std_col.Race.HISP.value,
    # Ethnicity-agnostic races
    "DP1_0078C": std_col.Race.NHPI.value,
    "DP1_0086C": std_col.Race.ASIAN.value,
    "DP1_0095C": std_col.Race.WHITE.value,
    "DP1_0096C": std_col.Race.BLACK.value,
    "DP1_0097C": std_col.Race.AIAN.value,
    "DP1_0098C": std_col.Race.OTHER_STANDARD.value,
    "DP1_0099C": std_col.Race.MULTI.value,
    # NH Races
    "DP1_0112C": std_col.Race.BLACK_NH.value,
    "DP1_0113C": std_col.Race.WHITE_NH.value,
    "DP1_0114C": std_col.Race.OTHER_NONSTANDARD_NH.value,
    "DP1_0115C": std_col.Race.MULTI_NH.value,
}

RACE_PCT_SHARE_COLS_TO_STD = {
    "DP1_0076P": std_col.Race.ALL.value,
    "DP1_0105P": std_col.Race.HISP.value,
    # Ethnicity-agnostic races
    "DP1_0078P": std_col.Race.NHPI.value,
    "DP1_0086P": std_col.Race.ASIAN.value,
    "DP1_0095P": std_col.Race.WHITE.value,
    "DP1_0096P": std_col.Race.BLACK.value,
    "DP1_0097P": std_col.Race.AIAN.value,
    "DP1_0098P": std_col.Race.OTHER_STANDARD.value,
    "DP1_0099P": std_col.Race.MULTI.value,
    # NH Races
    "DP1_0112P": std_col.Race.BLACK_NH.value,
    "DP1_0113P": std_col.Race.WHITE_NH.value,
    "DP1_0114P": std_col.Race.OTHER_NONSTANDARD_NH.value,
    "DP1_0115P": std_col.Race.MULTI_NH.value,
}


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

        for geo_level in [
            COUNTY_LEVEL,
            STATE_LEVEL
        ]:

            for breakdown in [
                std_col.AGE_COL,
                std_col.RACE_OR_HISPANIC_COL,
                std_col.SEX_COL
            ]:
                table_name = f'by_{breakdown}_territory_{geo_level}_level'
                df = self.generate_breakdown_df(breakdown, geo_level)

                float_cols = [
                    std_col.POPULATION_COL,
                    std_col.POPULATION_PCT_COL
                ]
                column_types = gcs_to_bq_util.get_bq_column_types(
                    df,
                    float_cols=float_cols
                )
                gcs_to_bq_util.add_df_to_bq(df,
                                            dataset,
                                            table_name,
                                            column_types=column_types
                                            )

    def generate_breakdown_df(self,
                              breakdown: Literal["age", "sex", "race_and_ethnicity"],
                              geo_level: Literal["state", "county"]):
        """generate_breakdown_df generates a territory population data frame by breakdown and geo_level

        breakdown: string for type of demographic disaggregation
        geo_level: string for geographic level """

        FIPS = std_col.COUNTY_FIPS_COL if geo_level == COUNTY_LEVEL else std_col.STATE_FIPS_COL

        source_files = [
            "DECENNIALDPAS2020.DP1-Data.csv",
            "DECENNIALDPGU2020.DP1-Data.csv",
            "DECENNIALDPMP2020.DP1-Data.csv",
            "DECENNIALDPVI2020.DP1-Data.csv"
        ]

        source_dfs = [
            gcs_to_bq_util.load_csv_as_df_from_data_dir(
                "decia_2020_territory_population",
                file).drop([0]) for file in source_files
        ]

        df = pd.concat(source_dfs, ignore_index=True)
        value_cols = [
            col for col in df.columns if col not in [
                "GEO_ID", "NAME"]]
        df[value_cols] = df[value_cols].replace(['-', '(X)'], np.nan)
        df[value_cols] = df[value_cols].astype(float)

        df[FIPS] = df["GEO_ID"].str.split('US').str[1]
        if geo_level == STATE_LEVEL:
            df = df[df[FIPS].str.len() == 2]
        if geo_level == COUNTY_LEVEL:
            df = df[df[FIPS].str.len() == 5]

        if breakdown == std_col.SEX_COL:
            count_group_cols_map = SEX_COUNT_COLS_TO_STD
            pct_share_group_cols_map = SEX_PCT_SHARE_COLS_TO_STD

        if breakdown == std_col.RACE_OR_HISPANIC_COL:
            count_group_cols_map = RACE_COUNT_COLS_TO_STD
            pct_share_group_cols_map = RACE_PCT_SHARE_COLS_TO_STD

        if breakdown == std_col.AGE_COL:
            df = generate_summed_age_cols(df)
            count_group_cols_map = AGE_COUNT_COLS_TO_STD
            pct_share_group_cols_map = AGE_PCT_SHARE_COLS_TO_STD

            # extend the melt maps to include melting newly summed cols
            for cols_to_sum_tuple, bucket in AGE_SUMMED_COUNT_COLS_TO_STD.items():
                tmp_sum_col_name = "+++".join(cols_to_sum_tuple)
                count_group_cols_map[tmp_sum_col_name] = bucket
            for cols_to_sum_tuple, bucket in AGE_SUMMED_PCT_SHARE_COLS_TO_STD.items():
                tmp_sum_col_name = "+++".join(cols_to_sum_tuple)
                pct_share_group_cols_map[tmp_sum_col_name] = bucket

        data_cols = (list(count_group_cols_map.keys()) +
                     list(pct_share_group_cols_map.keys()))
        keep_cols = data_cols + [FIPS]
        df = df[keep_cols]

        demo_col = (std_col.RACE_CATEGORY_ID_COL if breakdown ==
                    std_col.RACE_OR_HISPANIC_COL else breakdown)
        df = dataset_utils.melt_to_het_style_df(
            df,
            cast(DEMOGRAPHIC_TYPE, demo_col),
            [FIPS],
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

        df = df.sort_values([FIPS, breakdown]).reset_index(drop=True)

        return df


def generate_summed_age_cols(df: pd.DataFrame) -> pd.DataFrame:
    """ Where possible, generates alternate age-buckets by
    combining those from the source.
    Example: "10-19" = "10-14" + "15-19"

    df: pre-melted, wide/short decennial df that contains
        unique columns for each age group
    returns same df with additional columns. Temp added column names
        will be the the concatenation of the used columns; the added
        column values will be the mathematical sum (both COUNT and PCT_SHARE can sum)
     """

    for summed_groups_map in [
        AGE_SUMMED_COUNT_COLS_TO_STD,
        AGE_SUMMED_PCT_SHARE_COLS_TO_STD
    ]:
        for cols_to_sum_tuple in summed_groups_map.keys():
            tmp_sum_col_name = "+++".join(cols_to_sum_tuple)
            df[tmp_sum_col_name] = df[
                list(cols_to_sum_tuple)].sum(min_count=1, axis=1)
    return df
