import pandas as pd
from datasources.data_source import DataSource
from ingestion import gcs_to_bq_util
from ingestion.standardized_columns import Race
import ingestion.standardized_columns as std_col

COUNTY_FIPS_COL = 'fips'
COUNTY_COL = 'recip_county'
BASE_VERA_URL = 'https://github.com/vera-institute/incarceration_trends/blob/master/incarceration_trends.csv?raw=true'

# VERA_RACE_COLS =


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
            BASE_VERA_URL, dtype={COUNTY_FIPS_COL: str}, )

        df_jail = df.copy()
        df_prison = df.copy()

        print(df[["year", "black_prison_pop"]].to_string())

        df_jail = df_jail[df_jail["year"] == "2018"].reset_index(drop=True)
        df_prison = df_prison[df_prison["year"]
                              == "2016"].reset_index(drop=True)

        df_prison = df_prison[["fips",
                               "state",
                               "county_name",
                               #  "total_pop",
                               #  "total_jail_pop",
                               # by sex
                               #  "female_jail_pop",
                               #  "male_jail_pop",
                               # by age(sum sexes)
                               #  "female_adult_jail_pop",
                               #  "female_juvenile_jail_pop",
                               #  "male_adult_jail_pop",
                               #  "male_juvenile_jail_pop",
                               # by race
                               #  "aapi_jail_pop",
                               #  "black_jail_pop",
                               #  "latinx_jail_pop",
                               #  "native_jail_pop",
                               #  "white_jail_pop",
                               #  "other_race_jail_pop",
                               "total_prison_pop",
                               "female_prison_pop",
                               "male_prison_pop",
                               "aapi_prison_pop",
                               "black_prison_pop",
                               "latinx_prison_pop",
                               "native_prison_pop",
                               "other_race_prison_pop",
                               "white_prison_pop",
                               #  "total_jail_pop_rate",
                               #  "female_jail_pop_rate",
                               #  "male_jail_pop_rate",
                               #  "aapi_jail_pop_rate",
                               #  "black_jail_pop_rate",
                               #  "latinx_jail_pop_rate",
                               #  "native_jail_pop_rate",
                               #  "white_jail_pop_rate",
                               "total_prison_pop_rate",
                               "female_prison_pop_rate",
                               "male_prison_pop_rate",
                               "aapi_prison_pop_rate",
                               "black_prison_pop_rate",
                               "latinx_prison_pop_rate",
                               "native_prison_pop_rate",
                               "white_prison_pop_rate",
                               ]]

        df_jail = df_jail[["fips",
                           "state",
                           "county_name",
                           #  "total_pop",
                           "total_jail_pop",
                           # by sex
                           "female_jail_pop",
                           "male_jail_pop",
                           # by age(sum sexes)
                           "female_adult_jail_pop",
                           "female_juvenile_jail_pop",
                           "male_adult_jail_pop",
                           "male_juvenile_jail_pop",
                           # by race
                           "aapi_jail_pop",
                           "black_jail_pop",
                           "latinx_jail_pop",
                           "native_jail_pop",
                           "white_jail_pop",
                           "other_race_jail_pop",
                           #  "total_prison_pop",
                           #  "female_prison_pop",
                           #  "male_prison_pop",
                           #  "aapi_prison_pop",
                           #  "black_prison_pop",
                           #  "latinx_prison_pop",
                           #  "native_prison_pop",
                           #  "other_race_prison_pop",
                           #  "white_prison_pop",
                           "total_jail_pop_rate",
                           "female_jail_pop_rate",
                           "male_jail_pop_rate",
                           "aapi_jail_pop_rate",
                           "black_jail_pop_rate",
                           "latinx_jail_pop_rate",
                           "native_jail_pop_rate",
                           "white_jail_pop_rate",
                           #  "total_prison_pop_rate",
                           #  "female_prison_pop_rate",
                           #  "male_prison_pop_rate",
                           #  "aapi_prison_pop_rate",
                           #  "black_prison_pop_rate",
                           #  "latinx_prison_pop_rate",
                           #  "native_prison_pop_rate",
                           #  "white_prison_pop_rate",
                           ]]

        print("\n\n")
        # print(df_jail.to_string())
        # print(df_prison.to_string())

        # rename columns as expected
        # iterate over AGE SEX RACE
        # create df subset of columns for each
        # calculate unknown is TOTAL - (sum of known)
        # melt columns into our geo/demo per row format
        # generate pct_share_with_unknowns
        # keep existing pop/rate fields or recalculate with ACS 5yr?

        df = self.generate_for_bq(df)

        column_types = {c: 'STRING' for c in df.columns}
        # column_types[std_col.VACCINATED_FIRST_DOSE] = 'FLOAT'

        if std_col.RACE_INCLUDES_HISPANIC_COL in df.columns:
            column_types[std_col.RACE_INCLUDES_HISPANIC_COL] = 'BOOL'

        gcs_to_bq_util.add_df_to_bq(
            df, dataset, "race_and_ethnicity", column_types=column_types)

    def generate_for_bq(self, df):
        output = []

        # for _, row in df.iterrows():
        #     output_row = {}
        #     output_row[std_col.COUNTY_FIPS_COL] = row[COUNTY_FIPS_COL]
        #     output_row[std_col.COUNTY_NAME_COL] = row[COUNTY_COL]
        #     output_row[std_col.RACE_CATEGORY_ID_COL] = Race.ALL.value
        #     # output_row[std_col.VACCINATED_FIRST_DOSE] = row['administered_dose1_recip']

        #     output.append(output_row)

        columns = [
            std_col.COUNTY_FIPS_COL,
            std_col.COUNTY_NAME_COL,
            std_col.RACE_CATEGORY_ID_COL,
            # std_col.VACCINATED_FIRST_DOSE,
        ]

        output_df = pd.DataFrame(output, columns=columns)
        std_col.add_race_columns_from_category_id(output_df)

        return output_df
