import { Button } from "@material-ui/core";
import React from "react";
import { MetadataMap } from "./DatasetTypes";
import CircularProgress from "@material-ui/core/CircularProgress";
import { MetricQuery, MetricQueryResponse } from "./MetricQuery";
import { getDataManager } from "../utils/globals";
import { MetadataCache } from "./DataManager";
import { IncompleteLoadStatus, useMetrics, useResources } from "./useResources";

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
      <CircularProgress />
    );
  }

  if (props.resources === "error") {
    return (
      <div data-testid="WithLoadingOrErrorUI-error">
        <p>Oops, something went wrong.</p>
        <Button onClick={() => window.location.reload()}>reload</Button>
      </div>
    );
  }

  return props.children(props.resources);
}

export function WithMetadata(props: {
  children: (metadata: MetadataMap) => JSX.Element;
  loadingComponent?: JSX.Element;
}) {
  const metadatas = useResources<string, MetadataMap>(
    [MetadataCache.METADATA_KEY],
    async () => await getDataManager().loadMetadata(),
    (metadataId) => metadataId
  );

  // useResources is generalized for multiple resources, but there is only one
  // metadata resource so we use metadata[0]
  return (
    <WithLoadingOrErrorUI<MetadataMap>
      resources={metadatas}
      loadingComponent={props.loadingComponent}
    >
      {(metadata: MetadataMap[]) => props.children(metadata[0])}
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

export function WithMetadataAndMetrics(props: {
  queries: MetricQuery[];
  children: (
    metadata: MetadataMap,
    queryResponses: MetricQueryResponse[]
  ) => JSX.Element;
  loadingComponent?: JSX.Element;
}) {
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
          {(queryResponses) => props.children(metadata, queryResponses)}
        </WithMetrics>
      )}
    </WithMetadata>
  );
}
