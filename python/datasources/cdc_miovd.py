"""
This documentation outlines the procedure for querying the homicide and suicide reports
from the MIOVD datasouce.

Instructions for generating homicide and suide reports:

Homicide Data - Use this link to generate the query:

If the Links Don't Work - Navigate manually to:
   - "https://data.cdc.gov/Injury-Violence/Mapping-Injury-Overdose-and-Violence-County/psx4-wq38/about_data"
   - Click "Data" > "Actions" (right-side panel) > "Query Data"
   - Use the following column settings:

     | Order | Column Name    |
     |-------|----------------|
     | 1     | Period         |
     | 2     | ST_NAME        |
     | 3     | NAME           |
     | -     | Intent         |
     | -     | Count          |
     | -     | Rate           |
     | -     | GEOID          |
     | -     | ST_GEOID       |
     | -     | TTM_Date_Range |

   - Finally, filter the dataset by intent to either "FA_Homicide" or "FA_Suicide."

Last Updated: 6/2/2025
"""

import pandas as pd

from datasources.data_source import DataSource
from ingestion import dataset_utils, gcs_to_bq_util, merge_utils
from ingestion import standardized_columns as std_col
from ingestion.constants import CURRENT, HISTORICAL


class CDCMIOVDData(DataSource):
    # MIOVD constants
    CONDITIONS = ["gun_violence_homicide", "gun_violence_suicide"]
    DIRECTORY = "cdc_miovd"

    FILE_NAME_MAP = {
        "gun_violence_homicide": "gun_homicides-county-all.csv",
        "gun_violence_suicide": "gun_suicides-county-all.csv",
    }

    # CSV parsing constants
    CSV_COLS_TO_USE = {"Period", "ST_NAME", "NAME", "Count", "Rate", "TTM_Date_Range", "GEOID"}
    DTYPE = {"Period": str, "GEOID": str}
    NA_VALUES = ["1-9", "-999.0"]

    # MIOVD column names to HET standardized column names
    CSV_TO_STANDARD_COLS = {
        "Period": std_col.TIME_PERIOD_COL,
        "NAME": std_col.COUNTY_NAME_COL,
        "ST_NAME": std_col.STATE_NAME_COL,
        "GEOID": std_col.COUNTY_FIPS_COL,
    }

    # Columns to merge the homicide and suicide dataframes
    MERGE_COLS = [std_col.TIME_PERIOD_COL, std_col.COUNTY_NAME_COL, std_col.STATE_NAME_COL, std_col.COUNTY_FIPS_COL]

    @staticmethod
    def get_id():
        return "CDC_MIOVD_DATA"

    @staticmethod
    def get_table_name():
        return "cdc_miovd_data"

    def upload_to_gcs(self, gcs_bucket, **attrs):
        raise NotImplementedError("upload_to_gcs should not be called for CDCMIOVD")

    def write_to_bq(self, dataset, gcs_bucket, **attrs):
        demo_type = self.get_attr(attrs, "demographic")
        geo_level = self.get_attr(attrs, "geographic")
        homicides_df = self.load_condition_data("gun_violence_homicide")
        suicides_df = self.load_condition_data("gun_violence_suicide")

        df = merge_utils.merge_dfs_list([homicides_df, suicides_df], self.MERGE_COLS)
        df = merge_utils.merge_state_ids(df)
        df = merge_utils.merge_county_names(df)

        for time_view in (CURRENT, HISTORICAL):
            df_for_bq = df.copy()
            df_for_bq, col_types = dataset_utils.get_timeview_df_and_cols(df_for_bq, time_view, self.CONDITIONS)

            df_for_bq = self._reorder_and_sort_dataframe(df_for_bq)

            table_id = gcs_to_bq_util.make_bq_table_id(demo_type, geo_level, time_view)
            gcs_to_bq_util.add_df_to_bq(df_for_bq, dataset, table_id, column_types=col_types)

    def load_condition_data(self, condition: str) -> pd.DataFrame:
        file_name = self.FILE_NAME_MAP[condition]
        csv_to_standard_cols = self.CSV_TO_STANDARD_COLS.copy()
        csv_to_standard_cols["Rate"] = f"{condition}_{std_col.PER_100K_SUFFIX}"
        csv_to_standard_cols["Count"] = f"{condition}_{std_col.RAW_SUFFIX}"

        df = gcs_to_bq_util.load_csv_as_df_from_data_dir(
            self.DIRECTORY, file_name, dtype=self.DTYPE, na_values=self.NA_VALUES, usecols=self.CSV_COLS_TO_USE
        )

        df = df.rename(columns=csv_to_standard_cols)

        # Handle trailing twelve months (TTM) periods
        # Extract year from TTM_Date_Range: "January, 2024 to December, 2024" -> "2024"
        ttm_mask = df[std_col.TIME_PERIOD_COL] == "TTM"
        df.loc[ttm_mask, std_col.TIME_PERIOD_COL] = df.loc[ttm_mask, "TTM_Date_Range"].str.extract(
            r"to .+?(\d{4})", expand=False
        )

        df = df.drop(columns=["TTM_Date_Range"], errors="ignore")

        return df

    def _reorder_and_sort_dataframe(self, df: pd.DataFrame) -> pd.DataFrame:
        """Reorder columns and sort data."""
        column_order = [
            std_col.TIME_PERIOD_COL,
            std_col.COUNTY_FIPS_COL,
            std_col.STATE_FIPS_COL,
            std_col.STATE_NAME_COL,
            std_col.COUNTY_NAME_COL,
            std_col.GUN_VIOLENCE_HOMICIDE_RAW,
            std_col.GUN_VIOLENCE_HOMICIDE_PER_100K,
            std_col.GUN_VIOLENCE_SUICIDE_RAW,
            std_col.GUN_VIOLENCE_SUICIDE_PER_100K,
        ]

        df = df[[col for col in column_order if col in df.columns]]

        # Sort: if time_period exists, include it first in sort
        sort_columns = []
        if std_col.TIME_PERIOD_COL in df.columns:
            sort_columns.append(std_col.TIME_PERIOD_COL)
        sort_columns.extend([std_col.COUNTY_FIPS_COL, std_col.STATE_FIPS_COL])

        return df.sort_values(sort_columns, ascending=True)
