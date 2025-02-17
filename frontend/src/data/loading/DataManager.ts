import { DataFrame, type IDataFrame } from 'data-forge'
import { LRUCache } from 'lru-cache'
import { getDataFetcher, getDataManager, getLogger } from '../../utils/globals'
import type {
  DatasetId,
  DatasetIdWithStateFIPSCode,
} from '../config/DatasetMetadata'
import { type MetricQuery, MetricQueryResponse } from '../query/MetricQuery'
import { DatasetOrganizer } from '../sorting/DatasetOrganizer'
import { Dataset, type MapOfDatasetMetadata } from '../utils/DatasetTypes'
import { joinOnCols } from '../utils/datasetutils'
import VariableProviderMap from './VariableProviderMap'

// TODO: test this out on the real website and tweak these numbers as needed.

// Max size for the dataset and query cache is measured by number of rows in the
// data plus a constant factor per entry.
// To optimize performance, the goals are:
// 1. All resources required to display a single report for a given selection of
//    mad-lib drop downs can fit into the cache.
// 2. The total site memory usage is reasonable. This is a bit of a judgement
//    call, but it should be comparable with other applications. This can be
//    viewed in the browser task manager.
const MAX_CACHE_SIZE_DATASETS = 100_000
const MAX_CACHE_SIZE_QUERIES = 10_000

// We only expect one metadata entry so we can set cache size to 1.
const MAX_CACHE_SIZE_METADATA = 1

abstract class ResourceCache<K, R extends {}> {
  private readonly lruCache: LRUCache<string, R>
  private loadingResources: Record<string, Promise<R>>
  private failedResources: Set<string>

  constructor(maxSize: number) {
    this.lruCache = this.createLruCache(maxSize)
    this.loadingResources = {}
    this.failedResources = new Set()
  }

  private createLruCache(maxSize: number): LRUCache<string, R> {
    const options = {
      max: maxSize,
      size: this.getResourceSize,
      // dispose: onDispose,
      // If it has been more than 24 hours, the next time the resource is
      // requested it will trigger a new load to make sure the data doesn't get
      // stale. Note that max age is evaluated lazily, so this will not generate
      // additional QPS unless the user actually interacts with the page.
      ttl: 1000 * 60 * 60 * 24,
    }
    return new LRUCache<string, R>(options)
  }

  resetCache() {
    // There's no way to cancel in-flight promises, so we don't clear the
    // loading resources.
    this.lruCache.clear()
    this.failedResources = new Set()
  }

  addResourceToCache(key: K, resource: R) {
    const resourceId = this.getResourceId(key)
    this.lruCache.set(resourceId, resource)
  }

  /**
   * Loads and returns the requested resource. If the resource is already in
   * cache and not expired, returns it without re-loading. Throws an error if
   * the resource cannot be returned.
   * @param key The uniquely identifying key for the resource. Uses
   *     `getResourceId` to determine uniqueness.
   */
  async loadResource(key: K): Promise<R> {
    const resourceId = this.getResourceId(key)

    // Errors are considered permanent, so we don't retry on errors. Reloading
    // is required to retry. In the future we could consider a more robust retry
    // mechanism that only allows retrying after a certain amount of time or
    // when the user changes Mad-libs. However, it's simpler and safer to just
    // not retry because frequent retries can risk spamming the server or
    // freezing the page from too many expensive computations.
    if (this.failedResources.has(resourceId)) {
      throw new Error('Resource already failed, not retrying')
    }

    try {
      // TODO: handle errors at the DataFetcher level
      // TODO: handle re-load periodically so long-lived tabs don't get stale.
      // Also need to reset the variable cache when datasets are reloaded.

      const resource = this.lruCache.get(resourceId)
      if (resource) {
        return resource
      }
      const loadingResource = this.loadingResources[resourceId]
      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      if (loadingResource) {
        return await loadingResource
      }

      getLogger().debugLog('Loading ' + resourceId)
      const loadPromise = this.loadResourceInternal(key)
      this.loadingResources[resourceId] = loadPromise
      const result = await loadPromise

      this.lruCache.set(resourceId, result)
      // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
      delete this.loadingResources[resourceId]
      getLogger().debugLog(
        'Loaded ' + resourceId + '. Cache size: ' + this.lruCache.size,
      )

      return result
    } catch (e) {
      // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
      delete this.loadingResources[resourceId]
      this.failedResources.add(resourceId)
      await getLogger().logError(e as Error, 'WARNING', {
        error_type: 'resource_load_failure',
        resource_id: resourceId,
      })
      throw e
    }
  }

  protected abstract loadResourceInternal(key: K): Promise<R>

  protected abstract getResourceId(key: K): string

  protected abstract getResourceSize(resource: R, id: string): number
}

export class MetadataCache extends ResourceCache<string, MapOfDatasetMetadata> {
  static METADATA_KEY = 'all_metadata'

  protected async loadResourceInternal(
    metadataId: string,
  ): Promise<MapOfDatasetMetadata> {
    if (metadataId !== MetadataCache.METADATA_KEY) {
      throw new Error('Invalid metadata id')
    }
    return await getDataFetcher().getMetadata()
  }

  getResourceId(metadataId: string): string {
    return metadataId
  }

  /**
   * Since there's only one metadata entry this doesn't really matter - we just
   * use a constant factor per entry.
   */
  getResourceSize(resource: MapOfDatasetMetadata, id: string): number {
    return 1
  }
}

