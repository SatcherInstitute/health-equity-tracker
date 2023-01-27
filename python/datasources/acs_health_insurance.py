import pandas as pd

from datasources.data_source import DataSource
from ingestion import url_file_to_gcs, gcs_to_bq_util, census
import ingestion.standardized_columns as std_col

from ingestion.census import (
    parse_acs_metadata,
    get_vars_for_group,
    standardize_frame,
    get_census_params,
)

from ingestion.constants import (
    RACE,
    AGE,
    SEX)

from ingestion.standardized_columns import (
    Race,
    add_race_columns_from_category_id,
)

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
    'HEALTH INSURANCE COVERAGE STATUS BY AGE (WHITE ALONE, NOT HISPANIC OR LATINO)': Race.WHITE_NH.value,
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
    'C27001H': Race.WHITE_NH.value,
    'C27001I': Race.HISP.value,
}


# Health insurance by Sex only has one prefix, and is kept
# in the form of a dict to help with standardizing code flow
HEALTH_INSURANCE_BY_SEX_GROUPS_PREFIX = 'B27001'
HEALTH_INSURANCE_SEX_BY_AGE_CONCEPT = 'HEALTH INSURANCE COVERAGE STATUS BY SEX BY AGE'

HAS_HEALTH_INSURANCE = 'has_health_insurance'
AMOUNT = 'amount'


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


class AcsHealthInsuranceIngester(DataSource):

    # Initialize variables in class instance, also merge all metadata so that lookup of the
    # prefix, suffix combos can return the entire metadata
    def __init__(self, base_url):
        self.base_url = base_url

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
    def upload_to_gcs(self, bucket):
        # Iterates over the different race ACS variables,
        # retrieves the race from the metadata merged dict
        # writes the data to the GCS bucket and sees if file diff is changed
        file_diff = False
        for group, race in HEALTH_INSURANCE_BY_RACE_GROUP_PREFIXES.items():
            for is_county in [True, False]:
                params = get_census_params(group, is_county)

                file_diff = (
                    url_file_to_gcs.url_file_to_gcs(
                        self.base_url,
                        params,
                        bucket,
                        self.get_filename(race, is_county),
                    )
                    or file_diff
                )

        return file_diff

    def write_to_bq(self, dataset, gcs_bucket):
        self.metadata = census.fetch_acs_metadata(self.base_url)
        dfs = {}
        for is_county in [True, False]:
            for demo in [RACE, AGE, SEX]:
                table_name = f'by_{demo}'
                if is_county:
                    table_name += '_county'
                else:
                    table_name += '_state'

                dfs[table_name] = self.getData(demo, is_county, gcs_bucket=gcs_bucket)

        for table_name, df in dfs.items():
            float_cols = [std_col.WITH_HEALTH_INSURANCE_COL,
                          std_col.WITH_HEALTH_INSURANCE_COL,
                          std_col.POPULATION_COL]
            gcs_to_bq_util.add_df_to_bq(
                df, dataset, table_name, column_types=gcs_to_bq_util.get_bq_column_types(df, float_cols)
            )

    # Get Health insurance data from either GCS or Directly, and aggregate the data in memory
    def getData(self, demo, is_county, gcs_bucket=None):
        var_map = parse_acs_metadata(self.metadata,
                                     list(HEALTH_INSURANCE_BY_RACE_GROUP_PREFIXES.keys())
                                     + [HEALTH_INSURANCE_BY_SEX_GROUPS_PREFIX])

        if gcs_bucket is not None:
            if demo == RACE:
                dfs = []
                for concept, race in CONCEPTS_TO_RACE.items():
                    # Get cached data from GCS
                    df = gcs_to_bq_util.load_values_as_df(
                        gcs_bucket, self.get_filename_race(race, is_county)
                    )

                    df = self.generate_df_for_concept(df, demo, concept, is_county, var_map)
                    df[std_col.RACE_CATEGORY_ID_COL] = race
                    dfs.append(df)

                return pd.concat(dfs)

            else:
                df = gcs_to_bq_util.load_values_as_df(
                    gcs_bucket, self.get_filename_sex(is_county)
                )
                return self.generate_df_for_concept(df, demo,
                                                    HEALTH_INSURANCE_SEX_BY_AGE_CONCEPT,
                                                    is_county, var_map)

    def generate_df_for_concept(self, df, demo, concept, is_county, var_map):
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
                                            is_county, AMOUNT)

        # Separate rows of the amount of people with health insurance into
        # their own df and rename the 'amount' col to the correct name.
        df_with = df_with_without.loc[df_with_without[HAS_HEALTH_INSURANCE] ==
                                      'With health insurance coverage'].reset_index(drop=True)
        df_with = df_with.rename(columns={AMOUNT: std_col.WITH_HEALTH_INSURANCE_COL})

        # Separate rows of the amount of people without health insurance into
        # their own df and rename the 'amount' col to the correct name.
        df_without = df_with_without.loc[df_with_without[HAS_HEALTH_INSURANCE] ==
                                         'No health insurance coverage'].reset_index(drop=True)
        df_without = df_without.rename(columns={AMOUNT: std_col.WITHOUT_HEALTH_INSURANCE_COL})

        merge_cols = [std_col.STATE_FIPS_COL]
        if is_county:
            merge_cols.append(std_col.COUNTY_FIPS_COL)
        if demo != RACE:
            merge_cols.extend([std_col.SEX_COL, std_col.AGE_COL])

        df_with = df_with[merge_cols + [std_col.WITH_HEALTH_INSURANCE_COL]]

        # Merge the with and without df's into a single one with the correct
        # column names.
        df_with_without = pd.merge(df_without, df_with, on=merge_cols, how='left')
        df_with_without = df_with_without.drop(columns=[HAS_HEALTH_INSURANCE])

        # Same reasoning as above, but because we are collecting population numbers here,
        # we need one fewer variable for `with/without health insurance`.
        num_var_groups = 1 if demo == RACE else 2
        group_vars_totals = get_vars_for_group(concept, var_map, num_var_groups)

        group_cols = [std_col.AGE_COL]
        if concept == HEALTH_INSURANCE_SEX_BY_AGE_CONCEPT:
            group_cols = [std_col.SEX_COL] + group_cols

        df_totals = standardize_frame(df, group_vars_totals,
                                      group_cols, is_county, std_col.POPULATION_COL)

        df_totals = df_totals[merge_cols + [std_col.POPULATION_COL]]
        df = pd.merge(df_with_without, df_totals, on=merge_cols, how='left')

        df = df[merge_cols + [std_col.WITH_HEALTH_INSURANCE_COL,
                              std_col.WITHOUT_HEALTH_INSURANCE_COL,
                              std_col.POPULATION_COL]]

        df = update_col_types(df)

        groupby_cols = merge_cols
        if demo == AGE:
            groupby_cols.remove(std_col.SEX_COL)
        if demo == SEX:
            groupby_cols.remove(std_col.AGE_COL)

        return df.groupby(groupby_cols).sum().reset_index()
