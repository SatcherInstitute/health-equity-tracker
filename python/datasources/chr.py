from datasources.data_source import DataSource
from ingestion import gcs_to_bq_util, standardized_columns as std_col


class CHRData(DataSource):
    @staticmethod
    def get_id():
        return "CHR_DATA"

    @staticmethod
    def get_table_name():
        return "chr_data"

    def upload_to_gcs(self, gcs_bucket, **attrs):
        raise NotImplementedError("upload_to_gcs should not be called for CHRData")

    def write_to_bq(self, dataset, gcs_bucket, **attrs):
        demographic = self.get_attr(attrs, "demographic")
        geo_level = self.get_attr(attrs, "geographic")
        if demographic == std_col.RACE_COL:
            demographic = std_col.RACE_OR_HISPANIC_COL

        df = gcs_to_bq_util.load_csv_as_df_from_data_dir(
            'chr',
            "analytic_data2024.csv",
        )

        table_name = f"{demographic}_{geo_level}"

        print(table_name)
        print(df)

        # gcs_to_bq_util.add_df_to_bq(df_for_bq, dataset, table_name, column_types=col_types)
