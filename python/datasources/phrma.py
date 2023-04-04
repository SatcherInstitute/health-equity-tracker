import pandas as pd
from typing import List, Dict, Literal, cast
from datasources.data_source import DataSource
from ingestion.constants import (COUNTY_LEVEL,
                                 STATE_LEVEL,
                                 ALL_VALUE, UNKNOWN)
from ingestion.dataset_utils import (ensure_leading_zeros,
                                     generate_pct_share_col_with_unknowns)
from ingestion import gcs_to_bq_util, standardized_columns as std_col
from ingestion.merge_utils import merge_county_names
from ingestion.types import SEX_RACE_ETH_AGE_TYPE, GEO_TYPE

# constants
PHRMA_DIR = 'phrma'
DTYPE = {'COUNTY_FIPS': str, 'STATE_FIPS': str}

PHRMA_FILE_MAP = {
    "sample_topic": "PQA_STA Results_2023-02-09_draft.xlsx"
}

# CDC_ATLAS_COLS = ['Year', 'Geography', 'FIPS']
# CDC_DEM_COLS = ['Age Group', 'Race/Ethnicity', 'Sex']

# DEM_COLS_STANDARD = {
#     std_col.AGE_COL: 'Age Group',
#     std_col.RACE_OR_HISPANIC_COL: 'Race/Ethnicity',
#     std_col.SEX_COL: 'Sex'}


# PCT_SHARE_MAP = {}
# for prefix in HIV_DETERMINANTS.values():
#     PCT_SHARE_MAP[prefix] = std_col.generate_column_name(
#         prefix, std_col.PCT_SHARE_SUFFIX)
# PCT_SHARE_MAP[std_col.HIV_PREP_POPULATION] = std_col.HIV_PREP_POPULATION_PCT
# PCT_SHARE_MAP[std_col.POPULATION_COL] = std_col.HIV_POPULATION_PCT

# PER_100K_MAP = {std_col.PREP_PREFIX: std_col.HIV_PREP_COVERAGE}
# for prefix in HIV_DETERMINANTS.values():
#     if prefix != std_col.PREP_PREFIX:
#         PER_100K_MAP[prefix] = std_col.generate_column_name(
#             prefix, std_col.PER_100K_SUFFIX)

