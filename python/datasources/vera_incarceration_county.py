import numpy as np
import pandas as pd
from datasources.data_source import DataSource
from ingestion import gcs_to_bq_util
from ingestion.standardized_columns import Race
from ingestion.dataset_utils import (
    generate_pct_share_col_without_unknowns
)
from ingestion.constants import Sex, UNKNOWN
import ingestion.standardized_columns as std_col
from functools import reduce


JAIL = "jail"
PRISON = "prison"

RAW = "raw"
RATE = "rate"

POP = "population"

JAIL_RAW_COL = "jail_estimated_total"
PRISON_RAW_COL = "prison_estimated_total"

RAW_COL_MAP = {
    JAIL: JAIL_RAW_COL,
    PRISON: PRISON_RAW_COL
}

JAIL_RATE_COL = "jail_per_100k"
PRISON_RATE_COL = "prison_per_100k"

RATE_COL_MAP = {
    JAIL: JAIL_RATE_COL,
    PRISON: PRISON_RATE_COL
}

JAIL_PCT_SHARE_COL = "jail_pct_share"
PRISON_PCT_SHARE_COL = "prison_pct_share"
POP_PCT_SHARE_COL = "population_pct_share"

PCT_SHARE_COL_MAP = {
    JAIL: JAIL_PCT_SHARE_COL,
    PRISON: PRISON_PCT_SHARE_COL,
}

BASE_VERA_URL = 'https://github.com/vera-institute/incarceration_trends/blob/master/incarceration_trends.csv?raw=true'
JUVENILE = "0-17"
ADULT = "18+"

PRISON_RAW_ALL = "total_prison_pop"
JAIL_RAW_ALL = "total_jail_pop"
PRISON_RATE_ALL = "total_prison_pop_rate"
JAIL_RATE_ALL = "total_jail_pop_rate"
POP_ALL = "total_pop_15to64"


RACE_POP_TO_STANDARD = {
    "aapi_pop_15to64": Race.API_NH.value,
    "black_pop_15to64": Race.BLACK_NH.value,
    "latinx_pop_15to64": Race.HISP.value,
    "native_pop_15to64": Race.AIAN_NH.value,
    "white_pop_15to64": Race.WHITE_NH.value
}

SEX_POP_TO_STANDARD = {
    "female_pop_15to64": Sex.FEMALE,
    "male_pop_15to64": Sex.MALE
}


RACE_PRISON_RAW_COLS_TO_STANDARD = {
    "aapi_prison_pop": Race.API_NH.value,
    "black_prison_pop": Race.BLACK_NH.value,
    "latinx_prison_pop": Race.HISP.value,
    "native_prison_pop": Race.AIAN_NH.value,
    "other_race_prison_pop": Race.OTHER_STANDARD_NH.value,
    "white_prison_pop": Race.WHITE_NH.value,
}

RACE_PRISON_RATE_COLS_TO_STANDARD = {
    "aapi_prison_pop_rate": Race.API_NH.value,
    "black_prison_pop_rate": Race.BLACK_NH.value,
    "latinx_prison_pop_rate": Race.HISP.value,
    "native_prison_pop_rate": Race.AIAN_NH.value,
    "white_prison_pop_rate": Race.WHITE_NH.value,
}

SEX_PRISON_RAW_COLS_TO_STANDARD = {
    "female_prison_pop": Sex.FEMALE,
    "male_prison_pop": Sex.MALE,
}

SEX_PRISON_RATE_COLS_TO_STANDARD = {
    "female_prison_pop_rate": Sex.FEMALE,
    "male_prison_pop_rate": Sex.MALE,
}

RACE_JAIL_RAW_COLS_TO_STANDARD = {
    "aapi_jail_pop": Race.API_NH.value,
    "black_jail_pop": Race.BLACK_NH.value,
    "latinx_jail_pop": Race.HISP.value,
    "native_jail_pop": Race.AIAN_NH.value,
    "white_jail_pop": Race.WHITE_NH.value,
    "other_race_jail_pop": Race.OTHER_STANDARD_NH.value,
}

RACE_JAIL_RATE_COLS_TO_STANDARD = {
    "aapi_jail_pop_rate": Race.API_NH.value,
    "black_jail_pop_rate": Race.BLACK_NH.value,
    "latinx_jail_pop_rate": Race.HISP.value,
    "native_jail_pop_rate": Race.AIAN_NH.value,
    "white_jail_pop_rate": Race.WHITE_NH.value,
}

SEX_JAIL_RAW_COLS_TO_STANDARD = {
    "female_jail_pop": Sex.FEMALE,
    "male_jail_pop": Sex.MALE,
}

