import { type DataFetcher } from '../data/loading/DataFetcher'
import { type MapOfDatasetMetadata, type Row } from '../data/utils/DatasetTypes'

export default class FakeDataFetcher implements DataFetcher {
  private loadedDatasets: Record<string, Row[]> = {}
  private datasetResolverMap: Record<string, (dataset: Row[]) => void> = {}
  private datasetRejecterMap: Record<string, (err: Error) => void> = {}
  private loadedMetadata: MapOfDatasetMetadata | undefined
  private metadataResolver?: (metadataMap: MapOfDatasetMetadata) => void
  private metadataRejecter?: (err: Error) => void
  private numLoadDatasetCalls: number = 0
  private numGetMetadataCalls: number = 0

  async loadDataset(datasetId: string): Promise<Row[]> {
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

  setFakeDatasetLoaded(datasetId: string, data: Row[]) {
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

  setFakeDatasetFailedToLoad(datasetId: string, err: Error) {
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
