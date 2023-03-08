import pandas as pd

from datasources.data_source import DataSource
from ingestion import url_file_to_gcs, gcs_to_bq_util, census
import ingestion.standardized_columns as std_col

from ingestion.census import (
    parse_acs_metadata,
    get_vars_for_group,
    standardize_frame,
    get_all_params_for_group)

from ingestion.merge_utils import (
    merge_state_ids,
    merge_county_names)

from ingestion.dataset_utils import (
    generate_per_100k_col,
    generate_pct_share_col_without_unknowns,
    add_sum_of_rows)

from ingestion.constants import (
    US_FIPS,
    NATIONAL_LEVEL,
    STATE_LEVEL,
    COUNTY_LEVEL,
    RACE,
    AGE,
    SEX)

from ingestion.standardized_columns import (
    Race,
    add_race_columns_from_category_id,
    generate_column_name)

BASE_ACS_URL = 'https://api.census.gov/data/2019/acs/acs5'


HEALTH_INSURANCE_RACE_TO_CONCEPT = {
    Race.AIAN.value: 'HEALTH INSURANCE COVERAGE STATUS BY AGE (AMERICAN INDIAN AND ALASKA NATIVE ALONE)',
    Race.ASIAN.value: 'HEALTH INSURANCE COVERAGE STATUS BY AGE (ASIAN ALONE)',
    Race.HISP.value: 'HEALTH INSURANCE COVERAGE STATUS BY AGE (HISPANIC OR LATINO)',
    Race.BLACK.value: 'HEALTH INSURANCE COVERAGE STATUS BY AGE (BLACK OR AFRICAN AMERICAN ALONE)',
    Race.NHPI.value: 'HEALTH INSURANCE COVERAGE STATUS BY AGE (NATIVE HAWAIIAN AND OTHER PACIFIC ISLANDER ALONE)',
    Race.WHITE.value: 'HEALTH INSURANCE COVERAGE STATUS BY AGE (WHITE ALONE)',
    Race.OTHER_STANDARD.value: 'HEALTH INSURANCE COVERAGE STATUS BY AGE (SOME OTHER RACE ALONE)',
    Race.MULTI.value: 'HEALTH INSURANCE COVERAGE STATUS BY AGE (TWO OR MORE RACES)',
}

NHPI_POVERY_VALUE = \
    'POVERTY STATUS IN THE PAST 12 MONTHS BY SEX BY AGE (NATIVE HAWAIIAN AND OTHER PACIFIC ISLANDER ALONE)'

POVERTY_RACE_TO_CONCEPT = {
    Race.AIAN.value: 'POVERTY STATUS IN THE PAST 12 MONTHS BY SEX BY AGE (AMERICAN INDIAN AND ALASKA NATIVE ALONE)',
    Race.ASIAN.value: 'POVERTY STATUS IN THE PAST 12 MONTHS BY SEX BY AGE (ASIAN ALONE)',
    Race.HISP.value: 'POVERTY STATUS IN THE PAST 12 MONTHS BY SEX BY AGE (HISPANIC OR LATINO)',
    Race.BLACK.value: 'POVERTY STATUS IN THE PAST 12 MONTHS BY SEX BY AGE (BLACK OR AFRICAN AMERICAN ALONE)',
    Race.NHPI.value: NHPI_POVERY_VALUE,
    Race.WHITE.value: 'POVERTY STATUS IN THE PAST 12 MONTHS BY SEX BY AGE (WHITE ALONE)',
    Race.OTHER_STANDARD.value: 'POVERTY STATUS IN THE PAST 12 MONTHS BY SEX BY AGE (SOME OTHER RACE ALONE)',
    Race.MULTI.value: 'POVERTY STATUS IN THE PAST 12 MONTHS BY SEX BY AGE (TWO OR MORE RACES)',
}

# ACS Health Insurance By Race Prefixes.
# Acs variables are in the form C27001A_xxx0 C27001A_xxx2 ect
# to determine age buckets.  The metadata variables are merged with the suffixes to form the entire metadata.
HEALTH_INSURANCE_BY_RACE_GROUP_PREFIXES = {
    'C27001A': Race.WHITE.value,
    'C27001B': Race.BLACK.value,
    'C27001C': Race.AIAN.value,
    'C27001D': Race.ASIAN.value,
    'C27001E': Race.NHPI.value,
    'C27001F': Race.OTHER_STANDARD.value,
    'C27001G': Race.MULTI.value,
    'C27001I': Race.HISP.value,
}

