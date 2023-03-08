import numpy as np
import pandas as pd
from datasources.data_source import DataSource
from ingestion.constants import (COUNTY_LEVEL,
                                 STATE_LEVEL,
                                 Sex,


                                 )
from ingestion import gcs_to_bq_util, standardized_columns as std_col, dataset_utils

from ingestion.merge_utils import merge_county_names
from typing import Literal


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
    "DP1_0001C": std_col.ALL_VALUE
}

AGE_PCT_SHARE_COLS_TO_STD = {
    "DP1_0001P": std_col.ALL_VALUE,
}

RACE_COUNT_COLS_TO_STD = {
    "DP1_0076C": std_col.Race.ALL.value,
}

RACE_PCT_SHARE_COLS_TO_STD = {
    "DP1_0076P": std_col.Race.ALL.value,
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
                # std_col.AGE_COL,
                # std_col.RACE_OR_HISPANIC_COL,
                std_col.SEX_COL
            ]:
                table_name = f'by_{breakdown}_territory_{geo_level}_level'
                df = self.generate_breakdown_df(breakdown, geo_level)

                float_cols = [
                    std_col.POPULATION_COL,
                    std_col.POPULATION_PCT_COL
                ]
                # column_types = gcs_to_bq_util.get_bq_column_types(
                #     df,
                #     float_cols=float_cols
                # )
                gcs_to_bq_util.add_df_to_bq(df,
                                            dataset,
                                            table_name,
                                            # column_types=column_types
                                            )

    def generate_breakdown_df(self,
                              breakdown: Literal["age", "sex", "race_and_ethnicity"],
                              geo_level: Literal["state", "county"]):
        """generate_breakdown_df generates a territory population data frame by breakdown and geo_level

        breakdown: string for type of demographic disaggregation
        geo_level: string for geographic level """

        GEO_COL = std_col.COUNTY_NAME_COL if geo_level == COUNTY_LEVEL else std_col.STATE_NAME_COL
        FIPS = std_col.COUNTY_FIPS_COL if geo_level == COUNTY_LEVEL else std_col.STATE_FIPS_COL

        # columns_to_standard = {
        #     'Age Group': std_col.AGE_COL,
        #     'Cases': std_col.HIV_DIAGNOSES,
        #     'FIPS': FIPS,
        #     'Geography': GEO_COL,
        #     'Population': std_col.POPULATION_COL,
        #     'Race/Ethnicity': std_col.RACE_CATEGORY_ID_COL,
        #     'Rate per 100000': std_col.HIV_DIAGNOSES_PER_100K,
        #     'Sex': std_col.SEX_COL,
        #     'Year': std_col.TIME_PERIOD_COL}

        # columns_to_keep = [
        #     GEO_COL,
        #     FIPS,
        #     std_col.TIME_PERIOD_COL,
        #     breakdown,
        #     std_col.HIV_DIAGNOSES,
        #     std_col.HIV_DIAGNOSES_PER_100K,
        #     std_col.HIV_DIAGNOSES_PCT_SHARE,
        #     std_col.HIV_POPULATION_PCT,
        #     std_col.HIV_DIAGNOSES_PCT_INEQUITY]

        american_samoa_df = gcs_to_bq_util.load_csv_as_df_from_data_dir(
            "decia_2020_territory_population",
            "DECENNIALDPAS2020.DP1-Data.csv")

        df = american_samoa_df

        df = df.drop([0])

        df[FIPS] = df["GEO_ID"].str.split('US').str[1]

        if geo_level == STATE_LEVEL:
            df = df[df[FIPS].str.len() == 2]
        if geo_level == COUNTY_LEVEL:
            df = df[df[FIPS].str.len() == 5]

        if breakdown == std_col.SEX_COL:
            count_group_cols_map = SEX_COUNT_COLS_TO_STD
            pct_share_group_cols_map = SEX_PCT_SHARE_COLS_TO_STD

            # df_count = df.copy().rename(columns=SEX_COUNT_COLS_TO_STD)
            # df_count = df_count[[FIPS] + list(SEX_COUNT_COLS_TO_STD.values())]
            # df_count = df_count.melt(id_vars=[FIPS],
            #                          var_name=std_col.SEX_COL,
            #                          value_name=std_col.POPULATION_COL)

            # print("df_count")
            # print(df_count)

            # df_pct_share = df.copy().rename(columns=SEX_PCT_SHARE_COLS_TO_STD)
            # df_pct_share = df_pct_share[[FIPS] +
            #                             list(SEX_PCT_SHARE_COLS_TO_STD.values())]
            # df_pct_share = df_pct_share.melt(id_vars=[FIPS],
            #                                  var_name=std_col.SEX_COL,
            #                                  value_name=std_col.POPULATION_PCT_COL)
            # print("df_pct_share")
            # print(df_pct_share)

            # df = pd.merge(
            #     df_count.reset_index(drop=True),
            #     df_pct_share.reset_index(drop=True),
            #     on=[std_col.SEX_COL, FIPS])

        df = dataset_utils.melt_to_het_style_df(
            df,
            breakdown,
            [FIPS],
            {std_col.POPULATION_COL: count_group_cols_map,
                std_col.POPULATION_PCT_COL: pct_share_group_cols_map}
        )

        # if geo_level == COUNTY_LEVEL:
        #     df = merge_county_names(df)
        #     df[std_col.STATE_FIPS_COL] = df[std_col.COUNTY_FIPS_COL].str.slice(0,
        #                                                                        2)

        # if geo_level == NATIONAL_LEVEL:
        #     df[std_col.STATE_FIPS_COL] = US_FIPS

        # if breakdown == std_col.RACE_OR_HISPANIC_COL:
        #     std_col.add_race_columns_from_category_id(df)
        #     columns_to_keep.append(std_col.RACE_CATEGORY_ID_COL)

        # df = df[columns_to_keep]
        # df = df.sort_values([FIPS, breakdown]).reset_index(drop=True)

        return df
