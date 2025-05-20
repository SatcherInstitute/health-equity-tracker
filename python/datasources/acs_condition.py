import pandas as pd
from datasources.data_source import DataSource
from ingestion import url_file_to_gcs, gcs_to_bq_util, census
import ingestion.standardized_columns as std_col
from ingestion.constants import HISTORICAL, CURRENT

from ingestion.census import (
    parse_acs_metadata,
    get_vars_for_group,
    standardize_frame,
    get_all_params_for_group,
    rename_age_bracket,
)

from ingestion.merge_utils import merge_state_ids, merge_county_names

from ingestion.dataset_utils import (
    generate_pct_rate_col,
    generate_pct_share_col_without_unknowns,
    add_sum_of_rows,
    generate_pct_rel_inequity_col,
)

from ingestion.constants import (
    US_FIPS,
    NATIONAL_LEVEL,
    STATE_LEVEL,
    COUNTY_LEVEL,
    RACE,
    AGE,
    SEX,
)

from ingestion.standardized_columns import (
    Race,
    add_race_columns_from_category_id,
    generate_column_name,
)

import logging
import sys

logging.basicConfig(
    level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s", handlers=[logging.StreamHandler(sys.stdout)]
)
logger = logging.getLogger(__name__)


EARLIEST_ACS_CONDITION_YEAR = "2012"
CURRENT_ACS_CONDITION_YEAR = "2022"

# available years with all topics working
ACS_URLS_MAP = {
    EARLIEST_ACS_CONDITION_YEAR: "https://api.census.gov/data/2012/acs/acs5",
    "2013": "https://api.census.gov/data/2013/acs/acs5",
    "2014": "https://api.census.gov/data/2014/acs/acs5",
    "2015": "https://api.census.gov/data/2015/acs/acs5",
    "2016": "https://api.census.gov/data/2016/acs/acs5",
    "2017": "https://api.census.gov/data/2017/acs/acs5",
    "2018": "https://api.census.gov/data/2018/acs/acs5",
    "2019": "https://api.census.gov/data/2019/acs/acs5",
    "2020": "https://api.census.gov/data/2020/acs/acs5",
    "2021": "https://api.census.gov/data/2021/acs/acs5",
    CURRENT_ACS_CONDITION_YEAR: "https://api.census.gov/data/2022/acs/acs5",
}


HEALTH_INSURANCE_RACE_TO_CONCEPT_CAPS = {
    Race.AIAN.value: "HEALTH INSURANCE COVERAGE STATUS BY AGE (AMERICAN INDIAN AND ALASKA NATIVE ALONE)",
    Race.ASIAN.value: "HEALTH INSURANCE COVERAGE STATUS BY AGE (ASIAN ALONE)",
    Race.HISP.value: "HEALTH INSURANCE COVERAGE STATUS BY AGE (HISPANIC OR LATINO)",
    Race.BLACK.value: "HEALTH INSURANCE COVERAGE STATUS BY AGE (BLACK OR AFRICAN AMERICAN ALONE)",
    Race.NHPI.value: "HEALTH INSURANCE COVERAGE STATUS BY AGE (NATIVE HAWAIIAN AND OTHER PACIFIC ISLANDER ALONE)",
    Race.WHITE.value: "HEALTH INSURANCE COVERAGE STATUS BY AGE (WHITE ALONE)",
    Race.OTHER_STANDARD.value: "HEALTH INSURANCE COVERAGE STATUS BY AGE (SOME OTHER RACE ALONE)",
    Race.MULTI.value: "HEALTH INSURANCE COVERAGE STATUS BY AGE (TWO OR MORE RACES)",
}

HEALTH_INSURANCE_RACE_TO_CONCEPT_TITLE = {
    Race.AIAN.value: "Health Insurance Coverage Status by Age (American Indian and Alaska Native Alone)",
    Race.ASIAN.value: "Health Insurance Coverage Status by Age (Asian Alone)",
    Race.HISP.value: "Health Insurance Coverage Status by Age (Hispanic or Latino)",
    Race.BLACK.value: "Health Insurance Coverage Status by Age (Black or African American Alone)",
    Race.NHPI.value: "Health Insurance Coverage Status by Age (Native Hawaiian and Other Pacific Islander Alone)",
    Race.WHITE.value: "Health Insurance Coverage Status by Age (White Alone)",
    Race.OTHER_STANDARD.value: "Health Insurance Coverage Status by Age (Some Other Race Alone)",
    Race.MULTI.value: "Health Insurance Coverage Status by Age (Two or More Races)",
}

