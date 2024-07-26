import pandas as pd
from typing import cast, Literal, List
from datasources.data_source import DataSource
from ingestion import gcs_to_bq_util
from ingestion import standardized_columns as std_col
from ingestion.constants import CURRENT, Sex
from ingestion.dataset_utils import (
    generate_estimated_total_col,
    generate_pct_share_col_of_summed_alls,
    get_timeview_df_and_cols,
)
from ingestion.graphql_ahr_utils import (
    graphql_response_to_dataframe,
    fetch_ahr_data_from_graphql,
    AHR_BASE_MEASURES_TO_RATES_MAP,
    AHR_MEASURES_TO_RATES_MAP_18PLUS,
    AHR_MEASURES_TO_RATES_MAP_ALL_AGES,
    PCT_RATE_TO_PER_100K_TOPICS,
)  # type: ignore
from ingestion.het_types import DEMOGRAPHIC_TYPE, GEO_TYPE, SEX_RACE_AGE_TYPE, SEX_RACE_ETH_AGE_TYPE

# pylint: disable=no-name-in-module
from ingestion.merge_utils import merge_state_ids, merge_yearly_pop_numbers, merge_intersectional_pop

# String constants from AHR source data
AHR_MEASURE = 'measure'
AHR_VALUE = 'value'

AGE_GROUPS_TO_STANDARD = {
    'Ages 15-24': '15-24',
    'Ages 18-24': '18-24',
    'Ages 18-44': '18-44',
    'Ages 25-34': '24-34',
    'Ages 35-44': '35-44',
    'Ages 45-54': '45-54',
    'Ages 45-64': '45-64',
    'Ages 55-64': '55-64',
    'Age 65+': '65+',
    'Ages 65-74': '65-74',
    'Ages 75-84': '75-84',
    'Age 85+': '85+',
}

RACE_GROUPS_TO_STANDARD = {
    'American Indian/Alaska Native': std_col.Race.AIAN_NH.value,
    'Asian': std_col.Race.ASIAN_NH.value,
    'Asian/Pacific Islander': std_col.Race.API_NH.value,
    'Black': std_col.Race.BLACK_NH.value,
    'Hispanic': std_col.Race.HISP.value,
    'Hawaiian/Pacific Islander': std_col.Race.NHPI_NH.value,
    'Other Race': std_col.Race.OTHER_STANDARD_NH.value,
    'White': std_col.Race.WHITE_NH.value,
    'Multiracial': std_col.Race.MULTI_NH.value,
    'All': std_col.Race.ALL.value,
}

AHR_AGE_GROUPS = list(AGE_GROUPS_TO_STANDARD.keys())
AHR_RACE_GROUPS = list(RACE_GROUPS_TO_STANDARD.keys())
AHR_SEX_GROUPS = [Sex.FEMALE, Sex.MALE]

RATE_TO_RAW_18PLUS_MAP = {
    rate_col: f'{std_col.extract_prefix(rate_col)}_{std_col.RAW_SUFFIX}'
    for rate_col in AHR_MEASURES_TO_RATES_MAP_18PLUS.values()
}

RATE_TO_RAW_ALL_AGES_MAP = {
    rate_col: f'{std_col.extract_prefix(rate_col)}_{std_col.RAW_SUFFIX}'
    for rate_col in AHR_MEASURES_TO_RATES_MAP_ALL_AGES.values()
}

RAW_TO_SHARE_ALL_AGES_MAP = {
    raw_col: f'{std_col.extract_prefix(raw_col)}_{std_col.PCT_SHARE_SUFFIX}'
    for raw_col in RATE_TO_RAW_ALL_AGES_MAP.values()
}

RAW_TO_SHARE_18PLUS_MAP = {
    raw_col: f'{std_col.extract_prefix(raw_col)}_{std_col.PCT_SHARE_SUFFIX}'
    for raw_col in RATE_TO_RAW_18PLUS_MAP.values()
}


