import pandas as pd
from typing import List, Dict, Literal, cast
from datasources.data_source import DataSource
from ingestion.constants import (COUNTY_LEVEL,
                                 STATE_LEVEL,
                                 NATIONAL_LEVEL,
                                 ALL_VALUE,
                                 US_FIPS,
                                 US_NAME)
from ingestion.dataset_utils import (ensure_leading_zeros,
                                     generate_per_100k_col,
                                     generate_pct_share_col_with_unknowns,
                                     generate_pct_share_col_without_unknowns)
from ingestion import gcs_to_bq_util, standardized_columns as std_col
from ingestion.merge_utils import merge_county_names, merge_pop_numbers
from ingestion.types import SEX_RACE_ETH_AGE_TYPE, SEX_RACE_AGE_TYPE, GEO_TYPE

# constants
PHRMA_DIR = 'phrma'
DTYPE = {'COUNTY_FIPS': str, 'STATE_FIPS': str}

PHRMA_FILE_MAP = {
    "statins": "statins.xlsx"
}

#  INPUT CONSTANTS
COUNT_TOTAL = "TOTAL_BENE"
COUNT_YES = "BENE_YES"
COUNT_NO = "BENE_NO"
ADHERENCE_RATE = "BENE_YES_PCT"

# a nested dictionary that contains values swaps per column name
BREAKDOWN_TO_STANDARD_BY_COL = {
    std_col.AGE_COL: {
        "_18-64": "18-64",
        "_65-74": "65-74",
        "_75-84": "75-84",
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
            COUNTY_LEVEL,
            STATE_LEVEL,
            NATIONAL_LEVEL
        ]:
            alls_df = load_phrma_df_from_data_dir(geo_level, 'all')

            for breakdown in [
                # std_col.AGE_COL,
                std_col.RACE_OR_HISPANIC_COL,
                std_col.SEX_COL
            ]:
                table_name = f'{breakdown}_{geo_level}'
                df = self.generate_breakdown_df(breakdown, geo_level, alls_df)

                float_cols = [
                    "statins_bene_per_100k",
                    "statins_bene_pct_share"
                    "statins_adherence_pct_rate",
                    "statins_adherence_pct_share",
                    "phrma_population_pct"
                ]
                col_types = gcs_to_bq_util.get_bq_column_types(df, float_cols)

                df.to_json(f'phrma-{table_name}.json', orient="records")

                gcs_to_bq_util.add_df_to_bq(df,
                                            dataset,
                                            table_name,
                                            column_types=col_types)

    def generate_breakdown_df(
            self,
            demo_breakdown: Literal['age', 'race_and_ethnicity', 'sex'],
            geo_level: str,
            alls_df: pd.DataFrame
    ):
        """ Generates HET-stye dataframe by demo_breakdown and geo_level

        demo_breakdown: string equal to `age`, `race_and_ethnicity`, or `sex`
        geo_level: string equal to `county`, `national`, or `state`
        alls_df: the data frame containing the all values for each demographic demo_breakdown.
        return: a breakdown df by demographic and geo_level"""

        # give the ALL df a demographic column with correctly capitalized "All"/"ALL" value
        demo_col = std_col.RACE_CATEGORY_ID_COL if demo_breakdown == std_col.RACE_OR_HISPANIC_COL else demo_breakdown
        demo = std_col.RACE_COL if demo_breakdown == std_col.RACE_OR_HISPANIC_COL else demo_breakdown
        all_val = std_col.Race.ALL.value if demo_breakdown == std_col.RACE_OR_HISPANIC_COL else ALL_VALUE
        alls_df[demo_col] = all_val

        fips_to_use = std_col.COUNTY_FIPS_COL if geo_level == COUNTY_LEVEL else std_col.STATE_FIPS_COL

        breakdown_group_df = load_phrma_df_from_data_dir(
            geo_level, demo_breakdown)

        df = pd.concat([breakdown_group_df, alls_df], axis=0)

        df = df.replace(
            to_replace=BREAKDOWN_TO_STANDARD_BY_COL)

        df = merge_pop_numbers(
            df, cast(SEX_RACE_AGE_TYPE, demo), cast(GEO_TYPE, geo_level))

        # statin TOTAL_BENE rate
        df = generate_per_100k_col(
            df, COUNT_TOTAL, std_col.POPULATION_COL, "statins_bene_per_100k")

        # statin ADHERENCE rate
        df["statins_adherence_pct_rate"] = df["BENE_YES_PCT"].multiply(
            100).round()

        if geo_level == COUNTY_LEVEL:
            df = merge_county_names(df)
            df[std_col.STATE_FIPS_COL] = df[std_col.COUNTY_FIPS_COL].str.slice(0,
                                                                               2)

        if demo_breakdown == "race_and_ethnicity":
            df = generate_pct_share_col_with_unknowns(
                df, {COUNT_TOTAL: "statins_bene_pct_share", COUNT_YES: "statins_adherence_pct_share"}, demo_col, all_val, std_col.Race.UNKNOWN.value)
        else:
            df = generate_pct_share_col_without_unknowns(
                df,
                {COUNT_TOTAL: "statins_bene_pct_share",
                    COUNT_YES: "statins_adherence_pct_share"},
                cast(SEX_RACE_ETH_AGE_TYPE, demo_col),
                all_val
            )

        df = df.rename(
            columns={std_col.POPULATION_PCT_COL: "phrma_population_pct"})

        if demo_breakdown == std_col.RACE_OR_HISPANIC_COL:
            std_col.add_race_columns_from_category_id(df)

        df = df.drop(columns=[COUNT_YES, COUNT_NO,
                     COUNT_TOTAL, ADHERENCE_RATE])

        df = df.sort_values(
            by=[fips_to_use, demo_col]).reset_index(drop=True)

        return df


def load_phrma_df_from_data_dir(geo_level: str, breakdown: str) -> pd.DataFrame:
    """ Generates Phrma data by breakdown and geo_level
    geo_level: string equal to `county`, `national`, or `state`
    breakdown: string equal to `age`, `race_and_ethnicity`, `sex`, or `all`
    return: a single data frame of data by demographic breakdown and
        geo_level with data columns loaded from multiple Phrma source tables """

    sheet_name = get_sheet_name(geo_level, breakdown)
    scaffold_cols = get_scaffold_cols(geo_level)
    fips_col = std_col.COUNTY_FIPS_COL if geo_level == COUNTY_LEVEL else std_col. STATE_FIPS_COL
    fips_length = 5 if geo_level == COUNTY_LEVEL else 2

    # Starter cols to merge each loaded table on to
    output_df = pd.DataFrame(columns=scaffold_cols)

    for determinant, filename in PHRMA_FILE_MAP.items():

        topic_df = gcs_to_bq_util.load_xlsx_as_df_from_data_dir(
            PHRMA_DIR,
            filename,
            sheet_name,
            dtype=DTYPE,
            na_values=["."],
        )

        if geo_level == NATIONAL_LEVEL:
            topic_df["STATE_CODE"] = US_FIPS
            topic_df["STATE_NAME"] = US_NAME

        output_df = output_df.merge(topic_df, how='outer')

    output_df = rename_cols(output_df,
                            cast(GEO_TYPE, geo_level),
                            cast(SEX_RACE_ETH_AGE_TYPE, breakdown))

    # drop rows that dont include FIPS and DEMO values
    output_df = output_df[output_df[fips_col].notna()]
    output_df = ensure_leading_zeros(output_df, fips_col, fips_length)

    return output_df


def get_sheet_name(geo_level: str, breakdown: str) -> str:
    """ geo_level: string equal to `county`, `national`, or `state`
   breakdown: string equal to `age`, `race_and_ethnicity`, `sex`, or `all`
   return: a string sheet name based on the provided args  """

    sheet_map = {
        ("all", NATIONAL_LEVEL): "US",
        ("all", STATE_LEVEL): "State",
        ("all", COUNTY_LEVEL): "County",
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


def get_scaffold_cols(geo_level: str) -> List[str]:
    """ Get list of string column names that are consistent across all
    needed sheets to merge """

    scaffold_cols_map = {
        NATIONAL_LEVEL: ["STATE_CODE", "STATE_NAME"],
        STATE_LEVEL: ["STATE_CODE", "STATE_NAME"],
        COUNTY_LEVEL: ["COUNTY_FIPS", "STATE_FIPS",
                       "STATE_NAME", "COUNTY_NAME"]
    }

    return scaffold_cols_map[geo_level]


def rename_cols(df: pd.DataFrame,
                geo_level: Literal['national', 'state', 'county'],
                breakdown:  Literal['age', 'sex', 'race_and_ethnicity']) -> pd.DataFrame:
    """ Renames columns based on the demo/geo breakdown """

    rename_cols_map: Dict[str, str] = {}

    if geo_level == COUNTY_LEVEL:
        rename_cols_map["STATE_FIPS"] = std_col.STATE_FIPS_COL
        rename_cols_map["COUNTY_FIPS"] = std_col.COUNTY_FIPS_COL
        rename_cols_map["STATE_NAME"] = std_col.STATE_NAME_COL
        rename_cols_map["COUNTY_NAME"] = std_col.COUNTY_NAME_COL

    if geo_level in [STATE_LEVEL, NATIONAL_LEVEL]:
        rename_cols_map["STATE_NAME"] = std_col.STATE_NAME_COL
        rename_cols_map["STATE_CODE"] = std_col.STATE_FIPS_COL

    if breakdown == std_col.RACE_OR_HISPANIC_COL:
        rename_cols_map["RACE_NAME"] = std_col.RACE_CATEGORY_ID_COL

    if breakdown == std_col.SEX_COL:
        rename_cols_map["SEX_NAME"] = std_col.SEX_COL

    if breakdown == std_col.AGE_COL:
        rename_cols_map["AGE_GROUP"] = std_col.AGE_COL

    df = df.rename(columns=rename_cols_map)

    return df
