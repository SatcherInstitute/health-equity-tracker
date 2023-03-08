import pandas as pd
from datasources.data_source import DataSource
from ingestion import gcs_to_bq_util
from ingestion.standardized_columns import (
    Race,
    RACE_OR_HISPANIC_COL,
    SEX_COL,
)
from ingestion.dataset_utils import (
    generate_pct_share_col_without_unknowns,
    ensure_leading_zeros,
    generate_pct_rel_inequity_col,
    zero_out_pct_rel_inequity
)
from ingestion.merge_utils import merge_county_names
from ingestion.constants import (Sex)
import ingestion.standardized_columns as std_col
from functools import reduce
from typing import Literal, cast
from ingestion.types import (
    INCARCERATION_TYPE, VERA_PROPERTY_TYPE, SEX_RACE_AGE_TYPE, SEX_RACE_ETH_AGE_TYPE
)


JAIL = cast(INCARCERATION_TYPE, std_col.JAIL_PREFIX)
PRISON = std_col.PRISON_PREFIX

RAW = "raw"
RATE = "rate"
PCT_SHARE = "pct_share"
POP = "population"
CHILDREN = cast(VERA_PROPERTY_TYPE, std_col.CHILDREN)

RAW_COL_MAP = {
    JAIL: std_col.JAIL_RAW,
    PRISON: std_col.PRISON_RAW
}

PER_100K_COL_MAP = {
    JAIL: std_col.JAIL_RATE,
    PRISON: std_col.PRISON_RATE
}

PCT_SHARE_COL_MAP = {
    JAIL: std_col.JAIL_PCT_SHARE,
    PRISON: std_col.PRISON_PCT_SHARE,
    POP: std_col.POP_PCT_SHARE
}

PCT_REL_INEQUITY_COL_MAP = {
    JAIL: std_col.JAIL_PCT_INEQUITY,
    PRISON: std_col.PRISON_PCT_INEQUITY
}

# VERA ALL COLS
PRISON_RAW_ALL = "total_prison_pop"
JAIL_RAW_ALL = "total_jail_pop"
PRISON_RATE_ALL = "total_prison_pop_rate"
JAIL_RATE_ALL = "total_jail_pop_rate"
POP_ALL = "total_pop_15to64"

BASE_VERA_URL = 'https://github.com/vera-institute/incarceration_trends/blob/master/incarceration_trends.csv?raw=true'
LATEST_JAIL_YEAR = 2018
LATEST_PRISON_YEAR = 2016

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
    PRISON: {RAW_COL_MAP[PRISON]: PCT_SHARE_COL_MAP[PRISON]},
    JAIL: {RAW_COL_MAP[JAIL]: PCT_SHARE_COL_MAP[JAIL]}
}

# Column mappings used for melting the jail_pct_share columns into rows
SEX_JAIL_PCT_SHARE_MELT_COLS_MAP = {
    f'{Sex.FEMALE}_jail_pct_share': Sex.FEMALE,
    f'{Sex.MALE}_jail_pct_share': Sex.MALE
}
RACE_JAIL_PCT_SHARE_MELT_COLS_MAP = {
    f'{Race.API_NH.value}_jail_pct_share': Race.API_NH.value,
    f'{Race.BLACK_NH.value}_jail_pct_share': Race.BLACK_NH.value,
    f'{Race.HISP.value}_jail_pct_share': Race.HISP.value,
    f'{Race.AIAN_NH.value}_jail_pct_share': Race.AIAN_NH.value,
    f'{Race.WHITE_NH.value}_jail_pct_share': Race.WHITE_NH.value,
}

ALL_JAIL_PCT_SHARE = "all_jail_pct_share"

JUVENILE_COLS = [
    "female_juvenile_jail_pop",
    "male_juvenile_jail_pop"
]

JUVENILE = "0-17"
ADULT = "18+"

# NO PRISON/AGE BREAKDOWN DATA

