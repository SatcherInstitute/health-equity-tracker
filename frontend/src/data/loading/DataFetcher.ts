// Note: this Will be replaced with real API calls. Leaving data fetches
// untyped for now, but we should define types for the API calls once we
// establish the API types.

import { MapOfDatasetMetadata, Row } from "../utils/DatasetTypes";
import { DatasetMetadataMap } from "../config/DatasetMetadata";
import { Environment } from "../../utils/Environment";

type FileFormat = "json" | "csv";

export interface DataFetcher {
  /**
   * Fetches and returns the dataset associated with the provided ID.
   * @param datasetId The id of the dataset to load.
   */
  loadDataset(datasetId: string): Promise<Row[]>;

  /** Fetches and returns the MetadataMap for all datasets. */
  getMetadata(): Promise<MapOfDatasetMetadata>;
}

export class ApiDataFetcher implements DataFetcher {
  environment: Environment;

  constructor(environment: Environment) {
    this.environment = environment;
  }

  /**
   * Returns whether the dataset should be fetched as a static file from the
   * tmp directory. If false, fetches normally from the data server. This is
   * mainly for local development, though it may be used for in-progress
   * datasets that have not been fully productionized on the data server.
   * @param fileName The full name of the dataset file, including file
   *     extension.
   */
  private shouldFetchAsStaticFile(fileName: string) {
    return (
      (this.environment.deployContext === "development" &&
        !this.environment.getBaseApiUrl()) ||
      this.environment.forceFetchDatasetAsStaticFile(fileName)
    );
  }

  private getApiUrl() {
    return this.environment.getBaseApiUrl() + "/api";
  }

  /**
   * @param datasetName The ID of the dataset to request
   * @param format FileFormat for the request.
   */
  private getDatasetRequestPath(
    datasetName: string,
    format: FileFormat = "json"
  ) {
    const fullDatasetName = datasetName + "." + format;
    const basePath = this.shouldFetchAsStaticFile(fullDatasetName)
      ? "/tmp/"
      : this.getApiUrl() + "/dataset?name=";
    return basePath + fullDatasetName;
  }

  /**
   * @param datasetName The ID of the dataset to request
   * @param format FileFormat for the request.
   */
  private async fetchDataset(datasetName: string, format: FileFormat = "json") {
    const requestPath = this.getDatasetRequestPath(datasetName, format);
    const resp = await fetch(requestPath);
    if (resp.status !== 200) {
      throw new Error("Failed to fetch dataset. Status: " + resp.status);
    }
    return await resp.json();
  }

  // TODO build in retries, timeout before showing error to user.
  async loadDataset(datasetId: string): Promise<Row[]> {
    let result = await this.fetchDataset(datasetId);

    // Note that treating geographies as a normal dataset is a bit weird
    // because it doesn't fit the normal dataset model, so the dataset "rows"
    // aren't really rows. But in practice there aren't issues with it.
    return result;
  }

  async getMetadata(): Promise<MapOfDatasetMetadata> {
    // TODO replace with real API call.
    return DatasetMetadataMap;
  }
}