SEX_JAIL_RATE_COLS_TO_STANDARD = {
    "female_jail_pop_rate": Sex.FEMALE,
    "male_jail_pop_rate": Sex.MALE,
}

DATA_TYPE_TO_COL_MAP = {
    PRISON: {PRISON_RAW_COL: PRISON_PCT_SHARE_COL},
    JAIL: {JAIL_RAW_COL: JAIL_PCT_SHARE_COL}
}

# AGE_JAIL_RAW_COLS_TO_STANDARD = {
# "total_jail_pop": std_col.ALL_VALUE,
# "female_adult_jail_pop": ADULT,
# "female_juvenile_jail_pop": JUVENILE,
# "male_adult_jail_pop": ADULT,
# "male_juvenile_jail_pop": JUVENILE,
# }

# NO PRISON/AGE DATA


DATA_COLS = [
    *RACE_PRISON_RAW_COLS_TO_STANDARD.keys(),
    *RACE_PRISON_RATE_COLS_TO_STANDARD.keys(),
    *SEX_PRISON_RAW_COLS_TO_STANDARD.keys(),
    *SEX_PRISON_RATE_COLS_TO_STANDARD.keys(),
    *RACE_JAIL_RAW_COLS_TO_STANDARD.keys(),
    *RACE_JAIL_RATE_COLS_TO_STANDARD.keys(),
    *SEX_JAIL_RAW_COLS_TO_STANDARD.keys(),
    *SEX_JAIL_RATE_COLS_TO_STANDARD.keys(),
]

GEO_COLS_TO_STANDARD = {
    "fips": std_col.COUNTY_FIPS_COL,
    "county_name": std_col.COUNTY_NAME_COL
}

POP_COLS = [
    POP_ALL,
    *RACE_POP_TO_STANDARD.keys(),
    *SEX_POP_TO_STANDARD.keys()
]


VERA_COL_TYPES = {}
for location_col in GEO_COLS_TO_STANDARD.keys():
    VERA_COL_TYPES[location_col] = str
for data_col in DATA_COLS:
    VERA_COL_TYPES[data_col] = float
for pop_col in POP_COLS:
    VERA_COL_TYPES[pop_col] = float


def split_df_by_data_type(df):
    """
    Splits the df containing Vera's giant public CSV into two targeted dfs
    for `jail` and `prison`.

    Parameters:
        df: pandas df containing the entire Vera csv file

    Returns:
        a dict mapping the data_type strings to the newly focused dfs for those types
        { "prison": prison_df, "jail", jail_df}
    """

    # ensure 5 digit county fips (fill leading zeros)
    df["fips"] = df["fips"].apply(lambda code: (str(code).rjust(5, '0')))

    df_jail = df.copy()
    df_prison = df.copy()

    # eliminate rows with unneeded years
    df_jail = df_jail[df_jail["year"] == 2018].reset_index(drop=True)
    df_prison = df_prison[df_prison["year"]
                          == 2016].reset_index(drop=True)

    # eliminate columns with unneeded properties
    df_prison = df_prison[[*GEO_COLS_TO_STANDARD.keys(),
                           *POP_COLS,
                           PRISON_RAW_ALL,
                           PRISON_RATE_ALL,
                           *RACE_PRISON_RAW_COLS_TO_STANDARD.keys(),
                           *SEX_PRISON_RAW_COLS_TO_STANDARD.keys(),
                           *RACE_PRISON_RATE_COLS_TO_STANDARD.keys(),
                           *SEX_PRISON_RATE_COLS_TO_STANDARD.keys(),
                           ]]

    df_jail = df_jail[[*GEO_COLS_TO_STANDARD.keys(),
                       *POP_COLS,
                       JAIL_RAW_ALL,
                       JAIL_RATE_ALL,
                       *RACE_JAIL_RAW_COLS_TO_STANDARD.keys(),
                       *SEX_JAIL_RAW_COLS_TO_STANDARD.keys(),
                       *RACE_JAIL_RATE_COLS_TO_STANDARD.keys(),
                       *SEX_JAIL_RATE_COLS_TO_STANDARD.keys(),
                       ]]

    # can rename geo cols first because no naming collisions when melting
    df_jail = df_jail.rename(columns=GEO_COLS_TO_STANDARD)
    df_prison = df_prison.rename(columns=GEO_COLS_TO_STANDARD)

    return {
        PRISON: df_prison,
        JAIL: df_jail
    }


