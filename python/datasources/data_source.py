from abc import ABC
import re
from typing import Any
import pandas as pd
from ingestion import url_file_to_gcs, gcs_to_bq_util


# Abstract base class for all data sources ingested by the Health Equity
# Tracker. This also includes default implementations for each of the
# ingestion methods.
class DataSource(ABC):
    @staticmethod
    def get_id() -> str:
        """Returns the data source's unique id usually all uppercase like `SOME_SOURCE_DATA`"""
        return ""

    @staticmethod
    def get_table_name() -> str:
        """Returns the BigQuery base table name where the data source's data will
        stored, usually all lowercase like `some_source_data`"""
        return ""

    def get_attr(self, attributes: dict, key: str) -> Any:
        attr = attributes.get(key)
        if attr is None:
            raise RuntimeError(f"Attribute: {key} not found on payload")
        return attr

    def upload_to_gcs(self, gcs_bucket: str, **attrs) -> bool:
        """
        Attempts to download a file from a url and upload as a
        blob to the given GCS bucket.

        Parameters:
            gcs_bucket: Name of the GCS bucket to upload to (without gs://).
            attrs: Additional message attributes such as url and filename that
                   are needed for this data source.

        Returns: A boolean indication of a file diff.
                 In the case that there are many files to download, this will
                 return true if there is at least one file that is different.
        """
        return url_file_to_gcs.url_file_to_gcs(
            self.get_attr(attrs, "url"), None, gcs_bucket, self.get_attr(attrs, "filename")
        )

    def write_to_bq(self, dataset: str, gcs_bucket: str, write_local_instead_of_bq=False, **attrs) -> None:
        """Writes source data from GCS bucket to BigQuery

        dataset: The BigQuery dataset to write to
        gcs_bucket: The name of the gcs bucket to read the data from
        write_local_instead_of_bq: If true, writes the data to a local file. Default False
        attrs: Additional message attributes such as url and filename that are
               needed for this data source."""
        if write_local_instead_of_bq:
            print("TODO: Writing to local file instead of BigQuery")
        self.write_to_bq_table(dataset, gcs_bucket, self.get_attr(attrs, "filename"), self.get_table_name())

    def write_to_bq_table(self, dataset: str, gcs_bucket: str, filename: str, table_name: str, project=None) -> None:
        """Writes source data from GCS bucket to BigQuery

        dataset: The BigQuery dataset to write to
        gcs_bucket: The name of the gcs bucket to read the data from
        filename: The name of the file in the gcs bucket to read from
        table_name: The name of the BigQuery table to write to"""
        chunked_frame = gcs_to_bq_util.load_csv_as_df(gcs_bucket, filename, chunksize=1000)

        # For the very first chunk, we set the mode to overwrite to clear the
        # previous table. For subsequent chunks we append.
        overwrite = True
        for chunk in chunked_frame:
            self.clean_frame_column_names(chunk)
            gcs_to_bq_util.add_df_to_bq(chunk, dataset, table_name, project=project, overwrite=overwrite)
            overwrite = False

    def clean_frame_column_names(self, frame: pd.DataFrame) -> None:
        """Replaces unfitting BigQuery characters and
        makes all column names lower case.

        frame: The pandas dataframe with unclean columns
        """
        frame.rename(
            columns=lambda col: (re.sub("[^0-9a-zA-Z_=%]+", "_", col).lower().replace("=", "eq").replace("%", "pct")),
            inplace=True,
        )
