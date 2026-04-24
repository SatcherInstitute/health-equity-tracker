"""
Loads cervical cancer incidence data by county and race from NCI source files.
Data covers 2018-2022, age-adjusted rates per 100,000, females only.

https://statecancerprofiles.cancer.gov/incidencerates/index.php?statefips=00&areatype=county&cancer=057&race=00&age=001&stage=999&ruralurban=0&type=incd&sortVariableName=rate&sortOrder=default&output=0#results

https://statecancerprofiles.cancer.gov/incidencerates/index.php?statefips=00&areatype=county&cancer=057&race=07&age=001&stage=999&ruralurban=0&type=incd&sortVariableName=rate&sortOrder=default&output=0#results

https://statecancerprofiles.cancer.gov/incidencerates/index.php?statefips=00&areatype=county&cancer=057&race=28&age=001&stage=999&ruralurban=0&type=incd&sortVariableName=rate&sortOrder=default&output=0#results

https://statecancerprofiles.cancer.gov/incidencerates/index.php?statefips=00&areatype=county&cancer=057&race=38&age=001&stage=999&ruralurban=0&type=incd&sortVariableName=rate&sortOrder=default&output=0#results

https://statecancerprofiles.cancer.gov/incidencerates/index.php?statefips=00&areatype=county&cancer=057&race=48&age=001&stage=999&ruralurban=0&type=incd&sortVariableName=rate&sortOrder=default&output=0#results

https://statecancerprofiles.cancer.gov/incidencerates/index.php?statefips=00&areatype=county&cancer=057&race=05&age=001&stage=999&ruralurban=0&type=incd&sortVariableName=rate&sortOrder=default&output=0#results

Source files manually saved in data/nci/ and are named by Race enum member name:
  cervical-ALL.csv      - All races (includes Hispanic)
  cervical-API_NH.csv   - Asian, Native Hawaiian, and Pacific Islander Non-Hispanic
  cervical-BLACK_NH.csv - Black Non-Hispanic
  cervical-HISP.csv     - Hispanic (any race)
  cervical-AIAN_NH.csv  - American Indian/Alaska Native Non-Hispanic
  cervical-WHITE_NH.csv - White Non-Hispanic

No time series dimension; only writes _current tables.
"""

import pandas as pd
import numpy as np
from datasources.data_source import DataSource
from ingestion import gcs_to_bq_util
from ingestion import standardized_columns as std_col
from ingestion.constants import CURRENT
from ingestion.dataset_utils import build_bq_col_types
from ingestion.merge_utils import merge_county_names, merge_state_ids
from ingestion.standardized_columns import Race


CONDITION = "cervical"

PER_100K_COL = f"{CONDITION}_{std_col.PER_100K_SUFFIX}"
RAW_COL = f"{CONDITION}_{std_col.RAW_SUFFIX}"
IS_SUPPRESSED_COL = f"{PER_100K_COL}_{std_col.IS_SUPPRESSED_SUFFIX}"

RACES = [
    Race.ALL,
    Race.API_NH,
    Race.BLACK_NH,
    Race.HISP,
    Race.AIAN_NH,
    Race.WHITE_NH,
]

# NCI CSV column name -> HET standardized column name
CSV_RENAME = {
    "FIPS": std_col.COUNTY_FIPS_COL,
    "Age-Adjusted Incidence Rate([rate note]) - cases per 100,000": PER_100K_COL,
    "Average Annual Count": RAW_COL,
}

SUPPRESSED_VALUE = "*"


class NciCancerData(DataSource):
    DIRECTORY = "nci_cancer"

    @staticmethod
    def get_id():
        return "NCI_CANCER"

    @staticmethod
    def get_table_name():
        return "nci_cancer"

    def upload_to_gcs(self, gcs_bucket, **attrs):
        raise NotImplementedError("upload_to_gcs should not be called for NciCancerData")

    def write_to_bq(self, dataset, gcs_bucket, **attrs):
        demo_type = self.get_attr(attrs, "demographic")
        geo_level = self.get_attr(attrs, "geographic")

        df = self.generate_breakdown_df()

        df_for_bq = df
        col_types = build_bq_col_types(df_for_bq)

        table_id = gcs_to_bq_util.make_bq_table_id(demo_type, geo_level, CURRENT)
        gcs_to_bq_util.add_df_to_bq(df_for_bq, dataset, table_id, column_types=col_types)

    def generate_breakdown_df(self) -> pd.DataFrame:
        """Loads and combines all race files into a single HET-style dataframe
        at county level with race_and_ethnicity breakdown."""

        frames = []
        for race_enum in RACES:
            file_name = f"cervical-{race_enum.name}.csv"
            df = self._load_nci_file(file_name)
            df[std_col.RACE_OR_HISPANIC_COL] = race_enum.race_and_ethnicity
            frames.append(df)

        df = pd.concat(frames, axis=0, ignore_index=True)

        # Pad FIPS to 5 digits (NCI stores as int-like strings without leading zeros)
        df[std_col.COUNTY_FIPS_COL] = df[std_col.COUNTY_FIPS_COL].str.zfill(5)

        # Drop row with US fake FIPS 00000
        df = df[df[std_col.COUNTY_FIPS_COL] != "00000"]

        # Drop rows with empty county FIPS
        df = df.dropna(subset=[std_col.COUNTY_FIPS_COL])

        # State FIPS is always the first two digits of the county FIPS.
        # merge_state_ids uses this to attach state_name and state_postal.
        df[std_col.STATE_FIPS_COL] = df[std_col.COUNTY_FIPS_COL].str.slice(0, 2)
        df = merge_state_ids(df)

        # Attach standardized county_name via county FIPS lookup.
        df = merge_county_names(df)

        df = df.sort_values(by=[std_col.COUNTY_FIPS_COL, std_col.RACE_OR_HISPANIC_COL]).reset_index(drop=True)

        return df

    def _load_nci_file(self, file_name: str) -> pd.DataFrame:
        """Reads a single NCI cervical CSV, skipping the 8 preamble lines
        before the column header (row 9), selecting relevant columns,
        handling suppression, and renaming to HET standard column names."""

        df = gcs_to_bq_util.load_csv_as_df_from_data_dir(
            self.DIRECTORY,
            file_name,
            skiprows=8,
            dtype=str,
        )

        # Normalize column names (strip whitespace)
        df.columns = df.columns.str.strip()

        # Keep only the columns we need; rename to HET standard names
        df = df[list(CSV_RENAME.keys())].rename(columns=CSV_RENAME)

        # Strip whitespace from all string values
        df = df.apply(lambda col: col.str.strip() if col.dtype == object else col)

        # Mark suppression on the rate column.
        # IS_SUPPRESSED is True when rate is "*", False when rate is null for
        # another reason, and null (NaN) when rate is present (not applicable).
        rate_suppressed = df[PER_100K_COL] == SUPPRESSED_VALUE
        rate_missing = df[PER_100K_COL].isna() | (df[PER_100K_COL] == "")

        df[IS_SUPPRESSED_COL] = np.nan
        df[IS_SUPPRESSED_COL] = df[IS_SUPPRESSED_COL].astype(object)
        df.loc[rate_suppressed, IS_SUPPRESSED_COL] = True
        df.loc[~rate_suppressed & rate_missing, IS_SUPPRESSED_COL] = False

        # Null out suppressed and non-numeric values
        df[PER_100K_COL] = pd.to_numeric(df[PER_100K_COL].replace(SUPPRESSED_VALUE, None), errors="coerce")
        df[RAW_COL] = pd.to_numeric(df[RAW_COL].replace(SUPPRESSED_VALUE, None), errors="coerce")

        return df
