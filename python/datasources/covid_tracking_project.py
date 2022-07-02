from google.cloud import bigquery
import pandas as pd

from datasources.covid_tracking_project_metadata import CtpMetadata
from datasources.data_source import DataSource
import ingestion.gcs_to_bq_util as gcs_to_bq_util
import ingestion.standardized_columns as col_std
from ingestion.standardized_columns import Race


# Covid Tracking Project race data by state from covidtracking.com/race
class CovidTrackingProject(DataSource):
    @staticmethod
    def get_id():
        return "COVID_TRACKING_PROJECT"

    @staticmethod
    def get_table_name():
        return "covid_tracking_project"

    @staticmethod
    def get_standard_columns():
        """Returns a dict containing conversions from Covid Tracking Project's
        race categories to their standardized values. Unlike other datasets,
        CTP doesn't use the race category id because it is not known at this
        stage, until it is joined with CTP metadata. Instead it uses the race
        column plus the includes_hispanic column."""
        return {
            "aian": Race.AIAN.race,
            "asian": Race.ASIAN.race,
            "black": Race.BLACK.race,
            "nhpi": Race.NHPI.race,
            "white": Race.WHITE.race,
            "multiracial": Race.MULTI.race,
            "other": Race.OTHER_NONSTANDARD.race,
            "unknown": Race.UNKNOWN.race,
            "ethnicity_hispanic": Race.HISP.race,
            "ethnicity_nonhispanic": Race.NH.race,
            "ethnicity_unknown": Race.ETHNICITY_UNKNOWN.race,
            "total": Race.ALL.race,
        }

    def write_to_bq(self, dataset, gcs_bucket, **attrs):
        filename = self.get_attr(attrs, "filename")

        df = gcs_to_bq_util.load_csv_as_df(
            gcs_bucket, filename, parse_dates=["Date"], thousands=",")
        df = self.standardize(df)

        # Get the metadata table
        metadata = self._download_metadata(dataset)
        if len(metadata.index) == 0:
            raise RuntimeError(
                "BigQuery call to {} returned 0 rows".format(dataset))
        merged = CovidTrackingProject.merge_with_metadata(df, metadata)

        # Split into separate tables by variable type
        for variable_type in ["cases", "deaths", "tests", "hosp"]:
            result = merged.copy()
            result = result.loc[result["variable_type"] == variable_type]
            result.rename(columns={"value": variable_type}, inplace=True)
            result.drop("variable_type", axis="columns", inplace=True)
            # Write to BQ
            gcs_to_bq_util.add_df_to_bq(
                result, dataset, self.get_table_name() + "_" + variable_type)

    def standardize(self, df: pd.DataFrame) -> pd.DataFrame:
        """Reformats data into the standard format.

        Args:
        df: DataFrame representing the raw CTP data

        Returns:
        A pandas.DataFrame containing the standardized and formatted data."""
        self.clean_frame_column_names(df)
        df.drop(
            columns=["cases_latinx", "deaths_latinx",
                     "hosp_latinx", "tests_latinx"],
            inplace=True)
        df = df.melt(id_vars=["date", "state"])
        df[["variable_type", col_std.RACE_COL]] = df.variable.str.split(
            "_", 1, expand=True)
        df.drop("variable", axis=1, inplace=True)
        df.rename(columns={"state": col_std.STATE_POSTAL_COL}, inplace=True)
        df.replace(
            {col_std.RACE_COL: self.get_standard_columns()}, inplace=True)
        df["date"] = df["date"].map(lambda ts: ts.strftime("%Y-%m-%d"))
        return df

    @staticmethod
    def merge_with_metadata(df: pd.DataFrame, metadata: pd.DataFrame) -> pd.DataFrame:
        """Merges the standardized CTP data with the CTP metadata.

        Args:
        df: a pandas.DataFrame containing the standardized CTP data.
        metadata: a pandas.DataFrame containing the CTP metadata.

        Returns:
        A pandas.DataFrame that contains the merged CTP data and metadata."""
        # Merge the tables
        merged = pd.merge(
            df, metadata, how="left", on=[col_std.STATE_POSTAL_COL, "variable_type"])

        # Rename combined race categories
        CovidTrackingProject._rename_race_category(
            merged, "reports_api", Race.ASIAN, Race.API)
        CovidTrackingProject._rename_race_category(
            merged, "reports_ind", Race.AIAN, Race.INDIGENOUS)
        merged.drop(columns=["reports_api", "reports_ind"], inplace=True)
        return merged

    @staticmethod
    def _download_metadata(dataset: str) -> pd.DataFrame:
        """Downloads the metadata table from BigQuery by executing a query.

        Args:
        dataset: Name of the dataset to request metadata from

        Returns:
        A pandas.DataFrame containing the contents of the requested table."""
        client = bigquery.Client()
        job_config = bigquery.QueryJobConfig(
            default_dataset=client.get_dataset(dataset))
        sql = """
        SELECT *
        FROM {};
        """.format(CtpMetadata.get_table_name())
        return client.query(sql, job_config=job_config).to_dataframe()

    @staticmethod
    def _rename_race_category(
        df: pd.DataFrame, indicator_column: str, old_name: Race, new_name: Race
    ):
        """Renames values in df.race_and_ethnicity from old_name to new_name
           based on indicator_column.

        Args:
        df: pandas.DataFrame to modify
        indicator_column: Name of the column to be used to decide whether
            to rename the race value. Values should be Boolean.
        old_name: The race category to change
        new_name: The race category to rename to"""
        df[col_std.RACE_COL] = df.apply(
            CovidTrackingProject._replace_value,
            axis=1,
            args=(indicator_column, old_name, new_name),
        )

    @staticmethod
    def _replace_value(
        row: pd.Series, indicator_column: str, old_name: Race, new_name: Race
    ):
        """Helper method for _rename_race_category. Conditionally replaces
           the race value for a given row.

        Args:
        row: A single row (pandas.Series) to modify
        indicator_column: Name of the column that indicates whether to modify
            the race value.
        old_name: The race category to change
        new_name: The race category to rename to"""
        if row[indicator_column] == 1 and row[col_std.RACE_COL] == old_name.race:
            return new_name.race
        return row[col_std.RACE_COL]
