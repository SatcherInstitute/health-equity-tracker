import { Button } from "@material-ui/core";
import React from "react";
import { Dataset, MapOfDatasetMetadata } from "../utils/DatasetTypes";
import CircularProgress from "@material-ui/core/CircularProgress";
import { MetricQuery, MetricQueryResponse } from "../query/MetricQuery";
import { getDataManager } from "../../utils/globals";
import { MetadataCache } from "../loading/DataManager";
import { IncompleteLoadStatus, useMetrics, useResources } from "./useResources";
import { GEOGRAPHIES_DATASET_ID } from "../config/MetadataMap";

/**
 * Provides a wrapper around a UI component that may be loading or have an async
 * error, and displays loading and error indicators.
 */
export function WithLoadingOrErrorUI<R>(props: {
  resources: R[] | IncompleteLoadStatus;
  children: (resources: R[]) => JSX.Element;
  loadingComponent?: JSX.Element;
}) {
  if (props.resources === "loading") {
    return props.loadingComponent ? (
      props.loadingComponent
    ) : (
      <CircularProgress aria-label="loading" />
    );
  }

  if (props.resources === "error") {
    return (
      <div data-testid="WithLoadingOrErrorUI-error">
        <p>
          <b>Oops, something went wrong.</b>
        </p>
        <Button onClick={() => window.location.reload()}>
          <b>Reload</b>
        </Button>
      </div>
    );
  }

  console.log(props.resources);

  return props.children(props.resources);
}

export function WithMetadata(props: {
  children: (metadata: MapOfDatasetMetadata) => JSX.Element;
  loadingComponent?: JSX.Element;
}) {
  const metadatas = useResources<string, MapOfDatasetMetadata>(
    [MetadataCache.METADATA_KEY],
    async () => await getDataManager().loadMetadata(),
    (metadataId) => metadataId
  );

  // useResources is generalized for multiple resources, but there is only one
  // metadata resource so we use metadata[0]
  return (
    <WithLoadingOrErrorUI<MapOfDatasetMetadata>
      resources={metadatas}
      loadingComponent={props.loadingComponent}
    >
      {(metadata: MapOfDatasetMetadata[]) => props.children(metadata[0])}
    </WithLoadingOrErrorUI>
  );
}

/**
 * Provides a wrapper around a UI component that requires some metrics, and
 * displays loading and error indicators.
 */
export function WithMetrics(props: {
  queries: MetricQuery[];
  children: (responses: MetricQueryResponse[]) => JSX.Element;
  loadingComponent?: JSX.Element;
}) {
  const queryResponses = useMetrics(props.queries);
  return (
    <WithLoadingOrErrorUI<MetricQueryResponse>
      resources={queryResponses}
      loadingComponent={props.loadingComponent}
    >
      {props.children}
    </WithLoadingOrErrorUI>
  );
}

function WithDatasets(props: {
  datasetIds: string[];
  children: (datasets: Dataset[]) => JSX.Element;
  loadingComponent?: JSX.Element;
}) {
  const datasets = useResources<string, Dataset>(
    props.datasetIds,
    async (id: string) => await getDataManager().loadDataset(id),
    (id: string) => id
  );
  return (
    <WithLoadingOrErrorUI<Dataset>
      resources={datasets}
      loadingComponent={props.loadingComponent}
    >
      {props.children}
    </WithLoadingOrErrorUI>
  );
}

/**
 * We create a wrapper with a key to create a new instance when
 * queries change so that the component's load screen is reset.
 */
interface WithMetadataAndMetricsProps {
  queries: MetricQuery[];
  children: (
    metadata: MapOfDatasetMetadata,
    queryResponses: MetricQueryResponse[],
    geoData?: Record<string, any>
  ) => JSX.Element;
  loadingComponent?: JSX.Element;
  loadGeographies?: boolean;
}

export function WithMetadataAndMetrics(props: WithMetadataAndMetricsProps) {
  const key = props.queries.reduce(
    (accumulator: string, query: MetricQuery) =>
      (accumulator += query.getUniqueKey()),
    String(!!props.loadGeographies)
  );

  return <WithMetadataAndMetricsWithKey key={key} {...props} />;
}

export function WithMetadataAndMetricsWithKey(
  props: WithMetadataAndMetricsProps
) {
  // Note: this will result in an error page if any of the required data fails
  // to be fetched. We could make the metadata optional so the charts still
  // render, but it is much easier to reason about if we require both. The
  // downside is the user is more likely to see an error if the metadata is
  // broken but the datasets aren't.
  return (
    <WithMetadata loadingComponent={props.loadingComponent}>
      {(metadata) => (
        <WithMetrics
          queries={props.queries}
          loadingComponent={props.loadingComponent}
        >
          {(queryResponses) => {
            if (!props.loadGeographies) {
              return props.children(metadata, queryResponses);
            }
            return (
              <WithDatasets
                datasetIds={[GEOGRAPHIES_DATASET_ID]}
                loadingComponent={props.loadingComponent}
              >
                {(datasets) => {
                  // Expect just the geography dataset because that's what we
                  // passed to props.datasetIds
                  // TODO: Consider changing WithLoadingOrErrorUI and similar
                  // components to return a map of {id: resource} instead of
                  // an array so it's less brittle.
                  const [geographies] = datasets;
                  return props.children(
                    metadata,
                    queryResponses,
                    geographies.rows
                  );
                }}
              </WithDatasets>
            );
          }}
        </WithMetrics>
      )}
    </WithMetadata>
  );
}