class GraphQlAHRData(DataSource):
    def __init__(self) -> None:
        self.intersectional_pop_cols: List[str] = []

    @staticmethod
    def get_id():
        return 'GRAPHQL_AHR_DATA'

    @staticmethod
    def get_table_name():
        return 'graphql_ahr_data'

    def upload_to_gcs(self, _, **attrs):
        raise NotImplementedError('upload_to_gcs should not be called for AHRData')

    def write_to_bq(self, dataset, gcs_bucket, write_local_instead_of_bq=False, **attrs):
        demographic = self.get_attr(attrs, "demographic")
        geo_level = self.get_attr(attrs, "geographic")
        response_data = fetch_ahr_data_from_graphql(demographic, geo_level)
        df = graphql_response_to_dataframe(response_data)
        df = self.generate_breakdown_df(demographic, geo_level, df)

        for time_view in [CURRENT]:
            table_name = f"{demographic}_{geo_level}_{time_view}"
            topic_prefixes = [std_col.extract_prefix(rate_col) for rate_col in AHR_BASE_MEASURES_TO_RATES_MAP.values()]
            topic_prefixes.append('ahr')
            df = df[df['time_period'].astype(int) <= 2022]
            df_for_bq, col_types = get_timeview_df_and_cols(df, time_view, topic_prefixes)

            first_two_columns = df_for_bq.columns[:2].tolist()
            df_for_bq = df_for_bq.sort_values(by=first_two_columns, ascending=True).reset_index(drop=True)

        gcs_to_bq_util.add_df_to_bq(df_for_bq, dataset, table_name, column_types=col_types)

    def generate_breakdown_df(self, breakdown: DEMOGRAPHIC_TYPE, geo_level: GEO_TYPE, df: pd.DataFrame):
        breakdown_df = parse_raw_data(df, breakdown)
        breakdown_df = self.post_process(breakdown_df, breakdown, geo_level)

        return breakdown_df

    def post_process(self, df: pd.DataFrame, demographic: DEMOGRAPHIC_TYPE, geo_level: GEO_TYPE):
        """
        Post-processes a DataFrame containing demographic data.

        Args:
        - df (pd.DataFrame): The DataFrame containing the raw demographic data.
        - breakdown_col (DEMOGRAPHIC_TYPE): The type of demographic to be standardized.
        - geo_level (GEO_TYPE): The geographic level of the data.

        Returns:
        - pd.DataFrame: A processed DataFrame containing the post-processed data.

        This function performs the following steps:
        - Standardizes demographic breakdowns based on the specified demographic type.
        - Merges state IDs with the DataFrame.
        - Merges yearly population numbers based on the demographic and geographic level.
        - Merges intersection population col for adult populations for race and sex breakdowns.
        - Adds estimated total columns based on specified mappings.
        - Generates percentage share (of summed groups) columns.
        - Sorts the DataFrame by state FIPS code and time period in descending order.
        - Converts the `time_period` column to datetime and filters data up to the year 2021.
        """

        breakdown_df = df.copy()

        if demographic == std_col.AGE_COL:
            breakdown_df = breakdown_df.replace(to_replace=AGE_GROUPS_TO_STANDARD)
        if demographic == std_col.RACE_OR_HISPANIC_COL:
            breakdown_df = breakdown_df.rename(columns={std_col.RACE_OR_HISPANIC_COL: std_col.RACE_CATEGORY_ID_COL})
            breakdown_df = breakdown_df.replace(to_replace=RACE_GROUPS_TO_STANDARD)

        pop_breakdown = std_col.RACE_COL if demographic == std_col.RACE_OR_HISPANIC_COL else demographic
        share_demo = std_col.RACE_OR_HISPANIC_COL if demographic == std_col.RACE_OR_HISPANIC_COL else demographic

        breakdown_df = merge_state_ids(breakdown_df)

        # merge general population by primary demographic
        breakdown_df = merge_yearly_pop_numbers(breakdown_df, cast(SEX_RACE_AGE_TYPE, pop_breakdown), geo_level)

        # all ages counts
        breakdown_df = generate_estimated_total_col(breakdown_df, std_col.POPULATION_COL, RATE_TO_RAW_ALL_AGES_MAP)

        if demographic in [std_col.RACE_OR_HISPANIC_COL, std_col.RACE_COL]:
            std_col.add_race_columns_from_category_id(breakdown_df)

        # all ages share cols
        breakdown_df = generate_pct_share_col_of_summed_alls(
            breakdown_df, RAW_TO_SHARE_ALL_AGES_MAP, cast(SEX_RACE_ETH_AGE_TYPE, share_demo)
        )

        # merge another col with 18+ population if by race or by sex
        if demographic != std_col.AGE_COL:

            breakdown_df, pop_18plus_col = merge_intersectional_pop(
                breakdown_df, geo_level, demographic, age_specific_group='18+'
            )

            breakdown_df = generate_estimated_total_col(
                breakdown_df,
                pop_18plus_col,
                # topics that are 18+ only
                RATE_TO_RAW_18PLUS_MAP,
            )

            # all columns need to be provider-specific for the frontend
            ahr_pop18plus_col = 'ahr_' + pop_18plus_col
            breakdown_df = breakdown_df.rename(
                columns={
                    pop_18plus_col: ahr_pop18plus_col,
                }
            )

            # save the generated intersectional population column for later use writing to bq
            self.intersectional_pop_cols.append(ahr_pop18plus_col)

            # share cols for 18+
            breakdown_df = generate_pct_share_col_of_summed_alls(
                breakdown_df, RAW_TO_SHARE_18PLUS_MAP, cast(SEX_RACE_ETH_AGE_TYPE, share_demo)
            )

        # need unique pop col names per provider
        breakdown_df = breakdown_df.rename(
            columns={
                std_col.POPULATION_COL: std_col.AHR_POPULATION_RAW,
                std_col.POPULATION_PCT_COL: std_col.AHR_POPULATION_PCT,
            }
        )

        breakdown_df = breakdown_df.sort_values(
            by=[std_col.STATE_FIPS_COL, std_col.TIME_PERIOD_COL], ascending=[True, False]
        )

        return breakdown_df


