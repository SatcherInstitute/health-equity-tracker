import pandas as pd
from datasources.data_source import DataSource
from ingestion import gcs_to_bq_util, dataset_utils
from ingestion.standardized_columns import (Race,
                                            RACE_OR_HISPANIC_COL,
                                            SEX_COL)
from ingestion.dataset_utils import (ensure_leading_zeros,
                                     generate_pct_share_col_without_unknowns,
                                     generate_pct_rel_inequity_col,
                                     zero_out_pct_rel_inequity)
from ingestion.merge_utils import merge_county_names
from ingestion.constants import (Sex, COUNTY_LEVEL)
import ingestion.standardized_columns as std_col
from typing import Literal, cast
from ingestion.types import (SEX_RACE_AGE_TYPE,
                             SEX_RACE_ETH_AGE_TYPE,
                             DEMOGRAPHIC_TYPE)

BASE_VERA_URL = 'https://github.com/vera-institute/incarceration_trends/blob/master/incarceration_trends.csv?raw=true'

VERA_YEAR = "year"
VERA_FIPS = "fips"
VERA_COUNTY = "county_name"

RAW_COL_MAP = {
    std_col.JAIL_PREFIX: std_col.JAIL_RAW,
    std_col.PRISON_PREFIX: std_col.PRISON_RAW
}

PER_100K_COL_MAP = {
    std_col.JAIL_PREFIX: std_col.JAIL_RATE,
    std_col.PRISON_PREFIX: std_col.PRISON_RATE
}

PCT_SHARE_COL_MAP = {
    std_col.JAIL_PREFIX: std_col.JAIL_PCT_SHARE,
    std_col.PRISON_PREFIX: std_col.PRISON_PCT_SHARE,
    std_col.POPULATION_COL: std_col.POP_PCT_SHARE
}

PCT_REL_INEQUITY_COL_MAP = {
    std_col.JAIL_PREFIX: std_col.JAIL_PCT_INEQUITY,
    std_col.PRISON_PREFIX: std_col.PRISON_PCT_INEQUITY
}

# VERA ALL COLS
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
    std_col.PRISON_PREFIX: {RAW_COL_MAP[std_col.PRISON_PREFIX]: PCT_SHARE_COL_MAP[std_col.PRISON_PREFIX]},
    std_col.JAIL_PREFIX: {
        RAW_COL_MAP[std_col.JAIL_PREFIX]: PCT_SHARE_COL_MAP[std_col.JAIL_PREFIX]}
}

JUVENILE_COLS = ["female_juvenile_jail_pop",
                 "male_juvenile_jail_pop"]
JUVENILE = "0-17"
ADULT = "18+"

# NO AGE BREAKDOWN DATA

DATA_COLS = [*RACE_PRISON_RAW_COLS_TO_STANDARD.keys(),
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
             JAIL_RATE_ALL]

