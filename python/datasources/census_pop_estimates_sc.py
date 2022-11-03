from ingestion.standardized_columns import Race
from datasources.data_source import DataSource
from ingestion import gcs_to_bq_util
import ingestion.standardized_columns as s
from ingestion.constants import US_FIPS, US_NAME
import pandas as pd  # type: ignore

BASE_POPULATION_URL = (
    'https://www2.census.gov/programs-surveys/popest/datasets/2020-2021/state/asrh/sc-est2021-alldata6.csv')

# The key for SEX is as follows:
# 0 = Total
# 1 = Male
# 2 = Female

# The key for ORIGIN is as follows:
# 0 = Total
# 1 = Not Hispanic
# 2 = Hispanic

# The key for RACE is as follows:
#  1 = White Alone
# 2 = Black or African American Alone
# 3 = American Indian or Alaska Native Alone
# 4 = Asian Alone
# 5 = Native Hawaiian and Other Pacific Islander Alone
# 6 = Two or more races

census_to_het_cols = {
    'AGE': s.AGE_COL,
    'SEX': s.SEX_COL,
    'STATE': s.STATE_FIPS_COL,
    'NAME': s.STATE_NAME_COL,
}

race_map = {
    1: Race.WHITE_NH.value,
    2: Race.BLACK_NH.value,
    3: Race.AIAN_NH.value,
    4: Race.ASIAN_NH.value,
    5: Race.NHPI_NH.value,
    6: Race.MULTI_OR_OTHER_STANDARD_NH.value
}

sex_map = {
    0: "All",
    1: "Male",
    2: "Female"
}

year_map = {
    "POPESTIMATE2020": "2020",
    "POPESTIMATE2021": "2021"
}


class CensusPopEstimatesSC(DataSource):

    @ staticmethod
    def get_id():
        return 'CENSUS_POP_ESTIMATES_SC'

    @ staticmethod
    def get_table_name():
        return 'census_pop_estimates_sc'

    def upload_to_gcs(self, _, **attrs):
        raise NotImplementedError(
            'upload_to_gcs should not be called for CensusPopEstimatesSC')

    def write_to_bq(self, dataset, gcs_bucket, **attrs):
        df = gcs_to_bq_util.load_csv_as_df_from_web(
            BASE_POPULATION_URL, dtype={'STATE': str}, encoding="ISO-8859-1")

        for do_sum_national in [False, True]:
            for breakdown in [
                s.SEX_COL,
                s.RACE_CATEGORY_ID_COL
            ]:

                breakdown_df = generate_pop_data_18plus(
                    df, breakdown, do_sum_national)
                column_types = {c: 'STRING' for c in breakdown_df.columns}
                if s.RACE_INCLUDES_HISPANIC_COL in df.columns:
                    column_types[s.RACE_INCLUDES_HISPANIC_COL] = 'BOOL'
                gcs_to_bq_util.add_df_to_bq(
                    breakdown_df, dataset, breakdown, column_types=column_types)


def generate_pop_data_18plus(df, breakdown, do_sum_to_national):
    """
    Accepts:
    df: the raw census csv as a df
    breakdown: the demographic breakdown type for the desired table,
    either "sex" or "race_category_id"
    do_sum_to_national: boolean for whether the returns df should be 
    at the national level, summing all states or not (returning individual states)

    Returns: a standardized df with a single row for each combination of
    year, state, race OR sex groups, and the corresponding population estimate
    for only 18+
    """

    df = df.rename(census_to_het_cols, axis='columns')

    # calculate HET race/eth based on census race + eth columns
    df[s.RACE_CATEGORY_ID_COL] = df.apply(
        lambda row: Race.HISP.value if row["ORIGIN"] == 2 else race_map[row["RACE"]], axis="columns")

    df = df[[
        s.AGE_COL,
        s.SEX_COL,
        s.RACE_CATEGORY_ID_COL,
        s.STATE_FIPS_COL,
        s.STATE_NAME_COL,
        "POPESTIMATE2020",
        "POPESTIMATE2021"
    ]]

    # make two cols of pop data by year into unique rows by year
    df = df.melt(id_vars=[
        s.AGE_COL,
        s.SEX_COL,
        s.RACE_CATEGORY_ID_COL,
        s.STATE_FIPS_COL,
        s.STATE_NAME_COL
    ],
        var_name=s.TIME_PERIOD_COL,
        value_name=s.POPULATION_COL)

    # remove the "ALL" rows for SEX if RACE is the breakdown (to prevent dbl counting).
    # Census doesn't provide rows for "ALL" races combined so no need for the reverse
    if breakdown == s.RACE_CATEGORY_ID_COL:
        df = df[df[s.SEX_COL] != 0]

    # keep only 18+
    df = df[df[s.AGE_COL] >= 18]

    # drop unneeded columns
    df = df[[
        s.STATE_FIPS_COL,
        s.STATE_NAME_COL,
        s.TIME_PERIOD_COL,
        s.POPULATION_COL,
        breakdown
    ]]

    # combine all year/state/group rows into, summing the populations
    df = df.groupby([
        s.STATE_FIPS_COL,
        s.STATE_NAME_COL,
        s.TIME_PERIOD_COL,
        breakdown
    ])[s.POPULATION_COL].sum().reset_index()

    if breakdown == s.SEX_COL:
        # swap census SEX number codes for HET strings
        df[s.SEX_COL] = df[s.SEX_COL].map(sex_map)

    df[s.TIME_PERIOD_COL] = df[s.TIME_PERIOD_COL].map(year_map)

    # need to make ALL rows for race
    if breakdown == s.RACE_CATEGORY_ID_COL:
        df_alls = df[[
            s.STATE_FIPS_COL,
            s.STATE_NAME_COL,
            s.TIME_PERIOD_COL,
            s.POPULATION_COL
        ]]
        df_alls = df_alls.groupby([
            s.STATE_FIPS_COL,
            s.STATE_NAME_COL,
            s.TIME_PERIOD_COL,
        ])[s.POPULATION_COL].sum().reset_index()

        df_alls[s.RACE_CATEGORY_ID_COL] = Race.ALL.value
        df = pd.concat([df, df_alls], axis=0, ignore_index=True)

    if do_sum_to_national:
        # drop state cols
        df = df[[
            s.TIME_PERIOD_COL,
            s.POPULATION_COL,
            breakdown
        ]]

        # sum matching rows from all states to get national population per breakdown
        df = df.groupby([
            s.TIME_PERIOD_COL,
            breakdown
        ])[s.POPULATION_COL].sum().reset_index()
        df[s.STATE_FIPS_COL] = US_FIPS
        df[s.STATE_NAME_COL] = US_NAME

    # set age for entire df
    df[s.AGE_COL] = "18+"

    # can we get rid of these ?
    if breakdown == s.RACE_CATEGORY_ID_COL:
        s.add_race_columns_from_category_id(df)

    return df