POVERTY_RACE_TO_CONCEPT_CAPS = {
    Race.AIAN.value: "POVERTY STATUS IN THE PAST 12 MONTHS BY SEX BY AGE (AMERICAN INDIAN AND ALASKA NATIVE ALONE)",
    Race.ASIAN.value: "POVERTY STATUS IN THE PAST 12 MONTHS BY SEX BY AGE (ASIAN ALONE)",
    Race.HISP.value: "POVERTY STATUS IN THE PAST 12 MONTHS BY SEX BY AGE (HISPANIC OR LATINO)",
    Race.BLACK.value: "POVERTY STATUS IN THE PAST 12 MONTHS BY SEX BY AGE (BLACK OR AFRICAN AMERICAN ALONE)",
    Race.NHPI.value: (
        "POVERTY STATUS IN THE PAST 12 MONTHS BY SEX BY AGE (NATIVE HAWAIIAN AND OTHER PACIFIC ISLANDER ALONE)"
    ),
    Race.WHITE.value: "POVERTY STATUS IN THE PAST 12 MONTHS BY SEX BY AGE (WHITE ALONE)",
    Race.OTHER_STANDARD.value: "POVERTY STATUS IN THE PAST 12 MONTHS BY SEX BY AGE (SOME OTHER RACE ALONE)",
    Race.MULTI.value: "POVERTY STATUS IN THE PAST 12 MONTHS BY SEX BY AGE (TWO OR MORE RACES)",
}

POVERTY_RACE_TO_CONCEPT_TITLE = {
    Race.AIAN.value: "Poverty Status in the Past 12 Months by Sex by Age (American Indian and Alaska Native Alone)",
    Race.ASIAN.value: "Poverty Status in the Past 12 Months by Sex by Age (Asian Alone)",
    Race.HISP.value: "Poverty Status in the Past 12 Months by Sex by Age (Hispanic or Latino)",
    Race.BLACK.value: "Poverty Status in the Past 12 Months by Sex by Age (Black or African American Alone)",
    Race.NHPI.value: (
        "Poverty Status in the Past 12 Months by Sex by Age (Native Hawaiian and Other Pacific Islander Alone)"
    ),
    Race.WHITE.value: "Poverty Status in the Past 12 Months by Sex by Age (White Alone)",
    Race.OTHER_STANDARD.value: "Poverty Status in the Past 12 Months by Sex by Age (Some Other Race Alone)",
    Race.MULTI.value: "Poverty Status in the Past 12 Months by Sex by Age (Two or More Races)",
}

# Acs variables are in the form C27001A_xxx0 C27001A_xxx2 etc
# to determine age buckets.  The metadata variables are merged with the suffixes to form the entire metadata.
HEALTH_INSURANCE_BY_RACE_GROUP_PREFIXES = {
    "C27001A": Race.WHITE.value,
    "C27001B": Race.BLACK.value,
    "C27001C": Race.AIAN.value,
    "C27001D": Race.ASIAN.value,
    "C27001E": Race.NHPI.value,
    "C27001F": Race.OTHER_STANDARD.value,
    "C27001G": Race.MULTI.value,
    "C27001I": Race.HISP.value,
}

POVERTY_BY_RACE_SEX_AGE_GROUP_PREFIXES = {
    "B17001A": Race.WHITE.value,
    "B17001B": Race.BLACK.value,
    "B17001C": Race.AIAN.value,
    "B17001D": Race.ASIAN.value,
    "B17001E": Race.NHPI.value,
    "B17001F": Race.OTHER_STANDARD.value,
    "B17001G": Race.MULTI.value,
    "B17001I": Race.HISP.value,
}


def get_poverty_age_range(age_range):
    if age_range in {"0-4", "5-5"}:
        return "0-5"
    elif age_range in {"12-14", "15-15", "16-17"}:
        return "12-17"
    else:
        return age_range


