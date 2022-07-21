import { useEffect, useState } from "react";
import { MetricQuery, MetricQueryResponse } from "../query/MetricQuery";
import { getDataManager } from "../../utils/globals";

export type IncompleteLoadStatus = "loading" | "error";

/**
 * Loads the specified resources and returns the resources or
 * IncompleteLoadStatus.
 * @param resources The resources to load.
 * @param loadFn The function to call that loads a single resource.
 * @param depIdFn A function that returns a unique, stable id for a single
 *     resource. This is used to determine when to load a resource: if any of
 *     the resource ids change, all of the resources are re-loaded.
 */
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

/**
 * Loads the specified MetricQuery array and returns the responses or
 * IncompleteLoadStatus.
 * @param queries The queries to load the responses for.
 */
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
