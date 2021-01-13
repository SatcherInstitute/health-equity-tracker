import { createContext, useContext, useEffect, useState } from "react";
import { MetadataMap, Dataset, DatasetStore, LoadStatus } from "./DatasetTypes";
import { getUniqueProviders } from "./variableProviders";
import VariableProvider from "./variables/VariableProvider";
import { joinOnCols } from "./datasetutils";
import { DataFrame, IDataFrame } from "data-forge";
import { MetricQuery, MetricQueryResponse } from "./MetricQuery";
import { getCache, getDataFetcher, getLogger } from "../utils/globals";

// Note: The way this is designed is a bit of a hack to work around some issues
// with React/data loading. React queues state updates asynchronously with no
// guarantees for when they will be run. This means that if we use a hook for
// loading state, we might still load the same data multiple times if different
// charts request the same data at the same time. Instead, we use a mutable
// global cache so that we can immediately set the loading state so that
// subsequent requests do not re-load the same data. Using a mutable global
// cache also facilitates things like periodically clearing the cache, loading
// a dataset from within a variable provider, and caching similar queries at the
// same time. We use a React hook as a wrapper around the mutable cache -
// whenever the LoadStatus of a resource in the cache changes, it calls the
// hook's setState method, which causes all components to re-render.
//
// Ideally, this should probably be rewritten in a way that is more idiomatic to
// React: either using a hook with useRef for mutable state, or using a state
// management library like Redux or Mobx. Redux is more popular/standard, but
// Mobx maps better to the paradigm of using classes with mutable state that
// we're currently using so would likely require much less refactoring.

abstract class ResourceCache<K, R> {
  private resources: Record<string, R>;
  private loadingResources: Record<string, Promise<R>>;
  private loadStatuses: Record<string, LoadStatus>;

  /** Keep a reference to the overall cache for intermediate caching. */
  protected readonly cache: DataCache;

  private onLoadStatusChanged: (
    statuses: Readonly<Record<string, LoadStatus>>
  ) => void;

  constructor(cache: DataCache) {
    this.resources = {};
    this.loadingResources = {};
    this.loadStatuses = {};
    this.cache = cache;
    this.onLoadStatusChanged = () => {};
  }

  setOnLoadStatusChangedCallback(
    onLoadStatusChanged: (
      statuses: Readonly<Record<string, LoadStatus>>
    ) => void
  ) {
    this.onLoadStatusChanged = onLoadStatusChanged;
  }

  resetCache() {
    // There's no way to cancel in-flight promises, so we don't clear the
    // loading resources.
    this.resources = {};
    this.loadStatuses = {};
    Object.keys(this.loadingResources).forEach((resourceId: string) => {
      this.loadStatuses[resourceId] = "loading";
    });
    this.onLoadStatusChanged({ ...this.loadStatuses });
  }

  addResourceToCache(key: K, resource: R) {
    const resourceId = this.getResourceId(key);
    this.resources[resourceId] = resource;
    this.updateLoadStatus(resourceId, "loaded");
  }

  private updateLoadStatus(resourceId: string, status: LoadStatus) {
    this.loadStatuses[resourceId] = status;
    this.onLoadStatusChanged({ ...this.loadStatuses });
  }

  async loadResource(key: K): Promise<R | undefined> {
    const resourceId = this.getResourceId(key);

    // Errors are considered permanent, so we don't retry on errors. Reloading
    // is required to retry. In the future we could consider a more robust retry
    // mechanism that only allows retrying after a certain amount of time or
    // when the user changes Mad-libs. However, it's simpler and safer to just
    // not retry because frequent retries can risk spamming the server or
    // freezing the page from too many expensive computations.
    if (this.loadStatuses[resourceId] === "error") {
      return undefined;
    }

    try {
      // TODO handle errors at the DataFetcher level
      // TODO handle re-load periodically so long-lived tabs don't get stale.
      // Also need to reset the variable cache when datasets are reloaded.

      const resource = this.resources[resourceId];
      if (resource) {
        return resource;
      }
      const loadingResource = this.loadingResources[resourceId];
      if (loadingResource) {
        return await loadingResource;
      }

      this.updateLoadStatus(resourceId, "loading");
      getLogger().debugLog("Loading " + resourceId);

      const loadPromise = this.loadResourceInternal(key);
      this.loadingResources[resourceId] = loadPromise;
      const result = await loadPromise;

      this.resources[resourceId] = result;
      delete this.loadingResources[resourceId];
      this.updateLoadStatus(resourceId, "loaded");
      getLogger().debugLog("Loaded " + resourceId);

      return result;
    } catch (e) {
      delete this.loadingResources[resourceId];
      this.updateLoadStatus(resourceId, "error");
      await getLogger().logError(e, "WARNING", {
        error_type: "resource_load_failure",
        resource_id: resourceId,
      });
    }
    return undefined;
  }

  getResource(key: K): R | undefined {
    return this.resources[this.getResourceId(key)];
  }

  protected abstract loadResourceInternal(key: K): Promise<R>;

  abstract getResourceId(key: K): string;
}

class MetadataCache extends ResourceCache<string, MetadataMap> {
  static METADATA_KEY = "all_metadata";

