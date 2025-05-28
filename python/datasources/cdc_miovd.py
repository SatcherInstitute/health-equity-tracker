import pandas as pd

from datasources.data_source import DataSource
from ingestion import gcs_to_bq_util
from ingestion.cdc_wonder_utils import TMP_ALL
from ingestion.het_types import GEO_TYPE


class CdcMIOVD(DataSource):
    @staticmethod
    def get_id():
        return "CDC_MIOVD_DATA"

    @staticmethod
    def get_table_name():
        return "cdc_miovd_data"

    def upload_to_gcs(self, gcs_bucket, **attrs):
        raise NotImplementedError("upload_to_gcs should not be called for CdcWonderData")

    def write_to_bq(self, dataset, gcs_bucket, **attrs):
        demo_type = self.get_attr(attrs, "demographic")
        geo_level = self.get_attr(attrs, "geographic")

        df = self.generate_breakdown_df(demo_type, geo_level)

        return df

    def generate_breakdown_df(self, demo_breakdown, geo_level: GEO_TYPE):
        alls_df = fetch_and_build_dataframe(geo_level, demo_breakdown)

        return alls_df


def fetch_and_build_dataframe(geo_level: GEO_TYPE, demographic_type: TMP_ALL) -> pd.DataFrame:
    file_name = f"gun_homicides-{geo_level}-{demographic_type}.csv"
    df = gcs_to_bq_util.load_csv_as_df_from_data_dir("cdc_miovd", file_name, na_values="")

    return df