def parse_raw_data(df: pd.DataFrame, breakdown_col: DEMOGRAPHIC_TYPE):
    """
    Parses raw data in a DataFrame to extract breakdown information and create a pivot table.

    Args:
    - df (pd.DataFrame): The DataFrame containing the raw data.
    - breakdown_col (DEMOGRAPHIC_TYPE): The name of the column where the breakdown information will be placed.

    Returns:
    - pd.DataFrame: A pivot table DataFrame containing the parsed and aggregated data.

    This function iterates over topics in the AHR_BASE_MEASURES_TO_RATES_MAP dictionary, extracts breakdown
    information from the AHR_MEASURE column, sets the measure type, and pivots the DataFrame to
    create a summary table. It also converts values to per 100,000 if necessary and sorts the
    resulting DataFrame by time period in descending order.
    """
    breakdown_df = df.copy()

    for ahr_topic, ahr_measure_type in AHR_BASE_MEASURES_TO_RATES_MAP.items():
        # Check if the ahr topic, e.g Asthma, is present in the `Measure` column
        is_topic_present = breakdown_df[AHR_MEASURE].str.contains(ahr_topic, regex=False)

        # Extracts the breakdown from the AHR_MEASURE column and places it in the 'breakdown_col'
        breakdown_df.loc[is_topic_present, breakdown_col] = (
            breakdown_df.loc[is_topic_present, AHR_MEASURE].str.replace(ahr_topic, "", regex=False).str.strip(" - ")
        )

        # Fills any empty breakdown_col rows with the 'ALL' value
        breakdown_df.loc[breakdown_df[breakdown_col].isin(["", "Past Year"]), breakdown_col] = std_col.ALL_VALUE

        # Set measure type for the topics
        breakdown_df.loc[is_topic_present, AHR_MEASURE] = ahr_measure_type

        if ahr_topic in PCT_RATE_TO_PER_100K_TOPICS:
            breakdown_df.loc[is_topic_present, AHR_VALUE] *= 1000

    pivot_df = breakdown_df.pivot_table(
        index=[std_col.TIME_PERIOD_COL, std_col.STATE_POSTAL_COL, breakdown_col],
        columns=AHR_MEASURE,
        values=AHR_VALUE,
        aggfunc='first',
    ).reset_index()

    pivot_df = pivot_df.sort_values(by=std_col.TIME_PERIOD_COL, ascending=False)

    return pivot_df


def get_float_cols(
    time_type: Literal['current', 'historical'], demo_col: DEMOGRAPHIC_TYPE, intersectional_pop_cols: List[str]
) -> List[str]:
    """Builds a list of col names representing numerical data per breakdown.

    Args:
    - time_type: current or historical.
    - demo_col: age, race_and_ethnicity, or sex

    Returns:
    - List[str]: A list of numerical column names.
    """

    # All tables get rate cols
    float_cols = list(AHR_BASE_MEASURES_TO_RATES_MAP.values())

    # Current tables get pop counts and shares
    if time_type == CURRENT:
        float_cols.extend(
            [
                std_col.AHR_POPULATION_RAW,
                std_col.AHR_POPULATION_PCT,
            ]
        )

        # and topic counts / shares
        float_cols.extend(list(RATE_TO_RAW_ALL_AGES_MAP.values()))
        float_cols.extend(list(RAW_TO_SHARE_ALL_AGES_MAP.values()))

        # race/sex get age 18+ pop, topic counts, and shares
        if demo_col != std_col.AGE_COL:
            float_cols.extend(intersectional_pop_cols)
            float_cols.extend(list(RATE_TO_RAW_18PLUS_MAP.values()))
            float_cols.extend(list(RAW_TO_SHARE_18PLUS_MAP.values()))

    # TODO: historical tables will get pct_relative_inequity cols

    return float_cols
