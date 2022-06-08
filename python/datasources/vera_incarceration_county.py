import pandas as pd
from datasources.data_source import DataSource
from ingestion import gcs_to_bq_util
from ingestion.standardized_columns import Race
from ingestion.constants import Sex
import ingestion.standardized_columns as std_col

COUNTY_FIPS_COL = 'fips'
# COUNTY_COL = 'recip_county'
BASE_VERA_URL = 'https://github.com/vera-institute/incarceration_trends/blob/master/incarceration_trends.csv?raw=true'

JUVENILE = "0-17"
ADULT = "18+"

PRISON_RAW_ALL = "total_prison_pop"
JAIL_RAW_ALL = "total_jail_pop"

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

AGE_JAIL_RAW_COLS_TO_STANDARD = {
    # "total_jail_pop": std_col.ALL_VALUE,
    "female_adult_jail_pop": ADULT,
    "female_juvenile_jail_pop": JUVENILE,
    "male_adult_jail_pop": ADULT,
    "male_juvenile_jail_pop": JUVENILE,
}

# NO PRISON/AGE DATA

GEO_COLS_TO_STANDARD = {
    "fips": std_col.COUNTY_FIPS_COL,
    "county_name": std_col.COUNTY_NAME_COL
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
        df = gcs_to_bq_util.load_csv_as_df_from_web(
            BASE_VERA_URL, dtype={COUNTY_FIPS_COL: str}, )

        df_jail = df.copy()
        df_prison = df.copy()

        # eliminate rows with unneeded years
        df_jail = df_jail[df_jail["year"] == "2018"].reset_index(drop=True)
        df_prison = df_prison[df_prison["year"]
                              == "2016"].reset_index(drop=True)

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
                               PRISON_RAW_ALL,
                               *RACE_PRISON_RAW_COLS_TO_STANDARD.keys(),
                               *SEX_PRISON_RAW_COLS_TO_STANDARD.keys(),
                               *RACE_PRISON_RATE_COLS_TO_STANDARD.keys(),
                               *SEX_PRISON_RATE_COLS_TO_STANDARD.keys(),
                               ]]

        df_jail = df_jail[[*GEO_COLS_TO_STANDARD.keys(),
                           JAIL_RAW_ALL,
                           *AGE_JAIL_RAW_COLS_TO_STANDARD.keys(),
                           *RACE_JAIL_RAW_COLS_TO_STANDARD.keys(),
                           *SEX_JAIL_RAW_COLS_TO_STANDARD.keys(),
                           *RACE_JAIL_RATE_COLS_TO_STANDARD.keys(),
                           *SEX_JAIL_RATE_COLS_TO_STANDARD.keys(),
                           ]]

        # print(df_jail)
        # print(df_prison)

        # re-combine into single, unmelted df
        df = pd.merge(df_jail, df_prison, how='left',
                      on=list(GEO_COLS_TO_STANDARD.keys()))

        # rename columns as expected
        df = df.rename(columns=GEO_COLS_TO_STANDARD)

        # create df subset of columns for each
        # calculate unknown is TOTAL - (sum of known)
        # melt columns into our geo/demo per row format
        # generate pct_share_with_unknowns
        # keep existing pop/rate fields or recalculate with ACS 5yr?

        column_types = {c: 'STRING' for c in df.columns}
        # column_types[std_col.VACCINATED_FIRST_DOSE] = 'FLOAT'

        for breakdown in [std_col.RACE_OR_HISPANIC_COL,
                          std_col.AGE_COL,
                          std_col.SEX_COL]:

            print(breakdown)
            df = self.generate_for_bq(df, breakdown)

            if std_col.RACE_INCLUDES_HISPANIC_COL in df.columns:
                column_types[std_col.RACE_INCLUDES_HISPANIC_COL] = 'BOOL'

            gcs_to_bq_util.add_df_to_bq(
                df, dataset, breakdown, column_types=column_types)

    def generate_for_bq(self, df, breakdown):

        if breakdown == std_col.RACE_OR_HISPANIC_COL:

            df_jail_raw = df[[*GEO_COLS_TO_STANDARD.values(), JAIL_RAW_ALL, *RACE_JAIL_RAW_COLS_TO_STANDARD.keys(),
                              ]]
            df_jail_raw = df_jail_raw.rename(
                columns={**RACE_JAIL_RAW_COLS_TO_STANDARD,
                         JAIL_RAW_ALL: Race.ALL.value,
                         **RACE_PRISON_RAW_COLS_TO_STANDARD})

            df_jail_raw[Race.UNKNOWN.value] = "need to calc"

            print(df_jail_raw)

            std_col.add_race_columns_from_category_id(df)

        return df
