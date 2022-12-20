from ingestion.standardized_columns import Race
from datasources.data_source import DataSource
from ingestion import gcs_to_bq_util
import ingestion.standardized_columns as std_col
from ingestion.constants import US_FIPS, US_NAME, STATE_LEVEL, NATIONAL_LEVEL
import pandas as pd  # type: ignore

"""
This datasource generates population totals, by state, for people 18+ by race/ethnicity and by sex
"""

BASE_POPULATION_URL = (
    'https://www2.census.gov/programs-surveys/popest/datasets/2020-2021/state/asrh/sc-est2021-alldata6.csv')

census_to_het_cols = {
    'AGE': std_col.AGE_COL,
    'SEX': std_col.SEX_COL,
    'STATE': std_col.STATE_FIPS_COL,
    'NAME': std_col.STATE_NAME_COL,
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

        for geo in [STATE_LEVEL, NATIONAL_LEVEL]:
            for breakdown in [
                std_col.SEX_COL,
                std_col.RACE_CATEGORY_ID_COL
            ]:

                breakdown_df = generate_pop_data_18plus(
                    df, breakdown, geo)

                col_types = gcs_to_bq_util.get_bq_column_types(df, [])

                demo = breakdown if breakdown != std_col.RACE_CATEGORY_ID_COL else std_col.RACE_OR_HISPANIC_COL

                gcs_to_bq_util.add_df_to_bq(
                    breakdown_df, dataset, f'by_{demo}_age_{geo}', column_types=col_types)


def generate_pop_data_18plus(df, breakdown, geo):
    """
    Accepts:
    df: the raw census csv as a df
    breakdown: the demographic breakdown type for the desired table,
    either "sex" or "race_category_id"
    geo: string "state" or "national", which determines whether the returned
    df will include entries the United States as a whole (summing all states)
    or if it will return each individual state

    Returns: a standardized df with a single row for each combination of
    year, state, race OR sex groups, and the corresponding population estimate
    for only 18+
    """

    # drop the ALL ethnicity rows to avoid double counting
    df = df[df["ORIGIN"] != 0]

    df = df.rename(census_to_het_cols, axis='columns')

    # calculate HET race/eth based on census race + eth columns
    df[std_col.RACE_CATEGORY_ID_COL] = df.apply(
        lambda row: Race.HISP.value if row["ORIGIN"] == 2 else race_map[row["RACE"]], axis="columns")

    df = df[[
        std_col.AGE_COL,
        std_col.SEX_COL,
        std_col.RACE_CATEGORY_ID_COL,
        std_col.STATE_FIPS_COL,
        std_col.STATE_NAME_COL,
        "POPESTIMATE2020",
        "POPESTIMATE2021"
    ]]

    # make two cols of pop data by year into unique rows by year
    df = df.melt(id_vars=[
        std_col.AGE_COL,
        std_col.SEX_COL,
        std_col.RACE_CATEGORY_ID_COL,
        std_col.STATE_FIPS_COL,
        std_col.STATE_NAME_COL
    ],
        var_name=std_col.TIME_PERIOD_COL,
        value_name=std_col.POPULATION_COL)

    # remove the "ALL" rows for SEX if RACE is the breakdown (to prevent dbl counting).
    # Census doesn't provide rows for "ALL" races combined so no need for the reverse
    if breakdown == std_col.RACE_CATEGORY_ID_COL:
        df = df[df[std_col.SEX_COL] != 0]

    # keep only 18+
    df = df[df[std_col.AGE_COL] >= 18]

    # drop unneeded columns
    df = df[[
        std_col.STATE_FIPS_COL,
        std_col.STATE_NAME_COL,
        std_col.TIME_PERIOD_COL,
        std_col.POPULATION_COL,
        breakdown
    ]]

    # combine all year/state/group rows into, summing the populations
    df = df.groupby([
        std_col.STATE_FIPS_COL,
        std_col.STATE_NAME_COL,
        std_col.TIME_PERIOD_COL,
        breakdown
    ])[std_col.POPULATION_COL].sum().reset_index()

    if breakdown == std_col.SEX_COL:
        # swap census SEX number codes for HET strings
        df[std_col.SEX_COL] = df[std_col.SEX_COL].map(sex_map)

    df[std_col.TIME_PERIOD_COL] = df[std_col.TIME_PERIOD_COL].map(year_map)

    # need to make ALL rows for race
    if breakdown == std_col.RACE_CATEGORY_ID_COL:
        df_alls = df[[
            std_col.STATE_FIPS_COL,
            std_col.STATE_NAME_COL,
            std_col.TIME_PERIOD_COL,
            std_col.POPULATION_COL
        ]]
        df_alls = df_alls.groupby([
            std_col.STATE_FIPS_COL,
            std_col.STATE_NAME_COL,
            std_col.TIME_PERIOD_COL,
        ])[std_col.POPULATION_COL].sum().reset_index()

        df_alls[std_col.RACE_CATEGORY_ID_COL] = Race.ALL.value
        df = pd.concat([df, df_alls], axis=0, ignore_index=True)

    if geo == NATIONAL_LEVEL:
        # drop state cols
        df = df[[
            std_col.TIME_PERIOD_COL,
            std_col.POPULATION_COL,
            breakdown
        ]]

        # sum matching rows from all states to get national population per breakdown
        df = df.groupby([
            std_col.TIME_PERIOD_COL,
            breakdown
        ])[std_col.POPULATION_COL].sum().reset_index()
        df[std_col.STATE_FIPS_COL] = US_FIPS
        df[std_col.STATE_NAME_COL] = US_NAME

    # set age for entire df
    df[std_col.AGE_COL] = "18+"

    # can we get rid of these ?
    if breakdown == std_col.RACE_CATEGORY_ID_COL:
        std_col.add_race_columns_from_category_id(df)

    return df
