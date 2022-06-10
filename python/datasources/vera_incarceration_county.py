from sys import stderr
import pandas as pd
from datasources.data_source import DataSource
from ingestion import gcs_to_bq_util
from ingestion.standardized_columns import Race
from ingestion.dataset_utils import generate_pct_share_col_with_unknowns
from ingestion.constants import Sex, UNKNOWN
import ingestion.standardized_columns as std_col
from functools import reduce

JAIL = "jail"
PRISON = "prison"

RAW = "raw"
RATE = "rate"

JAIL_RAW_COL = "jail_estimated_total"
PRISON_RAW_COL = "prison_estimated_total"
JAIL_RATE_COL = "jail_per_100k"
PRISON_RATE_COL = "prison_per_100k"
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
    # "total_prison_pop": Race.ALL.value,
    "aapi_prison_pop": Race.API_NH.value,
    "black_prison_pop": Race.BLACK_NH.value,
    "latinx_prison_pop": Race.HISP.value,
    "native_prison_pop": Race.AIAN_NH.value,
    "other_race_prison_pop": Race.OTHER_STANDARD_NH.value,
    "white_prison_pop": Race.WHITE_NH.value,
}

RACE_PRISON_RATE_COLS_TO_STANDARD = {
    # "total_prison_pop_rate": Race.ALL.value,
    "aapi_prison_pop_rate": Race.API_NH.value,
    "black_prison_pop_rate": Race.BLACK_NH.value,
    "latinx_prison_pop_rate": Race.HISP.value,
    "native_prison_pop_rate": Race.AIAN_NH.value,
    "white_prison_pop_rate": Race.WHITE_NH.value,
}

SEX_PRISON_RAW_COLS_TO_STANDARD = {
    # "total_prison_pop": std_col.ALL_VALUE,
    "female_prison_pop": Sex.FEMALE,
    "male_prison_pop": Sex.MALE,
}

SEX_PRISON_RATE_COLS_TO_STANDARD = {
    # "total_prison_pop_rate": std_col.ALL_VALUE,
    "female_prison_pop_rate": Sex.FEMALE,
    "male_prison_pop_rate": Sex.MALE,
}

RACE_JAIL_RAW_COLS_TO_STANDARD = {
    # "total_jail_pop": Race.ALL.value,
    "aapi_jail_pop": Race.API_NH.value,
    "black_jail_pop": Race.BLACK_NH.value,
    "latinx_jail_pop": Race.HISP.value,
    "native_jail_pop": Race.AIAN_NH.value,
    "white_jail_pop": Race.WHITE_NH.value,
    "other_race_jail_pop": Race.OTHER_STANDARD_NH.value,
}

RACE_JAIL_RATE_COLS_TO_STANDARD = {
    # "total_jail_pop_rate": Race.ALL.value,
    "aapi_jail_pop_rate": Race.API_NH.value,
    "black_jail_pop_rate": Race.BLACK_NH.value,
    "latinx_jail_pop_rate": Race.HISP.value,
    "native_jail_pop_rate": Race.AIAN_NH.value,
    "white_jail_pop_rate": Race.WHITE_NH.value,
}

SEX_JAIL_RAW_COLS_TO_STANDARD = {
    # "total_jail_pop": std_col.ALL_VALUE,
    "female_jail_pop": Sex.FEMALE,
    "male_jail_pop": Sex.MALE,
}

SEX_JAIL_RATE_COLS_TO_STANDARD = {
    # "total_jail_pop_rate": std_col.ALL_VALUE,
    "female_jail_pop_rate": Sex.FEMALE,
    "male_jail_pop_rate": Sex.MALE,
}

