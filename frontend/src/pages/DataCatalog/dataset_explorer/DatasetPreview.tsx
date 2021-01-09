import React from "react";
import DataTable from "./DataTable";
import useDatasetStore from "../../../data/useDatasetStore";
import { Dataset } from "../../../data/DatasetTypes";

/* NOTE: This file is currently unused */

function getTableViewColumns(
  dataset: Dataset
): { Header: string; accessor: string }[] {
  return dataset.metadata.fields.map((field) => ({
    Header: field.name,
    accessor: field.name,
  }));
}

function getTableViewData(dataset: Dataset) {
  // Copy the dataset rows because the table view expects mutable data. This
  // may be slow for massive datasets, but that would likely be slow for a
  // number of reasons anyway so if we encounter that we might consider
  // truncating the preview.
  return dataset.rows.map((row) => ({ ...row }));
}

function DatasetPreview({ datasetId }: { datasetId: string }) {
  const datasetStore = useDatasetStore();
  switch (datasetStore.getDatasetLoadStatus(datasetId)) {
    case "loaded":
      const dataset = datasetStore.datasets[datasetId];
      return (
        <DataTable
          columns={getTableViewColumns(dataset)}
          data={getTableViewData(dataset)}
        />
      );
    case "loading":
    case "unloaded":
      return <p>Loading...</p>;
    default:
      return <p>Oops, something went wrong.</p>;
  }
}

export default DatasetPreview;
