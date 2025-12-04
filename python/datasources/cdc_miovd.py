"""
This documentation outlines the procedure for querying the homicide and suicide reports
from the CDC MIOVD datasource.

Manual Query Steps:
1. Open your web browser and navigate to the CDC data portal:
    - (https://data.cdc.gov/Injury-Violence/Mapping-Injury-Overdose-and-Violence-County/psx4-wq38/data_preview).
2. Select "Actions" and choose "Query Data."
4. Filter the dataset by intent to display either "FA_Homicide" for homicide reports
   or "FA_Suicide" for suicide reports.

Note: If the provided link does not work, please refer to the URL in the comment section below.

URL for manual access:
https://data.cdc.gov/Injury-Violence/Mapping-Injury-Overdose-and-Violence-County/psx4-wq38/about_data

Last Updated: 6/3/2025
"""

import pandas as pd
import numpy as np
from datasources.data_source import DataSource
from ingestion import dataset_utils, gcs_to_bq_util, merge_utils
from ingestion import standardized_columns as std_col
from ingestion.constants import CURRENT, HISTORICAL
from typing import Dict


class CDCMIOVDData(DataSource):
    # File loading constants
    CONDITIONS = [std_col.GUN_VIOLENCE_HOMICIDE_PREFIX, std_col.GUN_VIOLENCE_SUICIDE_PREFIX]
    DIRECTORY = "cdc_miovd"

    FILE_NAME_MAP: Dict[str, str] = {
        std_col.GUN_VIOLENCE_HOMICIDE_PREFIX: "gun_homicides-county-all.csv",
        std_col.GUN_VIOLENCE_SUICIDE_PREFIX: "gun_suicides-county-all.csv",
    }

    # CSV parsing constants
    CSV_COLS_TO_USE = {"Period", "ST_NAME", "NAME", "Count", "Rate", "TTM_Date_Range", "GEOID"}
    DTYPE = {"Period": str, "GEOID": str}
    NA_VALUES = ["-999.0"]

    # MIOVD column names to HET standardized column names
    CSV_TO_STANDARD_COLS = {
        "Period": std_col.TIME_PERIOD_COL,
        "NAME": std_col.COUNTY_NAME_COL,
        "ST_NAME": std_col.STATE_NAME_COL,
        "GEOID": std_col.COUNTY_FIPS_COL,
    }

    # Columns to merge the homicide and suicide dataframes
    MERGE_COLS = [
        std_col.TIME_PERIOD_COL,
        std_col.COUNTY_NAME_COL,
        std_col.STATE_NAME_COL,
        std_col.COUNTY_FIPS_COL,
        "is_ttm",
    ]

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

        # Load data homicides and suicides
        homicides_df = self.load_condition_data(std_col.GUN_VIOLENCE_HOMICIDE_PREFIX)
        suicides_df = self.load_condition_data(std_col.GUN_VIOLENCE_SUICIDE_PREFIX)

        # Merge utils
        df = merge_utils.merge_dfs_list([homicides_df, suicides_df], self.MERGE_COLS)
        df = merge_utils.merge_state_ids(df)
        df = merge_utils.merge_county_names(df)

        # Split into annual and TTM dataframes using the is_ttm flag
        annual_df = df[~df["is_ttm"]].copy().drop(columns=["is_ttm"])  # Only non-TTM rows
        ttm_df = df[df["is_ttm"]].copy().drop(columns=["is_ttm"])  # Only TTM rows

        for time_view, df_for_bq in [(CURRENT, ttm_df), (HISTORICAL, annual_df)]:
            df_for_bq, col_types = dataset_utils.get_timeview_df_and_cols(df_for_bq, time_view, self.CONDITIONS)

            if time_view == CURRENT:
                for col in df_for_bq.columns:
                    if std_col.RAW_SUFFIX in col:
                        df_for_bq[col] = pd.to_numeric(df_for_bq[col], errors="coerce")

            df_for_bq = self._reorder_and_sort_dataframe(df_for_bq)

            table_id = gcs_to_bq_util.make_bq_table_id(demo_type, geo_level, time_view)
            print(table_id)
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

        # Handle suppressed data detection and conversion
        raw_col = f"{condition}_{std_col.RAW_SUFFIX}"
        rate_col = f"{condition}_{std_col.PER_100K_SUFFIX}"
        suppressed_col = f"{rate_col}_{std_col.IS_SUPPRESSED_SUFFIX}"

        suppressed_values = ["1-9", "10-50"]

        # Check if count is suppressed AND rate is null
        count_suppressed = df[raw_col].astype(str).isin(suppressed_values)
        rate_is_null = df[rate_col].isna()

        # IS_SUPPRESSED column: SUPPRESSED (TRUE), MISSING/UNCOLLECTED (FALSE)
        # if rate is non-null, then the IS_SUPPRESSED column doesn't apply and value is null
        # treat as string column type to allow np.nan which is used in the rest of the codebase
        df[suppressed_col] = np.nan
        df[suppressed_col] = df[suppressed_col].astype(object)
        df.loc[count_suppressed & rate_is_null, suppressed_col] = True
        df.loc[~count_suppressed & rate_is_null, suppressed_col] = False

        # Replace suppressed values with NA in both columns
        df[[raw_col, rate_col]] = df[[raw_col, rate_col]].replace(suppressed_values, np.nan)

        # Add the ttm_flag to dataframe
        df["is_ttm"] = df[std_col.TIME_PERIOD_COL] == "TTM"

        df = df.drop(columns=["TTM_Date_Range"], errors="ignore")

        return df

    def _reorder_and_sort_dataframe(self, df: pd.DataFrame) -> pd.DataFrame:
        """Reorder columns and sort data."""
        priority_columns = [
            std_col.TIME_PERIOD_COL,
            std_col.COUNTY_FIPS_COL,
            std_col.STATE_FIPS_COL,
            std_col.STATE_NAME_COL,
            std_col.COUNTY_NAME_COL,
        ]

        # Get priority columns that exist in the dataframe
        ordered_cols = [col for col in priority_columns if col in df.columns]

        # Add remaining columns in their current order
        remaining_cols = [col for col in df.columns if col not in priority_columns]
        ordered_cols.extend(remaining_cols)

        df = df[ordered_cols]

        # Sort: start with county and state FIPS, add time period if it exists
        sort_columns = [std_col.COUNTY_FIPS_COL, std_col.STATE_FIPS_COL]
        if std_col.TIME_PERIOD_COL in df.columns:
            sort_columns.insert(0, std_col.TIME_PERIOD_COL)

        return df.sort_values(sort_columns, ascending=True)
