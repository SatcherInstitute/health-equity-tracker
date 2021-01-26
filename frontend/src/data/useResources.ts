import { useEffect, useState } from "react";
import { MetricQuery, MetricQueryResponse } from "./MetricQuery";
import { getDataManager } from "../utils/globals";

export type IncompleteLoadStatus = "loading" | "error";

export function useResources<K, R>(
  resources: K[],
  loadFn: (resource: K) => Promise<R>,
  depIdFn: (resource: K) => string
): R[] | IncompleteLoadStatus {
  const [resourceState, setResourceState] = useState<
    R[] | IncompleteLoadStatus
  >("loading");

  async function loadResources() {
    try {
      const promises = resources.map((resource) => loadFn(resource));
      const results = await Promise.all(promises);
      setResourceState(results);
    } catch (e) {
      setResourceState("error");
    }
  }

  useEffect(() => {
    loadResources();
    // eslint-disable-next-line
  }, [...resources.map((resource) => depIdFn(resource))]);

  return resourceState;
}

export function useMetrics(
  queries: MetricQuery[]
): MetricQueryResponse[] | IncompleteLoadStatus {
  const queryResponses = useResources<MetricQuery, MetricQueryResponse>(
    queries,
    async (query: MetricQuery) => await getDataManager().loadMetrics(query),
    (query) => query.getUniqueKey()
  );

  return queryResponses;
}