# PCT_RELATIVE_INEQUITY_MAP = {}
# for prefix in HIV_DETERMINANTS.values():
#     PCT_RELATIVE_INEQUITY_MAP[prefix] = std_col.generate_column_name(
#         prefix, std_col.PCT_REL_INEQUITY_SUFFIX)

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
            # STATE_LEVEL,
            # NATIONAL_LEVEL
        ]:
            print("geo_level:", geo_level)
            alls_df = load_phrma_df_from_data_dir(geo_level, 'all')

            for breakdown in [
                # std_col.AGE_COL,
                std_col.RACE_OR_HISPANIC_COL,
                # std_col.SEX_COL
            ]:
                table_name = f'{breakdown}_{geo_level}'
                df = self.generate_breakdown_df(breakdown, geo_level, alls_df)

                float_cols = ["sample_pct_rate",
                              "sample_pct_share", "phrma_population_pct"]
                col_types = gcs_to_bq_util.get_bq_column_types(df, float_cols)

                df.to_json(f'{table_name}.json', orient="records")

                gcs_to_bq_util.add_df_to_bq(df,
                                            dataset,
                                            table_name,
                                            column_types=col_types)

    def generate_breakdown_df(self, demo_breakdown: str, geo_level: str, alls_df: pd.DataFrame):
        """ Generates HET-stye dataframe by demo_breakdown and geo_level

        demo_breakdown: string equal to `age`, `race_and_ethnicity`, or `sex`
        geo_level: string equal to `county`, `national`, or `state`
        alls_df: the data frame containing the all values for each demographic demo_breakdown.
        return: a breakdown df by demographic and geo_level"""

        # give the ALL df a demographic column with correct "All" or "ALL" value
        demo_col = std_col.RACE_CATEGORY_ID_COL if demo_breakdown == std_col.RACE_OR_HISPANIC_COL else demo_breakdown
        all_val = std_col.Race.ALL.value if demo_breakdown == std_col.RACE_OR_HISPANIC_COL else ALL_VALUE
        alls_df[demo_col] = all_val

        fips_to_use = std_col.COUNTY_FIPS_COL if geo_level == COUNTY_LEVEL else std_col.STATE_FIPS_COL

        breakdown_group_df = load_phrma_df_from_data_dir(
            geo_level, demo_breakdown)

        df = pd.concat([breakdown_group_df, alls_df], axis=0)

        df["sample_pct_rate"] = df["AVG PDC RATE"].multiply(100).round()

        unknown_val = std_col.Race.UNKNOWN.value if demo_breakdown == std_col.RACE_OR_HISPANIC_COL else UNKNOWN

        df = df.replace(
            to_replace=BREAKDOWN_TO_STANDARD_BY_COL)

        if geo_level == COUNTY_LEVEL:
            df = merge_county_names(df)
            df[std_col.STATE_FIPS_COL] = df[std_col.COUNTY_FIPS_COL].str.slice(0,
                                                                               2)

        # if geo_level == NATIONAL_LEVEL:
        #     df[std_col.STATE_FIPS_COL] = US_FIPS

        df = generate_pct_share_col_with_unknowns(
            df, {"COUNT_YES": "sample_pct_share"}, demo_col, all_val, unknown_val)

        if demo_breakdown == std_col.RACE_OR_HISPANIC_COL:
            std_col.add_race_columns_from_category_id(df)

        df = df.drop(columns=["COUNT_YES", "COUNT_NO",
                     "TOTAL_BENE", "AVG PDC RATE"])

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

    demo_col = std_col.RACE_CATEGORY_ID_COL if breakdown == std_col.RACE_OR_HISPANIC_COL else breakdown

    # Starter cols to merge each loaded table on to
    output_df = pd.DataFrame(columns=scaffold_cols)

    for determinant, filename in PHRMA_FILE_MAP.items():

        print(determinant, filename, sheet_name)

        topic_df = gcs_to_bq_util.load_xlsx_as_df_from_data_dir(
            PHRMA_DIR,
            filename,
            sheet_name,
            dtype=DTYPE,
            na_values=["."],
        )

        output_df = output_df.merge(topic_df, how='outer')

    output_df = rename_cols(output_df,
                            cast(GEO_TYPE, geo_level),
                            cast(SEX_RACE_ETH_AGE_TYPE, breakdown))

    if breakdown == std_col.RACE_OR_HISPANIC_COL and geo_level == COUNTY_LEVEL:
        output_df = output_df.drop(columns=["RTI_RACE_CD"])

    # drop rows that dont include FIPS and DEMO values
    output_df = output_df[output_df[std_col.COUNTY_FIPS_COL].notna()]

    output_df = ensure_leading_zeros(output_df, fips_col, fips_length)

    return output_df


def get_sheet_name(geo_level: str, breakdown: str) -> str:
    """ geo_level: string equal to `county`, `national`, or `state`
   breakdown: string equal to `age`, `race_and_ethnicity`, `sex`, or `all`
   return: a string sheet name based on the provided args  """

    sheet_map = {
        ("all", "national"): "All US",
        ("all", "state"): "All by State",
        ("all", "county"): "All by County",
        ("race_and_ethnicity", "national"): "Race_US",
        ("race_and_ethnicity", "state"): "Race_State",
        ("race_and_ethnicity", "county"): "Race_County",
        ("sex", "national"): "Sex_US",
        ("sex", "state"): "Sex_State",
        ("sex", "county"): "Sex_County",
        ("age", "national"): "Age_US",
        ("age", "state"): "Age_State",
        ("age", "county"): "Age_County",
    }

    return sheet_map[(breakdown, geo_level)]


def get_scaffold_cols(geo_level: str) -> List[str]:
    """ Get list of string column names that are consistent across all
    needed sheets to merge """

    scaffold_cols_map = {
        "national": ["STATE_FIPS", "STATE"],
        "state": ["STATE_CODE", "STATE_CODE"],
        "county": ["COUNTY_FIPS", "STATE_FIPS", "STATE", "COUNTY"]
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
        rename_cols_map["STATE"] = std_col.STATE_NAME_COL
        rename_cols_map["COUNTY"] = std_col.COUNTY_NAME_COL

    if geo_level == STATE_LEVEL:
        rename_cols_map["STATE_CODE"] = std_col.STATE_NAME_COL

    if breakdown == std_col.RACE_OR_HISPANIC_COL:
        print(df["RACE"].unique())
        rename_cols_map["RACE"] = std_col.RACE_CATEGORY_ID_COL

    if breakdown == std_col.SEX_COL:
        rename_cols_map["SEX"] = std_col.SEX_COL

    if breakdown == std_col.AGE_COL:
        rename_cols_map["AGE_GROUP"] = std_col.AGE_COL

    df = df.rename(columns=rename_cols_map)

    return df
