import pandas as pd

from ingestion.standardized_columns import Race
import ingestion.standardized_columns as std_col

from datasources.data_source import DataSource
from ingestion import gcs_to_bq_util

CAWP_RACE_GROUPS_TO_STANDARD = {
    'Asian American/Pacific Islander': Race.ASIAN_PAC_NH.value,
    'Latina': Race.HISP_F.value,
    'Middle Eastern/North African': Race.MENA_NH.value,
    # TODO differentiate between those who spec. choose "Multiracial" vs those who identify as multiple specific races
    'Multiracial Alone': Race.MULTI_NH.value,
    'Native American/Alaska Native/Native Hawaiian': Race.AIANNH_NH.value,
    'Black': Race.BLACK_NH.value,
    'White': Race.WHITE_NH.value,
    'All': Race.ALL.value,
}

# 2 TABLES FOR STATE-LEVEL CONGRESSES

# table includes States/Territories as rows; rank, w senate, total senate, w house, total house, w house+senate / total house+senate, %overall
CAWP_TOTALS_URL = "https://cawp.rutgers.edu/tablefield/export/paragraph/1028/field_table/und/0"
# table includes full breakdown of women by race, but doesn't include

# TOTAL legislature numbers
#  id,year,first_name,middle_name,last_name,party,level,position,state,district,race_ethnicity
CAWP_LINE_ITEMS_URL = "https://cawpdata.rutgers.edu/women-elected-officials/race-ethnicity/export-roles/csv?current=1&yearend_filter=All&level%5B0%5D=Federal%20Congress&level%5B1%5D=State%20Legislative&level%5B2%5D=Territorial/DC%20Legislative&items_per_page=50&page&_format=csv"


class CAWPData(DataSource):

    @staticmethod
    def get_id():
        return 'CAWP_DATA'

    @staticmethod
    def get_table_name():
        return 'cawp_data'

    def upload_to_gcs(self, _, **attrs):
        raise NotImplementedError(
            'upload_to_gcs should not be called for CAWPData')

    def write_to_bq(self, dataset, gcs_bucket, **attrs):

        # load in table with % of women legislators for /state
        df_totals = gcs_to_bq_util.load_csv_as_dataframe_from_web(
            CAWP_TOTALS_URL)

        # read second table that contains LINE ITEM with women leg by race / level / state
        df_line_items = gcs_to_bq_util.load_csv_as_dataframe_from_web(
            CAWP_LINE_ITEMS_URL)

        # make table by race
        breakdown_df = self.generate_breakdown(
            std_col.RACE_OR_HISPANIC_COL, df_totals, df_line_items)

        # set column types
        column_types = {c: 'STRING' for c in breakdown_df.columns}
        column_types[std_col.WOMEN_STATE_LEG_PCT] = 'FLOAT'
        column_types[std_col.RACE_INCLUDES_HISPANIC_COL] = 'BOOL'

        gcs_to_bq_util.add_dataframe_to_bq(
            breakdown_df, dataset, std_col.RACE_OR_HISPANIC_COL, column_types=column_types)

    def generate_breakdown(self, breakdown, df_totals, df_line_items):

        # for LINE ITEM CSV
        # split 'state' into a map of 'statename' : 'state 2 letter code'
        state_code_map = {}
        for state in df_line_items['state']:
            state_terms = state.split(" - ")
            state_code_map[state_terms[1]] = state_terms[0]

        # for TOTALS CSV cleanup state codes
        total_state_codes = df_totals['State'].drop_duplicates().to_list()
        total_state_codes = [state.replace("<i>", "").replace(
            "</i>", "").replace("*", "") for state in total_state_codes]

        output = []

        # set column names
        columns = [std_col.STATE_NAME_COL, std_col.WOMEN_STATE_LEG_PCT]
        columns.append(std_col.RACE_CATEGORY_ID_COL)

        for state_code in total_state_codes:

            for race in CAWP_RACE_GROUPS_TO_STANDARD.keys():

                output_row = {}
                output_row[std_col.STATE_NAME_COL] = state_code_map[state_code]
                output_row[std_col.RACE_CATEGORY_ID_COL] = CAWP_RACE_GROUPS_TO_STANDARD[race]

                # grab TOTAL pct from TOTAL csv file
                # out

                output.append(output_row)

        output_df = pd.DataFrame(output, columns=columns)

        std_col.add_race_columns_from_category_id(output_df)

        return output_df
