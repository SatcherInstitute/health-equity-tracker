from datasources.data_source import DataSource
from ingestion.constants import NATIONAL_LEVEL, STATE_LEVEL, STATE_LEVEL_FIPS_LIST
import ingestion.standardized_columns as std_col
from ingestion import gcs_to_bq_util
import pandas as pd


class CAWPTimeData(DataSource):

    @ staticmethod
    def get_id():
        return 'CAWP_TIME_DATA'

    @ staticmethod
    def get_table_name():
        return 'cawp_time_data'

    def upload_to_gcs(self, _, **attrs):
        raise NotImplementedError(
            'upload_to_gcs should not be called for CAWPTimeData')

    def write_to_bq(self, dataset, gcs_bucket, **attrs):

        for geo_level in [STATE_LEVEL, NATIONAL_LEVEL]:
            time_periods = ["2021", "2022"]
            table_name = f'race_and_ethnicity_{geo_level}'

            # start with single column of all state-level fips
            df = pd.DataFrame(
                {
                    std_col.STATE_FIPS_COL: STATE_LEVEL_FIPS_LIST,
                })

            # add list of years and then explode
            df[std_col.TIME_PERIOD_COL] = [time_periods] * len(df)
            df = df.explode(std_col.TIME_PERIOD_COL).reset_index(drop=True)

            gcs_to_bq_util.add_df_to_bq(
                df, dataset, table_name)
