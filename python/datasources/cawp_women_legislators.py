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
        df = gcs_to_bq_util.load_csv_as_dataframe_from_web(BASE_CAWP_URL)

        #  breakdown_df = self.generate_breakdown("race_and_ethnicity", df)
        #   column_types = {c: 'STRING' for c in breakdown_df.columns}

        #    for col in CAWP_DETERMINANTS.values():
        #         column_types[col] = 'FLOAT'

        #     if std_col.RACE_INCLUDES_HISPANIC_COL in breakdown_df.columns:
        #         column_types[std_col.RACE_INCLUDES_HISPANIC_COL] = 'BOOL'

        #     gcs_to_bq_util.add_dataframe_to_bq(
        #         breakdown_df, dataset, breakdown, column_types=column_types)

    def generate_breakdown(self, breakdown, df):
        output = []
        states = df['State Name'].drop_duplicates().to_list()

        columns = [std_col.STATE_NAME_COL,
                   *CAWP_DETERMINANTS.values()]
        if breakdown == std_col.RACE_OR_HISPANIC_COL:
            columns.append(std_col.RACE_CATEGORY_ID_COL)
        else:
            columns.append(breakdown)

        for state in states:

            output.append(output_row)

        output_df = pd.DataFrame(output, columns=columns)

        return output_df
