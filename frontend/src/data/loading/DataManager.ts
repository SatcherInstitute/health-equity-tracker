import { DataFrame, IDataFrame } from "data-forge";
import LRU from "lru-cache";
import { getDataFetcher, getDataManager, getLogger } from "../../utils/globals";
import { MetricQuery, MetricQueryResponse } from "../query/MetricQuery";
import { DatasetOrganizer } from "../sorting/DatasetOrganizer";
import { Dataset, MapOfDatasetMetadata } from "../utils/DatasetTypes";
import { joinOnCols } from "../utils/datasetutils";
import VariableProviderMap from "./VariableProviderMap";

// TODO test this out on the real website and tweak these numbers as needed.

// Max size for the dataset and query cache is measured by number of rows in the
// data plus a constant factor per entry.
// To optimize performance, the goals are:
// 1. All resources required to display a single report for a given selection of
//    mad-lib drop downs can fit into the cache.
// 2. The total site memory usage is reasonable. This is a bit of a judgement
//    call, but it should be comparable with other applications. This can be
//    viewed in the browser task manager.
const MAX_CACHE_SIZE_DATASETS = 100000;
const MAX_CACHE_SIZE_QUERIES = 10000;

// We only expect one metadata entry so we can set cache size to 1.
const MAX_CACHE_SIZE_METADATA = 1;

export abstract class ResourceCache<K, R> {
  private readonly lruCache: LRU<string, R>;
  private loadingResources: Record<string, Promise<R>>;
  private failedResources: Set<string>;

  constructor(maxSize: number) {
    this.lruCache = this.createLruCache(maxSize);
    this.loadingResources = {};
    this.failedResources = new Set();
  }

  private createLruCache(maxSize: number): LRU<string, R> {
    const onDispose = (key: string, resource: R) => {
      getLogger().debugLog("Dropping " + key + " from cache.");
      if (this.getResourceSize(resource, key) > maxSize) {
        // It is recommended that if a single entry is larger than cache size,
        // it get split up into smaller chunks to avoid poor performance when
        // multiple cards try to use the same large resource.
        getLogger().logError(
          new Error(
            "Resource loaded that is larger than the maximum cache size: " + key
          ),
          "WARNING"
        );
      }
    };

    const options = {
      max: maxSize,
      length: this.getResourceSize,
      dispose: onDispose,
      // If it has been more than 24 hours, the next time the resource is
      // requested it will trigger a new load to make sure the data doesn't get
      // stale. Note that max age is evaluated lazily, so this will not generate
      // additional QPS unless the user actually interacts with the page.
      maxAge: 1000 * 60 * 60 * 24,
    };
    return new LRU<string, R>(options);
  }

  resetCache() {
    // There's no way to cancel in-flight promises, so we don't clear the
    // loading resources.
    this.lruCache.reset();
    this.failedResources = new Set();
  }

  addResourceToCache(key: K, resource: R) {
    const resourceId = this.getResourceId(key);
    this.lruCache.set(resourceId, resource);
  }

  /**
   * Loads and returns the requested resource. If the resource is already in
   * cache and not expired, returns it without re-loading. Throws an error if
   * the resource cannot be returned.
   * @param key The uniquely identifying key for the resource. Uses
   *     `getResourceId` to determine uniqueness.
   */
  async loadResource(key: K): Promise<R> {
    const resourceId = this.getResourceId(key);

    // Errors are considered permanent, so we don't retry on errors. Reloading
    // is required to retry. In the future we could consider a more robust retry
    // mechanism that only allows retrying after a certain amount of time or
    // when the user changes Mad-libs. However, it's simpler and safer to just
    // not retry because frequent retries can risk spamming the server or
    // freezing the page from too many expensive computations.
    if (this.failedResources.has(resourceId)) {
      throw new Error("Resource already failed, not retrying");
    }

    try {
      // TODO handle errors at the DataFetcher level
      // TODO handle re-load periodically so long-lived tabs don't get stale.
      // Also need to reset the variable cache when datasets are reloaded.

      const resource = this.lruCache.get(resourceId);
      if (resource) {
        return resource;
      }
      const loadingResource = this.loadingResources[resourceId];
      if (loadingResource) {
        return await loadingResource;
      }

      getLogger().debugLog("Loading " + resourceId);
      const loadPromise = this.loadResourceInternal(key);
      this.loadingResources[resourceId] = loadPromise;
      const result = await loadPromise;

      this.lruCache.set(resourceId, result);
      delete this.loadingResources[resourceId];
      getLogger().debugLog(
        "Loaded " + resourceId + ". Cache size: " + this.lruCache.length
      );

      return result;
    } catch (e) {
      delete this.loadingResources[resourceId];
      this.failedResources.add(resourceId);
      await getLogger().logError(e as Error, "WARNING", {
        error_type: "resource_load_failure",
        resource_id: resourceId,
      });
      throw e;
    }
  }

  protected abstract loadResourceInternal(key: K): Promise<R>;

  protected abstract getResourceId(key: K): string;

  protected abstract getResourceSize(resource: R, id: string): number;
}

export class MetadataCache extends ResourceCache<string, MapOfDatasetMetadata> {
  static METADATA_KEY = "all_metadata";