class VeraIncarcerationCounty(DataSource):

    @staticmethod
    def get_id():
        return 'VERA_INCARCERATION_COUNTY'

    @staticmethod
    def get_table_name():
        return 'vera_incarceration_county'

    def upload_to_gcs(self, _, **attrs):
        raise NotImplementedError(
            'upload_to_gcs should not be called for VeraIncarcerationCounty')

    def write_to_bq(self, dataset, gcs_bucket, **attrs):

        # TODO need to update naming scheme to be `vera_jail_data-age_county`

        df = gcs_to_bq_util.load_csv_as_df_from_web(
            BASE_VERA_URL, dtype=VERA_COL_TYPES)

        datatypes_to_df_map = split_df_by_data_type(df)

        bq_column_types = {c: 'STRING' for c in df.columns}

        # need to place PRISON and JAIL into distinct tables, as the most recent
        # data comes from different years and will have different population comparison
        # metrics
        for data_type in datatypes_to_df_map.keys():

            for demo_type in [std_col.RACE_OR_HISPANIC_COL,
                              std_col.SEX_COL,
                              std_col.AGE_COL]:

                table_name = f'{data_type}_{demo_type}_county'
                df = datatypes_to_df_map[data_type].copy()

                df = self.generate_for_bq(df, data_type, demo_type)

                if std_col.RACE_INCLUDES_HISPANIC_COL in df.columns:
                    bq_column_types[std_col.RACE_INCLUDES_HISPANIC_COL] = 'BOOL'
                bq_column_types[RATE_COL_MAP[data_type]] = 'INT'
                bq_column_types[PCT_SHARE_COL_MAP[data_type]] = 'FLOAT'
                bq_column_types[POP_PCT_SHARE_COL] = 'FLOAT'

                gcs_to_bq_util.add_df_to_bq(
                    df, dataset, table_name, column_types=bq_column_types)

    def generate_for_bq(self, df, data_type, demo_type):

        if demo_type == std_col.RACE_OR_HISPANIC_COL:
            all_val = Race.ALL.value
            demo_col = std_col.RACE_CATEGORY_ID_COL
        else:
            all_val = std_col.ALL_VALUE
            demo_col = demo_type

        # collect partial dfs for merging
        partial_breakdowns = []

        # create and melt three partial dfs (to avoid column name collisions)
        for property_type in [RAW, RATE, POP]:
            partial_df = df.copy()
            partial_df = generate_partial_breakdown(
                partial_df, demo_type, data_type, property_type)
            partial_breakdowns.append(partial_df)

        # merge all the partial DFs for POP, RAW, RATE into a single DF per datatype/breakdown
        breakdown_df = reduce(lambda x, y: pd.merge(
            x, y, on=[*GEO_COLS_TO_STANDARD.values(), demo_col]), partial_breakdowns)

        # print(breakdown_df)

        # round 100k values
        breakdown_df[RATE_COL_MAP[data_type]
                     ] = breakdown_df[RATE_COL_MAP[data_type]].dropna().round().astype(int)

        breakdown_df[std_col.STATE_FIPS_COL] = breakdown_df[std_col.COUNTY_FIPS_COL].astype(
            str).str[:2]

        breakdown_df = generate_pct_share_col_without_unknowns(
            breakdown_df,
            DATA_TYPE_TO_COL_MAP[data_type],
            demo_col,
            all_val)

        breakdown_df = generate_pct_share_col_without_unknowns(
            breakdown_df,
            {POP: "population_pct_share"},
            demo_col,
            all_val)

        cols_to_drop = [std_col.POPULATION_COL,
                        std_col.STATE_FIPS_COL, RAW_COL_MAP[data_type]]

        breakdown_df = breakdown_df.drop(
            columns=cols_to_drop)

        if demo_type == std_col.RACE_OR_HISPANIC_COL:
            std_col.add_race_columns_from_category_id(breakdown_df)

        # PLACEHOLDER SO FRONTEND DOESNT BREAK
        # need to populate this field with raw number of children if possible
        breakdown_df["total_confined_children"] = np.nan

        return breakdown_df