GEO_COLS_TO_STANDARD = {
    VERA_FIPS: std_col.COUNTY_FIPS_COL,
    VERA_COUNTY: std_col.COUNTY_NAME_COL
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
    VERA_YEAR: str,
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
            columns={VERA_FIPS: std_col.COUNTY_FIPS_COL, VERA_YEAR: std_col.TIME_PERIOD_COL})
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
            std_col.CHILDREN,
            *PCT_SHARE_COL_MAP.values(),
            *RAW_COL_MAP.values(),
            std_col.POPULATION_COL,
            PCT_SHARE_COL_MAP[std_col.POPULATION_COL],
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

        # dict of desired metric col name to its
        # mapping of group-metric cols to HET groups
        melt_map = {
            std_col.RACE_OR_HISPANIC_COL: {
                std_col.POPULATION_COL: {**RACE_POP_TO_STANDARD, POP_ALL: all_val},
                RAW_COL_MAP[std_col.JAIL_PREFIX]: {**RACE_JAIL_RAW_COLS_TO_STANDARD, JAIL_RAW_ALL: all_val},
                PER_100K_COL_MAP[std_col.JAIL_PREFIX]: {**RACE_JAIL_RATE_COLS_TO_STANDARD, JAIL_RATE_ALL: all_val},
                RAW_COL_MAP[std_col.PRISON_PREFIX]: {**RACE_PRISON_RAW_COLS_TO_STANDARD, PRISON_RAW_ALL: all_val},
                PER_100K_COL_MAP[std_col.PRISON_PREFIX]: {
                    **RACE_PRISON_RATE_COLS_TO_STANDARD, PRISON_RATE_ALL: all_val},
                std_col.CHILDREN: {std_col.CHILDREN: all_val},
            },
            std_col.SEX_COL: {
                std_col.POPULATION_COL: {**SEX_POP_TO_STANDARD, POP_ALL: all_val},
                RAW_COL_MAP[std_col.JAIL_PREFIX]: {**SEX_JAIL_RAW_COLS_TO_STANDARD, JAIL_RAW_ALL: all_val},
                PER_100K_COL_MAP[std_col.JAIL_PREFIX]: {**SEX_JAIL_RATE_COLS_TO_STANDARD, JAIL_RATE_ALL: all_val},
                RAW_COL_MAP[std_col.PRISON_PREFIX]: {**SEX_PRISON_RAW_COLS_TO_STANDARD, PRISON_RAW_ALL: all_val},
                PER_100K_COL_MAP[std_col.PRISON_PREFIX]: {**SEX_PRISON_RATE_COLS_TO_STANDARD, PRISON_RATE_ALL: all_val},
                std_col.CHILDREN: {std_col.CHILDREN: all_val}
            },
            std_col.AGE_COL: {
                std_col.POPULATION_COL: {POP_ALL: all_val},
                RAW_COL_MAP[std_col.JAIL_PREFIX]: {JAIL_RAW_ALL: all_val},
                PER_100K_COL_MAP[std_col.JAIL_PREFIX]: {JAIL_RATE_ALL: all_val},
                RAW_COL_MAP[std_col.PRISON_PREFIX]: {PRISON_RAW_ALL: all_val},
                PER_100K_COL_MAP[std_col.PRISON_PREFIX]: {PRISON_RATE_ALL: all_val},
                std_col.CHILDREN: {std_col.CHILDREN: all_val},
            },
        }

        breakdown_df = dataset_utils.melt_to_het_style_df(
            df,
            cast(DEMOGRAPHIC_TYPE, demo_col),
            [std_col.TIME_PERIOD_COL, *GEO_COLS_TO_STANDARD.values()],
            melt_map[demo_type]
        )

        # round 100k values
        for data_type in [std_col.PRISON_PREFIX, std_col.JAIL_PREFIX]:
            breakdown_df[PER_100K_COL_MAP[data_type]
                         ] = breakdown_df[PER_100K_COL_MAP[data_type]].dropna().round()

        breakdown_df[std_col.STATE_FIPS_COL] = breakdown_df[std_col.COUNTY_FIPS_COL].astype(
            str).str[:2]

        # calculate pct_share cols for std_col.JAIL_PREFIX (share of summed group counts)
        # and std_col.PRISON_PREFIX and std_col.POPULATION_COL (share of provided ALL counts)
        breakdown_df = generate_pct_share_col_without_unknowns(
            breakdown_df,
            {
                **DATA_TYPE_TO_COL_MAP[std_col.PRISON_PREFIX],
                **DATA_TYPE_TO_COL_MAP[std_col.JAIL_PREFIX],
                std_col.POPULATION_COL: PCT_SHARE_COL_MAP[std_col.POPULATION_COL]
            },
            cast(SEX_RACE_AGE_TYPE, demo_col),
            all_val)

        # add relative inequity cols for jail and prison
        for data_type in [std_col.PRISON_PREFIX, std_col.JAIL_PREFIX]:
            breakdown_df = generate_pct_rel_inequity_col(breakdown_df,
                                                         PCT_SHARE_COL_MAP[data_type],
                                                         PCT_SHARE_COL_MAP[std_col.POPULATION_COL],
                                                         PCT_REL_INEQUITY_COL_MAP[data_type])
            breakdown_df = zero_out_pct_rel_inequity(
                breakdown_df,
                COUNTY_LEVEL,
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
                       std_col.POPULATION_COL,
                       std_col.CHILDREN
                       ]

        # by_race gets extra cols
        if demo_type == std_col.RACE_OR_HISPANIC_COL:
            std_col.add_race_columns_from_category_id(breakdown_df)
            needed_cols.append(std_col.RACE_CATEGORY_ID_COL)

        # keep and sort needed cols
        breakdown_df = breakdown_df[needed_cols].sort_values(
            [std_col.TIME_PERIOD_COL, std_col.COUNTY_FIPS_COL, demo_type])

        return breakdown_df.reset_index(drop=True)


def add_confined_children_col(df):
    """ Parameters: df: pandas df containing the entire Vera csv file.
    Returns same df replacing juvenile cols with a summed, rounded `total_confined_children` col
    """
    df[std_col.CHILDREN] = df[JUVENILE_COLS].sum(
        axis="columns", numeric_only=True).round(0)
    df = df.drop(columns=JUVENILE_COLS)
    return df


def use_sum_of_jail_counts_as_all(df, demo_type: Literal["sex", "race_and_ethnicity"]):
    """ Jail pct_share needs to be calculated a bit differently,
    as Vera TOTAL jail counts are yearly averages, while the GROUP
    jail counts are single-day actual counts.
    This means that the sum of the groups might not equal the TOTAL.
    Because of this, we will overwrite the given ALL std_col.JAIL_PREFIX ESTIMATE TOTAL with a
    SUM OF ALL GROUPS ESTIMATED TOTALS for sex and race. We don't do this for age
    as we don't have any group breakdowns for age, only the given ALL values. """
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