POVERTY_BY_RACE_SEX_AGE_GROUP_PREFIXES = {
    'B17001A': Race.WHITE.value,
    'B17001B': Race.BLACK.value,
    'B17001C': Race.AIAN.value,
    'B17001D': Race.ASIAN.value,
    'B17001E': Race.NHPI.value,
    'B17001F': Race.OTHER_STANDARD.value,
    'B17001G': Race.MULTI.value,
    'B17001I': Race.HISP.value,
}


class AcsItem():
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

    def __init__(self, prefix_map, concept_map, sex_age_prefix,
                 sex_age_concept, has_condition_key,
                 does_not_have_condition_key, bq_prefix):

        self.prefix_map = prefix_map
        self.concept_map = concept_map
        self.sex_age_prefix = sex_age_prefix
        self.sex_age_concept = sex_age_concept
        self.has_condition_key = has_condition_key
        self.does_not_have_condition_key = does_not_have_condition_key
        self.bq_prefix = bq_prefix


# Health insurance by Sex only has one prefix, and is kept
# in the form of a dict to help with standardizing code flow
HEALTH_INSURANCE_BY_SEX_GROUPS_PREFIX = 'B27001'
HEALTH_INSURANCE_SEX_BY_AGE_CONCEPT = 'HEALTH INSURANCE COVERAGE STATUS BY SEX BY AGE'

POVERTY_BY_SEX_AGE_GROUPS_PREFIX = 'B17001'
POVERTY_BY_SEX_AGE_CONCEPT = 'POVERTY STATUS IN THE PAST 12 MONTHS BY SEX BY AGE'

HAS_HEALTH_INSURANCE = 'has_health_insurance'
INCOME_UNDER_POVERTY = 'under_poverty_line'

# Col names for temporary df, never written to bq
AMOUNT = 'amount'
POP_SUFFIX = 'pop'
HAS_ACS_ITEM_SUFFIX = 'has_acs_item'

HEALTH_INSURANCE_KEY = 'No health insurance coverage'
WITH_HEALTH_INSURANCE_KEY = 'With health insurance coverage'

NOT_IN_POVERTY_KEY = 'Income in the past 12 months at or above poverty level'
POVERTY_KEY = 'Income in the past 12 months below poverty level'

HEALTH_INSURANCE_MEASURE = 'health_insurance'
POVERTY_MEASURE = 'poverty'

ACS_ITEMS = {
    HEALTH_INSURANCE_MEASURE: AcsItem(HEALTH_INSURANCE_BY_RACE_GROUP_PREFIXES,
                                      HEALTH_INSURANCE_RACE_TO_CONCEPT,
                                      HEALTH_INSURANCE_BY_SEX_GROUPS_PREFIX,
                                      HEALTH_INSURANCE_SEX_BY_AGE_CONCEPT,
                                      HEALTH_INSURANCE_KEY,
                                      WITH_HEALTH_INSURANCE_KEY,
                                      std_col.UNINSURED_PREFIX),

    POVERTY_MEASURE: AcsItem(POVERTY_BY_RACE_SEX_AGE_GROUP_PREFIXES,
                             POVERTY_RACE_TO_CONCEPT,
                             POVERTY_BY_SEX_AGE_GROUPS_PREFIX,
                             POVERTY_BY_SEX_AGE_CONCEPT,
                             POVERTY_KEY,
                             NOT_IN_POVERTY_KEY,
                             std_col.POVERTY_PREFIX),

}


def update_col_types(df):
    """Returns a new DataFrame with the column types replaced with int64 for
       population columns and string for other columns.

       df: The original DataFrame"""
    colTypes = {}
    str_cols = (std_col.STATE_FIPS_COL, std_col.COUNTY_FIPS_COL,
                std_col.RACE_CATEGORY_ID_COL, std_col.SEX_COL, std_col.AGE_COL)

    for col in df.columns:
        if col in str_cols:
            colTypes[col] = str
        else:
            colTypes[col] = float
    df = df.astype(colTypes)
    return df


