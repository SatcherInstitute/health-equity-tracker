// Note: this Will be replaced with real API calls. Leaving data fetches
// untyped for now, but we should define types for the API calls once we
// establish the API types.

import { MetadataMap, Row } from "./DatasetTypes";
import FakeMetadataMap from "./FakeMetadataMap";
import { Environment } from "../utils/Environment";
import { DataFrame } from "data-forge";

type FileFormat = "json" | "csv";

export interface DataFetcher {
  /**
   * Fetches and returns the dataset associated with the provided ID.
   * @param datasetId The id of the dataset to load.
   */
  loadDataset(datasetId: string): Promise<Row[]>;

  /** Fetches and returns the MetadataMap for all datasets. */
  getMetadata(): Promise<MetadataMap>;
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
    return await resp.json();
  }

  // TODO build in retries, timeout before showing error to user.
  async loadDataset(datasetId: string): Promise<Row[]> {
    // TODO handle server returning a dataset not found error.
    let result = await this.fetchDataset(datasetId);

    // TODO remove this once we figure out how to make BQ export integers as
    // integers
    if (datasetId.startsWith("acs_population")) {
      result = result.map((row: any) => {
        return { ...row, population: Number(row["population"]) };
      });
    }

    // TODO - the server should drop ingestion_ts before exporting the file. At
    // that point we can drop this code.
    return new DataFrame(result)
      .dropSeries(["ingestion_ts"])
      .resetIndex()
      .toArray();
  }

  async getMetadata(): Promise<MetadataMap> {
    // TODO replace with real API call.
    return FakeMetadataMap;
  }
}
