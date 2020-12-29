import { Button } from "@material-ui/core";
import React, { useEffect } from "react";
import { LoadStatus } from "./DatasetTypes";
import useDatasetStore from "./useDatasetStore";
import CircularProgress from "@material-ui/core/CircularProgress";
import { MetricQuery } from "./MetricQuery";

function getJointLoadStatus(statuses: LoadStatus[]) {
  if (statuses.includes("error")) {
    return "error";
  }
  if (statuses.includes("loading") || statuses.includes("unloaded")) {
    return "loading";
  }
  return "loaded";
}

/**
 * Provides a wrapper around a UI component that may be loading or have an async
 * error, and displays loading and error indicators.
 */
export function WithLoadingOrErrorUI(props: {
  loadStatus: LoadStatus;
  children: () => JSX.Element;
  loadingComponent?: JSX.Element;
}) {
  switch (props.loadStatus) {
    case "loaded":
      return props.children();
    case "loading":
    case "unloaded":
      return props.loadingComponent ? (
        props.loadingComponent
      ) : (
        <CircularProgress />
      );
    default:
      return (
        <div>
          <p>Oops, something went wrong.</p>
          <Button onClick={() => window.location.reload()}>reload</Button>
        </div>
      );
  }
}

/**
 * Provides a wrapper around a UI component that requires some metrics, and
 * displays loading and error indicators.
 */
export function WithMetrics(props: {
  queries: MetricQuery[];
  loadingComponent?: JSX.Element;
  children: () => JSX.Element;
}) {
  const datasetStore = useDatasetStore();
  // No need to make sure this only loads once, since the dataset store handles
  // making sure it's not loaded too many times.
  useEffect(() => {
    props.queries.forEach((query) => {
      datasetStore.loadMetrics(query);
    });
  });
  const statuses = props.queries.map((query) =>
    datasetStore.getMetricsLoadStatus(query)
  );

  return (
    <WithLoadingOrErrorUI
      loadStatus={getJointLoadStatus(statuses)}
      loadingComponent={props.loadingComponent}
    >
      {props.children}
    </WithLoadingOrErrorUI>
  );
}

/**
 * Provides a wrapper around a UI component that requires some datasets, and
 * displays loading and error indicators.
 */
export function WithDatasets(props: {
  datasetIds: string[];
  children: () => JSX.Element;
}) {
  const datasetStore = useDatasetStore();
  // No need to make sure this only loads once, since the dataset store handles
  // making sure it's not loaded too many times.
  useEffect(() => {
    props.datasetIds.forEach((id) => {
      datasetStore.loadDataset(id);
    });
  });
  const statuses = props.datasetIds.map((id) =>
    datasetStore.getDatasetLoadStatus(id)
  );
  return (
    <WithLoadingOrErrorUI loadStatus={getJointLoadStatus(statuses)}>
      {props.children}
    </WithLoadingOrErrorUI>
  );
}