class AcsItem:
    """An object that contains all of the ACS info needed to get
    demographic data for an ACS concept.
    I made this a class so you have to add all of the needed
    pieces of info.

    prefix_map: A dictionary mapping the acs prefix to its corresponding race.
    concept_map: A dictionary mapping to its corresponding census concept.
    sex_age_prefix: The acs prefix representing the sex and age data.
    has_condition_key: Key in acs metadata representing the tracker's "yes"
                        state for this condition. For example, it would be the
                        key represting that someone has poverty, or does not
                        have health insurance.
    does_not_have_condition_key: Key in acs metadata representing the tracker's
                                 "no" state for this condition.
    bq_prefix: The prefix to use for this conditions col names in big query,
               should be defined in standardized_columns.py"""

    def __init__(
        self,
        prefix_map,
        concept_map,
        sex_age_prefix,
        sex_age_concept,
        has_condition_key,
        does_not_have_condition_key,
        bq_prefix,
    ):

        self.prefix_map = prefix_map
        self.concept_map = concept_map
        self.sex_age_prefix = sex_age_prefix
        self.sex_age_concept = sex_age_concept
        self.has_condition_key = has_condition_key
        self.does_not_have_condition_key = does_not_have_condition_key
        self.bq_prefix = bq_prefix


# Health insurance by Sex only has one prefix, and is kept
# in the form of a dict to help with standardizing code flow
HEALTH_INSURANCE_BY_SEX_GROUPS_PREFIX = "B27001"
HEALTH_INSURANCE_SEX_BY_AGE_CONCEPT_CAPS = "HEALTH INSURANCE COVERAGE STATUS BY SEX BY AGE"
HEALTH_INSURANCE_SEX_BY_AGE_CONCEPT_TITLE = "Health Insurance Coverage Status by Sex by Age"

POVERTY_BY_SEX_AGE_GROUPS_PREFIX = "B17001"
POVERTY_BY_SEX_AGE_CONCEPT_CAPS = "POVERTY STATUS IN THE PAST 12 MONTHS BY SEX BY AGE"
POVERTY_BY_SEX_AGE_CONCEPT_TITLE = "Poverty Status in the Past 12 Months by Sex by Age"

HAS_HEALTH_INSURANCE = "has_health_insurance"
INCOME_UNDER_POVERTY = "under_poverty_line"

# Col names for temporary df, never written to bq
AMOUNT = "amount"
POP_SUFFIX = "pop"
HAS_ACS_ITEM_SUFFIX = "has_acs_item"

HEALTH_INSURANCE_KEY = "No health insurance coverage"
WITH_HEALTH_INSURANCE_KEY = "With health insurance coverage"

NOT_IN_POVERTY_KEY = "Income in the past 12 months at or above poverty level"
POVERTY_KEY = "Income in the past 12 months below poverty level"

HEALTH_INSURANCE_MEASURE = "health_insurance"
POVERTY_MEASURE = "poverty"

ACS_ITEMS_2021_AND_EARLIER = {
    HEALTH_INSURANCE_MEASURE: AcsItem(
        HEALTH_INSURANCE_BY_RACE_GROUP_PREFIXES,
        HEALTH_INSURANCE_RACE_TO_CONCEPT_CAPS,
        HEALTH_INSURANCE_BY_SEX_GROUPS_PREFIX,
        HEALTH_INSURANCE_SEX_BY_AGE_CONCEPT_CAPS,
        HEALTH_INSURANCE_KEY,
        WITH_HEALTH_INSURANCE_KEY,
        std_col.UNINSURED_PREFIX,
    ),
    POVERTY_MEASURE: AcsItem(
        POVERTY_BY_RACE_SEX_AGE_GROUP_PREFIXES,
        POVERTY_RACE_TO_CONCEPT_CAPS,
        POVERTY_BY_SEX_AGE_GROUPS_PREFIX,
        POVERTY_BY_SEX_AGE_CONCEPT_CAPS,
        POVERTY_KEY,
        NOT_IN_POVERTY_KEY,
        std_col.POVERTY_PREFIX,
    ),
}


ACS_ITEMS_2022_AND_LATER = {
    HEALTH_INSURANCE_MEASURE: AcsItem(
        HEALTH_INSURANCE_BY_RACE_GROUP_PREFIXES,
        HEALTH_INSURANCE_RACE_TO_CONCEPT_TITLE,
        HEALTH_INSURANCE_BY_SEX_GROUPS_PREFIX,
        HEALTH_INSURANCE_SEX_BY_AGE_CONCEPT_TITLE,
        HEALTH_INSURANCE_KEY,
        WITH_HEALTH_INSURANCE_KEY,
        std_col.UNINSURED_PREFIX,
    ),
    POVERTY_MEASURE: AcsItem(
        POVERTY_BY_RACE_SEX_AGE_GROUP_PREFIXES,
        POVERTY_RACE_TO_CONCEPT_TITLE,
        POVERTY_BY_SEX_AGE_GROUPS_PREFIX,
        POVERTY_BY_SEX_AGE_CONCEPT_TITLE,
        POVERTY_KEY,
        NOT_IN_POVERTY_KEY,
        std_col.POVERTY_PREFIX,
    ),
}


