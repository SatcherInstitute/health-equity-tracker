import pandas as pd

from datasources.data_source import DataSource
from ingestion import dataset_utils, gcs_to_bq_util, merge_utils
from ingestion import standardized_columns as std_col
from ingestion.constants import CURRENT, HISTORICAL


class CdcMIOVD(DataSource):
    # Constants
    CONDITIONS = ["homicides", "suicides"]
    DIRECTORY = "cdc_miovd"
    NA_VALUES = "1-9"

    # Filename map
    CONDITION_TO_FILE_MAP = {"homicides": "gun_homicides-county-all.csv", "suicides": "gun_suicides-county-all.csv"}

    # CSV parsing config
    CSV_COLS_TO_USE = {"Period", "ST_NAME", "NAME", "Count", "Rate", "TTM_Date_Range", "GEOID"}
    DTYPE = {"Period": str, "GEOID": str}
    USE_COLS = {"Period", "ST_NAME", "NAME", "Count", "Rate", "TTM_Date_Range", "GEOID"}

    # Column standardization
    CSV_TO_STANDARD_COLS = {
        "Period": std_col.TIME_PERIOD_COL,
        "NAME": std_col.COUNTY_NAME_COL,
        "ST_NAME": std_col.STATE_NAME_COL,
        "GEOID": std_col.COUNTY_FIPS_COL,
    }

    # Columns for merging
    MERGE_KEYS = [std_col.TIME_PERIOD_COL, std_col.COUNTY_NAME_COL, std_col.STATE_NAME_COL, std_col.COUNTY_FIPS_COL]

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

        homicides_df = self.load_condition_data("homicides")
        suicides_df = self.load_condition_data("suicides")

        merged_df = pd.merge(homicides_df, suicides_df, on=self.MERGE_KEYS, how="outer")

        df = merge_utils.merge_state_ids(merged_df)
        df = merge_utils.merge_county_names(df)

        for time_view in (CURRENT, HISTORICAL):
            table_id = gcs_to_bq_util.make_bq_table_id(demo_type, geo_level, time_view)

            if time_view == CURRENT:
                most_recent_year = df[std_col.TIME_PERIOD_COL].max()
                df_for_bq = df[df[std_col.TIME_PERIOD_COL] == most_recent_year].copy()
            else:
                df_for_bq = df.copy()

            df_for_bq, col_types = dataset_utils.get_timeview_df_and_cols(df_for_bq, time_view, self.CONDITIONS)

            df_for_bq.to_csv(f"testing_{df_for_bq}.csv", index=False)
            gcs_to_bq_util.add_df_to_bq(df_for_bq, dataset, table_id, column_types=col_types)

        return df_for_bq

    def load_condition_data(self, condition: str) -> pd.DataFrame:
        file_name = self.CONDITION_TO_FILE_MAP[condition]

        df = gcs_to_bq_util.load_csv_as_df_from_data_dir(
            self.DIRECTORY, file_name, dtype=self.DTYPE, na_values=self.NA_VALUES, usecols=self.USE_COLS
        )

        csv_to_standard_columns = self.CSV_TO_STANDARD_COLS.copy()
        csv_to_standard_columns["Rate"] = f"{condition}_{std_col.PER_100K_SUFFIX}"
        csv_to_standard_columns["Count"] = f"{condition}_{std_col.RAW_SUFFIX}"
        df = df.rename(columns=csv_to_standard_columns)

        # Handle TTM time periods (now the column is properly named)
        ttm_mask = df[std_col.TIME_PERIOD_COL] == "TTM"
        if ttm_mask.any():
            df.loc[ttm_mask, std_col.TIME_PERIOD_COL] = df.loc[ttm_mask, "TTM_Date_Range"].str.extract(
                r"to .+?(\d{4})", expand=False
            )

        df = df.drop(columns=["TTM_Date_Range"], errors="ignore")
        df.to_csv(f"{condition}_testing.csv", index=False)

        return df
