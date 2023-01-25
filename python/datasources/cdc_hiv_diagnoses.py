from datasources.data_source import DataSource
from ingestion import gcs_to_bq_util
import ingestion.standardized_columns as std_col


class CDCHIVDiagnosesData(DataSource):

    @ staticmethod
    def get_id():
        return 'CDC_HIV_DIAGNOSES_DATA'

    @ staticmethod
    def get_table_name():
        return 'cdc_hiv_diagnoses_data'

    def upload_to_gcs(self, gcs_bucket, **attrs):
        raise NotImplementedError(
            'upload_to_gcs should not be called for CDCHIVDiagnosesData'
        )

    def write_to_bq(self, dataset, gcs_bucket, **attrs):
        """
        Main function for this data source that fetches external data and runs
        needed cleaning and standardization, and then writes needed tables to
        BigQuery

        """

        all_df = gcs_to_bq_util.load_csv_as_df_from_data_dir(
            'cdc_hiv_diagnoses', 'state', '_alls_state_2019.csv')

        gcs_to_bq_util.add_df_to_bq(all_df, dataset, 'sex_state')