def generate_partial_breakdown(df, demo_type, data_type, property_type):
    """
    Takes a Vera style df with demographic groups as columns and geographies as rows, and
    generates a partial HET style df with each row representing a geo/demo combo and a single property


     and columns:
    | "county_name" | "county_fips" | single_property |  "sex", "age", or "race_and_ethnicity" |

    Parameters:
        df: dataframe with one county per row and the columns:
            | "county_name" | "county_fips" |
            plus Vera columns for relevant demographic groups, like
            | "female_prison_pop" | "male_prison_pop" | etc
        demo_type: string column name for generated df column containing the demographic group value
             "sex", "age" or "race_and_ethnicity"
        data_type: "jail" | "prison"
        property_type: string for metric to calculate: RAW | RATE | "population"

    """

    # set configuration based on demo/data/property types
    if demo_type == std_col.RACE_OR_HISPANIC_COL:
        all_val = Race.ALL.value
        het_group_column = std_col.RACE_CATEGORY_ID_COL

        if property_type == POP:
            col_to_demographic_map = RACE_POP_TO_STANDARD
            vera_all_col = POP_ALL
            het_value_column = POP

        if data_type == JAIL:
            if property_type == RAW:
                col_to_demographic_map = RACE_JAIL_RAW_COLS_TO_STANDARD
                vera_all_col = JAIL_RAW_ALL
                het_value_column = JAIL_RAW_COL

            if property_type == RATE:
                col_to_demographic_map = RACE_JAIL_RATE_COLS_TO_STANDARD
                vera_all_col = JAIL_RATE_ALL
                het_value_column = JAIL_RATE_COL

        if data_type == PRISON:
            if property_type == RAW:
                col_to_demographic_map = RACE_PRISON_RAW_COLS_TO_STANDARD
                vera_all_col = PRISON_RAW_ALL
                het_value_column = PRISON_RAW_COL

            if property_type == RATE:
                col_to_demographic_map = RACE_PRISON_RATE_COLS_TO_STANDARD
                vera_all_col = PRISON_RATE_ALL
                het_value_column = PRISON_RATE_COL

    if demo_type == std_col.SEX_COL:
        all_val = std_col.ALL_VALUE
        het_group_column = demo_type

        if property_type == POP:
            col_to_demographic_map = SEX_POP_TO_STANDARD
            vera_all_col = POP_ALL
            het_value_column = POP

        if data_type == JAIL:
            if property_type == RAW:
                col_to_demographic_map = SEX_JAIL_RAW_COLS_TO_STANDARD
                vera_all_col = JAIL_RAW_ALL
                het_value_column = JAIL_RAW_COL

            if property_type == RATE:
                col_to_demographic_map = SEX_JAIL_RATE_COLS_TO_STANDARD
                vera_all_col = JAIL_RATE_ALL
                het_value_column = JAIL_RATE_COL

        if data_type == PRISON:
            if property_type == RAW:
                col_to_demographic_map = SEX_PRISON_RAW_COLS_TO_STANDARD
                vera_all_col = PRISON_RAW_ALL
                het_value_column = PRISON_RAW_COL

            if property_type == RATE:
                col_to_demographic_map = SEX_PRISON_RATE_COLS_TO_STANDARD
                vera_all_col = PRISON_RATE_ALL
                het_value_column = PRISON_RATE_COL

    # only generate Alls for Age
    if demo_type == std_col.AGE_COL:
        all_val = std_col.ALL_VALUE
        het_group_column = demo_type

        if property_type == POP:
            col_to_demographic_map = []
            vera_all_col = POP_ALL
            het_value_column = POP

        if data_type == JAIL:
            if property_type == RAW:
                col_to_demographic_map = []
                vera_all_col = JAIL_RAW_ALL
                het_value_column = JAIL_RAW_COL

            if property_type == RATE:
                col_to_demographic_map = []
                vera_all_col = JAIL_RATE_ALL
                het_value_column = JAIL_RATE_COL

        if data_type == PRISON:
            if property_type == RAW:
                col_to_demographic_map = []
                vera_all_col = PRISON_RAW_ALL
                het_value_column = PRISON_RAW_COL

            if property_type == RATE:
                col_to_demographic_map = []
                vera_all_col = PRISON_RATE_ALL
                het_value_column = PRISON_RATE_COL

    cols_to_keep = [*GEO_COLS_TO_STANDARD.values(), vera_all_col]
    col_rename_map = {vera_all_col: all_val}
    value_vars = [all_val]

    # age is only Alls; sex/race get demographic groups
    if demo_type != std_col.AGE_COL:
        cols_to_keep.extend(col_to_demographic_map.keys())
        col_rename_map = {**col_to_demographic_map, **col_rename_map}
        value_vars.extend(col_to_demographic_map.values())

    # drop extra cols
    df = df[cols_to_keep]

    # rename to match this breakdown
    df = df.rename(
        columns=col_rename_map)

    # melt into HET style df with a row per GEO/DEMO combo
    df = df.melt(id_vars=GEO_COLS_TO_STANDARD.values(),
                 value_vars=value_vars,
                 var_name=het_group_column,
                 value_name=het_value_column)

    return df
