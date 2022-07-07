import { DataFetcher } from "../data/loading/DataFetcher";
import { MapOfDatasetMetadata, Row } from "../data/utils/DatasetTypes";

export default class FakeDataFetcher implements DataFetcher {
  private loadedDatasets: Record<string, Row[]> = {};
  private datasetResolverMap: Record<string, (dataset: Row[]) => void> = {};
  private datasetRejecterMap: Record<string, (err: Error) => void> = {};
  private loadedMetadata: MapOfDatasetMetadata | undefined;
  private metadataResolver?: (metadataMap: MapOfDatasetMetadata) => void;
  private metadataRejecter?: (err: Error) => void;
  private numLoadDatasetCalls: number = 0;
  private numGetMetadataCalls: number = 0;

  async loadDataset(datasetId: string): Promise<Row[]> {
    this.numLoadDatasetCalls++;
    if (this.loadedDatasets[datasetId]) {
      return this.loadedDatasets[datasetId];
    }
    return new Promise((res, rej) => {
      this.datasetResolverMap[datasetId] = res;
      this.datasetRejecterMap[datasetId] = rej;
    });
  }

  async getMetadata(): Promise<MapOfDatasetMetadata> {
    this.numGetMetadataCalls++;
    if (this.loadedMetadata) {
      return this.loadedMetadata;
    }
    return new Promise((res, rej) => {
      this.metadataResolver = res;
      this.metadataRejecter = rej;
    });
  }

  setFakeDatasetLoaded(datasetId: string, data: Row[]) {
    const resolver = this.datasetResolverMap[datasetId];
    if (!resolver) {
      this.loadedDatasets[datasetId] = data;
    } else {
      resolver(data);
    }
  }

  setFakeMetadataLoaded(metadataMap: MapOfDatasetMetadata) {
    if (!this.metadataResolver) {
      this.loadedMetadata = metadataMap;
    } else {
      this.metadataResolver(metadataMap);
    }
  }

  setFakeDatasetFailedToLoad(datasetId: string, err: Error) {
    this.datasetRejecterMap[datasetId](err);
  }

  setFakeMetadataFailedToLoad(err: Error) {
    this.metadataRejecter!(err);
  }

  getNumLoadDatasetCalls() {
    return this.numLoadDatasetCalls;
  }

  getNumGetMetadataCalls() {
    return this.numGetMetadataCalls;
  }

  resetState() {
    this.datasetResolverMap = {};
    this.datasetRejecterMap = {};
    this.metadataResolver = undefined;
    this.metadataRejecter = undefined;
    this.numLoadDatasetCalls = 0;
    this.numGetMetadataCalls = 0;
  }
}
