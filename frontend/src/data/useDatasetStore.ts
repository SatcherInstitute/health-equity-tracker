import { createContext, useContext, useEffect, useState } from "react";
import { MetadataMap, Dataset, DatasetStore, LoadStatus } from "./DatasetTypes";
import { getUniqueProviders } from "./variableProviders";
import VariableProvider from "./variables/VariableProvider";
import { joinOnCols } from "./datasetutils";
import { DataFrame, IDataFrame } from "data-forge";
import { MetricQuery, MetricQueryResponse } from "./MetricQuery";
import { getDataFetcher, getLogger } from "../utils/globals";

const METADATA_KEY = "all_metadata";

let resolveMetadataPromise: (metadata: Promise<MetadataMap>) => void;
const metadataLoadPromise: Promise<MetadataMap> = new Promise((res, rej) => {
  resolveMetadataPromise = res;
});

// Expose method to kick off metadata loading. Note that it's important that
// this method isn't async, or failures from getMetadata will bubble up to the
// caller. Instead we want those errors to be handled by the resource loader.
export function startMetadataLoad() {
  resolveMetadataPromise(getDataFetcher().getMetadata());
}

interface ResourceCache<R> {
  readonly resources: Readonly<Record<string, R>>;
  readonly statuses: Readonly<Record<string, LoadStatus>>;
}

interface ResourceCacheManager<R> {
  readonly cache: ResourceCache<R>;
  readonly setLoadStatus: (resourceId: string, status: LoadStatus) => void;
  readonly setLoaded: (resourceId: string, resource: R) => void;
}

/** Whether the resource should be loaded based on its current load status. */
function shouldLoadResource(loadStatus: LoadStatus) {
  // TODO need to make it not retry for non-retryable errors and/or have a limit
  // for the number of retries with backoff. For now, I removed retrying on
  // error because it causes infinite reloads.
  return loadStatus === undefined || loadStatus === "unloaded";
}

/**
 * Loads a resource and tracks its load state by updating the
 * ResourceCacheManager.
 * @param resourceId A unique id to identify the resource. If the same resource
 *     id is requested multiple times, it will only be fetched once.
 * @param cacheManager The ResourceCacheManager that tracks that resource.
 * @param loadFunction A function that loads the resource when called.
 * @return The resource, once loaded, or undefined if the resource fails to load.
 */
async function loadResource<R>(
  resourceId: string,
  cacheManager: ResourceCacheManager<R>,
  loadFunction: () => Promise<R>
): Promise<R | undefined> {
  try {
    const loadStatus = cacheManager.cache.statuses[resourceId];
    // TODO handle re-load periodically so long-lived tabs don't get stale.
    // Also need to reset the variable cache when datasets are reloaded.
    if (!shouldLoadResource(loadStatus)) {
      getLogger().debugLog("Already loaded or loading " + resourceId);
      return cacheManager.cache.resources[resourceId];
    }

    getLogger().debugLog("Loading " + resourceId);
    cacheManager.setLoadStatus(resourceId, "loading");
    const result = await loadFunction();
    getLogger().debugLog("Loaded " + resourceId);
    cacheManager.setLoaded(resourceId, result);
    return result;
  } catch (e) {
    cacheManager.setLoadStatus(resourceId, "error");
    await getLogger().logError(e, "WARNING", {
      error_type: "resource_load_failure",
      resource_id: resourceId,
    });
  }
  return undefined;
}

/**
 * Hook that exposes a cache of resources and their load statuses. Provides
 * functions to update the state of a resource.
 */
function useResourceCache<R>(): ResourceCacheManager<R> {
  const [cache, setCache] = useState<ResourceCache<R>>({
    resources: {},
    statuses: {},
  });

  function setLoadStatus(resourceId: string, status: LoadStatus) {
    setCache((prevCache) => ({
      ...prevCache,
      statuses: { ...prevCache.statuses, [resourceId]: status },
    }));
  }

  function setLoaded(resourceId: string, resource: R) {
    setCache((prevCache) => ({
      resources: { ...prevCache.resources, [resourceId]: resource },
      statuses: { ...prevCache.statuses, [resourceId]: "loaded" },
    }));
  }

  return { cache, setLoadStatus, setLoaded };
}

/**
 * Hook that exposes a single DatasetStore to the application. Should only be
 * called once at the root app level, and provided via context to the rest of
 * the app.
 *
 * Note: This solution roughly mirrors what a state management library would do,
 * but using a hook and context. This works fine for our purposes because our
 * global state is fairly simple and rarely changes. If we find the need for
 * more complex or dynamic global state, we should consider using a state
 * management library.
 */
