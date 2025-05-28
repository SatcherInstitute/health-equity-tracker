import pandas as pd

from datasources.data_source import DataSource
from ingestion import gcs_to_bq_util, merge_utils
from ingestion import standardized_columns as std_col
from ingestion.constants import CURRENT, HISTORICAL
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

        for time_view in (CURRENT, HISTORICAL):
            table_id = gcs_to_bq_util.make_bq_table_id(demo_type, geo_level, time_view)
            print(table_id)

        return df

    def generate_breakdown_df(self, demo_breakdown, geo_level: GEO_TYPE):
        # Load data for each condition and concatenate
        conditions = ["homicides", "suicides"]
        dataframes = []
        for condition in conditions:
            df = self.load_condition_data(geo_level, demo_breakdown, condition)
            dataframes.append(df)

        df = pd.concat(dataframes, axis=0, ignore_index=True)
        df = merge_utils.merge_state_ids(df)
        df = merge_utils.merge_county_names(df)

        return df

    def load_condition_data(self, geo_level: GEO_TYPE, demographic_type: str, condition: str) -> pd.DataFrame:
        file_name = f"gun_{condition}-{geo_level}-{demographic_type}.csv"
        cdc_miovd_dir = "cdc_miovd"
        d_type = {"Period": str, "GEOID": str}

        rename_columns = {
            "Period": std_col.TIME_PERIOD_COL,
            "NAME": std_col.COUNTY_NAME_COL,
            "ST_NAME": std_col.STATE_NAME_COL,
            "GEOID": std_col.COUNTY_FIPS_COL,
        }

        df = gcs_to_bq_util.load_csv_as_df_from_data_dir(cdc_miovd_dir, file_name, dtype=d_type, na_values="1-9")
        df = df.rename(columns=rename_columns)

        df["condition"] = condition

        return df
