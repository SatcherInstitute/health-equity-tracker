import Button from "@material-ui/core/Button";
import React from "react";
import { getDataManager } from "../../../utils/globals";

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

async function downloadDataset(datasetId: string) {
  try {
    const dataset = await getDataManager().loadDataset(datasetId);
    download(dataset.metadata.name + ".csv", dataset.toCsvString());
  } catch (e) {
    // TODO remove alert, log error and show error in UI
    alert("Oops, failed to load dataset. Try reloading.");
    return;
  }
}

function DownloadButton(props: { datasetId: string }) {
  return (
    <Button
      color="primary"
      onClick={() => {
        downloadDataset(props.datasetId);
      }}
    >
      Download
    </Button>
  );
}

export default DownloadButton;