export function useDatasetStoreProvider(): DatasetStore {
  const metadataCacheManager = useResourceCache<MetadataMap>();
  const datasetCacheManager = useResourceCache<Dataset>();
  const metricCacheManager = useResourceCache<MetricQueryResponse>();

  function trackMetadataLoad() {
    loadResource<MetadataMap>(
      METADATA_KEY,
      metadataCacheManager,
      async () => metadataLoadPromise
    );
  }

  useEffect(() => {
    trackMetadataLoad();
    // We only want this to run once, on initial render.
    // eslint-disable-next-line
  }, []);

  async function loadDataset(datasetId: string): Promise<Dataset | undefined> {
    const result = await loadResource<Dataset>(
      datasetId,
      datasetCacheManager,
      async () => {
        const promise = getDataFetcher().loadDataset(datasetId);
        const [data, metadata] = await Promise.all([
          promise,
          metadataLoadPromise,
        ]);
        // TODO throw specific error message if metadata is missing.
        // TODO validate metadata against data, and also process variables out
        // of it?
        return new Dataset(data, metadata[datasetId]);
      }
    );
    return result;
  }

  /**
   * Loads the requested metrics into a single dataset and caches them so they
   * can be accessed via `getMetrics()`
   */
  async function loadMetrics(query: MetricQuery): Promise<void> {
    const providers = getUniqueProviders(query.varIds);

    await loadResource<MetricQueryResponse>(
      query.getUniqueKey(),
      metricCacheManager,
      async () => {
        const promises = VariableProvider.getUniqueDatasetIds(
          providers
        ).map((id) => loadDataset(id));
        const datasets = await Promise.all(promises);
        const entries = datasets.map((d) => {
          if (!d) {
            throw new Error("Failed to load dependent dataset");
          }
          return [d.metadata.id, d];
        });
        const datasetMap = Object.fromEntries(entries);
        // Yield thread so the UI can respond. This prevents long calculations
        // from causing UI elements to look laggy.
        await new Promise((res) => {
          setTimeout(res, 0);
        });
        // TODO potentially improve caching by caching the individual results
        // before joining so those can be reused, or caching the results under
        // all of the variables provided under different keys. For example, if
        // you request covid cases we could also cache it under covid deaths
        // since they're provided together. Also, it would be nice to cache ACS
        // when it's used from within another provider.
        const variables: MetricQueryResponse[] = providers.map((provider) =>
          provider.getData(datasetMap, query.breakdowns)
        );

        const potentialErrorResponse = variables.find((metricQueryResponse) =>
          metricQueryResponse.dataIsMissing()
        );
        if (potentialErrorResponse !== undefined) {
          return potentialErrorResponse;
        }

        const dataframes: IDataFrame[] = variables.map(
          (response) => new DataFrame(response.data)
        );

        const joined = dataframes.reduce((prev, next) => {
          return joinOnCols(
            prev,
            next,
            query.breakdowns.getJoinColumns(),
            query.joinType
          );
        });
        return new MetricQueryResponse(joined.toArray());
      }
    );
  }

  function getDatasetLoadStatus(id: string): LoadStatus {
    return datasetCacheManager.cache.statuses[id] || "unloaded";
  }

  function getMetricsLoadStatus(query: MetricQuery): LoadStatus {
    const key = query.getUniqueKey();
    return metricCacheManager.cache.statuses[key] || "unloaded";
  }

  function getMetrics(query: MetricQuery): MetricQueryResponse {
    const metric = metricCacheManager.cache.resources[query.getUniqueKey()];
    // TODO try to find a good way to use static type checking to make sure
    // this is present rather than throwing an error.
    if (!metric) {
      throw new Error("Cannot get a metric that has not been loaded");
    }
    return metric;
  }

  return {
    loadDataset,
    getDatasetLoadStatus,
    loadMetrics: loadMetrics,
    getMetricsLoadStatus,
    getMetrics,
    metadataLoadStatus:
      metadataCacheManager.cache.statuses[METADATA_KEY] || "unloaded",
    metadata: metadataCacheManager.cache.resources[METADATA_KEY] || {},
    datasets: datasetCacheManager.cache.resources,
  };
}

const DatasetStoreContext = createContext<DatasetStore>({} as DatasetStore);
export const DatasetProvider = DatasetStoreContext.Provider;

/**
 * Hook that allows components to access the DatasetStore. A parent component
 * must provide the DatasetStore via the DatasetProvider
 */
export default function useDatasetStore(): DatasetStore {
  return useContext(DatasetStoreContext);
}

/**
 * @param callback Callback that is executed exactly once, once metadata is
 *     loaded.
 */
export function useOnMetadataLoaded(callback: (metadata: MetadataMap) => void) {
  useEffect(() => {
    metadataLoadPromise.then((metadata) => {
      callback(metadata);
    });
    // eslint-disable-next-line
  }, []);
}