class DatasetCache extends ResourceCache<string, Dataset> {
  protected async loadResourceInternal(
    datasetId: DatasetId | DatasetIdWithStateFIPSCode,
  ): Promise<Dataset> {
    const promise = getDataFetcher().loadDataset(datasetId)
    const metadataPromise = getDataManager().loadMetadata()
    const [data, metadata] = await Promise.all([promise, metadataPromise])
    // TODO: throw specific error message if metadata is missing for this dataset
    // id.
    // TODO: validate metadata against data, and also process variables out
    // of it?
    return new Dataset(data, metadata[datasetId])
  }

  getResourceId(
    datasetId: DatasetId | DatasetIdWithStateFIPSCode,
  ): DatasetId | DatasetIdWithStateFIPSCode {
    return datasetId
  }

  /**
   * Max size is measured by number of rows plus a constant factor per entry.
   * This is based on the assumption that most rows are roughly the same size
   * across datasets and that key size plus metadata is roughly similar in size
   * to a small number of rows.
   */
  getResourceSize(resource: Dataset, key: string): number {
    return resource.rows.length + 5
  }
}

class MetricQueryCache extends ResourceCache<MetricQuery, MetricQueryResponse> {
  private readonly providerMap: VariableProviderMap

  constructor(providerMap: VariableProviderMap, maxSize: number) {
    super(maxSize)
    this.providerMap = providerMap
  }

  protected async loadResourceInternal(
    query: MetricQuery,
  ): Promise<MetricQueryResponse> {
    const providers = this.providerMap.getUniqueProviders(query.metricIds)

    // Yield thread so the UI can respond. This prevents long calculations
    // from causing UI elements to look laggy.
    await new Promise((resolve) => {
      setTimeout(resolve, 0)
    })
    // TODO: potentially improve caching by caching the individual results
    // before joining so those can be reused, or caching the results under
    // all of the variables provided under different keys. For example, if
    // you request covid cases we could also cache it under covid deaths
    // since they're provided together. Also, it would be nice to cache ACS
    // when it's used from within another provider.
    const promises: Array<Promise<MetricQueryResponse>> = providers.map(
      async (provider) => await provider.getData(query),
    )

    const queryResponses: MetricQueryResponse[] = await Promise.all(promises)

    const potentialErrorResponse = queryResponses.find((metricQueryResponse) =>
      metricQueryResponse.dataIsMissing(),
    )
    if (potentialErrorResponse !== undefined) {
      return potentialErrorResponse
    }

    const dataframes: IDataFrame[] = queryResponses.map(
      (response) => new DataFrame(response.data),
    )

    const joined = dataframes.reduce((prev, next) => {
      return joinOnCols(prev, next, query.breakdowns.getJoinColumns(), 'outer')
    })

    const consumedDatasetIds = queryResponses.reduce(
      (
        accumulator: Array<DatasetId | DatasetIdWithStateFIPSCode>,
        response: MetricQueryResponse,
      ) => accumulator.concat(response.consumedDatasetIds),
      [],
    )
    const uniqueConsumedDatasetIds = Array.from(new Set(consumedDatasetIds))
    const resp = new MetricQueryResponse(
      joined.toArray(),
      uniqueConsumedDatasetIds,
    )

    new DatasetOrganizer(resp.data, query.breakdowns).organize()
    return resp
  }

  getResourceId(query: MetricQuery): string {
    return query.getUniqueKey()
  }

  /**
   * Max size is measured by number of rows plus a constant factor per entry.
   * This is based on the assumption that most rows are roughly the same size
   * across queries and that key size plus metadata is roughly similar in size
   * to a small number of rows.
   */
  getResourceSize(resource: MetricQueryResponse, key: string): number {
    return resource.data.length + 5
  }
}

/**
 * Loads and caches metadata, datasets, and metric queries. This class is not
 * part of the React lifecycle, so it can manage its cache independently of UI
 * components updating. To use these in a React component, see
 * `useResources.tsx` and `WithLoadingOrErrorUI.tsx`
 */
export default class DataManager {
  private readonly datasetCache: DatasetCache
  private readonly metricQueryCache: MetricQueryCache
  private readonly metadataCache: MetadataCache

  constructor() {
    this.datasetCache = new DatasetCache(MAX_CACHE_SIZE_DATASETS)
    this.metricQueryCache = new MetricQueryCache(
      new VariableProviderMap(),
      MAX_CACHE_SIZE_QUERIES,
    )
    this.metadataCache = new MetadataCache(MAX_CACHE_SIZE_METADATA)
  }

  async loadDataset(
    datasetId: DatasetId | DatasetIdWithStateFIPSCode,
  ): Promise<Dataset> {
    return await this.datasetCache.loadResource(datasetId)
  }

  async loadMetrics(query: MetricQuery): Promise<MetricQueryResponse> {
    return await this.metricQueryCache.loadResource(query)
  }

  async loadMetadata(): Promise<MapOfDatasetMetadata> {
    return await this.metadataCache.loadResource(MetadataCache.METADATA_KEY)
  }

  addQueryToCache(query: MetricQuery, response: MetricQueryResponse) {
    this.metricQueryCache.addResourceToCache(query, response)
  }

  resetCache() {
    this.datasetCache.resetCache()
    this.metricQueryCache.resetCache()
    this.metadataCache.resetCache()
  }
}
