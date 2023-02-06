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
    add_race_columns_from_category_id)

BASE_ACS_URL = 'https://api.census.gov/data/2019/acs/acs5'

CONCEPTS_TO_RACE = {
    'HEALTH INSURANCE COVERAGE STATUS BY AGE (AMERICAN INDIAN AND ALASKA NATIVE ALONE)': Race.AIAN.value,
    'HEALTH INSURANCE COVERAGE STATUS BY AGE (ASIAN ALONE)': Race.ASIAN.value,
    'HEALTH INSURANCE COVERAGE STATUS BY AGE (HISPANIC OR LATINO)': Race.HISP.value,
    'HEALTH INSURANCE COVERAGE STATUS BY AGE (BLACK OR AFRICAN AMERICAN ALONE)': Race.BLACK.value,
    'HEALTH INSURANCE COVERAGE STATUS BY AGE (NATIVE HAWAIIAN AND OTHER PACIFIC ISLANDER ALONE)': Race.NHPI.value,
    'HEALTH INSURANCE COVERAGE STATUS BY AGE (WHITE ALONE)': Race.WHITE.value,
    'HEALTH INSURANCE COVERAGE STATUS BY AGE (SOME OTHER RACE ALONE)': Race.OTHER_STANDARD.value,
    'HEALTH INSURANCE COVERAGE STATUS BY AGE (TWO OR MORE RACES)': Race.MULTI.value,
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


# Health insurance by Sex only has one prefix, and is kept
# in the form of a dict to help with standardizing code flow
HEALTH_INSURANCE_BY_SEX_GROUPS_PREFIX = 'B27001'
HEALTH_INSURANCE_SEX_BY_AGE_CONCEPT = 'HEALTH INSURANCE COVERAGE STATUS BY SEX BY AGE'

HAS_HEALTH_INSURANCE = 'has_health_insurance'

# Col names for temporary df, never written to bq
AMOUNT = 'amount'
HEALTH_INSURANCE_POP = 'health_insurance_pop'
WITHOUT_HEALTH_INSURANCE = 'wihout_health_insurance'


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

    # Gets standardized filename
    # If race is set, gets race filename
    # If race is None and sex is set, gets filename for sex
    def get_filename_race(self, race, is_county):
        geo = 'COUNTY' if is_county else 'STATE'
        race = race.replace(" ", "_").upper()
        return f'HEALTH_INSURANCE_BY_RACE_{geo}_{race}.json'

    def get_filename_sex(self, is_county):
        geo = 'COUNTY' if is_county else 'STATE'
        return f'HEALTH_INSURANCE_BY_SEX_{geo}.json'

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
    # (presumably to skip the write to bq step though not 100% sure as of writing this)
    def upload_to_gcs(self, bucket, **attrs):
        # Iterates over the different race ACS variables,
        # retrieves the race from the metadata merged dict
        # writes the data to the GCS bucket and sees if file diff is changed
        file_diff = False
        for prefix, race in HEALTH_INSURANCE_BY_RACE_GROUP_PREFIXES.items():
            for county_level in [True, False]:
                params = get_all_params_for_group(prefix, county_level)
                file_diff = (
                    url_file_to_gcs.url_file_to_gcs(
                        self.base_url,
                        params,
                        bucket,
                        self.get_filename_race(race, county_level),
                    )
                    or file_diff
                )

        for county_level in [True, False]:
            params = get_all_params_for_group(HEALTH_INSURANCE_BY_SEX_GROUPS_PREFIX, county_level)
            file_diff = (
                url_file_to_gcs.url_file_to_gcs(
                    self.base_url, params, bucket, self.get_filename_sex(county_level)
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
        var_map = parse_acs_metadata(metadata,
                                     list(HEALTH_INSURANCE_BY_RACE_GROUP_PREFIXES.keys())
                                     + [HEALTH_INSURANCE_BY_SEX_GROUPS_PREFIX])

        if demo == RACE:
            dfs = []
            for concept, race in CONCEPTS_TO_RACE.items():
                # Get cached data from GCS
                df = gcs_to_bq_util.load_values_as_df(
                    gcs_bucket, self.get_filename_race(race, geo == COUNTY_LEVEL)
                )

                df = self.generate_df_for_concept(df, demo, geo, concept, var_map)
                df[std_col.RACE_CATEGORY_ID_COL] = race
                dfs.append(df)

            return pd.concat(dfs)

        else:
            df = gcs_to_bq_util.load_values_as_df(
                gcs_bucket, self.get_filename_sex(geo == COUNTY_LEVEL)
            )
            return self.generate_df_for_concept(df, demo, geo,
                                                HEALTH_INSURANCE_SEX_BY_AGE_CONCEPT,
                                                var_map)

    def generate_df_for_concept(self, df, demo, geo, concept, var_map):
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

        # Health insurance by race only breaks down by 2 variables,
        # `age` and `with/without health insurance`, because the race is already
        # baked into the concept, however for sex/age, the sex is not baked into the
        # concept but rather is another variable that needs to be broken out,
        # so we have to pass in 3.
        num_var_groups = 2 if demo == RACE else 3
        group_vars = get_vars_for_group(concept, var_map, num_var_groups)

        group_cols = [std_col.AGE_COL, HAS_HEALTH_INSURANCE]
        if demo != RACE:
            group_cols = [std_col.SEX_COL] + group_cols

        # Creates a df with different rows for the amount of people
        # in a demographic group with health insurance and without
        # health insurance. We want each of these values on the same
        # row however.
        df_with_without = standardize_frame(df, group_vars, group_cols,
                                            geo == COUNTY_LEVEL, AMOUNT)

        # Separate rows of the amount of people without health insurance into
        # their own df and rename the 'amount' col to the correct name.
        df_without = df_with_without.loc[df_with_without[HAS_HEALTH_INSURANCE] ==
                                         'No health insurance coverage'].reset_index(drop=True)
        df_without = df_without.rename(columns={AMOUNT: WITHOUT_HEALTH_INSURANCE})

        merge_cols = [std_col.STATE_FIPS_COL, std_col.AGE_COL]
        if geo == COUNTY_LEVEL:
            merge_cols.append(std_col.COUNTY_FIPS_COL)
        if demo != RACE:
            merge_cols.append(std_col.SEX_COL)

        # Same reasoning as above, but because we are collecting population numbers here,
        # we need one fewer variable for `with/without health insurance`.
        num_var_groups = 1 if demo == RACE else 2
        group_vars_totals = get_vars_for_group(concept, var_map, num_var_groups)

        group_cols = [std_col.AGE_COL]
        if demo != RACE:
            group_cols = [std_col.SEX_COL] + group_cols

        df_totals = standardize_frame(df, group_vars_totals, group_cols,
                                      geo == COUNTY_LEVEL, HEALTH_INSURANCE_POP)

        df_totals = df_totals[merge_cols + [HEALTH_INSURANCE_POP]]
        df = pd.merge(df_without, df_totals, on=merge_cols, how='left')

        df = df[merge_cols + [WITHOUT_HEALTH_INSURANCE, HEALTH_INSURANCE_POP]]
        df = update_col_types(df)

        if geo == NATIONAL_LEVEL:
            groupby_cols = [std_col.AGE_COL]
            if demo != RACE:
                groupby_cols.append(std_col.SEX_COL)

            df = df.groupby(groupby_cols).sum().reset_index()
            df[std_col.STATE_FIPS_COL] = US_FIPS

        groupby_cols = merge_cols
        if demo == AGE:
            groupby_cols.remove(std_col.SEX_COL)
        if demo == SEX or demo == RACE:
            groupby_cols.remove(std_col.AGE_COL)

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
            std_col.UNINSURED_POPULATION_PCT,
        ]

        breakdown_vals_to_sum = None
        if demo == RACE:
            breakdown_vals_to_sum = list(CONCEPTS_TO_RACE.values())
            breakdown_vals_to_sum.remove(Race.HISP.value)

        df = add_sum_of_rows(df, demo_col,
                             [WITHOUT_HEALTH_INSURANCE, HEALTH_INSURANCE_POP],
                             all_val, breakdown_vals_to_sum)

        df = merge_state_ids(df)

        if geo == COUNTY_LEVEL:
            all_columns.extend(
                [std_col.COUNTY_NAME_COL, std_col.COUNTY_FIPS_COL])
            df = merge_county_names(df)

        df = generate_per_100k_col(df, WITHOUT_HEALTH_INSURANCE,
                                   HEALTH_INSURANCE_POP,
                                   std_col.UNINSURED_PER_100K_COL)

        df = generate_pct_share_col_without_unknowns(
            df, {WITHOUT_HEALTH_INSURANCE: std_col.UNINSURED_PCT_SHARE_COL,
                 HEALTH_INSURANCE_POP: std_col.UNINSURED_POPULATION_PCT},
            demo_col, all_val)

        all_columns.extend([std_col.UNINSURED_PER_100K_COL, std_col.UNINSURED_PCT_SHARE_COL])
        return df[all_columns].reset_index(drop=True)