  protected async loadResourceInternal(
    metadataId: string
  ): Promise<MapOfDatasetMetadata> {
    if (metadataId !== MetadataCache.METADATA_KEY) {
      throw new Error("Invalid metadata id");
    }
    return await getDataFetcher().getMetadata();
  }

  getResourceId(metadataId: string): string {
    return metadataId;
  }

  /**
   * Since there's only one metadata entry this doesn't really matter - we just
   * use a constant factor per entry.
   */
  getResourceSize(resource: MapOfDatasetMetadata, id: string): number {
    return 1;
  }
}

class DatasetCache extends ResourceCache<string, Dataset> {
  protected async loadResourceInternal(datasetId: string): Promise<Dataset> {
    const promise = getDataFetcher().loadDataset(datasetId);
    const metadataPromise = getDataManager().loadMetadata();
    const [data, metadata] = await Promise.all([promise, metadataPromise]);
    // TODO throw specific error message if metadata is missing for this dataset
    // id.
    // TODO validate metadata against data, and also process variables out
    // of it?
    return new Dataset(data, metadata[datasetId]);
  }

  getResourceId(datasetId: string): string {
    return datasetId;
  }

  /**
   * Max size is measured by number of rows plus a constant factor per entry.
   * This is based on the assumption that most rows are roughly the same size
   * across datasets and that key size plus metadata is roughly similar in size
   * to a small number of rows.
   */
  getResourceSize(resource: Dataset, key: string): number {
    return resource.rows.length + 5;
  }
}

class MetricQueryCache extends ResourceCache<MetricQuery, MetricQueryResponse> {
  private providerMap: VariableProviderMap;

  constructor(providerMap: VariableProviderMap, maxSize: number) {
    super(maxSize);
    this.providerMap = providerMap;
  }

  protected async loadResourceInternal(
    query: MetricQuery
  ): Promise<MetricQueryResponse> {
    const providers = this.providerMap.getUniqueProviders(query.metricIds);

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
    const promises: Promise<MetricQueryResponse>[] = providers.map((provider) =>
      provider.getData(query)
    );

    const queryResponses: MetricQueryResponse[] = await Promise.all(promises);

    const potentialErrorResponse = queryResponses.find((metricQueryResponse) =>
      metricQueryResponse.dataIsMissing()
    );
    if (potentialErrorResponse !== undefined) {
      return potentialErrorResponse;
    }

    const dataframes: IDataFrame[] = queryResponses.map(
      (response) => new DataFrame(response.data)
    );

    const joined = dataframes.reduce((prev, next) => {
      return joinOnCols(prev, next, query.breakdowns.getJoinColumns(), "outer");
    });

    const consumedDatasetIds = queryResponses.reduce(
      (accumulator: string[], response: MetricQueryResponse) =>
        accumulator.concat(response.consumedDatasetIds),
      []
    );
    const uniqueConsumedDatasetIds = Array.from(new Set(consumedDatasetIds));
    const resp = new MetricQueryResponse(
      joined.toArray(),
      uniqueConsumedDatasetIds
    );

    new DatasetOrganizer(resp.data, query.breakdowns).organize();
    return resp;
  }

  getResourceId(query: MetricQuery): string {
    return query.getUniqueKey();
  }

  /**
   * Max size is measured by number of rows plus a constant factor per entry.
   * This is based on the assumption that most rows are roughly the same size
   * across queries and that key size plus metadata is roughly similar in size
   * to a small number of rows.
   */
  getResourceSize(resource: MetricQueryResponse, key: string): number {
    return resource.data.length + 5;
  }
}

/**
 * Loads and caches metadata, datasets, and metric queries. This class is not
 * part of the React lifecycle, so it can manage its cache independently of UI
 * components updating. To use these in a React component, see
 * `useResources.tsx` and `WithLoadingOrErrorUI.tsx`
 */
export default class DataManager {
  private readonly datasetCache: DatasetCache;
  private readonly metricQueryCache: MetricQueryCache;
  private readonly metadataCache: MetadataCache;

  constructor() {
    this.datasetCache = new DatasetCache(MAX_CACHE_SIZE_DATASETS);
    this.metricQueryCache = new MetricQueryCache(
      new VariableProviderMap(),
      MAX_CACHE_SIZE_QUERIES
    );
    this.metadataCache = new MetadataCache(MAX_CACHE_SIZE_METADATA);
  }

  async loadDataset(datasetId: string): Promise<Dataset> {
    return await this.datasetCache.loadResource(datasetId);
  }

  async loadMetrics(query: MetricQuery): Promise<MetricQueryResponse> {
    return await this.metricQueryCache.loadResource(query);
  }

  async loadMetadata(): Promise<MapOfDatasetMetadata> {
    return await this.metadataCache.loadResource(MetadataCache.METADATA_KEY);
  }

  addQueryToCache(query: MetricQuery, response: MetricQueryResponse) {
    this.metricQueryCache.addResourceToCache(query, response);
  }

  resetCache() {
    this.datasetCache.resetCache();
    this.metricQueryCache.resetCache();
    this.metadataCache.resetCache();
  }
}