DATA_COLS = [
    *RACE_PRISON_RAW_COLS_TO_STANDARD.keys(),
    *RACE_PRISON_RATE_COLS_TO_STANDARD.keys(),
    *SEX_PRISON_RAW_COLS_TO_STANDARD.keys(),
    *SEX_PRISON_RATE_COLS_TO_STANDARD.keys(),
    *RACE_JAIL_RAW_COLS_TO_STANDARD.keys(),
    *RACE_JAIL_RATE_COLS_TO_STANDARD.keys(),
    *SEX_JAIL_RAW_COLS_TO_STANDARD.keys(),
    *SEX_JAIL_RATE_COLS_TO_STANDARD.keys(),
    PRISON_RAW_ALL,
    JAIL_RAW_ALL,
    PRISON_RATE_ALL,
    JAIL_RATE_ALL
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

location_col_types = {col: str for col in GEO_COLS_TO_STANDARD.keys()}
data_col_types = {col: float for col in DATA_COLS}
pop_col_types = {col: float for col in POP_COLS}
VERA_COL_TYPES = {
    "year": str,
    **location_col_types,
    **data_col_types,  # type: ignore
    **pop_col_types  # type: ignore
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
        demo_type = self.get_attr(attrs, 'demographic')

        df = gcs_to_bq_util.load_csv_as_df_from_web(
            BASE_VERA_URL, dtype=VERA_COL_TYPES)
        df = df.rename(
            columns={"fips": std_col.COUNTY_FIPS_COL, "year": std_col.TIME_PERIOD_COL})
        df = ensure_leading_zeros(df, std_col.COUNTY_FIPS_COL, 5)
        df = merge_county_names(df)

        # use SUM OF GROUP COUNTS as ALL for sex/race; we only have ALLs for AGE
        if demo_type == SEX_COL or demo_type == RACE_OR_HISPANIC_COL:
            df = use_sum_of_jail_counts_as_all(df, demo_type)
        df = add_confined_children_col(df)

        table_name = f'by_{demo_type}_county_time_series'
        df = self.generate_for_bq(
            df, demo_type)

        float_cols = [
            *PER_100K_COL_MAP.values(),
            CHILDREN,
            *PCT_SHARE_COL_MAP.values(),
            *RAW_COL_MAP.values(),
            POP,
            PCT_SHARE_COL_MAP[POP],
            *PCT_REL_INEQUITY_COL_MAP.values()
        ]
        column_types = gcs_to_bq_util.get_bq_column_types(
            df, float_cols=float_cols)
        gcs_to_bq_util.add_df_to_bq(
            df, dataset, table_name, column_types=column_types)

    def generate_for_bq(self, df: pd.DataFrame, demo_type: SEX_RACE_ETH_AGE_TYPE):
        """ Creates the specific breakdown df needed for bigquery by iterating over needed columns
        from incoming Vera df and generating then combining multiple melted, HET-style dfs.

        Parameters:
            df: Vera-style unmelted df with a column per group-metric
            demo_type: string for which demographic breakdown
                (this is sent from the DAG payload as 'demographic' attr)
        """
        if demo_type == std_col.RACE_OR_HISPANIC_COL:
            all_val = Race.ALL.value
            demo_col = std_col.RACE_CATEGORY_ID_COL
            demo_short = std_col.RACE_COL
        else:
            all_val = std_col.ALL_VALUE
            demo_col = demo_type
            demo_short = demo_type

        # collect partial dfs for merging
        partial_breakdowns = []

        # create and melt multiple partial dfs (to avoid column name collisions)
        for data_type in [PRISON, JAIL]:

            # only need population once
            needed_property_types = [RAW, RATE]
            if data_type == JAIL:
                needed_property_types.append(POP)

            # collect needed partial dfs for merging
            for property_type in needed_property_types:
                partial_df = df.copy()
                partial_df = generate_partial_breakdown(
                    partial_df, demo_type, cast(INCARCERATION_TYPE, data_type), cast(VERA_PROPERTY_TYPE, property_type))
                partial_breakdowns.append(partial_df)

        # merge all the partial DFs for POP, RAW, RATE into a single DF per datatype/breakdown
        breakdown_df = reduce(lambda x, y: pd.merge(
            x, y, on=[std_col.TIME_PERIOD_COL, *GEO_COLS_TO_STANDARD.values(), demo_col]), partial_breakdowns)

        # make partial breakdown for total_confined_children
        partial_children_df = generate_partial_breakdown(
            df.copy(), demo_type, JAIL, CHILDREN)

        # merge in the column with confined children
        breakdown_df = pd.merge(breakdown_df, partial_children_df, how="left", on=[
            std_col.TIME_PERIOD_COL, *GEO_COLS_TO_STANDARD.values(), demo_col])

        # round 100k values
        for data_type in [PRISON, JAIL]:
            breakdown_df[PER_100K_COL_MAP[data_type]
                         ] = breakdown_df[PER_100K_COL_MAP[data_type]].dropna().round()

        breakdown_df[std_col.STATE_FIPS_COL] = breakdown_df[std_col.COUNTY_FIPS_COL].astype(
            str).str[:2]

        # calculate pct_share cols for JAIL (share of summed group counts)
        # and PRISON and POP (share of provided ALL counts)
        breakdown_df = generate_pct_share_col_without_unknowns(
            breakdown_df,
            {
                **DATA_TYPE_TO_COL_MAP[PRISON],
                **DATA_TYPE_TO_COL_MAP[JAIL],
                POP: PCT_SHARE_COL_MAP[POP]
            },
            cast(SEX_RACE_AGE_TYPE, demo_col),
            all_val)

        # add relative inequity cols for jail and prison
        for data_type in [PRISON, JAIL]:
            breakdown_df = generate_pct_rel_inequity_col(
                breakdown_df, PCT_SHARE_COL_MAP[data_type], PCT_SHARE_COL_MAP[POP], PCT_REL_INEQUITY_COL_MAP[data_type])
            breakdown_df = zero_out_pct_rel_inequity(
                breakdown_df,
                "county",
                cast(SEX_RACE_AGE_TYPE, demo_short),
                {
                    PER_100K_COL_MAP[data_type]: PCT_REL_INEQUITY_COL_MAP[data_type]
                }
            )

        needed_cols = [std_col.TIME_PERIOD_COL,
                       *GEO_COLS_TO_STANDARD.values(),
                       demo_type,
                       *PER_100K_COL_MAP.values(),
                       *PCT_SHARE_COL_MAP.values(),
                       *PCT_REL_INEQUITY_COL_MAP.values(),
                       *RAW_COL_MAP.values(),
                       POP,
                       CHILDREN
                       ]

        # by_race gets extra cols
        if demo_type == std_col.RACE_OR_HISPANIC_COL:
            std_col.add_race_columns_from_category_id(breakdown_df)
            needed_cols.append(std_col.RACE_CATEGORY_ID_COL)

        # keep and sort needed cols
        breakdown_df = breakdown_df[needed_cols]

        return breakdown_df.reset_index(drop=True)


def generate_partial_breakdown(df,
                               demo_type: Literal["sex",
                                                  "race_and_ethnicity",
                                                  "age"],
                               data_type: Literal["jail",
                                                  "prison"],
                               property_type: Literal["raw",
                                                      "rate",
                                                      "population",
                                                      "total_confined_children"]):
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
        demo_type: string for which demographic breakdown type
        data_type: string for data type to calculate
        property_type: string for metric to calculate

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
                het_value_column = RAW_COL_MAP[JAIL]

            if property_type == RATE:
                col_to_demographic_map = RACE_JAIL_RATE_COLS_TO_STANDARD
                vera_all_col = JAIL_RATE_ALL
                het_value_column = PER_100K_COL_MAP[JAIL]

        if data_type == PRISON:
            if property_type == RAW:
                col_to_demographic_map = RACE_PRISON_RAW_COLS_TO_STANDARD
                vera_all_col = PRISON_RAW_ALL
                het_value_column = RAW_COL_MAP[PRISON]

            if property_type == RATE:
                col_to_demographic_map = RACE_PRISON_RATE_COLS_TO_STANDARD
                vera_all_col = PRISON_RATE_ALL
                het_value_column = PER_100K_COL_MAP[PRISON]

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
                het_value_column = RAW_COL_MAP[JAIL]

            if property_type == RATE:
                col_to_demographic_map = SEX_JAIL_RATE_COLS_TO_STANDARD
                vera_all_col = JAIL_RATE_ALL
                het_value_column = PER_100K_COL_MAP[JAIL]

        if data_type == PRISON:
            if property_type == RAW:
                col_to_demographic_map = SEX_PRISON_RAW_COLS_TO_STANDARD
                vera_all_col = PRISON_RAW_ALL
                het_value_column = RAW_COL_MAP[PRISON]

            if property_type == RATE:
                col_to_demographic_map = SEX_PRISON_RATE_COLS_TO_STANDARD
                vera_all_col = PRISON_RATE_ALL
                het_value_column = PER_100K_COL_MAP[PRISON]

    # generate only the Alls for Age
    if demo_type == std_col.AGE_COL:
        all_val = std_col.ALL_VALUE
        het_group_column = demo_type

        if property_type == POP:
            col_to_demographic_map = {}
            vera_all_col = POP_ALL
            het_value_column = POP

        if data_type == JAIL:
            if property_type == RAW:
                col_to_demographic_map = {}
                vera_all_col = JAIL_RAW_ALL
                het_value_column = RAW_COL_MAP[JAIL]

            if property_type == RATE:
                col_to_demographic_map = {}
                vera_all_col = JAIL_RATE_ALL
                het_value_column = PER_100K_COL_MAP[JAIL]

        if data_type == PRISON:
            if property_type == RAW:
                col_to_demographic_map = {}
                vera_all_col = PRISON_RAW_ALL
                het_value_column = RAW_COL_MAP[PRISON]

            if property_type == RATE:
                col_to_demographic_map = {}
                vera_all_col = PRISON_RATE_ALL
                het_value_column = PER_100K_COL_MAP[PRISON]

    if property_type == CHILDREN:
        # treat children as All; no extra groups to calc
        col_to_demographic_map = {}
        vera_all_col = CHILDREN
        het_value_column = CHILDREN

    cols_to_keep = [
        std_col.TIME_PERIOD_COL,
        *GEO_COLS_TO_STANDARD.values(),
        vera_all_col
    ]
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
    df = df.melt(id_vars=[std_col.TIME_PERIOD_COL, *GEO_COLS_TO_STANDARD.values()],
                 value_vars=value_vars,
                 var_name=het_group_column,
                 value_name=het_value_column)

    return df


def add_confined_children_col(df):
    """ Parameters: df: pandas df containing the entire Vera csv file.
    Returns same df replacing juvenile cols with a summed, rounded `total_confined_children` col
    """
    df[CHILDREN] = df[JUVENILE_COLS].sum(
        axis="columns", numeric_only=True).round(0)
    df = df.drop(columns=JUVENILE_COLS)

    return df


def use_sum_of_jail_counts_as_all(df, demo_type: Literal["sex", "race_and_ethnicity"]):
    """ Jail pct_share needs to be calculated a bit differently,
    as Vera TOTAL jail counts are yearly averages, while the GROUP
    jail counts are single-day actual counts.
    This means that the sum of the groups might not equal the TOTAL.
    Because of this, we will overwrite the given ALL JAIL ESTIMATE TOTAL with a
    SUM OF ALL GROUPS ESTIMATED TOTALS for sex and race. We don't do this for age
    as we don't have any group breakdowns for age, only the given ALL values.

    """

    if demo_type == std_col.SEX_COL:
        groups_map = SEX_JAIL_RAW_COLS_TO_STANDARD
    elif demo_type == std_col.RACE_OR_HISPANIC_COL:
        groups_map = RACE_JAIL_RAW_COLS_TO_STANDARD
    else:
        raise ValueError(
            f'demo_type sent as "{demo_type}"; must be "sex" or "race_and_ethnicity". ')

    df[JAIL_RAW_ALL] = df[groups_map.keys()].sum(axis=1,
                                                 numeric_only=True)
    return df
