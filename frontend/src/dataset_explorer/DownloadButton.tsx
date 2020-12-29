import Button from "@material-ui/core/Button";
import React from "react";
import { DatasetStore } from "../data/DatasetTypes";
import useDatasetStore from "../data/useDatasetStore";

function download(filename: string, content: string) {
  const element = document.createElement("a");
  element.setAttribute(
    "href",
    "data:text/csv;charset=utf-8," + encodeURIComponent(content)
  );
  element.setAttribute("download", filename);

  element.style.display = "none";
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
}

async function downloadDataset(datasetStore: DatasetStore, datasetId: string) {
  const dataset = await datasetStore.loadDataset(datasetId);
  if (!dataset) {
    // TODO remove alert, log error and show error in UI
    alert("Oops, failed to load dataset");
    return;
  }
  download(dataset.metadata.name + ".csv", dataset.toCsvString());
}

function DownloadButton(props: { datasetId: string }) {
  const datasetStore = useDatasetStore();
  return (
    <Button
      color="primary"
      onClick={() => {
        downloadDataset(datasetStore, props.datasetId);
      }}
    >
      Download
    </Button>
  );
}

export default DownloadButton;
