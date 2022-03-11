import pandas as pd

from ingestion.standardized_columns import Race
import ingestion.standardized_columns as std_col

from datasources.data_source import DataSource
from ingestion import gcs_to_bq_util

CAWP_RACE_GROUPS = [
    'Asian American/Pacific Islander',
    'Black',
    'Latina',
    'Middle Eastern/North African',
    'Multiracial Alone',
    'Native American/Alaska Native/Native Hawaiian'
    'White',
    'All',  # we CANNOT sum the above races for a total, as some have identified with multiple races and are counted multiple times
]

RACE_GROUPS_TO_STANDARD = {
    'Asian American/Pacific Islander': Race.ASIAN_PAC_NH.value,
    'Latina': Race.HISP.value,
    'Middle Eastern/North African': Race.MENA_NH.value,
    # TODO differentiate between those who spec. choose "Multiracial" vs those who identify as multiple specific races
    'Multiracial Alone': Race.MULTI_NH.value,
    'Native American/Alaska Native/Native Hawaiian': Race.AIANNH_NH.value,
    'Black': Race.BLACK_NH.value,
    'White': Race.WHITE_NH.value,
    'All': Race.ALL.value,
}

# TABLE FOR STATE-LEVEL CONGRESSES
# table includes States/Territories as rows; rank, w senate, total senate, w house, total house, w house+senate / total house+senate, %overall
BASE_CAWP_URL = "https://cawp.rutgers.edu/tablefield/export/paragraph/1028/field_table/und/0"
# table includes full breakdown of women by race, but doesn't include TOTAL legislature numbers
#  id,year,first_name,middle_name,last_name,party,level,position,state,district,race_ethnicity
# https://cawpdata.rutgers.edu/women-elected-officials/race-ethnicity/export-roles/csv?current=1&yearend_filter=All&level%5B0%5D=Federal%20Congress&level%5B1%5D=State%20Legislative&level%5B2%5D=Territorial/DC%20Legislative&items_per_page=50&page&_format=csv


class CAWPData(DataSource):

    @staticmethod
    def get_id():
        return 'CAWP_DATA'

    @staticmethod
    def get_table_name():
        return 'CAWP_data'

    def upload_to_gcs(self, _, **attrs):
        raise NotImplementedError(
            'upload_to_gcs should not be called for CAWPData')

    def write_to_bq(self, dataset, gcs_bucket, **attrs):
        print("writing to bq")

    def generate_breakdown(self, breakdown, df):
        print("generating breakdown")
