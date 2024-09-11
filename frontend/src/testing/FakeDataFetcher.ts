import type {
  DatasetIdWithStateFIPSCode,
  DatasetId,
} from '../data/config/DatasetMetadata'
import type { DataFetcher } from '../data/loading/DataFetcher'
import type { MapOfDatasetMetadata, Row } from '../data/utils/DatasetTypes'

export default class FakeDataFetcher implements DataFetcher {
  private loadedDatasets: Record<string, Row[]> = {}
  private datasetResolverMap: Record<string, (dataset: Row[]) => void> = {}
  private datasetRejecterMap: Record<string, (err: Error) => void> = {}
  private loadedMetadata: MapOfDatasetMetadata | undefined
  private metadataResolver?: (metadataMap: MapOfDatasetMetadata) => void
  private metadataRejecter?: (err: Error) => void
  private numLoadDatasetCalls: number = 0
  private numGetMetadataCalls: number = 0

  async loadDataset(
    datasetId: DatasetId | DatasetIdWithStateFIPSCode,
  ): Promise<Row[]> {
    this.numLoadDatasetCalls++
    if (this.loadedDatasets[datasetId]) {
      return this.loadedDatasets[datasetId]
    }
    return await new Promise((resolve, reject) => {
      this.datasetResolverMap[datasetId] = resolve
      this.datasetRejecterMap[datasetId] = reject
    })
  }

  async getMetadata(): Promise<MapOfDatasetMetadata> {
    this.numGetMetadataCalls++
    if (this.loadedMetadata) {
      return this.loadedMetadata
    }
    return await new Promise((resolve, reject) => {
      this.metadataResolver = resolve
      this.metadataRejecter = reject
    })
  }

  setFakeDatasetLoaded(
    datasetId: DatasetId | DatasetIdWithStateFIPSCode,
    data: Row[],
  ) {
    const resolver = this.datasetResolverMap[datasetId]
    if (!resolver) {
      this.loadedDatasets[datasetId] = data
    } else {
      resolver(data)
    }
  }

  setFakeMetadataLoaded(metadataMap: MapOfDatasetMetadata) {
    if (!this.metadataResolver) {
      this.loadedMetadata = metadataMap
    } else {
      this.metadataResolver(metadataMap)
    }
  }

  setFakeDatasetFailedToLoad(datasetId: DatasetId, err: Error) {
    this.datasetRejecterMap[datasetId](err)
  }

  setFakeMetadataFailedToLoad(err: Error) {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    this.metadataRejecter!(err)
  }

  getNumLoadDatasetCalls() {
    return this.numLoadDatasetCalls
  }

  getNumGetMetadataCalls() {
    return this.numGetMetadataCalls
  }

  resetState() {
    this.datasetResolverMap = {}
    this.datasetRejecterMap = {}
    this.metadataResolver = undefined
    this.metadataRejecter = undefined
    this.numLoadDatasetCalls = 0
    this.numGetMetadataCalls = 0
  }
}