def update_col_types(df):
    """Returns a new DataFrame with the column types replaced with float for
    population columns and string for other columns.

    df: The original DataFrame"""
    colTypes = {}
    str_cols = (
        std_col.STATE_FIPS_COL,
        std_col.COUNTY_FIPS_COL,
        std_col.RACE_CATEGORY_ID_COL,
        std_col.SEX_COL,
        std_col.AGE_COL,
    )

    for col in df.columns:
        if col in str_cols:
            colTypes[col] = str
        else:
            colTypes[col] = float
    df = df.astype(colTypes)
    return df


class AcsCondition(DataSource):
    def get_filename_race(self, measure, race, is_county, year):
        geo = "COUNTY" if is_county else "STATE"
        race = race.replace(" ", "_").upper()
        return f"{year}-{measure.upper()}_BY_RACE_{geo}_{race}.json"

    def get_filename_sex(self, measure, is_county, year):
        geo = "COUNTY" if is_county else "STATE"
        return f"{year}-{measure.upper()}_BY_SEX_{geo}.json"

    @staticmethod
    def get_id():
        return "ACS_CONDITION"

    @staticmethod
    def get_table_name():
        return "acs_condition"

    # Uploads the ACS data to GCS by providing
    # the ACS Base URL
    # Acs Query Params
    # Standardized Filename
    #
    # An example file created in GCS:
    # HEALTH_INSURANCE_BY_RACE_COUNTY_WHITE_ALONE.json
    #
    # Returns:
    # FileDiff = If the data has changed by diffing the old run vs the new run.
    def upload_to_gcs(self, bucket, **attrs):

        year = self.get_attr(attrs, "year")
        self.year = year
        self.base_url = ACS_URLS_MAP[year]

        if int(year) < 2022:
            acs_items = ACS_ITEMS_2021_AND_EARLIER
        else:
            acs_items = ACS_ITEMS_2022_AND_LATER

        # Iterates over the different race ACS variables,
        # retrieves the race from the metadata merged dict
        # writes the data to the GCS bucket and sees if file diff is changed

        file_diff = False
        for measure, acs_item in acs_items.items():
            for prefix, race in acs_item.prefix_map.items():
                for county_level in [True, False]:
                    params = get_all_params_for_group(prefix, county_level)
                    file_diff = (
                        url_file_to_gcs.url_file_to_gcs(
                            self.base_url,
                            params,
                            bucket,
                            self.get_filename_race(measure, race, county_level, year),
                        )
                        or file_diff
                    )

            for county_level in [True, False]:
                params = get_all_params_for_group(acs_item.sex_age_prefix, county_level)
                file_diff = (
                    url_file_to_gcs.url_file_to_gcs(
                        self.base_url,
                        params,
                        bucket,
                        self.get_filename_sex(measure, county_level, year),
                    )
                    or file_diff
                )

        return file_diff

    def write_to_bq(self, dataset, gcs_bucket, **attrs):

        logger.info("Starting write_to_bq with dataset=%s, gcs_bucket=%s, attrs=%s", dataset, gcs_bucket, attrs)

        year = self.get_attr(attrs, "year")
        self.base_url = ACS_URLS_MAP[year]
        logger.info("Processing ACS data for year: %s, base_url: %s", year, self.base_url)

        if int(year) < 2022:
            acs_items = ACS_ITEMS_2021_AND_EARLIER
            health_insurance_race_to_concept = HEALTH_INSURANCE_RACE_TO_CONCEPT_CAPS
            logger.info("Using pre-2022 ACS items and concept mappings")
        else:
            acs_items = ACS_ITEMS_2022_AND_LATER
            health_insurance_race_to_concept = HEALTH_INSURANCE_RACE_TO_CONCEPT_TITLE
            logger.info("Using 2022+ ACS items and concept mappings")

        logger.info("Fetching ACS metadata from %s", self.base_url)
        metadata = census.fetch_acs_metadata(self.base_url)
        logger.info("Successfully retrieved metadata")

        dfs = {}
        for geo in [NATIONAL_LEVEL, STATE_LEVEL, COUNTY_LEVEL]:
            for demo in [RACE, AGE, SEX]:
                logger.info("Processing data for geography: %s, demographic: %s", geo, demo)

                logger.info("Getting raw data for demo=%s, geo=%s", demo, geo)
                df = self.get_raw_data(demo, geo, metadata, acs_items, gcs_bucket=gcs_bucket, year=year)
                logger.info(
                    "Retrieved raw data: %s rows, %s columns",
                    len(df) if df is not None else 0,
                    len(df.columns) if df is not None else 0,
                )

                logger.info("Post-processing data for demo=%s, geo=%s", demo, geo)
                df = self.post_process(df, demo, geo, acs_items, health_insurance_race_to_concept)
                logger.info(
                    "Post-processing complete: %s rows, %s columns",
                    len(df) if df is not None else 0,
                    len(df.columns) if df is not None else 0,
                )

                if demo == RACE:
                    logger.info("Adding race columns from category ID")
                    add_race_columns_from_category_id(df)
                    logger.info("Race columns added successfully")

                dfs[(demo, geo)] = df
                logger.info("Successfully processed and stored data for geo=%s, demo=%s", geo, demo)

        logger.info("Defining column suffixes for different table types")
        suffixes_time_series_only = [
            std_col.PCT_REL_INEQUITY_SUFFIX,
        ]

        suffixes_both = [
            std_col.PCT_SHARE_SUFFIX,
            std_col.PCT_RATE_SUFFIX,
        ]

        suffixes_current_only = [
            std_col.POP_PCT_SUFFIX,
            std_col.RAW_SUFFIX,  # numerator counts
            f"{POP_SUFFIX}_{std_col.RAW_SUFFIX}",  # denominator counts
        ]

        logger.info("Starting to write processed data to BigQuery, total dataframes: %s", len(dfs))
        for [demo, geo], df in dfs.items():
            logger.info(
                "Processing data for BigQuery: demo=%s, geo=%s, df_shape=%s",
                demo,
                geo,
                df.shape if df is not None else "None",
            )

            # MAKE AND WRITE TIME SERIES TABLE
            logger.info("Creating time series dataframe copy")
            df_time_series = df.copy()
            df_time_series[std_col.TIME_PERIOD_COL] = year
            logger.info("Added time period column with year: %s", year)

            # DROP THE "CURRENT" COLUMNS WE DON'T NEED
            float_cols_to_drop = []
            for acs_item in acs_items.values():
                float_cols_to_drop += [
                    generate_column_name(acs_item.bq_prefix, suffix) for suffix in suffixes_current_only
                ]
            logger.info("Dropping %s current-only columns from time series dataframe", len(float_cols_to_drop))
            df_time_series.drop(columns=float_cols_to_drop, inplace=True)
            logger.info("Time series dataframe shape after dropping columns: %s", df_time_series.shape)

            # the first year written should OVERWRITE, the subsequent years should APPEND_
            overwrite = year == EARLIEST_ACS_CONDITION_YEAR
            logger.info(
                "Time series table overwrite mode: %s (year=%s, earliest_year=%s)",
                overwrite,
                year,
                EARLIEST_ACS_CONDITION_YEAR,
            )

            float_cols_time_series = []
            for acs_item in acs_items.values():
                float_cols_time_series += [
                    generate_column_name(acs_item.bq_prefix, suffix)
                    for suffix in suffixes_time_series_only + suffixes_both
                ]
            logger.info("Getting BigQuery column types for %s float columns", len(float_cols_time_series))
            col_types = gcs_to_bq_util.get_bq_column_types(df_time_series, float_cols_time_series)
            logger.info("Generated column types for BigQuery schema")

            table_demo = std_col.RACE_OR_HISPANIC_COL if demo == RACE else demo
            table_id_historical = gcs_to_bq_util.make_bq_table_id(table_demo, geo, HISTORICAL)
            logger.info("Writing time series data to BigQuery table: %s", table_id_historical)
            gcs_to_bq_util.add_df_to_bq(
                df_time_series,
                dataset,
                table_id_historical,
                column_types=col_types,
                overwrite=overwrite,
            )
            logger.info("Successfully wrote time series data to BigQuery table: %s", table_id_historical)

            # MAKE AND WRITE CURRENT TABLE
            if year == CURRENT_ACS_CONDITION_YEAR:
                logger.info(
                    "Current year matches CURRENT_ACS_CONDITION_YEAR (%s), processing current table",
                    CURRENT_ACS_CONDITION_YEAR,
                )
                df_current = df.copy()
                logger.info("Created current dataframe copy")

                # DROP THE "TIME SERIES" COLUMNS WE DON'T NEED
                float_cols_to_drop = []
                for acs_item in acs_items.values():
                    float_cols_to_drop += [
                        generate_column_name(acs_item.bq_prefix, suffix) for suffix in suffixes_time_series_only
                    ]
                logger.info("Dropping %s time-series-only columns from current dataframe", len(float_cols_to_drop))
                df_current.drop(columns=float_cols_to_drop, inplace=True)
                logger.info("Current dataframe shape after dropping columns: %s", df_current.shape)

                float_cols_current = []
                for acs_item in acs_items.values():
                    float_cols_current += [
                        generate_column_name(acs_item.bq_prefix, suffix)
                        for suffix in suffixes_current_only + suffixes_both
                    ]
                logger.info("Getting BigQuery column types for %s float columns", len(float_cols_current))
                col_types = gcs_to_bq_util.get_bq_column_types(df_current, float_cols_current)
                logger.info("Generated column types for BigQuery schema")

                table_id_current = gcs_to_bq_util.make_bq_table_id(table_demo, geo, CURRENT)
                logger.info("Writing current data to BigQuery table: %s", table_id_current)
                gcs_to_bq_util.add_df_to_bq(df_current, dataset, table_id_current, column_types=col_types)
                logger.info("Successfully wrote current data to BigQuery table: %s", table_id_current)
            else:
                logger.info(
                    "Skipping current table creation as year (%s) != CURRENT_ACS_CONDITION_YEAR (%s)",
                    year,
                    CURRENT_ACS_CONDITION_YEAR,
                )

        logger.info("write_to_bq completed successfully")

    def get_raw_data(self, demo, geo, metadata, acs_items, gcs_bucket, year=None):
        """
        Fetches raw data for the specified demographic and geographic level.
        
        Args:
            demo: The demographic category (e.g., RACE, AGE, SEX).
            geo: The geographic level (e.g., STATE_LEVEL, COUNTY_LEVEL).
            metadata: Metadata for parsing ACS data.
            acs_items: ACS items to process.
            gcs_bucket: The GCS bucket containing the data.
            year: The year of the data to fetch. Defaults to None.
        
        Returns:
            A pandas DataFrame containing the raw data.
        
        Raises:
            ValueError: If year is None and a year is required for processing.
        """
        if year is None:
            raise ValueError("The 'year' parameter is required but was not provided.")

        groups = []
        for acs_item in acs_items.values():
            groups.extend(list(acs_item.prefix_map.keys()) + [acs_item.sex_age_prefix])

        var_map = parse_acs_metadata(metadata, groups)

        # Create merge cols for empty df to start merging
        # each metric in
        merge_cols = [std_col.STATE_FIPS_COL]
        if geo == COUNTY_LEVEL:
            merge_cols.append(std_col.COUNTY_FIPS_COL)

        if demo == RACE:
            merge_cols.append(std_col.RACE_CATEGORY_ID_COL)
        elif demo == AGE:
            merge_cols.append(std_col.AGE_COL)
        elif demo == SEX:
            merge_cols.append(std_col.SEX_COL)

        # Create an empty df that we will merge each condition into
        df = pd.DataFrame(columns=merge_cols)

        if demo == RACE:
            for measure, acs_item in acs_items.items():
                concept_dfs = []
                for race, concept in acs_item.concept_map.items():
                    # Get cached data from GCS

                    concept_df = gcs_to_bq_util.load_values_as_df(
                        gcs_bucket,
                        self.get_filename_race(measure, race, geo == COUNTY_LEVEL, year),
                    )

                    concept_df = self.generate_df_for_concept(
                        measure, acs_item, concept_df, demo, geo, concept, var_map
                    )
                    concept_df[std_col.RACE_CATEGORY_ID_COL] = race
                    concept_dfs.append(concept_df)

                concept_df = pd.concat(concept_dfs)
                df = pd.merge(df, concept_df, on=merge_cols, how="outer")

            return df

        else:
            for measure, acs_item in acs_items.items():
                concept_dfs = []
                concept_df = gcs_to_bq_util.load_values_as_df(
                    gcs_bucket,
                    self.get_filename_sex(measure, geo == COUNTY_LEVEL, year),
                )
                concept_df = self.generate_df_for_concept(
                    measure,
                    acs_item,
                    concept_df,
                    demo,
                    geo,
                    acs_item.sex_age_concept,
                    var_map,
                )

                df = pd.merge(df, concept_df, on=merge_cols, how="outer")

            return df

    def generate_df_for_concept(self, measure, acs_item, df, demo, geo, concept, var_map):
        """Transforms the encoded census data into a dataframe ready
        to have post processing functions run on it.

        In this case, we want a dataframe which records the condition
        `without health insurance` for each demographic group at
        each geographic level. Also, we will use the total numbers of people
        measured as our population numbers, rather than the acs population
        numbers.

        df: Dataframe containing the encoded data from the acs survey
            for the corresponsing concept.
        demo: String representing `race/sex/age`
        geo: String representing geographic level, `national/state/county`
        concept: String representing the acs 'concept' that represents
                 the demographic group we are extracting data for.
        var_map: Dict generated from the `parse_acs_metadata` function"""

        # Here we are representing the order of items on the `label` key of the
        # acs metadata json.
        # So, because the label for health insurance RACE looks like:
        # `"label": "Estimate!!Total:!!19 to 64 years:!!No health insurance coverage"`
        # we take the std_col.AGE_COL first, and the AMOUNT second
        # (The Estimate and Total keys are stripped off in the standardize frame function)
        tmp_amount_key = "tmp_amount_key"
        if measure == POVERTY_MEASURE:
            group_cols = [tmp_amount_key, std_col.SEX_COL, std_col.AGE_COL]
        elif measure == HEALTH_INSURANCE_MEASURE:
            group_cols = [std_col.AGE_COL, tmp_amount_key]
            if demo != RACE:
                group_cols = [std_col.SEX_COL] + group_cols

        group_vars = get_vars_for_group(concept, var_map, len(group_cols))

        # Creates a df with different rows for the amount of people
        # in a demographic group with and without the condition
        # We want each of these values on the same row however.
        df_with_without = standardize_frame(df, group_vars, group_cols, geo == COUNTY_LEVEL, AMOUNT)

        # Create two separate df's, one for people with the condition, and one for
        # people without. Rename the columns so that we can merge them later.
        df_with_condition = df_with_without.loc[
            df_with_without[tmp_amount_key] == acs_item.has_condition_key
        ].reset_index(drop=True)

        df_without_condition = df_with_without.loc[
            df_with_without[tmp_amount_key] == acs_item.does_not_have_condition_key
        ].reset_index(drop=True)

        without_condition_raw_count = generate_column_name(measure, "without")
        df_without_condition = df_without_condition.rename(columns={AMOUNT: without_condition_raw_count})

        raw_count = generate_column_name(measure, HAS_ACS_ITEM_SUFFIX)
        df_with_condition = df_with_condition.rename(columns={AMOUNT: raw_count})

        merge_cols = group_cols.copy()
        merge_cols.append(std_col.STATE_FIPS_COL)
        merge_cols.remove(tmp_amount_key)
        if geo == COUNTY_LEVEL:
            merge_cols.append(std_col.COUNTY_FIPS_COL)

        df_with_condition = df_with_condition[merge_cols + [raw_count]]
        df_without_condition = df_without_condition[merge_cols + [without_condition_raw_count]]

        # Generate the population for each condition by adding together
        # the raw counts of people with and without the condition.
        population_df = pd.merge(df_without_condition, df_with_condition, on=merge_cols, how="left")
        population = generate_column_name(measure, POP_SUFFIX)
        population_df[[raw_count, without_condition_raw_count]] = population_df[
            [raw_count, without_condition_raw_count]
        ].astype(float)
        population_df[population] = population_df[raw_count] + population_df[without_condition_raw_count]
        population_df = population_df[merge_cols + [population]]

        # Merge the population df back into the df of people with the condition
        # to create our main df.
        df = pd.merge(df_with_condition, population_df, on=merge_cols, how="left")
        df = df[merge_cols + [population, raw_count]]
        df = update_col_types(df)

        if geo == NATIONAL_LEVEL:
            groupby_cols = [std_col.AGE_COL]
            if demo != RACE:
                groupby_cols.append(std_col.SEX_COL)

            df = df.groupby(groupby_cols).sum(numeric_only=True).reset_index()
            df[std_col.STATE_FIPS_COL] = US_FIPS

        groupby_cols = [std_col.STATE_FIPS_COL]
        if geo == COUNTY_LEVEL:
            groupby_cols.append(std_col.COUNTY_FIPS_COL)

        if demo == AGE:
            groupby_cols.append(std_col.AGE_COL)
        elif demo == SEX:
            groupby_cols.append(std_col.SEX_COL)

        df = df.groupby(groupby_cols).sum(numeric_only=True).reset_index()

        # Rename age column and combine needed age ranges
        if demo == AGE:
            df[std_col.AGE_COL] = df[std_col.AGE_COL].apply(rename_age_bracket)

            if measure == POVERTY_MEASURE:
                df[std_col.AGE_COL] = df[std_col.AGE_COL].apply(get_poverty_age_range)
                df = df.groupby(groupby_cols).sum(numeric_only=True).reset_index()

        return df

    def post_process(self, df, demo, geo, acs_items, health_insurance_race_to_concept):
        """Merge population data, state, and county names.
        Do all needed calculations to generate pct_rate,
        pct_share, and pct_relative_inequity columns.
        Returns a dataframe ready for the frontend.

        df: Dataframe with raw acs condition.
        demo: Demographic contained in the dataframe (race/sex/age).
        geo: Geographic level contained in the dataframe (national/state/county)."""

        demo_col = std_col.RACE_CATEGORY_ID_COL if demo == RACE else demo
        all_val = Race.ALL.value if demo == RACE else std_col.ALL_VALUE

        all_columns = [
            std_col.STATE_FIPS_COL,
            std_col.STATE_NAME_COL,
            demo_col,
        ]

        breakdown_vals_to_sum = None

        if demo == RACE:
            all_races = health_insurance_race_to_concept.keys()
            breakdown_vals_to_sum = list(all_races)
            breakdown_vals_to_sum.remove(Race.HISP.value)

        value_cols = []
        for measure in acs_items.keys():
            value_cols.append(generate_column_name(measure, HAS_ACS_ITEM_SUFFIX))
            value_cols.append(generate_column_name(measure, POP_SUFFIX))

        df = add_sum_of_rows(df, demo_col, value_cols, all_val, breakdown_vals_to_sum)

        df = merge_state_ids(df)

        if geo == COUNTY_LEVEL:
            all_columns.extend([std_col.COUNTY_NAME_COL, std_col.COUNTY_FIPS_COL])
            df = merge_county_names(df)

        for measure, acs_item in acs_items.items():
            raw_count_col = generate_column_name(measure, HAS_ACS_ITEM_SUFFIX)
            pop_col = generate_column_name(measure, POP_SUFFIX)

            pct_rate_col = generate_column_name(acs_item.bq_prefix, std_col.PCT_RATE_SUFFIX)
            all_columns.append(pct_rate_col)

            # PCT_RATE
            df = generate_pct_rate_col(df, raw_count_col, pop_col, pct_rate_col)

        pct_share_cols = {}
        for measure, acs_item in acs_items.items():
            pct_share_col = generate_column_name(acs_item.bq_prefix, std_col.PCT_SHARE_SUFFIX)
            pct_share_cols[generate_column_name(measure, HAS_ACS_ITEM_SUFFIX)] = pct_share_col
            all_columns.append(pct_share_col)

            pop_pct_col = generate_column_name(acs_item.bq_prefix, std_col.POP_PCT_SUFFIX)
            pct_share_cols[generate_column_name(measure, POP_SUFFIX)] = pop_pct_col
            all_columns.append(pop_pct_col)

        # PCT_SHARE
        df = generate_pct_share_col_without_unknowns(df, pct_share_cols, demo_col, all_val)

        for item in acs_items.values():
            pct_rel_inequity_col = f"{item.bq_prefix}_{std_col.PCT_REL_INEQUITY_SUFFIX}"

            # PCT_REL_INEQUITY
            df = generate_pct_rel_inequity_col(
                df,
                f"{item.bq_prefix}_{std_col.PCT_SHARE_SUFFIX}",
                f"{item.bq_prefix}_{std_col.POP_PCT_SUFFIX}",
                pct_rel_inequity_col,
            )
            all_columns.append(pct_rel_inequity_col)

        # Keep and rename raw count "N" columns
        for measure, acs_item in acs_items.items():
            rename_map = {
                # Rename numerators e.g. health_insurance_has_acs_item to uninsurance_estimated_total
                generate_column_name(measure, HAS_ACS_ITEM_SUFFIX): generate_column_name(
                    acs_item.bq_prefix, std_col.RAW_SUFFIX
                ),
                # Rename denominators e.g. health_insurance_pop to uninsurance_population_estimated_total
                generate_column_name(measure, POP_SUFFIX): f"{acs_item.bq_prefix}_{POP_SUFFIX}_{std_col.RAW_SUFFIX}",
            }
            all_columns.extend(rename_map.values())

            df = df.rename(columns=rename_map)

        df = df[all_columns].reset_index(drop=True)
        return df
