import pandas as pd

from datasources.data_source import DataSource
from ingestion import gcs_to_bq_util
import ingestion.standardized_columns as col_std


class CtpMetadata(DataSource):
    @staticmethod
    def get_id():
        return "COVID_TRACKING_PROJECT_METADATA"

    @staticmethod
    def get_table_name():
        return "covid_tracking_project_metadata"

    def upload_to_gcs(self, _, **attrs):
        raise NotImplementedError(
            "upload_to_gcs should not be called for CtpMetadata")

    def write_to_bq(self, dataset, gcs_bucket, **attrs):
        gcs_file = self.get_attr(attrs, "filename")

        # Download the raw data
        df = gcs_to_bq_util.load_csv_as_df(gcs_bucket, gcs_file)
        df = self.standardize(df)
        # Write to BQ
        gcs_to_bq_util.add_df_to_bq(df, dataset, self.get_table_name())

    def standardize(self, df: pd.DataFrame) -> pd.DataFrame:
        """Reformats the metadata into the standard format."""
        self.clean_frame_column_names(df)

        # Standardize the data
        # The metadata currently only has information for cases and deaths,
        # not tests or hospitalizations.
        keep_cols = [
            "state_postal_abbreviation",
            "api_death",
            "race_ethnicity_separately_death",
            "race_ethnicity_combined_death",
            "race_mutually_exclusive_death",
            "combined_category_other_than_api_death",
            "race_death",
            "ethnicity_death",
            "api_cases",
            "race_ethnicity_separately_cases",
            "race_ethnicity_combined_cases",
            "race_mutually_exclusive_cases",
            "combined_category_other_than_api_cases",
            "race_cases",
            "ethnicity_cases",
        ]
        df = df[keep_cols]
        df = df.melt(id_vars=["state_postal_abbreviation"])
        df[["col_name", "variable_type"]] = df.variable.str.rsplit(
            "_", 1, expand=True)
        df.drop("variable", axis=1, inplace=True)
        df = df.pivot(
            index=["state_postal_abbreviation", "variable_type"],
            columns="col_name",
            values="value",
        ).reset_index()
        df.replace({"variable_type": {"death": "deaths"}}, inplace=True)
        df.rename_axis(None, inplace=True)
        df.rename(columns=CtpMetadata._metadata_columns_map(), inplace=True)
        df = CtpMetadata._convert_to_includes_hisp(df)
        return df

    @staticmethod
    def _convert_to_includes_hisp(df: pd.DataFrame):
        """Translates metadata from 'race_ethnicity_[separately|combined]'
        to RACE_INCLUDES_HISPANIC_COL."""
        includes_hisp_col = 'race_includes_hisapnic'
        df[includes_hisp_col] = df.apply(
            # If both race_ethnicity_separately and race_ethnicity_combined are
            # 0, and the state doesn't report ethnicity, then we want to use
            # race_includes_ethnicity unless the state also doesn't report race.
            lambda row: (
                int(row["race_ethnicity_separately"] == 1 or (
                    row["race_ethnicity_combined"] == 0 and
                    row["reports_ethnicity"] == 0 and row["reports_race"] == 1))
            ),
            axis=1
        )
        df.drop(["race_ethnicity_separately", "race_ethnicity_combined"],
                axis=1, inplace=True)
        return df

    @staticmethod
    def _metadata_columns_map():
        """Returns a dict for renaming raw column names."""
        return {
            "state_postal_abbreviation": col_std.STATE_POSTAL_COL,
            # Asian and Pacific Islander
            "api": "reports_api",
            # Currently represents NH/PI and AI/AN combined, or "Indigenous"
            "combined_category_other_than_api": "reports_ind",
            # Whether the locale reports ethnicity
            "ethnicity": "reports_ethnicity",
            # Whether the locale reports race
            "race": "reports_race",
        }