  protected async loadResourceInternal(
    metadataId: string
  ): Promise<MetadataMap> {
    return metadataLoadPromise;
  }

  getResourceId(metadataId: string): string {
    return metadataId;
  }
}

class DatasetCache extends ResourceCache<string, Dataset> {
  protected async loadResourceInternal(datasetId: string): Promise<Dataset> {
    const promise = getDataFetcher().loadDataset(datasetId);
    const [data, metadata] = await Promise.all([promise, metadataLoadPromise]);
    // TODO throw specific error message if metadata is missing.
    // TODO validate metadata against data, and also process variables out
    // of it?
    return new Dataset(data, metadata[datasetId]);
  }

  getResourceId(datasetId: string): string {
    return datasetId;
  }
}

class MetricQueryCache extends ResourceCache<MetricQuery, MetricQueryResponse> {
  protected async loadResourceInternal(
    query: MetricQuery
  ): Promise<MetricQueryResponse> {
    const providers = getUniqueProviders(query.metricIds);
    // TODO replace with getDependentDatasets(query) so we only load the minimal
    // set of datasets.
    const datasetIds = VariableProvider.getUniqueDatasetIds(providers);

    const promises = datasetIds.map((id) =>
      this.cache.datasetCache.loadResource(id)
    );
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
    const queryResponses: MetricQueryResponse[] = providers.map(
      (provider) => provider.getData(datasetMap, query.breakdowns)
    );

    const potentialErrorResponse = queryResponses.find(
      (metricQueryResponse) => metricQueryResponse.dataIsMissing()
    );
    if (potentialErrorResponse !== undefined) {
      return potentialErrorResponse;
    }

    const dataframes: IDataFrame[] = queryResponses.map(
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

    const consumedDatasetIds = queryResponses.reduce(
      (accumulator: string[], response: MetricQueryResponse) =>
        accumulator.concat(response.consumedDatasetIds),
      []
    );
    const uniqueConsumedDatasetIds = Array.from(
      new Set(consumedDatasetIds)
    );
    return new MetricQueryResponse(
      joined.toArray(),
      uniqueConsumedDatasetIds
    );
  }

  getResourceId(query: MetricQuery): string {
    return query.getUniqueKey();
  }
}

export class DataCache {
  readonly datasetCache: DatasetCache;
  readonly metricQueryCache: MetricQueryCache;
  readonly metadataCache: MetadataCache;

  constructor() {
    this.datasetCache = new DatasetCache(this);
    this.metricQueryCache = new MetricQueryCache(this);
    this.metadataCache = new MetadataCache(this);
  }

  resetCache() {
    // TODO need to handle resetting and reloading metadata
    this.datasetCache.resetCache();
    this.metricQueryCache.resetCache();
  }
}

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

/**
 * A hook that tracks the LoadStatuses for a ResourceCache and exposes them for
 * use in React components so that components will update whenever a load status
 * changes.
 *
 * @return An array of length three:
 *     1. getLoadStatus: a function that returns the load status of a resource
 *     2. loadResource: a function that loads a resource and returns a Promise
 *        that resolves when the resource is loaded
 *     3. getResource: a function that gets a resource synchronously, and throws
 *        if the resource isn't loaded.
 */
function useLoadStatuses<K, R>(
  cache: ResourceCache<K, R>
): [(key: K) => LoadStatus, (key: K) => Promise<R | undefined>, (key: K) => R] {
  const [loadStatuses, setLoadStatuses] = useState<Record<string, LoadStatus>>(
    {}
  );
  cache.setOnLoadStatusChangedCallback(setLoadStatuses);

  function getLoadStatus(key: K) {
    return loadStatuses[cache.getResourceId(key)] || "unloaded";
  }

  async function loadResource(key: K): Promise<R | undefined> {
    return await cache.loadResource(key);
  }

  function getResource(key: K): R {
    const resource = cache.getResource(key);
    // TODO try to find a good way to use static type checking to make sure
    // this is present rather than throwing an error.
    if (!resource) {
      throw new Error("Cannot get a resource that has not been loaded");
    }
    return resource;
  }

  return [getLoadStatus, loadResource, getResource];
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
  const [getMetadataLoadStatus, loadMetadata, getMetadata] = useLoadStatuses<
    string,
    MetadataMap
  >(getCache().metadataCache);
  const [getDatasetLoadStatus, loadDataset, getDataset] = useLoadStatuses<
    string,
    Dataset
  >(getCache().datasetCache);
  const [getMetricsLoadStatus, loadMetrics, getMetrics] = useLoadStatuses<
    MetricQuery,
    MetricQueryResponse
  >(getCache().metricQueryCache);

  useEffect(() => {
    loadMetadata(MetadataCache.METADATA_KEY);
    // We only want this to run once, on initial render.
    // eslint-disable-next-line
  }, []);

  return {
    loadDataset,
    getDatasetLoadStatus,
    getDataset,
    loadMetrics,
    getMetricsLoadStatus,
    getMetrics,
    getMetadataLoadStatus: () =>
      getMetadataLoadStatus(MetadataCache.METADATA_KEY),
    getMetadata: () => getMetadata(MetadataCache.METADATA_KEY),
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