class AcsHealthInsurance(DataSource):

    # Initialize variables in class instance, also merge all metadata so that lookup of the
    # prefix, suffix combos can return the entire metadata
    def __init__(self):
        self.base_url = BASE_ACS_URL

    def get_filename_race(self, measure, race, is_county):
        geo = 'COUNTY' if is_county else 'STATE'
        race = race.replace(" ", "_").upper()
        return f'{measure.upper()}_BY_RACE_{geo}_{race}.json'

    def get_filename_sex(self, measure, is_county):
        geo = 'COUNTY' if is_county else 'STATE'
        return f'{measure.upper()}_BY_SEX_{geo}.json'

    @staticmethod
    def get_id():
        return 'ACS_HEALTH_INSURANCE'

    @staticmethod
    def get_table_name():
        return 'acs_health_insurance'

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
        # Iterates over the different race ACS variables,
        # retrieves the race from the metadata merged dict
        # writes the data to the GCS bucket and sees if file diff is changed
        file_diff = False
        for measure, acs_item in ACS_ITEMS.items():
            for prefix, race in acs_item.prefix_map.items():
                for county_level in [True, False]:
                    params = get_all_params_for_group(prefix, county_level)
                    file_diff = (
                        url_file_to_gcs.url_file_to_gcs(
                            self.base_url,
                            params,
                            bucket,
                            self.get_filename_race(measure, race, county_level),
                        )
                        or file_diff
                    )

            for county_level in [True, False]:
                params = get_all_params_for_group(acs_item.sex_age_prefix, county_level)
                file_diff = (
                    url_file_to_gcs.url_file_to_gcs(
                        self.base_url, params, bucket, self.get_filename_sex(measure, county_level)
                    )
                    or file_diff
                )

        return file_diff

    def write_to_bq(self, dataset, gcs_bucket, **attrs):
        metadata = census.fetch_acs_metadata(self.base_url)
        dfs = {}
        for geo in [NATIONAL_LEVEL, STATE_LEVEL, COUNTY_LEVEL]:
            for demo in [RACE, AGE, SEX]:
                table_name = f'by_{demo}_{geo}_processed'
                df = self.get_raw_data(demo, geo, metadata, gcs_bucket=gcs_bucket)
                df = self.post_process(df, demo, geo)

                if demo == RACE:
                    add_race_columns_from_category_id(df)

                dfs[table_name] = df

        for table_name, df in dfs.items():
            float_cols = [std_col.UNINSURED_PER_100K_COL,
                          std_col.UNINSURED_POPULATION_PCT,
                          std_col.UNINSURED_PCT_SHARE_COL]

            col_types = gcs_to_bq_util.get_bq_column_types(df, float_cols)
            gcs_to_bq_util.add_df_to_bq(
                df, dataset, table_name,
                column_types=col_types)

    def get_raw_data(self, demo, geo, metadata, gcs_bucket):
        groups = []
        for acs_item in ACS_ITEMS.values():
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
            for measure, acs_item in ACS_ITEMS.items():
                concept_dfs = []
                for race, concept in acs_item.concept_map.items():
                    # Get cached data from GCS
                    concept_df = gcs_to_bq_util.load_values_as_df(
                        gcs_bucket, self.get_filename_race(measure, race, geo == COUNTY_LEVEL)
                    )

                    concept_df = self.generate_df_for_concept(measure,
                                                              acs_item,
                                                              concept_df, demo,
                                                              geo, concept,
                                                              var_map)
                    concept_df[std_col.RACE_CATEGORY_ID_COL] = race
                    concept_dfs.append(concept_df)

                concept_df = pd.concat(concept_dfs)
                df = pd.merge(df, concept_df, on=merge_cols, how='outer')

            return df

        else:
            for measure, acs_item in ACS_ITEMS.items():
                concept_dfs = []
                concept_df = gcs_to_bq_util.load_values_as_df(
                    gcs_bucket, self.get_filename_sex(measure, geo == COUNTY_LEVEL)
                )
                concept_df = self.generate_df_for_concept(measure, acs_item, concept_df, demo, geo,
                                                          acs_item.sex_age_concept, var_map)

                df = pd.merge(df, concept_df, on=merge_cols, how='outer')

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
        tmp_amount_key = 'tmp_amount_key'
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
        df_with_without = standardize_frame(df, group_vars, group_cols,
                                            geo == COUNTY_LEVEL, AMOUNT)

        # Create two separate df's, one for people with the condition, and one for
        # people without. Rename the columns so that we can merge them later.
        df_with_condition = df_with_without.loc[df_with_without[tmp_amount_key] ==
                                                acs_item.has_condition_key].reset_index(drop=True)

        df_without_condition = df_with_without.loc[df_with_without[tmp_amount_key] ==
                                                   acs_item.does_not_have_condition_key].reset_index(drop=True)

        without_condition_raw_count = generate_column_name(measure, 'without')
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

        totals_df = pd.merge(df_without_condition, df_with_condition, on=merge_cols, how='left')

        population = generate_column_name(measure, POP_SUFFIX)

        totals_df[[raw_count, without_condition_raw_count]] = \
            totals_df[[raw_count, without_condition_raw_count]].astype(float)

        totals_df[population] = totals_df[raw_count] + totals_df[without_condition_raw_count]
        totals_df = totals_df[merge_cols + [population]]

        df = pd.merge(df_with_condition, totals_df, on=merge_cols, how='left')
        df = df[merge_cols + [population, raw_count]]
        df = update_col_types(df)

        if geo == NATIONAL_LEVEL:
            groupby_cols = [std_col.AGE_COL]
            if demo != RACE:
                groupby_cols.append(std_col.SEX_COL)

            df = df.groupby(groupby_cols).sum().reset_index()
            df[std_col.STATE_FIPS_COL] = US_FIPS

        groupby_cols = [std_col.STATE_FIPS_COL]
        if geo == COUNTY_LEVEL:
            groupby_cols.append(std_col.COUNTY_FIPS_COL)

        if demo == AGE:
            groupby_cols.append(std_col.AGE_COL)
        elif demo == SEX:
            groupby_cols.append(std_col.SEX_COL)

        return df.groupby(groupby_cols).sum().reset_index()

    def post_process(self, df, demo, geo):
        """Merge population data, state, and county names.
           Do all needed calculations to generate per100k and pct share
           columns.
           Returns a dataframe ready for the frontend.

           df: Dataframe with raw health insurance numbers.
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
            all_races = HEALTH_INSURANCE_RACE_TO_CONCEPT.keys()
            breakdown_vals_to_sum = list(all_races)
            breakdown_vals_to_sum.remove(Race.HISP.value)

        value_cols = []
        for measure in ACS_ITEMS.keys():
            value_cols.append(generate_column_name(measure, HAS_ACS_ITEM_SUFFIX))
            value_cols.append(generate_column_name(measure, POP_SUFFIX))

        df = add_sum_of_rows(df, demo_col, value_cols,
                             all_val, breakdown_vals_to_sum)

        df = merge_state_ids(df)

        if geo == COUNTY_LEVEL:
            all_columns.extend(
                [std_col.COUNTY_NAME_COL, std_col.COUNTY_FIPS_COL])
            df = merge_county_names(df)

        for measure, acs_item in ACS_ITEMS.items():
            raw_count_col = generate_column_name(measure, HAS_ACS_ITEM_SUFFIX)
            pop_col = generate_column_name(measure, POP_SUFFIX)

            per_100k_col = generate_column_name(acs_item.bq_prefix, std_col.PER_100K_SUFFIX)
            all_columns.append(per_100k_col)

            df = generate_per_100k_col(df, raw_count_col, pop_col, per_100k_col)

        pct_share_cols = {}
        for measure, acs_item in ACS_ITEMS.items():
            pct_share_col = generate_column_name(acs_item.bq_prefix, std_col.PCT_SHARE_SUFFIX)
            pct_share_cols[generate_column_name(measure, HAS_ACS_ITEM_SUFFIX)] = pct_share_col
            all_columns.append(pct_share_col)

            pop_pct_col = generate_column_name(acs_item.bq_prefix, std_col.POP_PCT_SUFFIX)
            pct_share_cols[generate_column_name(measure, POP_SUFFIX)] = pop_pct_col
            all_columns.append(pop_pct_col)

        df = generate_pct_share_col_without_unknowns(
            df, pct_share_cols, demo_col, all_val)

        df = df[all_columns].reset_index(drop=True)
        return df
