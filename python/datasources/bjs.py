from datasources.data_source import DataSource
from ingestion import gcs_to_bq_util
import ingestion.standardized_columns as std_col
import re
from ingestion.standardized_columns import Race


BJS_PRISON_BY_RACE_STATE_NATIONAL = "p20stat02.csv"

BJS_RACE_GROUPS_TO_STANDARD = {
    'White': Race.WHITE_NH.value,
    'Black': Race.BLACK_NH.value,
    'Hispanic': Race.HISP.value,
    'American Indian/Alaska Native': Race.AIAN_NH,
    'Asian': Race.ASIAN_NH.value,
    'Native Hawaiian/Other Pacific Islander': Race.NHPI_NH,
    'Two or more races': Race.MULTI.value,
    'Other': Race.OTHER_STANDARD_NH,
    'Unknown': Race.UNKNOWN.value,
    # for now summing 'Unknown' and 'Did not report' into "Unknown"
    # but need to confirm
    # 'Did not report': Race.UNKNOWN.value,
    'All': Race.ALL.value
}


def strip_footnote_refs(cell_value):
    """
    BJS embeds the footnote indicators into the cell values
    This fn uses regex if input is a string to remove those
    footnote indicators, and returns the cleaned string or original
    non-string cell_value
     """
    return re.sub(r'/[a-z].*', "", cell_value) if isinstance(cell_value, str) else cell_value


def drop_unnamed(df):
    """
    Because of the styling on the BJS .csv, some columns end up without names.
    This fn removes those columns and returns the updated df
     """
    df = df.drop(df.filter(regex="Unnamed"), axis=1)
    return df


def missing_data_to_none(df):
    """
    Clean up a dataframe with by replacing all missing values with None.
    BJS uses two kinds of missing data:
    `~` N/A. Jurisdiction does not track this race or ethnicity.
    `/` Not reported.

    Parameters:
            df (Pandas Dataframe): a dataframe with some missing values set to `~` or `/`

    Returns:
            df (Pandas Dataframe): a dataframe with all missing values set to `None`
    """

    df = df.applymap(lambda datum: None if datum ==
                     "/" or datum == "~" else datum)

    return df


class BJSData(DataSource):

    @staticmethod
    def get_id():
        return 'BJS_DATA'

    @staticmethod
    def get_table_name():
        return 'bjs_data'

    def upload_to_gcs(self, _, **attrs):
        raise NotImplementedError(
            'upload_to_gcs should not be called for BJSData')

    def write_to_bq(self, dataset, gcs_bucket, **attrs):

        # set column types for BigQuery
        column_types = {}
        column_types[std_col.STATE_NAME_COL] = 'STRING'
        column_types[std_col.PRISON_PER_100K] = 'DECIMAL'
        column_types[std_col.PRISON_PCT_SHARE] = 'DECIMAL'
        column_types[std_col.JAIL_PCT_SHARE] = 'DECIMAL'
        column_types[std_col.JAIL_PER_100K] = 'DECIMAL'
        column_types[std_col.INCARCERATED_PCT_SHARE] = 'DECIMAL'
        column_types[std_col.INCARCERATED_PER_100K] = 'DECIMAL'

        column_types[std_col.RACE_CATEGORY_ID_COL] = 'STRING'
        column_types[std_col.STATE_FIPS_COL] = 'STRING'
        column_types[std_col.POPULATION_PCT_COL] = 'DECIMAL'
        column_types[std_col.RACE_COL] = "STRING"
        column_types[std_col.RACE_INCLUDES_HISPANIC_COL] = 'BOOL'
        column_types[std_col.RACE_OR_HISPANIC_COL] = "STRING"

        for geo_level in ["national", "state", "county"]:
            print(geo_level, "in write_to_bq()")

        breakdown_df = gcs_to_bq_util.load_csv_as_df_from_web(
            BJS_PRISON_BY_RACE_STATE_NATIONAL)

        table_name = f'race_and_ethnicity_{geo_level}'

        gcs_to_bq_util.add_df_to_bq(
            breakdown_df, dataset, table_name, column_types=column_types)
