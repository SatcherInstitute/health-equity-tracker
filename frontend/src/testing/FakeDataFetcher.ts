import { DataFetcher } from "../data/DataFetcher";
import { MetadataMap, Row } from "../data/DatasetTypes";

export default class FakeDataFetcher implements DataFetcher {
  private datasetResolverMap: Record<string, (dataset: Row[]) => void> = {};
  private datasetRejecterMap: Record<string, (err: Error) => void> = {};
  private metadataResolver?: (metadataMap: MetadataMap) => void;
  private metadataRejecter?: (err: Error) => void;
  private numLoadDatasetCalls: number = 0;
  private numGetMetadataCalls: number = 0;

  async loadDataset(datasetId: string): Promise<Row[]> {
    this.numLoadDatasetCalls++;
    return new Promise((res, rej) => {
      this.datasetResolverMap[datasetId] = res;
      this.datasetRejecterMap[datasetId] = rej;
    });
  }

  async getMetadata(): Promise<MetadataMap> {
    this.numGetMetadataCalls++;
    return new Promise((res, rej) => {
      this.metadataResolver = res;
      this.metadataRejecter = rej;
    });
  }

  setFakeDatasetLoaded(datasetId: string, data: Row[]) {
    const resolver = this.datasetResolverMap[datasetId];
    if (!resolver) {
      throw new Error("Cannot set dataset loaded before loadDataset is called");
    }
    resolver(data);
  }

  setFakeMetadataLoaded(metadataMap: MetadataMap) {
    if (!this.metadataResolver) {
      throw new Error(
        "Cannot set metadata loaded before getMetadata is called"
      );
    }
    this.metadataResolver(metadataMap);
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

  getNumGetMetdataCalls() {
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