# AGE_JAIL_RAW_COLS_TO_STANDARD = {
#     # "total_jail_pop": std_col.ALL_VALUE,
#     "female_adult_jail_pop": ADULT,
#     "female_juvenile_jail_pop": JUVENILE,
#     "male_adult_jail_pop": ADULT,
#     "male_juvenile_jail_pop": JUVENILE,
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

        df = gcs_to_bq_util.load_csv_as_df_from_web(
            BASE_VERA_URL, dtype=VERA_COL_TYPES, )

        # ensure 5 digit county fips (fill leading zeros)
        df["fips"] = df["fips"].apply(lambda code: (str(code).rjust(5, '0')))

        df_jail = df.copy()
        df_prison = df.copy()

        # eliminate rows with unneeded years
        df_jail = df_jail[df_jail["year"] == 2018].reset_index(drop=True)
        df_prison = df_prison[df_prison["year"]
                              == 2016].reset_index(drop=True)

        """
        county_fips
        county_name
        race_category_id
        vaccinated_first_dose
        race
        race_includes_hispanic
        race_and_ethnicity
        population

        """

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

        merge_cols = list(GEO_COLS_TO_STANDARD.keys())
        merge_cols.extend(POP_COLS)

        # re-combine into single, unmelted df
        df = pd.merge(df_jail, df_prison, how='left',
                      on=merge_cols)

        df = df.rename(columns=GEO_COLS_TO_STANDARD)

        bq_column_types = {c: 'STRING' for c in df.columns}

        for breakdown in [std_col.RACE_OR_HISPANIC_COL,
                          std_col.SEX_COL]:

            breakdown_df = df.copy()
            breakdown_df = self.generate_for_bq(breakdown_df, breakdown)

            if std_col.RACE_INCLUDES_HISPANIC_COL in breakdown_df.columns:
                bq_column_types[std_col.RACE_INCLUDES_HISPANIC_COL] = 'BOOL'

            gcs_to_bq_util.add_df_to_bq(
                breakdown_df, dataset, breakdown, column_types=bq_column_types)

    def generate_for_bq(self, df, demo_type):

        print(demo_type, "<<<<>>>>")

        if demo_type == std_col.SEX_COL:
            all_val = std_col.ALL_VALUE
            unknown_val = UNKNOWN
            demo_col = demo_type
        if demo_type == std_col.RACE_OR_HISPANIC_COL:
            all_val = Race.ALL.value
            unknown_val = Race.UNKNOWN.value
            demo_col = std_col.RACE_CATEGORY_ID_COL

        partial_breakdowns = []

        pop_partial_df = df.copy()
        pop_partial_df = generate_partial_breakdown(
            pop_partial_df, demo_type, "population", None)
        partial_breakdowns.append(pop_partial_df)

        for data_type in [JAIL, PRISON]:
            for property_type in [RAW, RATE, ]:
                partial_df = df.copy()
                partial_df = generate_partial_breakdown(
                    partial_df, demo_type, data_type, property_type)
                partial_breakdowns.append(partial_df)

        # breakdown = pd.concat(partial_breakdowns)
        breakdown_df = reduce(lambda x, y: pd.merge(
            x, y, on=[*GEO_COLS_TO_STANDARD.values(), demo_col]), partial_breakdowns)

        # print(breakdown_df)

        breakdown_df[std_col.STATE_FIPS_COL] = breakdown_df[std_col.COUNTY_FIPS_COL].astype(
            str).str[:2]

        breakdown_df = generate_pct_share_col_with_unknowns(
            breakdown_df,
            {"jail_estimated_total": "jail_pct_share",
                "prison_estimated_total": "prison_pct_share"},
            demo_col,
            all_val,
            unknown_val)

        if demo_type == std_col.RACE_OR_HISPANIC_COL:
            std_col.add_race_columns_from_category_id(breakdown_df)

        print("breakdown_df")
        print(breakdown_df)

        return breakdown_df


def generate_partial_breakdown(df, demo_type, data_type, property_type):
    """
    Takes a Vera style df with demographic groups as columns and geographies as rows, and
    generates a partial HET style df with each row representing a geo/demo combo and a single property


     and columns:
    | "county_name" | "county_fips" | single_property |  "sex" or "race_and_ethnicity" |

    Parameters:
        df: dataframe with one county per row and the columns:
            | "county_name" | "county_fips" |
            plus Vera columns for relevant demographic groups, like
            | "female_prison_pop" | "male_prison_pop" | etc
        demo_type: string column name for generated df column containing the demographic group value
             "sex" or "race_and_ethnicity"
        data_type:
        property_type:

    """

    # set configuration based on demo/data/property types
    if demo_type == std_col.RACE_OR_HISPANIC_COL:
        all_val = Race.ALL.value
        unknown_val = Race.UNKNOWN.value
        het_group_column = std_col.RACE_CATEGORY_ID_COL

        if data_type == "population":
            col_to_demographic_map = RACE_POP_TO_STANDARD
            vera_all_col = POP_ALL
            het_value_column = "population"

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
        unknown_val = UNKNOWN
        het_group_column = demo_type

        if data_type == "population":
            col_to_demographic_map = SEX_POP_TO_STANDARD
            vera_all_col = POP_ALL
            het_value_column = "population"

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

    # discard unneeded columns
    # print("----- incoming columns for partial breakdown")
    # print(df.columns)

    df = df[[*GEO_COLS_TO_STANDARD.values(),
             vera_all_col,
             *col_to_demographic_map.keys(),
             ]]

    # print("after removing excess cols")
    # print(df)

    # rename to match this breakdown
    df = df.rename(
        columns={**col_to_demographic_map,
                 vera_all_col: all_val,
                 })

    # print("after renaming cols")
    # print(df)

    # manually set UNKNOWN to ALL minus KNOWNS
    df[unknown_val] = 0.0

    # make wide table into long table
    df = df.melt(id_vars=GEO_COLS_TO_STANDARD.values(),
                 value_vars=[
        all_val, unknown_val, *col_to_demographic_map.values()],
        var_name=het_group_column,
        value_name=het_value_column)

    return df
